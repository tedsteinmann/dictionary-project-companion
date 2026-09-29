import { escapeHtml } from './sponsors.js';

function normalizeLibraryName(name) {
  return name.replace(/\s+—.*$/, '').trim();
}

export function renderParticipantLocations(locations) {
  const libraries = new Map();
  for (const location of locations) {
    const libraryName = normalizeLibraryName(location.name || '');
    if (!libraries.has(libraryName)) {
      libraries.set(libraryName, { name: libraryName, logo: location.logo || null, locations: [] });
    }
    libraries.get(libraryName).locations.push(location);
  }

  const cards = [...libraries.values()].map((library) => {
    const website = library.locations.find((location) => location.website)?.website || null;
    const locationsHtml = library.locations.map((location, index) => {
      const branchName = location.name.replace(`${library.name} — `, '').trim();
      return `
      <div class="participant-location">
        <h4>Location ${index + 1}${branchName ? ` · ${escapeHtml(branchName)}` : ''}</h4>
        ${location.addressLines.length ? `<address>${location.addressLines.map(escapeHtml).join('<br />')}</address>` : ''}
        ${location.directionsUrl ? `<p><a href="${escapeHtml(location.directionsUrl)}" rel="noreferrer">Get directions <span aria-hidden="true">↗</span></a></p>` : ''}
      </div>`;
    }).join('');

    return `<article class="redemption-location participant-library">
      ${library.logo ? `<div class="participant-logo-frame"><img class="participant-logo" src="${escapeHtml(library.logo)}" alt="${escapeHtml(library.name)} logo" width="200" height="80" /></div>` : ''}
      ${website ? `<p class="participant-library-link"><a href="${escapeHtml(website)}" rel="noreferrer">Visit the ${escapeHtml(library.name)} website <span aria-hidden="true">↗</span></a></p>` : ''}
      <h2>${escapeHtml(library.name)}</h2>
      <h3 class="participant-subheading">Locations</h3>
      ${locationsHtml}
    </article>`;
  });

  while (cards.length < 3) {
    cards.push(`<article class="redemption-location participant-library placeholder" aria-hidden="true">
      <div class="participant-logo-frame participant-logo-placeholder"></div>
      <h2>&nbsp;</h2>
      <h3 class="participant-subheading">Locations</h3>
      <div class="participant-location placeholder-location"><p>More locations soon</p></div>
    </article>`);
  }

  return cards.join('');
}
