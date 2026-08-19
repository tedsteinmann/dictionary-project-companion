import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { questions } from '../src/content/questions.js';
import {
  acknowledgeQuestion,
  answerQuestion,
  getProgress,
  initialQuizState,
  nextQuestion,
  resetQuiz,
  retryQuestion
} from '../src/quiz.js';

describe('multi-question quiz state', () => {
  it('starts unanswered on question index zero', () => {
    assert.deepEqual(initialQuizState, {
      currentQuestionIndex: 0,
      status: 'unanswered',
      answerId: null
    });
  });

  it('keeps a correct answer on the current question until next is selected', () => {
    const answered = answerQuestion(initialQuizState, questions[0], 'read');
    assert.equal(answered.status, 'correct');
    assert.equal(answered.currentQuestionIndex, 0);
  });

  it('does not advance after an incorrect answer', () => {
    const answered = answerQuestion(initialQuizState, questions[0], 'resource');
    assert.equal(answered.status, 'incorrect');
    assert.strictEqual(nextQuestion(answered, questions.length), answered);
  });

  it('retries without changing the question index', () => {
    const state = { currentQuestionIndex: 3, status: 'incorrect', answerId: 'machine' };
    assert.deepEqual(retryQuestion(state), {
      currentQuestionIndex: 3,
      status: 'unanswered',
      answerId: null
    });
  });

  it('increments the index and clears the answer for the next question', () => {
    const answered = answerQuestion(initialQuizState, questions[0], 'read');
    assert.deepEqual(nextQuestion(answered, questions.length), {
      currentQuestionIndex: 1,
      status: 'unanswered',
      answerId: null
    });
  });

  it('calculates challenge-position progress rather than score', () => {
    assert.deepEqual(getProgress({ ...initialQuizState, currentQuestionIndex: 3 }, 8), {
      current: 4,
      total: 8,
      percent: 50
    });
  });

  it('acknowledges the final challenge and does not advance past it', () => {
    const finalState = { ...initialQuizState, currentQuestionIndex: 7 };
    const acknowledged = acknowledgeQuestion(finalState, questions[7]);
    assert.equal(acknowledged.status, 'correct');
    assert.equal(acknowledged.answerId, 'acknowledged');
    assert.strictEqual(nextQuestion(acknowledged, questions.length), acknowledged);
  });

  it('replay resets the quiz to the beginning', () => {
    assert.deepEqual(resetQuiz(), initialQuizState);
    assert.notStrictEqual(resetQuiz(), initialQuizState);
  });
});

describe('structured question content', () => {
  it('contains the intentional eight-question skill sequence with unique IDs', () => {
    assert.equal(questions.length, 8);
    assert.equal(new Set(questions.map(({ id }) => id)).size, questions.length);
    assert.deepEqual(questions.map(({ dictionarySkill }) => dictionarySkill), [
      'alphabetical-order',
      'guide-words',
      'definition',
      'multiple-meanings',
      'part-of-speech',
      'context',
      'related-words',
      'independent-lookup'
    ]);
  });

  it('gives every submitted-answer question exactly one correct answer', () => {
    for (const question of questions.filter(({ type }) => type !== 'acknowledgement')) {
      assert.ok(['multiple-choice', 'yes-no'].includes(question.type));
      assert.equal(question.answers.filter(({ correct }) => correct).length, 1, question.id);
    }
  });

  it('keeps Rotary knowledge separate from answer correctness', () => {
    for (const question of questions.filter(({ type }) => type !== 'acknowledgement')) {
      assert.doesNotMatch(question.answers.find(({ correct }) => correct).text, /Rotary/i);
    }
    assert.equal(questions[0].rotaryContext, undefined);
    assert.equal(questions[7].rotaryContext, undefined);
  });
});

describe('client-only journey', () => {
  it('renders dynamic progress, retry, next, acknowledgement, and completion behavior', async () => {
    const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
    assert.match(source, /questions\[quizState\.currentQuestionIndex\]/);
    assert.match(source, /Challenge \$\{progress\.current\} of \$\{progress\.total\}/);
    assert.match(source, /Try Again/);
    assert.match(source, /Next Challenge/);
    assert.match(source, /acknowledgeQuestion/);
    assert.match(source, /You used your dictionary to find words, understand meanings, and discover something new/);
  });

  it('retains the child introduction and grown-up literacy path', async () => {
    const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
    assert.match(source, /I’m a Kid/);
    assert.match(source, /physical book/);
    assert.match(source, /I’m a Grown-up/);
    assert.match(source, /Why this dictionary?/);
    assert.match(source, /literacy, learning, and independence/);
  });
});
