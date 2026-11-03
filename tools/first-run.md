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
| GBREB form (31 pieces) | 16 sorted, 2 unsure, 13 not sorted | 28 sorted, 0 unsure, 3 not sorted |
| 13 build leases | 451 sorted, 29 unsure | 487 sorted, 34 unsure |

The held-back leases weren't run for this. They'll be scored once the fixes are in the workbook.

## Two more sorting rules (11/3)

Added after looking at the build leases only:
- A trigger phrase inside a longer matched phrase, from any type, doesn't count again.
- When two types are close but only the leading one appears in the heading, it wins.

Also in the proposed fixes: "use of the premises" was removed and "Use" added (headings only), and `insurance-increase` was added for GBREB section 10.

| | Today's library | With the proposed fixes |
| --- | --- | --- |
| GBREB form (31 pieces) | 18 sorted, 0 unsure, 13 not sorted | 27 sorted, 0 unsure, 4 not sorted |
| 13 build leases | 459 sorted, 21 unsure | 511 sorted, 21 unsure |

The earlier "28 sorted, 0 unsure, 3 not sorted" for the form was a counting mistake. The right numbers were 27 sorted and 4 not sorted.

The Egleston lease is never run here. Zachary runs it on his own computer, on the check page.

## Workbook fixes applied to the workbook (11/3)

The fixes from `DRAFT-WORDING.md` and the five new clause types are now in `library/clause-library.xlsx`, as Draft rows. `library/proposed-fixes.json` was removed. The library has 37 clause types.

| | Sorted | Unsure | Not sorted |
| --- | --- | --- | --- |
| GBREB form (31 pieces) | 27 | 0 | 4 |
| 13 build leases | 511 | 21 | 663 |

These match the in-memory test above. Flags on the GBREB form: 13 (transfer-tenant-stays-liable), 14 (subordination-only) and 18 (casualty-landlord-may-terminate).

## Zachary's tiers entered (11/3)

For round 2 only, Zachary set the tiers and had Claude enter them in the real Tier column and "Tier override". Statuses are unchanged (all Draft). The default clause and all six default versions are tier 1, per his correction. On the GBREB form:

| Group | Sections |
| --- | --- |
| Highest stakes | 6A, 6B, 10, 14, 16, 18, 19, 23 |
| Costs money | 4, 5, 6C, 7, 11A, 11B, 13, 17, 21, 24, 25, 26 |
| Rules and paperwork | 3, 8, 9, 12, 15, 20, 22 |
| Couldn't sort | title area, 1, 2, 27 |

Still blank: clause types assignment-subletting, relocation, subordination-estoppel and riders-amendments; versions relocation-landlord-pays, relocation-limited, relocation-move-when-ready and utilities-metered.
