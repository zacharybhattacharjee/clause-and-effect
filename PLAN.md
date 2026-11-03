# Build plan: Lease reader prototype

Status: draft for Zachary to review. No page code is written yet.

## What we are building

One web page for a live class demo. You upload the standard form lease PDF, and the page shows its key clauses in three versions: "Version 1", "Version 2" and "Version 3".

- **No AI.** The page reads the PDF on your own computer, in the browser. The PDF is never sent anywhere or saved.
- **How it finds clauses.** For each clause, `content.json` lists the first and last words of the excerpt. The page finds those words in the PDF and shows the text between them, exactly as the PDF has it.
- **Where everything else comes from.** The plain-language lines, card lines and types come from `content.json`. The ranks and asks come from `clause-types.json`.
- **The limit.** It works for the GBREB Standard Form Commercial Lease, or a lease using the same wording. Say so when you demo it.

## What I found in your PDF

- It has 4 pages, and the text can be selected, so a browser can read it.
- Sections 6B, 13 and 19 are all there. The form also has 6A (tax increases) and 23 (condition of the premises), which match two of your types: `taxes` and `condition`.
- The margin headings, such as "13. ASSIGNMENT – SUBLEASING", come out apart from the section text. That's why the page searches for the section's own words, not its heading.
- Some words are split across lines with a hyphen ("mate-rials"), and the (a), (b), (c) labels in section 19 come out out of order. The page handles the hyphens. The excerpts should start after those labels.
- The blanks in this copy are empty, so excerpts show gaps where the form says "fill in".

## Questions for you before I start

Each question has my suggestion. Say yes, or tell me what you want instead.

1. **The privacy note is now wrong. You need to rewrite it.** `page.privacyNote` says the lease is sent to Anthropic's AI service, and that's no longer true. Suggestion: something like "Your lease stays on this computer. The page reads it here and does not send or keep it." Until you change it, I leave the note off the page.
2. **The words that find each clause.** In step 0, I'll copy suggested first and last words for 6B, 13 and 19 from your PDF. You approve them, and I add them to `content.json`, with new fields such as `findStart` and `findEnd` on each clause.
3. **Add 6A and 23?** They'd show tax increases and the condition of the space. Suggestion: not for the first build. You'd have to write their plain-language lines first, and three clauses are enough to test the idea.
4. **When the uploaded text differs from the standard form.** This matters for your design question: if a lease was negotiated, your prepared plain-language lines may no longer fit. Suggestion: once you paste the standard excerpt into a clause's `legalText`, the page compares it with the uploaded text. If they differ, it shows `page.excerptWarning`. The current wording ("The quoted text did not match the lease word for word") would need a small rewrite to fit.
5. **pdf.js, Mozilla's free PDF reader.** The page needs it to read PDFs. Suggestion: load it from a public code library (cdnjs) at a fixed version. The other choice is to copy its files into the repo, so the demo doesn't depend on that site.
6. **Fonts.** Google Fonts sets no cookies, but each visitor's browser asks Google for the font files, so Google sees their IP address. Suggestion: use Google Fonts as `CLAUDE.md` says.
7. **Tester label in the footer.** `content.json` has no label word for it, such as "Tester:". Suggestion: show the code alone, small, after the footer line (for example "R1").
8. **The button on Version 3 cards.** The only button words in the file are `showLeaseText` and `hideLeaseText`, which don't mention the plain-language lines. Suggestion: you add `page.showDetails` and `page.hideDetails` with your wording. Until then I use the two that exist.
9. **Where the notes at the top go.** Suggestion: Versions 2 and 3 show `governsSample`, then `youMeans`, then the risk scale line (`tags.consequence.scale`). Version 1 (A) shows none of them, since it has no explanations.
10. **Plain-language color.** Slate text on a slate tint would likely fail the contrast rule. Suggestion: plum text on a light slate tint, with a slate bar down the left edge.
11. **A clause whose `type` isn't in `clause-types.json`.** Suggestion: show it with no risk mark and no negotiable tag. In Version C it goes last.
12. **Who does the asking.** The negotiable wording now says when ("before you sign"), how ("in writing") and whom ("the landlord"). It doesn't say a lawyer or broker can ask for you. Suggestion: leave that out, and watch whether testers ask "who?".

## How the page works, in plain words

1. **Upload screen:** the title, intro, a "Choose a lease" button and "Use the sample lease instead". These words all come from `content.json`.
2. **Reading:** after you choose the PDF, the page shows `page.reading` while it reads. That should take seconds.
3. **Results:** the three versions, with the lease text taken from your PDF. Clauses it couldn't find are listed under `page.notFoundTitle`. A button (`page.startOver`) goes back to the upload screen.
4. **Order:** the page sorts clauses by your ranks in `clause-types.json`. Risk numbers count only the clauses shown, so the sample gives 1 Highest risk (defaults), 2 High risk (subletting) and 3 Moderate risk (building costs).
5. **Hidden fields:** note fields such as `status` and `legalTextNote` never show. Neither does `page.governs`, which says an AI wrote the explanations.

## Steps

I stop after each step so you can check it. Once you say it's right, I commit it and push it to GitHub.

To look at the page on your Mac, run this in the project folder, then open http://localhost:8000. Opening `index.html` directly won't work.

```bash
python3 -m http.server 8000
```

I check every step at phone width and laptop width before handing it to you.

### Step 0: Test reading your PDF (nothing added to the page)

- **What I do:**
  - Use pdf.js in my own browser window to read your PDF, and check that it finds 6B, 13 and 19.
  - Check what happens with blanks that are filled in. If filled-in blanks don't come through, I tell you before we go further.
  - Suggest the first and last words for each excerpt (question 2).
  - Add `*.pdf` to `.gitignore`, so a lease PDF can't be committed by accident.
- **What you check:** you approve the excerpt words. If the test fails, we rethink before building anything.

### Step 1: Page frame, colors and type

- **What I build:** the cream background, plum text, the two fonts, the title and intro, and the footer.
- **What you check:** the page looks calm and finished on your phone and laptop.

### Step 2: Version A (as written)

- **What I build:** each clause's heading and lease text, in lease order, on a white panel that looks like a document. This uses the sample content for now. Clauses with no lease text show `[Lease excerpt goes here]` in gray.
- **What you check:** it reads like the lease itself.

### Step 3: Upload screen and reading the PDF

This is how the demo starts: upload the lease, and Version 1 shows its clauses as written.

- **What I build:** the upload screen, the reading message, filling the lease text from your PDF, the "Not found" list, the error message, the start-over button, and the sample-lease button.
- **What you check:**
  - Upload your standard form PDF and confirm each box in Version 1 shows the right clause text.
  - Try a PDF that isn't the form, and a scanned PDF if you have one.

### Step 4: Version 2 (B, plain language and marks)

- **What I build:** the clauses in lease order, with plain-language lines, the risk mark (for example "1 Highest risk"), the "Ask before you sign" tag, the asks, and the notes from question 9.
- **What you check:** you can tell at a glance what to push on and what costs the most.

### Step 5: Version 3 (C, most serious first)

- **What I build:** short cards ordered by risk, each with its short heading, card line, risk mark, "why" line, tag and asks. A button opens the plain-language lines and lease text.
- **What you check:** the order makes sense, and opening and closing a card feels clear.

**Until step 6,** the page stacks the finished versions one after another, so you can compare them.

### Step 6: Version switcher and link settings

- **What I build:**
  - The three "Version" buttons. One version shows at a time, and switching scrolls to the top.
  - `?order=`, for example `?order=CAB`. Bad values fall back to "ABC".
  - `?t=`, a short tester code shown in the footer.
- **What you check:** try `?order=CAB&t=R1` and `?order=XYZ`, and switch versions using only the keyboard (Tab, then Enter).

### Step 7: Put it on GitHub Pages and rehearse the demo

- **What happens:** GitHub Pages has to be turned on for `lease-reader`, which changes a repo setting. I'll ask before I do it, or you can do it yourself in Settings, under Pages. Then we test the live link on the laptop and browser you'll use in class.
- **For demo day:** keep the PDF on the laptop's desktop, not only in OneDrive. "Use the sample lease instead" is your backup if anything goes wrong.

### Step 8: See the whole lease (planned, not built)

Status: waiting for your answers to the questions below. No page code is written for this step.

**What it does.** After you upload the lease, a button under the version switcher opens the real pages of your PDF, drawn in the browser. The three key clauses are marked with the same gold highlighter stroke as the "&" in the logo. Each clause in Versions 1 to 3 gets a button that opens the whole lease at its highlighted spot.

**What I tested.** I drew your PDF in my own browser window with pdf.js, the PDF reader the page already uses, and marked 6B, 13 and 19. Nothing was added to the page.

- **The marks land in the right place.** pdf.js tells the page where each line of text sits on the page. The page finds a clause's first and last words, as it does now, and marks the lines between them. When a clause ends partway through a line, as 19 does at "residue of the term.", the mark stops there.
- **It's fast.** All 4 pages drew in under a tenth of a second on a Mac.
- **The PDF still stays on your computer.** The page keeps the PDF in memory while the results are showing, so it can draw the pages. Today it closes the PDF as soon as it has read the text. "Upload a different lease" or reloading the page clears it. Nothing is sent or saved.
- **On a phone, the real page is too small to read.** At 375 px wide, the lease's small print is about 5 px tall, so you have to pinch to zoom. On a laptop it's about 9 px, which is small but readable. So on a phone, the whole-lease view shows where a clause sits and how long it is. The versions are still where you read it.
- **The marks cover the excerpt only, not the whole section.** The page knows only the first and last words in `content.json`. In 19, the excerpt starts after the "(a)" label, so "(a)" and "(c)" aren't marked, but "(b)" is, because it falls inside the excerpt.

**How it will look and work:**

- **The button** sits under the version switcher and shows in all three versions. It tells screen readers whether the view is open or closed.
- **The view** fills the screen, with a close button that stays at the top. Closing it takes you back to where you were.
- **At the top of the view:** a short note saying what the gold marks are, and a list of the key clauses. Tapping one scrolls to its mark. That way the gold never carries meaning by color alone, as `CLAUDE.md` requires.
- **The pages** sit on white panels on the cream background, one under another, as wide as the screen allows. Each page has a page number.
- **The highlight** uses the logo's gold (`--gold-highlight`) and the same uneven edges, tilted much less, so it lines up with long lines of text. The text shows through it, like real highlighter ink.
- **For long leases,** the page draws each page only when you scroll near it, so a phone doesn't run out of memory.
- **No new outside code.** It uses only pdf.js, which the page already loads.

**Wording you'd add to `content.json`.** These are my suggestions. The page uses whatever you write.

| Field | What it's for | Suggestion |
| --- | --- | --- |
| `page.wholeLeaseButton` | The button under the version switcher | "See the whole lease" |
| `page.wholeLeaseTitle` | The heading at the top of the view | "Your whole lease" |
| `page.wholeLeaseNote` | Says what the gold marks are | "The highlighted parts are the clauses shown in each version." |
| `page.wholeLeaseClose` | The close button | "Back to the clauses" |
| `page.showInLease` | The button on each clause | "See it in the lease" |
| `page.pageLabel` | Before each page number, as in "Page 2 of 4" | "Page" |
| `page.pageOf` | Between the two numbers | "of" |

**Questions for you:**

1. **Do you want this for testing, or only for the demo?** The button would be in all three versions. Testers might open the whole lease more in one version than another, and that changes what you're comparing. Suggestion: add a link setting, such as `?lease=off`, that hides it during tests. That would be one more link setting not described in `CLAUDE.md`.
2. **Where does the "See it in the lease" button go on each clause?** Suggestion: under the lease text in Versions 1 and 2, and inside the opened card in Version 3. Leaving it out of the versions keeps them as they are, and the list at the top of the view still jumps to each mark.
3. **On a phone, is pinch-to-zoom enough?** Suggestion: yes for now. I draw the pages sharp enough to stay clear when zoomed. A "bigger" button would need more wording and makes you scroll sideways.
4. **Is it OK that only the excerpt is marked, not the whole section?** Suggestion: yes. Marking whole sections would need new "section start" and "section end" words for each clause in `content.json`.
5. **What about "Use the sample lease instead"?** There's no PDF then, so nothing to draw. Suggestion: hide the button for the sample lease.
6. **Screen readers.** The pages are pictures, so a screen reader can't read the lease text in them. It can read the page numbers and the clause list at the top. Suggestion: that's enough for a prototype, since the versions already show the lease text as real text.

**The steps, once you approve.** I stop after each one so you can check it.

- **8a. The view and the pages.** The button, the full-screen view, the pages and the close button. You check that the pages look right on your phone and laptop, and that the view opens and closes using only the keyboard.
- **8b. The highlights.** The gold marks and the clause list at the top. You check that each mark covers the right words.
- **8c. Jumping from a clause.** The "See it in the lease" buttons, if you want them (question 2). You check that each one opens the right spot, and that closing the view takes you back to that clause.

### Step 9: Changes from class feedback (10/23) (planned, not built)

Status: 9a to 9d are built and waiting for you to check them. They go live only after the page descriptions are simpler. The drafts are in `DRAFT-WORDING.md`, under "Simpler wording before going live". 9e (translate) waits until after testing. This step comes before step 8, since you want these changes in before testing.

**Decided on 10/26:**
- No live AI. Claude drafts all the wording ahead of time, and you check it. The page stays a plain static site, and the lease never leaves the computer.
- Questions 1 to 4 below use the suggestions. Version descriptions stay neutral. The app name is the home button. Word meanings go in Versions 2 and 3 only. The next-steps box gathers the asks.
- 9e (translate) waits until after testing.

Your notes asked for six things. I've sorted them by size, smallest first.

**9a. Say what the tool does, and what each version is.** *(Wording only.)*

- **Today:** the top of the page says "These are three ways to show the same part of a commercial lease. Look at each one." It doesn't say what the tool is for, or how the versions differ.
- **Plan:** you rewrite `page.intro`, and add one short line per version (a new `description` field on each version in `content.json`). The page shows that line under the "Version 1" heading. You write every word. I don't.
- **Question 1.** A version description tells testers what to notice, and that can steer what they say. Do you want the descriptions to explain (for example "The lease, with plain-language notes beside it"), or to stay neutral (for example "The same clauses, shown a different way")?

**9b. A home button.** *(Small.)*

- **Today:** after you upload, the only way back is the "Upload a different lease" button at the top of the results.
- **Plan:** the "Clause & Effect" name at the top becomes a button that goes back to the start, and clears the lease, as "Upload a different lease" does now. No new wording needed.
- **Question 2.** Is that what "home button" meant, or did you mean something else? For example, going back to Version 1, or a button that stays at the bottom of the screen.

**9c. Tap a word to see what it means.** *(Medium.)*

- **Plan:** you write a short list of legal words and their meanings, such as LESSOR, LESSEE, sublet, assign, default, covenants and "residue of the term". It goes in a new `glossary` list in `content.json`. In the lease text, those words get a dotted underline. Tapping one opens its meaning just below the line, and tapping again closes it. It works by tap, not hover, because phones can't hover.
- **Wording you'd add:** the `glossary` list (each entry has a word and a meaning), and `page.glossaryClose`, the label screen readers hear for closing a meaning.
- **Question 3.** Which versions get it? Suggestion: Versions 2 and 3 only (B and C). Version 1 stays the lease as written, so you can compare against it. You turn it on with a new `glossary` item in each version's `shows` list, so you can move it later without a code change.

**9d. "What do I do next?"** *(Medium.)*

- **Today:** Versions 2 and 3 already list asks for each clause ("Before you sign, ask the landlord in writing for: …"), but nothing pulls them together.
- **Suggestion:** at the end of Versions 2 and 3, a short "next steps" box that gathers every ask in one list, with a "Print this list" button. It uses the asks already in `clause-types.json`. Printing uses the browser's own print screen, and nothing is saved.
- **Wording you'd add:** `page.nextStepsTitle` (for example "What to do next"), `page.nextStepsIntro` (one line), and `page.printButton` (for example "Print this list").
- **Question 4.** Is that what the class meant? Or did they mean something on each clause, such as a "what to do" line you'd write for every clause type?

**9e. A translate button.** *(Large. Suggestion: after testing.)*

- **Question 5.** Did the class mean other languages, such as Spanish or Chinese, or "translate the legal words into plain English"? Versions 2 and 3, plus 9c, already do the second.
- **If other languages:** the page can't translate without AI or an outside service, and both break the rules in `CLAUDE.md`. So someone you trust would have to translate the page wording and plain-language lines into a second copy of `content.json`. The button would switch between the two copies. The lease text would stay in English, since the English lease is what binds. I'd also mark the lease text so a browser's own translate feature leaves it alone.

**9f. "Does this help testers understand? Is there a real benefit between versions?"** *(Nothing to build.)*

- This is what the testing is for, so it belongs in the observers' notes, not on the page. Suggestion: after each version, observers ask the tester the same two questions. For example: "Which clause could cost you the most?" and "What would you ask the landlord to change?" Then you can compare answers across versions. I can draft these for you to edit if you'd like.

**The steps, once you approve.** I stop after each one so you can check it: 9a, then 9b, then 9c, then 9d. 9e waits until after testing, unless you decide otherwise.

## What the page will not do

- No AI, and no server.
- No sending or saving uploaded files.
- No analytics, cookies or saved tester data.
- No tester names anywhere, including commit messages.
- It won't understand leases that use different wording. It finds only the clauses written the way the standard form writes them.
- No changes to wording in the JSON files unless you ask.

## Possible later

- **After testing: a bigger clause library (decided 10/26, not planned in detail yet).** You want more than three clauses, and more than one lease form. The idea: a library of common versions of each clause, written ahead of time and approved by you. The page sorts each part of the lease into the library by its wording, and fills the lease's own numbers into the plain-language lines. The stages:
  1. More clauses from the GBREB form.
  2. Fill in the lease's own numbers.
  3. Warning phrases and word meanings across the whole lease.
  4. A second lease form, checked against your hand-marked answer key.
  
  Reading scanned PDFs waits. Step 9 comes first, so you can test. The full plan is in `ENGINE-PLAN.md`.
- A view of the whole uploaded lease, with the key clauses highlighted on the real pages. Now planned as step 8.

### Step 10: Round 2 polish (planned, not built)

Status: waiting for Zachary to choose a direction. Nothing is built.

**What the design critique found** (design-critique skill, 11/3, on the standard form at laptop width):

1. **The tier shows three times per section:** the group chip, a chip on the card, and a colored bar. It's noise, and nothing stands out (aesthetic and minimalist design, the Von Restorff effect).
2. **Boxes inside boxes.** Card, then ask box, then "Words to propose", then the example: four nested containers per section. This is the main reason the page reads as unsophisticated (common region, Prägnanz).
3. **Each ask stacks up to ten pieces,** such as the chip, "What to ask", the ask, why, the toggle, the caution, the wording, the example and the next step. Round 1's single bullet was easier to act on (Miller's law).
4. **The page is very long,** about 22,800 px on a laptop. Every section shows its full lease text in "Lease text first", and the unsorted group at the end shows long boilerplate.
5. **The masthead repeats on every screen.** The title and intro push the splash page and each version below the fold.
6. **Headings copied from the form are in capitals** ("LESSOR’ S ACCESS"), which clashes with the plain voice everywhere else.
7. **Too many accent colors at once:** brick, gold, green, slate tint, plus gold chips.

**Three directions to choose from,** all in the current colors and fonts. Mockups were shown in the conversation on 11/3.

- **Plain checklist,** closest to round 1. One open section per row with hairline dividers, no nested boxes. Each row shows the tier as a small dot and words, the one-line meaning, "Before you sign, ask the landlord in writing for:" with short bullets, and two text links: "See what to say" and "Show the lease's words".
- **Annotated lease.** The lease's words sit on a white page with the key passage highlighted. The meaning and the ask sit beside it like a margin note. This fits "Lease text first".
- **Summary first.** Three counts at the top (highest stakes, costs money, things to ask for), then one line per section that opens for more. This fits "Risk summary first".

These could also map one direction to each version, which would make the three versions easier to tell apart.

**Accessibility check of the directions:**
- Tier text #7A2A1F on cream is about 8:1. Muted text #655468 on cream is about 6.3:1.
- The tier is always a word, never color alone.
- Links are underlined.

The real page would keep 16 px body text and 44 px tap targets.
