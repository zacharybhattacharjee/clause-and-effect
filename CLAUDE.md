# Clause & Effect (lease reader prototype)

## What this is

Clause & Effect is a clickable prototype for a Northeastern Law legal design studio. It shows the key clauses of a commercial lease in three versions so testers can compare them.

Design question: How might we redesign small business contracts so that what is negotiable and what is consequential are visible in the document that legally binds?

This prototype tests one thing: can a small business owner tell what to push on, and what can cost them the most? It is a first draft for testing, not a product.

Zachary will demo it live in class: he uploads a lease PDF, and the page shows its key clauses in the three versions. There is no AI. The page reads the PDF in the browser and finds the clauses by their wording. That only works for the Greater Boston Real Estate Board (GBREB) Standard Form Commercial Lease, or a lease that uses the same wording.

Zachary is not a software developer. Explain every change in plain words, without jargon.

## Files

- `content.json`: every word on the page, the lease clauses, and the words used to find each clause in an uploaded PDF.
- `clause-types.json`: the risk rank, level, "why" line, and asks for each clause type.
- `index.html`, `style.css`, `app.js`: the page.
- `PLAN.md`: the build plan once Zachary approves it.
- `DRAFT-WORDING.md`: wording Claude drafted for Zachary to review, before it goes into the JSON files.
- `ENGINE-PLAN.md` and `RESEARCH-BRIEF.md`: the plan and rules for the lease-reading engine.
- `library/clause-library.xlsx`: Zachary's workbook, the source of the engine's library. `tools/convert-workbook.py` turns it into `library/*.json` and writes `library/converter-report.md`. Never edit the library JSON files by hand.
- `engine.js`: the engine. It splits a lease into sections, sorts them into clause types, and finds versions and asks. The tester page doesn't use it yet.
- `engine-check.html`: a check page for Zachary, not linked from the tester page.
- `round-two.html`, `round-two.js`, `round-two.css` and `content-round-two.json`: the round 2 test page, built on the engine. It shows only approved rows. With `?preview=1` it also shows draft rows, with one "Draft" note at the top. The live page (`index.html`) doesn't use it.
- `tools/dataset-split.json` and `tools/first-run.md`: which research-dataset leases build the rules and which are held back, and each run's results.
- `CREDITS.md`: credit for the research dataset, the public lease filings, and pdf.js.

## Hosting

The site runs on GitHub Pages from the main branch, root folder. Keep it a plain static site, with `index.html` as the start page. No build step, no server, no package installs.

The page uses pdf.js (Mozilla's free PDF reader) to read uploaded PDFs, loaded at an exact version. Ask before adding any other outside code.

## Rules for the build

- Use plain HTML, CSS, and JavaScript. No framework.
- No AI calls, no analytics, no cookies, no saving tester data. Observers take notes by hand.
- An uploaded PDF never leaves the browser. The page sends it nowhere and keeps no copy. Reloading the page clears it.
- Never commit a lease PDF to the repo. The GBREB form is copyrighted, and the repo is public.
- Load all page text from `content.json`. Never hardcode page text.
- Join each clause to its type in `clause-types.json` by the `type` field to get its rank, level, why, negotiable, and asks.
- Never write, edit, or invent lease text. It comes only from the uploaded PDF or the `legalText` saved in `content.json`.
- Never write, edit, or invent plain-language lines, ranks, or asks unless Zachary asks.
- When Zachary asks, Claude may draft page wording, version descriptions, and glossary meanings. Drafts are written ahead of time, never by the page, so the page still makes no AI calls.
  - Put drafts in `DRAFT-WORDING.md` first, for Zachary to review. Copy a draft into the JSON files only after he approves it.
  - Each draft copied into a JSON file is named in the top-level `unverified` list in `content.json` until Zachary checks it. He deletes a name when he has checked it.
  - Never say on the page that the wording was written by AI or by Claude. Zachary decides what the page says about it.
- Do not change wording in the JSON files unless Zachary asks. If wording breaks a layout, report it instead of rewording it.
- If a clause has no lease text, show `page.emptyExcerpt` in gray.
- Ignore note fields: `status`, `source`, `legalTextNote`, `verified`, `unverified`, `internalName`, `lookFor`.

## Reading an uploaded lease

- Each clause in `content.json` lists the first words and last words of its excerpt, copied from the standard form.
- The page finds those words in the PDF's text and shows everything between them as the clause's lease text, exactly as the PDF has it. When matching, it ignores line breaks, extra spaces, curly versus straight quotes, and words split with a hyphen at the end of a line.
- Excerpts stay short, two or three sentences, because the form is copyrighted.
- A clause whose words aren't found goes under `page.notFoundTitle` with `page.notFoundNote`. It is never guessed.
- If the PDF has no text to read (for example, a scanned page), show `page.error`.
- The plain-language lines, card lines, and types come from `content.json`, written for the standard form. They do not change with the uploaded lease.
- "Use the sample lease instead" shows the clauses with the `legalText` saved in `content.json`.

## The three versions

`content.json` defines them under `versions`, using the `shows` list for each.

- A shows the lease text in lease order (`leaseOrder`).
- B shows the lease text in lease order, with the plain-language lines, the negotiable tag and asks, and the risk rank.
- C shows short cards ordered by rank, highest risk first. Tapping a card shows the plain-language lines and the lease text.
- Each version shows its `description` line under its heading. The line stays with its version when `?order=` changes the numbers.
- B and C show `page.governsSample` at the top, so no one mistakes the explanation for the lease.
- A version whose `shows` list has `glossary` underlines the words from the `glossary` list in `content.json`, the first time each appears in a clause's lease text. Tapping a word opens its meaning below the line. `page.glossaryHint` shows in the notes at the top only when the lease text has an underlined word.
- A version whose `shows` list has `nextSteps` ends with `page.nextStepsTitle`: every ask from its clauses, in the version's own order, with no repeats, and a `page.printButton` button that prints only that list.
- Number risk ranks among the clauses shown, from 1, in the order of `rank` in `clause-types.json`.

## How testers see it

- Testers see "Version 1", "Version 2", "Version 3". Never show A, B, C or the internal names.
- The `order` link setting sets which version is 1, 2, and 3. Example: `?order=CAB` makes C Version 1. Default is `ABC`. Ignore invalid values and use the default.
- The `t` link setting carries a tester label, such as `?t=R1`. Show it small in the footer so notes can be matched. Never use tester names anywhere, including commits.
- One version shows at a time. Switching versions scrolls back to the top.
- The page must make sense without anyone explaining it.

## Look

The page should feel calm, credible, and finished, like a well-designed legal aid site, not a template.

- Colors: cream `#F7F3EA` background, plum `#3B2340` text, slate `#5B7083` for plain language, gold `#C9A227` for the negotiable tag, brick `#A63A2B` for risk.
- Type: a serif from Google Fonts for headings (Source Serif 4) and a clean sans for body text (Inter), each with a system fallback.
- Lease text looks like a document: slightly smaller, set apart on a white panel. Plain-language lines sit beside or under it on a light slate tint, so the two never blur together.
- Generous spacing. One idea per card. Soft corners and light shadows, nothing loud.
- Color never carries meaning alone. The negotiable tag always shows its words from `tags.negotiable.label` (now "Ask before you sign"). The risk mark always shows the number and level name, such as "1 Highest risk".
- Text meets WCAG AA contrast. Gold is a background only, with plum text on it.
- Design for a phone first (375 px wide), then make sure it looks good on a laptop, since the class demo runs on one. Body text at least 16 px. Tap targets at least 44 px.
- Use real headings, real buttons, and `aria-expanded` on anything that opens and closes. The version switcher works with a keyboard and a screen reader.

## How to work with Zachary

- Plan before writing code. Save the plan as `PLAN.md` and wait for approval.
- Build in the small steps listed in `PLAN.md`, and stop after each one so he can check it.
- After each step, say exactly what to look at and what changed.
- Ask before adding anything not described here.

## Done means

- All three versions show correctly on a phone and a laptop.
- Uploading the standard form PDF fills in the lease text for every clause, in the browser used for the class demo.
- `?order=` and `?t=` work.
- Replacing the clauses in `content.json` changes the page with no code change.
- It runs on GitHub Pages.
