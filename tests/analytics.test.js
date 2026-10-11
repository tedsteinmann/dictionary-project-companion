import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, sanitizeTelemetry } from '../src/analytics.js';
import { eventProperties, validateAnalyticsConfig } from '../src/analytics-policy.js';
import { cp, mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export const config = {
  enabled: true,
  connectionString: 'InstrumentationKey=00000000-0000-0000-0000-000000000001;IngestionEndpoint=https://centralus-0.in.applicationinsights.azure.com/;LiveEndpoint=https://centralus.livediagnostics.monitor.azure.com/;ApplicationId=00000000-0000-0000-0000-000000000002',
  allowedHosts: ['dictionary.example.org']
};

test('event contract accepts only typed stage/pass properties', () => {
  for (const name of ['quiz_started', 'certificate_earned', 'certificate_viewed', 'certificate_print_requested']) {
    for (const stage of [1, 2, 3]) assert.deepEqual(eventProperties(name, { stage, answer: 'secret', code: 'secret', url: 'secret' }), { stage });
    for (const stage of [0, 4, '1', null]) assert.equal(eventProperties(name, { stage }), null);
  }
  assert.deepEqual(eventProperties('quiz_submitted', { stage: 2, passed: false, score: 6 }), { stage: 2, passed: false });
  assert.equal(eventProperties('quiz_submitted', { stage: 1, passed: 'true' }), null);
  assert.deepEqual(eventProperties('redemption_viewed', { secret: 'secret' }), {});
  assert.equal(eventProperties('page_view', {}), null);
});

test('config fails closed and requires exact custom production hosts', () => {
  assert.deepEqual(validateAnalyticsConfig({ connectionString: 'secret' }), { enabled: false });
  assert.deepEqual(validateAnalyticsConfig(config), config);
  for (const host of ['', '*.example.org', 'localhost', '127.0.0.1', 'foo.localhost', 'preview.azurestaticapps.net', 'https://dictionary.example.org', 'example.org/path', 'example.org-', `${'x'.repeat(64)}.org`]) {
    assert.throws(() => validateAnalyticsConfig({ ...config, allowedHosts: [host] }));
  }
  for (const connectionString of ['', 'InstrumentationKey=bad', config.connectionString.replace('https:', 'http:'), `${config.connectionString};secret=hidden`]) {
    assert.throws(() => validateAnalyticsConfig({ ...config, connectionString }));
  }
});

test('portal-style connection strings support regional and legacy LiveEndpoint domains', () => {
  assert.deepEqual(validateAnalyticsConfig(config), config);
  const legacy = { ...config, connectionString: config.connectionString.replace('centralus.livediagnostics.monitor.azure.com', 'live.applicationinsights.azure.com') };
  assert.deepEqual(validateAnalyticsConfig(legacy), legacy);
  const withoutLive = { ...config, connectionString: config.connectionString.replace(/;LiveEndpoint=[^;]+/, '') };
  assert.deepEqual(validateAnalyticsConfig(withoutLive), withoutLive);
});

test('endpoint rules stay strict and identify the invalid field without echoing its value', () => {
  const ingestion = 'https://centralus-0.in.applicationinsights.azure.com/';
  const live = 'https://centralus.livediagnostics.monitor.azure.com/';
  for (const [key, original] of [['IngestionEndpoint', ingestion], ['LiveEndpoint', live]]) {
    for (const invalid of [
      'not-a-url', original.replace('https:', 'http:'),
      original.replace('https://', 'https://user:DO_NOT_ECHO@'),
      original.replace('.com/', '.com.evil.org/'),
      original.replace('.com/', '.com:444/'),
      `${original}?DO_NOT_ECHO`, `${original}#DO_NOT_ECHO`, `${original}DO_NOT_ECHO`
    ]) {
      assert.throws(() => validateAnalyticsConfig({ ...config, connectionString: config.connectionString.replace(original, invalid) }), (error) => {
        assert.match(error.message, new RegExp(key));
        assert.ok(!error.message.includes('DO_NOT_ECHO'));
        return true;
      });
    }
  }
  assert.throws(() => validateAnalyticsConfig({ ...config, connectionString: config.connectionString.replace(ingestion, live) }), /IngestionEndpoint/);
  assert.throws(() => validateAnalyticsConfig({ ...config, connectionString: config.connectionString.replace(`IngestionEndpoint=${ingestion};`, '') }), /IngestionEndpoint/);
});

test('disabled, malformed and unapproved hosts never load SDK', async () => {
  let loads = 0;
  for (const hostname of ['localhost', 'dictionary.example.org.evil.org', 'preview.azurestaticapps.net']) {
    const analytics = createAnalytics({ hostname: () => hostname, load: () => { loads++; } });
    await analytics.initializeAnalytics(config);
    analytics.track('quiz_started', { stage: 1 });
  }
  const analytics = createAnalytics({ hostname: () => config.allowedHosts[0], load: () => { loads++; } });
  await analytics.initializeAnalytics({ enabled: false });
  await analytics.initializeAnalytics({ enabled: true });
  assert.equal(loads, 0);
});

test('lazy initialization queues bounded sanitized events and tolerates failures', async () => {
  const events = [];
  let initializer;
  let loads = 0;
  class Sdk {
    addTelemetryInitializer(fn) { initializer = fn; }
    loadAppInsights() {}
    trackEvent(event) { events.push(event); }
  }
  const analytics = createAnalytics({ hostname: () => config.allowedHosts[0], load: async () => { loads++; return Sdk; } });
  const ready = analytics.initializeAnalytics(config);
  analytics.track('quiz_started', { stage: 1, answer: 'private' });
  analytics.track('exception');
  await ready;
  await analytics.initializeAnalytics(config);
  assert.equal(loads, 1);
  assert.equal(initializer, sanitizeTelemetry);
  assert.deepEqual(events, [{ name: 'quiz_started', properties: { stage: 1 } }]);
  const broken = createAnalytics({ hostname: () => config.allowedHosts[0], load: async () => { throw Error('blocked'); } });
  await broken.initializeAnalytics(config);
  assert.doesNotThrow(() => broken.track('quiz_started', { stage: 1 }));
});

test('telemetry sanitizer rebuilds envelope without identifiers or arbitrary SDK fields', () => {
  const item = { name: 'Event', time: 'now', iKey: 'resource', baseType: 'EventData',
    baseData: { name: 'quiz_submitted', properties: { stage: 1, passed: true, answer: 'secret' }, measurements: { score: 9 } },
    tags: { 'ai.user.id': 'secret', 'ai.operation.name': '/?name=secret' },
    ext: { user: { id: 'secret' }, trace: { traceID: 'secret' } }, data: { code: 'secret' }, futureSdkField: 'secret' };
  assert.equal(sanitizeTelemetry(item), true);
  assert.deepEqual(item.baseData, { name: 'quiz_submitted', properties: { stage: 1, passed: true } });
  assert.ok(!JSON.stringify(item).includes('secret'));
  assert.equal(sanitizeTelemetry({ baseType: 'PageviewData' }), false);
});

test('build omits disabled SDK/configuration and validates before replacing good artifacts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dictionary-analytics-'));
  try {
    for (const path of ['src', 'scripts', 'index.html', 'favicon.svg', 'node_modules/@microsoft/applicationinsights-web']) {
      await cp(new URL(`../${path}`, import.meta.url), join(dir, path), { recursive: true });
    }
    const build = (env = {}) => execFileSync(process.execPath, ['scripts/build.js'], {
      cwd: dir, env: { ...process.env, ANALYTICS_ENABLED: '', APPLICATIONINSIGHTS_CONNECTION_STRING: 'DO_NOT_INCLUDE', ANALYTICS_ALLOWED_HOSTS: '', ...env }, stdio: 'pipe'
    });
    const output = join(dir, 'dist/src/analytics-config.js');
    build();
    assert.equal(await readFile(output, 'utf8'), 'export const analyticsConfig = {"enabled":false};\n');
    await assert.rejects(access(join(dir, 'dist/src/vendor/ai.min.js')));
    assert.throws(() => build({ ANALYTICS_ENABLED: 'true' }), /Build failed/);
    assert.equal(await readFile(output, 'utf8'), 'export const analyticsConfig = {"enabled":false};\n');
    const env = { ANALYTICS_ENABLED: 'true', APPLICATIONINSIGHTS_CONNECTION_STRING: config.connectionString, ANALYTICS_ALLOWED_HOSTS: config.allowedHosts.join(',') };
    build(env);
    assert.equal(await readFile(output, 'utf8'), `export const analyticsConfig = ${JSON.stringify(config)};\n`);
    await access(join(dir, 'dist/src/vendor/ai.min.js'));
    await access(join(dir, 'dist/src/vendor/LICENSE'));
    await access(join(dir, 'dist/src/vendor/NOTICE'));
    assert.throws(() => build({ ...env, ANALYTICS_ALLOWED_HOSTS: '*.example.org' }), /Build failed/);
    assert.equal(await readFile(output, 'utf8'), `export const analyticsConfig = ${JSON.stringify(config)};\n`);
    build();
    await assert.rejects(access(join(dir, 'dist/src/vendor/ai.min.js')));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
