# Content Strategy and Quiz Model

## Content goal

Help children navigate their physical dictionary, interpret entries, read reference sections, and practice independent learning. The book supplies the answers. Prior Rotary knowledge is unnecessary. Rotary service context follows the learning experience and remains separate from scoring.

## Current question bank

The source is `content/dictionary-quiz.csv`, preserving the supplied 99 rows. Run `python3 scripts/import-questions.py` to regenerate `src/content/questions.js`. Builds use that checked-in JavaScript module and need no runtime CSV parser or backend.

| Level | Name | Difficulty | Pool size | Questions per attempt |
|---|---|---|---|---|
| 1 | Codebreaker | Easy | 54 | 10 |
| 2 | Code Cracker | Medium | 26 | 10 |
| 3 | Master Codebreaker | Hard | 19 | 10 |

Question IDs, category, subcategory, difficulty, and primary answers come from the CSV. `Verified` stays in the source for internal review and is excluded from the student bundle. Its supplied flags are not independent verification by this project.

Question 12 has an approved wording clarification: “Look up omnivore. How many types of foods are listed in the definition?” Its primary answer remains “2.” Other prompts and all primary answers are preserved (apart from surrounding whitespace).

## Structured question data

Each question has `id`, `type: "typed-answer"`, `category`, `subcategory`, `difficulty`, `dictionarySkill`, `literacyObjective`, `theme`, `prompt`, `question`, `answer`, and `success`. `answer` is both the accepted primary answer and the spelling displayed in missed-answer results. The model can optionally accept an explicitly approved `acceptedAnswers` list; none is added speculatively. Optional hints and Rotary context may be authored separately and must never reveal answers during an attempt.

Question 61, for example, asks the child to find North Dakota's capital in the states section. Its primary answer is “Bismarck.” `BISMARCK`, `bismarck`, and surrounding spaces are accepted, while `Bismark` is not.

## Answer comparison

Comparison normalizes case, leading/trailing and repeated whitespace, Unicode accents (so Brasilia matches Brasília), curly apostrophes, and typographic hyphens. Commas are removed only for correctly grouped numeric thousands (1,909 matches 1909). Meaningful punctuation, including decimal points and percent signs, remains significant. There is no fuzzy matching, stemming, automatic synonym acceptance, or numeric approximation.

The primary answer is always displayed unchanged in submitted results. Correctness is never shown on question or pre-submission review screens. The static answer bank is necessarily available in client code; this POC does not provide secure examinations.

## Selection and session history

Fisher–Yates shuffling provides randomized tie order. Selection normally caps each broad category at three questions and each category/subcategory pair at two. Within those limits, prefer unseen questions, then questions absent from the previous attempt, then underrepresented categories/topics. Limits relax only if needed to fill a smaller future pool; the current pools satisfy the normal limits.

Shuffle the final selection too. Retakes change the set even after history is exhausted. Only displayed questions are recorded as seen. History and progress live in the browser tab session; no cross-device identity or server persistence is used. Completely different questions across ten attempts are impossible with these pool sizes.

## Dictionary edition review

The actual distributed edition must be checked before classroom use. Definitions, pronunciation notation, reference sections, and historical claims vary. The import preserves the requested answer key rather than silently substituting external answers. In particular, review question 22's supplied “rodent” answer for skunk against the book. Question 4's “camel” option also precedes the supplied first guide word “camouflage,” so the organizer should review that row. These rows remain in the requested 99-question import pending a content decision.

## Child-facing writing

Prefer short instructions, concrete examples, dictionary reminders, and encouraging post-submission feedback. Keep service explanations brief. Children should be able to answer through the physical book, the instructions, or reasoning appropriate to the skill.

## Rotary Examples Library

Possible short context snippets can be associated with questions.

### Literacy

> Rotary Clubs support reading, education, schools, and other literacy projects.

### Local Service

> Rotary members often work with schools and community organizations to solve local needs.

### International Cooperation

> Rotary Clubs can also partner with Rotary members in other countries on larger projects.

### Clean Water

> Some Rotary projects help communities improve access to clean water and sanitation.

### Health

> Rotary supports health projects in communities around the world.

### Polio

> One well-known Rotary effort has helped communities around the world work toward ending polio.

Use this as one example, not the primary theme.

### Environment

> Rotary Clubs may organize projects that protect or improve the environment.

### Peace

> Rotary also supports projects and programs that help people build understanding and peace.

## Sponsor recognition

Sponsor titles, descriptions, logos, and links remain independent from questions; see [SPONSORS.md](SPONSORS.md). No sponsor knowledge is required for scoring. See [LEVELS.md](LEVELS.md) for the feature scope and acceptance criteria.
