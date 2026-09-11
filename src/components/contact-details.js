import { escapeHtml } from '../sponsors.js';

export function telephoneHref(telephone) {
  if (!telephone) return null;
  const compact = telephone.replace(/[().\-\s]/g, '');
  return /^\+?\d{3,15}$/.test(compact) ? `tel:${compact}` : null;
}

export function emailHref(email) {
  if (!email || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/.test(email)) return null;
  return `mailto:${email}`;
}

export function websiteHref(website) {
  if (!website) return null;
  try {
    const url = new URL(website);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function renderOrganizerContact(site) {
  const email = emailHref(site.email);
  const telephone = telephoneHref(site.telephone);
  const website = websiteHref(site.website);
  const hasDetails = site.organizerName || site.addressLines.length || telephone || email || website;
  if (!hasDetails) return '';
  return `<address class="organizer-contact">
    ${site.organizerName ? `<strong>${escapeHtml(site.organizerName)}</strong><br />` : ''}
    ${site.addressLines.length ? `${site.addressLines.map(escapeHtml).join('<br />')}<br />` : ''}
    ${telephone ? `<a href="${escapeHtml(telephone)}">${escapeHtml(site.telephone)}</a><br />` : ''}
    ${email ? `<a href="${escapeHtml(email)}">Email ${escapeHtml(site.organizerName || 'the project organizer')}</a><br />` : ''}
    ${website ? `<a href="${escapeHtml(website)}" rel="noreferrer">Visit organizer website <span aria-hidden="true">↗</span></a>` : ''}
  </address>`;
}

export function renderContactContent(config) {
  const organizerDetails = renderOrganizerContact(config.site)
    || '<p>Organizer contact details are not included in this build.</p>';
  return `<section class="card adult" aria-labelledby="contact-title">
    <p class="kicker">Project information</p>
    <h1 id="contact-title">Contact the project.</h1>
    <p class="lede">For questions about the local dictionary project or prize availability, ask a parent, guardian, teacher, or librarian to contact the project organizer.</p>
    <p>This page publishes contact details only. It does not use a contact form or collect visitor information.</p>
    <section class="adult-section" aria-labelledby="organizer-title"><h2 id="organizer-title">Project organizer</h2>${organizerDetails}</section>
    <section class="adult-section" aria-labelledby="website-title"><h2 id="website-title">Sponsor websites</h2>
      <ul>${config.sponsors.map((sponsor) => {
        const href = websiteHref(sponsor.url);
        return href ? `<li><a href="${escapeHtml(href)}" rel="noreferrer">Visit the ${escapeHtml(sponsor.title)} website <span aria-hidden="true">↗</span></a></li>` : '';
      }).join('')}</ul>
    </section>
  </section>`;
}
