# Content Strategy and Quiz Model

## Content Goal

Every child question should primarily contribute to one or more of these outcomes:

1. Learn how to navigate a dictionary.
2. Learn how to understand a dictionary entry.
3. Learn how a dictionary can support reading or writing.
4. Practice independent problem-solving.
5. Discover vocabulary connected to community and service.

## Mission Alignment

The challenge should reinforce the underlying purpose of providing children with their own dictionaries:

- better writing,
- active reading,
- creative thinking,
- resourceful learning,
- long-term use of a personal reference tool.

The digital experience should not replace the reference tool.

It should teach the child how to get value from it.

## Content Priority

When evaluating a proposed question, use this priority order:

```text
1. Does it teach a dictionary skill?
2. Does it support literacy or independent learning?
3. Is it fun and understandable?
4. Can a Rotary/service connection make the word meaningful?
```

Do not reverse this order.

A weak dictionary question should not be included merely because it supports a Rotary fact.

## Rotary Content Strategy

The child challenge should give a broad, simple picture of Rotary.

Core idea:

> Rotary members work together to help people in their communities and around the world.

Themes can include:

- literacy,
- volunteering,
- community,
- cooperation,
- leadership,
- health,
- clean water,
- peace,
- environment,
- youth,
- generosity,
- service.

Rotary examples should usually appear **after** the dictionary question is answered.

## Initial Question Mix

An 8-question POC could intentionally cover:

| # | Dictionary Skill | Example Theme |
|---|---|---|
| 1 | Alphabetical order | Literacy |
| 2 | Guide words | Community |
| 3 | Definition | Volunteer |
| 4 | Multiple meanings | Service |
| 5 | Part of speech | Generous |
| 6 | Context | Cooperation |
| 7 | Word relationships | Leadership |
| 8 | Independent lookup | Child chooses/discovers |

This avoids making every question identical.

## Sample Question 1 — Alphabetical Order

### Skill

Alphabetical order.

### Prompt

> Dictionaries put words in alphabetical order.
>
> Which word comes first?

- read
- rotary
- resource

### Answer

`read`

### Literacy Feedback

> Nice work! Alphabetical order helps you find words quickly.

No Rotary explanation is necessary on every question.

---

## Sample Question 2 — Guide Words

### Skill

Guide words.

### Prompt

> Look at the words at the top of a dictionary page.
>
> These are called **guide words**.
>
> If the guide words are:
>
> **combine — company**
>
> Would you expect to find **community** on this page?

- Yes
- No

### Answer

`Yes`

### Feedback

> Guide words tell you the first and last words on a page. They help you search faster.

### Optional Rotary Context

> A community is a group of people connected by where they live or what they share. Rotary Clubs serve their communities.

---

## Sample Question 3 — Definition

### Skill

Finding and reading a definition.

### Theme

Volunteering.

### Prompt

> Find **VOLUNTEER** in your dictionary.
>
> Which description is closest to the meaning?

- Someone who freely chooses to help
- Someone who sells an item
- Someone who wins a prize
- Someone who travels

### Answer

`Someone who freely chooses to help`

### Feedback

> Great find! Volunteers choose to give their time or effort.
>
> Rotary members are volunteers who work on projects that help other people.

---

## Sample Question 4 — Multiple Meanings

### Skill

Choosing a definition using context.

### Theme

Service.

### Prompt

> Find **SERVICE**.
>
> It may have more than one meaning.
>
> Which meaning fits this sentence?
>
> **The club organized a service project to improve the park.**

Answer choices should be adapted to the actual dictionary edition.

### Feedback

> Words can have different meanings. The sentence around a word helps you choose the right one.

### Rotary Context

> Rotary Clubs organize service projects based on needs in their communities.

---

## Sample Question 5 — Part of Speech

### Skill

Parts of speech.

### Theme

Generosity.

### Prompt

> Find **GENEROUS**.
>
> What kind of word is it?

- Noun
- Verb
- Adjective
- Adverb

### Answer

`Adjective`

### Feedback

> An adjective describes a person, place, thing, or idea.

Optional follow-up:

> Can you find the related noun **generosity**?

---

## Sample Question 6 — Context

### Skill

Understanding meaning in a real situation.

### Theme

Cooperation.

### Prompt

> Find **COOPERATE**.
>
> Which situation best shows people cooperating?

- Several people working together to clean a park
- One person refusing to talk to the group
- Two people trying to hide from each other
- Someone quitting before a project begins

### Answer

`Several people working together to clean a park`

### Feedback

> Cooperation means working together toward a shared goal.
>
> Rotary Clubs cooperate with schools, nonprofits, businesses, and other Rotary Clubs to complete service projects.

---

## Sample Question 7 — Word Relationships

### Skill

Related words / vocabulary growth.

### Theme

Leadership.

### Prompt

> Find **LEAD** or **LEADER**.
>
> Which word below is most closely related?

- leadership
- leaf
- learn
- least

### Answer

`leadership`

### Feedback

> Dictionaries can help you discover related words and grow your vocabulary.
>
> Service projects often need people who can organize, listen, and lead.

---

## Sample Question 8 — Resourceful Learner Challenge

### Skill

Independent dictionary use.

### Prompt

> Final challenge!
>
> Find a word in your dictionary that you did not know before today.
>
> Read its definition.
>
> When you're ready, tap:
>
> **I found one!**

No typed answer is required.

### Completion Feedback

> That's what resourceful learners do — they know where to look when they want to learn something new.
>
> Keep your dictionary somewhere you can use it whenever you read, write, or discover a new word.

This final question directly reinforces independent dictionary use.

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

## Structured Question Data

Quiz content must be separate from UI components.

Example:

```json
{
  "id": "volunteer-definition",
  "type": "multiple-choice",
  "dictionarySkill": "definition",
  "literacyObjective": "read-and-interpret-entry",
  "theme": "volunteering",
  "mission": "Helping Others",
  "prompt": "Find VOLUNTEER in your dictionary.",
  "question": "Which description is closest to the meaning?",
  "answers": [
    {
      "id": "a",
      "text": "Someone who freely chooses to help",
      "correct": true
    },
    {
      "id": "b",
      "text": "Someone who sells an item",
      "correct": false
    }
  ],
  "success": "Great find! Volunteers choose to give their time or effort.",
  "rotaryContext": "Rotary members are volunteers who work on projects that help other people."
}
```

## Schema Principles

The question model should make it possible to distinguish:

- quiz mechanics,
- dictionary skill,
- literacy objective,
- general service theme,
- Rotary-specific context.

Do not create a complex inheritance or plugin system for this.

Simple structured data is sufficient.

## Dictionary Edition Validation

Before production use, questions must be validated against the actual dictionary edition being distributed.

Different dictionaries may vary in:

- included words,
- exact definitions,
- guide-word placement,
- pronunciation notation,
- parts-of-speech labeling,
- supplemental reference sections.

The POC may assume one representative dictionary.

A future model may include:

```json
{
  "dictionaryEdition": "edition-id"
}
```

## Child-Facing Writing Rules

Prefer:

- short instructions,
- one action at a time,
- concrete examples,
- encouraging feedback,
- minimal jargon.

Avoid turning Rotary context into long informational paragraphs.

Ideal feedback is usually:

1. one sentence explaining the dictionary concept,
2. optionally one short sentence connecting it to Rotary.

## Content Review Checklist

Before adding a question, ask:

- Does the child need or benefit from using the physical dictionary?
- What dictionary skill does this teach?
- What literacy outcome does it support?
- Is the vocabulary appropriate for the target age?
- Can the correct answer be validated against the chosen dictionary?
- Does the Rotary connection feel natural?
- Would the question still be educational without the Rotary sentence?

If the last answer is no, reconsider the question.
