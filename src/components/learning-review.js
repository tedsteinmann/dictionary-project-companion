import { escapeHtml } from '../sponsors.js';
import { independentDiscovery } from '../content/lessons.js';
import { icon } from './icons.js';

export function learningReview(details) {
  return `<details class="learning-review"><summary>${icon('book')} What your dictionary helped you learn</summary>
    <ol class="review-list">${details.map(({ question, correct }, index) => `<li><p><strong>Question ${index + 1} · ${correct ? 'Cracked' : 'Keep exploring'}</strong></p><p>${escapeHtml(question.question)}</p><p>${escapeHtml(question.success)}</p>${question.rotaryContext ? `<p class="progress-copy">${escapeHtml(question.rotaryContext)}</p>` : ''}</li>`).join('')}</ol></details>`;
}

export function discoveryActivity() {
  return `<section class="discovery-activity" aria-labelledby="discovery-title"><h2 id="discovery-title">${icon('discover')} ${independentDiscovery.title}</h2><p>${independentDiscovery.prompt}</p>
    <details><summary>${independentDiscovery.action}</summary><p>${independentDiscovery.success}</p></details></section>`;
}
