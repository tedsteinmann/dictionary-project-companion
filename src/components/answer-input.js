import { escapeHtml } from '../sponsors.js';
import { normalizeAnswer } from '../quiz.js';
import { icon } from './icons.js';

export function typedAnswer(value = '') {
  return `<div class="answer-input"><label class="answer-label" for="typed-answer">${icon('pencil')} Type your answer</label>
    <input id="typed-answer" name="answer" type="text" required maxlength="200" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-describedby="answer-help" value="${escapeHtml(value)}" />
    <p class="progress-copy" id="answer-help">Check your spelling; capital letters don’t matter. Results appear after submission.</p></div>`;
}

export function choiceAnswer(question, value = '', choices = question.choices) {
  return `<fieldset class="choice-input" aria-describedby="answer-help"><legend class="answer-label">${icon('choice')} ${question.type === 'yes-no' ? 'Choose yes or no' : 'Choose one answer'}</legend>
    <div class="choice-options ${question.type === 'yes-no' ? 'choice-binary' : ''}">${choices.map((choice) => `<label class="choice-option"><input type="radio" name="answer" value="${escapeHtml(choice)}" required ${normalizeAnswer(choice) === normalizeAnswer(value) ? 'checked' : ''} /><span>${escapeHtml(choice)}</span></label>`).join('')}</div>
    <p class="progress-copy" id="answer-help">You can change your choice. Results appear after submission.</p></fieldset>`;
}

// One registry for additional formats; navigation and scoring stay in the quiz engine.
const renderers = { 'typed-answer': typedAnswer, 'multiple-choice': choiceAnswer, 'yes-no': choiceAnswer };
export function renderAnswerInput(question, value, choices) {
  const render = renderers[question.type];
  if (!render) throw new Error(`Unsupported question type: ${question.type}`);
  return question.type === 'typed-answer' ? render(value) : render(question, value, choices);
}

export function readAnswer(form) {
  return new FormData(form).get('answer') || '';
}
