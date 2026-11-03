# Plan: the lease-reading engine

Status: stage 1's behind-the-scenes part is built (11/3): the converter, the library files, the engine and a check page. The tester page doesn't use the engine yet, because the round 2 layout is still being decided. Results are in `tools/first-run.md`. The questions are at the end.

Two changes to the plan, from building it:
- **20 U.S. leases, not 36.** Only 20 of the dataset's leases are clearly American by their wording. 13 build the rules, and 7 are held back.
- **The held-back leases come only from leases the workbook doesn't quote.** The workbook already quotes 8 of them as real examples, so those can't give a fair score. See `tools/dataset-split.json`.

Version 4 (10/26). This version uses the second workbook (with the Asks sheet), the updated `RESEARCH-BRIEF.md`, and both rounds of your answers, recorded in "Decisions" below. I've also checked the third workbook and brief (see "What I checked").

## What the engine does

Today the page finds 3 clauses by copying their first and last words from the standard form. The engine reads the whole lease instead, and sorts every section into the library you build in the workbook.

For each section of an uploaded lease, it does seven things in order:

1. **Reads** the text from the PDF, and remembers where each line sits on the page.
2. **Splits** the lease into sections, using the section numbers and headings. Riders, exhibits and amendments count as part of the lease.
3. **Sorts** each section into a clause type by matching its trigger phrases.
4. **Finds every version** of that clause the section matches. It never stops at the first match, because a clause can start friendly and then take it back with "provided, however".
5. **Leads each flag to an ask:** the ask, the words to propose, a real lease with the better wording, and a fallback.
6. **Fills in numbers** from the lease, but only where it's sure (stage 2).
7. **Flags** warning phrases, defines glossary phrases, links defined terms, and checks for missing protections (stage 3).

The engine never writes a sentence. It only chooses sentences from the library, and in stage 2 puts the lease's own numbers into the blanks in braces, such as `{days}`. Square brackets, such as `[ten (10)]`, are suggestions for the owner. The engine never fills them.

## Decisions (your answers, 10/26)

1. **Approval.** You approve every row. A row goes live only when its status is "Approved". There is no other reviewer.
2. **Tiers replace the old ranks and risk levels:**
   - A version's tier overrides its clause type's tier.
   - The page lists tier 1 first, then tier 2, then tier 3, in the lease's own order within each tier.
   - You set every tier, including for 6B, 13 and 19. Until you do, the page shows "Tier not set".
   - Ask you before changing how Version 3 shows tiers.
3. **The workbook goes in the repository.** The dataset text stays in its own file, `dataset-red-flags.xlsx`, which never goes in it. (One problem with this: see "What I checked".)
4. **The research dataset** is downloaded into `.test-data/leivaditi-2020/` (details below).
5. **Preview link.** `?preview=1` shows drafts, and every draft line is marked "Draft". The link without `?preview=1` never shows a draft.
6. **Single-word triggers count only in headings,** except these 12, which count anywhere: indemnify, indemnification, subordinate, subordination, holdover, relocate, relocation, recapture, estoppel, guaranty, guarantor, condemnation. Leases without headings are still sorted by their multi-word phrases.
7. **Missing clauses** use the sentences on the Missing clauses sheet. Each one is followed by the shared line, stored once in `content.json`.
8. **Asks** follow the flag-to-ask chain in the brief, from the Asks sheet and the "Ask for instead" column. Square brackets are never filled.
9. **Test leases:**
   - I build the rules from the standard form, the EDGAR leases in the workbook, and about two-thirds of the dataset's 36 labeled U.S. leases.
   - The other third, and the Egleston lease, are held back for fair scores.
   - I never see the Egleston lease. You run it yourself.
10. **First batch:** the 13 clause types that already have versions in the workbook (see "Stage 1").
11. **No separate ranks.** Tiers replace them, and you set them.

**Second round (10/26):**

12. **The dataset quotes stay in the workbook.** The license allows non-commercial sharing with credit. Wherever one appears on the page, it shows: "From Leivaditi, Rossi & Kanoulas (2020), CC BY-NC 4.0."
13. **Under every proof example,** one line, stored once in `content.json`: "From a lease a company filed publicly. Larger tenants often get better terms, so this shows the wording exists, not that your landlord will agree."
14. **The Warning phrases sheet now has two ask columns:** "Plain-language ask" and "Legal wording to propose".
15. **A row can't be marked Approved until its tier is set.**
16. **Layout, built this way in preview first.** You'll adjust it after you see it:
    - **A flagged section** is one card:
      - at the top, the plain sentence and the tier mark
      - below that, the lease's own words
      - then "What to ask", with the plain ask first
      - then, collapsed by default, "Words to propose": the caution line, the legal wording, and the proof example
      - last, "If they say no", when there's a fallback
    - **An unsure section** is one card with both possible matches, and the line "This section could be either of these. Check the lease's own words."
    - **Not-sorted sections** go in a separate group at the end, titled "Sections the tool couldn't sort", with glossary meanings shown in place.
17. **What counts as a flag:**
    - A version is a flag when it has a row on the Asks sheet, whatever its rating.
    - "Best" versions show without a flag, marked "Good for you", so owners know what not to spend their asks on.
    - Other versions show their sentence and tier, with no flag and no marker.
18. **Tier marks use words, not numbers:**
    - Tier 1: "Highest stakes."
    - Tier 2: "Costs money."
    - Tier 3: "Rules and paperwork."
    - "Tier not set" sections go after tier 3 and before "not sorted", in preview only.
19. **Mixed tiers.** A section goes in its most serious tier. Inside the card, its matched versions are listed most serious first.

**Third round (10/26):**

20. **Which versions get the cards:**
    - Versions 2 and 3 use the card layout from decision 16. Version 2 lists the cards in lease order, and Version 3 in tier order.
    - Version 1 stays the lease as written, with no flags, tiers or asks.
21. **The "What to ask" heading replaces the "Ask before you sign" tag.** The gold tag (`tags.negotiable.label`) no longer shows on Versions 2 and 3.

## The rules

From your engine request and from `RESEARCH-BRIEF.md`:

- **Everything runs in the owner's browser.** No AI, no outside services, nothing paid. It keeps working on GitHub Pages. The lease never leaves the computer.
- **Every sentence comes from the library or from `content.json`.** The page never writes its own.
- **The library sits apart from the code.** The workbook is its source.
- **The lease's own words sit next to every explanation.**
- **Filled-in numbers are traceable.** The sentence a number came from is highlighted in the lease text.
- **Never guess:**
  - A section that matches no type is "not sorted", shown with its glossary meanings.
  - A section that matches two types shows both, and says the tool is unsure.
- **Riders:** if a rider and a main clause match the same type, both show, with a line saying the rider may change the main clause.
- **Warning phrases match by their complete wording,** with a check for "not" nearby.
- **No scanned pages.** If a PDF has no selectable text, the page tells the owner to use one where the text can be selected.
- **Tiers measure consequence only.** Negotiability is shown separately, through the asks.
- **Above any legal wording,** the page shows the one line from the brief, stored once in `content.json`.
- **The page never says a clause is void.** At most: "Massachusetts law may limit this clause. Ask a lawyer."
- **Some things never go in the repository:**
  - text from Practical Law, Westlaw, Lexis or MCLE
  - the Egleston lease, or any text from it
  - the research dataset
- **Never invent a real example.** Each one is copied from a real lease and names its source.
- **No points, streaks, timers, lease scores, or quizzes on the owner's own lease.**
- **Page wording in `content.json` still goes through `DRAFT-WORDING.md` first,** as `CLAUDE.md` says. Library rows don't, because the workbook's status column does that job.

## The library: from workbook to page

1. **You edit `clause-library.xlsx`** and set each row's status.
2. **The converter** (`tools/convert-workbook.py`) reads the workbook and writes the library files. It uses only what's already on a Mac, so nothing gets installed. I run it whenever you send a new workbook, or you can run it with one command.
3. **The converter lists problems instead of guessing,** for example:
   - a blank in braces that no cue phrase can fill
   - an "Ask for" or "Fallback" that names a version that doesn't exist
   - an answer-key row naming an unknown type
   - two rows with the same ID
4. **The page reads only the library files.** Change the workbook, run the converter, and the page changes with no code change.

**What reaches the page:** approved rows only. With `?preview=1`, draft rows show too, each marked "Draft", and blank tiers show "Tier not set".

| Sheet | Library file |
| --- | --- |
| Clause types | `library/clause-types.json` (replaces today's `clause-types.json`) |
| Versions | `library/versions.json`, including each real example and its source, for the "proof" step |
| Warning phrases | `library/warnings.json`, including "Ask for instead" |
| Asks | `library/asks.json` |
| Glossary | `library/glossary.json` |
| Missing clauses | `library/missing.json` |
| Answer key | read by the test tool (stage 4) |
| How to use, Sources, EDGAR leases found | not turned into files. Reference only. |

The code files: `engine.js` (the engine), `app.js` (draws the page, as today), `test.html` and `test.js` (the test tool), and `tools/convert-workbook.py` (the converter). The workbook and the brief go in the repository when stage 1 starts.

## From flag to ask

This is the chain from the brief, built from the Asks sheet:

1. **The flag.** A section matches a risky version, or contains a risky warning phrase.
2. **What it means.** The page shows the version's plain-language sentence and tier, next to the lease's own words.
3. **The ask:**
   - First, the plain-language ask.
   - Then the shared line from `content.json`.
   - Then "Words to propose", the legal wording, with its square-bracket blanks left as they are.
4. **Proof.** If the ask names a better version, the page shows that version's real example and source, so the owner sees the better wording exists in a real lease.
5. **If they say no.** If there's a fallback version, the page shows it as "If they say no, ask for this instead."

**A risky warning phrase with no version match** uses its two ask columns on the Warning phrases sheet: "Plain-language ask" and "Legal wording to propose".

**Under each proof example:** the shared proof line from decision 13. If the example comes from the research dataset, the credit line from decision 12 shows too.

**"Good for you":** a matched "Best" version shows its sentence with that marker, and no ask.

**Example:** an unlimited personal guaranty shows:
- the guaranty-unlimited sentence, and its tier (or "Tier not set")
- the ask to cap it
- the proposed cap wording
- the capped guaranty from the Sensus Drug Development filing as proof
- the burn-off version as the fallback

**Where this gets built:**
- Version flags, asks, proof and fallbacks come in **stage 1**, since versions are matched then.
- Warning-phrase swaps come in **stage 3**, with the warning phrases.
- How the chain looks follows decision 16, in preview first.
- "Words to propose" is a button that opens and closes, and tells screen readers whether it's open (`aria-expanded`), like the Version 3 card button today.

## What I checked in your files

### Fixed since the last workbook

- **Darryl** is gone from the approval steps.
- **Missing-clause sentences** now say "The tool didn't find…", with a shared follow-up line.
- **The dataset sheet** is out of the workbook.

### Still open from last time

- **Broken links.** 4 EDGAR links still end in `.txt/seq-2` or `.txt/seq-6` and don't open: ON Technology, Sensus Drug Development, WatchGuard and Boston Restaurant Associates. Sensus is now a "proof" example, so its link matters more.
- **Blanks the engine can't fill yet.** Only 2 versions have a `{days}` blank inside a cue phrase. The other 13 versions with blanks show their sentence without the number until I draft matching cue phrases in stage 2, for you to check.
- **A number mismatch.** `opex-base-year` lists `share` as a number to fill, but its sentence has no `{share}`.
- **Three warning phrases still misfire as written:**
  - "as is" also matches "such portion as is necessary".
  - "waiver" (under "hereby waives") also matches "waiver of subrogation".
  - "sole discretion" can be the tenant's discretion, which is friendly.
  
  I'll add matching rules for these. You don't need to change the workbook.

### The third workbook

Only the Warning phrases sheet, the "How to use" sheet and one line of the brief changed. Everything else matches the second workbook, so the problems listed under it still stand.

- **The two ask columns work.** Each risky phrase with an ask now has a plain ask and, mostly, legal wording. The converter can tell them apart without guessing.
- **"18 risky phrases, 14 with asks."** You said all 14 risky phrases are filled. The sheet has 18 marked Risky. Four have no ask at all: "jointly and severally", "personally", "at Tenant's sole cost and expense" and "irrevocable". "Hereby waives" has a plain ask but no legal wording, which is fine: the card just won't have a "Words to propose" part (question 7).
- **Some legal wording is a fragment,** such as "not be unreasonably withheld, conditioned, or delayed" and "without carry-forward of any unused amount". That works if the page presents it as replacement words, not a whole sentence. The caution line already says to read the final version.
- **The two release wordings still differ.** "Remain primarily liable" proposes a release with no date limit. The Asks sheet's `transfer-tenant-stays-liable` releases only "obligations arising after the date of the assignment".
- **The approval rule** ("a row can't be Approved until its tier is set") is in the brief and the "How to use" sheet. The converter will enforce it (question 4).

### Problems found in the second workbook

Resolved by your second-round answers:
- The 15 dataset quotes stay, with credit (decision 12).
- Proof examples get a caution line (decision 13).
- "Ask for instead" is split into two columns (decision 14).
- Middle versions: anything with an Asks row is a flag (decision 17).

Still open:

- **Two wordings for one ask.** The `transfer-tenant-stays-liable` ask releases you "from all obligations arising after the date of the assignment". The "remain primarily liable" swap releases you with no date limit, which is broader. They should probably match.
- **Legal wording to check.** You said this is the part to check most carefully. What I noticed:
  - **opex-full-share** proposes paying increases over "the Base Year". A lease with a full-share clause may not define a Base Year at all, so the wording may need a blank, such as "the calendar year [2027] (the "Base Year")".
  - **termination-on-notice** asks for "the unamortized cost of Tenant's improvements" without saying over what period. Landlord and owner could read that differently. A blank such as "[amortized evenly over the initial Term]" would settle it.
  - **opex-includes-capital** asks to leave out all capital costs. The GBREB form itself allows only capital costs that reduce other operating costs or are required by law, spread over years with interest. That could make a realistic fallback.
  - **opex-estimates-only** refers to "the estimate in this Lease", but some leases give the estimate in a separate letter, or not at all.
  - **deposit-top-up**'s wording is a fragment ("within [thirty (30)] days after written demand") rather than a full sentence. That's fine if the page labels it as replacement words for the deadline.
  - **Square-bracket style varies:** "[180]" in one place, "[ten (10)]" in others.
- **A column no longer used.** The Clause types sheet still has an empty "What to ask for (Q3)" column. Since the Asks sheet replaces it, the converter will ignore it unless you say otherwise.

## The research dataset

- **Where it is:** `.test-data/leivaditi-2020/` in the project folder. I added `.test-data/` to `.gitignore`, and to your computer's local git settings, so it can't be committed by accident, even before this branch is merged.
- **What it is:** 179 leases with annotations, from the record at DOI 10.21942/uva.19732993.v1. I downloaded only `annotated_dataset.zip` and the label legend, not `ALeaseBert.zip`.
- **License:** the record's description says CC BY-NC 4.0, as your brief says. Its license field says "Restrictive license", but the description gives the terms. Credit the authors wherever results appear.
- **The leases are web pages, not PDFs.** Testing on them skips the PDF-reading step. It does test the splitter's "heading inside the paragraph" rules, which the standard form can't.
- **The 36 U.S. leases:** a quick count finds 39 annotated leases with Landlord and Tenant wording and section labels. Some may be British. In stage 1, I'll pick the 36, list them for you, and split them about two-thirds for building and one-third held back. I'll write that split down before I look at any of the held-back leases.

## How sorting decides

- **Trigger phrases:**
  - Multi-word trigger phrases count anywhere in a section.
  - Single words count only in the section's heading, except the 12 words in decision 6.
  - A section is sorted into a type when it matches enough phrases, and clearly more than any other type.
- **Two types both match well:** "unsure", and both show.
- **Nothing matches well enough:** "not sorted".
- **Versions:** every version's cue phrases are checked against the whole section, and every version that matches shows. Cue phrases with "…", such as "Landlord may … terminate this Lease", allow a few words in between.
- **Lettered parts with their own heading** (6A, 6B) are sorted on their own. Lettered items inside one sentence, such as 19 (a), (b) and (c), stay with their section.
- **Riders:** if a rider matches the same type as a main clause, or names it ("Section 13"), both show, with the "may change" line. The engine never decides which one governs.
- **Defined terms:** capitalized terms like "Additional Rent" link to where the lease defines them, when the engine can find the definition. If it can't, there's no link, and nothing is guessed.
- **The first test run is recorded before anyone changes the "enough" and "clearly more" settings.**

## Numbers the engine reads (stage 2)

In every case, if the engine isn't sure, it shows the sentence without the number and points to the lease's own words.

- **Words and digits together,** such as "ten (10) days". They must agree, or nothing is filled in.
- **Business days.** "Ten (10) Business Days" fills `{days}` with "10 business", so the sentence reads "10 business days".
- **Dollars,** such as "$3,000.00" and "Three Thousand Dollars ($3,000.00)".
- **Percentages,** such as "five percent (5%)" and "5% per annum".
- **Choices** ("whichever is greater", "the lesser of"):
  - Both numbers show.
  - The engine says which applies only when it can tell from the numbers themselves. Otherwise it says the lease decides, using a library sentence.
- **Index-based amounts** ("increase by the CPI") have no number to fill. A library sentence says the amount depends on inflation.
- **Dates and years,** such as "Base Year", "Commencement Date" and "2027".
- **Empty blanks,** as in your copy of the standard form. The page uses a "the lease leaves this blank" sentence from the library. That needs a new row or column in the workbook (question 8).

## The stages

I stop after each stage so you can check it.

### Stage 1: Read, split, sort, versions and asks

- **What I build:**
  - The workbook and brief go in the repository.
  - The converter.
  - The engine's read, split, sort and version steps.
  - The flag-to-ask chain for versions.
  - Preview mode.
  - Tier order.
  - The dataset split, written down.
  - The page shows sorted, unsure and not-sorted sections. How they look is your call (question 4).
- **Scope:** all 32 clause types are sorted by their triggers. The 13 types with versions get versions and asks:
  - default
  - personal guaranty
  - operating costs
  - assignment and subletting
  - relocation
  - landlord termination
  - security deposit
  - utilities
  - surrender
  - repairs
  - casualty
  - subordination
  - tenant termination
- **Is 13 too many?** No.
  - The code works the same for 1 type or 32. The size of a batch mostly changes how much you have to check.
  - **9 of the 13 are in the standard form,** so you can check them in one upload: 6B, 13, 19, 5, 11, 7, 21, 18 and 14.
  - **The other 4 aren't:** personal guaranty, relocation, landlord termination and tenant termination. I check those on the EDGAR and dataset leases and show you the results.
  - **If you'd rather cut,** cut those 4 from the first check, not from the library. That's based only on what's easy to test, not on how serious they are.
- **Compared with my earlier nine:**

  | | Clause types |
  | --- | --- |
  | In both lists | security deposit, repairs (I called it maintenance), casualty, surrender |
  | Mine, not yours | alterations, indemnification, liability insurance and late charge. The workbook has types for these, but no versions yet, so they wait. Also liability of owner (GBREB 26). |
  | Yours, not mine | default, operating costs, subletting, guaranty, relocation, both terminations, utilities, subordination |

  **Your list is the better start, because it's the one with versions ready.**

  **Gaps in the workbook:** it has no clause type at all for liability of owner (GBREB 26), force majeure (24), compliance with laws (9), fire insurance (10) or brokerage (22). On the standard form those show as "not sorted". That's honest, but it's worth knowing before the demo.
- **What you look at:**
  - **The standard form with `?preview=1`:** every section is listed as sorted, unsure or not sorted. Each flag has its ask, proof and fallback, and is marked "Draft". The tiers say "Tier not set".
  - **The same link without `?preview=1`:** no drafts show anywhere.
  - **The residential sample:** almost everything is "not sorted", with nothing guessed.
  - **The converter's report:** read its list of workbook problems.
  - **The dataset split:** read the list of leases for building and the ones held back.

### Stage 2: The lease's own numbers

- **What I build:**
  - The number finders above.
  - Highlighting the sentence each number came from (the look is your call).
  - Drafts of the missing cue-phrase blanks, for you to check in the workbook.
- **What you look at:**
  - Every filled-in number matches its highlighted sentence.
  - Square brackets are never filled.
  - "Ten (15) days" fills nothing and says to check the lease.

### Stage 3: Warning phrases, swaps, glossary, defined terms and missing clauses

- **What I build:**
  - **Warning phrases** across the whole lease, with:
    - the "not" check
    - the fixes for "as is", "waiver" and "sole discretion"
    - each risky phrase's "Ask for instead"
  - **Glossary meanings,** using step 9c's tap-a-word feature.
  - **Defined-term links.**
  - **Missing-clause checks** with the shared line.
- **What you look at:**
  - "Shall not be unreasonably withheld" shows as friendly.
  - "Such portion as is necessary" isn't flagged.
  - Glossary words work in "not sorted" sections.
  - Missing-clause messages appear only for types the engine really didn't find.
- **A limit to know:** the "not" check doesn't catch every way of flipping a meaning, such as "except" or "unless".

### Stage 4: The test tool

- **What I build:** `test.html`, not linked from the main page. You choose a lease and its answer key (the Answer key sheet saved as CSV). It reports each section as one of:
  - **correct**
  - **wrong**
  - **unsure**
  - **not sorted**
  - **missed:** the splitter never found it
- **It gives a type score and a version score.** "Unsure" never counts as correct.
- **Reports are saved to your computer,** marked "first run" or "after tuning", with the date, the scores, and a code that changes whenever the library changes. You can compare a new run with an earlier report.
- **It also accepts the dataset's web-page leases,** with an answer key made from the dataset's own section labels, so the held-back third gets a fair score.
- **What you look at:** save the first run before any rule changes. Later, run the Egleston lease yourself.
- **The honest claim:** "it works well on leases like the ones it was built from."

## Not planned: your decisions first

From the brief. I won't build any of these until you choose:

- How Version 3 shows 10 or more cards, and how it shows tiers.
- An ask list the owner builds while reading, kept on their own device.
- Showing what a clause could cost over time.
- A practice game on the sample lease only, saving nothing.
- A scripted negotiation rehearsal. The asks and fallbacks would be its moves.

## What else this changes

- **`CLAUDE.md` needs updating for:**
  - the engine and the workbook as the library's source
  - the converter
  - preview mode, since drafts can now appear on the page, marked "Draft"
  - tiers in place of ranks
  - the three versions: Versions 2 and 3 become cards. Today `CLAUDE.md` says the negotiable tag always shows "Ask before you sign"; that rule changes to the "What to ask" heading.

  I'll show you the new wording first.
- **Today's 3 clauses and their risk marks** ("1 Highest risk") move to tier marks in words (decision 18).
- **Unused page wording.** With decision 21, `tags.negotiable.label` ("Ask before you sign") and `tags.negotiable.askIntro` ("Before you sign, ask the landlord in writing for:") are no longer used. I'll leave them in `content.json` unless you want them removed.
- **New page wording in `content.json`.** You wrote all of these yourself in your answers, so none of them needs a draft:
  - the three tier names, and "Tier not set"
  - "Good for you"
  - "What to ask", "Words to propose" and "If they say no"
  - the caution line above legal wording
  - the proof line
  - the dataset credit line
  - the unsure line
  - "Sections the tool couldn't sort"
  - the shared missing-clause line
  - "Draft", for preview mode
- **A credit in the repository.** Since the dataset quotes go in the workbook and the library files, the repository also gets a short credit file. It names the authors, the DOI and the license link, and says the quotes are shortened excerpts. CC BY-NC asks you to say when material has been changed.
- **Step 9:** 9c's tap-a-word feature is reused in stage 3, so building 9c first saves work.
- **Step 8 (whole lease view):** the engine keeps where each line sits, so highlights can later cover every sorted section.

## Questions for you

### New, from your second-round answers

1. **The proof line for dataset examples.** "From a lease a company filed publicly" fits the EDGAR leases. The research-dataset leases weren't necessarily filed by a company. Should dataset examples get a different first half, such as "From a real lease in a research dataset"? Or does the credit line alone cover them?
2. **A tier from the version or from its clause type?** "A row can't be Approved until its tier is set": does a version count as having a tier when only its clause type has one? Suggestion: yes. A version uses its own tier if it has one, and otherwise its clause type's. The converter reports any Approved version with neither, and treats it as a draft.
3. **The tier of an unsure card.** It shows two possible types, maybe with different tiers. Suggestion: place it by the more serious of the two, like decision 19.
4. **A section with a flag and a "Good for you".** For example, a friendly cure period, then "provided, however" taking it back. Suggestion: the card is a flag, its versions are listed most serious first, and the "Good for you" version shows inside it with its marker.
5. **The 4 risky warning phrases with no ask:** "jointly and severally", "personally", "at Tenant's sole cost and expense" and "irrevocable". Suggestion: they still show their meaning wherever they appear, but they aren't flags (decision 17), until you add an ask. Is that right, or did you mean to fill them?

### Still open from before

6. **"Left blank" sentences** for empty form blanks. Add a column on the Versions sheet, or one shared line in `content.json`?
7. **Should your 23 word meanings from step 9c go into the Glossary sheet,** so there's one glossary?
8. **Test tool timing.** A basic test tool in stage 1 would record sorting before I tune anything. Or keep it all in stage 4?
9. **The two outside files.** The page loads pdf.js from cdnjs and the fonts from Google. They never see the lease. Copy them into the repo so the page uses no outside sites at all?
10. **The sample lease button.** Keep today's 3 sample clauses, or retire it once uploads work well?
11. **The legal-wording notes** in "What I checked" (Base Year, the unamortized period, a capital-cost fallback, the estimate, the bracket style, and the two release wordings). Will you change them in the workbook, or should I list exact suggestions for you to paste?
12. **The 4 broken EDGAR links,** including Sensus, a proof example. Will you fix them, or should I list the working links?

### Before stage 1 starts

Nothing above blocks stage 1. I'll follow the suggestions in questions 2 to 5 unless you say otherwise, and ask about the rest when they come up.
