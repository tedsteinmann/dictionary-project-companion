import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { renderSponsorNames, renderSponsors } from '../src/sponsors.js';
import { validateSiteConfig } from '../src/site-config.js';
import { siteConfig } from '../src/content/site-config.js';
import { renderContactContent } from '../src/components/contact-details.js';

const sponsor = { title: 'Local club', description: 'Helping readers.', url: 'https://example.org', logo: null };
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=';

describe('sponsor configuration and rendering', () => {
  it('accepts one or many sponsors and preserves their order', () => {
    assert.equal(validateSiteConfig(siteConfig).sponsors.length, 1);
    const sponsors = [sponsor, { ...sponsor, title: 'Second club' }, { ...sponsor, title: 'Third club' }];
    const html = renderSponsors({ sponsors });
    assert.equal((html.match(/<article /g) || []).length, 3);
    assert.ok(html.indexOf('Local club') < html.indexOf('Second club'));
    assert.ok(html.indexOf('Second club') < html.indexOf('Third club'));
    assert.match(html, /Learn more/);
  });

  it('normalizes optional static site contact details', () => {
    const config = validateSiteConfig({ sponsors: [sponsor], site: {
      organizerName: ' Project coordinator ', addressLines: [' 123 Main St '], telephone: '(555) 555-0100',
      email: 'hello@example.org', website: 'https://example.org/contact'
    } });
    assert.equal(config.site.organizerName, 'Project coordinator');
    assert.deepEqual(config.site.addressLines, ['123 Main St']);
    assert.equal(config.site.email, 'hello@example.org');
    assert.equal(config.site.website, 'https://example.org/contact');
    assert.equal(validateSiteConfig({ sponsors: [sponsor] }).site.organizerName, null);
    assert.throws(() => validateSiteConfig({ sponsors: [sponsor], site: {} }), /organizerName is required/);
    assert.throws(() => validateSiteConfig({ sponsors: [sponsor], site: { organizerName: 'x'.repeat(121) } }), /120/);
    assert.throws(() => validateSiteConfig({ sponsors: [sponsor], site: { email: 'not-an-email' } }), /valid email/);
    assert.throws(() => validateSiteConfig({ sponsors: [sponsor], site: { organizerName: 'Organizer', website: 'file:///secret' } }), /HTTP or HTTPS/);
    assert.throws(() => validateSiteConfig({ sponsors: [sponsor], site: { organizerName: 'Organizer', website: 'https://user:pass@example.org' } }), /without credentials/);
    assert.throws(() => validateSiteConfig({ sponsors: [sponsor], site: { organizerName: 'Organizer', telephone: 'javascript:alert(1)' } }), /valid telephone/);
  });

  it('requires a public organizer contact for location-free redemption', () => {
    const redemption = { enabled: true, instructions: 'Ask an adult to contact us.', locations: [] };
    assert.throws(() => validateSiteConfig({ sponsors: [sponsor], redemption }), /public organizer/);
    for (const contact of [
      { telephone: '(555) 555-0100' },
      { email: 'dictionary@example.org' },
      { website: 'https://example.org/project' }
    ]) {
      assert.equal(validateSiteConfig({ sponsors: [sponsor], site: { organizerName: 'Organizer', ...contact }, redemption }).redemption.enabled, true);
    }
  });

  it('renders safe contact methods, child guidance, and no personal-information form controls', () => {
    const config = validateSiteConfig({
      site: {
        organizerName: '<img src=x onerror=alert(1)>',
        addressLines: ['<script>bad()</script>'],
        telephone: '+1 (555) 555-0100',
        email: 'dictionary@example.org',
        website: 'https://example.org/project?value=%22bad'
      },
      sponsors: [{ ...sponsor, title: '<b>Readers</b>' }]
    });
    const html = renderContactContent(config);
    assert.match(html, /parent, guardian, teacher, or librarian/);
    assert.match(html, /href="tel:\+15555550100"/);
    assert.match(html, /href="mailto:dictionary@example\.org"/);
    assert.match(html, /href="https:\/\/example\.org\/project\?value=%22bad"/);
    assert.doesNotMatch(html, /<img|<script>|<b>Readers/);
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.doesNotMatch(html, /<(form|input|textarea|select|button)\b/i);
  });

  it('omits absent methods and rejects unsafe contact links', () => {
    const html = renderContactContent(validateSiteConfig({
      site: { organizerName: 'Project organizer' }, sponsors: [sponsor]
    }));
    assert.match(html, /Project organizer/);
    assert.doesNotMatch(html, /mailto:|tel:|Visit organizer website/);
    for (const site of [
      { organizerName: 'Organizer', email: 'bad\"@example.org' },
      { organizerName: 'Organizer', telephone: '+1;ext=alert' },
      { organizerName: 'Organizer', website: 'javascript:alert(1)' }
    ]) assert.throws(() => validateSiteConfig({ site, sponsors: [sponsor] }));
  });

  it('supplies safe defaults for old sponsor-only configuration files', () => {
    const config = validateSiteConfig({ sponsors: [sponsor] });
    assert.deepEqual(config.site, { organizerName: null, addressLines: [], telephone: null, email: null, website: null });
    assert.deepEqual(config.redemption, { enabled: false, instructions: null, deadline: null, locations: [] });
    assert.ok(Object.isFrozen(config));
    assert.ok(Object.isFrozen(config.sponsors));
    assert.ok(Object.isFrozen(config.redemption.locations));
  });

  it('accepts disabled redemption and zero, one, or multiple locations', () => {
    assert.equal(validateSiteConfig({ sponsors: [sponsor], redemption: { enabled: false } }).redemption.enabled, false);
    const library = {
      name: ' Main Library ', instructions: ' Show a printed certificate. ', addressLines: [' 10 First Ave '],
      website: 'https://library.example/claim', telephone: '(555) 555-0110'
    };
    const one = validateSiteConfig({ sponsors: [sponsor], redemption: {
      enabled: true, instructions: ' Visit with an adult. ', deadline: ' May 31 ', locations: [library]
    } }).redemption;
    assert.equal(one.instructions, 'Visit with an adult.');
    assert.equal(one.locations[0].name, 'Main Library');
    assert.deepEqual(one.locations[0].addressLines, ['10 First Ave']);
    const multiple = validateSiteConfig({ sponsors: [sponsor], redemption: {
      enabled: true, instructions: 'Bring the certificate.', locations: [library, { name: 'West Library', instructions: 'Ask at the desk.' }]
    } });
    assert.equal(multiple.redemption.locations.length, 2);
    assert.deepEqual(multiple.redemption.locations[1].addressLines, []);
    assert.equal(multiple.redemption.locations[1].website, null);
  });

  it('rejects malformed, unsafe, or unreasonably large redemption values', () => {
    const base = { sponsors: [sponsor], redemption: { enabled: true, instructions: 'Bring the certificate.', locations: [] } };
    assert.throws(() => validateSiteConfig({ ...base, redemption: { enabled: true } }), /instructions is required/);
    assert.throws(() => validateSiteConfig({ ...base, redemption: { ...base.redemption, instructions: 'x'.repeat(1201) } }), /1200/);
    assert.throws(() => validateSiteConfig({ ...base, redemption: { ...base.redemption, locations: [{ name: '', instructions: 'Ask.' }] } }), /name is required/);
    assert.throws(() => validateSiteConfig({ ...base, redemption: { ...base.redemption, locations: [{ name: 'Library', instructions: 'x'.repeat(601) }] } }), /600/);
    for (const website of ['javascript:alert(1)', 'data:text/html,bad', 'https://user:pass@example.org']) {
      assert.throws(() => validateSiteConfig({ ...base, redemption: { ...base.redemption, locations: [{ name: 'Library', instructions: 'Ask.', website }] } }));
    }
    assert.throws(() => validateSiteConfig({ ...base, redemption: { ...base.redemption, locations: Array.from({ length: 51 }, () => ({ name: 'Library', instructions: 'Ask.' })) } }), /no more than 50/);
    assert.throws(() => validateSiteConfig({ ...base, redemption: { ...base.redemption, locations: [{ name: 'Library', instructions: 'Ask.', addressLines: Array(6).fill('line') }] } }), /no more than 5/);
  });

  it('escapes sponsor content and link attributes', () => {
    const html = renderSponsors({ sponsors: [{ ...sponsor, title: '<img src=x onerror=alert(1)>', description: '<script>alert(1)</script>', url: 'https://example.org/?x="onclick="bad' }] });
    assert.doesNotMatch(html, /<script>|<img src=x/);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /rel="noreferrer"/);
  });

  it('rejects missing details, executable URLs, credentials, and unsupported or oversized logos', () => {
    for (const config of [null, {}, { sponsors: [] }, { sponsors: [null] }]) {
      assert.throws(() => validateSiteConfig(config));
    }
    for (const patch of [
      { title: ' ' }, { description: '' }, { url: 'javascript:alert(1)' },
      { url: '/relative' }, { url: 'https://user:secret@example.org' },
      { logo: 'data:image/svg+xml;base64,AAAA' }, { logo: 'https://example.org/logo.png' },
      { logo: 'data:image/png;base64,A' }, { logo: `data:image/png;base64,${'A'.repeat(2800000)}` }
    ]) assert.throws(() => validateSiteConfig({ sponsors: [{ ...sponsor, ...patch }] }));
  });

  it('renders embedded logos with contained dimensions and adjacent sponsor name', () => {
    const html = renderSponsors({ sponsors: [{ ...sponsor, logo: `data:image/png;base64,${png}` }] });
    assert.match(html, /class="sponsor-logo"/);
    assert.match(html, /alt="" width="160" height="80"/);
    assert.match(html, /<h3>Local club<\/h3>/);
  });

  it('renders certificate sponsor names and logos without descriptions or links', () => {
    const html = renderSponsorNames({ sponsors: [{ ...sponsor, logo: `data:image/png;base64,${png}` }] });
    assert.match(html, /class="certificate-sponsors"/);
    assert.match(html, /class="sponsor-logo"/);
    assert.match(html, />Local club</);
    assert.doesNotMatch(html, /Helping readers|<a /);
  });
});

describe('static sponsor builds', () => {
  it('builds defaults, embeds relative logos, excludes setup, and preserves the build on invalid input', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'dictionary-sponsors-'));
    try {
      for (const path of ['src', 'scripts', 'tools', 'index.html', 'package.json']) {
        await cp(new URL(`../${path}`, import.meta.url), join(dir, path), { recursive: true });
      }
      const build = (...args) => execFileSync(process.execPath, [join(dir, 'scripts/build.js'), ...args], { cwd: dir, stdio: 'pipe' });
      build();
      assert.match(await readFile(join(dir, 'dist/src/content/site-config.js'), 'utf8'), /Rotary/);
      await writeFile(join(dir, 'logo.png'), Buffer.from(png, 'base64'));
      await writeFile(join(dir, 'custom.json'), JSON.stringify({
        site: { organizerName: 'Library partners', website: 'https://project.example' },
        sponsors: [{ ...sponsor, logo: './logo.png' }, { ...sponsor, title: 'Lions' }, { ...sponsor, title: 'Elks' }],
        redemption: {
          enabled: true,
          instructions: 'Bring the certificate with an adult.',
          deadline: 'May 31, 2027',
          locations: [
            { name: 'Main Library', instructions: 'Ask at the desk.', addressLines: ['10 First Ave'], website: 'https://library.example', telephone: '(555) 555-0100' },
            { name: 'West Library', instructions: 'Ask a librarian.' }
          ]
        }
      }));
      build('--config', 'custom.json');
      const output = await readFile(join(dir, 'dist/src/content/site-config.js'), 'utf8');
      assert.match(output, /data:image\/png;base64,/);
      assert.match(output, /Lions/);
      assert.match(output, /Elks/);
      assert.match(output, /Library partners/);
      assert.match(output, /Main Library/);
      assert.match(output, /West Library/);
      await assert.rejects(access(join(dir, 'dist/tools')));
      await writeFile(join(dir, 'sponsors.json'), JSON.stringify({ sponsors: [{ ...sponsor, title: 'Automatically selected', logo: './logo.png' }] }));
      build();
      const automatic = await readFile(join(dir, 'dist/src/content/site-config.js'), 'utf8');
      assert.match(automatic, /Automatically selected/);
      assert.match(automatic, /data:image\/png;base64,/);
      build('--config', 'custom.json');
      assert.equal(await readFile(join(dir, 'dist/src/content/site-config.js'), 'utf8'), output);
      await writeFile(join(dir, 'sponsors.json'), '{"sponsors":[]}');
      assert.throws(() => build(), /Add at least one sponsor/);
      await writeFile(join(dir, 'bad.json'), '{"sponsors":[]}');
      assert.throws(() => build('--config', 'bad.json'), /Add at least one sponsor/);
      assert.equal(await readFile(join(dir, 'dist/src/content/site-config.js'), 'utf8'), output);
      assert.throws(() => build('--unknown'), /Usage:/);

      // Use an OS-assigned port and always stop the preview, including on failure.
      const server = spawn('python3', [join(dir, 'scripts/dev.py'), '--port', '0'], { stdio: ['ignore', 'pipe', 'pipe'] });
      try {
        await once(server, 'spawn');
        const [startup] = await once(server.stdout, 'data', { signal: AbortSignal.timeout(5000) });
        const port = startup.toString().match(/localhost:(\d+)/)?.[1];
        assert.ok(port, 'Dev server reports its preview URL');
        const base = `http://localhost:${port}`;
        const page = await fetch(base);
        assert.match(await page.text(), /Dictionary Challenge/);
        const response = await fetch(`${base}/src/content/site-config.js`);
        assert.equal(await response.text(), output, 'Dev serves configured build, not source defaults');
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.match(await (await fetch(`${base}/tools/sponsors.html`)).text(), /Project setup/);
        assert.match(await (await fetch(`${base}/tools/sponsors.js`)).text(), /import .*siteConfig/);
      } finally {
        if (server.exitCode === null && server.pid) {
          const closed = once(server, 'close');
          server.kill();
          await closed;
        }
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
