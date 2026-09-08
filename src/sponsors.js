export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export function validateSponsorConfig(config) {
  if (!config || !Array.isArray(config.sponsors) || config.sponsors.length === 0) {
    throw new Error('Add at least one sponsor.');
  }
  return { sponsors: config.sponsors.map((sponsor, index) => {
    const label = `Sponsor ${index + 1}`;
    const text = (key, limit) => {
      if (typeof sponsor?.[key] !== 'string' || !sponsor[key].trim() || sponsor[key].trim().length > limit) {
        throw new Error(`${label}: ${key} is required and must be at most ${limit} characters.`);
      }
      return sponsor[key].trim();
    };
    const title = text('title', 120);
    const description = text('description', 600);
    const url = text('url', 2048);
    let website;
    try { website = new URL(url); } catch { throw new Error(`${label}: enter a full HTTP or HTTPS website URL.`); }
    if (!['https:', 'http:'].includes(website.protocol) || website.username || website.password) {
      throw new Error(`${label}: enter a full HTTP or HTTPS website URL without credentials.`);
    }
    const logo = sponsor.logo || null;
    if (logo !== null) {
      if (typeof logo !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(logo)) {
        throw new Error(`${label}: choose a PNG, JPEG, or WebP logo.`);
      }
      const base64 = logo.slice(logo.indexOf(',') + 1);
      const size = base64.length * 3 / 4 - (base64.match(/=+$/)?.[0].length || 0);
      if (base64.length % 4 !== 0 || size > MAX_LOGO_BYTES) {
        throw new Error(`${label}: logo must be valid base64 and no larger than 2 MB.`);
      }
    }
    return { title, description, url: website.href, logo };
  }) };
}

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

export function renderSponsors(config, { compact = false, heading = 'Made possible by', linkLabel = 'Learn more' } = {}) {
  const { sponsors } = validateSponsorConfig(config);
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
  const { sponsors } = validateSponsorConfig(config);
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
