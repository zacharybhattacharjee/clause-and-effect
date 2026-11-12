// The hype video (hype.html): about 40 seconds, seven scenes.
// The words come from hype-video.json, content.json and
// content-round-two.json; the clause names on the cards come from
// library/clause-types.json (approved rows only). No lease text is shown.
//
// Keys: Space or a click plays, F toggles full screen, R replays.

const stage = document.getElementById("stage");
const startScreen = document.getElementById("start");
const playButton = document.getElementById("play");

// ?embed=1 means the main page is showing the video in its pop-up.
const EMBEDDED = new URLSearchParams(location.search).get("embed") === "1";

let words = null;   // everything loaded from the JSON files

// One clock runs the whole video. It counts only time the video is on
// screen: if the laptop stutters or the tab is in the background, the
// video pauses instead of letting scenes bunch up.
let cues = [];       // { t: seconds from the start, run: what to do }
let clock = 0;
let lastFrame = null;
let frame = null;

const lessMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// ---------- Scaling the 1600 x 900 stage to fit the window ----------

function fitStage() {
  const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
  document.documentElement.style.setProperty("--s", String(scale));
}
window.addEventListener("resize", fitStage);
fitStage();

// ---------- Gray bars standing in for text ----------

// The same "random" widths every time, so every playback looks alike.
let seed = 7;
function nextWidth(min, max) {
  seed = (seed * 9301 + 49297) % 233280;
  return Math.round(min + (seed / 233280) * (max - min));
}

function bars(count, min = 62, max = 100) {
  return Array.from({ length: count }, (_, i) => {
    const bar = make("div", "bar");
    // The last bar of a paragraph is shorter, like a real last line.
    bar.style.width = `${i === count - 1 ? nextWidth(30, 60) : nextWidth(min, max)}%`;
    return bar;
  });
}

function fakePage() {
  const page = make("div", "page");
  for (let p = 0; p < 4; p++) {
    const head = make("div", "bar head");
    head.style.width = `${nextWidth(28, 52)}%`;
    page.append(head, ...bars(nextWidth(4, 7), 80, 100));
  }
  return page;
}

// ---------- The logo, typed like the main page's opening screen ----------

// Builds the logo and returns how long its typing takes, in seconds.
function typedLogo(name, { small = false, typed = true } = {}) {
  const logo = make("p", small ? "logo small" : "logo");
  const step = 0.07;
  let delay = 0.1;
  const letters = (text) => [...text.trim()].map((letter) => {
    const span = make("span", typed ? "logo-letter" : "", letter);
    if (typed) span.style.animationDelay = `${delay}s`;
    delay += typed ? step : 0;
    return span;
  });
  const [before, ...rest] = name.split("&");
  logo.append(...letters(before));
  if (rest.length) {
    const amp = make("span", "logo-amp", "&");
    if (typed) delay += 0.12;
    amp.style.setProperty("--d", `${delay}s`);
    if (typed) delay += 0.35;
    logo.append(amp, ...letters(rest.join("&")));
    delay += 0.2;
    amp.style.setProperty("--sweep", `${delay}s`);
    delay += 0.55;
  }
  return { logo, length: delay };
}

// ---------- Building the scenes ----------

function scene(className) {
  const el = make("section", `scene ${className}`);
  stage.append(el);
  return el;
}

function build() {
  stage.replaceChildren();
  seed = 7;
  const { lines, labels, versions, tiers, cards, appName, appTitle } = words;
  const s = {};

  // 1. One line on cream.
  s.opening = scene("scene-opening");
  s.openingLine = make("p", "big-line rise", lines.opening);
  s.opening.append(s.openingLine);

  // 2. Pages of fine print, and a signature.
  s.print = scene("scene-print");
  s.wall = make("div", "wall");
  for (let c = 0; c < 4; c++) {
    const col = make("div", "wall-col");
    for (let p = 0; p < 9; p++) col.append(fakePage());
    s.wall.append(col);
  }
  s.printCard = make("div", "print-card");
  s.finePrint = make("p", "big-line rise", lines.finePrint);
  s.signature = make("div", "signature rise");
  s.signature.innerHTML = `
    <svg viewBox="0 0 520 120" aria-hidden="true">
      <path class="ink" pathLength="1" d="M40 82 C 52 30, 70 18, 78 44 C 86 70, 70 96, 62 80 C 56 66, 96 40, 112 58 C 124 72, 128 82, 140 62 C 150 44, 160 46, 162 66 C 164 84, 178 78, 190 56 C 200 38, 212 40, 214 60 C 216 80, 232 74, 246 52 C 256 36, 268 44, 268 62 C 268 78, 286 72, 300 54 C 316 34, 334 30, 346 50 C 356 66, 372 70, 396 52 C 420 34, 448 38, 480 44"/>
      <line class="rule" x1="20" y1="104" x2="500" y2="104"/>
    </svg>`;
  s.signature.append(make("p", "signature-caption", lines.signature));
  s.printCard.append(s.finePrint, s.signature);
  s.print.append(s.wall, s.printCard);

  // 3. The two questions, over the stopped fine print.
  s.questions = scene("scene-questions");
  const card = make("div", "question-card");
  const questionLine = (text, markClass) => {
    const line = make("p", "big-line rise");
    const mark = make("span", markClass, text);
    line.append(mark);
    return { line, mark };
  };
  s.push = questionLine(lines.push, "mark-gold");
  s.cost = questionLine(lines.cost, "mark-brick");
  card.append(s.push.line, s.cost.line);
  s.questions.append(card);

  // 4. The logo (typed when its cue comes), on the dark plum band with
  // fine print drifting behind, like the site's upload screen.
  s.logo = scene("scene-logo scene-dark");
  s.logoBox = make("div", "logo-box");
  s.logo.append(drift(), s.logoBox);

  // 5. The three versions.
  s.versions = scene("scene-versions");
  // The site's top row: the logo on the left, its links on the right.
  s.appTop = make("div", "app-top rise");
  const miniLogo = make("p", "mini-logo");
  const [before, ...after] = appName.split("&");
  miniLogo.append(before.trim(), make("span", "mini-amp", "&"), after.join("&").trim());
  const links = make("div", "app-links");
  links.append(...[labels.howItWorks, labels.watchVideo, labels.printPage].map((text) => make("span", "", text)));
  s.appTop.append(miniLogo, links);
  s.switcher = make("div", "switcher rise");
  s.pill = make("span", "switch-pill");
  s.switcher.append(s.pill);
  s.switches = ["A", "B", "C"].map((key) => {
    const button = make("span", "switch", versions[key].name);
    s.switcher.append(button);
    return button;
  });
  s.description = make("p", "description");
  s.layouts = make("div", "layouts");
  s.layoutA = layoutA(cards, labels);
  s.layoutB = layoutB(cards, labels);
  s.layoutC = layoutC(cards, labels, tiers);
  s.layouts.append(s.layoutA, s.layoutB, s.layoutC);
  s.pointer = make("div", "pointer");
  s.pointer.innerHTML = `
    <svg viewBox="0 0 20 26" aria-hidden="true">
      <path d="M2 1 L2 20 L7 15.5 L10.5 23.5 L14 22 L10.6 14.2 L17 14 Z" fill="#3B2340" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`;
  s.versions.append(s.appTop, s.switcher, s.description, s.layouts, s.pointer);

  // 6. The design question, a few words at a time.
  s.design = scene("scene-design");
  const question = make("p", "question");
  s.words = [];
  s.marks = [];
  lines.question.split(" ").forEach((word, i, all) => {
    const bare = word.replace(/[^\p{L}]/gu, "").toLowerCase();
    const span = make("span", "word");
    const markClass = bare === words.highlights.gold ? "mark-gold"
      : bare === words.highlights.brick ? "mark-brick" : "";
    if (markClass) {
      const mark = make("span", markClass, word);
      span.append(mark);
      s.marks.push(mark);
    } else {
      span.textContent = word;
    }
    question.append(span);
    if (i < all.length - 1) question.append(" ");
    s.words.push(span);
  });
  s.design.append(question);

  // 7. Logo and credit, back on the dark plum band.
  s.end = scene("scene-end scene-dark");
  s.endLogo = make("div", "rise");
  s.credit = make("p", "credit rise", lines.credit);
  s.end.append(drift(), s.endLogo, s.credit);
  s.appName = appName;
  s.appTitle = appTitle;
  return s;
}

// Pages of fine print drifting slowly upward behind a dark scene, like
// the site's upload screen. Gray bars only, no lease text.
function drift() {
  const layer = make("div", "drift");
  for (let c = 0; c < 5; c++) {
    const column = make("div", "drift-col");
    for (let p = 0; p < 4; p++) column.append(fakePage());
    layer.append(column);
  }
  return layer;
}

function layoutA(cards, labels) {
  const layout = make("div", "layout layout-a");
  cards.slice(0, 2).forEach((clause, i) => {
    const pair = make("div", "card pair rise");
    pair.style.setProperty("--i", String(i + 1));
    const doc = make("div", "doc");
    doc.append(make("p", "label", labels.leaseSays), make("p", "card-title", clause.name), ...bars(3));
    const meaning = make("div", "meaning");
    meaning.append(make("p", "label", labels.whatItMeans), ...bars(3, 70, 95));
    pair.append(doc, meaning);
    layout.append(pair);
  });
  return layout;
}

function layoutB(cards, labels) {
  const layout = make("div", "layout layout-b");
  cards.forEach((clause, i) => {
    const card = make("div", "card ask-card rise");
    card.style.setProperty("--i", String(i + 1));
    const box = make("div", "ask-box");
    box.append(make("p", "label", labels.whatToAsk), ...bars(3, 70, 100));
    card.append(make("span", "tag", labels.flag), make("p", "card-title", clause.name), ...bars(2), box);
    layout.append(card);
  });
  return layout;
}

function layoutC(cards, labels, tiers) {
  const layout = make("div", "layout layout-c");
  [...cards].sort((a, b) => a.tier - b.tier).forEach((clause, i) => {
    const card = make("div", "card risk-card rise");
    card.style.setProperty("--i", String(i + 1));
    const middle = make("div");
    middle.append(make("p", "card-title", clause.name), ...bars(1, 80, 90));
    card.append(
      make("span", `badge tier-${clause.tier}`, tiers[clause.tier].name),
      middle,
      make("span", "more", labels.showLeaseWords),
    );
    layout.append(card);
  });
  return layout;
}

// ---------- Playing ----------

function at(seconds, action) {
  cues.push({ t: seconds, run: action });
  cues.sort((a, b) => a.t - b.t);
}

function tick(now) {
  // A long gap between frames means the video wasn't on screen, so the
  // clock moves on by at most a tenth of a second.
  if (lastFrame !== null) clock += Math.min(now - lastFrame, 100) / 1000;
  lastFrame = now;
  while (cues.length && cues[0].t <= clock) cues.shift().run();
  frame = cues.length ? requestAnimationFrame(tick) : null;
}

const on = (el) => el.classList.add("on");
const off = (el) => el.classList.remove("on");
const reveal = (el) => el.classList.add("in");

// Slide the pill under a version's name, with the pointer clicking it.
function chooseVersion(s, index, key, layout) {
  const button = s.switches[index];
  const switcherBox = s.switcher.offsetTop;
  // The pointer clicks just past the end of the name, so it never
  // covers the letters.
  s.pointer.style.setProperty("--x", `${s.switcher.offsetLeft + button.offsetLeft + button.offsetWidth - 26}px`);
  s.pointer.style.setProperty("--y", `${switcherBox + button.offsetTop + button.offsetHeight * 0.62}px`);
  s.pointer.classList.add("shown");
  const clickDelay = lessMotion() ? 0 : 0.75;
  at(clock + clickDelay, () => {
    s.pointer.classList.add("pressing");
    setTimeout(() => s.pointer.classList.remove("pressing"), 140);
    s.switches.forEach((b, i) => b.classList.toggle("chosen", i === index));
    s.pill.style.width = `${button.offsetWidth}px`;
    s.pill.style.height = `${button.offsetHeight}px`;
    s.pill.style.transform = `translate(${button.offsetLeft}px, ${button.offsetTop}px)`;
    s.pill.classList.add("placed");
    s.description.classList.add("fading");
    [s.layoutA, s.layoutB, s.layoutC].forEach((l) => {
      if (l !== layout) {
        l.classList.remove("in");
        l.querySelectorAll(".rise").forEach((r) => r.classList.remove("in"));
      }
    });
  });
  at(clock + clickDelay + 0.3, () => {
    s.description.textContent = words.versions[key].description;
    s.description.classList.remove("fading");
    layout.classList.add("in");
    layout.querySelectorAll(".rise").forEach(reveal);
  });
}

function play() {
  if (frame) cancelAnimationFrame(frame);
  cues = [];
  clock = 0;
  lastFrame = null;
  const s = build();
  document.body.classList.add("playing");
  startScreen.classList.add("gone");

  // 1. Opening line (0–4 s)
  at(0.0, () => on(s.opening));
  at(0.4, () => reveal(s.openingLine));
  at(3.5, () => off(s.opening));

  // 2. Fine print and a signature (4–9 s)
  at(4.0, () => on(s.print));
  at(4.9, () => reveal(s.finePrint));
  at(6.3, () => reveal(s.signature));
  at(6.7, () => s.signature.classList.add("signed"));
  at(8.7, () => s.printCard.classList.add("gone"));
  at(9.0, () => s.wall.classList.add("frozen"));

  // 3. The two questions (9–15 s)
  at(9.3, () => on(s.questions));
  at(9.5, () => reveal(s.push.line));
  at(10.3, () => reveal(s.push.mark));
  at(11.6, () => reveal(s.cost.line));
  at(12.4, () => reveal(s.cost.mark));
  at(14.6, () => { off(s.print); off(s.questions); });

  // 4. The logo (15–19 s)
  at(15.0, () => {
    const { logo, length } = typedLogo(s.appName, { typed: !lessMotion() });
    const line = make("p", "logo-line rise", s.appTitle);
    s.logoBox.replaceChildren(logo, line);
    on(s.logo);
    at(clock + length + 0.1, () => reveal(line));
  });
  at(18.8, () => off(s.logo));

  // 5. The three versions (19–31 s)
  at(19.2, () => on(s.versions));
  at(19.3, () => { reveal(s.appTop); reveal(s.switcher); });
  at(19.7, () => chooseVersion(s, 0, "A", s.layoutA));
  at(23.5, () => chooseVersion(s, 1, "B", s.layoutB));
  at(27.3, () => chooseVersion(s, 2, "C", s.layoutC));
  at(30.6, () => s.pointer.classList.remove("shown"));
  at(30.8, () => off(s.versions));

  // 6. The design question (31–37 s)
  at(31.2, () => on(s.design));
  const step = lessMotion() ? 0 : 0.09;
  s.words.forEach((word, i) => at(31.4 + i * step, () => reveal(word)));
  const wordsDone = 31.4 + s.words.length * step;
  s.marks.forEach((mark, i) => at(wordsDone + 0.3 + i * 0.6, () => reveal(mark)));
  at(37.1, () => off(s.design));

  // 7. Logo and credit, held (37–40 s)
  at(37.4, () => {
    const { logo } = typedLogo(s.appName, { small: true, typed: false });
    logo.querySelector(".logo-amp").style.setProperty("--sweep", "0.6s");
    s.endLogo.replaceChildren(logo);
    on(s.end);
    reveal(s.endLogo);
  });
  at(38.3, () => reveal(s.credit));
  at(40.0, () => document.body.classList.remove("playing"));
  frame = requestAnimationFrame(tick);
}

// ---------- Keys and start ----------

function toggleFullScreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
}

window.addEventListener("keydown", (event) => {
  if (!words || event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === "f") toggleFullScreen();
  else if (key === "r") play();
  else if (key === " " && !startScreen.classList.contains("gone")) {
    event.preventDefault();
    play();
  }
});

playButton.addEventListener("click", play);

// ---------- Loading the words ----------

async function load() {
  const get = (path) => fetch(path).then((r) => {
    if (!r.ok) throw new Error(path);
    return r.json();
  });
  const [hype, content, roundTwo, library] = await Promise.all([
    get("hype-video.json"),
    get("content.json"),
    get("content-round-two.json"),
    get("library/clause-types.json"),
  ]);
  const approved = library.types.filter((t) => t.status === "Approved" && t.tier);
  const cards = hype.clauseCards
    .map((id) => approved.find((t) => t.id === id))
    .filter(Boolean);
  words = {
    ...hype,
    labels: roundTwo.labels,
    versions: roundTwo.versions,
    tiers: roundTwo.tiers,
    cards,
    appName: content.page.appName,
    appTitle: content.page.title,
  };
  document.title = hype.pageTitle;
  document.getElementById("start-logo").textContent = words.appName;
  document.getElementById("start-hint").textContent = hype.startHint;
  playButton.textContent = hype.playButton;

  // Opened on its own (not in the main page's pop-up), the start screen
  // links back to the tool, keeping link settings such as ?t= and ?order=.
  if (!EMBEDDED) {
    const back = document.getElementById("back-link");
    back.textContent = hype.backLink;
    back.href = `index.html${location.search}`;
    back.hidden = false;
  }
  playButton.disabled = false;
  playButton.focus();
}

load().catch((error) => {
  // The words couldn't load, usually because the page was opened straight
  // from the Finder. This one note can't come from the JSON files.
  document.getElementById("start-hint").textContent =
    "The video's words didn't load. Open this page from the GitHub Pages site instead of from the Finder.";
  console.error(error);
});
