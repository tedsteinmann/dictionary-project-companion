# Product Definition

## Working Name

**Rotary Dictionary Challenge**

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

### 3. Rotary Has a Clear Presence

This is a Rotary experience.

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

### 6. Future Reuse Is Possible, but Not the MVP

Other community organizations participate in dictionary-distribution programs.

The POC should not build multi-organization support.

It should simply avoid deeply embedding Rotary-specific assumptions into the generic quiz mechanics when separation is easy.

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
- little typing,
- immediate feedback,
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
- You will use it during the game.
- You will learn tricks for finding and understanding words.
- The experience is short and fun.

---

### Feature: Dictionary Challenge

#### User Story

As a child, I want to solve short challenges using my own dictionary so I become more comfortable using it.

#### Acceptance Criteria

- Approximately 8 questions in the POC.
- Several dictionary skills are represented.
- Most questions require or encourage use of the physical dictionary.
- Progress is visible.
- Feedback appears immediately.
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

---

### Feature: Rotary Service Context

#### User Story

As a child, I want to see how the words I discover relate to helping people and communities.

#### Acceptance Criteria

- Rotary facts are usually feedback/context, not prerequisite knowledge.
- Multiple Rotary service themes appear.
- At least one example is clearly local.
- At least one example demonstrates Rotary's broader/international capabilities.
- No single initiative dominates the content.

---

### Feature: Completion

#### User Story

As a child, I want a clear celebration when I finish.

#### Acceptance Criteria

- Completion emphasizes skills learned rather than score.
- No persistent score is required.
- Child receives a simple final service or learning challenge.
- Replay is possible.

---

### Feature: Adult Information

#### User Story

As an adult, I want to understand why Rotary gave this dictionary and what Rotary does.

#### Information Architecture

1. Why did my child receive a dictionary?
2. Why dictionaries and literacy matter
3. What is Rotary?
4. What does Rotary do locally?
5. How can local Rotary Clubs work internationally?
6. Learn more about the sponsoring club

#### Acceptance Criteria

- Literacy is the entry point.
- Rotary is clearly identified as the sponsor.
- Page distinguishes local and broader Rotary service.
- Local-club details may be placeholder content for the POC.

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
- understand at a simple level that Rotary helps communities.

### Adult Testing

Adults should understand:

- Rotary provided or sponsored the dictionary,
- the project is intended to promote literacy and learning,
- Rotary is active locally,
- Rotary also participates in broader service efforts,
- the local club is part of a larger organization.

## Future Possibilities

Only after validating the POC:

- question banks,
- randomized challenges,
- dictionary-edition profiles,
- difficulty levels,
- classroom mode,
- club-specific QR codes,
- local project content,
- printable certificates,
- analytics,
- organization configuration,
- support for additional service organizations.
