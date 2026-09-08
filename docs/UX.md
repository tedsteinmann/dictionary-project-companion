# UX Specification

## Experience Goal

The child experience should feel like:

**a scavenger hunt through a new book**

rather than:

- a test,
- an online dictionary,
- a Rotary history lesson,
- or an advertisement.

The adult experience should feel like the answer to:

> Why did Rotary give this dictionary to my child?

## Entry

A visitor arrives from a generic QR code on:

- an inside-cover sticker,
- bookmark,
- handout,
- presentation material,
- or related dictionary-project material.

## Welcome Screen

Keep it short.

Example:

> # Welcome!
>
> Your dictionary has more inside it than you might think.
>
> Who's exploring today?
>
> **I'm a Kid**
>
> **I'm a Grown-up**

## Child Flow

### Child Introduction

Example:

> # Grab Your Dictionary!
>
> You'll need it for the challenges ahead.
>
> We'll show you a few tricks for finding words, understanding definitions, and discovering new things.
>
> **Start the Challenge**

The copy should establish that the physical book is required.

### Challenge Structure

Each screen should contain:

1. Mission/theme
2. Progress
3. Dictionary instruction
4. Question
5. Answer choices/action
6. Feedback
7. Next action

Example:

```text
MISSION: WORKING TOGETHER

Challenge 4 of 8

Find COOPERATE in your dictionary.

Which meaning best describes people
working toward the same goal?

[ Working together ]

[ Refusing to help ]

[ Moving quickly ]

[ Changing your mind ]
```

### Correct Feedback

Example:

> **Great find!**
>
> Cooperate means working together.
>
> Rotary members work together on projects in their own communities. Rotary Clubs can also work with clubs in other parts of the world.
>
> **Next Challenge**

The pattern is:

```text
Dictionary Meaning
       ↓
Why the Word Matters
       ↓
Rotary Example
```

Not every answer needs all three layers if that makes feedback too long.

### Incorrect Feedback

Avoid:

- Wrong
- Incorrect
- Failed

Prefer:

> **Almost!**
>
> Look at the definition one more time.
>
> Hint: Which answer describes people working together?
>
> **Try Again**

### Progress

Prefer:

`Challenge 4 of 8`

A simple progress bar may supplement it.

Do not make score the primary motivator.

### Completion

Example:

> # You Did It!
>
> **Dictionary Explorer**
>
> You used your dictionary to:
>
> - Find words
> - Use alphabetical order
> - Read definitions
> - Understand words in context
> - Discover new ideas
>
> A dictionary can help you whenever you find a word you don't know.
>
> **One more challenge:** What new word will you look up today?
>
> **Play Again**

Optional small Rotary footer:

> Your dictionary was provided through a Rotary literacy project.

## Adult Flow

### Page 1: The Dictionary as an Invitation

Lead with purpose.

Suggested framing:

> A local Rotary Club gave this dictionary as a literacy and learning resource for your child.

Explain that owning a personal dictionary gives a child a resource they can continue using at school and at home.

### Page 2: Why Get Involved?

Explain how participating in a service club can help adults:

- meet people from different backgrounds,
- build friendships,
- grow personally and professionally,
- better understand their community,
- connect ideas with useful knowledge and resources,
- and contribute to visible local projects.

Present the six benefits as a responsive card grid that remains easy to scan on a phone. Give each card a distinct, decorative font icon while keeping its visible heading and description as the accessible meaning.

### Page 3: More Than Dictionaries

Give concrete local examples from the five Fargo–Moorhead Rotary Clubs, Horace Lions Club, and Fargo Elks Lodge #260.

Combine each project example with its matching sponsor logo, name, and link in the sponsor grid. The cards cover Rotary’s parks, literacy, arts, and international work; Lions’ community giving and children’s vision screening; and Elks’ community events and support for youth, veterans, and neighbors in need.

### Page 4: Find a Club That Fits Your Life

Welcome people without prior club connections or leadership experience. Explain that local options include morning, noon, and evening meetings on different days.

### Page 5: Meet the Clubs Behind the Dictionary Project

The grown-up screen includes each build-configured sponsor’s logo, title, description, and learn-more link, followed by a concise invitation to meet people, find a place, and make something happen.

## Child Design Principles

Use:

- large text,
- large buttons,
- short paragraphs,
- one primary task at a time,
- visual progress,
- positive reinforcement,
- playful but not childish language,
- minimal required scrolling.

Avoid:

- dense content,
- timers,
- score pressure,
- required typing,
- organizational jargon,
- acronyms,
- fundraising language.

## Tone

Appropriate:

> Great find!

> Nice detective work.

> Check the guide words at the top of the page.

> Your dictionary can help you figure that out.

Avoid patronizing language.

## Branding

Use the clean, contemporary Dictionary Detective Challenge identity: native system sans-serif typography, navy headings, blue actions, white surfaces, and a light-gray page background. The welcome headline is “Explore your dictionary.” followed by “Use your book to solve eight short challenges.” Both audience paths remain prominent, with a blue child action and a bordered white grown-up action.

Use modest 8–12px corners, thin borders, minimal shadows, and stationary hover states. Avoid tilted interface decorations, emoji tiles, ribbons, oversized illustrations, and multicolor accents. A restrained photograph of a physical navy dictionary accompanies the landing-page heading: beside the copy on desktop and as a compact image below it on phones. Keep the shared wordmark upright and separate the header and content with a quiet divider.

Activity screens have a maximum width of 680px; welcome and grown-up screens expand to 1040px. Audience choices and adult information stack on phones and use two columns from 700px. Dictionary instructions appear in a blue-tinted inset above the question, with visible progress, clear answer selection, and encouraging feedback. Sponsor recognition uses the same typography and restrained dividers.

A responsive “Made possible by” section recognizes every configured sponsor below the audience choices and on the grown-up page. Each has an optional contained logo (or letter fallback), title, description, and descriptive learn-more link. Sponsor details stay out of the question screens. Prize offers from reference artwork are not product requirements. See [sponsor setup](SPONSORS.md).

However, the quiz UI should keep focus on:

1. the child,
2. the dictionary,
3. the challenge.

Sponsor branding should support the literacy experience.

## Architecture Through the UX

The POC can conceptually separate:

```text
Core Quiz UI
    ↓
Dictionary / Literacy Content
    ↓
Rotary Context
    ↓
Local Club Context
```

Do not expose this architecture to users.

Do not build a full theming system merely to enforce it.

## Navigation

```text
Home
 ├── Kid
 │    ├── Intro
 │    ├── Challenge
 │    └── Completion
 │
 └── Grown-up
      ├── Why This Dictionary
      ├── Literacy
      ├── About Rotary
      └── Local Club
```

Browser navigation must not corrupt quiz state.

## Accessibility

At minimum:

- semantic headings,
- actual button elements,
- keyboard support,
- visible focus,
- sufficient contrast,
- no color-only state,
- screen-reader-friendly labels,
- no timed responses,
- no autoplay audio.

## Visual refresh feature

### Feature

A consistent, clean presentation across welcome, child introduction, dictionary challenges, feedback, completion, and grown-up information.

### User story

As a child or adult visiting on a phone, I can quickly understand the experience and navigate a site that feels approachable and thoughtfully designed.

### Implementation tasks

- Consolidate the stylesheet around shared color, typography, spacing, and control styles, without adding dependencies or downloading fonts.
- Simplify the welcome copy, header, and decorative elements; retain the Dictionary Detective Challenge name.
- Give instructions, questions, answers, feedback, and next actions clear visual hierarchy.
- Preserve the physical-dictionary requirement, structured question content, quiz mechanics, and sponsor configuration.
- Check the local sponsor editor for compatibility with the shared stylesheet.

### Acceptance criteria

- All public screens and feedback states fit 320, 390, 768, and 1280px widths without horizontal overflow.
- Body text is 16–18px at default zoom; controls have at least 44px touch targets and visible keyboard focus.
- Both audience paths, all eight questions, retry, progress, final acknowledgement, completion, replay, and browser navigation work.
- Selected answers expose an accessible pressed state and visible marker; feedback retains status/alert semantics and text cues.
- Text and controls have accessible contrast; layouts remain usable at 200% zoom and with reduced motion.
- One or multiple sponsors, long text, missing logos, and embedded logos remain readable and contained.
- Existing tests and the static build pass; representative phone and desktop screenshots are captured for review.

### Out of scope

New quiz content or features, framework adoption, external fonts, backend services, tracking, theme configuration, and redesign of the local sponsor editor.


### Validation performed

- All 18 existing tests and the production build pass with the project’s three configured sponsors.
- An isolated Chromium walkthrough passed 127 checks covering both paths, all question and feedback states at 320/390/768/1280px, replay, browser navigation, keyboard entry, visible focus, reduced motion, and 200% CSS zoom on all public screens.
- Sponsor checks covered the configured embedded logos, single/multiple sponsors, long text, missing-logo fallbacks, and the local editor at all four widths.
- Palette contrast checks passed: normal text combinations exceed 4.5:1 and control boundaries meet 3:1. Selected-answer and feedback accessibility semantics were checked in the browser; spoken output with a screen reader was not manually tested.
- Desktop and phone screenshots were reviewed for welcome, adult information, question feedback, and completion. No runtime dependencies or external font requests were added.


## Landing-page dictionary image and sponsor cutouts

### Feature and user story

As a visitor, I see the physical dictionary represented on the landing page, while sponsor logos sit naturally on the page without white background boxes.

### Implementation tasks

- Use a local, optimized WebP dictionary image with descriptive alternative text and explicit dimensions.
- Place the image beside the headline from 700px and limit its height to 140px on smaller screens so the audience choices remain easy to reach.
- Keep the Rotary logo’s existing transparency and replace the configured Lions and Elks white-background images with transparent cutouts.
- Preserve the static build and embedded sponsor configuration; document asset provenance in [ASSETS.md](ASSETS.md).

### Acceptance criteria

- The dictionary image loads on the welcome page in the built site and under a hosting subdirectory.
- At 320, 390, 768, and 1280px, the image stays contained and both audience choices remain usable without horizontal overflow.
- Sponsor logos have real alpha transparency, remain readable on welcome and adult pages, and survive sponsor-editor configuration import/export.
- The dictionary asset is under 100KB; no font, image-hosting, or runtime dependencies are added.

### Out of scope

Automatic background removal in the sponsor editor, new branding, changes to quiz content, and images on question screens.
