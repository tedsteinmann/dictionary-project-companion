import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { validateSponsorConfig, renderSponsorNames, renderSponsors } from '../src/sponsors.js';
import { sponsorConfig } from '../src/content/sponsors.js';

const sponsor = { title: 'Local club', description: 'Helping readers.', url: 'https://example.org', logo: null };
const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=';

describe('sponsor configuration and rendering', () => {
  it('accepts one or many sponsors and preserves their order', () => {
    assert.equal(validateSponsorConfig(sponsorConfig).sponsors.length, 1);
    const sponsors = [sponsor, { ...sponsor, title: 'Second club' }, { ...sponsor, title: 'Third club' }];
    const html = renderSponsors({ sponsors });
    assert.equal((html.match(/<article /g) || []).length, 3);
    assert.ok(html.indexOf('Local club') < html.indexOf('Second club'));
    assert.ok(html.indexOf('Second club') < html.indexOf('Third club'));
    assert.match(html, /Learn more/);
  });

  it('normalizes optional static organizer contact details', () => {
    const config = validateSponsorConfig({ sponsors: [sponsor], organizer: {
      name: ' Project coordinator ', address: '123 Main St', phone: '(555) 555-0100', email: 'hello@example.org'
    } });
    assert.equal(config.organizer.name, 'Project coordinator');
    assert.equal(config.organizer.email, 'hello@example.org');
    assert.equal(validateSponsorConfig({ sponsors: [sponsor] }).organizer, null);
    assert.throws(() => validateSponsorConfig({ sponsors: [sponsor], organizer: {} }), /at least one/);
    assert.throws(() => validateSponsorConfig({ sponsors: [sponsor], organizer: { email: 'not-an-email' } }), /valid email/);
  });

  it('escapes sponsor content and link attributes', () => {
    const html = renderSponsors({ sponsors: [{ ...sponsor, title: '<img src=x onerror=alert(1)>', description: '<script>alert(1)</script>', url: 'https://example.org/?x="onclick="bad' }] });
    assert.doesNotMatch(html, /<script>|<img src=x/);
    assert.match(html, /&lt;script&gt;/);
    assert.match(html, /rel="noreferrer"/);
  });

  it('rejects missing details, executable URLs, credentials, and unsupported or oversized logos', () => {
    for (const config of [null, {}, { sponsors: [] }, { sponsors: [null] }]) {
      assert.throws(() => validateSponsorConfig(config));
    }
    for (const patch of [
      { title: ' ' }, { description: '' }, { url: 'javascript:alert(1)' },
      { url: '/relative' }, { url: 'https://user:secret@example.org' },
      { logo: 'data:image/svg+xml;base64,AAAA' }, { logo: 'https://example.org/logo.png' },
      { logo: 'data:image/png;base64,A' }, { logo: `data:image/png;base64,${'A'.repeat(2800000)}` }
    ]) assert.throws(() => validateSponsorConfig({ sponsors: [{ ...sponsor, ...patch }] }));
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
      assert.match(await readFile(join(dir, 'dist/src/content/sponsors.js'), 'utf8'), /Rotary/);
      await writeFile(join(dir, 'logo.png'), Buffer.from(png, 'base64'));
      await writeFile(join(dir, 'custom.json'), JSON.stringify({ sponsors: [
        { ...sponsor, logo: './logo.png' }, { ...sponsor, title: 'Lions' }, { ...sponsor, title: 'Elks' }
      ] }));
      build('--config', 'custom.json');
      const output = await readFile(join(dir, 'dist/src/content/sponsors.js'), 'utf8');
      assert.match(output, /data:image\/png;base64,/);
      assert.match(output, /Lions/);
      assert.match(output, /Elks/);
      await assert.rejects(access(join(dir, 'dist/tools')));
      await writeFile(join(dir, 'sponsors.json'), JSON.stringify({ sponsors: [{ ...sponsor, title: 'Automatically selected', logo: './logo.png' }] }));
      build();
      const automatic = await readFile(join(dir, 'dist/src/content/sponsors.js'), 'utf8');
      assert.match(automatic, /Automatically selected/);
      assert.match(automatic, /data:image\/png;base64,/);
      build('--config', 'custom.json');
      assert.equal(await readFile(join(dir, 'dist/src/content/sponsors.js'), 'utf8'), output);
      await writeFile(join(dir, 'sponsors.json'), '{"sponsors":[]}');
      assert.throws(() => build(), /Add at least one sponsor/);
      await writeFile(join(dir, 'bad.json'), '{"sponsors":[]}');
      assert.throws(() => build('--config', 'bad.json'), /Add at least one sponsor/);
      assert.equal(await readFile(join(dir, 'dist/src/content/sponsors.js'), 'utf8'), output);
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
        const response = await fetch(`${base}/src/content/sponsors.js`);
        assert.equal(await response.text(), output, 'Dev serves configured build, not source defaults');
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.match(await (await fetch(`${base}/tools/sponsors.html`)).text(), /Sponsor setup/);
        assert.match(await (await fetch(`${base}/tools/sponsors.js`)).text(), /import .*sponsorConfig/);
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
