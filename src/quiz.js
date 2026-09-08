import { levels, PASSING_SCORE, QUESTIONS_PER_ATTEMPT } from './content/levels.js';

export function normalizeAnswer(value) {
  const text = String(value).normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase().trim().replace(/\s+/g, ' ')
    .replace(/[‘’]/g, "'").replace(/[‐‑–—]/g, '-');
  // Remove commas only in properly grouped numbers, never arbitrary punctuation.
  return /^[+-]?\d{1,3}(,\d{3})+(\.\d+)?%?$/.test(text) ? text.replace(/,/g, '') : text;
}

export function checkAnswer(question, value) {
  const normalized = normalizeAnswer(value);
  return normalized !== '' && [question.answer, ...(question.acceptedAnswers || [])]
    .some((answer) => normalizeAnswer(answer) === normalized);
}

function shuffle(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

const topicKey = (question) => `${question.category}/${question.subcategory}`;

export function selectQuestions(bank, difficulty, { seenIds = [], previousIds = [], random = Math.random } = {}) {
  const pool = shuffle(bank.filter((question) => question.difficulty === difficulty), random);
  if (pool.length < QUESTIONS_PER_ATTEMPT) throw new Error('This level needs at least ten questions.');
  const seen = new Set(seenIds);
  const previous = new Set(previousIds);
  const selected = [];
  const categories = new Map();
  const topics = new Map();
  const categoryCount = (q) => categories.get(q.category) || 0;
  const topicCount = (q) => topics.get(topicKey(q)) || 0;
  let categoryLimit = 3;
  let topicLimit = 2;

  while (selected.length < QUESTIONS_PER_ATTEMPT) {
    const eligible = pool.filter((q) => !selected.includes(q) && categoryCount(q) < categoryLimit && topicCount(q) < topicLimit);
    if (!eligible.length) {
      // Small future pools may need a relaxed limit to fill all ten positions.
      categoryLimit++;
      topicLimit++;
      continue;
    }
    const priority = (q) => Number(seen.has(q.id)) * 1000 + Number(previous.has(q.id)) * 100
      + categoryCount(q) * 10 + topicCount(q);
    eligible.sort((a, b) => priority(a) - priority(b));
    const question = eligible[0];
    selected.push(question);
    categories.set(question.category, categoryCount(question) + 1);
    topics.set(topicKey(question), topicCount(question) + 1);
  }

  // Even once the pool is exhausted, a retake must change the set, not just its order.
  if (previous.size === QUESTIONS_PER_ATTEMPT && selected.every((q) => previous.has(q.id))) {
    for (const alternative of pool.filter((q) => !previous.has(q.id))) {
      const replaceIndex = selected.findIndex((q) =>
        categoryCount(alternative) - Number(q.category === alternative.category) < categoryLimit &&
        topicCount(alternative) - Number(topicKey(q) === topicKey(alternative)) < topicLimit);
      if (replaceIndex !== -1) {
        selected[replaceIndex] = alternative;
        break;
      }
    }
  }
  return shuffle(selected, random);
}

export function createSession() {
  return { seenIds: [], passedLevels: [], previousAttempts: {}, attempt: null, certificates: [] };
}

export function canStartLevel(session, levelId) {
  return levels.some((level) => level.id === levelId) &&
    levels.filter((level) => level.id < levelId).every((level) => session.passedLevels.includes(level.id));
}

export function startAttempt(session, bank, levelId, random = Math.random) {
  if (!canStartLevel(session, levelId)) return session;
  const level = levels.find((item) => item.id === levelId);
  const selected = selectQuestions(bank, level.difficulty, {
    seenIds: session.seenIds, previousIds: session.previousAttempts[levelId] || [], random
  });
  const questionIds = selected.map((q) => q.id);
  return {
    ...session,
    // Only mark a question seen when displayed, not merely selected.
    seenIds: [...new Set([...session.seenIds, questionIds[0]])],
    previousAttempts: { ...session.previousAttempts, [levelId]: questionIds },
    attempt: { levelId, questionIds, answers: Array(QUESTIONS_PER_ATTEMPT).fill(''), index: 0, submitted: false }
  };
}

export function saveAnswer(session, value) {
  if (!session.attempt || session.attempt.submitted) return session;
  const answers = [...session.attempt.answers];
  answers[session.attempt.index] = value;
  return { ...session, attempt: { ...session.attempt, answers } };
}

export function moveToQuestion(session, index) {
  if (!session.attempt || session.attempt.submitted || !Number.isInteger(index) || index < 0 || index >= QUESTIONS_PER_ATTEMPT) return session;
  return {
    ...session,
    seenIds: [...new Set([...session.seenIds, session.attempt.questionIds[index]])],
    attempt: { ...session.attempt, index }
  };
}

export function gradeAttempt(attempt, bank) {
  const details = attempt.questionIds.map((id, index) => {
    const question = bank.find((q) => q.id === id);
    return { question, answer: attempt.answers[index], correct: checkAnswer(question, attempt.answers[index]) };
  });
  const score = details.filter((item) => item.correct).length;
  return { score, passed: score >= PASSING_SCORE, details };
}

export function createCompletionCode() {
  // About 59 random bits; omit ambiguous letters/digits for easier transcription.
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  // Rejection sampling avoids modulo bias with this 31-character alphabet.
  let code = '';
  while (code.length < 12) {
    for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
      if (byte < 248 && code.length < 12) code += alphabet[byte % alphabet.length];
    }
  }
  return `DC-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`;
}

export function submitAttempt(session, bank, makeCode = createCompletionCode) {
  const { attempt } = session;
  if (!attempt || attempt.submitted || attempt.answers.some((answer) => !answer.trim())) return session;
  const result = gradeAttempt(attempt, bank);
  const completed = new Date();
  const date = [completed.getFullYear(), completed.getMonth() + 1, completed.getDate()]
    .map((part) => String(part).padStart(2, '0')).join('-');
  const certificate = result.passed ? {
    levelId: attempt.levelId, score: result.score, code: makeCode(), date
  } : null;
  return {
    ...session,
    passedLevels: result.passed ? [...new Set([...session.passedLevels, attempt.levelId])] : session.passedLevels,
    certificates: certificate ? [...session.certificates, certificate] : session.certificates,
    attempt: { ...attempt, submitted: true, certificate }
  };
}

const STORAGE_KEY = 'dictionary-challenge-v2';

export function persistSession(session, storage) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch { /* Continue in memory. */ }
}

export function restoreSession(storage, bank) {
  try {
    const session = JSON.parse(storage.getItem(STORAGE_KEY));
    const validId = (id) => bank.some((q) => q.id === id);
    if (!session || !Array.isArray(session.seenIds) || !session.seenIds.every(validId) ||
      !Array.isArray(session.passedLevels) || !session.passedLevels.every((id) => levels.some((l) => l.id === id)) ||
      !session.previousAttempts || !Array.isArray(session.certificates)) throw new Error('Invalid session');
    for (const ids of Object.values(session.previousAttempts)) {
      if (!Array.isArray(ids) || ids.length !== QUESTIONS_PER_ATTEMPT || !ids.every(validId)) throw new Error('Invalid history');
    }
    const validCertificate = (c) => c && levels.some((l) => l.id === c.levelId) &&
      Number.isInteger(c.score) && c.score >= PASSING_SCORE && c.score <= QUESTIONS_PER_ATTEMPT &&
      /^DC-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(c.code) && /^\d{4}-\d{2}-\d{2}$/.test(c.date);
    if (!session.certificates.every(validCertificate)) throw new Error('Invalid certificates');
    if (!session.passedLevels.every((id) => canStartLevel(session, id) &&
      session.certificates.some((c) => c.levelId === id))) throw new Error('Invalid level progress');
    const attempt = session.attempt;
    if (attempt) {
      const level = levels.find((l) => l.id === attempt.levelId);
      if (!level || !canStartLevel(session, level.id) || !Array.isArray(attempt.questionIds) ||
        attempt.questionIds.length !== QUESTIONS_PER_ATTEMPT || new Set(attempt.questionIds).size !== QUESTIONS_PER_ATTEMPT ||
        !attempt.questionIds.every((id) => bank.some((q) => q.id === id && q.difficulty === level.difficulty)) ||
        !Array.isArray(attempt.answers) || attempt.answers.length !== QUESTIONS_PER_ATTEMPT ||
        !attempt.answers.every((answer) => typeof answer === 'string') ||
        !Number.isInteger(attempt.index) || attempt.index < 0 || attempt.index >= QUESTIONS_PER_ATTEMPT ||
        typeof attempt.submitted !== 'boolean' ||
        (attempt.certificate && (!attempt.submitted || !validCertificate(attempt.certificate)))) throw new Error('Invalid attempt');
      if (attempt.submitted) {
        const result = gradeAttempt(attempt, bank);
        if (attempt.answers.some((answer) => !answer.trim()) ||
          result.passed !== Boolean(attempt.certificate) ||
          (result.passed && (attempt.certificate.score !== result.score ||
            attempt.certificate.levelId !== attempt.levelId ||
            !session.certificates.some((c) => c.code === attempt.certificate.code)))) throw new Error('Invalid result');
      }
    }
    return session;
  } catch {
    return createSession();
  }
}
