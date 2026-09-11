export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export const SITE_CONFIG_LIMITS = Object.freeze({
  sponsors: 20,
  redemptionLocations: 50,
  addressLines: 5,
  organizerName: 120,
  contactText: 300,
  telephone: 50,
  email: 254,
  url: 2048,
  sponsorTitle: 120,
  sponsorDescription: 600,
  redemptionInstructions: 1200,
  locationName: 160,
  locationInstructions: 600,
  deadline: 120,
  addressLine: 160
});

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value;
}

function text(value, { label, limit, required = false } = {}) {
  if (value == null || value === '') {
    if (required) throw new Error(`${label} is required and must be at most ${limit} characters.`);
    return null;
  }
  if (typeof value !== 'string' || !value.trim() || value.trim().length > limit) {
    throw new Error(`${label} ${required ? 'is required and ' : ''}must be at most ${limit} characters.`);
  }
  return value.trim();
}

function webUrl(value, label, { required = false } = {}) {
  const normalized = text(value, { label, limit: SITE_CONFIG_LIMITS.url, required });
  if (normalized === null) return null;
  let url;
  try { url = new URL(normalized); } catch { throw new Error(`${label}: enter a full HTTP or HTTPS website URL.`); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${label}: enter a full HTTP or HTTPS website URL without credentials.`);
  }
  return url.href;
}

function addressLines(value, label) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > SITE_CONFIG_LIMITS.addressLines) {
    throw new Error(`${label} must contain no more than ${SITE_CONFIG_LIMITS.addressLines} lines.`);
  }
  return value.map((line, index) => text(line, {
    label: `${label} line ${index + 1}`,
    limit: SITE_CONFIG_LIMITS.addressLine,
    required: true
  }));
}

function validateLogo(value, label) {
  const logo = value || null;
  if (logo === null) return null;
  if (typeof logo !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(logo)) {
    throw new Error(`${label}: choose a PNG, JPEG, or WebP logo.`);
  }
  const base64 = logo.slice(logo.indexOf(',') + 1);
  const size = base64.length * 3 / 4 - (base64.match(/=+$/)?.[0].length || 0);
  if (base64.length % 4 !== 0 || size > MAX_LOGO_BYTES) {
    throw new Error(`${label}: logo must be valid base64 and no larger than 2 MB.`);
  }
  return logo;
}

function validateSite(value) {
  if (value == null) return { organizerName: null, addressLines: [], telephone: null, email: null, website: null };
  const site = object(value, 'Site details');
  const email = text(site.email, { label: 'Site: email', limit: SITE_CONFIG_LIMITS.email });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Site: enter a valid email address.');
  return {
    organizerName: text(site.organizerName, { label: 'Site: organizerName', limit: SITE_CONFIG_LIMITS.organizerName, required: true }),
    addressLines: addressLines(site.addressLines, 'Site: addressLines'),
    telephone: text(site.telephone, { label: 'Site: telephone', limit: SITE_CONFIG_LIMITS.telephone }),
    email,
    website: webUrl(site.website, 'Site: website')
  };
}

function legacySite(config) {
  if (config.site != null || config.organizer == null) return config.site;
  const organizer = object(config.organizer, 'Organizer details');
  const address = text(organizer.address, { label: 'Organizer: address', limit: SITE_CONFIG_LIMITS.contactText });
  return {
    organizerName: organizer.name,
    addressLines: address ? address.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) : [],
    telephone: organizer.phone,
    email: organizer.email
  };
}

function validateSponsors(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('Add at least one sponsor.');
  if (value.length > SITE_CONFIG_LIMITS.sponsors) throw new Error(`Add no more than ${SITE_CONFIG_LIMITS.sponsors} sponsors.`);
  return value.map((rawSponsor, index) => {
    const label = `Sponsor ${index + 1}`;
    const sponsor = object(rawSponsor, label);
    return {
      title: text(sponsor.title, { label: `${label}: title`, limit: SITE_CONFIG_LIMITS.sponsorTitle, required: true }),
      description: text(sponsor.description, { label: `${label}: description`, limit: SITE_CONFIG_LIMITS.sponsorDescription, required: true }),
      url: webUrl(sponsor.url, `${label}: url`, { required: true }),
      logo: validateLogo(sponsor.logo, label)
    };
  });
}

function validateRedemption(value) {
  if (value == null) return { enabled: false, instructions: null, deadline: null, locations: [] };
  const redemption = object(value, 'Redemption');
  if (typeof redemption.enabled !== 'boolean') throw new Error('Redemption: enabled must be true or false.');
  const instructions = text(redemption.instructions, {
    label: 'Redemption: instructions', limit: SITE_CONFIG_LIMITS.redemptionInstructions, required: redemption.enabled
  });
  const rawLocations = redemption.locations ?? [];
  if (!Array.isArray(rawLocations) || rawLocations.length > SITE_CONFIG_LIMITS.redemptionLocations) {
    throw new Error(`Redemption: locations must contain no more than ${SITE_CONFIG_LIMITS.redemptionLocations} locations.`);
  }
  const locations = rawLocations.map((rawLocation, index) => {
    const label = `Redemption location ${index + 1}`;
    const location = object(rawLocation, label);
    return {
      name: text(location.name, { label: `${label}: name`, limit: SITE_CONFIG_LIMITS.locationName, required: true }),
      instructions: text(location.instructions, { label: `${label}: instructions`, limit: SITE_CONFIG_LIMITS.locationInstructions, required: true }),
      addressLines: addressLines(location.addressLines, `${label}: addressLines`),
      website: webUrl(location.website, `${label}: website`),
      telephone: text(location.telephone, { label: `${label}: telephone`, limit: SITE_CONFIG_LIMITS.telephone })
    };
  });
  return {
    enabled: redemption.enabled,
    instructions,
    deadline: text(redemption.deadline, { label: 'Redemption: deadline', limit: SITE_CONFIG_LIMITS.deadline }),
    locations
  };
}

export function validateSiteConfig(config) {
  object(config, 'Site configuration');
  return freeze({
    site: validateSite(legacySite(config)),
    sponsors: validateSponsors(config.sponsors),
    redemption: validateRedemption(config.redemption)
  });
}
