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

### Introduction and challenge stages

“Grab your dictionary” establishes that the physical book and its reference sections are required. Explain ten questions with mostly selectable answers, no timer, a seven-answer passing threshold, and results only after submission. No name or login is needed.

The challenge list shows:

1. **Find It** — learn how to navigate the dictionary and locate information.
2. **Figure It Out** — use meanings, context, entry details, and reference sections to interpret what you find; unlocked after Find It.
3. **Discover More** — combine dictionary skills more independently across a broader mix of searches; unlocked after Figure It Out.

The interface should avoid presenting Easy, Medium, or Hard as child-facing rank labels. Those may remain internal question metadata. The progression is about increasing independence with the book, not about judging the child.

Completed stages remain available for retakes and viewing earned certificates. An unfinished quiz can be resumed from the challenge list. Starting or retaking a stage explicitly creates a fresh attempt.

### Question screen

**Find It** starts with six guided lessons, followed by four simple book hunts. Its answer mix is eight selectable/two typed; later stages are six selectable/four typed. The stage cards explain what the child will practice rather than emphasizing difficulty.

Show stage name, “Question 4 of 10,” a progress bar, category/topic, physical-dictionary instruction, an expandable dictionary tip, the question, and a reusable answer component. Multiple-choice and yes/no use native radio groups with large touch labels; typed questions use a labeled text input. Disable spelling suggestions and answer autocomplete. Keep normal text keyboards available for words and numbers.

Submitting an answer and going back preserve answers. “Submit answer” is the only button in the question form; previous navigation is an actual secondary back link below it on phones. Submission requires a selected or nonblank typed answer. Input, radio groups, buttons, links, and expandable tips have visible keyboard focus. Choice selection stays on the current question and exposes native checked state. Options shuffle once at attempt creation and retain that order through review/reload. Local SVGs supplement the book, choice, typing, and discovery labels; a guide-word page example includes visible text and a caption. Feedback never exposes correctness during the attempt.

### Review before submission

Show the ten questions and the child's answers, with a “Change answer” action for each. Submit only after all questions have a nonblank answer. This review contains no correct answers or score.

### Results

Show a clear score after submission. At 7/10 or higher, celebrate stage completion, link to the printable certificate, and encourage the next stage. Lower scores encourage another attempt with a new question set. All results allow retakes. Previously unlocked stages stay unlocked even after a lower retake score.

Results should reinforce the learning progression. Useful language focuses on finding, figuring out, and discovering rather than game rank. The child should leave with the idea that being resourceful means knowing how to find and understand an answer, not already knowing everything.

Below the primary actions, list missed questions with the child's answer and the primary correct answer. Avoid punitive language. An expandable learning review offers explanations for all ten questions, including correct responses and relevant service context. An optional, unscored “Your own discovery” activity restores the original invitation to find a new word in the book.

### Certificate and prizes

Passing **any stage** earns a challenge certificate displaying the completed stage, score, date, short completion code, and each configured sponsor's name and logo. Sponsor descriptions and links stay off the certificate. It has no name or contact fields. The child can print/save it, show an adult, or continue to the next stage. Print CSS hides navigation and prints the certificate alone.

The parent/guardian section directs adults to the organizer for prize availability and fulfillment. No automatic redemption or guaranteed prize is implied. Codes are local completion references.

### Tab session

Questions already displayed, the current attempt, completed stages, and earned certificates survive reloads through sessionStorage. If storage is blocked, the activity continues in memory. Closing the tab ends the normal session; browser session restoration may restore it. Print or save certificates before closing. Browser navigation and direct URLs cannot reveal results before submission or create a certificate without a pass.

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
- long typed responses,
- organizational jargon,
- acronyms,
- fundraising language,
- rank-oriented labels such as “master,” “beginner,” or “hard mode.”

## Tone

Appropriate:

> Great find!

> Nice work figuring that out.

> Check the guide words at the top of the page.

> Your dictionary can help you figure that out.

> See what else you can discover.

Avoid patronizing language.

## Branding

Use the clean, contemporary Dictionary Detective Challenge identity: native system sans-serif typography, navy headings, blue actions, white surfaces, and a light-gray page background. The welcome headline is “Explore your dictionary.” followed by copy that introduces the three-stage progression without framing it as Easy/Medium/Hard. Both audience paths remain prominent, with a blue child action and a bordered white grown-up action.

Use modest 8–12px corners, thin borders, minimal shadows, and stationary hover states. Avoid tilted interface decorations, emoji tiles, ribbons, oversized illustrations, and multicolor accents. A restrained photograph of a physical navy dictionary accompanies the landing-page heading: beside the copy on desktop and as a compact image below it on phones. Keep the shared wordmark upright and separate the header and content with a quiet divider.

Activity screens have a maximum width of 680px; welcome and grown-up screens expand to 1040px. Audience choices and adult information stack on phones and use two columns from 700px. Dictionary instructions appear in a blue-tinted inset above the question, with visible progress, labeled answer choices or a short typed answer, and encouraging results after submission. Sponsor recognition uses the same typography and restrained dividers.

A responsive “Made possible by” section recognizes every configured sponsor below the audience choices and on the grown-up page. Each has an optional contained logo (or letter fallback), title, description, and descriptive learn-more link. Sponsor details stay out of the question screens. Certificates connect to organizer-managed prize arrangements through the grown-up path. See [sponsor setup](SPONSORS.md).

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
 │    ├── Find It / Figure It Out / Discover More
 │    ├── Challenge → Review → Results
 │    └── Certificate
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

## Visual presentation

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
- Both audience paths, all three stages, ten-question attempts, review, submission, retakes, certificates, and browser navigation work.
- Answer components have visible labels and focus; screen changes focus the main content, and results use explicit text cues.
- Text and controls have accessible contrast; layouts remain usable at 200% zoom and with reduced motion.
- One or multiple sponsors, long text, missing logos, and embedded logos remain readable and contained.
- Existing tests and the static build pass; representative phone and desktop screenshots are captured for review.

### Out of scope

Framework adoption, external fonts, backend services, tracking, theme configuration, and redesign of the local sponsor editor. The authorized mixed-question changes are specified in [MIXED-QUESTIONS.md](MIXED-QUESTIONS.md).

### Historical visual-refresh validation

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
