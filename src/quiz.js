export const initialQuizState = Object.freeze({ answerId: null, status: 'unanswered' });

export function answerQuestion(question, answerId) {
  const answer = question.answers.find((choice) => choice.id === answerId);
  if (!answer) return initialQuizState;

  return { answerId, status: answer.correct ? 'correct' : 'incorrect' };
}
