// Clause & Effect, the main page (index.html), built for round 2.
// The engine (engine.js) reads the uploaded lease and sorts every section.
// This page shows the result in three versions, each with its own layout:
//   A "Lease text first"   - annotated lease: the lease's words, with notes beside them
//   B "What to ask first"  - plain checklist: short rows, short bullets
//   C "Risk summary first" - summary first: counts, then one line per section
// It shows only approved rows from the library. With ?preview=1 it also shows
// draft rows, with one "Draft" note at the top. The round 1 page
// (round-one.html) is unchanged and never reads draft rows.
// Every word comes from content.json, content-round-two.json or the library.
// The lease is read in this browser and never sent anywhere or kept.

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

let content = null;   // content.json: approved page wording
let words = null;     // content-round-two.json: round 2 wording, some of it draft
let library = null;   // the engine's library, made from the workbook
let lease = null;     // the engine's reading of the uploaded lease
let glossary = [];    // word meanings, from content.json and the library

// ?preview=1 shows draft rows too, for checking wording before approving it.
const PREVIEW = new URLSearchParams(location.search).get("preview") === "1";

// ---------- Small helpers ----------

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = text;
  return element;
}

function setText(id, text) {
  document.getElementById(id).textContent = text;
}

let idCount = 0;
const newId = (prefix) => `${prefix}-${++idCount}`;

// A button that opens and closes a panel, and tells screen readers which.
function toggle(showLabel, hideLabel, panel, className = "text-toggle") {
  panel.id = panel.id || newId("panel");
  panel.hidden = true;
  panel.dataset.printOpen = "true"; // printing the whole page opens it
  const button = make("button", className, showLabel);
  button.type = "button";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", panel.id);
  button.addEventListener("click", () => {
    const opening = panel.hidden;
    panel.hidden = !opening;
    button.setAttribute("aria-expanded", String(opening));
    if (hideLabel !== showLabel) button.textContent = opening ? hideLabel : showLabel;
  });
  return button;
}

// A blank in braces, such as {days}, gets the lease's own number when the
// tool found one. Otherwise it shows the stand-in words, pointing to the lease.
function sentence(text, numbers = {}) {
  return (text || "").replace(/\{(\w+)\}/g, (blank, name) => numbers[name] || words.labels.blankNumber);
}

// ?order= sets which version comes first, as on the live page.
function versionOrder() {
  const asked = (new URLSearchParams(location.search).get("order") || "").toUpperCase();
  const valid = asked.length === 3 && [...asked].sort().join("") === "ABC";
  return (valid ? asked : content.page.defaultOrder).split("");
}

function testerCode() {
  return (new URLSearchParams(location.search).get("t") || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 12);
}

// ---------- Word meanings and highlights in the lease text ----------

// The glossary from content.json, plus the library's, without repeats.
function mergedGlossary() {
  const seen = new Set();
  const all = [];
  const fromLibrary = (library.glossary || []).filter((entry) => PREVIEW || entry.live);
  for (const entry of [...(content.glossary || []), ...fromLibrary]) {
    const key = entry.words.toLowerCase();
    if (!entry.words || !entry.meaning || seen.has(key)) continue;
    seen.add(key);
    all.push({ words: entry.words, meaning: entry.meaning });
  }
  return all;
}

function firstMatch(text, phrase) {
  const pattern = phrase.trim().split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+");
  const match = new RegExp(`(^|[^\\w-])(${pattern})(?![\\w-])`, "i").exec(text);
  if (!match) return null;
  const start = match.index + match[1].length;
  return { start, end: start + match[2].length };
}

// A piece of lease text with each glossary word underlined the first time it
// appears in the section (tracked in `seen`). Tapping a word opens its meaning.
function withMeanings(text, seen) {
  const found = glossary
    .filter((entry) => !seen.has(entry.words.toLowerCase()))
    .map((entry) => ({ entry, ...firstMatch(text, entry.words) }))
    .filter((m) => m.start !== undefined)
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const pieces = [];
  let position = 0;
  for (const { entry, start, end } of found) {
    if (start < position) continue;
    seen.add(entry.words.toLowerCase());
    pieces.push(text.slice(position, start));
    const meaning = make("span", "term-meaning", entry.meaning);
    meaning.id = newId("meaning");
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

// Where a version's cue phrase matched, in the lease's own text. The engine
// matches on a tidied, lower-case copy that reads Lessor as Landlord, so the
// pattern allows both words, either kind of quote, and any spacing.
function cueRange(text, matchedText) {
  if (!matchedText) return null;
  const pattern = matchedText.trim().split(/\s+/).map((word) =>
    word
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/'/g, "['’]").replace(/"/g, "[\"“”]")
      .replace(/^landlord/, "(?:landlord|lessor)").replace(/^tenant/, "(?:tenant|lessee)"),
  ).join("\\s+");
  const match = new RegExp(pattern, "i").exec(text);
  return match ? { start: match.index, end: match.index + match[0].length } : null;
}

// The lease's words for a section, with word meanings, and with the passages
// that decided its versions highlighted when `highlight` is on.
function leaseWords(section, { highlight = false } = {}) {
  const panel = make("div", "lease-text");
  const paragraph = make("p");
  const seen = new Set();
  const text = section.text;
  const ranges = highlight
    ? allVersions(section).map((found) => cueRange(text, found.matchedText)).filter(Boolean).sort((a, b) => a.start - b.start)
    : [];
  let position = 0;
  for (const range of ranges) {
    if (range.start < position) continue;
    paragraph.append(...withMeanings(text.slice(position, range.start), seen));
    const mark = make("mark", "cue-mark");
    mark.append(...withMeanings(text.slice(range.start, range.end), seen));
    paragraph.append(mark);
    position = range.end;
  }
  paragraph.append(...withMeanings(text.slice(position), seen));
  panel.append(paragraph);
  return panel;
}

// ---------- Tiers ----------

const TIER_GROUPS = ["1", "2", "3", "not-set"];

function tierKey(tier) {
  return tier === 1 || tier === 2 || tier === 3 ? String(tier) : "not-set";
}

function tierName(key) {
  return key === "not-set" ? words.tiers.notSet : words.tiers[key].name;
}

// The tier label: a small dot and the tier's name, never color alone.
// Clicking it explains the scale.
function tierLabel(tier, className = "tier-label") {
  const key = tierKey(tier);
  const label = make("button", `${className} tier-${key}`);
  label.type = "button";
  label.setAttribute("aria-haspopup", "dialog");
  label.append(make("span", "tier-dot"), make("span", "", tierName(key)));
  label.firstChild.setAttribute("aria-hidden", "true");
  label.addEventListener("click", () => openTierDialog(label));
  return label;
}

function tierScale() {
  const list = make("dl", "tier-scale");
  for (const key of ["1", "2", "3", "not-set"]) {
    const name = make("dt", `tier-${key}`);
    name.append(make("span", "tier-dot"), make("span", "", tierName(key)));
    list.append(name, make("dd", "", key === "not-set" ? words.tiers.notSetMeaning : words.tiers[key].meaning));
  }
  return list;
}

function openTierDialog(opener) {
  const dialog = document.getElementById("tier-dialog");
  const title = make("h2", "", words.splash.scaleTitle);
  title.id = "tier-dialog-title";
  const close = make("button", "button button-secondary", words.labels.close);
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  dialog.replaceChildren(title, tierScale(), close);
  dialog.addEventListener("close", () => opener.focus(), { once: true });
  dialog.showModal();
  close.focus();
}

// ---------- The video ----------

// "See what it does" plays the hype video (hype.html) in a pop-up over
// the page, so the uploaded lease is still here when it closes. The video
// is loaded only when opened, and removed on close, which stops it.
function videoButton(className) {
  const button = make("button", className, words.labels.watchVideo);
  button.type = "button";
  button.addEventListener("click", () => openVideo(button));
  return button;
}

function openVideo(opener) {
  const dialog = document.getElementById("video-dialog");
  dialog.setAttribute("aria-label", words.labels.watchVideo);
  const close = make("button", "button button-secondary video-close", words.labels.close);
  close.type = "button";
  close.addEventListener("click", () => dialog.close());
  const frame = make("iframe", "video-frame");
  frame.title = words.labels.watchVideo;
  frame.allow = "fullscreen";
  frame.src = "hype.html?embed=1";
  dialog.replaceChildren(close, frame);
  dialog.addEventListener("close", () => {
    dialog.replaceChildren();
    opener.focus();
  }, { once: true });
  dialog.showModal();
  frame.addEventListener("load", () => frame.focus(), { once: true });
}

// ---------- Pieces of a section ----------

// "Section 13 · ASSIGNMENT – SUBLEASING". The text before the first
// section, such as the lease's title, is "Start of the lease".
function sectionRef(section) {
  if (!section.number && !section.heading) return words.labels.startOfLease;
  const label = section.number ? `${words.labels.section} ${section.number}` : "";
  return [label, section.heading].filter(Boolean).join(" · ");
}

// "Section 13", without the form's heading, for sections that have a plain
// name. The text before the first section is "Start of the lease".
function sectionNumber(section) {
  return section.number ? `${words.labels.section} ${section.number}` : sectionRef(section);
}

const typeNames = (section) => section.matches.map((m) => m.type.name).filter(Boolean);

// A section's plain title: its clause type's name, or the lease's heading.
function sectionName(section) {
  const named = typeNames(section);
  return named.length ? named.join(" or ") : sectionRef(section);
}

function allVersions(section) {
  return section.matches.flatMap((match) => match.versions.map((found) => ({ ...found, type: match.type })));
}

const isFlag = (found) => found.flag && found.ask;
const hasFlag = (section) => allVersions(section).some(isFlag);

function proofExample(version) {
  if (!version || !version.example) return null;
  const box = make("figure", "proof");
  box.append(make("figcaption", "proof-label", words.labels.realExample));
  box.append(make("blockquote", "proof-quote", version.example));
  const source = make("p", "proof-source");
  const url = (version.exampleSource.match(/https?:\/\/\S+/) || [])[0];
  source.append(version.exampleSource.replace(/https?:\/\/\S+/, "").replace(/[.\s]+$/, ""));
  if (url) {
    const link = make("a", "", url.replace(/^https?:\/\//, "").split("/")[0]);
    link.href = url;
    link.rel = "noopener";
    source.append(" ", link);
  }
  box.append(source);
  const fromDataset = /Leivaditi/i.test(version.exampleSource);
  box.append(make("p", "proof-note", fromDataset ? words.labels.datasetCredit : words.labels.proofLine));
  return box;
}

// What a section means: each version's plain sentence, with "Good for you"
// on the versions that help the tenant. Nothing, if no explanation is
// written yet, so the page never shows an empty box.
function meaning(section) {
  const box = make("div", "meaning");
  if (section.status === "unsure") box.append(make("p", "unsure-line", words.labels.unsureLine));
  for (const found of allVersions(section)) {
    const line = make("p", "meaning-line");
    if (found.goodForYou) line.append(make("span", "good-mark", words.labels.goodForYou), " ");
    line.append(sentence(found.version.plain, found.numbers));
    box.append(line);
  }
  return box.childNodes.length ? box : null;
}

// Appends only the pieces that exist.
function appendAll(parent, ...pieces) {
  parent.append(...pieces.filter(Boolean));
}

// Everything behind "See what to say": the words to propose, a real lease
// with the better wording, what to ask for if they say no, and the next step.
function whatToSay(found) {
  const ask = found.ask;
  const panel = make("div", "what-to-say");
  if (ask.legalWording) {
    panel.append(make("p", "legal-caution", words.labels.legalCaution), make("p", "legal-wording", ask.legalWording));
  }
  const proof = proofExample(found.askFor);
  if (proof) panel.append(proof);
  if (found.fallback) {
    const fallback = make("p", "fallback-line");
    fallback.append(make("strong", "", `${words.labels.ifTheySayNo}: `), sentence(found.fallback.plain));
    panel.append(fallback);
  }
  if (ask.nextStep) {
    const next = make("p", "next-line");
    next.append(make("strong", "", `${words.labels.nextStep}: `), ask.nextStep);
    panel.append(next);
  }
  return panel;
}

// The asks, as in round 1: one line, then one short bullet per ask, each
// with one short "why", and the rest behind "See what to say".
function askBullets(section) {
  const flags = allVersions(section).filter(isFlag);
  if (!flags.length) return null;
  const box = make("div", "asks");
  box.append(make("p", "asks-intro", content.tags.negotiable.askIntro));
  const list = make("ul", "ask-bullets");
  for (const found of flags) {
    const item = make("li");
    item.append(make("span", "ask-text", found.ask.shortAsk || found.ask.plainAsk));
    const why = found.ask.shortWhy || found.ask.why;
    if (why) {
      const line = make("span", "ask-why");
      line.append(make("span", "why-label", `${words.labels.why}: `), why);
      item.append(line);
    }
    const panel = whatToSay(found);
    if (panel.childNodes.length) item.append(toggle(words.labels.moreAboutAsk, words.labels.moreAboutAsk, panel), panel);
    list.append(item);
  }
  box.append(list);
  return box;
}

// ---------- The three layouts ----------

// B, plain checklist: a short row with a hairline, and two text links.
function checklistRow(section) {
  const row = make("article", "row checklist-row");
  const top = make("div", "row-top");
  top.append(make("h3", "row-title", sectionName(section)));
  if (hasFlag(section)) top.append(make("span", "flag-mark", words.labels.flag));
  appendAll(row, make("p", "row-ref", sectionNumber(section)), top, meaning(section), askBullets(section));
  const text = leaseWords(section);
  const links = make("div", "row-links");
  links.append(toggle(words.labels.showLeaseWords, words.labels.hideLeaseWords, text));
  row.append(links, text);
  return row;
}

// A, annotated lease: the lease's words on a page, with a note beside them.
// With no explanation and no ask, there's no note: the name sits above
// the lease's words instead.
function annotatedRow(section) {
  const row = make("article", "row annotated-row");
  const page = make("div", "lease-page");
  const title = make("h3", "row-title", sectionName(section));
  const explained = meaning(section);
  const asks = askBullets(section);
  page.append(make("p", "row-ref", sectionNumber(section)));
  if (!explained && !asks) {
    row.classList.add("no-note");
    page.append(title);
  }
  page.append(leaseWords(section, { highlight: true }));
  row.append(page);
  if (explained || asks) {
    const note = make("aside", "margin-note");
    appendAll(note, title, explained, asks);
    row.append(note);
  }
  return row;
}

// C, summary first: one line per section that opens for more.
function summaryRow(section) {
  const row = make("article", "row summary-row");
  const panel = make("div", "summary-detail");
  appendAll(panel, make("p", "row-ref", sectionNumber(section)), meaning(section), askBullets(section));
  const text = leaseWords(section);
  const links = make("div", "row-links");
  links.append(toggle(words.labels.showLeaseWords, words.labels.hideLeaseWords, text));
  panel.append(links, text);

  const opener = toggle(sectionName(section), sectionName(section), panel, "summary-toggle");
  opener.replaceChildren(make("span", "summary-name", sectionName(section)));
  if (hasFlag(section)) opener.append(make("span", "flag-mark", words.labels.flag));
  const heading = make("h3", "summary-heading");
  heading.append(opener);
  row.append(heading, panel);
  return row;
}

// Sections the tool couldn't sort: a name, and the lease's words one click away.
function unsortedRow(section) {
  const row = make("article", "row unsorted-row");
  const text = leaseWords(section);
  const links = make("div", "row-links");
  links.append(toggle(words.labels.showLeaseWords, words.labels.hideLeaseWords, text));
  row.append(make("h3", "row-title", sectionRef(section)), links, text);
  return row;
}

// ---------- A version ----------

// Tier groups, highest stakes first, then sections the tool couldn't sort.
// "What to ask first" puts sections with an ask first within each tier.
function groupsFor(version) {
  const { sorted, notSorted } = LeaseEngine.inTierOrder(lease.sections);
  const groups = TIER_GROUPS.map((key) => {
    let sections = sorted.filter((section) => tierKey(section.tier) === key);
    if (version === "B") sections = [...sections.filter(hasFlag), ...sections.filter((s) => !hasFlag(s))];
    return { key, sections };
  }).filter((group) => group.sections.length);
  if (notSorted.length) groups.push({ key: "unsorted", sections: notSorted });
  return groups;
}

function versionNotes(version) {
  const notes = make("div", "version-notes");
  notes.append(make("p", "governs-note", content.page.governsSample), make("p", "", content.page.youMeans));
  // Every version says that any term can be asked about, not only the
  // flagged ones.
  notes.append(make("p", "flag-line", words.versions.B.flagLine));
  notes.append(make("p", "", content.page.glossaryHint));
  return notes;
}

// Summary first opens with three counts: two tiers and the asks.
function summaryCounts() {
  const { sorted } = LeaseEngine.inTierOrder(lease.sections);
  const asks = new Set(sorted.flatMap((s) => allVersions(s).filter(isFlag).map((f) => f.ask.version))).size;
  const strip = make("div", "summary-counts");
  const tile = (label, count, href, key) => {
    const link = make("a", `count-tile tier-${key}`);
    link.href = href;
    link.append(make("span", "count-label", label), make("span", "count-number", String(count)));
    return link;
  };
  strip.append(
    tile(words.tiers["1"].name, sorted.filter((s) => s.tier === 1).length, "#group-1", "1"),
    tile(words.tiers["2"].name, sorted.filter((s) => s.tier === 2).length, "#group-2", "2"),
    tile(words.labels.thingsToAsk, asks, "#group-asks", "asks"),
  );
  return strip;
}

function renderVersion(letter) {
  const version = words.versions[letter];
  const view = make("section", `version-view layout-${letter}`);
  const heading = make("h2", "version-heading", version.name);
  heading.tabIndex = -1;
  view.append(heading, make("p", "version-description", version.description), versionNotes(letter));
  if (letter === "C") view.append(summaryCounts());

  const rowFor = { A: annotatedRow, B: checklistRow, C: summaryRow }[letter];
  for (const group of groupsFor(letter)) {
    const block = make("section", `tier-group group-${group.key}`);
    block.id = `group-${group.key}`;
    const title = make("h2", "group-title");
    if (group.key === "unsorted") {
      block.dataset.trackerLabel = words.labels.notSortedTitle;
      title.textContent = words.labels.notSortedTitle;
      block.append(title, make("p", "group-intro", words.labels.notSortedIntro));
      for (const s of group.sections) block.append(unsortedRow(s));
    } else {
      block.dataset.trackerLabel = tierName(group.key);
      title.append(tierLabel(group.key === "not-set" ? null : Number(group.key), "tier-label tier-heading"));
      block.append(title);
      for (const s of group.sections) block.append(rowFor(s));
    }
    view.append(block);
  }
  const list = askList();
  if (list) view.append(list);
  return view;
}

// The whole lease in its own order, each section with its tier.
function renderWholeLease() {
  const view = make("section", "version-view whole-lease");
  const heading = make("h2", "version-heading", words.labels.wholeLease);
  heading.tabIndex = -1;
  view.append(heading);
  for (const piece of lease.sections) {
    const row = make("article", "row whole-row");
    const top = make("div", "row-top");
    top.append(make("h3", "row-title", sectionName(piece)));
    if (piece.status !== "not-sorted") top.append(tierLabel(piece.tier));
    // A section with a plain name gets "Section 14" above it. One without
    // keeps the lease's own heading as its title, since it has no other name.
    if (typeNames(piece).length) row.append(make("p", "row-ref", sectionNumber(piece)));
    row.append(top, leaseWords(piece));
    view.append(row);
  }
  return view;
}

// ---------- What to do next: every ask, highest stakes first ----------

function askList() {
  const items = [];
  const seen = new Set();
  const { sorted } = LeaseEngine.inTierOrder(lease.sections);
  for (const section of sorted) {
    for (const found of allVersions(section).filter(isFlag)) {
      if (seen.has(found.ask.version)) continue;
      seen.add(found.ask.version);
      items.push({ section, found });
    }
  }
  if (!items.length) return null;

  const page = content.page;
  const box = make("section", "next-steps ask-list");
  box.id = "group-asks";
  box.dataset.trackerLabel = page.nextStepsTitle;
  box.append(make("h2", "next-steps-title", page.nextStepsTitle), make("p", "next-steps-intro", page.nextStepsIntro));
  const list = make("ol", "ask-items");
  for (const { section, found } of items) {
    const item = make("li", "ask-item");
    const top = make("p", "ask-item-top");
    top.append(make("span", "ask-text", found.ask.shortAsk || found.ask.plainAsk), make("span", "ask-item-section", sectionName(section)));
    item.append(top);
    const why = found.ask.shortWhy || found.ask.why;
    if (why) {
      const line = make("p", "ask-why");
      line.append(make("span", "why-label", `${words.labels.why}: `), why);
      item.append(line);
    }
    // On paper, each ask also shows the words to propose, ready to hand over.
    if (found.ask.legalWording) {
      const wording = make("p", "legal-wording print-only");
      wording.append(make("strong", "", `${words.labels.wordsToPropose}: `), found.ask.legalWording);
      item.append(wording);
    }
    list.append(item);
  }
  box.append(list, make("p", "legal-caution print-only", words.labels.legalCaution));

  const print = make("button", "button button-secondary print-button", page.printButton);
  print.type = "button";
  print.addEventListener("click", () => {
    document.body.classList.add("print-list");
    window.print();
  });
  box.append(print);
  return box;
}

window.addEventListener("afterprint", () => document.body.classList.remove("print-list", "print-page"));

// ---------- The reader: version switcher, tracker, and printing ----------

let tracker = null;

function showView(view) {
  const reader = document.getElementById("reader");
  const area = reader.querySelector(".view-area");
  const built = view === "whole" ? renderWholeLease() : renderVersion(view);
  area.replaceChildren(built);
  for (const button of reader.querySelectorAll("[data-view]")) {
    button.setAttribute("aria-pressed", String(button.dataset.view === view));
  }
  // On a phone the buttons swipe sideways: slide the chosen one into view.
  const chosen = reader.querySelector(`[data-view="${view}"]`);
  chosen.parentElement.scrollLeft = chosen.offsetLeft - 16;
  movePill(chosen);
  buildTracker(built);
  easeIn(built);
  setTabTitle(view === "whole" ? words.labels.wholeLease : words.versions[view].name);
  window.scrollTo(0, 0);
  built.querySelector(".version-heading").focus({ preventScroll: true });
}

// ---------- Motion: small touches, off for anyone who asks for less ----------

const lessMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The dark pill behind the chosen version slides to it instead of jumping.
function movePill(chosen) {
  const pill = chosen.parentElement.querySelector(".switch-pill");
  if (!pill) return;
  const firstMove = !pill.style.width;
  if (firstMove) pill.classList.add("no-slide");
  pill.style.width = `${chosen.offsetWidth}px`;
  pill.style.height = `${chosen.offsetHeight}px`;
  pill.style.transform = `translate(${chosen.offsetLeft}px, ${chosen.offsetTop}px)`;
  if (firstMove) requestAnimationFrame(() => pill.classList.remove("no-slide"));
}

// The opening screen: the logo types itself out like an arcade title,
// then, as the finale, the gold highlighter sweeps behind the "&" (what
// the tool does to a lease), and the screen wipes away.
// About 3 seconds; any click, tap or key skips it.
function playOpening() {
  const screen = document.getElementById("opening");
  if (!screen) return;
  if (lessMotion()) {
    screen.remove();
    return;
  }
  const step = 0.07;
  let delay = 0.25;
  const typed = (text) => [...text.trim()].map((letter) => {
    const span = make("span", "opening-letter", letter);
    span.style.animationDelay = `${delay}s`;
    delay += step;
    return span;
  });
  const logo = make("p", "opening-logo");
  const [before, ...rest] = content.page.appName.split("&");
  logo.append(...typed(before));
  if (rest.length) {
    delay += 0.12;
    const amp = make("span", "opening-amp", "&");
    amp.style.setProperty("--d", `${delay}s`);
    delay += 0.35;
    logo.append(amp, ...typed(rest.join("&")));
    // The finale: once the whole name is typed, the highlight sweeps in.
    delay += 0.2;
    amp.style.setProperty("--sweep", `${delay}s`);
    delay += 0.55;
  }
  const line = make("p", "opening-line", content.page.title);
  line.style.animationDelay = `${delay + 0.1}s`;
  screen.replaceChildren(logo, line);

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener("keydown", finish);
    screen.classList.add("leaving");
    setTimeout(() => screen.remove(), 650);
  };
  setTimeout(finish, (delay + 0.9) * 1000);
  screen.addEventListener("pointerdown", finish);
  window.addEventListener("keydown", finish);
}

// While reading, a hairline shows under the frosted top bar once it's
// stuck to the top of the window. On a phone only the version row sticks.
function markStuck() {
  const bar = document.querySelector("#reader:not([hidden]) .reader-bar");
  let stuck = false;
  if (bar) {
    const pinned = getComputedStyle(bar).display === "contents" ? bar.querySelector(".wide-switcher") : bar;
    stuck = pinned.getBoundingClientRect().top <= 0.5 && window.scrollY > 0;
  }
  document.body.classList.toggle("stuck", stuck);
}
window.addEventListener("scroll", markStuck, { passive: true });

window.addEventListener("resize", () => {
  const chosen = document.querySelector('#reader [data-view][aria-pressed="true"]');
  if (chosen) movePill(chosen);
});

// Cards ease in as they scroll into view, and the gold highlight sweeps
// across the key phrase in the lease's words.
let easer = null;

function easeIn(view) {
  const pieces = [...view.querySelectorAll(".row, .count-tile, .cue-mark")];
  if (easer) easer.disconnect();
  if (lessMotion() || !("IntersectionObserver" in window)) return;
  for (const piece of pieces) piece.classList.add("waiting");
  easer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove("waiting");
      easer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -12% 0px" });
  for (const piece of pieces) easer.observe(piece);
}

// "On this page": a list of the groups, with the one being read marked.
function buildTracker(view) {
  const nav = document.getElementById("tracker");
  const groups = [...view.querySelectorAll("[data-tracker-label]")];
  const list = make("ol", "tracker-list");
  const links = new Map();
  for (const group of groups) {
    const item = make("li");
    const link = make("a", "", group.dataset.trackerLabel);
    link.href = `#${group.id}`;
    item.append(link);
    list.append(item);
    links.set(group, link);
  }
  nav.replaceChildren(make("span", "tracker-label", words.labels.onThisPage), list);
  nav.hidden = !groups.length;

  if (tracker) tracker.disconnect();
  tracker = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of links.values()) link.removeAttribute("aria-current");
      links.get(entry.target).setAttribute("aria-current", "true");
    }
  }, { rootMargin: "-30% 0px -60% 0px" });
  for (const group of groups) tracker.observe(group);
}

function renderReader(firstView) {
  const reader = document.getElementById("reader");
  const bar = make("div", "reader-bar");
  const switcher = make("div", "version-switcher wide-switcher");
  const pill = make("span", "switch-pill");
  pill.setAttribute("aria-hidden", "true");
  switcher.append(pill);
  for (const letter of versionOrder()) {
    const button = make("button", "switch-button", words.versions[letter].name);
    button.type = "button";
    button.dataset.view = letter;
    button.addEventListener("click", () => showView(letter));
    switcher.append(button);
  }
  const whole = make("button", "switch-button", words.labels.wholeLease);
  whole.type = "button";
  whole.dataset.view = "whole";
  whole.addEventListener("click", () => showView("whole"));
  switcher.append(whole);

  const tools = make("div", "reader-tools");
  const back = make("button", "text-toggle", words.labels.howItWorks);
  back.type = "button";
  back.addEventListener("click", () => showSplash());
  const printPage = make("button", "text-toggle", words.labels.printPage);
  printPage.type = "button";
  printPage.addEventListener("click", () => {
    document.body.classList.add("print-page");
    window.print();
  });
  tools.append(back, videoButton("text-toggle"), printPage);
  // The links sit in the logo's row at the top, like a website's nav, so
  // the version pill below has room to stay on one line.
  document.getElementById("top-links").replaceChildren(tools);

  const nav = make("nav", "tracker");
  nav.id = "tracker";
  nav.setAttribute("aria-label", words.labels.onThisPage);

  bar.append(switcher, nav);
  reader.replaceChildren(bar, make("div", "view-area"));
  document.getElementById("splash").hidden = true;
  document.getElementById("upload-screen").hidden = true;
  reader.hidden = false;
  showView(firstView);
}

// ---------- The splash page ----------

function showSplash() {
  const s = words.splash;
  const splash = document.getElementById("splash");
  const video = make("p", "splash-video");
  // "[Watch a video] or read how it works below."
  video.append(videoButton("button button-secondary"), make("span", "", s.videoOr));
  const parts = [make("h2", "splash-title", s.title), make("p", "splash-lead", s.whatItIs), video];
  document.getElementById("top-links").replaceChildren();

  const sorting = make("section", "splash-part");
  sorting.append(make("h3", "", s.sortingTitle), make("p", "", s.sorting), tierScale());

  // The choice comes first, so no one has to scroll past the explanation.
  // Each version is a card with its name and what it shows.
  const choose = make("section", "splash-part splash-choose");
  choose.append(make("h3", "", s.chooseTitle), make("p", "", s.versionsIntro));
  const cards = make("div", "version-cards");
  for (const letter of versionOrder()) {
    const card = make("button", "version-card");
    card.type = "button";
    card.append(make("span", "version-card-name", words.versions[letter].name),
      make("span", "version-card-text", words.versions[letter].description));
    card.addEventListener("click", () => renderReader(letter));
    cards.append(card);
  }
  const wholeButton = make("button", "button button-secondary", words.labels.wholeLease);
  wholeButton.type = "button";
  wholeButton.addEventListener("click", () => renderReader("whole"));
  const whole = make("div", "splash-whole");
  whole.append(wholeButton, make("p", "splash-note", s.wholeLease));
  choose.append(cards, whole);

  splash.replaceChildren(...parts, choose, sorting);
  document.getElementById("upload-screen").hidden = true;
  document.getElementById("reader").hidden = true;
  splash.hidden = false;
  setTabTitle(s.title);
  document.body.classList.add("reading");
  window.scrollTo(0, 0);
  splash.querySelector(".splash-title").tabIndex = -1;
  splash.querySelector(".splash-title").focus({ preventScroll: true });
}

// ---------- Upload ----------

async function readLease(file) {
  const pdfjs = await import(PDFJS_URL);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines = await LeaseEngine.linesFromPdf(doc);
  await doc.destroy();
  if (!lines.some((line) => line.text.trim())) throw new Error("The PDF has no text to read.");
  return LeaseEngine.readLease(lines, library, { preview: PREVIEW });
}

function renderUploadScreen() {
  const page = content.page;
  const screen = document.getElementById("upload-screen");
  const input = make("input", "visually-hidden");
  input.type = "file";
  input.accept = "application/pdf,.pdf";
  input.id = "lease-file";
  input.tabIndex = -1;
  input.setAttribute("aria-hidden", "true");
  const choose = make("button", "button button-primary", page.uploadButton);
  choose.type = "button";
  choose.id = "choose-button";
  choose.addEventListener("click", () => input.click());
  const status = make("p", "upload-status");
  status.setAttribute("role", "status");
  const error = make("p", "upload-error");
  error.setAttribute("role", "alert");

  input.addEventListener("change", async () => {
    const file = input.files[0];
    input.value = "";
    if (!file) return;
    error.textContent = "";
    status.textContent = page.reading;
    choose.disabled = true;
    try {
      lease = await readLease(file);
      status.textContent = "";
      showSplash();
    } catch (problem) {
      console.error("The lease could not be read.", problem);
      status.textContent = "";
      error.textContent = page.error;
    } finally {
      choose.disabled = false;
    }
  });

  const card = make("div", "upload-card");
  const buttons = make("div", "upload-buttons");
  buttons.append(choose);
  card.append(make("h2", "upload-title", page.uploadTitle), make("p", "upload-intro", page.uploadIntro), buttons,
    make("p", "privacy-note", page.privacyNote), status, error, input);
  screen.replaceChildren(card);
}

// The browser tab names the screen being shown: just the app name on the
// upload screen, then "Clause & Effect: How this works" and so on.
function setTabTitle(screenName) {
  document.title = screenName ? `${content.page.appName}: ${screenName}` : content.page.appName;
}

function goHome() {
  setTabTitle();
  lease = null;
  document.getElementById("top-links").replaceChildren();
  document.body.classList.remove("reading");
  document.getElementById("reader").hidden = true;
  document.getElementById("reader").replaceChildren();
  document.getElementById("splash").hidden = true;
  document.getElementById("upload-screen").hidden = false;
  window.scrollTo(0, 0);
  document.getElementById("choose-button").focus();
}

// ---------- Start ----------

function renderFrame() {
  const page = content.page;
  setTabTitle();
  const name = document.getElementById("app-name");
  const home = make("button", "home-button");
  home.type = "button";
  const [before, ...rest] = page.appName.split("&");
  if (rest.length) home.append(before, make("span", "amp", "&"), rest.join("&"));
  else home.textContent = page.appName;
  const label = make("span", "visually-hidden", page.homeLabel);
  label.id = "home-label";
  home.setAttribute("aria-describedby", label.id);
  home.addEventListener("click", goHome);
  name.replaceChildren(home, label);
  setText("title", page.title);
  setText("intro", page.intro);
  setText("footer-note", page.footer);
  setText("tester-code", testerCode());
  setText("draft-note", PREVIEW ? words.page.draftNote : "");
  document.getElementById("draft-note").hidden = !PREVIEW;
}

async function start() {
  try {
    const load = async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Could not load ${path} (status ${response.status})`);
      return response.json();
    };
    [content, words, library] = await Promise.all([
      load("content.json"),
      load("content-round-two.json"),
      LeaseEngine.loadLibrary(),
    ]);
    glossary = mergedGlossary();
    renderFrame();
    renderUploadScreen();
    playOpening();
  } catch (problem) {
    console.error("The page could not start.", problem);
  }
}

start();
