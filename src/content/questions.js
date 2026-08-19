export const questions = [
  {
    id: 'alphabetical-order',
    type: 'multiple-choice',
    dictionarySkill: 'alphabetical-order',
    literacyObjective: 'navigate-dictionary',
    theme: 'literacy',
    mission: 'Finding Words',
    prompt: 'Dictionaries put words in alphabetical order.',
    question: 'Which word would come first?',
    answers: [
      { id: 'read', text: 'read', correct: true },
      { id: 'resource', text: 'resource', correct: false },
      { id: 'rotary', text: 'Rotary', correct: false }
    ],
    success: 'Nice work! Alphabetical order helps you find words quickly.',
    hint: 'Compare the words one letter at a time, starting from the left.'
  },
  {
    id: 'community-guide-words',
    type: 'yes-no',
    dictionarySkill: 'guide-words',
    literacyObjective: 'navigate-dictionary',
    theme: 'community',
    mission: 'Using Guide Words',
    prompt: 'Imagine the guide words at the top of a dictionary page are COMBINE — COMPANY.',
    question: 'Would you expect to find COMMUNITY on this page?',
    answers: [
      { id: 'yes', text: 'Yes', correct: true },
      { id: 'no', text: 'No', correct: false }
    ],
    success: 'Exactly! Guide words show the first and last words on a page and help you search faster.',
    hint: 'Community comes alphabetically after combine and before company.',
    rotaryContext: 'Rotary Clubs serve the communities where their members live and work.'
  },
  {
    id: 'volunteer-definition',
    type: 'multiple-choice',
    dictionarySkill: 'definition',
    literacyObjective: 'read-and-interpret-entry',
    theme: 'volunteering',
    mission: 'Understanding Definitions',
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
  },
  {
    id: 'service-multiple-meanings',
    type: 'multiple-choice',
    dictionarySkill: 'multiple-meanings',
    literacyObjective: 'use-context-to-select-definition',
    theme: 'service',
    mission: 'Words With More Than One Meaning',
    prompt: 'Find SERVICE in your dictionary. It may have more than one meaning.',
    question: 'Which meaning best fits this sentence: “The club organized a service project to improve the park.”',
    answers: [
      { id: 'helping', text: 'Helping or work done for others', correct: true },
      { id: 'ceremony', text: 'A religious ceremony', correct: false },
      { id: 'machine', text: 'Maintaining a machine', correct: false },
      { id: 'tennis', text: 'A tennis serve', correct: false }
    ],
    success: 'Words can have different meanings. The sentence around a word helps you choose the right one.',
    hint: 'Think about what the club is doing for the park and the community.',
    rotaryContext: 'Rotary Clubs organize service projects based on needs in their communities.'
  },
  {
    id: 'generous-part-of-speech',
    type: 'multiple-choice',
    dictionarySkill: 'part-of-speech',
    literacyObjective: 'interpret-dictionary-entry',
    theme: 'generosity',
    mission: 'How Words Work',
    prompt: 'Find GENEROUS in your dictionary.',
    question: 'What kind of word is GENEROUS?',
    answers: [
      { id: 'noun', text: 'Noun', correct: false },
      { id: 'verb', text: 'Verb', correct: false },
      { id: 'adjective', text: 'Adjective', correct: true },
      { id: 'adverb', text: 'Adverb', correct: false }
    ],
    success: 'You got it! An adjective describes a person, place, thing, or idea.',
    hint: 'Look for a part-of-speech label near the dictionary entry.',
    rotaryContext: 'Generosity can include giving time, skills, or resources to help others.'
  },
  {
    id: 'cooperate-context',
    type: 'multiple-choice',
    dictionarySkill: 'context',
    literacyObjective: 'apply-word-meaning',
    theme: 'cooperation',
    mission: 'Working Together',
    prompt: 'Find COOPERATE in your dictionary.',
    question: 'Which situation best shows people cooperating?',
    answers: [
      { id: 'together', text: 'Several people working together to clean a park', correct: true },
      { id: 'refusing', text: 'One person refusing to help', correct: false },
      { id: 'avoiding', text: 'Two people avoiding each other', correct: false },
      { id: 'leaving', text: 'Someone leaving before the project starts', correct: false }
    ],
    success: 'Cooperation means working together toward a shared goal.',
    hint: 'Which answer shows people helping each other accomplish the same thing?',
    rotaryContext: 'Rotary Clubs work with schools, nonprofits, businesses, and other Rotary Clubs on projects nearby and around the world.'
  },
  {
    id: 'leader-related-words',
    type: 'multiple-choice',
    dictionarySkill: 'related-words',
    literacyObjective: 'build-vocabulary',
    theme: 'leadership',
    mission: 'Word Families',
    prompt: 'Find LEADER in your dictionary.',
    question: 'Which word is most closely related?',
    answers: [
      { id: 'leadership', text: 'leadership', correct: true },
      { id: 'leaf', text: 'leaf', correct: false },
      { id: 'least', text: 'least', correct: false },
      { id: 'leather', text: 'leather', correct: false }
    ],
    success: 'Dictionaries can help you discover related words and grow your vocabulary.',
    hint: 'Look for a word that shares both the spelling and meaning of LEADER.',
    rotaryContext: 'Service projects often need people who can organize, listen, and lead.'
  },
  {
    id: 'independent-word-discovery',
    type: 'acknowledgement',
    dictionarySkill: 'independent-lookup',
    literacyObjective: 'resourceful-learning',
    theme: 'literacy',
    mission: 'Your Own Discovery',
    prompt: 'Final challenge! Find a word in your dictionary that you did not know before today. Read its definition.',
    question: "When you're ready, tap the button below.",
    acknowledgementLabel: 'I found one!',
    success: "That's what resourceful learners do — they know where to look when they want to learn something new."
  }
];
