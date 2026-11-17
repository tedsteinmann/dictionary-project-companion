import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, sanitizeTelemetry } from '../src/analytics.js';
import {
  ANALYTICS_START_DATE,
  ANALYTICS_START_DATE_DISPLAY,
  allowedRoutes,
  eventProperties,
  isLocalHost,
  routeProperties,
  validateAnalyticsConfig
} from '../src/analytics-policy.js';
import { cp, mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export const config = {
  enabled: true,
  connectionString: 'InstrumentationKey=00000000-0000-0000-0000-000000000001;IngestionEndpoint=https://centralus-0.in.applicationinsights.azure.com/;LiveEndpoint=https://centralus.livediagnostics.monitor.azure.com/;ApplicationId=00000000-0000-0000-0000-000000000002'
};

test('event contract accepts only typed stage/pass properties and approved SPA routes', () => {
  assert.equal(ANALYTICS_START_DATE, '2026-10-30');
  assert.equal(ANALYTICS_START_DATE_DISPLAY, 'October 30, 2026');
  for (const name of ['quiz_started', 'certificate_earned', 'certificate_viewed', 'certificate_print_requested']) {
    for (const stage of [1, 2, 3]) assert.deepEqual(eventProperties(name, { stage, answer: 'secret', code: 'secret', url: 'secret' }), { stage });
    for (const stage of [0, 4, '1', null]) assert.equal(eventProperties(name, { stage }), null);
  }
  assert.deepEqual(eventProperties('quiz_submitted', { stage: 2, passed: false, score: 6 }), { stage: 2, passed: false });
  assert.equal(eventProperties('quiz_submitted', { stage: 1, passed: 'true' }), null);
  assert.deepEqual(eventProperties('redemption_viewed', { secret: 'secret' }), {});
  assert.equal(eventProperties('page_view', {}), null);

  for (const route of allowedRoutes) {
    assert.deepEqual(routeProperties(route), { name: route, uri: route === 'home' ? '/' : `/#${route}` });
  }
  for (const badRoute of ['', 'unknown', 'home?secret=1', null, 42]) {
    assert.equal(routeProperties(badRoute), null);
  }
});

test('config requires ANALYTICS_ENABLED=true and a valid connection string', () => {
  assert.deepEqual(validateAnalyticsConfig({ connectionString: config.connectionString }), { enabled: false });
  assert.deepEqual(validateAnalyticsConfig({ enabled: false, connectionString: config.connectionString }), { enabled: false });
  assert.deepEqual(validateAnalyticsConfig(config), config);
  for (const connectionString of ['', 'InstrumentationKey=bad', 'IngestionEndpoint=https://centralus-0.in.applicationinsights.azure.com/']) {
    assert.throws(() => validateAnalyticsConfig({ enabled: true, connectionString }));
  }
});

test('disabled, malformed and local hosts never load SDK, while production and Azure hosts initialize', async () => {
  for (const local of ['', 'localhost', '127.0.0.1', '[::1]', 'app.localhost', 'dev.local']) {
    assert.equal(isLocalHost(local), true);
  }
  for (const prod of ['dictionary.example.org', 'witty-water-0a5a5ad10.azurestaticapps.net']) {
    assert.equal(isLocalHost(prod), false);
  }
  let loads = 0;
  for (const hostname of ['localhost', '127.0.0.1', 'foo.localhost']) {
    const analytics = createAnalytics({ hostname: () => hostname, load: () => { loads++; } });
    await analytics.initializeAnalytics(config);
    analytics.track('quiz_started', { stage: 1 });
    analytics.trackPageView('home');
  }
  const analytics = createAnalytics({ hostname: () => 'dictionary.example.org', load: () => { loads++; } });
  await analytics.initializeAnalytics({ enabled: false });
  await analytics.initializeAnalytics({ enabled: true });
  assert.equal(loads, 0);
});

test('lazy initialization queues bounded sanitized events and route pageviews and tolerates failures', async () => {
  const events = [];
  const pageViews = [];
  let initializer;
  let sdkConfig;
  let loads = 0;
  class Sdk {
    constructor(options) { sdkConfig = options.config; }
    addTelemetryInitializer(fn) { initializer = fn; }
    loadAppInsights() {}
    trackEvent(event) { events.push(event); }
    trackPageView(page) { pageViews.push(page); }
  }
  const analytics = createAnalytics({ hostname: () => 'witty-water-0a5a5ad10.azurestaticapps.net', load: async () => { loads++; return Sdk; } });
  const ready = analytics.initializeAnalytics(config);
  analytics.trackPageView('home');
  analytics.trackPageView('privacy');
  analytics.trackPageView('unapproved?secret=1');
  for (let index = 0; index < 60; index++) analytics.track('quiz_started', { stage: 1, answer: `private-${index}` });
  analytics.track('exception');
  await ready;
  await analytics.initializeAnalytics(config);
  assert.equal(loads, 1);
  assert.equal(initializer, sanitizeTelemetry);
  assert.equal(sdkConfig.disableCookiesUsage, true);
  assert.equal(sdkConfig.isStorageUseDisabled, true);
  assert.equal(sdkConfig.enableSessionStorageBuffer, false);
  assert.equal(sdkConfig.disableAjaxTracking, true);
  assert.equal(sdkConfig.disableFetchTracking, true);
  assert.equal(sdkConfig.disableExceptionTracking, true);
  assert.equal(sdkConfig.enableAutoRouteTracking, false);
  assert.deepEqual(pageViews, [
    { name: 'home', uri: '/', properties: { duration: 0 } },
    { name: 'privacy', uri: '/#privacy', properties: { duration: 0 } }
  ]);
  assert.deepEqual(events, Array.from({ length: 48 }, () => ({ name: 'quiz_started', properties: { stage: 1 } })));
  const broken = createAnalytics({ hostname: () => 'dictionary.example.org', load: async () => { throw Error('blocked'); } });
  await broken.initializeAnalytics(config);
  assert.doesNotThrow(() => broken.track('quiz_started', { stage: 1 }));
  assert.doesNotThrow(() => broken.trackPageView('home'));
});

test('telemetry sanitizer rebuilds EventData and PageviewData without identifiers or query strings', () => {
  const item = { name: 'Event', time: 'now', iKey: 'resource', baseType: 'EventData',
    baseData: { name: 'quiz_submitted', properties: { stage: 1, passed: true, answer: 'secret' }, measurements: { score: 9 } },
    tags: { 'ai.user.id': 'secret', 'ai.operation.name': '/?name=secret' },
    ext: { user: { id: 'secret' }, trace: { traceID: 'secret' } }, data: { code: 'secret' }, futureSdkField: 'secret' };
  assert.equal(sanitizeTelemetry(item), true);
  assert.deepEqual(item.baseData, { name: 'quiz_submitted', properties: { stage: 1, passed: true } });
  assert.ok(!JSON.stringify(item).includes('secret'));

  const pageItem = { name: 'Pageview', time: 'now', iKey: 'resource', baseType: 'PageviewData',
    baseData: { name: 'privacy', uri: 'https://dictionary.example.org/?child=secret#privacy', properties: { secret: 'secret' } },
    tags: { 'ai.user.id': 'secret', 'ai.session.id': 'secret' },
    ext: { user: { id: 'secret' } }, data: { secret: 'secret' } };
  assert.equal(sanitizeTelemetry(pageItem), true);
  assert.deepEqual(pageItem.baseData, { name: 'privacy', uri: '/#privacy' });
  assert.ok(!JSON.stringify(pageItem).includes('secret'));

  assert.equal(sanitizeTelemetry({ baseType: 'PageviewData', baseData: { name: 'https://dictionary.example.org/?secret=1' } }), false);
  assert.equal(sanitizeTelemetry({ baseType: 'ExceptionData' }), false);
});

test('build omits disabled SDK/configuration and validates before replacing good artifacts', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dictionary-analytics-'));
  try {
    for (const path of ['src', 'scripts', 'index.html', 'favicon.svg', 'node_modules/@microsoft/applicationinsights-web']) {
      await cp(new URL(`../${path}`, import.meta.url), join(dir, path), { recursive: true });
    }
    const build = (env = {}) => execFileSync(process.execPath, ['scripts/build.js'], {
      cwd: dir, env: { ...process.env, ANALYTICS_ENABLED: '', APPLICATIONINSIGHTS_CONNECTION_STRING: 'DO_NOT_INCLUDE', ...env }, stdio: 'pipe'
    });
    const output = join(dir, 'dist/src/analytics-config.js');
    build();
    assert.equal(await readFile(output, 'utf8'), 'export const analyticsConfig = {"enabled":false};\n');
    await assert.rejects(access(join(dir, 'dist/src/vendor/ai.min.js')));
    assert.throws(() => build({ ANALYTICS_ENABLED: 'true', APPLICATIONINSIGHTS_CONNECTION_STRING: '' }), /Build failed/);
    assert.equal(await readFile(output, 'utf8'), 'export const analyticsConfig = {"enabled":false};\n');
    const env = { ANALYTICS_ENABLED: 'true', APPLICATIONINSIGHTS_CONNECTION_STRING: config.connectionString };
    build(env);
    assert.equal(await readFile(output, 'utf8'), `export const analyticsConfig = ${JSON.stringify(config)};\n`);
    await access(join(dir, 'dist/src/vendor/ai.min.js'));
    await access(join(dir, 'dist/src/vendor/LICENSE'));
    await access(join(dir, 'dist/src/vendor/NOTICE'));
    assert.throws(() => build({ ...env, APPLICATIONINSIGHTS_CONNECTION_STRING: 'invalid' }), /Build failed/);
    assert.equal(await readFile(output, 'utf8'), `export const analyticsConfig = ${JSON.stringify(config)};\n`);
    build();
    await assert.rejects(access(join(dir, 'dist/src/vendor/ai.min.js')));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
