// The engine check page: shows every section the engine finds in a lease,
// and how it sorted each one. A tool for Zachary, not part of the tester page,
// so its few labels are written here rather than in content.json.

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

let library = null;
let fixedLibrary = null; // the library with library/proposed-fixes.json applied, if that file exists
let lastLines = null;
let lastName = "";

// Applies the proposed workbook fixes to a copy of the library, in memory only.
function withProposedFixes(base, fixes) {
  const copy = structuredClone(base);
  for (const [id, change] of Object.entries(fixes.clauseTypes || {})) {
    const type = copy.types.find((t) => t.id === id);
    if (type) Object.assign(type, change);
  }
  for (const [id, change] of Object.entries(fixes.versions || {})) {
    const version = copy.versions.find((v) => v.id === id);
    if (version) Object.assign(version, change);
  }
  for (const type of fixes.newClauseTypes || []) {
    copy.types.push({ tier: null, massachusettsLaw: "", status: "Draft (Claude)", live: false, ...type });
  }
  return copy;
}

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

async function linesFromFile(file) {
  if (/\.pdf$/i.test(file.name)) {
    const pdfjs = await import(PDFJS_URL);
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const lines = await LeaseEngine.linesFromPdf(doc);
    await doc.destroy();
    return lines;
  }
  // A web page or text file: one paragraph per line.
  const text = await file.text();
  if (/\.html?$/i.test(file.name)) {
    const page = new DOMParser().parseFromString(text, "text/html");
    const paragraphs = [...page.querySelectorAll("p, h1, h2, h3, h4, li")].map((p) => p.textContent);
    return LeaseEngine.linesFromText(paragraphs.join("\n"));
  }
  return LeaseEngine.linesFromText(text);
}

function describeTypes(section) {
  const cell = make("td");
  for (const match of section.matches) {
    const line = make("div", "", `${match.type.id} (${match.score} points)`);
    const why = make("div", "small", match.matched.map((m) => `${m.trigger} [${m.where}]`).join(", "));
    cell.append(line, why);
  }
  if (!section.matches.length && section.otherScores.length) {
    cell.append(make("div", "small", "Closest: " + section.otherScores.map((s) => `${s.type.id} (${s.score})`).join(", ")));
  }
  return cell;
}

function describeVersions(section) {
  const cell = make("td");
  for (const match of section.matches) {
    for (const found of match.versions) {
      const marks = [found.version.rating || "no rating"];
      if (found.flag) marks.push("flag, has an ask");
      if (found.goodForYou) marks.push("good for you");
      const line = make("div", "", `${found.version.id}: ${marks.join(", ")}`);
      line.append(make("div", "small", `cue: "${found.cue}"`));
      cell.append(line);
    }
  }
  return cell;
}

// Rows the Answer key sheet can take: lease, section, heading, type, version.
function answerKeyRows(result, leaseId) {
  const quote = (text) => `"${String(text ?? "").replace(/"/g, '""')}"`;
  const rows = [["Lease ID", "Section number", "Heading as written", "Clause type ID", "Version ID"].join(",")];
  for (const section of result.sections) {
    const match = section.status === "sorted" ? section.matches[0] : null;
    rows.push([
      quote(leaseId), quote(section.number ?? ""), quote(section.heading),
      quote(match ? match.type.id : ""), quote(match && match.versions[0] ? match.versions[0].version.id : ""),
    ].join(","));
  }
  return rows.join("\n");
}

function show() {
  if (!lastLines) return;
  const preview = document.getElementById("preview").checked;
  const useFixes = fixedLibrary && document.getElementById("fixes").checked;
  const result = LeaseEngine.readLease(lastLines, useFixes ? fixedLibrary : library, { preview });
  const counts = { sorted: 0, unsure: 0, "not-sorted": 0 };
  for (const section of result.sections) counts[section.status]++;
  document.getElementById("summary").textContent =
    `${useFixes ? "After tuning" : "First run"}: ${lastName}: ${result.sections.length} sections. ` +
    `${counts.sorted} sorted, ${counts.unsure} unsure, ${counts["not-sorted"]} not sorted.` +
    (preview ? " Draft rows included." : " Approved rows only.");

  const table = make("table");
  const head = make("tr");
  for (const label of ["Section", "Heading", "Result", "Tier", "Clause type", "Versions matched", "Lease text"]) head.append(make("th", "", label));
  table.append(head);
  for (const section of result.sections) {
    const row = make("tr");
    row.append(
      make("td", "", section.number ?? "(before the first section)"),
      make("td", "", section.heading),
      make("td", `status-${section.status}`, section.status.replace("-", " ")),
      make("td", "", section.tier === null ? "not set" : String(section.tier)),
      describeTypes(section),
      describeVersions(section),
    );
    const textCell = make("td");
    const details = make("details");
    details.append(make("summary", "small", `${section.text.length} characters, page ${section.page}`), make("div", "small", section.text));
    textCell.append(details);
    row.append(textCell);
    table.append(row);
  }

  const key = make("details");
  key.append(
    make("summary", "", "Rows for the Answer key sheet (check and correct them before pasting)"),
    Object.assign(make("textarea"), { value: answerKeyRows(result, lastName.replace(/\.[^.]+$/, "")), readOnly: true }),
  );
  document.getElementById("output").replaceChildren(key, table);
}

async function start() {
  library = await LeaseEngine.loadLibrary();
  const fixesResponse = await fetch("library/proposed-fixes.json");
  if (fixesResponse.ok) {
    fixedLibrary = withProposedFixes(library, await fixesResponse.json());
  } else {
    document.getElementById("fixes-label").hidden = true;
  }
  document.getElementById("fixes").addEventListener("change", show);
  document.getElementById("file").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    document.getElementById("summary").textContent = "Reading…";
    try {
      lastLines = await linesFromFile(file);
      lastName = file.name;
      show();
    } catch (problem) {
      console.error(problem);
      document.getElementById("summary").textContent = `Couldn't read ${file.name}: ${problem.message}`;
    }
  });
  document.getElementById("preview").addEventListener("change", show);
}

start();
