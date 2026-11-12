// Clause & Effect's lease-reading engine.
// It reads a lease, splits it into sections, sorts each section into a clause
// type from the library, and finds which versions of that clause it matches.
// It never writes a sentence: every sentence comes from the library files in
// library/, made by tools/convert-workbook.py from the workbook.
// Everything happens in the browser. The lease is never sent anywhere.

const LeaseEngine = (() => {
  // ---------- Settings ----------

  // Single-word trigger phrases count only in a section's heading, except
  // these words, which are specific enough to count anywhere (Zachary, 10/26).
  const WORDS_THAT_COUNT_ANYWHERE = new Set([
    "indemnify", "indemnification", "subordinate", "subordination", "holdover",
    "relocate", "relocation", "recapture", "estoppel", "guaranty", "guarantor",
    "condemnation",
  ]);

  // How sorting decides. A trigger phrase found in the heading counts 2 points,
  // and one found in the body counts 1. A section is sorted into the best type
  // when it has at least MIN_SCORE points. It's "unsure" when the second-best
  // type also has MIN_SCORE points and at least UNSURE_SHARE of the best score.
  // These are the first-run settings, recorded before any tuning (11/3).
  const HEADING_POINTS = 2;
  const BODY_POINTS = 1;
  const MIN_SCORE = 2;
  const UNSURE_SHARE = 0.75;

  // At most this many words may sit where a cue phrase has "...".
  const GAP_WORDS = 8;

  // ---------- Loading the library ----------

  async function loadLibrary(base = "library/") {
    const names = ["clause-types", "versions", "asks", "warnings", "glossary", "missing"];
    const files = await Promise.all(
      names.map(async (name) => {
        const response = await fetch(`${base}${name}.json`);
        if (!response.ok) throw new Error(`Could not load ${base}${name}.json (status ${response.status})`);
        return response.json();
      }),
    );
    const [types, versions, asks, warnings, glossary, missing] = files;
    return {
      types: types.types,
      versions: versions.versions,
      asks: asks.asks,
      warnings: warnings.warnings,
      glossary: glossary.glossary,
      missing: missing.missing,
    };
  }

  // Keeps only what the page may show: live rows, or every row in preview.
  function usableRows(library, preview) {
    const keep = (rows) => (preview ? rows : rows.filter((row) => row.live));
    return {
      types: keep(library.types),
      versions: keep(library.versions),
      asks: keep(library.asks),
    };
  }

  // ---------- Text for matching ----------

  // Joins words split by a hyphen at the end of a line, turns line breaks and
  // runs of spaces into single spaces, straightens curly quotes, and lowers
  // the case. Leases call the parties either Landlord and Tenant or Lessor
  // and Lessee, so Lessor and Lessee are read as Landlord and Tenant. The
  // result is only used for matching, never shown.
  function forMatching(text) {
    return text
      .replace(/(\w)-[ \t]*\n\s*(\w)/g, "$1$2")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .replace(/\blessor\b/g, "landlord")
      .replace(/\blessee\b/g, "tenant");
  }

  // The same tidying, keeping the case, for the lease text the page shows.
  function tidy(text) {
    return text
      .replace(/(\w)-[ \t]*\n\s*(\w)/g, "$1$2")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeForPattern(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // A pattern for a phrase as whole words, with any spacing between them.
  // The first group checks the character before the phrase.
  function phrasePattern(phrase) {
    return forMatching(phrase).split(" ").map(escapeForPattern).join("\\s+");
  }

  function wholePhrase(phrase) {
    return new RegExp(`(^|[^\\w-])(${phrasePattern(phrase)})(?![\\w-])`);
  }

  // A number as leases write it: "10", "$3,000.00", "5%", or words with the
  // number in brackets, such as "ten (10)" or "Three Thousand Dollars ($3,000.00)".
  const NUMBER = "(?:(?:[a-z-]+\\s+){0,4}\\(\\s*\\$?[\\d,.]+\\s*%?\\s*\\)|\\$?\\d[\\d,.]*%?)";

  // A pattern for a cue phrase. A blank in braces, such as {days}, stands for
  // a number, and catches it. "..." stands for up to GAP_WORDS words.
  function cuePattern(cue) {
    const parts = forMatching(cue)
      .split(/\s*(?:\.\.\.|…)\s*/)
      .filter(Boolean)
      .map((part) =>
        part
          .split(/(\{\w+\})/)
          .map((piece) => (/^\{\w+\}$/.test(piece) ? `(${NUMBER})` : piece.split(" ").map(escapeForPattern).join("\\s+")))
          .join(""),
      );
    const gap = `(?:\\s+\\S+){0,${GAP_WORDS}}?\\s+`;
    return new RegExp(`(^|[^\\w-])(${parts.join(gap)})(?![\\w-])`);
  }

  // The lease's own numbers, caught by a cue's blanks: {days: "10"} from
  // "ten (10) days". A number written in words and figures keeps the figures.
  function cueNumbers(cue, match) {
    const names = [...cue.matchAll(/\{(\w+)\}/g)].map((found) => found[1]);
    const numbers = {};
    names.forEach((name, index) => {
      const written = (match[index + 3] || "").trim();
      const figures = /\(\s*([^)]+?)\s*\)/.exec(written);
      if (written) numbers[name] = figures ? figures[1] : written;
    });
    return numbers;
  }

  // ---------- Reading a PDF ----------

  // Turns a PDF (opened with pdf.js) into lines, each with its page, its
  // left edge, its height on the page, and its text. Where each line sits
  // is kept so the whole-lease view can highlight sections later.
  async function linesFromPdf(pdfDocument) {
    const lines = [];
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageHeight = page.view[3] - page.view[1];
      let current = null;
      for (const item of content.items) {
        if (!current) current = { page: pageNumber, pageHeight, x: null, y: null, size: 0, text: "" };
        if (item.str.trim() && current.x === null) {
          current.x = item.transform[4];
          current.y = item.transform[5];
          current.size = Math.hypot(item.transform[2], item.transform[3]);
        }
        current.text += item.str;
        if (item.hasEOL) {
          if (current.text.trim()) lines.push(current);
          current = null;
        }
      }
      if (current && current.text.trim()) lines.push(current);
    }
    return withoutRepeatedLines(lines);
  }

  // Turns plain text, one paragraph per line, into lines with no positions.
  // Used for the research dataset, whose leases are web pages, not PDFs.
  function linesFromText(text) {
    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => ({ page: 1, x: null, y: -index, size: 0, text: line }));
  }

  // Drops page headers and footers, and lines that are only a page number.
  // A header or footer sits in the top or bottom band of the page, and starts
  // or ends the same way as a line in the same band on another page. Footers
  // often differ a little from page to page, so whole lines aren't compared.
  // A repeated heading word in the middle of a page, such as "PREMISES", stays.
  const EDGE_BAND = 0.13;   // share of the page height at the top and bottom
  const SAME_CHARACTERS = 30;

  function withoutRepeatedLines(lines) {
    const inEdgeBand = (line) =>
      line.pageHeight && (line.y < line.pageHeight * EDGE_BAND || line.y > line.pageHeight * (1 - EDGE_BAND));
    const edgeLines = lines.filter(inEdgeBand).map((line) => {
      const text = forMatching(line.text);
      return { line, start: text.slice(0, SAME_CHARACTERS), end: text.slice(-SAME_CHARACTERS) };
    });
    const repeated = new Set();
    for (const a of edgeLines) {
      for (const b of edgeLines) {
        if (a.line.page === b.line.page || a.start.length < 12) continue;
        if (a.start === b.start || a.end === b.end) repeated.add(a.line);
      }
    }
    return lines.filter((line) => {
      if (/^(page\s+)?\d+(\s+of\s+\d+)?$/.test(forMatching(line.text))) return false;
      return !repeated.has(line);
    });
  }

  // ---------- Splitting into sections ----------

  const MARGIN_NUMBER = /^(\d{1,3})\.\s*(.*)$/;        // "13. ASSIGNMENT –"
  const MARGIN_LETTER = /^([A-Z])\.\s+(.*)$/;          // "B. OPERATING"
  const INLINE_START =                                   // "13. ASSIGNMENT. Tenant shall…", "Section 4.2 Rent.", "1.Premises."
    /^(?:(?:section|article|§)\s*)?(\d{1,3}(?:\.\d{1,2}){0,2}|[ivxlc]{1,6})(?:[.)]\s*|\s+)([A-Z][^.:]{1,90}?)(?:[.:](?:\s+|$)|$)(.*)$/i;
  const ARTICLE_ALONE = /^(?:ARTICLE|Article)\s+([IVXLC]{1,6}|\d{1,3})\.?\s*$/; // "ARTICLE 5", heading on the next line
  const ATTACHMENT_START = /^(RIDER|EXHIBIT|ADDENDUM|AMENDMENT|SCHEDULE)\b\s*([A-Z0-9-]*)[.:]?\s*(.*)$/;
  const TABLE_OF_CONTENTS_LINE = /(\.{4,}|\s{3,})\s*\d{1,3}\s*$/;

  // Whole lines of a printed form's footer: its copyright notice and the
  // name of the software that filled it in. Only whole lines match, so
  // lease text that mentions copyright is kept.
  const FORM_FOOTER = [
    /^COPYRIGHT\s*©/i,
    /^GREATER BOSTON REAL ESTATE BOARD$/,
    /^REVISED \d{4}(, \d{4})*$/,
    /^All rights reserved\. This form may not be copied or$/,
    /^reproduced in whole or in part in any manner$/,
    /^whatsoever without the prior express written consent$/,
    /^of the Greater Boston Real Estate Board\.$/,
    /^This form was created by .+ using e-FORMS\./,
    /^(may )?not be used by any other party\.$/,
  ];
  // "64 Sidney Street" is an address, not section 64.
  const ADDRESS_HEADING = /\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|way|place|pl|court|ct|square|sq|plaza|suite|floor|highway|parkway|pkwy)\.?$/i;

  // A heading is mostly capitalized words, so "Rent. Tenant shall pay" is a
  // heading and "10 days after notice" is not. A short heading that is the
  // whole line may be in sentence case, such as "Repairs and alterations".
  function looksLikeHeading(text, wholeLine = false) {
    const words = text.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
    if (!words.length || words.length > 12) return false;
    if (wholeLine && words.length <= 6 && /^[A-Z]/.test(words[0])) return true;
    const minor = /^(of|and|or|the|a|an|to|in|on|for|by|with|at|as)$/i;
    const significant = words.filter((word) => !minor.test(word));
    if (!significant.length) return false;
    const capitalized = significant.filter((word) => /^[^a-z]*[A-Z]/.test(word));
    return capitalized.length / significant.length >= 0.75;
  }

  // Finds where the body text starts on the page: the most common left edge
  // among long lines. Lines well to the left of it are margin headings.
  function bodyLeftEdge(lines) {
    const counts = new Map();
    for (const line of lines) {
      if (line.x === null || line.text.trim().length < 40) continue;
      const edge = Math.round(line.x / 5) * 5;
      counts.set(edge, (counts.get(edge) || 0) + 1);
    }
    let best = null;
    for (const [edge, count] of counts) if (!best || count > best.count) best = { edge, count };
    return best ? best.edge : null;
  }

  // Top to bottom on each page; left to right within a line. Lines within
  // 3 points of the same height count as one line, so a margin heading comes
  // just before the body text that starts beside it.
  function readingOrder(lines) {
    return [...lines].sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      if (Math.abs(a.y - b.y) > 3) return b.y - a.y;
      return (a.x ?? 0) - (b.x ?? 0);
    });
  }

  function newSection(number, heading, line) {
    return { number, heading: heading.trim(), lines: [], page: line ? line.page : 1 };
  }

  function splitSections(lines) {
    const edge = bodyLeftEdge(lines);
    const marginLimit = edge === null ? null : edge - 30;
    const ordered = edge === null ? lines : readingOrder(lines);
    const isMargin = (line) => marginLimit !== null && line.x !== null && line.x < marginLimit;
    const usesMargin = ordered.some((line) => isMargin(line) && MARGIN_NUMBER.test(line.text.trim()));

    const sections = [newSection(null, "", ordered[0])];
    let current = sections[0];
    let lastNumber = null;
    let headingLine = null; // the last margin line added to a heading
    let inParentheses = false;
    let awaitingHeading = false; // just after "ARTICLE 5" on its own line

    const start = (number, heading, line) => {
      current = newSection(number, heading, line);
      sections.push(current);
      inParentheses = false;
    };

    for (const line of ordered) {
      const text = line.text.trim();

      // The form's own footer, such as its copyright notice, isn't lease text.
      if (FORM_FOOTER.some((pattern) => pattern.test(text))) continue;

      // Attachments start their own section, whatever the layout.
      const attachment = ATTACHMENT_START.exec(text);
      if (attachment && text === text.toUpperCase() && text.length < 80) {
        const number = `${attachment[1][0]}${attachment[1].slice(1).toLowerCase()} ${attachment[2]}`.trim();
        // The same exhibit name again is a page header inside that exhibit.
        if (number !== current.number) start(number, attachment[3], line);
        headingLine = null;
        continue;
      }

      if (usesMargin && isMargin(line) && text.length <= 45) {
        const numbered = MARGIN_NUMBER.exec(text);
        const lettered = MARGIN_LETTER.exec(text);
        if (numbered) {
          lastNumber = numbered[1];
          start(lastNumber, "", line);
          appendHeading(numbered[2]);
          headingLine = line;
          continue;
        }
        if (lettered && lastNumber) {
          // On the GBREB form, part A's text starts beside its parent's
          // heading, so the parent's text so far belongs to part A when it
          // stops mid-sentence.
          const parent = current;
          const carried = parent.number === lastNumber && !/[.:;]\s*$/.test(parent.lines.map((l) => l.text).join(" ").trim())
            ? parent.lines.splice(0)
            : [];
          start(`${lastNumber}${lettered[1]}`, "", line);
          current.lines.push(...carried);
          appendHeading(lettered[2]);
          headingLine = line;
          continue;
        }
        // A margin line just below a heading line continues the heading.
        const continues = headingLine && line.page === headingLine.page &&
          headingLine.y - line.y <= Math.max(headingLine.size, line.size) * 1.6;
        if (continues) {
          appendHeading(text);
          headingLine = line;
          continue;
        }
        // Other margin notes, such as copyright lines, are dropped.
        continue;
      }

      if (!usesMargin && !TABLE_OF_CONTENTS_LINE.test(text)) {
        // A line just after "ARTICLE 5" that looks like a heading is its heading.
        if (awaitingHeading) {
          awaitingHeading = false;
          if (text.length <= 80 && looksLikeHeading(text.replace(/[.:]$/, ""), true)) {
            current.heading = text;
            continue;
          }
        }
        const article = ARTICLE_ALONE.exec(text);
        if (article) {
          start(article[1], "", line);
          awaitingHeading = true;
          continue;
        }
        const inline = INLINE_START.exec(text);
        if (inline && looksLikeHeading(inline[2], !inline[3].trim()) && !ADDRESS_HEADING.test(inline[2].trim())) {
          start(inline[1].replace(/\.$/, ""), inline[2], line);
          if (inline[3].trim()) current.lines.push({ ...line, text: inline[3] });
          continue;
        }
      }

      current.lines.push(line);
    }

    // Notes in brackets under margin headings, such as "(fill in)", aren't
    // part of the heading.
    function appendHeading(text) {
      let kept = "";
      for (const character of text) {
        if (character === "(") inParentheses = true;
        if (!inParentheses) kept += character;
        if (character === ")") inParentheses = false;
      }
      current.heading = tidy(`${current.heading} ${kept}`);
    }

    return sections
      .map((section) => ({
        number: section.number,
        heading: section.heading.replace(/[\s:.–-]+$/, ""),
        page: section.page,
        lines: section.lines,
        text: tidy(section.lines.map((line) => line.text).join("\n")),
      }))
      // A heading with no text of its own, such as GBREB 6 "RENT ADJUSTMENT"
      // above 6A, 6B and 6C, isn't a separate piece of the lease.
      .filter((section, index, all) => {
        if (section.text) return true;
        const next = all[index + 1];
        const isItsPart = next && section.number && next.number && new RegExp(`^${section.number}[A-Z]$`).test(next.number);
        return !isItsPart;
      })
      .filter((section) => section.text || section.number);
  }

  // ---------- Sorting ----------

  // Every place a trigger phrase appears, for every type. A phrase that sits
  // inside a longer matched phrase doesn't count again, so "maintenance" in
  // "common area maintenance" counts only for the longer phrase's type.
  function triggerHits(types, headingText, bodyText) {
    const hits = [];
    for (const type of types) {
      for (const trigger of type.triggers) {
        const normalized = forMatching(trigger);
        const anywhere = normalized.includes(" ") || WORDS_THAT_COUNT_ANYWHERE.has(normalized);
        const places = [["heading", headingText]];
        if (anywhere) places.push(["body", bodyText]);
        for (const [where, text] of places) {
          const pattern = new RegExp(wholePhrase(trigger).source, "g");
          for (const match of text.matchAll(pattern)) {
            const start = match.index + match[1].length;
            hits.push({ type, trigger, where, start, end: start + match[2].length });
          }
        }
      }
    }
    return hits.filter((hit) => !hits.some((other) =>
      other !== hit && other.where === hit.where && other.start <= hit.start && other.end >= hit.end &&
      other.end - other.start > hit.end - hit.start));
  }

  // A type's score: each trigger phrase counts once, in the heading if it's
  // there, otherwise in the body.
  function scoreType(type, hits) {
    const own = hits.filter((hit) => hit.type === type);
    let score = 0;
    const matched = [];
    for (const trigger of new Set(own.map((hit) => hit.trigger))) {
      const inHeading = own.some((hit) => hit.trigger === trigger && hit.where === "heading");
      score += inHeading ? HEADING_POINTS : BODY_POINTS;
      matched.push({ trigger, where: inHeading ? "heading" : "body" });
    }
    const fromHeading = matched.some((m) => m.where === "heading");
    return { type, score, matched, fromHeading };
  }

  function findVersions(type, bodyText, rows) {
    const found = [];
    for (const version of rows.versions.filter((v) => v.type === type.id)) {
      for (const cue of version.cues) {
        const match = cuePattern(cue).exec(bodyText);
        if (match) {
          found.push({ version, cue, matchedText: match[2], numbers: cueNumbers(cue, match) });
          break;
        }
      }
    }
    // Never ask for what the lease already gives: a flag whose ask points to
    // a version this same section already has is not a flag here.
    const has = new Set(found.map((item) => item.version.id));
    return found.map((item) => withAskChain(item, rows)).map((item) =>
      item.flag && item.askFor && has.has(item.askFor.id) ? { ...item, flag: false } : item);
  }

  // The flag-to-ask chain: a version with a row on the Asks sheet is a flag.
  // Its ask may point to a better version ("ask for") and a fallback.
  function withAskChain(item, rows) {
    const byId = (id) => rows.versions.find((version) => version.id === id) || null;
    const ask = rows.asks.find((row) => row.version === item.version.id) || null;
    return {
      ...item,
      tier: item.version.effectiveTier ?? null,
      flag: Boolean(ask),
      goodForYou: item.version.rating === "Best",
      ask,
      askFor: ask && ask.askFor ? byId(ask.askFor) : null,
      fallback: ask && ask.fallback ? byId(ask.fallback) : null,
    };
  }

  // Tier 1 is the most serious. A missing tier sorts after tier 3.
  const tierRank = (tier) => (tier === null || tier === undefined ? 4 : tier);

  function sortSection(section, rows) {
    const headingText = forMatching(section.heading || "");
    const bodyText = forMatching(section.text || "");
    const hits = triggerHits(rows.types, headingText, bodyText);
    const scores = rows.types
      .map((type) => scoreType(type, hits))
      .filter((result) => result.score > 0)
      // On equal points, a type the heading names comes first.
      .sort((a, b) => b.score - a.score || Number(b.fromHeading) - Number(a.fromHeading));
    const [best, second] = scores;

    let status = "not-sorted";
    let candidates = [];
    if (best && best.score >= MIN_SCORE) {
      let close = second && second.score >= MIN_SCORE && second.score >= best.score * UNSURE_SHARE;
      // The heading says what a section is about: when only the leading type
      // was found in the heading, it wins a close call.
      if (close && best.fromHeading && !second.fromHeading) close = false;
      status = close ? "unsure" : "sorted";
      candidates = close ? [best, second] : [best];
    }

    const matches = candidates.map(({ type, score, matched }) => {
      const versions = findVersions(type, bodyText, rows).sort(
        (a, b) => tierRank(a.tier ?? type.tier) - tierRank(b.tier ?? type.tier),
      );
      return { type, score, matched, versions };
    });

    // A section goes in its most serious tier, from its versions or types.
    const tiers = matches.flatMap((match) => [...match.versions.map((v) => v.tier), match.type.tier]);
    const known = tiers.filter((tier) => tier !== null && tier !== undefined);
    const tier = known.length ? Math.min(...known) : null;

    return { ...section, status, tier, matches, otherScores: scores.slice(candidates.length, candidates.length + 3) };
  }

  // Reads the whole lease: split it, then sort every section.
  function readLease(lines, library, { preview = false } = {}) {
    const rows = usableRows(library, preview);
    const sections = splitSections(lines).map((section) => sortSection(section, rows));
    return { sections, preview };
  }

  // Sections in the order the page lists them: tier 1, 2, 3, then "tier not
  // set", each in lease order; not-sorted sections in their own group at the end.
  function inTierOrder(sections) {
    const sorted = sections.filter((section) => section.status !== "not-sorted");
    const notSorted = sections.filter((section) => section.status === "not-sorted");
    const position = new Map(sections.map((section, index) => [section, index]));
    sorted.sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || position.get(a) - position.get(b));
    return { sorted, notSorted };
  }

  return {
    settings: { HEADING_POINTS, BODY_POINTS, MIN_SCORE, UNSURE_SHARE, GAP_WORDS, WORDS_THAT_COUNT_ANYWHERE },
    loadLibrary,
    linesFromPdf,
    linesFromText,
    splitSections,
    readLease,
    inTierOrder,
    forMatching,
    cuePattern,
  };
})();
