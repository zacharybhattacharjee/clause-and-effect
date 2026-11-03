"""Turns Zachary's workbook (library/clause-library.xlsx) into the library
files the page reads (library/*.json), and writes a report of problems
(library/converter-report.md).

It uses only what comes with Python, so nothing needs installing. Run it
from the project folder:

    python3 tools/convert-workbook.py

Every row keeps its status. A row is "live" (shown on the page without
?preview=1) only when its status is "Approved" and, for clause types and
versions, it has a tier. The converter never guesses: anything it can't
use is listed in the report instead.
"""

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKBOOK = ROOT / "library" / "clause-library.xlsx"
LIBRARY = ROOT / "library"
REPORT = LIBRARY / "converter-report.md"

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
APPROVED = "Approved"
KNOWN_STATUSES = {"Draft (Claude)", "Draft (Zachary)", APPROVED}
RATINGS = {"worst": "Worst", "middle": "Middle", "best": "Best"}


# ---------- Reading the workbook ----------

def column_index(ref):
    letters = re.match(r"[A-Z]+", ref).group(0)
    number = 0
    for letter in letters:
        number = number * 26 + (ord(letter) - 64)
    return number - 1


def read_sheets(path):
    """Returns {sheet name: list of rows}, each row a list of cell texts."""
    book = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in book.namelist():
        root = ET.fromstring(book.read("xl/sharedStrings.xml"))
        for item in root.findall("m:si", NS):
            shared.append("".join(t.text or "" for t in item.iter("{%s}t" % NS["m"])))
    workbook = ET.fromstring(book.read("xl/workbook.xml"))
    links = ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))
    targets = {link.get("Id"): link.get("Target") for link in links}
    sheets = {}
    for sheet in workbook.find("m:sheets", NS):
        target = targets[sheet.get("{%s}id" % NS["r"])].lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target
        root = ET.fromstring(book.read(target))
        rows = []
        for row in root.findall(".//m:sheetData/m:row", NS):
            cells = {}
            for cell in row.findall("m:c", NS):
                kind = cell.get("t")
                value = cell.find("m:v", NS)
                if kind == "inlineStr":
                    text = "".join(t.text or "" for t in cell.iter("{%s}t" % NS["m"]))
                elif value is None:
                    text = ""
                elif kind == "s":
                    text = shared[int(value.text)]
                else:
                    text = value.text or ""
                cells[column_index(cell.get("r"))] = text.strip()
            width = max(cells) + 1 if cells else 0
            rows.append([cells.get(i, "") for i in range(width)])
        sheets[sheet.get("name")] = rows
    return sheets


def records(rows, columns, optional=None):
    """Turns a sheet's rows into dicts, finding each column by the start of
    its header text, so moving or renaming the end of a header still works.
    Optional columns read as blank when a sheet doesn't have them."""
    header = rows[0]
    where = {}
    for key, start in {**columns, **(optional or {})}.items():
        found = [i for i, text in enumerate(header) if text.lower().startswith(start.lower())]
        if not found:
            if optional and key in optional:
                where[key] = len(header) + 1000  # past the end, so it reads as blank
                continue
            raise SystemExit(f'Column starting "{start}" not found in header: {header}')
        where[key] = found[0]
    result = []
    for number, row in enumerate(rows[1:], start=2):
        record = {key: (row[i] if i < len(row) else "") for key, i in where.items()}
        if any(record.values()):
            record["_row"] = number
            result.append(record)
    return result


def split_list(text):
    return [part.strip() for part in text.split(";") if part.strip()]


def tier_value(text):
    text = text.strip()
    return int(text) if text in {"1", "2", "3"} else None


def blanks_in(text):
    return set(re.findall(r"\{(\w+)\}", text))


# ---------- Converting ----------

def convert():
    sheets = read_sheets(WORKBOOK)
    problems = []  # (sheet, row, message)
    notes = []     # facts that aren't problems, such as blanks that can't be filled yet

    def problem(sheet, row, message):
        problems.append((sheet, row, message))

    # Clause types
    types = []
    for r in records(sheets["Clause types"], {
        "id": "Clause type ID", "name": "Plain name", "gbreb": "GBREB section",
        "triggers": "Trigger phrases", "tier": "Tier (", "law": "Massachusetts law",
        "status": "Status", "notes": "Notes",
    }, optional={"suggestedTier": "Suggested tier", "tierReason": "Reason for the suggested tier"}):
        if not r["id"]:
            problem("Clause types", r["_row"], "Row has no clause type ID, so it was skipped.")
            continue
        types.append({
            "id": r["id"], "name": r["name"], "gbrebSection": r["gbreb"],
            "triggers": split_list(r["triggers"]), "tier": tier_value(r["tier"]),
            "massachusettsLaw": r["law"], "status": r["status"],
            # Claude's suggestion, for Zachary to review. The page never uses it as a tier.
            "suggestedTier": tier_value(r["suggestedTier"]), "tierReason": r["tierReason"],
            "_row": r["_row"],
        })
    type_ids = {t["id"] for t in types}

    # Versions
    versions = []
    for r in records(sheets["Versions"], {
        "type": "Clause type ID", "id": "Version ID", "cues": "Cue phrases",
        "example": "Real example", "source": "Source of example",
        "plain": "Plain-language sentence", "numbers": "Numbers to fill",
        "rating": "Worst, middle, or best", "tier": "Tier override",
        "status": "Status", "notes": "Notes",
    }, optional={"suggestedTier": "Suggested tier", "tierReason": "Reason for the suggested tier"}):
        if not r["id"]:
            problem("Versions", r["_row"], "Row has no version ID, so it was skipped.")
            continue
        rating = RATINGS.get(r["rating"].strip().lower())
        if r["rating"] and not rating:
            problem("Versions", r["_row"], f'{r["id"]}: rating "{r["rating"]}" isn\'t Worst, Middle or Best.')
        # An example is only usable as proof when it has its own source.
        example = r["example"]
        source = r["source"] if example else ""
        versions.append({
            "id": r["id"], "type": r["type"], "cues": split_list(r["cues"]),
            "example": example, "exampleSource": source, "plain": r["plain"],
            "numbers": split_list(r["numbers"]), "rating": rating,
            "tier": tier_value(r["tier"]), "status": r["status"],
            # Claude's suggestion, for Zachary to review. The page never uses it as a tier.
            "suggestedTier": tier_value(r["suggestedTier"]), "tierReason": r["tierReason"],
            "_row": r["_row"],
        })
    version_ids = {v["id"] for v in versions}

    # Warning phrases
    warnings = []
    for r in records(sheets["Warning phrases"], {
        "phrase": "Phrase", "kind": "Risky or friendly", "meaning": "What it means",
        "notes": "Related wordings", "plainAsk": "Plain-language ask",
        "legalWording": "Legal wording to propose", "status": "Status",
    }):
        kind = r["kind"].strip().lower()
        if kind not in {"risky", "friendly"}:
            problem("Warning phrases", r["_row"], f'"{r["phrase"]}": "{r["kind"]}" isn\'t Risky or Friendly.')
        warnings.append({
            "phrase": r["phrase"], "kind": kind, "meaning": r["meaning"],
            "matchingNotes": r["notes"], "plainAsk": r["plainAsk"],
            "legalWording": r["legalWording"], "status": r["status"], "_row": r["_row"],
        })

    # Asks
    asks = []
    for r in records(sheets["Asks"], {
        "version": "Risky version ID", "askFor": "Ask for", "fallback": "Fallback",
        "plainAsk": "Plain-language ask", "legalWording": "Legal wording to propose",
        "ownerBlanks": "Blanks for the owner", "status": "Status",
    }, optional={"why": "Why you can ask", "nextStep": "Next step", "softerAsk": "Softer way to say it",
                 "shortAsk": "Short ask", "shortWhy": "Short why"}):
        asks.append({
            "version": r["version"], "askFor": r["askFor"], "fallback": r["fallback"],
            "shortAsk": r["shortAsk"], "shortWhy": r["shortWhy"],
            "plainAsk": r["plainAsk"], "softerAsk": r["softerAsk"], "why": r["why"],
            "legalWording": r["legalWording"], "ownerBlanks": r["ownerBlanks"],
            "nextStep": r["nextStep"], "status": r["status"], "_row": r["_row"],
        })

    # Glossary
    glossary = []
    for r in records(sheets["Glossary"], {"words": "Term or phrase", "meaning": "Plain meaning", "status": "Status"}):
        glossary.append({"words": r["words"], "meaning": r["meaning"], "status": r["status"], "_row": r["_row"]})

    # Missing clauses
    missing = []
    for r in records(sheets["Missing clauses"], {
        "type": "Clause type ID", "missing": "What's missing", "message": "What to tell the owner", "status": "Status",
    }):
        missing.append({"type": r["type"], "whatIsMissing": r["missing"], "message": r["message"],
                        "status": r["status"], "_row": r["_row"]})

    # Answer key: checked here, read by the test tool later.
    answer_rows = records(sheets["Answer key"], {
        "lease": "Lease ID", "section": "Section number", "type": "Clause type ID", "version": "Version ID",
    })

    # ---------- Checks ----------

    def check_status(sheet, row, label, status):
        if status not in KNOWN_STATUSES:
            problem(sheet, row, f'{label}: status "{status}" isn\'t one of {", ".join(sorted(KNOWN_STATUSES))}.')

    def check_unique(sheet, items, key):
        seen = {}
        for item in items:
            value = item[key]
            if value in seen:
                problem(sheet, item["_row"], f'ID "{value}" is also used on row {seen[value]}.')
            seen.setdefault(value, item["_row"])

    check_unique("Clause types", types, "id")
    check_unique("Versions", versions, "id")

    tier_of_type = {t["id"]: t["tier"] for t in types}
    for t in types:
        check_status("Clause types", t["_row"], t["id"], t["status"])
        if not t["triggers"]:
            problem("Clause types", t["_row"], f'{t["id"]} has no trigger phrases, so nothing can be sorted into it.')
        t["live"] = t["status"] == APPROVED and t["tier"] is not None
        if t["status"] == APPROVED and t["tier"] is None:
            problem("Clause types", t["_row"], f'{t["id"]} is Approved but has no tier, so it stays a draft.')

    for v in versions:
        check_status("Versions", v["_row"], v["id"], v["status"])
        if v["type"] not in type_ids:
            problem("Versions", v["_row"], f'{v["id"]} names clause type "{v["type"]}", which isn\'t on the Clause types sheet.')
        if not v["cues"]:
            problem("Versions", v["_row"], f'{v["id"]} has no cue phrases, so it can never be matched.')
        in_sentence = blanks_in(v["plain"])
        listed = set(v["numbers"])
        for name in sorted(in_sentence - listed):
            problem("Versions", v["_row"], f'{v["id"]}: the sentence has {{{name}}}, but "Numbers to fill" doesn\'t list it.')
        for name in sorted(listed - in_sentence):
            problem("Versions", v["_row"], f'{v["id"]}: "Numbers to fill" lists {name}, but the sentence has no {{{name}}}.')
        in_cues = set().union(*(blanks_in(c) for c in v["cues"])) if v["cues"] else set()
        for name in sorted(in_sentence - in_cues):
            notes.append(f'{v["id"]}: {{{name}}} can\'t be filled yet, because no cue phrase has {{{name}}} in it. '
                         "The sentence shows without the number until one does.")
        effective = v["tier"] if v["tier"] is not None else tier_of_type.get(v["type"])
        v["effectiveTier"] = effective
        v["live"] = v["status"] == APPROVED and effective is not None
        if v["status"] == APPROVED and effective is None:
            problem("Versions", v["_row"], f'{v["id"]} is Approved but neither it nor its clause type has a tier, so it stays a draft.')

    for a in asks:
        check_status("Asks", a["_row"], a["version"], a["status"])
        for key, label in (("version", "Risky version ID"), ("askFor", "Ask for"), ("fallback", "Fallback")):
            if a[key] and a[key] not in version_ids:
                problem("Asks", a["_row"], f'{label} "{a[key]}" isn\'t on the Versions sheet.')
        a["live"] = a["status"] == APPROVED

    for w in warnings:
        check_status("Warning phrases", w["_row"], w["phrase"], w["status"])
        w["live"] = w["status"] == APPROVED
    for g in glossary:
        check_status("Glossary", g["_row"], g["words"], g["status"])
        g["live"] = g["status"] == APPROVED
    for m in missing:
        check_status("Missing clauses", m["_row"], m["type"], m["status"])
        if m["type"] not in type_ids:
            problem("Missing clauses", m["_row"], f'Clause type "{m["type"]}" isn\'t on the Clause types sheet.')
        m["live"] = m["status"] == APPROVED

    for a in answer_rows:
        if a["type"] and a["type"] not in type_ids:
            problem("Answer key", a["_row"], f'Clause type "{a["type"]}" isn\'t on the Clause types sheet.')
        if a["version"] and a["version"] not in version_ids:
            problem("Answer key", a["_row"], f'Version "{a["version"]}" isn\'t on the Versions sheet.')

    # ---------- Writing ----------

    def strip_rows(items):
        return [{k: v for k, v in item.items() if not k.startswith("_")} for item in items]

    header = "Made by tools/convert-workbook.py from library/clause-library.xlsx. Don't edit by hand: change the workbook and run the converter again."
    outputs = {
        "clause-types.json": {"note": header, "types": strip_rows(types)},
        "versions.json": {"note": header, "versions": strip_rows(versions)},
        "warnings.json": {"note": header, "warnings": strip_rows(warnings)},
        "asks.json": {"note": header, "asks": strip_rows(asks)},
        "glossary.json": {"note": header, "glossary": strip_rows(glossary)},
        "missing.json": {"note": header, "missing": strip_rows(missing)},
    }
    for name, data in outputs.items():
        (LIBRARY / name).write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    live = {
        "Clause types": (sum(t["live"] for t in types), len(types)),
        "Versions": (sum(v["live"] for v in versions), len(versions)),
        "Warning phrases": (sum(w["live"] for w in warnings), len(warnings)),
        "Asks": (sum(a["live"] for a in asks), len(asks)),
        "Glossary": (sum(g["live"] for g in glossary), len(glossary)),
        "Missing clauses": (sum(m["live"] for m in missing), len(missing)),
    }
    lines = [
        "# Converter report",
        "",
        "Made by `tools/convert-workbook.py` each time it runs. It lists what the converter found in the workbook. It changes nothing in the workbook.",
        "",
        "## Rows on the live page",
        "",
        "A row is live when its status is Approved and, for clause types and versions, it has a tier. Everything else shows only with `?preview=1`.",
        "",
        "| Sheet | Live | All rows |",
        "| --- | --- | --- |",
    ]
    lines += [f"| {sheet} | {count} | {total} |" for sheet, (count, total) in live.items()]
    lines += ["", f"## Problems to fix in the workbook ({len(problems)})", ""]
    lines += [f"- **{sheet}, row {row}:** {message}" for sheet, row, message in problems] or ["None."]
    lines += ["", f"## Blanks that can't be filled yet ({len(notes)})", "",
              "Not mistakes. These sentences show without their number until a cue phrase has the same blank.", ""]
    lines += [f"- {note}" for note in notes] or ["None."]
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Wrote {len(outputs)} library files and {REPORT.relative_to(ROOT)}.")
    print(f"{len(problems)} problems, {len(notes)} blanks that can't be filled yet.")
    for sheet, (count, total) in live.items():
        print(f"  {sheet}: {count} of {total} live")


if __name__ == "__main__":
    if not WORKBOOK.exists():
        sys.exit(f"Workbook not found: {WORKBOOK}")
    convert()
