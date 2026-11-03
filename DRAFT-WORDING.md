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

Status: **for you to paste into `library/clause-library.xlsx`.** I haven't changed the workbook. After you paste them, run `python3 tools/convert-workbook.py` (or ask me to), and the engine picks them up.

I tested every fix below on the GBREB form and the 13 build leases, by applying them to a temporary copy:

| | Before | After |
| --- | --- | --- |
| GBREB form | 16 sorted, 3 unsure (first run) | 28 sorted, 0 unsure |
| 13 build leases | 451 sorted, 29 unsure | 487 sorted, 34 unsure |

On the form, only 1 parties, 2 premises, 27 other provisions and the title area stay "not sorted". They have no clause type, which is accurate.

### Two engine fixes I already made (code, not the workbook)

- **LESSOR and LESSEE now match Landlord and Tenant.** Every cue phrase in the workbook says "Landlord" and "Tenant", but the GBREB form says "LESSOR" and "LESSEE", so most versions couldn't match the form. The engine now reads the two pairs as the same words. Keep writing cues with Landlord and Tenant.
- **Sections 6 and 11 no longer take their parts' text.** On the form, 6A's and 11A's text starts beside the parent heading. The engine now gives that text to 6A and 11A, and drops headings with no text of their own, such as 6 "RENT ADJUSTMENT".

### Changes to existing rows

Paste each "new value" over the whole cell.

**Clause types sheet, "Trigger phrases" column:**

| Clause type ID | Why | New value |
| --- | --- | --- |
| rent-base | "escalation" made 6A and 6B unsure. Rent on the form is "fixed rent at the rate of", and 6C is about the Price Index. | Base Rent; Annual Rent; Minimum Rent; Fixed Rent; rent adjustment; rent at the rate of; CPI; Consumer Price Index; Price Index |
| operating-costs | "Additional Rent", "Base Year" and "proportionate share" also appear in tax clauses, so 6A looked like both. The form's heading says "operating cost". | Operating Expenses; Operating Costs; operating cost; Common Area Maintenance; CAM |
| repairs | The form's heading is "MAINTENANCE", and its wording is "agrees to maintain" and "in good order". | repair; maintain; maintenance; agrees to maintain; maintain the structure; good order and condition; in good order; in good repair; HVAC; structural; roof; exterior walls |
| condition-premises | The form's heading is "CONDITION OF PREMISES", without "the". | as is; condition of the Premises; condition of premises; Landlord's Work; Tenant's Work |
| use | The form's heading is "USE OF LEASED PREMISES". | Permitted Use; use the Premises for; use of leased premises; use of the premises; for no other purpose |
| assignment-subletting | Only the heading counted before. Single words like "sublet" count only in headings. | assign; assignment; assign or sublet; sublet; sublease; transfer; change of control; recapture |

**Versions sheet:**

| Version ID | Column | Why | New value |
| --- | --- | --- | --- |
| casualty-landlord-may-terminate | Cue phrases | "fire or other casualty" is in every casualty clause, so it doesn't tell this version apart. The form still matches through "Landlord may … terminate this Lease". | Landlord may ... terminate this Lease; days after the damage |
| transfer-tenant-stays-liable | Cue phrases | The form says "shall remain liable". | remain primarily liable; shall not relieve Tenant; shall not release Tenant; shall remain liable |
| subordination-only | Cue phrases | The form says "subject and subordinate to any and all mortgages". A lease that also has a non-disturbance promise will match both versions, and both will show. | subject and subordinate to the lien of any mortgage; subject and subordinate to |
| opex-base-year | Numbers to fill | The converter's one problem: `share` is listed, but the sentence has no `{share}`. | base_year |

### New clause types

These fill the gaps on the form (sections 9, 22, 24 and 26). Add each as a new row on the Clause types sheet. The "Plain name" is owner-facing wording, so it's a draft for you to change. Tier stays blank for you.

| Clause type ID | Plain name (draft) | GBREB section | Trigger phrases | Tier | Status |
| --- | --- | --- | --- | --- | --- |
| liability-of-owner | Limits on what the landlord owes you | 26 | liability of owner; liability of landlord; landlord's liability; limitation of landlord's liability; no owner of the property | | Draft (Claude) |
| force-majeure | Delays no one can control | 24 | force majeure; beyond the control of; beyond its reasonable control; acts of God; unavoidable delays | | Draft (Claude) |
| brokerage | The real estate broker | 22 | brokerage; broker; brokers; brokerage commission; real estate broker | | Draft (Claude) |
| compliance-with-laws | Following laws and local rules | 9 | compliance with laws; comply with all laws; applicable laws; by-law or ordinance | | Draft (Claude) |

These have no versions yet, so they'll show as sorted but with nothing to explain until you add versions.

### Your call

- **Section 10, "FIRE INSURANCE",** sorts as "insurance" ("Insurance you must carry"). It's really about not doing anything that raises the building's insurance. Keep it there, or give it its own type.
- **Parties (1), premises (2) and other provisions (27)** stay "not sorted". That seems right to me, since they're basic terms and signatures, not risks. Add types only if you want them in the tier list.
- **The 15 number blanks that can't be filled yet** wait for stage 2. I'll draft their cue phrases then.

## Still yours to decide

- **9e. Translate.** I left it out, as you asked. It waits until after testing.
- **Who does the asking.** "Send it to the landlord" leaves out a lawyer or broker, as question 12 in the first plan suggested. Watch whether testers ask "who?".
