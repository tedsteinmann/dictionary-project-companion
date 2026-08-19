export const initialQuizState = Object.freeze({
  currentQuestionIndex: 0,
  status: 'unanswered',
  answerId: null
});

export function answerQuestion(state, question, answerId) {
  const answer = question.answers?.find((choice) => choice.id === answerId);
  if (!answer) return state;

  return {
    ...state,
    answerId,
    status: answer.correct ? 'correct' : 'incorrect'
  };
}

export function acknowledgeQuestion(state, question) {
  if (question.type !== 'acknowledgement') return state;
  return { ...state, answerId: 'acknowledged', status: 'correct' };
}

export function retryQuestion(state) {
  return { ...state, answerId: null, status: 'unanswered' };
}

export function nextQuestion(state, questionCount) {
  if (state.status !== 'correct' || state.currentQuestionIndex >= questionCount - 1) return state;
  return {
    currentQuestionIndex: state.currentQuestionIndex + 1,
    status: 'unanswered',
    answerId: null
  };
}

export function getProgress(state, questionCount) {
  return {
    current: state.currentQuestionIndex + 1,
    total: questionCount,
    percent: ((state.currentQuestionIndex + 1) / questionCount) * 100
  };
}

export function resetQuiz() {
  return { ...initialQuizState };
}
