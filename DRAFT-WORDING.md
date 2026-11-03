# Draft wording for Step 9

Status: **unverified.** Claude wrote all of this for Zachary to check. Nothing here is on the page yet.

How to review it:
- Change anything you want, right in this file, or tell me the changes.
- Pay the most attention to the word meanings. They are legal content, and the testers will rely on them.
- Once you approve a section, I copy it into `content.json` and build that part. Until you've checked each draft, its field name stays in a new `unverified` list in `content.json`. You delete a name when you've checked it.

---

## 9a. What the tool does, and each version

Approved on 10/26 and copied into `content.json`. Each field is named in the `unverified` list there until you check it on the page.

### The intro at the top of the page (`page.intro`, replaces the current one)

Now: "These are three ways to show the same part of a commercial lease. Look at each one."

> Before you sign a commercial lease, you need to know two things: what you can ask to change, and what can cost you the most. This tool finds key clauses in a lease and shows them three ways. Look at each one.

### The upload screen intro (`page.uploadIntro`, replaces the current one)

Now: "Upload a commercial lease as a PDF. The tool finds the key clauses and shows them three ways."

> Upload a commercial lease as a PDF. The tool finds the key clauses and shows them three ways. It works with the Greater Boston Real Estate Board standard form, or a lease that uses the same wording.

### The privacy note (`page.privacyNote`, replaces the wrong one)

Now: "Your lease is sent to Anthropic's AI service to be read. This tool does not keep a copy." This is no longer true, so the page leaves it off today.

> Your lease stays on this computer. The tool reads it here and does not send it anywhere or keep a copy.

### One line under each version heading (new `description` on each version)

These describe what's on the screen, without saying which version is better, so they don't steer testers. Each line stays with its version when `?order=` changes the numbers.

| Version | Line |
| --- | --- |
| A (as written) | The key clauses, word for word as the lease writes them. |
| B (plain language and marks) | The same clauses as the lease writes them, with plain-language notes, a risk number, and what to ask the landlord. |
| C (most serious first) | Short cards, starting with the clause that can cost you the most. Open a card to see the plain-language notes and the lease text. |

### The Version 3 card button (`page.showDetails` and `page.hideDetails`, new)

The cards now say "Show the lease text", but the button also opens the plain-language notes.

> Show the details

> Hide the details

## 9b. Home button

Copied into `content.json` on 10/26, and named in the `unverified` list there.

The "Clause & Effect" name at the top becomes the button, so there's no new visible wording. Screen readers hear the name, then this:

| Field | Wording |
| --- | --- |
| `page.homeLabel` | Back to the start |

## 9c. Tap a word to see what it means

Approved on 10/26 and copied into `content.json` (`page.glossaryHint` and `glossary`). Both are named in the `unverified` list there until you check them on the page.

### The hint shown above the lease text (`page.glossaryHint`)

> Tap an underlined word to see what it means.

### The word list (`glossary`)

Each entry has the words as the lease writes them, and a meaning. Only the first time a word appears in each clause gets an underline, so the lease text doesn't turn into a sea of dotted lines. All 23 come from the three clauses on the page.

**Who's who and what's rented**

| Lease words | Meaning |
| --- | --- |
| LESSOR | The landlord: the owner who rents the space to you. |
| LESSEE | You, the tenant: the business renting the space. |
| leased premises | The space you are renting. |

**6B. Operating cost escalation**

| Lease words | Meaning |
| --- | --- |
| additional rent | Money you owe on top of your base rent. The lease counts it as rent. |
| operating expenses | The landlord's costs of running and keeping up the building and its land. This section lists what counts. |
| capital expenditure | Money spent on a lasting improvement to the building, such as a new boiler or roof. |
| amortized | Spread out over several years. You pay a yearly share, not the whole cost at once. |

**13. Assignment and subleasing**

| Lease words | Meaning |
| --- | --- |
| assign | Hand your lease over to another business, which takes your place as tenant. |
| sublet | Rent some or all of your space to another business while you stay the tenant. |
| prior written consent | Permission in writing, which you must get before you act. |
| Notwithstanding | Even so. Here: even if the landlord says yes. |
| liable | Legally responsible. If someone else doesn't pay, you must. |
| covenants | Promises you make in the lease. |

**19. Default and bankruptcy**

| Lease words | Meaning |
| --- | --- |
| default | Failing to do something the lease requires, such as paying rent on time. |
| written notice | A written message from the landlord about a problem. Your time to fix it starts from the notice. Section 20 says when a notice counts as delivered, which can be when it is mailed. |
| insolvent | Unable to pay your debts as they come due. |
| for the benefit of creditors | Handing your business property to someone who sells it to pay the people you owe. |
| re-enter and take complete possession | Come back into the space and take it back from you. |
| effects | Your belongings in the space, such as furniture, equipment and stock. |
| without prejudice to any remedies | Without giving up any of the landlord's other ways to get paid. |
| arrears | Money that is overdue. |
| indemnify | Pay someone back for a loss. Here, you pay the landlord back for the rent it loses. |
| residue of the term | The time left on the lease. |

**Check these closely:**
- **written notice.** The meaning points to section 20, because that's where the form says when a notice counts as served. Check that you're comfortable with "can be when it is mailed".
- **re-enter and take complete possession.** This gives only what the words mean. It doesn't say whether Massachusetts law limits how a landlord can do it. Decide whether testers need that.
- **additional rent.** "The lease counts it as rent" is how I read the words "additional rent hereunder". Check it against your reading of the form.

## 9d. What to do next

Approved on 10/26 and copied into `content.json`. The three fields are named in the `unverified` list there.

A box at the end of Versions 2 and 3 that gathers every ask on the page into one list.

| Field | Wording |
| --- | --- |
| `page.nextStepsTitle` | What to do next |
| `page.nextStepsIntro` | Here is every ask on this page in one list. Before you sign, send it to the landlord in writing, and keep a copy. |
| `page.printButton` | Print this list |

The asks themselves come from `clause-types.json`, as they do now. I didn't write new asks.

---

## Simpler wording before going live (drafted 10/26)

Status: **approved on 10/26 and copied into `content.json`,** using the second-pass versions where they overlap. Every changed field is named in the `unverified` list there. You asked for descriptions an average business owner can understand right away.

What changed in these drafts:
- Short sentences, mostly under 12 words.
- No legal or design words: no "clause", "governs", "plain-language notes" or "risk number".
- The version lines still only say what's on the screen, not which version is better.

### Lines I drafted earlier

| Field | Now | Suggested |
| --- | --- | --- |
| `page.intro` | Before you sign a commercial lease, you need to know two things: what you can ask to change, and what can cost you the most. This tool finds key clauses in a lease and shows them three ways. Look at each one. | See what you can ask to change in your lease, and what could cost you the most. Try all three versions. |
| `page.uploadIntro` | Upload a commercial lease as a PDF. The tool finds the key clauses and shows them three ways. It works with the Greater Boston Real Estate Board standard form, or a lease that uses the same wording. | Choose your lease as a PDF. The tool pulls out the parts that matter most. It works with the Greater Boston Real Estate Board standard lease. |
| `page.privacyNote` | Your lease stays on this computer. The tool reads it here and does not send it anywhere or keep a copy. | Your lease stays on your computer. Nothing is sent or saved. |
| `versions.A.description` | The key clauses, word for word as the lease writes them. | The lease's own words. |
| `versions.B.description` | The same clauses as the lease writes them, with plain-language notes, a risk number, and what to ask the landlord. | The lease's own words, explained simply, with how risky each part is and what to ask for. |
| `versions.C.description` | Short cards, starting with the clause that can cost you the most. Open a card to see the plain-language notes and the lease text. | The riskiest parts first. Tap a card to see more. |
| `page.nextStepsIntro` | Here is every ask on this page in one list. Before you sign, send it to the landlord in writing, and keep a copy. | Everything to ask for, in one list. Send it to the landlord in writing before you sign. |

Two of these say a little less than before:
- **The upload line** drops "or a lease that uses the same wording". That's still true, but most owners won't know whether their lease uses the same wording.
- **The next-steps line** drops "and keep a copy". Add it back if you want it.

### Your own lines, which you may also want simpler

You wrote these earlier, so I've only suggested changes. Keep any as they are.

| Field | Now | Suggested |
| --- | --- | --- |
| `page.governsSample` | The plain-language explanations help you read the lease. The lease text governs. | These explanations help you read the lease. If they ever differ, the lease's own words win. |
| `page.youMeans` | In these explanations, "you" means the tenant: the business renting the space. | "You" means your business, the tenant. |
| `tags.consequence.scale` | Ranked from 1, the clause that can cost you the most. | Number 1 could cost you the most. |
| `page.notFoundNote` | The tool did not find these clauses. The lease may not have them, or the tool may have missed them. | The tool didn't find these parts. Your lease may not have them, or the tool may have missed them. |

The other lines are already short and clear, so I left them alone: the title, "Upload Your Lease", the reading message, the error message and the tap-a-word hint.

### Second pass: a Boston owner using it for the first time

Picture someone who runs a café or a salon, has never read a lease closely, and just got one by email from a broker. I went through the page screen by screen and asked where they'd get stuck.

**Wording changes.** These replace the suggestions above where they overlap.

| Where | The owner thinks | Suggested |
| --- | --- | --- |
| Upload screen (`page.uploadIntro`) | "Is mine a Greater Boston Real Estate Board lease? How would I know?" | Choose your lease as a PDF. The tool pulls out the parts that matter most. It works with one common Boston lease: look for "Standard Form Commercial Lease" at the top of page 1. |
| Privacy note (`page.privacyNote`) | On a phone: "What computer?" | Your lease never leaves this device. Nothing is sent or saved. |
| Sample button (`page.sampleButton`, your line) | "Instead of what? Is this my lease?" | Try it with a sample lease |
| Error (`page.error`, your line) | "What does 'select the text' mean?" Most owners get a scanned copy, which is exactly when this appears. | The tool couldn't read this file. If it's a scan or a photo, ask your landlord or broker for the original PDF. |
| Top of Versions 2 and 3 (`tags.consequence.scale`, your line) | "Risk of what?" | Number 1 could cost you the most money, or your space. |
| What to do next (`page.nextStepsIntro`) | "Can I just email this to the landlord?" | Everything to ask for, in one list. Email it to your landlord or broker before you sign, and keep a copy. |

**Things wording can't fix.** These are layout or content calls, so they're yours. Each comes from the same first-time owner.

1. **"Who do I ask, and do I need a lawyer?"** The page says to ask the landlord, but many first-time owners won't feel able to. One line pointing to free help, such as the Community Business Clinic, could matter most of all. Any wording that names the CBC goes through this file first. You'd also need to confirm the clinic is happy to be named.
2. **The tap-a-word hint is easy to miss.** It sits in the notes box at the top. On a phone, the owner has scrolled well past it before seeing the first dotted underline. Moving it next to the first lease text would be a layout change.
3. **Blank form, blank gaps.** Your test PDF is the blank form, so 6B reads "…percent of any increase in operating expenses over those incurred during the calendar year ." with gaps where the numbers go. A tester may think the tool broke. Testing with a filled-in copy would avoid that, as long as it has no real tenant's details.
4. **"Version 1, 2, 3" means nothing to an owner.** That's on purpose for testing, and the intro now says to try all three. Just know that a real owner, rather than a tester, would want one view, not three.
5. **"Upload a different lease" is the first button after the upload.** A first-timer might press it, thinking it's the next step. Moving it below the versions would be a layout change.
6. **Many Boston owners read English as a second language.** That's 9e (translate), which you set aside until after testing. Worth noting as something to watch in testing.

## Workbook fixes from the first engine run (drafted 11/3)

Status: **for you to paste into `library/clause-library.xlsx`.** I haven't changed the workbook. After you paste them, run `python3 tools/convert-workbook.py` (or ask me to), and the engine picks them up. Until then, the same fixes are in `library/proposed-fixes.json`, so the check page can try them. Delete that file once they're in the workbook.

I tested every fix below on the GBREB form and the 13 build leases, by applying them to a temporary copy. Both columns include the engine fixes listed next:

| | Today's library | With these fixes |
| --- | --- | --- |
| GBREB form (31 pieces) | 18 sorted, 0 unsure, 13 not sorted | 27 sorted, 0 unsure, 4 not sorted |
| 13 build leases | 459 sorted, 21 unsure | 511 sorted, 21 unsure |

On the form, only the title area, 1 parties, 2 premises and 27 other provisions stay "not sorted". They have no clause type, which is accurate.

(Earlier I wrote "28 sorted, 3 not sorted". That was a counting mistake: it's 27 and 4.)

### Two engine fixes I already made (code, not the workbook)

- **LESSOR and LESSEE now match Landlord and Tenant.** Every cue phrase in the workbook says "Landlord" and "Tenant", but the GBREB form says "LESSOR" and "LESSEE", so most versions couldn't match the form. The engine now reads the two pairs as the same words. Keep writing cues with Landlord and Tenant.
- **Sections 6 and 11 no longer take their parts' text.** On the form, 6A's and 11A's text starts beside the parent heading. The engine now gives that text to 6A and 11A, and drops headings with no text of their own, such as 6 "RENT ADJUSTMENT".
- **A phrase inside a longer matched phrase doesn't count again.** "maintenance" inside "Common Area Maintenance" now counts only for building costs, and "in good order" inside "good order and condition" counts once.
- **The heading wins a close call.** When two types are close but only one of them appears in the section's heading, the heading's type wins. A section headed "BROKERS" that also mentions "indemnify" is now about brokers.

### Why some build-lease sections became unsure

With my first list of fixes, 13 build-lease sections became unsure and 8 stopped being unsure, so the count rose by 5, not by 5 particular sections. The 13 came from four phrases:

| Phrase | Sections | What it was | Fix |
| --- | --- | --- | --- |
| "brokers", "brokerage" (new brokerage type) | 4 | Sections headed "BROKERS" also mention "indemnify" and "hold harmless". Brokerage was right. | The heading rule above. No change to the phrase. |
| "maintenance" (repairs) | 5 | Three are one mixed section ("Repairs, Maintenance, Services and Utilities"), one is "Maintenance, Repairs and Alterations", and one is "Common Area Maintenance Charges". | The phrase-inside-a-phrase rule fixes the last one. The other two really are about two things, so "unsure" is honest. |
| "use of the premises" (use) | 3 | Too common in lease text, such as inside subletting and rooftop sections. | Removed from the use triggers. "Use" is added instead, and as a single word it counts only in headings. |
| "in good order" (repairs) | 1 | It counted twice, next to "good order and condition". | The phrase-inside-a-phrase rule. |

With the changes below, the build leases' unsure count stays at 21. Three sections still change to unsure, and each heading names two topics: "Repairs, Maintenance, Services and Utilities", "Maintenance, Repairs and Alterations" and "Premises, Term and Use".

### Changes to existing rows

Paste each "new value" over the whole cell.

**Clause types sheet, "Trigger phrases" column:**

| Clause type ID | Why | New value |
| --- | --- | --- |
| rent-base | "escalation" made 6A and 6B unsure. Rent on the form is "fixed rent at the rate of", and 6C is about the Price Index. | Base Rent; Annual Rent; Minimum Rent; Fixed Rent; rent adjustment; rent at the rate of; CPI; Consumer Price Index; Price Index |
| operating-costs | "Additional Rent", "Base Year" and "proportionate share" also appear in tax clauses, so 6A looked like both. The form's heading says "operating cost". | Operating Expenses; Operating Costs; operating cost; Common Area Maintenance; CAM |
| repairs | The form's heading is "MAINTENANCE", and its wording is "agrees to maintain" and "in good order". | repair; maintain; maintenance; agrees to maintain; maintain the structure; good order and condition; in good order; in good repair; HVAC; structural; roof; exterior walls |
| condition-premises | The form's heading is "CONDITION OF PREMISES", without "the". | as is; condition of the Premises; condition of premises; Landlord's Work; Tenant's Work |
| use | The form's heading is "USE OF LEASED PREMISES". "Use" counts only in headings, since it's a single word. | Use; Permitted Use; use the Premises for; use of leased premises; for no other purpose |
| assignment-subletting | Only the heading counted before. Single words like "sublet" count only in headings. | assign; assignment; assign or sublet; sublet; sublease; transfer; change of control; recapture |

**Versions sheet:**

| Version ID | Column | Why | New value |
| --- | --- | --- | --- |
| casualty-landlord-may-terminate | Cue phrases | "fire or other casualty" is in every casualty clause, so it doesn't tell this version apart. The form still matches through "Landlord may … terminate this Lease". | Landlord may ... terminate this Lease; days after the damage |
| transfer-tenant-stays-liable | Cue phrases | The form says "shall remain liable". | remain primarily liable; shall not relieve Tenant; shall not release Tenant; shall remain liable |
| subordination-only | Cue phrases | The form says "subject and subordinate to any and all mortgages". A lease that also has a non-disturbance promise will match both versions, and both will show. | subject and subordinate to the lien of any mortgage; subject and subordinate to |
| opex-base-year | Numbers to fill | The converter's one problem: `share` is listed, but the sentence has no `{share}`. | base_year |

### New clause types

These fill the gaps on the form (sections 9, 10, 22, 24 and 26). Add each as a new row on the Clause types sheet. The "Plain name" is owner-facing wording, so it's a draft for you to change. Tier stays blank for you.

| Clause type ID | Plain name (draft) | GBREB section | Trigger phrases | Tier | Status |
| --- | --- | --- | --- | --- | --- |
| liability-of-owner | Limits on what the landlord owes you | 26 | liability of owner; liability of landlord; landlord's liability; limitation of landlord's liability; no owner of the property | | Draft (Claude) |
| force-majeure | Delays no one can control | 24 | force majeure; beyond the control of; beyond its reasonable control; acts of God; unavoidable delays | | Draft (Claude) |
| brokerage | The real estate broker | 22 | brokerage; broker; brokers; brokerage commission; real estate broker | | Draft (Claude) |
| compliance-with-laws | Following laws and local rules | 9 | compliance with laws; comply with all laws; applicable laws; by-law or ordinance | | Draft (Claude) |
| insurance-increase | Uses that raise the building's insurance | 10 | fire insurance; make voidable any insurance; extra insurance premiums; increase the rate of insurance; rate of fire insurance; increase in insurance premiums | | Draft (Claude) |

These have no versions yet, so they'll show as sorted but with nothing to explain until you add versions.

### Your call

- **Section 10, "FIRE INSURANCE",** now has its own type, `insurance-increase` (you decided on 11/3). Section 17 still sorts as "insurance", and no build lease changed.
- **Parties (1), premises (2) and other provisions (27)** stay "not sorted". That seems right to me, since they're basic terms and signatures, not risks. Add types only if you want them in the tier list.
- **The 15 number blanks that can't be filled yet** wait for stage 2. I'll draft their cue phrases then.

## Round 2 test page wording (drafted 11/3)

Status: **unverified.** These lines are in `content-round-two.json`, which only the round 2 test page (`round-two.html`) reads. The live page and `content.json` are unchanged. Once you approve them, they move into `content.json` when round 2 goes live.

### My drafts, for you to approve

| Field | Draft |
| --- | --- |
| `page.draftNote` | Test version. Some wording on this page is still a draft. |
| `splash.title` | How this works |
| `splash.whatItIs` | This tool reads your lease and sorts its sections by what they could cost you. For each section, it shows what the lease says, what it means, and what you can ask the landlord to change. |
| `splash.sortingTitle` | How your lease is sorted |
| `splash.sorting` | Each section gets a tier, shown in red, yellow or green, always with its name. Sections the tool couldn't match go in their own group at the end, with the lease's own words. |
| `splash.versionsTitle` | Three ways to read it |
| `splash.versionsIntro` | All three show the same sections and the same explanations, arranged differently. Try each one. |
| `splash.scaleTitle` | What the tiers mean |
| `splash.wholeLeaseTitle` | The whole lease, in order |
| `splash.wholeLease` | To read every section in the lease's own order, choose “Whole lease, in order” at the top of any version. |
| `splash.chooseTitle` | Choose a version to start |
| `versions.A.name` | Lease text first |
| `versions.A.description` | Each section starts with the lease's own words, with its explanation beside them. |
| `versions.B.name` | What to ask first |
| `versions.B.description` | In each tier, sections you can ask to change come first, each with what to ask and why. |
| `versions.B.flagLine` | Flagged sections are ones you can ask the landlord to change. Each one shows what to ask, and why. |
| `versions.C.name` | Risk summary first |
| `versions.C.description` | Short summaries, highest stakes first. The lease's own words are one click away. |
| `tiers.notSetMeaning` | This section's tier hasn't been set yet. |
| `labels.flag` | You can ask about this |
| `labels.leaseSays` | The lease says |
| `labels.whatItMeans` | What it means |
| `labels.showLeaseWords` | Show the lease's words |
| `labels.hideLeaseWords` | Hide the lease's words |
| `labels.whyYouCanAsk` | Why you can ask |
| `labels.nextStep` | Next step |
| `labels.realExample` | In a real lease |
| `labels.wholeLease` | Whole lease, in order |
| `labels.howItWorks` | How this works |
| `labels.close` | Close |
| `labels.printPage` | Print this page |
| `labels.onThisPage` | On this page |
| `labels.notSortedIntro` | The tool couldn't match these sections to a clause type. Read the lease's own words, and tap an underlined word to see what it means. |
| `labels.blankNumber` | (see the lease) |
| `labels.section` | Section |
| `labels.startOfLease` | Start of the lease |

### Your own wording, from your answers

These come from your answers on 10/26 and the workbook's "How to use" sheet (the tier meanings). They need no approval, just a check that I copied them right.

| Field | Wording |
| --- | --- |
| `tiers.1.name` | Highest stakes |
| `tiers.2.name` | Costs money |
| `tiers.3.name` | Rules and paperwork |
| `tiers.1.meaning` | Could cost you the space, the business, or personal assets, or puts no limit on what you could owe. |
| `tiers.2.meaning` | Costs money, but the amount is limited or can be worked out from the lease. |
| `tiers.3.meaning` | Rules and paperwork that cost nothing directly unless you miss them. |
| `tiers.notSet` | Tier not set |
| `labels.goodForYou` | Good for you |
| `labels.whatToAsk` | What to ask |
| `labels.wordsToPropose` | Words to propose |
| `labels.ifTheySayNo` | If they say no, ask for this instead |
| `labels.legalCaution` | Wording to suggest to the landlord. It changes what the lease means, so read the final version carefully before you sign. |
| `labels.proofLine` | From a lease a company filed publicly. Larger tenants often get better terms, so this shows the wording exists, not that your landlord will agree. |
| `labels.datasetCredit` | From Leivaditi, Rossi & Kanoulas (2020), CC BY-NC 4.0. |
| `labels.unsureLine` | This section could be either of these. Check the lease's own words. |
| `labels.notSortedTitle` | Sections the tool couldn't sort |

### In the workbook, also drafts

- **Versions sheet:** "Suggested tier" and "Reason" for all 49 versions, in green cells. The real "Tier override" column is still blank. If you agree with a suggestion, copy it into "Tier override", or into the clause type's Tier.
- **Asks sheet:** "Why you can ask", "Next step" and "Softer way to say it" for all 24 asks, in green cells. Each row keeps its "Draft (Claude)" status until you approve it.

## Simpler asks, like round 1 (drafted 11/3)

Status: **for you to approve.** Nothing on the page or in the workbook has changed yet.

Round 1 testers liked short, clear bullets under one line: "Before you sign, ask the landlord in writing for:". Round 2 stacks six parts under every ask. This draft brings back the bullet and puts everything else behind one click.

### How a flagged section would look

> **Before you sign, ask the landlord in writing for:**
> - A cap or an end date on your personal guaranty
>
> *Why:* It protects your own savings.
>
> ▸ See what to say

- **The bullet** finishes the sentence "ask the landlord in writing for:". That line is your round 1 wording (`tags.negotiable.askIntro`), already approved.
- **"Why"** is one short line.
- **One closed button, "See what to say", holds the rest:** the words to propose with your caution line, the real lease example, the fallback, and the next step.

### How "What to do next" would look

> **What to do next**
>
> Everything to ask for, in one list. Email it to your landlord or broker before you sign, and keep a copy.
>
> 1. A cap or an end date on your personal guaranty. *Why:* It protects your own savings.
> 2. Written notice and time to pay before a late payment is a default. *Why:* A real lease includes this.
> 3. …
>
> [Print this list]

- It's numbered, highest stakes first, with one ask and one short "why" per line.
- The printed list adds the words to propose under each ask, so you can hand it to the landlord. Say if you'd rather print only the bullets.

### The short asks and why lines

Revised with the UX writing skill (11/3).
- **Every ask finishes the sentence** "Before you sign, ask the landlord in writing for:", so they all read the same way.
- **Asks are 14 words or fewer,** and most are under 12.
- **Each "why" is one short line.** Where a real lease example exists, the line is always "A real lease includes this." The example itself is behind the button.

These would replace the longer "Plain-language ask" and "Why you can ask" drafts in the workbook. The longer versions would move behind the button.

| Version | Ask for | Why |
| --- | --- | --- |
| default-no-notice | Written notice and time to pay before a late payment is a default | A real lease includes this. |
| default-notice-limited | Written notice before every default, not just the first few | A real lease includes this. |
| default-statutory-notice-replaced | Notice that adds to the law's notice, instead of replacing it | Otherwise you could get less time than the law gives. |
| guaranty-unlimited | A cap or an end date on your personal guaranty | It protects your own savings. |
| guaranty-payment-not-collection | A promise to collect from the business before coming to you | You should be the backup, not the first stop. |
| guaranty-survives-changes | Your written OK before your guaranty covers a renewal or change | You shouldn't owe on terms you never saw. |
| opex-full-share | Paying only cost increases over a base year, or a yearly cap | A real lease includes this. |
| opex-includes-capital | Leaving major upgrades, like a new roof, out of your share | They outlast your lease. |
| opex-estimates-only | A limit on charges above the estimate, and a look at the records | So you can plan and check the bill. |
| opex-cap-carryforward | A yearly cost cap that resets each year | Otherwise a quiet year allows a bigger jump later. |
| transfer-sole-discretion | A promise not to refuse a transfer without a good reason | Otherwise the landlord can block a sale of your business. |
| transfer-change-of-control | The right to sell your business without asking permission | It keeps the sale of your business in your hands. |
| transfer-recapture | A promise not to take the space back when you ask to transfer | Asking shouldn't cost you the space. |
| transfer-tenant-stays-liable | Release from the lease once the landlord approves your buyer | The buyer should owe the rent from then on. |
| relocation-or-lease-ends | A promise not to move you without your agreement | Moving can cost you customers. |
| relocation-cost-unstated | Moving costs paid by the landlord, and the new space finished first | A real lease includes this. |
| termination-on-notice | More notice, and repayment of what you spent on the space | A real lease includes this. |
| deposit-top-up | More time to refill the deposit, such as 30 days | A few days may not be enough. |
| utilities-no-liability | Lower rent if an outage the landlord causes lasts more than a few days | You shouldn't pay full rent for space you can't use. |
| utilities-no-rent-reduction | Lower rent if a service is out for more than a few days | You shouldn't pay full rent for space you can't use. |
| surrender-remove-all | Removing only the changes the landlord names in writing | You'll know your move-out costs up front. |
| casualty-landlord-may-terminate | No rent while the space is unusable, and a way out if repairs drag | A real lease includes this. |
| subordination-only | A promise from the landlord's lender to keep your lease | Without it, a new owner might not keep your lease. |
| no-early-exit | A way to end the lease early, with notice and a fee | It limits what closing could cost you. |

### Two more page lines, for "Risk summary first" and the ask bullets

| Field | Draft |
| --- | --- |
| `labels.thingsToAsk` | Things to ask for |
| `labels.why` | Why |

### One new button label

Buttons work best at 2 to 4 words, so the label is shorter than my first draft.

| Field | Draft |
| --- | --- |
| `labels.moreAboutAsk` | See what to say |

## Still yours to decide

- **9e. Translate.** I left it out, as you asked. It waits until after testing.
- **Who does the asking.** "Send it to the landlord" leaves out a lawyer or broker, as question 12 in the first plan suggested. Watch whether testers ask "who?".
