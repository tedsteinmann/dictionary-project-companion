# Three-level dictionary challenge

## Feature

Replace the fixed eight-question activity with a 99-question bank and three sequential typed-answer levels: Codebreaker (Easy), Code Cracker (Medium), and Master Codebreaker (Hard). Each attempt contains ten questions. Submit the whole attempt to see a score and missed answers; seven correct completes a level.

## User story

As a child with a physical dictionary, I can explore varied questions, type answers, review what I missed, retry, and progress to a printable achievement without providing personal information.

## Implementation tasks

- Import all CSV rows, retaining source IDs, categories, topics, difficulty, and primary answers; keep verification metadata internal.
- Select ten unique questions within a difficulty, balancing categories/topics and preferring unseen questions in the tab session.
- Provide labeled typed inputs, previous/next navigation, an answer review before submission, and results only after submission.
- Unlock levels in order at 7/10; allow retakes without removing previously earned progress.
- Produce a printable challenge certificate after passing any level, with a random completion reference code.
- Preserve state in sessionStorage with an in-memory fallback when storage is unavailable. Keep sponsors and adult information available.

## Acceptance criteria

- All 99 IDs occur once; pools contain 54 Easy, 26 Medium, and 19 Hard questions.
- Every attempt contains exactly ten distinct questions of the selected difficulty, normally at most three from a category and two from a subcategory.
- A retake changes the question set; unseen questions are preferred within variety limits. Repeats are inevitable as pools are exhausted, especially the 19-question Hard pool.
- Case, outer/repeated whitespace, accents, typographic apostrophes/hyphens, and properly grouped numeric thousands separators do not cause incorrect marking. Misspellings and different numeric values remain incorrect.
- All answers can be edited before submission; no correctness, answer key, or score appears during the attempt.
- A 6/10 result permits immediate retry; 7/10 unlocks the next level. Master Codebreaker completes the progression.
- Results say “You cracked # out of 10!” and list missed questions with the student's answer and the supplied primary correct answer.
- Passing produces a stable code for that attempt and a printable achievement, without collecting names or contact details.
- Direct result/certificate URLs cannot manufacture a completed attempt. Reload and browser navigation preserve valid tab state.
- Child/adult paths, 320px phone layouts, keyboard controls, focus, and print layout work; unit tests and static build pass.

## Out of scope

Accounts, backend persistence, globally verified or redeemable prize codes, prize inventory/redemption, child contact collection, fuzzy spelling correction, dictionary lookup APIs, and guaranteed nonrepetition across ten attempts. Prize arrangements remain with the parent/guardian and organizer.

## Completion policy

Passing any level earns a challenge certificate showing the level name, score, date, and a short completion code. Children may then continue upward or retake an unlocked level. Certificates earned earlier remain available in the tab session. Completion codes are random local reference codes, not proof against tampering or a centrally registered redemption system.

## Content provenance and review

`content/dictionary-quiz.csv` preserves the supplied CSV. `scripts/import-questions.py` generates browser question content and keeps `Verified` out of the student bundle. The supplied verification flags are provenance, not independent verification. The exact dictionary edition was not provided; reference sections and definitions must be checked against the distributed book. Question 12's wording asks for types of food while its supplied answer is the number 2; its displayed prompt is clarified to ask how many types. All primary answers are preserved, including edition-sensitive entries such as question 22.

## Validation

`npm test` covers bank/source integrity, 3,000 seeded random attempts, formatting normalization, exact spelling, score boundaries, level unlocking, retakes, stable certificates, and tab-state restoration. Existing sponsor rendering and static-build tests remain included.

`scripts/check-quiz-browser.js` exports a Playwright browser check. Start a local preview with `npm run dev`, navigate a Playwright page to it, and invoke the exported function with that page (or pass the function expression to the Playwright browser tool). It exercises the child and grown-up paths, 6/7/8/10 scores, all three levels, editing, escaped answer text, reload/back/forward, route guards, retained certificates, printing, phone layouts, and keyboard submission with sessionStorage blocked. No browser dependency is added to the static application.

Validated in Chromium at 320, 390, 768, and 1280px, with no horizontal overflow in the checked layouts. A generated A4 certificate PDF fits on one page. `npm run build` produces the static site successfully.
