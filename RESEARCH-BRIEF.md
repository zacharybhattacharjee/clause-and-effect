# Research brief for the Clause & Effect library

This file gives Claude Code the research behind the lease library. Read it with ENGINE-PLAN.md and CLAUDE.md. The library itself comes from `clause-library.xlsx`, which Zachary fills in.

Design question: How might we redesign small business contracts so that what is negotiable and what is consequential are visible in the document that legally binds?

## Rules for the library

- Every sentence an owner reads comes from the library. The page never writes its own.
- Each row in the spreadsheet has a status. Only rows marked "Approved" go into the live files. Zachary approves every row.
- Zachary sets every consequence tier. Leave tiers blank, and never suggest one.
- Never copy text from licensed sources (Practical Law, Westlaw, Lexis, MCLE) into the repository. The repository is public.
- Never add the Egleston lease, or any text from it, to the repository. Zachary tests it on his own computer.
- A "real example" must be copied from a real lease and name its source. If there isn't one yet, leave the cell blank. Never invent an example.

## How flags connect to asks

Every flag the page shows should lead to an ask. The chain is:

1. A section matches a risky version, or contains a risky warning phrase.
2. The page shows the plain-language sentence and the tier, next to the lease's own words.
3. The page shows the ask from the Asks sheet: first the plain-language ask, then "Words to propose" with the legal wording.
4. Where the ask names a better version, the page can show that version's real example, so the owner sees the better wording exists in real leases.
5. Where there's a fallback version, show it as "If they say no, ask for this instead."

For a risky warning phrase with no version match, use the "Plain-language ask" and "Legal wording to propose" columns on the Warning phrases sheet.

Above the legal wording, the page shows one line, stored once in content.json: "Wording to suggest to the landlord. It changes what the lease means, so read the final version carefully before you sign."

Square brackets in legal wording, like [ten (10)], are suggestions the owner can change. The code never fills them. Braces, like {days}, are filled from the lease.

## Consequence tiers

Zachary sets these. The definitions are here so the code and the page describe them the same way.

Tiers measure consequence only. Negotiability is a separate layer, shown through the asks, so the page answers both halves of the design question.

- **Tier 1:** could cost the owner the space, the business, or personal assets, or puts no limit on what the owner could owe.
- **Tier 2:** costs money, but the amount is limited or can be worked out from the lease.
- **Tier 3:** rules and paperwork that cost nothing directly unless the owner misses them.

Tiers belong to versions first. A version's tier overrides its clause type's tier, because two versions of one clause can differ by a whole tier. Examples: subordination with no non-disturbance promise can cost the owner the space (tier 1), while subordination with one is paperwork (tier 3). A default clause with no warning before default is tier 1, even though notice clauses are usually tier 3.

## How the spreadsheet maps to the library

Each sheet becomes one part of the library. Propose file names in ENGINE-PLAN.md before creating them.

- **Clause types:** one row per kind of clause, with trigger phrases. Extends clause-types.json.
- **Versions:** the common ways each clause is written, with cue phrases and a plain-language sentence. Blanks in braces, like `{days}`, are filled with the lease's own numbers.
- **Warning phrases:** phrases that signal a risky or a friendly version wherever they appear.
- **Asks:** one row per risky version, with a plain-language ask, legal wording to propose, and the better version to point to.
- **Glossary:** plain meanings for legal phrases, shown where they appear in the lease.
- **Missing clauses:** what to tell the owner when a protection is absent.
- **Answer key:** the format for hand-marked test leases.
- **Sources:** where the research came from and how each source may be used.
- **EDGAR leases found:** the public filings behind the real examples, with links. Reference only.
- **dataset-red-flags.xlsx (separate file, never committed):** 319 clauses from U.S.-style leases in a labeled research dataset, with a suggested clause type for each. Use them to find more trigger and cue phrases. Its labels mark topics a reviewer should read, not risk levels, and some are wrong. Never use a label to set a tier.

## The workbook right now

Every row is a draft, and every tier is blank. Nothing is approved yet. Until rows are approved:

- Build the engine so it can read draft rows in a preview mode. Mark everything shown in preview as "Draft" on the page.
- Where a tier is blank, show "Tier not set." Never fill one in.
- A row can't be Approved until its tier is set, so "Tier not set" appears only in preview.
- When rows are approved later, the live files should change without any code change.

## Sources, most helpful first

1. **Harvard Commercial Leases 101 toolkit.** Written for small-business tenants. Best source for which version is worst and what to ask for. Free. Confirm the current link and terms of use before citing.
2. **The Community Business Clinic.** Practice experience on realistic asks. Optional input, not an approval step.
3. **Practical Law commercial lease checklists and drafting notes.** Licensed. Zachary may read them to draft his own sentences. Nothing from them goes in the repository.
4. **SEC EDGAR full-text search.** Thousands of real commercial leases filed by public companies. Use it to collect different wordings of the same clause by searching exact phrases. Most are large-company leases, so they show wording, not what small tenants get.
5. **CUAD (The Atticus Project).** 510 business contracts with 41 lawyer-labeled clause kinds. Useful for cue phrases, such as anti-assignment and liability caps. Covers business contracts generally, not leases. Confirm the license before using any text.
6. **The GBREB standard form.** The form the prototype is built from. One wording per clause.

## Massachusetts law notes

These answer question 7 on the Clause types sheet. The page should never tell an owner a clause is void. It can say "Massachusetts law may limit this clause. Ask a lawyer." Every case needs a KeyCite check before anything cites it.

- **M.G.L. c. 186, § 15.** Voids lease clauses that make the tenant cover the landlord's own negligence. The SJC has applied it to commercial leases (Norfolk & Dedham Mutual Fire Ins. Co. v. Morrison, 2010). Relevant to the indemnity clause type. Status: that it applies to commercial leases was checked; get the full citation.
- **M.G.L. c. 186, § 19.** Landlord's duty to repair an unsafe condition after notice. Applied to a commercial lease in Bishop v. TES Realty Trust (2011). Relevant to repairs. Status: verify on Westlaw.
- **275 Washington St. Corp. v. Hudson River Int'l, LLC (SJC 2013).** The court read a commercial lease's remedy clause literally. Relevant to default and damages: owners should expect the words to be enforced as written. Status: checked; get the full citation.
- **M.G.L. c. 93A, § 11.** Business-to-business unfair practices claim. Whether a claim can rest on an unfair term alone is still being researched. Don't use it in owner-facing text yet.
- **Rules that protect homes but not businesses.** Massachusetts security deposit and late-fee rules for residential tenancies (c. 186, § 15B) do not cover commercial leases. Owners who rented an apartment may expect those protections. Status: verify scope before using in owner-facing text.

## Numbers the code must read

Leases write numbers in many ways. The number finders should handle:

- Words and digits together: "ten (10) days," "thirty (30) days."
- Business days versus calendar days: "ten (10) Business Days." Keep the word "business" in the plain sentence.
- Dollar amounts: "$3,000.00," "Three Thousand Dollars ($3,000.00)."
- Percentages: "five percent (5%)," "5% per annum."
- Choices: "whichever is greater," "the lesser of." Show both numbers, and say which one applies.
- Index-based amounts: "increase by the CPI." There is no number to fill in. Say the amount depends on inflation.
- Dates and years: "Base Year," "Commencement Date," "2027."

If the code can't find the number with confidence, show the sentence without the number and point to the lease's own words.

## Matching rules

- One section can match more than one version. A clause often starts with a friendly version and then takes it back with "provided, however." Check every cue in the whole section, show every version that matches, and never stop at the first match.
- Match warning phrases by their complete wording. Check for "not" nearby, so "shall not be unreasonably withheld" isn't flagged as risky.
- Capitalized terms, like "Additional Rent" or "Premises," are usually defined somewhere in the lease. Link them to their definition when the code can find it.
- Riders, exhibits, and amendments are part of the lease. A rider often changes a clause in the main lease. If a rider and a main clause match the same clause type, show both and say the rider may change the main clause.
- When a section matches no clause type, show it as "not sorted," with glossary meanings. When it matches two, show both and say the tool is unsure.

## Test leases

The research dataset (Leivaditi, Rossi and Kanoulas, 2020, CC BY-NC 4.0) includes 36 U.S.-style leases with hand-labeled section numbers and headings. Use them to test how well the engine splits a lease into sections. Use about two-thirds to build and check the rules, and hold the rest back for a fair score. Keep the dataset in a folder that is never committed to the repository, and credit the authors anywhere its results appear.

- Build from the GBREB form plus two or three EDGAR leases.
- The Egleston lease is the held-out test. Claude Code never sees it. Zachary runs it through the page on his own computer with his hand-marked answer key.
- Record the first-run result before any rule changes. Report it as "first run," and any later result as "after tuning."
- An honest claim is "it works well on leases like the ones it was built from."

## Open design decisions: don't build these

Zachary hasn't chosen these yet. Ask before building any of them.

- How Version 3 shows 10 or more cards.
- An ask list the owner builds while reading, kept on their own device.
- Showing what a clause could cost over time, using the lease's own numbers.
- A practice game on the sample lease. Never on the owner's own lease, and save nothing.
- A scripted negotiation rehearsal, with every line written ahead of time.

Don't add points, streaks, timers, a lease score, or quizzes on the owner's own lease.
