import { sponsorConfig } from '../src/content/sponsors.js';
import { escapeHtml, MAX_LOGO_BYTES, validateSponsorConfig } from '../src/sponsors.js';

const editors = document.querySelector('#sponsor-editors');
const status = document.querySelector('#setup-status');
let nextId = 0;
let pendingUploads = 0;
const organizerFields = ['name', 'address', 'phone', 'email'];

function setOrganizer(organizer = {}) {
  organizerFields.forEach((key) => {
    document.querySelector(`[name=organizer-${key}]`).value = organizer?.[key] || '';
  });
}

function readOrganizer() {
  const organizer = Object.fromEntries(organizerFields.map((key) => [key, document.querySelector(`[name=organizer-${key}]`).value]));
  return Object.values(organizer).some((value) => value.trim()) ? organizer : null;
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

sponsorConfig.sponsors.forEach(addSponsor);
setOrganizer(sponsorConfig.organizer);
document.querySelector('#add-sponsor').addEventListener('click', () => addSponsor().querySelector('input').focus());
document.querySelector('#import-config').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const config = validateSponsorConfig(JSON.parse(await file.text()));
    editors.replaceChildren();
    config.sponsors.forEach(addSponsor);
    setOrganizer(config.organizer);
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
    const config = validateSponsorConfig({
      organizer: readOrganizer(),
      sponsors: [...editors.children].map((editor) => editor.readSponsor())
    });
    const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sponsors.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Configuration downloaded. Use it with the build command below.';
  } catch (error) {
    status.textContent = error.message;
  }
});
