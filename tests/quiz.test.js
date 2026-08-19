import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { questions } from '../src/content/questions.js';
import { answerQuestion } from '../src/quiz.js';

describe('structured dictionary question', () => {
  it('keeps the literacy objective and Rotary context separate from answer correctness', () => {
    const question = questions[0];
    assert.equal(question.dictionarySkill, 'definition');
    assert.equal(question.literacyObjective, 'read-and-interpret-entry');
    assert.match(question.rotaryContext, /Rotary/);
    assert.doesNotMatch(question.answers.find((answer) => answer.correct).text, /Rotary/);
  });

  it('returns encouraging retry and success states', () => {
    assert.equal(answerQuestion(questions[0], 'sell').status, 'incorrect');
    assert.equal(answerQuestion(questions[0], 'help').status, 'correct');
  });
});

describe('client-only journey', () => {
  it('contains the child path, physical-book instruction, retry, and completion states', async () => {
    const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
    assert.match(source, /I’m a Kid/);
    assert.match(source, /physical book/);
    assert.match(source, /Almost!/);
    assert.match(source, /Try Again/);
    assert.match(source, /Dictionary Explorer/);
  });

  it('contains a grown-up path explaining the literacy purpose', async () => {
    const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
    assert.match(source, /I’m a Grown-up/);
    assert.match(source, /Why this dictionary?/);
    assert.match(source, /literacy, learning, and independence/);
  });
});
