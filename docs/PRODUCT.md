# Product Definition

## Working Name

**Dictionary Detective Challenge**

The name is provisional.

## Product Vision

Help children get more value from a dictionary they received from Rotary by turning their first experience with the book into a short, engaging learning adventure.

At the same time, help parents understand why Rotary invests in literacy and how their local Rotary Club connects community service to a larger international network.

## Source Mission

The product should complement, not redefine, the purpose of The Dictionary Project.

The Dictionary Project describes its mission around helping students become:

- good writers,
- active readers,
- creative thinkers,
- resourceful learners,

through the gift of their own personal dictionary.

The project encourages sponsors to provide dictionaries to children around third grade, an age associated with the transition from learning to read toward reading to learn.

The Rotary Dictionary Challenge should reinforce those goals by teaching children how to actually use and explore the dictionary they just received.

## Problem

Giving a child a dictionary creates an opportunity, but ownership alone does not ensure that the child understands:

- how the book is organized,
- how to find words efficiently,
- how to interpret an entry,
- how to choose among several meanings,
- or how a dictionary can help with reading, writing, and independent learning.

Rotary volunteers may introduce some of these ideas during distribution, but the amount of classroom time available varies.

A QR-based companion experience can provide a repeatable, optional activity that travels with the book.

## Value Proposition

### For Children

> Learn how to use your new dictionary by solving fun challenges.

### For Parents

> Learn why Rotary gave your child this book and how Rotary supports literacy and community service.

### For Rotary Clubs

> Extend a dictionary-distribution service project with an engaging learning experience that reinforces literacy and introduces families to Rotary.

## Product Principles

### 1. The Book Is the Tool

The site must not become an online dictionary.

The physical dictionary should frequently be required to complete the challenge.

### 2. Literacy Comes First

The primary educational objective is dictionary literacy and independent learning.

Rotary provides context, not the answer key.

### 3. Community Sponsors Have a Clear Presence

One or more configured community organizations are recognized on welcome and grown-up pages. Rotary remains the source of the existing service examples.

Children should come away with a simple idea:

> Rotary is a group of people who work together to help their communities and people in other places too.

Adults should receive a richer explanation of Rotary's literacy work, local projects, and broader reach.

### 4. Service Themes Make Vocabulary Meaningful

Words such as:

- volunteer,
- community,
- cooperate,
- literacy,
- generous,
- service,
- leadership,
- peace,
- health,
- sanitation,
- environment,

allow dictionary skills to connect naturally to Rotary service.

### 5. Local + International Is an Important Rotary Story

The experience should show that a Rotary Club is locally rooted while belonging to a much larger service network.

The application should not suggest that Rotary is primarily about one international cause.

### 6. Build-Time Sponsor Recognition

Other community organizations participate in dictionary-distribution programs.

The POC supports a static list of sponsors, each with an optional logo, title, description, and website. A local setup tool exports configuration for the build. It has no accounts, hosted uploads, or tenant management. See [feature and acceptance criteria](SPONSORS.md).

### 7. Progress Through Capability, Not Rank

The child-facing challenge progression is **Find It → Figure It Out → Discover More**.

These names should describe increasingly independent use of the physical dictionary rather than assigning child-facing labels such as Easy, Medium, Hard, beginner, or master. Difficulty remains useful as internal content metadata.

- **Find It** teaches how to navigate the book.
- **Figure It Out** teaches how to interpret what the child finds.
- **Discover More** asks the child to combine those skills independently.

## Users

### Primary User: Child

Initial target:

- elementary-school student,
- commonly around third grade,
- recently received a personal dictionary.

Needs:

- short instructions,
- large controls,
- clear progress,
- encouragement,
- mostly selectable answers, with occasional short typing,
- results after quiz submission,
- a reason to open and explore the book.

### Secondary User: Adult

Could include:

- parent,
- guardian,
- teacher,
- family member,
- community member.

Needs:

- context for the gift,
- connection between dictionaries and literacy,
- explanation of Rotary,
- local club information,
- examples of Rotary service,
- a path to learn more.

## POC Objective

Validate whether the combination of:

**physical dictionary + mobile challenge + Rotary service context**

creates an engaging and understandable experience.

We are validating the interaction model, not a production platform.

## MVP Features

### Feature: Audience Selection

#### User Story

As a visitor, I want to identify whether I am a child or adult so I can see an experience designed for me.

#### Acceptance Criteria

- Selection appears immediately after a short welcome.
- Child and adult choices are large and obvious.
- Each requires one tap.
- User can return to the welcome screen.

---

### Feature: Child Introduction

#### User Story

As a child, I want to understand that I need my dictionary before starting.

#### Acceptance Criteria

The introduction should communicate:

- Grab your dictionary.
- You will use it during the challenge.
- You will learn tricks for finding and understanding words.
- The experience is short and fun.

---

### Feature: Dictionary Challenge

#### User Story

As a child, I want to solve short challenges using my own dictionary so I become more comfortable using it.

#### Acceptance Criteria

- Three sequential stages: **Find It**, **Figure It Out**, and **Discover More**.
- Each attempt draws ten questions from a bank preserving all 99 source records plus guided dictionary lessons.
- **Find It** begins with six guided lessons and has eight selectable/two typed answers; **Figure It Out** and **Discover More** have six selectable/four typed answers.
- Internal question difficulty may continue to use Easy/Medium/Hard metadata, but that terminology is not the child-facing progression.
- Demanding Easy source questions move to Medium, retaining original source metadata.
- Category/topic limits and tab-session history provide variety; retakes change the question set.
- Several dictionary skills are represented.
- Most questions require or encourage use of the physical dictionary.
- Progress is visible.
- Children select or type and edit answers. Optional tips teach how to search the book; correctness and learning explanations appear only after submission.
- Case and reasonable formatting differences are normalized; misspellings are not automatically accepted.
- No login is required.
- No personal information is collected.

---

### Feature: Literacy Learning

#### User Story

As a child, I want the challenge to teach me ways the dictionary can help me read, write, and learn.

#### Acceptance Criteria

The overall experience demonstrates multiple benefits such as:

- finding unfamiliar words,
- improving spelling,
- understanding meaning,
- discovering word relationships,
- choosing the right definition from context,
- independently solving a language question.

The progression should move from locating information, to interpreting it, to independently applying multiple dictionary skills.

---

### Feature: Rotary Service Context

#### User Story

As a child, I want to see how the words I discover relate to helping people and communities.

#### Acceptance Criteria

- Rotary service examples are surrounding context, never prerequisite knowledge.
- Multiple Rotary service themes appear in completion and grown-up context.
- At least one example is clearly local.
- At least one example demonstrates Rotary's broader/international capabilities.
- No single initiative dominates the content.

---

### Feature: Completion

#### User Story

As a child, I want a clear celebration when I finish.

#### Acceptance Criteria

- A result communicates the score clearly and encourages continued dictionary exploration.
- Seven correct completes a stage and unlocks the next. Lower scores allow immediate randomized retry.
- Passing any stage earns a printable challenge certificate showing stage, score, date, and a random reference code.
- Answers, scores, stage progress, and certificates remain only in the current browser tab session.
- Children may continue upward, retake, or show their certificate to an adult.
- Prize fulfillment is arranged by a parent/guardian with the organizer; no child contact details are requested.
- Replay is possible.
- Completion language should reinforce resourcefulness: the goal is not to know every answer already, but to know how to find and understand information.

---

### Feature: Adult Information

#### User Story

As an adult, I want to understand how local service clubs made this dictionary project possible and how I can get involved in my community.

#### Information Architecture

1. How does the dictionary connect to local service?
2. Why might I get involved?
3. What projects do the participating clubs support?
4. Can I find a club that fits my schedule and interests?
5. How can I learn more or visit a participating club?

#### Acceptance Criteria

- Literacy is the entry point.
- All configured sponsors are clearly identified.
- Page gives locally relevant examples of Rotary, Lions, and Elks service.
- Page explains that clubs offer different meeting times and welcomes newcomers.
- Organizers supply sponsor details and links at build time.

## Non-Goals

Do not build:

- authentication,
- accounts,
- profiles,
- database persistence,
- leaderboards,
- school dashboards,
- teacher dashboards,
- CMS,
- club administration,
- donation processing,
- email marketing,
- automatic location detection,
- production analytics,
- multi-tenant support,
- multi-organization theme switching.

See [three-stage implementation scope](LEVELS.md) and [mixed questions and guided lessons](MIXED-QUESTIONS.md).

## Privacy

Do not collect child PII.

Do not ask children for:

- name,
- email,
- birth date,
- school,
- address,
- location,
- account credentials.

## Accessibility

Favor:

- semantic HTML,
- strong contrast,
- readable typography,
- large touch targets,
- keyboard access,
- visible focus,
- simple language,
- no timed questions.

## Success Criteria

### Child Testing

A promising POC allows children to:

- begin without extensive adult explanation,
- understand they need the physical dictionary,
- successfully navigate the book,
- complete the challenge in approximately 5–10 minutes,
- demonstrate several dictionary skills,
- identify at least one way a dictionary can help them learn,
- understand the progression from finding information to figuring it out and discovering independently,
- understand at a simple level that Rotary helps communities.

### Adult Testing

Adults should understand:

- the configured community organizations supported the dictionary project,
- the project is intended to promote literacy and learning,
- Rotary is active locally,
- Rotary also participates in broader service efforts,
- the local club is part of a larger organization.

## Future Possibilities

Only after validating the POC:

- dictionary-edition profiles,
- classroom mode,
- club-specific QR codes,
- local project content,
- analytics,
- runtime organization configuration.
