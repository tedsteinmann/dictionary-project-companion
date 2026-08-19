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

### Page 1: Why This Dictionary?

Lead with purpose.

Suggested framing:

> A local Rotary Club gave this dictionary as a literacy and learning resource for your child.

Explain that owning a personal dictionary gives a child a resource they can continue using at school and at home.

### Page 2: Learning to Use It

Explain the intended educational benefit:

- vocabulary,
- spelling,
- reading comprehension,
- writing,
- independent learning,
- reference skills.

Explain that the QR challenge is meant to help children start exploring the dictionary immediately.

### Page 3: Why Rotary?

Introduce Rotary through service rather than organizational history.

Suggested framing:

> Rotary Clubs bring people together to improve their communities.

Then connect literacy:

> Supporting education and literacy is one of the ways Rotary Clubs invest in long-term community strength.

### Page 4: Local and Beyond

This is a key distinction.

Suggested concept:

```text
Our Community
     ↕
Our Rotary Club
     ↕
Rotary Clubs Everywhere
```

Explain that a Rotary Club can:

- address needs in its own city,
- partner with schools and nonprofits,
- support regional projects,
- and work with Rotary members and clubs in other countries.

This gives parents a sense of scale without centering the experience on one Rotary program.

### Page 5: Our Local Club

POC may use placeholder content.

Eventually:

- Club name
- Community
- A few local projects
- Meeting/link information
- Learn more CTA

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

This is a Rotary project and can use appropriate Rotary branding.

However, the quiz UI should keep focus on:

1. the child,
2. the dictionary,
3. the challenge.

Rotary branding should support the experience, not overwhelm it.

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
