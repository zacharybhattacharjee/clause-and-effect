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
