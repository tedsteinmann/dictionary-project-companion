import { siteConfig } from '../src/content/site-config.js';
import { escapeHtml } from '../src/sponsors.js';
import { MAX_LOGO_BYTES, validateSiteConfig } from '../src/site-config.js';

const editors = document.querySelector('#sponsor-editors');
const status = document.querySelector('#setup-status');
const locationEditors = document.querySelector('#location-editors');
let nextId = 0;
let pendingUploads = 0;

function setSite(site = {}) {
  document.querySelector('[name=organizer-name]').value = site.organizerName || '';
  document.querySelector('[name=organizer-address]').value = (site.addressLines || []).join('\n');
  document.querySelector('[name=organizer-phone]').value = site.telephone || '';
  document.querySelector('[name=organizer-email]').value = site.email || '';
  document.querySelector('[name=organizer-website]').value = site.website || '';
}

function readSite() {
  return {
    organizerName: document.querySelector('[name=organizer-name]').value,
    addressLines: document.querySelector('[name=organizer-address]').value.split(/\r?\n/).filter((line) => line.trim()),
    telephone: document.querySelector('[name=organizer-phone]').value,
    email: document.querySelector('[name=organizer-email]').value,
    website: document.querySelector('[name=organizer-website]').value
  };
}

function addLocation(location = { name: '', instructions: '', addressLines: [], website: '', telephone: '' }) {
  const id = ++nextId;
  const fieldset = document.createElement('fieldset');
  fieldset.innerHTML = `<legend>Redemption location</legend>
    <label for="location-name-${id}">Display name<input id="location-name-${id}" name="name" required maxlength="160" value="${escapeHtml(location.name)}" /></label>
    <label for="location-instructions-${id}">Instructions<textarea id="location-instructions-${id}" name="instructions" required maxlength="600">${escapeHtml(location.instructions)}</textarea></label>
    <label for="location-address-${id}">Address (optional, one line per row)<textarea id="location-address-${id}" name="address" maxlength="804">${escapeHtml((location.addressLines || []).join('\n'))}</textarea></label>
    <label for="location-website-${id}">Website (optional)<input id="location-website-${id}" name="website" type="url" maxlength="2048" value="${escapeHtml(location.website || '')}" /></label>
    <label for="location-phone-${id}">Telephone (optional)<input id="location-phone-${id}" name="telephone" type="tel" maxlength="50" value="${escapeHtml(location.telephone || '')}" /></label>
    <button class="text-button" type="button" data-remove>Remove location</button>`;
  fieldset.readLocation = () => ({
    name: fieldset.querySelector('[name=name]').value,
    instructions: fieldset.querySelector('[name=instructions]').value,
    addressLines: fieldset.querySelector('[name=address]').value.split(/\r?\n/).filter((line) => line.trim()),
    website: fieldset.querySelector('[name=website]').value,
    telephone: fieldset.querySelector('[name=telephone]').value
  });
  fieldset.querySelector('[data-remove]').addEventListener('click', () => {
    fieldset.remove();
    document.querySelector('#add-location').focus();
  });
  locationEditors.append(fieldset);
  return fieldset;
}

function setRedemption(redemption = {}) {
  document.querySelector('[name=redemption-enabled]').checked = redemption.enabled || false;
  document.querySelector('[name=redemption-instructions]').value = redemption.instructions || '';
  document.querySelector('[name=redemption-deadline]').value = redemption.deadline || '';
  locationEditors.replaceChildren();
  (redemption.locations || []).forEach(addLocation);
}

function addSponsor(sponsor = { title: '', description: '', url: '', logo: null }) {
  const id = ++nextId;
  const fieldset = document.createElement('fieldset');
  fieldset.innerHTML = `<legend>Sponsor</legend>
    <label for="title-${id}">Title<input id="title-${id}" name="title" required maxlength="120" value="${escapeHtml(sponsor.title)}" /></label>
    <label for="description-${id}">Description<textarea id="description-${id}" name="description" required maxlength="600">${escapeHtml(sponsor.description)}</textarea></label>
    <label for="url-${id}">Learn-more website<input id="url-${id}" name="url" type="url" required maxlength="2048" placeholder="https://example.org" value="${escapeHtml(sponsor.url)}" /></label>
    <label for="logo-${id}">Logo (optional)<input id="logo-${id}" name="logo" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="logo-help-${id}" /></label>
    <p id="logo-help-${id}" class="note">PNG, JPEG, or WebP, up to 2 MB. Use a logo you have permission to publish.</p>
    <img class="logo-preview" alt="Selected logo preview" hidden />
    <div class="setup-actions"><button class="text-button" type="button" data-remove-logo>Remove logo</button><button class="text-button" type="button" data-remove>Remove sponsor</button></div>`;
  let logo = sponsor.logo;
  const preview = fieldset.querySelector('img');
  const removeLogo = fieldset.querySelector('[data-remove-logo]');
  const updatePreview = () => {
    preview.hidden = !logo;
    removeLogo.hidden = !logo;
    if (logo) preview.src = logo;
    else preview.removeAttribute('src');
  };
  updatePreview();
  fieldset.readSponsor = () => ({
    title: fieldset.querySelector('[name=title]').value,
    description: fieldset.querySelector('[name=description]').value,
    url: fieldset.querySelector('[name=url]').value,
    logo
  });
  let uploadVersion = 0;
  fieldset.querySelector('[name=logo]').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const version = ++uploadVersion;
    pendingUploads++;
    status.textContent = 'Reading logo…';
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_LOGO_BYTES) {
        throw new Error('Choose a PNG, JPEG, or WebP logo no larger than 2 MB.');
      }
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read this logo. Please choose it again.'));
        reader.readAsDataURL(file);
      });
      const probe = new Image();
      probe.src = data;
      await probe.decode();
      if (version !== uploadVersion || !fieldset.isConnected) return;
      logo = data;
      updatePreview();
      status.textContent = 'Logo ready. Download your configuration when you have finished.';
    } catch (error) {
      status.textContent = error.message || 'Could not open this image.';
      event.target.value = '';
    } finally {
      pendingUploads--;
    }
  });
  removeLogo.addEventListener('click', () => {
    uploadVersion++;
    logo = null;
    fieldset.querySelector('[name=logo]').value = '';
    updatePreview();
    fieldset.querySelector('[name=logo]').focus();
  });
  fieldset.querySelector('[data-remove]').addEventListener('click', () => {
    fieldset.remove();
    document.querySelector('#add-sponsor').focus();
  });
  editors.append(fieldset);
  return fieldset;
}

siteConfig.sponsors.forEach(addSponsor);
setSite(siteConfig.site);
setRedemption(siteConfig.redemption);
document.querySelector('#add-sponsor').addEventListener('click', () => addSponsor().querySelector('input').focus());
document.querySelector('#add-location').addEventListener('click', () => addLocation().querySelector('input').focus());
document.querySelector('#import-config').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const config = validateSiteConfig(JSON.parse(await file.text()));
    editors.replaceChildren();
    config.sponsors.forEach(addSponsor);
    setSite(config.site);
    setRedemption(config.redemption);
    status.textContent = 'Configuration loaded.';
  } catch (error) {
    status.textContent = `Could not load configuration: ${error.message}`;
  }
  event.target.value = '';
});
document.querySelector('#sponsor-form').addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    if (pendingUploads) throw new Error('Please wait for the logo to finish loading.');
    const config = validateSiteConfig({
      site: readSite(),
      sponsors: [...editors.children].map((editor) => editor.readSponsor()),
      redemption: {
        enabled: document.querySelector('[name=redemption-enabled]').checked,
        instructions: document.querySelector('[name=redemption-instructions]').value,
        deadline: document.querySelector('[name=redemption-deadline]').value,
        locations: [...locationEditors.children].map((editor) => editor.readLocation())
      }
    });
    const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site-config.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Configuration downloaded. Use it with the build command below.';
  } catch (error) {
    status.textContent = error.message;
  }
});
