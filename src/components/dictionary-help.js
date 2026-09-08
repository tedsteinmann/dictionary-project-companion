import { escapeHtml } from '../sponsors.js';
import { icon } from './icons.js';

export function dictionaryHelp(question) {
  const guide = question.guideWords ? `<figure class="guide-example">
    <div class="guide-words"><span>${escapeHtml(question.guideWords[0])}<small>First entry</small></span><span>${escapeHtml(question.guideWords[1])}<small>Last entry</small></span></div>
    <svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M8 8h125M8 22h100M168 8h125M168 22h100" fill="none" stroke="currentColor" stroke-width="3"/></svg>
    <figcaption>Example guide words at the top of a page</figcaption></figure>` : '';
  return `<p class="find-prompt">${icon('book')}<span>${escapeHtml(question.prompt)}</span></p>${guide}
    ${question.tip ? `<details class="dictionary-tip"><summary>${icon('discover')} Dictionary tip</summary><p>${escapeHtml(question.tip)}</p></details>` : ''}`;
}
