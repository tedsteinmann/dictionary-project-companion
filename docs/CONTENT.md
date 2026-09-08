# Content Strategy and Quiz Model

## Content goal

Help children navigate their physical dictionary, interpret entries, read reference sections, and practice independent learning. The book supplies the answers. Prior Rotary knowledge is unnecessary. Rotary service context follows the learning experience and remains separate from scoring.

## Current question bank

`content/dictionary-quiz.csv` preserves all 99 supplied rows. Run `python3 scripts/import-questions.py` to regenerate `src/content/imported-questions.js`. The source IDs, difficulty tags, categories, and primary answers are retained. `Verified` remains internal to the CSV.

`src/content/questions.js` composes the playable bank from those source records, authored distractors and difficulty adaptations, and the 16 guided lessons in `src/content/lessons.js`. Regenerating the CSV import cannot erase the lessons. There are 115 stored questions, 113 available for new attempts.

| Level | Name | Active pool | Attempt composition | Answer formats |
|---|---|---|---|---|
| 1 | Codebreaker | 37 | Six guided lessons, then four simple imported questions | Eight selectable, two typed |
| 2 | Code Cracker | 57 | Two guided lessons and eight imported questions | Six selectable, four typed |
| 3 | Master Codebreaker | 19 | Ten imported questions | Six selectable, four typed |

The original source difficulty counts remain 54 Easy / 26 Medium / 19 Hard. The adaptation moves 29 demanding Easy source records to Medium. Two of these, previously flagged questions 4 and 22, remain in the stored bank but are withheld from new attempts pending review. The additional 16 lessons provide 12 Easy and four Medium activities. Beginner source questions are explicitly curated: simple alphabetical comparisons, short word lookups, and familiar number/reference hunts. Difficult capital, historical-text, and unusual-animal hunts are not part of Level 1.

Question 12 retains the approved clarification: “Look up omnivore. How many types of foods are listed in the definition?” Its primary answer remains “2.” Other imported prompts and all primary answers remain unchanged apart from surrounding whitespace.

## Restored original lessons

These questions restore the teaching intent and examples from the original CONTENT.md, with shorter choices and search tips. The original seven scored lessons are real playable questions, not documentation-only examples.

| Lesson | Book instruction and question | Answer | Level |
|---|---|---|---|
| Alphabetical order | Open the dictionary and notice A–Z order. Which comes first: read, resource, or Rotary? | read | Easy |
| Community guide words | Look at a page's guide words. Would COMMUNITY fit between COMBINE and COMPANY? | Yes | Easy |
| Volunteer definition | Find VOLUNTEER and read its meaning. Which description is closest? | Someone who freely chooses to help | Easy |
| Cooperation in context | Find COOPERATE. Which situation shows cooperation? | People working together to clean a park | Easy |
| Leader word family | Find LEADER and nearby entries. Which is related: leadership, leaf, or leather? | leadership | Easy |
| Service meanings | Find SERVICE and read its meanings. Which fits a service project to improve a park? | Helping or work done for others | Medium |
| Generous part of speech | Find GENEROUS and its part-of-speech label. What kind of word is it? | Adjective | Medium |

Additional guided practice covers first letters, the purpose of guide words, headwords, kind behavior, help/play word families, spelling, bank's multiple meanings, and quiet's part of speech.

The original eighth activity is restored after submission as **Your own discovery**: find a word you did not know, read its definition, and select “I found a new word!” It is optional and unscored; a self-reported discovery does not inflate the ten-question score.

## Teaching sequence

The activity remains **Find → Understand → Apply → Discover**. Level 1 starts with guided practice before independent hunts. Each question gives a physical-book instruction and optional dictionary tip. Tips teach a strategy (compare letters, check guide words, inspect entry labels, use the contents page) and do not announce correctness. Definitions are offered as unmarked choices only when appropriate to the question, not as a replacement for opening the book.

After submission, children see the primary answers for missed questions and can expand the learning review for explanations of all ten responses. Relevant Rotary examples appear here, after the learning interaction. No Rotary knowledge is required to score correctly.

## Structured question data and components

Common fields are `id`, `source`, `type`, `category`, `subcategory`, `difficulty`, `dictionarySkill`, `literacyObjective`, `theme`, `prompt`, `question`, `answer`, `tip`, and `success`. Adapted CSV questions also have `sourceDifficulty` and `available`. Optional fields include `rotaryContext` and `guideWords`.

- `typed-answer`: a short text field; optional `acceptedAnswers` for explicitly approved variants.
- `multiple-choice`: a `choices` array containing the primary `answer` exactly once plus authored distractors.
- `yes-no`: the same choice contract with two options and a compact layout.

The primary answer drives the same scoring function for every format. Distractors are checked for duplicate normalized values and exactly one accepted answer. Choice values/order never include correctness flags in the rendered controls. Choices shuffle once per attempt and remain stable through navigation, editing, and reload.

`src/components/answer-input.js` owns the format registry and native form controls; `dictionary-help.js` owns book instructions, expandable tips, and the guide-word SVG example; `learning-review.js` owns post-submission explanations and discovery; `icons.js` supplies local decorative SVGs. Mechanics, content, and rendering stay separate without adding a framework or dependencies.

## Answer comparison

Typed comparison normalizes case, leading/trailing and repeated whitespace, Unicode accents (Brasilia matches Brasília), curly apostrophes, and typographic hyphens. Commas are removed only for correctly grouped numeric thousands (1,909 matches 1909). Meaningful punctuation, including decimal points and percent signs, remains significant. There is no fuzzy matching, stemming, automatic synonym acceptance, or numeric approximation.

The primary answer is displayed unchanged in submitted results. Correctness is never shown on question or pre-submission review screens. The static answer bank is necessarily available in client code; this POC does not provide secure examinations.

## Selection and session history

Each level specifies its lesson/choice/typed mix. A short constrained selection search fills that mix while normally limiting broad categories to three and category/subcategory pairs to two. The current pools meet both limits. Within each group, prefer unseen questions, then questions absent from the previous attempt, then underrepresented topics; shuffled tie order provides variety. A future pool may relax variety limits if necessary, but never silently changes the required lesson/input mix.

Retakes change the set, even once the history is exhausted. Level 1 places its six randomly chosen lessons first. Only displayed questions are marked seen. Question and choice order, answers, progress, and certificates remain in the browser tab session. Compatible existing typed-quiz sessions and certificates continue to work. No cross-device identity or server persistence is used.

## Dictionary edition review

The actual distributed edition must be checked before classroom use. Definitions, pronunciation notation, reference sections, and historical claims vary. The import preserves the answer key rather than silently substituting external answers. Question 4's supplied “camel” precedes the first guide word “camouflage”; question 22 supplies “rodent” for skunk. Both records are preserved but withheld from new attempts until corrected against the book.

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
