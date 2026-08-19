# Rotary Dictionary Challenge

A mobile-first companion experience for dictionaries distributed by Rotary Clubs through literacy projects such as The Dictionary Project.

A generic QR code placed in a dictionary, bookmark, handout, or inside-cover sticker opens a simple web experience:

- **Children** enter a short, fun challenge that teaches them how to use their new dictionary.
- **Parents and other adults** learn why Rotary supports literacy, what Rotary does locally and internationally, and how to connect with a Rotary Club in their community.

The initial proof of concept is intentionally **Rotary-focused**.

The architecture should not unnecessarily prevent future adaptation for other community service organizations that participate in dictionary-distribution or literacy programs, but multi-organization support is not an MVP requirement.

## Why This Exists

The physical dictionary is the centerpiece of the experience.

The website should help children discover how useful their dictionary can be rather than replacing it with an online dictionary.

The experience builds on the goals of The Dictionary Project: helping students become better writers, active readers, creative thinkers, and resourceful learners by giving them a personal dictionary they can use at school and at home.

The Dictionary Project especially encourages dictionary distribution to third-grade students, describing third grade as an important transition from **learning to read** toward **reading to learn**.

This project extends that physical gift with a short guided experience that helps a child immediately begin learning how to use it.

## Product Idea

The child experience uses the dictionary itself as part of the game.

Questions ask children to:

1. Find something in their dictionary.
2. Learn how a dictionary is organized.
3. Interpret a word or definition.
4. Apply the word to a real situation.
5. Discover a connection to literacy, service, or community.

The core learning loop is:

**Find → Understand → Apply → Discover**

Example:

> Find the word **VOLUNTEER** in your dictionary.
>
> Which description is closest to its meaning?
>
> - Someone who chooses to help
> - Someone who sells something
> - Someone who wins a contest
> - Someone who moves to another city

After the child answers:

> Great find!
>
> Volunteers choose to give their time to help others.
>
> Rotary Clubs are groups of volunteers who work on projects in their own communities and with people around the world.

The dictionary provides the answer. Rotary provides meaningful real-world context.

## Product Focus

This project sits at the intersection of three ideas:

```text
Dictionary Skills
       +
Literacy & Learning
       +
Rotary Service
```

### 1. Dictionary Skills

Children learn practical skills such as:

- Alphabetical order
- Finding words
- Guide words
- Definitions
- Multiple meanings
- Parts of speech
- Context
- Synonyms
- Pronunciation
- Related words

### 2. Literacy and Learning

The challenge should reinforce the broader purpose of giving a child their own dictionary:

- becoming an active reader,
- becoming a better writer,
- learning independently,
- developing vocabulary,
- thinking creatively,
- and becoming a resourceful learner.

### 3. Rotary Service

Rotary themes provide meaningful vocabulary and real-world examples.

Potential themes include:

- Literacy and education
- Helping your community
- Volunteering
- Working together
- Leadership
- Health and well-being
- Clean water and sanitation
- Peace and understanding
- Protecting the environment
- Supporting young people
- Local service
- International cooperation

No single Rotary initiative should dominate the experience.

Polio eradication can appear as one useful example of Rotary's international reach, but the product should present a broader picture of Rotary service.

## Rotary First, Extensible Later

The POC is for Rotary Clubs.

Do not build a generic service-club platform for the MVP.

However, avoid unnecessary coupling between the core dictionary quiz engine and Rotary-specific wording.

A useful conceptual model is:

```text
Dictionary Challenge Engine
          |
          v
Literacy Content
          |
          v
Rotary Service Context
          |
          v
Local Rotary Club Information
```

A future version could replace the organization-specific layers for another sponsoring organization without redesigning how dictionary questions work.

That future possibility is a design consideration, not an MVP feature.

## Primary Users

### Child

Typically an elementary-school student, with the initial experience particularly appropriate for children receiving dictionaries around third grade.

The child should be able to complete the challenge using:

- the physical dictionary,
- short instructions,
- simple answer choices,
- and little or no adult assistance.

### Parent, Guardian, Teacher, or Other Adult

An adult who scans the QR code may want to know:

- Why did my child receive a dictionary?
- Why does Rotary care about literacy?
- What does Rotary do?
- What does our local Rotary Club do?
- How does a local club connect to larger Rotary efforts?
- How can I learn more or get involved?

## Core Experience

```text
QR Code
   |
   v
Welcome
   |
   +---- I'm a Kid ------> Dictionary Challenge
   |                           |
   |                           v
   |                    Dictionary Missions
   |                           |
   |                           v
   |                      Completion
   |
   +---- I'm a Grown-up -> Why This Dictionary?
                               |
                               v
                         Literacy + Rotary
                               |
                               v
                         Local Club Information
```

## Proof-of-Concept Goals

The POC should demonstrate:

- Mobile-first QR-code entry
- Parent/child audience selection
- A short child challenge of approximately 8 questions
- Real use of the physical dictionary
- Multiple dictionary skills
- Immediate, encouraging feedback
- Literacy-oriented learning outcomes
- Rotary service themes used as real-world context
- A clear distinction between local Rotary service and Rotary's broader international capabilities
- A simple completion experience
- A parent/adult Rotary information page
- Quiz content stored separately from application logic

## Non-Goals for the POC

The POC does **not** need:

- User accounts
- Authentication
- Student profiles
- Persistent scores
- Leaderboards
- A database
- Club administration
- School administration
- Teacher dashboards
- A CMS
- Donations
- Email capture
- Location tracking
- Production analytics
- Multi-tenant architecture
- Multi-organization branding
- Native mobile applications

## Quiz Philosophy

The quiz should primarily teach **how to use the dictionary**.

Rotary knowledge should generally not be required to answer correctly.

Prefer:

> Find **COOPERATE** in your dictionary.
>
> Which definition best fits people working together toward a shared goal?

Then explain:

> Rotary Clubs cooperate with people in their own communities and with Rotary Clubs in other parts of the world.

Avoid:

> How many countries have Rotary Clubs?

That tests Rotary knowledge rather than dictionary skills.

## Parent Experience Philosophy

The parent path should start with the gift:

> **Why did Rotary give my child a dictionary?**

Then connect the dots:

```text
Dictionary
   ↓
Literacy
   ↓
Learning & Opportunity
   ↓
Rotary Service
   ↓
Our Local Club
   ↓
Rotary Around the World
```

The adult experience should not read like a generic organizational brochure.

The dictionary project provides the reason for the conversation.

## Technical Principles

For the POC:

- Optimize for mobile browsers.
- Support static hosting.
- Avoid unnecessary dependencies.
- Keep quiz state client-side.
- Store questions as structured content.
- Separate quiz behavior from quiz content.
- Keep literacy objectives explicit in question data where useful.
- Keep Rotary context separable from the mechanics of the dictionary question.
- Favor straightforward implementation over speculative platform architecture.

GitHub Pages or Cloudflare Pages are appropriate deployment options for the POC.

## Suggested Repository Structure

```text
/
├── README.md
├── AGENTS.md
├── docs/
│   ├── PRODUCT.md
│   ├── UX.md
│   └── CONTENT.md
├── src/
├── public/
└── tests/
```

## Definition of Done — POC

The proof of concept is successful when a tester can:

1. Scan/open the site on a phone.
2. Choose the child or adult path.
3. Complete an approximately eight-question child challenge.
4. Physically use the dictionary to answer several questions.
5. Demonstrate several dictionary-navigation or comprehension skills.
6. Receive immediate, encouraging feedback.
7. Encounter literacy as the central purpose of the activity.
8. Learn that Rotary supports literacy as part of a broader commitment to service.
9. Understand that Rotary operates both locally and internationally.
10. Reach a satisfying completion screen.
11. Navigate the adult path and understand why a Rotary Club gave the dictionary.

## Initial Development Sequence

Build vertically:

1. Landing page
2. Child/adult routing
3. Child introduction
4. One complete dictionary question
5. Answer feedback
6. Temporary completion state
7. Quiz engine
8. Full question set
9. Adult experience
10. Mobile/accessibility polish
11. Behavioral tests

## Run the Proof of Concept

The proof of concept is a client-only application with no backend API. Its intentional eight-question sequence covers alphabetical order, guide words, definitions, multiple meanings, parts of speech, context, related words, and independent lookup. It stores no personal information, score, or quiz history.

`npm run dev` starts a local development server using Python 3's built-in HTTP server. Make sure Python 3 is installed on your machine before running it.

```bash
npm run dev
```

Run the behavioral tests and production build with:

```bash
npm test
npm run build
```

The original vertical-slice definition and intentionally deferred infrastructure are documented in [`docs/PR1.md`](docs/PR1.md).

The multi-question POC expands the learning experience without expanding the original static, client-only architecture.
