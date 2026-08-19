# Agent Instructions

## Project Objective

Build a small, mobile-first proof of concept for the **Rotary Dictionary Challenge**.

The project extends a Rotary dictionary-distribution literacy project with an interactive experience that teaches children how to use the physical dictionary they received.

The POC is Rotary-focused.

Read before changing architecture or product behavior:

- `README.md`
- `docs/PRODUCT.md`
- `docs/UX.md`
- `docs/CONTENT.md`

Product requirements take precedence over speculative technical improvements.

## Mission Hierarchy

When making product or implementation decisions, preserve this order:

```text
1. Help the child use the physical dictionary.
2. Support literacy and independent learning.
3. Make the experience engaging.
4. Connect vocabulary to Rotary service.
5. Introduce the sponsoring Rotary Club.
```

Do not optimize Rotary messaging at the expense of the literacy experience.

## Physical Dictionary Requirement

The application is a companion to a physical dictionary.

Do not:

- add an online dictionary lookup that makes the book unnecessary,
- automatically provide definitions before the child searches,
- optimize the experience around information available solely on screen.

The intended interaction is:

**Find → Understand → Apply → Discover**

## Rotary Focus

This POC is for Rotary Clubs.

Rotary content should communicate a broad service identity including:

- literacy and education,
- community service,
- volunteering,
- cooperation,
- leadership,
- health,
- clean water,
- peace and understanding,
- environment,
- youth,
- local service,
- international cooperation.

Do not make polio eradication the primary theme.

It may appear as one example of Rotary's ability to participate in sustained international service.

## Future Extensibility

Other community service organizations may eventually use a similar experience.

This is **not** an MVP feature.

Do not build:

- organization accounts,
- tenant configuration,
- theme engines,
- organization selectors,
- generic sponsorship APIs,
- multi-organization administration.

However, where it is simple to do so, keep these concerns separate:

```text
Quiz Mechanics
      ↓
Dictionary / Literacy Content
      ↓
Rotary Context
      ↓
Local Club Content
```

For example, a question's answer logic should not depend on a hard-coded Rotary fact when the actual question is testing alphabetical order.

## Scope Discipline

Prefer the smallest implementation that validates the experience.

Do not add without a concrete requirement:

- authentication,
- database,
- backend API,
- user accounts,
- student profiles,
- parent profiles,
- persistent score storage,
- leaderboards,
- CMS,
- club admin,
- school admin,
- analytics platforms,
- location tracking,
- email collection,
- donations,
- multi-tenancy.

## Architecture

Prefer:

- client-side application,
- static-hosting compatibility,
- structured question content,
- minimal dependencies,
- simple state management,
- straightforward behavioral tests.

Avoid premature abstraction.

Another developer or agent should be able to understand the POC quickly.

## Question Architecture

Questions must be structured data.

At minimum, support fields representing:

- ID
- question type
- dictionary skill
- literacy objective
- theme
- prompt
- question
- answers
- correct answer
- success feedback
- optional hint
- optional Rotary context

Example conceptual structure:

```json
{
  "dictionarySkill": "definition",
  "literacyObjective": "interpret-entry",
  "theme": "volunteering",
  "rotaryContext": "..."
}
```

Do not build a CMS.

## Content Rule

A child should generally be able to determine the correct answer through:

- the physical dictionary,
- the instructions,
- or reasoning appropriate to the dictionary skill.

Prior Rotary knowledge should not normally be necessary.

Bad:

> What disease is Rotary famous for fighting?

Better:

> Find a word, interpret its meaning, then show a short Rotary example afterward.

## Child Privacy

Collect no child PII.

Do not request:

- name,
- email,
- birthday,
- school,
- address,
- location,
- login.

Quiz state should preferably be ephemeral.

## UX Requirements

Primary device is a phone reached from a QR code.

Prioritize:

- large touch targets,
- readable text,
- short prompts,
- visible progress,
- immediate feedback,
- simple navigation,
- minimal required typing,
- little unnecessary scrolling.

Avoid punitive feedback.

Prefer:

- Great find!
- Almost!
- Check the guide words again.
- Take another look at the definition.

## Accessibility

At minimum:

- semantic HTML,
- keyboard-operable controls,
- visible focus,
- sufficient contrast,
- logical headings,
- no color-only feedback,
- no timed answers,
- reasonable screen-reader labels.

## Testing Priorities

Behavioral tests should cover:

1. User can choose child path.
2. User can choose adult path.
3. Child intro establishes dictionary requirement.
4. Question renders from structured content.
5. Correct response displays appropriate feedback.
6. Incorrect response allows retry or expected correction flow.
7. Child can proceed to next question.
8. Progress updates correctly.
9. Final question reaches completion.
10. Adult path explains dictionary/literacy purpose.
11. Core question correctness does not depend on Rotary knowledge.
12. Quiz can operate without backend persistence.

Do not pursue coverage percentage merely for its own sake.

## Implementation Workflow

For each meaningful feature, describe:

### Feature

What user-facing capability changes?

### User Story

Who benefits and why?

### Implementation Tasks

What needs to be built?

### Acceptance Criteria

How will we verify it?

### Out of Scope

What adjacent work are we deliberately deferring?

Then:

1. implement the smallest vertical slice,
2. add behavioral tests,
3. check mobile behavior,
4. verify accessibility basics,
5. update documentation if behavior or architecture changed.

## Initial PR Recommendation

The first PR should prove one complete child flow:

```text
Welcome
   ↓
I'm a Kid
   ↓
Grab Your Dictionary
   ↓
One Structured Question
   ↓
Answer Feedback
   ↓
Temporary Completion
```

### PR1 Feature

Complete one dictionary challenge from start to finish.

### PR1 User Story

As a child who received a dictionary from Rotary, I can open the QR experience, start a challenge, use my dictionary to answer one question, receive feedback, and finish the initial experience.

### PR1 Tasks

- establish minimal application structure,
- implement welcome screen,
- implement child route,
- implement child introduction,
- define structured question schema,
- create one representative question,
- implement answer handling,
- implement success/retry feedback,
- implement temporary completion screen,
- add behavioral tests,
- verify phone-width layout.

### PR1 Acceptance Criteria

- Entire flow works without a backend.
- Question is loaded from structured content.
- Child is instructed to use the physical dictionary.
- Correct and incorrect behavior work.
- Rotary context appears only after/around the learning interaction.
- Interface is usable at mobile width.
- Basic keyboard accessibility works.
- No personal information is requested.

### PR1 Out of Scope

- Full 8-question quiz
- Adult page
- Local club customization
- Database
- Authentication
- Analytics
- Multi-organization support
- Production branding system

## Definition of Done

A feature is complete when it:

- satisfies its user story,
- meets acceptance criteria,
- reinforces the physical dictionary,
- supports the literacy mission,
- behaves correctly on mobile,
- includes appropriate tests,
- does not introduce unnecessary scope,
- and leaves documentation accurate.
