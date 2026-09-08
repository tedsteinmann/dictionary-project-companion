import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { importedQuestions } from '../src/content/imported-questions.js';
import { lessons } from '../src/content/lessons.js';
import { questions } from '../src/content/questions.js';
import { levels } from '../src/content/levels.js';
import {
  canStartLevel, choicesFor, questionGroup, checkAnswer, createCompletionCode, createSession, gradeAttempt,
  moveToQuestion, normalizeAnswer, persistSession, restoreSession, saveAnswer,
  selectQuestions, startAttempt, submitAttempt
} from '../src/quiz.js';

const randomSource = (seed) => () => {
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const counts = (items, key) => Object.values(items.reduce((result, item) => {
  result[key(item)] = (result[key(item)] || 0) + 1;
  return result;
}, {}));
const answerAttempt = (session, correctCount) => {
  for (let index = 0; index < 10; index++) {
    session = moveToQuestion(session, index);
    const question = questions.find((q) => q.id === session.attempt.questionIds[index]);
    session = saveAnswer(session, index < correctCount ? `  ${question.answer.toUpperCase()}  ` : 'still exploring');
  }
  return session;
};
const memoryStorage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
};

describe('CSV question bank', () => {
  it('imports all source fields and primary answers while keeping verification internal', () => {
    const rows = JSON.parse(execFileSync('python3', ['-c',
      'import csv,json; print(json.dumps(list(csv.DictReader(open("content/dictionary-quiz.csv")))))'
    ], { encoding: 'utf8' }));
    assert.equal(importedQuestions.length, 99);
    assert.equal(new Set(importedQuestions.map((q) => q.id)).size, 99);
    for (const row of rows) {
      const q = importedQuestions.find((item) => item.id === Number(row['#']));
      assert.equal(q.answer, row.Answer.trim());
      assert.equal(q.category, row.Category);
      assert.equal(q.subcategory, row.Subcategory);
      assert.equal(q.difficulty, row.Difficulty);
      if (q.id !== 12) assert.equal(q.question, row.Question.trim());
      assert.equal(q.type, 'typed-answer');
      assert.ok(q.dictionarySkill && q.literacyObjective && q.theme && q.prompt && q.success);
      assert.equal(q.verified, undefined);
      assert.doesNotMatch(q.answer, /rotary/i);
    }
    assert.match(questions.find((q) => q.id === 12).question, /How many types/);
    assert.deepEqual(levels.map((level) => importedQuestions.filter((q) => q.difficulty === level.difficulty).length), [54, 26, 19]);
  });
});

describe('varied random attempts', () => {
  it('selects exactly ten unique, difficulty-matched questions with category/topic limits over repeated sessions', () => {
    for (const level of levels) {
      for (let seed = 1; seed <= 100; seed++) {
        const random = randomSource(seed);
        let seenIds = [];
        let previousIds = [];
        for (let attempt = 0; attempt < 10; attempt++) {
          const selected = selectQuestions(questions, level.difficulty, { seenIds, previousIds, random });
          const ids = selected.map((q) => q.id);
          assert.equal(selected.length, 10);
          assert.ok(selected.every((q) => q.available !== false));
          for (const [group, count] of Object.entries(level.mix)) {
            assert.equal(selected.filter((q) => questionGroup(q) === group).length, count);
          }
          if (level.id === 1) assert.ok(selected.slice(0, 6).every((q) => q.source === 'lesson'));

          assert.equal(new Set(ids).size, 10);
          assert.ok(selected.every((q) => q.difficulty === level.difficulty));
          assert.ok(Math.max(...counts(selected, (q) => q.category)) <= 3);
          assert.ok(Math.max(...counts(selected, (q) => `${q.category}/${q.subcategory}`)) <= 2);
          if (previousIds.length) assert.notDeepEqual([...ids].sort(), [...previousIds].sort());
          previousIds = ids;
          seenIds = [...new Set([...seenIds, ...ids])];
        }
      }
    }
  });

  it('prefers unseen questions when a varied unseen pool is available', () => {
    const seenIds = questions.filter((q) => q.category === 'Presidents').map((q) => q.id);
    for (const level of levels) {
      const selected = selectQuestions(questions, level.difficulty, { seenIds, random: randomSource(9) });
      assert.ok(selected.every((q) => !seenIds.includes(q.id)));
    }
  });

  it('varies attempts with different random seeds and leaves bank order unchanged', () => {
    const ids = questions.map((q) => q.id);
    assert.notDeepEqual(selectQuestions(questions, 'Easy', { random: randomSource(1) }),
      selectQuestions(questions, 'Easy', { random: randomSource(2) }));
    assert.deepEqual(questions.map((q) => q.id), ids);
  });

  it('rejects undersized pools and relaxes variety only if necessary', () => {
    assert.throws(() => selectQuestions(questions.slice(0, 2), 'Easy'), /at least ten/);
    const narrow = Array.from({ length: 11 }, (_, id) => ({ id, difficulty: 'Easy', category: 'One', subcategory: 'One' }));
    assert.equal(selectQuestions(narrow, 'Easy').length, 10);
  });
});

describe('exact typed answer checking with formatting normalization', () => {
  it('accepts case, surrounding/repeated spaces, accents and typographic punctuation', () => {
    for (const value of ['BISMARCK', 'Bismarck', 'bismarck', '  bismarck  ']) assert.ok(checkAnswer({ answer: 'Bismarck' }, value));
    assert.ok(checkAnswer({ answer: 'North America' }, ' north   america '));
    assert.ok(checkAnswer({ answer: 'Brasília' }, 'Brasilia'));
    assert.ok(checkAnswer({ answer: "a-word's" }, 'A–WORD’S'));
    assert.equal(normalizeAnswer('  New\tYork\n'), 'new york');
  });

  it('accepts properly formatted thousands separators, retaining meaningful punctuation and spelling', () => {
    assert.ok(checkAnswer({ answer: '1,909' }, '1909'));
    assert.ok(checkAnswer({ answer: '1909' }, '1,909'));
    for (const value of ['19,09', '1.909', '190', '19090', '1 909']) assert.equal(checkAnswer({ answer: '1,909' }, value), false);
    for (const value of ['bismark', 'bissmarck', 'bismarck!', '']) assert.equal(checkAnswer({ answer: 'Bismarck' }, value), false);
    assert.equal(checkAnswer({ answer: '71%' }, '71'), false);
    assert.equal(checkAnswer({ answer: '0' }, ''), false);
  });

  it('supports explicitly approved alternate answers without changing the primary display answer', () => {
    const question = { answer: 'primary', acceptedAnswers: ['alternate'] };
    assert.ok(checkAnswer(question, 'ALTERNATE'));
    assert.equal(question.answer, 'primary');
  });
});

describe('level progression and submission', () => {
  it('uses capability-based stage names while retaining internal difficulty selection', () => {
    assert.deepEqual(levels.map(({ name }) => name), ['Find It', 'Figure It Out', 'Discover More']);
    assert.deepEqual(levels.map(({ difficulty }) => difficulty), ['Easy', 'Medium', 'Hard']);
  });

  it('starts at Level 1, prevents skipping locked levels, and tracks only displayed questions', () => {
    const initial = createSession();
    assert.equal(canStartLevel(initial, 1), true);
    assert.equal(canStartLevel(initial, 2), false);
    assert.strictEqual(startAttempt(initial, questions, 3), initial);
    const session = startAttempt(initial, questions, 1);
    assert.equal(session.attempt.index, 0);
    assert.equal(session.seenIds.length, 1);
    assert.equal(moveToQuestion(session, 1).seenIds.length, 2);
    assert.strictEqual(moveToQuestion(session, -1), session);
    assert.strictEqual(moveToQuestion(session, 10), session);
  });

  it('allows editing before submission and rejects incomplete attempts', () => {
    let session = startAttempt(createSession(), questions, 1);
    session = saveAnswer(session, 'first answer');
    assert.equal(session.attempt.submitted, false);
    assert.equal(session.attempt.score, undefined);
    assert.equal(session.attempt.certificate, undefined);
    session = moveToQuestion(session, 1);
    session = moveToQuestion(session, 0);
    assert.equal(session.attempt.answers[0], 'first answer');
    session = saveAnswer(session, 'second answer');
    assert.equal(session.attempt.answers[0], 'second answer');
    assert.strictEqual(submitAttempt(session, questions), session);
  });

  it('6/10 offers a fresh retake without unlocking or issuing a certificate', () => {
    let session = answerAttempt(startAttempt(createSession(), questions, 1), 6);
    session = submitAttempt(session, questions);
    assert.equal(gradeAttempt(session.attempt, questions).score, 6);
    assert.equal(session.attempt.submitted, true);
    assert.equal(session.attempt.certificate, null);
    assert.equal(canStartLevel(session, 2), false);
    const retry = startAttempt(session, questions, 1);
    assert.equal(retry.attempt.submitted, false);
    assert.notDeepEqual([...retry.attempt.questionIds].sort(), [...session.attempt.questionIds].sort());
    assert.ok(retry.attempt.answers.every((answer) => answer === ''));
  });

  it('7/10 earns a certificate at every level and unlocks the next; submission is idempotent', () => {
    let session = createSession();
    for (const level of levels) {
      assert.equal(canStartLevel(session, level.id), true, `${level.name} should be unlocked in sequence`);
      if (level.id < levels.length) assert.equal(canStartLevel(session, level.id + 1), false, `${levels[level.id].name} should still be locked`);
      session = answerAttempt(startAttempt(session, questions, level.id), 7);
      session = submitAttempt(session, questions);
      assert.equal(gradeAttempt(session.attempt, questions).score, 7);
      assert.equal(gradeAttempt(session.attempt, questions).details.filter((item) => !item.correct).length, 3);
      assert.ok(session.passedLevels.includes(level.id));
      assert.equal(session.attempt.certificate.levelId, level.id);
      assert.equal(session.certificates.length, level.id);
      if (level.id < levels.length) assert.equal(canStartLevel(session, level.id + 1), true, `${levels[level.id].name} should unlock after passing`);
      assert.strictEqual(submitAttempt(session, questions), session);
      assert.strictEqual(saveAnswer(session, 'changed'), session);
      assert.strictEqual(moveToQuestion(session, 0), session);
    }
    assert.equal(canStartLevel(session, 4), false);
    const retry = submitAttempt(answerAttempt(startAttempt(session, questions, 1), 0), questions);
    assert.deepEqual(retry.passedLevels, [1, 2, 3]);
    assert.equal(retry.certificates.length, 3);
  });

  it('uses random human-readable certificate references', () => {
    const codes = Array.from({ length: 100 }, createCompletionCode);
    assert.equal(new Set(codes).size, codes.length);
    assert.ok(codes.every((code) => /^DC-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(code)));
  });
});

describe('tab-only state and storage fallback', () => {
  it('restores answers, seen history, unlocked levels and earned certificates after reload', () => {
    let session = submitAttempt(answerAttempt(startAttempt(createSession(), questions, 1), 10), questions);
    const storage = memoryStorage();
    persistSession(session, storage);
    assert.deepEqual(restoreSession(storage, questions), session);
    session = saveAnswer(startAttempt(session, questions, 2), '<script>not markup</script>');
    persistSession(session, storage);
    assert.deepEqual(restoreSession(storage, questions), session);
  });

  it('continues without storage and safely resets malformed data', () => {
    const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
    assert.deepEqual(restoreSession(blocked, questions), createSession());
    assert.doesNotThrow(() => persistSession(createSession(), blocked));
    assert.deepEqual(restoreSession({ getItem: () => '{bad' }, questions), createSession());
    const session = startAttempt(createSession(), questions, 1);
    session.attempt.questionIds[0] = 999;
    const storage = memoryStorage();
    persistSession(session, storage);
    assert.deepEqual(restoreSession(storage, questions), createSession());
  });
});


describe('guided dictionary learning and reusable formats', () => {
  it('retains all 99 source questions and restores the original seven scored lessons', () => {
    assert.equal(questions.length, importedQuestions.length + lessons.length);
    assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
    for (const source of importedQuestions) {
      const playable = questions.find((q) => q.id === source.id);
      assert.equal(playable.answer, source.answer);
      assert.equal(playable.sourceDifficulty, source.difficulty);
    }
    for (const id of ['alphabetical-order', 'community-guide-words', 'volunteer-definition', 'service-multiple-meanings', 'generous-part-of-speech', 'cooperate-context', 'leader-related-words']) {
      assert.ok(lessons.some((q) => q.id === id), id);
    }
    assert.ok(lessons.every((q) => q.tip && q.success && q.dictionarySkill));
    assert.deepEqual(questions.filter((q) => q.available === false).map((q) => q.id), [4, 22]);
  });

  it('provides unambiguous authored choices and exact grading for all formats', () => {
    for (const question of questions) {
      if (question.choices) {
        assert.ok(['multiple-choice', 'yes-no'].includes(question.type));
        assert.ok(question.choices.length >= 2 && question.choices.length <= 4);
        assert.equal(new Set(question.choices.map(normalizeAnswer)).size, question.choices.length, String(question.id));
        assert.equal(question.choices.filter((choice) => checkAnswer(question, choice)).length, 1, String(question.id));
      } else assert.equal(question.type, 'typed-answer');
    }
    assert.equal(lessons.find((q) => q.id === 'community-guide-words').type, 'yes-no');
  });

  it('shuffles option positions and preserves the order through edits and reloads', () => {
    const positions = new Set();
    for (let seed = 1; seed <= 15; seed++) {
      let session = startAttempt(createSession(), questions, 1, randomSource(seed));
      const question = questions.find((q) => q.id === session.attempt.questionIds[0]);
      const order = choicesFor(session.attempt, question);
      positions.add(order.indexOf(question.answer));
      session = saveAnswer(session, order[1]);
      session = moveToQuestion(moveToQuestion(session, 1), 0);
      assert.deepEqual(choicesFor(session.attempt, question), order);
      assert.equal(session.attempt.answers[0], order[1]);
      const storage = memoryStorage();
      persistSession(session, storage);
      assert.deepEqual(restoreSession(storage, questions), session);
    }
    assert.ok(positions.size > 1, 'Correct answer must not always occupy the same position');
  });

  it('preserves old typed-quiz certificates and attempts after difficulty adaptations', () => {
    let legacy = startAttempt(createSession(), importedQuestions, 1, randomSource(42));
    const storage = memoryStorage();
    persistSession(legacy, storage);
    assert.deepEqual(restoreSession(storage, questions), legacy);
    legacy = submitAttempt(answerAttempt(legacy, 8), importedQuestions);
    persistSession(legacy, storage);
    assert.deepEqual(restoreSession(storage, questions), legacy);
  });
});
