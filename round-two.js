// Clause & Effect, round 2 test page.
// The engine (engine.js) reads the uploaded lease and sorts every section.
// This page shows the result in three versions. It includes draft rows from
// the library, and shows one "Draft" note at the top. The live page
// (index.html) is unchanged and never reads draft rows.
// Every word comes from content.json, content-round-two.json or the library.
// The lease is read in this browser and never sent anywhere or kept.

const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

let content = null;   // content.json: approved page wording
let words = null;     // content-round-two.json: round 2 wording, some of it draft
let library = null;   // the engine's library, made from the workbook
let lease = null;     // the engine's reading of the uploaded lease
let glossary = [];    // word meanings, from content.json and the library

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
function toggle(showLabel, hideLabel, panel, className = "button button-secondary toggle-button") {
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
    button.textContent = opening ? hideLabel : showLabel;
  });
  return button;
}

// The lease's numbers aren't filled in yet, so a blank in braces such as
// {days} shows the stand-in words instead, pointing to the lease.
function sentence(text) {
  return (text || "").replace(/\{\w+\}/g, words.labels.blankNumber);
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

// ---------- Word meanings ----------

// The glossary from content.json, plus the library's, without repeats.
function mergedGlossary() {
  const seen = new Set();
  const all = [];
  for (const entry of [...(content.glossary || []), ...(library.glossary || [])]) {
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

// Lease text with each glossary word underlined the first time it appears.
// Tapping a word opens its meaning just below the line.
function withMeanings(text) {
  const found = glossary
    .map((entry) => ({ entry, ...firstMatch(text, entry.words) }))
    .filter((m) => m.start !== undefined)
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const pieces = [];
  let position = 0;
  for (const { entry, start, end } of found) {
    if (start < position) continue;
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

function leaseWords(section) {
  const panel = make("div", "lease-text");
  const paragraph = make("p");
  paragraph.append(...withMeanings(section.text));
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

// The tier mark: its name, never color alone. Clicking it explains the scale.
function tierMark(tier) {
  const key = tierKey(tier);
  const mark = make("button", `tier-mark tier-${key}`, tierName(key));
  mark.type = "button";
  mark.setAttribute("aria-haspopup", "dialog");
  mark.addEventListener("click", () => openTierDialog(mark));
  return mark;
}

function tierScale() {
  const list = make("dl", "tier-scale");
  for (const key of ["1", "2", "3"]) {
    const name = make("dt");
    name.append(make("span", `tier-chip tier-${key}`, words.tiers[key].name));
    list.append(name, make("dd", "", words.tiers[key].meaning));
  }
  const notSet = make("dt");
  notSet.append(make("span", "tier-chip tier-not-set", words.tiers.notSet));
  list.append(notSet, make("dd", "", words.tiers.notSetMeaning));
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

// ---------- One section ----------

// "Section 13 · ASSIGNMENT – SUBLEASING". The text before the first
// section, such as the lease's title, is "Start of the lease".
function sectionTitle(section) {
  if (!section.number && !section.heading) return words.labels.startOfLease;
  const label = section.number ? `${words.labels.section} ${section.number}` : "";
  return [label, section.heading].filter(Boolean).join(" · ");
}

function allVersions(section) {
  return section.matches.flatMap((match) => match.versions.map((found) => ({ ...found, type: match.type })));
}

const isFlag = (found) => found.flag && found.ask;

function proofExample(version) {
  if (!version || !version.example) return null;
  const box = make("figure", "proof");
  box.append(make("figcaption", "proof-label", words.labels.realExample));
  box.append(make("blockquote", "proof-quote", version.example));
  const source = make("p", "proof-source");
  const url = (version.exampleSource.match(/https?:\/\/\S+/) || [])[0];
  const name = version.exampleSource.replace(/https?:\/\/\S+/, "").replace(/[.\s]+$/, "");
  source.append(name);
  if (url) {
    source.append(" ");
    const link = make("a", "", url.replace(/^https?:\/\//, "").split("/")[0]);
    link.href = url;
    link.rel = "noopener";
    source.append(link);
  }
  box.append(source);
  const fromDataset = /Leivaditi/i.test(version.exampleSource);
  box.append(make("p", "proof-note", fromDataset ? words.labels.datasetCredit : words.labels.proofLine));
  return box;
}

// The flag-to-ask chain: the ask, why, the words to propose with proof,
// the fallback, and the next step.
function askBlock(found, { open = false } = {}) {
  const ask = found.ask;
  const box = make("div", "ask-block");
  const heading = make("h4", "ask-heading");
  heading.append(make("span", "flag-mark", words.labels.flag), " ", words.labels.whatToAsk);
  box.append(heading, make("p", "ask-plain", ask.plainAsk));

  if (ask.why) {
    const why = make("p", "ask-why");
    why.append(make("strong", "", `${words.labels.whyYouCanAsk}: `), ask.why);
    box.append(why);
  }

  const proposal = make("div", "proposal");
  proposal.append(make("p", "legal-caution", words.labels.legalCaution));
  if (ask.legalWording) proposal.append(make("p", "legal-wording", ask.legalWording));
  const proof = proofExample(found.askFor);
  if (proof) proposal.append(proof);
  if (ask.legalWording || proof) {
    const button = toggle(words.labels.wordsToPropose, words.labels.wordsToPropose, proposal, "text-toggle");
    box.append(button, proposal);
    if (open) button.click();
  }

  if (found.fallback) {
    const fallback = make("div", "fallback");
    fallback.append(make("h5", "", words.labels.ifTheySayNo), make("p", "", sentence(found.fallback.plain)));
    box.append(fallback);
  }
  if (ask.nextStep) {
    const next = make("p", "ask-next");
    next.append(make("strong", "", `${words.labels.nextStep}: `), ask.nextStep);
    box.append(next);
  }
  return box;
}

// What a section means: its clause type, and each version it matches.
function explanation(section, version) {
  const box = make("div", "explanation");
  if (section.status === "unsure") box.append(make("p", "unsure-line", words.labels.unsureLine));
  for (const match of section.matches) {
    if (match.type.name) box.append(make("h4", "type-name", match.type.name));
    const versions = match.versions;
    for (const found of versions) {
      const line = make("div", "version-line");
      if (found.goodForYou) line.append(make("span", "good-mark", words.labels.goodForYou));
      line.append(make("p", "", sentence(found.version.plain)));
      box.append(line);
      if (isFlag(found)) box.append(askBlock(found, { open: version === "B" }));
    }
  }
  return box;
}

function sectionCard(section, version) {
  const card = make("article", `section-card version-${version}`);
  card.dataset.tier = tierKey(section.tier);
  const top = make("div", "card-top");
  top.append(make("h3", "section-title", sectionTitle(section)), tierMark(section.tier));
  card.append(top);

  if (version === "C") {
    // Risk summary first: the explanation, with the lease's words one click away.
    card.append(explanation(section, version));
    const text = leaseWords(section);
    card.append(toggle(words.labels.showLeaseWords, words.labels.hideLeaseWords, text), text);
    return card;
  }

  // Lease text first (A) and What to ask first (B): side by side on a laptop.
  const lease_ = make("div", "column column-lease");
  lease_.append(make("h4", "column-label", words.labels.leaseSays), leaseWords(section));
  const meaning = make("div", "column column-meaning");
  meaning.append(make("h4", "column-label", words.labels.whatItMeans), explanation(section, version));
  const columns = make("div", "columns");
  columns.append(...(version === "A" ? [lease_, meaning] : [meaning, lease_]));
  card.append(columns);
  return card;
}

function unsortedCard(section) {
  const card = make("article", "section-card unsorted-card");
  card.append(make("h3", "section-title", sectionTitle(section)), leaseWords(section));
  return card;
}

// ---------- A version ----------

const hasFlag = (section) => allVersions(section).some(isFlag);

// Tier groups, highest stakes first, then sections the tool couldn't sort.
// "What to ask first" puts flagged sections first within each tier.
function groupsFor(version) {
  const { sorted, notSorted } = LeaseEngine.inTierOrder(lease.sections);
  const groups = TIER_GROUPS.map((key) => {
    let sections = sorted.filter((section) => tierKey(section.tier) === key);
    if (version === "B") sections = [...sections.filter(hasFlag), ...sections.filter((s) => !hasFlag(s))];
    return { key, title: tierName(key), sections };
  }).filter((group) => group.sections.length);
  if (notSorted.length) groups.push({ key: "unsorted", title: words.labels.notSortedTitle, sections: notSorted });
  return groups;
}

function versionNotes(version) {
  const notes = make("div", "version-notes");
  notes.append(make("p", "governs-note", content.page.governsSample), make("p", "", content.page.youMeans));
  if (version === "B") notes.append(make("p", "flag-line", words.versions.B.flagLine));
  notes.append(make("p", "", content.page.glossaryHint));
  return notes;
}

function renderVersion(letter) {
  const version = words.versions[letter];
  const section = make("section", "version-view");
  const heading = make("h2", "version-heading", version.name);
  heading.tabIndex = -1;
  section.append(heading, make("p", "version-description", version.description), versionNotes(letter));

  for (const group of groupsFor(letter)) {
    const block = make("section", `tier-group group-${group.key}`);
    block.id = `group-${group.key}`;
    block.dataset.trackerLabel = group.title;
    const title = make("h2", "group-title");
    if (group.key === "unsorted") {
      title.textContent = group.title;
      block.append(title, make("p", "group-intro", words.labels.notSortedIntro));
      for (const s of group.sections) block.append(unsortedCard(s));
    } else {
      title.append(make("span", `tier-chip tier-${group.key}`, group.title));
      block.append(title);
      for (const s of group.sections) block.append(sectionCard(s, letter));
    }
    section.append(block);
  }
  const list = askList();
  if (list) section.append(list);
  return section;
}

// The whole lease in its own order, each section with its tier.
function renderWholeLease() {
  const section = make("section", "version-view whole-lease");
  const heading = make("h2", "version-heading", words.labels.wholeLease);
  heading.tabIndex = -1;
  section.append(heading);
  for (const piece of lease.sections) {
    const card = make("article", "section-card");
    const top = make("div", "card-top");
    top.append(make("h3", "section-title", sectionTitle(piece)));
    if (piece.status !== "not-sorted") top.append(tierMark(piece.tier));
    card.append(top, leaseWords(piece));
    section.append(card);
  }
  return section;
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
  box.append(make("p", "legal-caution", words.labels.legalCaution));
  const list = make("ol", "ask-items");
  for (const { section, found } of items) {
    const item = make("li", "ask-item");
    const title = make("div", "ask-item-top");
    title.append(make("h3", "", sectionTitle(section)), tierMark(section.tier));
    item.append(title, make("p", "ask-plain", found.ask.plainAsk));
    const add = (label, text, className) => {
      if (!text) return;
      const line = make("p", className);
      line.append(make("strong", "", `${label}: `), text);
      item.append(line);
    };
    add(words.labels.whyYouCanAsk, found.ask.why, "ask-why");
    add(words.labels.wordsToPropose, found.ask.legalWording, "legal-wording");
    if (found.askFor && found.askFor.example) {
      const proof = proofExample(found.askFor);
      item.append(proof);
    }
    if (found.fallback) add(words.labels.ifTheySayNo, sentence(found.fallback.plain), "fallback-line");
    add(words.labels.nextStep, found.ask.nextStep, "ask-next");
    list.append(item);
  }
  box.append(list);

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
  buildTracker(built);
  window.scrollTo(0, 0);
  built.querySelector(".version-heading").focus({ preventScroll: true });
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
  const back = make("button", "button button-secondary", words.labels.howItWorks);
  back.type = "button";
  back.addEventListener("click", () => showSplash());
  const printPage = make("button", "button button-secondary", words.labels.printPage);
  printPage.type = "button";
  printPage.addEventListener("click", () => {
    document.body.classList.add("print-page");
    window.print();
  });
  tools.append(back, printPage);

  const nav = make("nav", "tracker");
  nav.id = "tracker";
  nav.setAttribute("aria-label", words.labels.onThisPage);

  bar.append(switcher, tools, nav);
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
  const parts = [make("h2", "splash-title", s.title), make("p", "splash-lead", s.whatItIs)];

  const sorting = make("section", "splash-part");
  sorting.append(make("h3", "", s.sortingTitle), make("p", "", s.sorting));
  const groups = make("p", "splash-groups");
  for (const key of ["1", "2", "3"]) groups.append(make("span", `tier-chip tier-${key}`, words.tiers[key].name), " ");
  groups.append(make("span", "tier-chip tier-unsorted", words.labels.notSortedTitle));
  sorting.append(groups);

  const scale = make("section", "splash-part");
  scale.append(make("h3", "", s.scaleTitle), tierScale());

  const versions = make("section", "splash-part");
  versions.append(make("h3", "", s.versionsTitle), make("p", "", s.versionsIntro));
  const list = make("ul", "splash-versions");
  for (const letter of versionOrder()) {
    const item = make("li");
    item.append(make("strong", "", words.versions[letter].name), make("span", "", ` ${words.versions[letter].description}`));
    list.append(item);
  }
  versions.append(list);

  const whole = make("section", "splash-part");
  whole.append(make("h3", "", s.wholeLeaseTitle), make("p", "", s.wholeLease));

  const choose = make("section", "splash-part splash-choose");
  choose.append(make("h3", "", s.chooseTitle));
  const buttons = make("div", "splash-buttons");
  for (const letter of versionOrder()) {
    const button = make("button", "button button-primary", words.versions[letter].name);
    button.type = "button";
    button.addEventListener("click", () => renderReader(letter));
    buttons.append(button);
  }
  const wholeButton = make("button", "button button-secondary", words.labels.wholeLease);
  wholeButton.type = "button";
  wholeButton.addEventListener("click", () => renderReader("whole"));
  buttons.append(wholeButton);
  choose.append(buttons);

  splash.replaceChildren(...parts, sorting, scale, versions, whole, choose);
  document.getElementById("upload-screen").hidden = true;
  document.getElementById("reader").hidden = true;
  splash.hidden = false;
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
  return LeaseEngine.readLease(lines, library, { preview: true });
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

function goHome() {
  lease = null;
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
  document.title = `${page.appName}: ${words.splash.title}`;
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
  setText("draft-note", words.page.draftNote);
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
  } catch (problem) {
    console.error("The page could not start.", problem);
  }
}

start();
