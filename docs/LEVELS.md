# Three-stage dictionary challenge

## Feature

Replace the fixed eight-question activity with a bank preserving 99 source questions plus guided literacy lessons and three sequential challenge stages: **Find It**, **Figure It Out**, and **Discover More**. Each stage represents increasing independence with the physical dictionary rather than a child-facing Easy/Medium/Hard rank. Each attempt contains ten questions. Submit the whole attempt to see a score and missed answers; seven correct completes a stage.

### Learning progression

1. **Find It** — Learn how to navigate the book using alphabetical order, guide words, headwords, spelling, and basic definitions. This stage provides the most guided instruction.
2. **Figure It Out** — Use definitions, context, multiple meanings, parts of speech, word relationships, and reference sections to answer less-direct questions with less scaffolding.
3. **Discover More** — Put dictionary and reference-book skills to work independently on a broader, more challenging mix of searches and discoveries.

The implementation may continue to use Easy, Medium, and Hard as internal question-selection metadata, but those labels are not the product concept and should not be emphasized in child-facing copy.

## User story

As a child with a physical dictionary, I can learn dictionary skills, select or type answers, review what I missed, retry, and progress from finding information to independently discovering more, without providing personal information.

## Implementation tasks

- Import all CSV rows, retaining source IDs, categories, topics, difficulty, and primary answers; keep verification metadata internal.
- Select ten unique questions within the appropriate internal difficulty pool, balancing categories/topics and preferring unseen questions in the tab session.
- Provide reusable choice, yes/no, and typed-input components, previous/next navigation, an answer review before submission, and results only after submission.
- **Find It** has six guided lessons and four simple imported questions, with eight selectable/two typed answers. Later stages have six selectable/four typed answers; **Figure It Out** includes two guided lessons.
- Unlock stages in order at 7/10; allow retakes without removing previously earned progress.
- Produce a printable challenge certificate after passing any stage, with a random completion reference code.
- Preserve state in sessionStorage with an in-memory fallback when storage is unavailable. Keep sponsors and adult information available.

## Acceptance criteria

- All 99 imported IDs and answers are preserved in their source module (54 Easy, 26 Medium, 19 Hard source tags). The adapted playable pools contain 37 Easy, 57 Medium, and 19 Hard questions, including 16 guided lessons. Two flagged source rows remain stored but are withheld from new attempts.
- Every attempt contains exactly ten distinct questions from the selected stage's pool, normally at most three from a category and two from a subcategory.
- A retake changes the question set; unseen questions are preferred within variety limits. Repeats are inevitable as pools are exhausted, especially the 19-question final-stage pool.
- Case, outer/repeated whitespace, accents, typographic apostrophes/hyphens, and properly grouped numeric thousands separators do not cause incorrect marking. Misspellings and different numeric values remain incorrect.
- All answers can be edited before submission; no correctness, answer key, or score appears during the attempt.
- A 6/10 result permits immediate retry; 7/10 unlocks the next stage. **Discover More** completes the progression.
- Results communicate the score clearly and list missed questions with the student's answer and the supplied primary correct answer. Copy should reinforce successful searching and learning rather than a game rank.
- Passing produces a stable code for that attempt and a printable achievement, without collecting names or contact details.
- Direct result/certificate URLs cannot manufacture a completed attempt. Reload and browser navigation preserve valid tab state.
- Child/adult paths, 320px phone layouts, keyboard controls, focus, and print layout work; unit tests and static build pass.

## Out of scope

Accounts, backend persistence, globally verified or redeemable prize codes, prize inventory/redemption, child contact collection, fuzzy spelling correction, dictionary lookup APIs, and guaranteed nonrepetition across ten attempts. Prize arrangements remain with the parent/guardian and organizer.

## Completion policy

Passing any stage earns a challenge certificate showing the stage name, score, date, and a short completion code. Children may then continue to the next stage or retake an unlocked stage. Certificates earned earlier remain available in the tab session. Completion codes are random local reference codes, not proof against tampering or a centrally registered redemption system.

The completion experience should reinforce the larger learning outcome: a resourceful learner does not need to know every answer in advance; they know how to find and evaluate information when they need it.

## Content provenance and review

`content/dictionary-quiz.csv` preserves the supplied CSV. `scripts/import-questions.py` generates `src/content/imported-questions.js` and keeps `Verified` out of the student bundle. The supplied verification flags are provenance, not independent verification. The exact dictionary edition was not provided; reference sections and definitions must be checked against the distributed book. Question 12's wording asks for types of food while its supplied answer is the number 2; its displayed prompt is clarified to ask how many types. All primary answers are preserved. Previously flagged questions 4 and 22 remain stored and are withheld from new attempts pending review. See [the teaching and mixed-format specification](MIXED-QUESTIONS.md).

## Validation

`npm test` covers bank/source integrity, 3,000 seeded random attempts, formatting normalization, exact spelling, score boundaries, stage unlocking, retakes, stable certificates, and tab-state restoration. Existing sponsor rendering and static-build tests remain included.

`scripts/check-quiz-browser.js` exports a Playwright browser check. Start a local preview with `npm run dev`, navigate a Playwright page to it, and invoke the exported function with that page (or pass the function expression to the Playwright browser tool). It exercises the child and grown-up paths, 6/7/8/10 scores, all three stages, editing, escaped answer text, reload/back/forward, route guards, retained certificates, printing, phone layouts, and keyboard submission with sessionStorage blocked. No browser dependency is added to the static application.

Validated in Chromium at 320, 390, 768, and 1280px, with no horizontal overflow in the checked layouts. A generated A4 certificate PDF fits on one page. `npm run build` produces the static site successfully.
