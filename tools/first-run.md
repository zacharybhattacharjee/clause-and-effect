# Engine results

Each run is recorded here, so later changes can be compared with the first run. Numbers only, never lease text.

Dataset: Leivaditi, Rossi & Kanoulas (2020), DOI 10.21942/uva.19732993.v1, CC BY-NC 4.0. The build and held-back leases are listed in `tools/dataset-split.json`.

## First run (11/3, before any tuning)

Settings: heading trigger = 2 points, body trigger = 1 point, sorted at 2 or more points, "unsure" when the second-best type has 2 or more points and at least 75% of the best score. Single-word triggers count only in headings, except the 12 words in decision 6 of `ENGINE-PLAN.md`.

### Splitting the research-dataset leases into sections

A section counts as found when the engine finds a section with the same number the dataset labels.

| Leases | Labeled sections | Found | Share found | Everything the engine reported | Of those, real sections or sub-parts |
| --- | --- | --- | --- | --- | --- |
| Build (13) | 336 | 274 | 82% | 805 | 667 (83%) |
| Held back (7) | 228 | 119 | 52% | 358 | 317 (89%) |

### The GBREB standard form (sorting, with draft rows)

- **Splitting:** all 27 sections and the lettered parts 6A, 6B, 6C, 11A and 11B, with their full headings. Only the page footers were dropped.
- **Sorting:** 33 pieces (the 32 sections and lettered parts, plus the title area before section 1). 16 sorted, 3 unsure, 14 not sorted. Every sorted section went to the type you'd expect.
- **Unsure (all from the trigger "escalation"):** 6 (rent adjustment, between rent-base and operating-costs), 6A (rent-base and taxes), 6B (rent-base and operating-costs).
- **Not sorted:**
  - No clause type in the workbook: 1 parties, 2 premises, 8 use, 9 compliance with laws, 22 brokerage, 24 force majeure, 26 liability of owner, 27 other provisions.
  - Triggers that don't match the form's wording: 4 rent, 11, 11A and 11B maintenance, 23 condition of premises.
- **Versions found:**
  - utilities-metered (7)
  - casualty-landlord-may-terminate (18), matched by the general cue "fire or other casualty"
  - default-notice-and-cure (19)

## After tuning the splitter (11/3)

Tuned on the 13 build leases only. I didn't open the held-back leases. Their score was measured once, after tuning.

What changed in the splitter:
- A number with no space before the heading counts, such as "1.Premises.".
- "ARTICLE 5" on its own line starts a section, and the next line is its heading if it looks like one.
- A short heading that fills the whole line may be in sentence case, such as "7 Repairs and alterations".
- A street address such as "64 Sidney Street" isn't a section.
- An exhibit's name repeated at the top of its own pages doesn't start a new section.

The sorting settings didn't change.

| Leases | Labeled sections | Found | Share found | Everything reported | Of those, real sections or sub-parts |
| --- | --- | --- | --- | --- | --- |
| Build (13) | 336 | 335 | 100% | 875 | 739 (84%) |
| Held back (7) | 228 | 150 | 66% | 387 | 348 (90%) |
| GBREB form | 32 | 32 | 100% | 32 | 32 |

The gap between 100% and 66% is the honest picture: the splitter works well on layouts like the ones it was tuned on, and less well on new ones.

## Engine fixes, and workbook fixes tested in memory (11/3)

Engine changes:
- LESSOR and LESSEE are read as Landlord and Tenant when matching.
- On the GBREB form, a lettered part's text that starts beside its parent's heading goes to the part, and headings with no text of their own are dropped. The form now splits into 31 pieces: 32 sections and parts, minus 6 and 11, plus the title area.

The workbook fixes listed in `DRAFT-WORDING.md` were applied to a temporary copy of the library, not to the workbook:

| | Engine fixes only | Engine and workbook fixes |
| --- | --- | --- |
| GBREB form | 21 sorted, 2 unsure, 8 not sorted | 28 sorted, 0 unsure, 3 not sorted |
| 13 build leases | 451 sorted, 29 unsure | 487 sorted, 34 unsure |

The held-back leases weren't run for this. They'll be scored once the fixes are in the workbook.
