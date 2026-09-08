export const QUESTIONS_PER_ATTEMPT = 10;
export const PASSING_SCORE = 7;

export const levels = [
  { id: 1, name: 'Codebreaker', difficulty: 'Easy', description: 'Learn the book’s clues. Mostly choose an answer, with two short answers to type.', mix: { lesson: 6, choice: 2, typed: 2 } },
  { id: 2, name: 'Code Cracker', difficulty: 'Medium', description: 'Explore word meanings and reference sections. Choose six answers and type four.', mix: { lesson: 2, choice: 4, typed: 4 } },
  { id: 3, name: 'Master Codebreaker', difficulty: 'Hard', description: 'Put your dictionary skills to work on trickier hunts. Choose six answers and type four.', mix: { lesson: 0, choice: 6, typed: 4 } }
];
