import { escapeHtml } from './sponsors.js';

export function renderParticipantLocations(locations) {
  return locations.map((location) => `<article class="redemption-location">
    <h2>${escapeHtml(location.name)}</h2>
    ${location.addressLines.length ? `<address>${location.addressLines.map(escapeHtml).join('<br />')}</address>` : ''}
    ${location.website ? `<p><a href="${escapeHtml(location.website)}" rel="noreferrer">Visit the ${escapeHtml(location.name)} website <span aria-hidden="true">↗</span></a></p>` : ''}
  </article>`).join('');
}
