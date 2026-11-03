// Clause & Effect, the round 1 page (round-one.html).
// Every word on the page comes from content.json and clause-types.json.
// Lease text comes from the uploaded PDF, read here in the browser.
// The PDF is never sent anywhere or kept.

// pdf.js, Mozilla's free PDF reader, at a fixed version.
const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path} (status ${response.status})`);
  return response.json();
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

// Makes an element with an optional class and text.
function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// ---------- Page frame ----------

// Shows the app name with its "&" set apart, so the stylesheet can highlight it.
// The name is also the home button: it goes back to the upload screen and
// clears the lease. Screen readers hear page.homeLabel after the name.
function renderAppName(name, homeLabel) {
  const button = make("button", "home-button");
  button.type = "button";
  const [before, ...rest] = name.split("&");
  if (rest.length === 0) {
    button.textContent = name;
  } else {
    button.append(before, make("span", "amp", "&"), rest.join("&"));
  }

  const label = make("span", "visually-hidden", homeLabel);
  label.id = "home-label";
  button.setAttribute("aria-describedby", label.id);
  button.addEventListener("click", () => showUploadScreen());

  document.getElementById("app-name").replaceChildren(button, label);
}

function renderFrame(page) {
  document.title = page.appName;
  renderAppName(page.appName, page.homeLabel);
  setText("title", page.title);
  setText("intro", page.intro);
  setText("footer-note", page.footer);
  setText("tester-code", testerCode());
}

// ---------- Reading the PDF ----------

// Joins words split by a hyphen at the end of a line, and turns line
// breaks and runs of spaces into single spaces.
function tidyText(raw) {
  return raw
    .replace(/(\w)-[ \t]*\n\s*(\w)/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

// A copy of the text for matching only: straight quotes, lower case.
// Each character maps to one character, so positions line up with the tidy text.
function matchingForm(text) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
}

async function readPdfText(file) {
  const pdfjs = await import(PDFJS_URL);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let raw = "";
  for (let number = 1; number <= doc.numPages; number++) {
    const page = await doc.getPage(number);
    const content = await page.getTextContent();
    for (const item of content.items) raw += item.str + (item.hasEOL ? "\n" : "");
    raw += "\n";
  }
  await doc.destroy();
  return tidyText(raw);
}

// Finds each clause's excerpt in the lease text, from its first words
// (findStart) to the next place its last words (findEnd) appear.
function findClauses(clauses, leaseText) {
  const haystack = matchingForm(leaseText);
  const found = [];
  const notFound = [];
  for (const clause of clauses) {
    const start = haystack.indexOf(matchingForm(tidyText(clause.findStart || "")));
    const endWords = matchingForm(tidyText(clause.findEnd || ""));
    const end = start >= 0 && endWords ? haystack.indexOf(endWords, start) : -1;
    if (!clause.findStart || start < 0 || end < 0) {
      notFound.push(clause);
    } else {
      found.push({ ...clause, legalText: leaseText.slice(start, end + endWords.length) });
    }
  }
  return { found, notFound };
}

// ---------- Clause types and risk ranks ----------

// Adds each clause's type from clause-types.json (by its "type" field),
// and numbers the risk ranks from 1 among the clauses shown.
function withTypes(clauses, types) {
  const typed = clauses.map((clause) => {
    const type = types.find((entry) => entry.type === clause.type);
    if (!type) console.warn(`Clause ${clause.id} has type "${clause.type}", which is not in clause-types.json.`);
    return { ...clause, typeInfo: type || null };
  });
  typed
    .filter((clause) => clause.typeInfo)
    .sort((a, b) => a.typeInfo.rank - b.typeInfo.rank)
    .forEach((clause, index) => (clause.riskNumber = index + 1));
  return typed;
}

// ---------- Versions ----------

// One builder for each item a version can list in its "shows" list in
// content.json. A builder returns nothing when the clause has nothing to show.
const clauseParts = {
  heading(clause) {
    return make("h3", "clause-heading", clause.heading);
  },

  legalText(clause, content, version) {
    const panel = make("div", "lease-text");
    if (clause.legalText) {
      const paragraph = make("p");
      if (version.shows.includes("glossary")) {
        paragraph.append(...withGlossaryWords(clause.legalText, content.glossary));
      } else {
        paragraph.textContent = clause.legalText;
      }
      panel.append(paragraph);
    } else {
      panel.append(make("p", "empty-excerpt", content.page.emptyExcerpt));
    }
    return panel;
  },

  plain(clause) {
    if (!clause.plain || !clause.plain.length) return null;
    const box = make("div", "plain-language");
    const list = make("ul", "plain-list");
    for (const line of clause.plain) list.append(make("li", "", line));
    box.append(list);
    return box;
  },

  consequenceRank(clause, content) {
    if (!clause.typeInfo) return null;
    const consequence = content.tags.consequence;
    const levelName = consequence.levelNames[clause.typeInfo.level];
    const mark = make("p", "risk-mark");
    mark.append(make("span", "risk-number", String(clause.riskNumber)), ` ${levelName}`);
    return mark;
  },

  negotiableTag(clause, content) {
    if (!clause.typeInfo || !clause.typeInfo.negotiable) return null;
    return make("p", "negotiable-tag", content.tags.negotiable.label);
  },

  asks(clause, content) {
    const type = clause.typeInfo;
    if (!type || !type.negotiable || !type.asks || !type.asks.length) return null;
    const box = make("div", "asks");
    box.append(make("p", "asks-intro", content.tags.negotiable.askIntro));
    const list = make("ul", "asks-list");
    for (const ask of type.asks) list.append(make("li", "", ask));
    box.append(list);
    return box;
  },

  shortHeading(clause) {
    return make("h3", "clause-heading", clause.shortHeading);
  },

  cardLine(clause) {
    return clause.cardLine ? make("p", "card-line", clause.cardLine) : null;
  },

  consequenceWhy(clause) {
    return clause.typeInfo && clause.typeInfo.why ? make("p", "why", clause.typeInfo.why) : null;
  },

  // A button that opens and closes the plain-language lines and the lease text.
  // It uses page.showDetails and page.hideDetails if they exist, and
  // page.showLeaseText and page.hideLeaseText until then.
  plainAndLegalTextOnTap(clause, content, version) {
    const page = content.page;
    const showWords = page.showDetails || page.showLeaseText;
    const hideWords = page.hideDetails || page.hideLeaseText;

    const details = make("div", "card-details");
    details.id = `details-${++detailsCount}`;
    details.hidden = true;
    const plain = clauseParts.plain(clause, content);
    if (plain) details.append(plain);
    details.append(clauseParts.legalText(clause, content, version));

    const button = make("button", "button button-secondary details-button", showWords);
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", details.id);
    button.addEventListener("click", () => {
      const opening = details.hidden;
      details.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
      button.textContent = opening ? hideWords : showWords;
    });

    const wrapper = make("div", "card-toggle");
    wrapper.append(button, details);
    return wrapper;
  },
};

// Gives each opening panel its own id, so its button can point to it.
let detailsCount = 0;

// ---------- Word meanings (glossary) ----------

// Finds where a glossary entry's words first appear in a lease text:
// whole words only, any case, any spacing between the words.
function firstMatch(text, words) {
  const pattern = words
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  // The first group checks the character before the words, so the match
  // starts at a word's beginning. (Older phone browsers lack a simpler way.)
  const match = new RegExp(`(^|[^\\w-])(${pattern})(?![\\w-])`, "i").exec(text);
  if (!match) return null;
  const start = match.index + match[1].length;
  return { start, end: start + match[2].length };
}

// The glossary words found in a lease text, first appearance of each,
// in reading order. Where two overlap, the one that starts first wins.
function glossaryMatches(text, glossary) {
  const found = (glossary || [])
    .map((entry) => ({ entry, ...firstMatch(text, entry.words) }))
    .filter((match) => match.start !== undefined)
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const kept = [];
  for (const match of found) {
    const last = kept[kept.length - 1];
    if (!last || match.start >= last.end) kept.push(match);
  }
  return kept;
}

// Turns a lease text into text pieces and word buttons. Tapping a word
// opens its meaning just below the line; tapping again closes it.
function withGlossaryWords(text, glossary) {
  const pieces = [];
  let position = 0;
  for (const { entry, start, end } of glossaryMatches(text, glossary)) {
    pieces.push(text.slice(position, start));

    const meaning = make("span", "term-meaning", entry.meaning);
    meaning.id = `meaning-${++meaningCount}`;
    meaning.hidden = true;

    const button = make("button", "term", text.slice(start, end));
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", meaning.id);
    button.addEventListener("click", () => {
      const opening = meaning.hidden;
      meaning.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
    });

    pieces.push(button, meaning);
    position = end;
  }
  pieces.push(text.slice(position));
  return pieces;
}

// Gives each word meaning its own id, so its button can point to it.
let meaningCount = 0;

// Where each part sits on a clause. The "shows" list decides which parts
// appear; this list decides where they go. The risk mark and the tag sit
// together in one row under the heading.
const MARKS = ["consequenceRank", "negotiableTag"];
const CLAUSE_LAYOUT = [
  "heading",
  "shortHeading",
  "marks",
  "cardLine",
  "consequenceWhy",
  "legalText",
  "plain",
  "asks",
  "plainAndLegalTextOnTap",
];

function renderClause(clause, version, content) {
  const article = make("article", "clause");
  for (const slot of CLAUSE_LAYOUT) {
    if (slot === "marks") {
      const marks = MARKS.filter((item) => version.shows.includes(item))
        .map((item) => clauseParts[item](clause, content))
        .filter(Boolean);
      if (marks.length) {
        const row = make("div", "marks");
        row.append(...marks);
        article.append(row);
      }
    } else if (version.shows.includes(slot)) {
      const part = clauseParts[slot](clause, content, version);
      if (part) article.append(part);
    }
  }
  return article;
}

// The notes at the top of a version that lists "governsNote": the lease text
// governs, what "you" means, and how the risk ranks count. When the lease
// text has underlined glossary words, a last note says to tap them.
function renderVersionNotes(content, hasGlossaryWords) {
  const notes = make("div", "version-notes");
  notes.append(
    make("p", "governs-note", content.page.governsSample),
    make("p", "", content.page.youMeans),
    make("p", "", content.tags.consequence.scale),
  );
  if (hasGlossaryWords) notes.append(make("p", "glossary-hint", content.page.glossaryHint));
  return notes;
}

// "What to do next" at the end of a version that lists "nextSteps": every
// ask from the clauses shown, in the version's own order, in one list.
// Returns nothing when no clause has an ask.
function renderNextSteps(content, orderedClauses) {
  const asks = [];
  for (const clause of orderedClauses) {
    const type = clause.typeInfo;
    if (!type || !type.negotiable || !type.asks) continue;
    for (const ask of type.asks) if (!asks.includes(ask)) asks.push(ask);
  }
  if (!asks.length) return null;

  const page = content.page;
  const box = make("section", "next-steps");
  const heading = make("h3", "next-steps-title", page.nextStepsTitle);
  heading.id = `next-steps-${++nextStepsCount}`;
  box.setAttribute("aria-labelledby", heading.id);

  const list = make("ul", "asks-list");
  for (const ask of asks) list.append(make("li", "", ask));

  // Prints only this box: the stylesheet hides everything else while
  // the page has the "print-list" class.
  const print = make("button", "button button-secondary print-button", page.printButton);
  print.type = "button";
  print.addEventListener("click", () => {
    document.body.classList.add("print-list");
    window.print();
  });

  box.append(heading, make("p", "next-steps-intro", page.nextStepsIntro), list, print);
  return box;
}

// Gives each "What to do next" heading its own id, so its box can name it.
let nextStepsCount = 0;

window.addEventListener("afterprint", () => document.body.classList.remove("print-list"));

function inLeaseOrder(clauses) {
  return [...clauses].sort((a, b) => a.leaseOrder - b.leaseOrder);
}

// Highest risk first. A clause with no known type goes last.
function inRankOrder(clauses) {
  const rankOf = (clause) => clause.riskNumber ?? Infinity;
  return inLeaseOrder(clauses).sort((a, b) => rankOf(a) - rankOf(b));
}

function renderVersion(content, clauses, letter, number) {
  const version = content.versions[letter];
  const headingId = `version-${number}-heading`;

  const section = make("section", "version");
  section.id = `version-${number}`;
  section.setAttribute("aria-labelledby", headingId);

  const heading = make("h2", "version-heading", `${content.page.versionLabel} ${number}`);
  heading.id = headingId;
  heading.tabIndex = -1; // so switching versions can move focus here
  section.append(heading);

  // One line saying what this version shows, from the version's "description".
  if (version.description) section.append(make("p", "version-description", version.description));

  if (version.shows.includes("governsNote")) {
    const hasGlossaryWords =
      version.shows.includes("glossary") &&
      clauses.some((clause) => clause.legalText && glossaryMatches(clause.legalText, content.glossary).length);
    section.append(renderVersionNotes(content, hasGlossaryWords));
  }

  const byRank = version.order === "rank";
  const ordered = byRank ? inRankOrder(clauses) : inLeaseOrder(clauses);
  const list = make("div", byRank ? "clause-list card-list" : "clause-list");
  for (const clause of ordered) list.append(renderClause(clause, version, content));
  section.append(list);

  if (version.shows.includes("nextSteps")) {
    const nextSteps = renderNextSteps(content, ordered);
    if (nextSteps) section.append(nextSteps);
  }
  return section;
}

function renderNotFound(page, clauses) {
  const section = make("section", "not-found");
  section.append(make("h2", "not-found-title", page.notFoundTitle));
  section.append(make("p", "not-found-note", page.notFoundNote));
  const list = make("ul", "not-found-list");
  for (const clause of inLeaseOrder(clauses)) list.append(make("li", "", clause.heading));
  section.append(list);
  return section;
}

// ---------- Link settings ----------

// ?order= sets which version is 1, 2 and 3, for example ?order=CAB.
// It must use A, B and C once each. Anything else falls back to the default.
function versionOrder(defaultOrder) {
  const asked = (new URLSearchParams(location.search).get("order") || "").toUpperCase();
  const valid = asked.length === 3 && [...asked].sort().join("") === "ABC";
  return (valid ? asked : defaultOrder).split("");
}

// ?t= carries a short tester code, such as ?t=R1. Only letters, numbers,
// dashes and underscores are kept, up to 12 characters.
function testerCode() {
  const asked = new URLSearchParams(location.search).get("t") || "";
  return asked.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 12);
}

// ---------- Results and the version switcher ----------

function showResults(content, types, found, notFound) {
  const results = document.getElementById("results");
  const startOver = make("button", "button button-secondary", content.page.startOver);
  startOver.type = "button";
  startOver.addEventListener("click", () => showUploadScreen());
  results.replaceChildren(startOver);

  const clauses = withTypes(found, types);
  if (clauses.length) {
    const sections = versionOrder(content.page.defaultOrder).map((letter, index) =>
      renderVersion(content, clauses, letter, index + 1),
    );

    const switcher = make("div", "version-switcher");
    const buttons = sections.map((section, index) => {
      const button = make("button", "switch-button", `${content.page.versionLabel} ${index + 1}`);
      button.type = "button";
      button.setAttribute("aria-controls", section.id);
      button.addEventListener("click", () => showVersion(index, true));
      return button;
    });
    switcher.append(...buttons);

    // Shows one version, hides the others, and scrolls back to the top.
    function showVersion(chosen, moveFocus) {
      sections.forEach((section, index) => (section.hidden = index !== chosen));
      buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === chosen)));
      window.scrollTo(0, 0);
      if (moveFocus) sections[chosen].querySelector(".version-heading").focus({ preventScroll: true });
    }

    results.append(switcher, ...sections);
    showVersion(0, false);
  }
  if (notFound.length) results.append(renderNotFound(content.page, notFound));

  document.getElementById("upload-screen").hidden = true;
  results.hidden = false;
  window.scrollTo(0, 0);
  startOver.focus();
}

// ---------- Upload screen ----------

function renderUploadScreen(content, types) {
  const page = content.page;
  const screen = document.getElementById("upload-screen");

  const fileInput = make("input", "visually-hidden");
  fileInput.type = "file";
  fileInput.accept = "application/pdf,.pdf";
  fileInput.id = "lease-file";
  fileInput.tabIndex = -1;
  fileInput.setAttribute("aria-hidden", "true");

  const chooseButton = make("button", "button button-primary", page.uploadButton);
  chooseButton.type = "button";
  chooseButton.id = "choose-button";
  chooseButton.addEventListener("click", () => fileInput.click());

  const sampleButton = make("button", "button button-secondary", page.sampleButton);
  sampleButton.type = "button";
  sampleButton.addEventListener("click", () => showResults(content, types, content.clauses, []));

  const status = make("p", "upload-status");
  status.id = "upload-status";
  status.setAttribute("role", "status");

  const error = make("p", "upload-error");
  error.id = "upload-error";
  error.setAttribute("role", "alert");

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    error.textContent = "";
    status.textContent = page.reading;
    chooseButton.disabled = true;
    sampleButton.disabled = true;
    try {
      const leaseText = await readPdfText(file);
      if (!leaseText) throw new Error("The PDF has no text to read.");
      const { found, notFound } = findClauses(content.clauses, leaseText);
      status.textContent = "";
      showResults(content, types, found, notFound);
    } catch (problem) {
      console.error("The lease could not be read.", problem);
      status.textContent = "";
      error.textContent = page.error;
    } finally {
      chooseButton.disabled = false;
      sampleButton.disabled = false;
    }
  });

  const buttons = make("div", "upload-buttons");
  buttons.append(chooseButton, sampleButton);

  const card = make("div", "upload-card");
  card.append(
    make("h2", "upload-title", page.uploadTitle),
    make("p", "upload-intro", page.uploadIntro),
    buttons,
    make("p", "privacy-note", page.privacyNote),
    status,
    error,
    fileInput,
  );
  screen.replaceChildren(card);
}

function showUploadScreen() {
  const results = document.getElementById("results");
  results.hidden = true;
  results.replaceChildren();
  document.getElementById("upload-screen").hidden = false;
  window.scrollTo(0, 0);
  document.getElementById("choose-button").focus();
}

// ---------- Start ----------

async function start() {
  try {
    const [content, clauseTypes] = await Promise.all([
      loadJson("content.json"),
      loadJson("clause-types.json"),
    ]);
    renderFrame(content.page);
    renderUploadScreen(content, clauseTypes.types);
  } catch (error) {
    // No error wording exists in content.json for this, so the page stays blank.
    // This usually means a typo in a JSON file, such as a missing comma.
    console.error("The page could not start.", error);
  }
}

start();
