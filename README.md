# Dictionary Detective Challenge

A mobile-first companion experience for dictionaries distributed by Rotary Clubs through literacy projects such as The Dictionary Project.

A generic QR code placed in a dictionary, bookmark, handout, or inside-cover sticker opens a simple web experience:

- **Children** enter a short, fun challenge that teaches them how to use their new dictionary.
- **Parents and other adults** learn why Rotary supports literacy, what Rotary does locally and internationally, and how to connect with a Rotary Club in their community.

The proof of concept grew from a Rotary literacy project. Its clean, contemporary **Dictionary Detective Challenge** interface supports one or more community sponsors configured at build time. See [Sponsor builds](docs/SPONSORS.md) for logo upload and configuration instructions.

The architecture should not unnecessarily prevent future adaptation for other community service organizations that participate in dictionary-distribution or literacy programs, with a simple static sponsor list. Accounts, tenant management, and runtime theme switching remain out of scope.

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

The child-facing progression is:

**Find It → Figure It Out → Discover More**

- **Find It** teaches children how to navigate the book using alphabetical order, guide words, headwords, spelling, and basic definitions.
- **Figure It Out** asks them to interpret what they find using context, multiple meanings, parts of speech, word relationships, and reference sections.
- **Discover More** combines those skills in a broader, more independent set of searches and discoveries.

The progression describes growing capability and independence with the physical dictionary rather than presenting Easy/Medium/Hard as child-facing ranks. Difficulty remains useful as internal question metadata.

The full 99-question source bank is preserved, alongside 16 guided dictionary lessons. Each ten-question attempt balances literacy skills, categories, answer formats, and questions not yet shown in the tab session.

Children use the physical book and mostly select answers using large multiple-choice or yes/no controls, with a few short answers to type. **Find It** begins with six guided lessons and includes eight selectable answers and two typed answers. **Figure It Out** and **Discover More** use six selectable answers and four typed answers. Case, whitespace, accents, and grouped numeric commas are normalized; spelling is checked exactly. They can edit answers, then submit the whole quiz to see their score and review missed questions with the supplied correct answers.

A score of **7/10** completes a stage, earns a printable challenge certificate with a random reference code, and unlocks the next stage. Any stage earns a certificate. Retakes use a new question set, with some repeats as pools are exhausted. More demanding source questions have moved from Easy to Medium internally, and two previously flagged source rows remain preserved pending review.

See [the feature, acceptance criteria, and completion policy](docs/LEVELS.md).

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

## Rotary Roots and Community Sponsors

The POC supports Rotary Clubs and cooperating community sponsors.

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

Build-time sponsor recognition is supported now; a generic organization platform remains out of scope.

## Primary Users

### Child

Typically an elementary-school student, with the initial experience particularly appropriate for children receiving dictionaries around third grade.

The child should be able to complete the challenge using:

- the physical dictionary,
- short instructions,
- large answer choices and short typed answers,
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
   |              Find It → Figure It Out
   |                           |
   |                           v
   |                    Discover More
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
- Three sequential challenge stages, each with ten randomly selected questions
- Real use of the physical dictionary
- Multiple dictionary skills
- Encouraging results and missed-answer review after submission
- Literacy-oriented learning outcomes
- Rotary service themes used as real-world context
- A clear distinction between local Rotary service and Rotary's broader international capabilities
- A printable certificate after passing any stage
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
- Runtime organization/theme switching
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

The child-facing progression should reinforce capability rather than rank: first learn to **Find It**, then **Figure It Out**, then **Discover More**. A resourceful learner does not need to know every answer already; they know how to find and understand information when they need it.

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
3. Complete a ten-question attempt and progress through **Find It**, **Figure It Out**, and **Discover More**.
4. Physically use the dictionary to answer several questions.
5. Demonstrate several dictionary-navigation or comprehension skills.
6. Review results and missed answers after submitting the attempt.
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

The proof of concept is a client-only application with no backend API. Answers, shown-question history, unlocked stages, and certificates stay in sessionStorage for the current browser tab, with an in-memory fallback if storage is blocked. There are no accounts or requests for personal information. Print or save a certificate before closing the tab. Completion codes are local references, not centrally verified prize claims. Parent/guardian information explains how to contact the organizer about available prizes.

`npm run dev` builds the site and starts a local preview at `http://localhost:4173` using Python 3's HTTP server. Make sure Python 3 is installed. Both build and dev automatically use `sponsors.json` in the project root when present, falling back to the default Rotary sponsor otherwise. After changing source files or sponsor configuration, run `npm run build` and refresh, or restart `npm run dev`. The sponsor editor remains available at `/tools/sponsors.html` during development.

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

To regenerate the browser question bank after editing the source CSV, run `python3 scripts/import-questions.py`, then `npm test` and `npm run build`. Verification flags remain only in the source CSV. The importer writes `src/content/imported-questions.js`; authored lessons and presentation adaptations are kept in separate modules. See [mixed questions and teaching components](docs/MIXED-QUESTIONS.md).
