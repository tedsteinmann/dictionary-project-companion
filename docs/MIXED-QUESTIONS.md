# Guided dictionary lessons and mixed answers

## Feature

Make Level 1 a supported introduction to dictionary use and offer reusable multiple-choice, yes/no, and typed-answer controls throughout the challenge. Preserve the supplied 99-question source bank and restore the original literacy lessons.

## User story

As a child using a physical dictionary, I can learn how to find and understand words with clear tips, answer mostly by selecting an option, and build confidence before harder reference hunts.

## Implementation tasks

- Keep the CSV and generated imported questions unchanged; compose a separate playable bank with authored teaching questions and presentation adaptations.
- Restore alphabetical order, community guide words, volunteer definitions, service meanings, generous parts of speech, cooperation, and leader word families. Restore independent discovery as an optional unscored activity after submission.
- Give Level 1 six guided lessons and four simpler imported questions, eight selectable responses and two short typed responses. Use six selectable/four typed answers in later levels, including two guided lessons in Level 2.
- Reclassify demanding Easy source questions for Level 2 while retaining source difficulty metadata. Keep questionable source rows archived and explicitly flagged pending content review.
- Build small answer, dictionary-tip, icon, and learning-review components. Use native radios for selection/yes-no and a text field for typing; SVGs supplement visible labels and guide-word instruction.
- Shuffle options once per attempt; retain order and selection through editing/reloads. Show navigation tips during the quiz, explanations and correct answers only after submission.

## Acceptance criteria

- All 99 imported IDs and primary answers remain recoverable, and imported generation does not overwrite authored lessons.
- Every Level 1 attempt has six guided lessons, eight selectable answers, two short typed answers, and no advanced reference hunts; every later attempt includes selectable and typed answers.
- Retakes change the set and prefer unseen content within the learning/format mix. Avoid repeated narrow topics and concentrated Presidents/Countries questions.
- Native controls support keyboard selection, visible focus, large touch targets, and explicit selected state without color dependence. SVGs do not replace meaningful text.
- Selection never advances automatically or reveals correctness. Answers can be edited before final submission; scoring remains 7/10 with certificates at every passed level.
- Correct and missed questions both offer post-submission learning explanations, with optional service context and independent dictionary discovery.
- Existing certificates/unlocks survive compatible stored sessions. Browser checks cover mixed inputs, review, retakes, all levels, mobile/print, and blocked storage.

## Out of scope

Drag-only puzzles, timers, fuzzy spelling, book-replacing dictionary APIs, new packages/frameworks, accounts, backend persistence, and prize administration.

## Validation

All 24 Node tests pass, including 3,000 seeded mixed attempts, source preservation, restored lessons, exact answer checking, format quotas, category/topic limits, shuffled choices, and legacy session/certificate compatibility. The static build passes.

The Playwright walkthrough in `scripts/check-quiz-browser.js` passes for multiple-choice, yes/no, typed responses, all three levels, 6/7/8/10 scores, tips, learning review, optional discovery, editing, reload/history, certificates, printing, and disabled sessionStorage. Native radio Space/arrow keys, keyboard submission, focus, 44px targets, and representative 320–1280px layouts were checked. Phone screenshots of choice questions and the guide-word illustration were reviewed.
