export const questions = [
  {
    id: 'volunteer-definition',
    type: 'multiple-choice',
    dictionarySkill: 'definition',
    literacyObjective: 'read-and-interpret-entry',
    theme: 'volunteering',
    mission: 'Helping others',
    prompt: 'Find VOLUNTEER in your dictionary.',
    question: 'Which description is closest to the meaning?',
    answers: [
      { id: 'help', text: 'Someone who freely chooses to help', correct: true },
      { id: 'sell', text: 'Someone who sells an item', correct: false },
      { id: 'win', text: 'Someone who wins a prize', correct: false },
      { id: 'travel', text: 'Someone who travels', correct: false }
    ],
    success: 'Great find! Volunteers choose to give their time or effort.',
    hint: 'Take another look at the definition. Which answer describes choosing to help?',
    rotaryContext: 'Rotary members are volunteers who work on projects that help other people.'
  }
];
