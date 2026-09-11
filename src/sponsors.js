import { validateSiteConfig } from './site-config.js';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

export function renderSponsors(config, { compact = false, heading = 'Made possible by', linkLabel = 'Learn more' } = {}) {
  const { sponsors } = validateSiteConfig(config);
  return `<section class="sponsors ${compact ? 'sponsors-compact' : ''}" aria-labelledby="sponsors-title">
    <h2 id="sponsors-title">${escapeHtml(heading)}</h2>
    <div class="sponsor-grid">${sponsors.map((sponsor) => `<article class="sponsor">
      ${sponsor.logo
        ? `<img class="sponsor-logo" src="${escapeHtml(sponsor.logo)}" alt="" width="160" height="80" />`
        : `<span class="sponsor-letter" aria-hidden="true">${escapeHtml(Array.from(sponsor.title)[0])}</span>`}
      <h3>${escapeHtml(sponsor.title)}</h3>
      <p>${escapeHtml(sponsor.description)}</p>
      <a href="${escapeHtml(sponsor.url)}" rel="noreferrer">${escapeHtml(linkLabel)}<span class="sr-only"> about ${escapeHtml(sponsor.title)}</span> <span aria-hidden="true">↗</span></a>
    </article>`).join('')}</div>
  </section>`;
}

export function renderSponsorNames(config, { heading = 'Made possible by' } = {}) {
  const { sponsors } = validateSiteConfig(config);
  return `<section class="certificate-sponsors" aria-labelledby="certificate-sponsors-title">
    <h2 id="certificate-sponsors-title">${escapeHtml(heading)}</h2>
    <div class="certificate-sponsor-grid">${sponsors.map((sponsor) => `<div class="certificate-sponsor">
      ${sponsor.logo
        ? `<img class="sponsor-logo" src="${escapeHtml(sponsor.logo)}" alt="" width="160" height="80" />`
        : `<span class="sponsor-letter" aria-hidden="true">${escapeHtml(Array.from(sponsor.title)[0])}</span>`}
      <strong>${escapeHtml(sponsor.title)}</strong>
    </div>`).join('')}</div>
  </section>`;
}
