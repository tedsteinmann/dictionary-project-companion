# Initial Vertical Slice

> Historical note: this first-PR definition has now been extended into an intentional eight-question POC sequence. The current experience covers alphabetical order, guide words, definitions, multiple meanings, parts of speech, context, related words, and independent lookup while retaining the same client-only architecture.

## Feature

A visitor can choose a child or grown-up path. A child can prepare their physical dictionary, answer one structured definition challenge, retry after encouraging feedback, and reach a temporary completion screen. A grown-up can read a concise explanation of the dictionary's literacy purpose.

## User Story

As a child who received a dictionary from Rotary, I can use my book to complete a short challenge so I learn how a dictionary helps me find and understand words.

## Implementation Tasks

- Add a static-hosting-compatible client application.
- Build welcome, child introduction, challenge, feedback, completion, and concise adult-purpose screens.
- Keep question content separate from answer behavior.
- Add behavioral tests for both audience paths and the complete child flow.
- Provide mobile-first styling and accessible controls, focus, status messages, and progress.

## Acceptance Criteria

- The flow works entirely in the browser without a backend or persistence.
- The introduction says that the physical dictionary is required.
- A question is rendered from structured content with an explicit dictionary skill and literacy objective.
- An incorrect answer offers an encouraging retry; a correct answer reveals learning feedback and Rotary context.
- The completion screen celebrates the skill rather than a score.
- The experience supports phone widths, keyboard use, and reduced-motion preferences.
- No personal information is requested or stored.

## Out of Scope

- Dictionary-edition validation and any questions beyond the intentional eight-question POC sequence.
- Club customization, accounts, scores, databases, analytics, or a CMS.
- Production Rotary branding assets and local-club contact details.
