import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const origin = 'https://dictionary.example.org';
const connectionString = 'InstrumentationKey=00000000-0000-0000-0000-000000000001;IngestionEndpoint=https://centralus-0.in.applicationinsights.azure.com/';

export default async function checkAnalyticsBrowser(browser, root) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const outbound = [];
  const unexpected = [];
  const sdk = await readFile(resolve(root, 'node_modules/@microsoft/applicationinsights-web/browser/es5/ai.3.gbl.min.js'), 'utf8');
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname.endsWith('.applicationinsights.azure.com')) {
      outbound.push({ body: request.postData(), headers: request.headers() });
      return route.fulfill({ status: 200, body: '{"itemsReceived":1,"itemsAccepted":1,"errors":[]}', headers: { 'Access-Control-Allow-Origin': origin } });
    }
    if (url.origin !== origin) {
      unexpected.push(url.href);
      return route.abort();
    }
    if (url.pathname === '/src/analytics-config.js') return route.fulfill({ contentType: 'text/javascript', body:
      `export const analyticsConfig = ${JSON.stringify({ enabled: true, connectionString, allowedHosts: ['dictionary.example.org'] })};` });
    if (url.pathname === '/src/vendor/ai.min.js') return route.fulfill({ contentType: 'text/javascript', body: sdk + `
      const OriginalSdk = Microsoft.ApplicationInsights.ApplicationInsights;
      Microsoft.ApplicationInsights.ApplicationInsights = class extends OriginalSdk {
        constructor(options) { super(options); window.__analyticsSdk = this; }
      };` });
    const file = resolve(root, 'dist', url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
    const contentType = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' }[extname(file)];
    return route.fulfill({ body: await readFile(file), contentType });
  });
  try {
    await page.goto(`${origin}/?private=DO_NOT_TRANSMIT#levels`);
    await page.waitForFunction(() => Boolean(window.__analyticsSdk));
    const bank = await page.evaluate(async () => (await import('/src/content/questions.js')).questions);
    const click = (name) => page.getByRole('button', { name, exact: true }).click();
    const flush = async () => {
      const delivered = page.waitForResponse((response) => response.url().includes('.applicationinsights.azure.com/'));
      await page.evaluate(() => window.__analyticsSdk.flush());
      await delivered;
    };
    const finish = async (score, deliver = true) => {
      const ids = await page.evaluate(() => JSON.parse(sessionStorage.getItem('dictionary-challenge-v2')).attempt.questionIds);
      for (let index = 0; index < 10; index++) {
        const q = bank.find((item) => item.id === ids[index]);
        if (q.choices) await page.getByRole('radio', { name: index < score ? q.answer : q.choices.find((value) => value !== q.answer), exact: true }).check();
        else await page.getByLabel('Type your answer', { exact: true }).fill(index < score ? q.answer : 'DO_NOT_TRANSMIT');
        await click(index === 9 ? 'Submit answer and review →' : 'Submit answer →');
      }
      await click('Submit quiz');
      if (deliver === true) await flush();
      else if (deliver === false) await page.evaluate(() => window.__analyticsSdk.flush());
      await page.goBack();
      await page.reload();
      await page.getByRole('heading', { name: `You cracked ${score} out of 10!`, exact: true }).waitFor();
    };
    await click('Start Find It');
    await click('← Stages');
    await click('Continue your quiz →');
    await finish(6);
    await click('Try Find It again');
    await finish(7);
    await click('View and print certificate');
    await page.evaluate(() => { window.print = () => {}; });
    await click('Print or save certificate');
    await click('Print or save certificate');
    await click('Choose a stage');
    await click('View Find It certificate');
    await click('Choose a stage');
    await click('Start Figure It Out');
    await finish(8);
    await click('Start Discover More →');
    await finish(10);
    await page.goto(`${origin}/#home`);
    await page.getByRole('link', { name: 'Certificate redemption', exact: true }).click();
    // Flush before navigation/reload so this test measures all SDK instances.
    await flush();
    const events = outbound.flatMap(({ body }) => {
      const value = JSON.parse(body);
      return Array.isArray(value) ? value : [value];
    });
    const counts = (name) => events.filter((item) => item.data.baseData.name === name).length;
    assert.equal(counts('quiz_started'), 4);
    assert.equal(counts('quiz_submitted'), 4);
    assert.equal(counts('certificate_earned'), 3);
    assert.equal(counts('certificate_viewed'), 2);
    assert.equal(counts('certificate_print_requested'), 2);
    assert.equal(counts('redemption_viewed'), 1);
    assert.deepEqual(events.filter((item) => item.data.baseData.name === 'quiz_submitted').map((item) => item.data.baseData.properties),
      [{ stage: '1', passed: 'false' }, { stage: '1', passed: 'true' }, { stage: '2', passed: 'true' }, { stage: '3', passed: 'true' }]);
    for (const event of events) {
      assert.equal(event.data.baseType, 'EventData');
      assert.deepEqual(Object.keys(event.tags), ['ai.internal.sdkVersion']);
      assert.ok(Object.keys(event.data.baseData.properties).every((key) => ['stage', 'passed'].includes(key)));
      assert.ok(!JSON.stringify(event).includes('DO_NOT_TRANSMIT'));
    }
    for (const { headers } of outbound) {
      assert.ok(!headers.referer && !headers.cookie);
      assert.ok(!Object.keys(headers).some((key) => /request-id|traceparent|baggage/.test(key)));
    }
    assert.deepEqual(unexpected, []);
    assert.deepEqual(await context.cookies(), []);
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    assert.ok((await page.evaluate(() => Object.keys(sessionStorage))).every((key) => key === 'dictionary-challenge-v2'));
    if (process.env.BROWSER_SCREENSHOT) await writeFile(resolve(process.env.BROWSER_SCREENSHOT, '../dictionary-analytics-payloads.json'), JSON.stringify(outbound, null, 2));
    // Block delivery and verify the next real attempt still starts immediately.
    let blocked = 0;
    await context.route('https://*.applicationinsights.azure.com/**', (route) => { blocked++; return route.abort(); });
    await page.goto(`${origin}/#levels`);
    await click('Retake Find It');
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('dictionary-challenge-v2')).attempt.submitted), false);
    await finish(10, false);
    assert.ok(blocked > 0, 'The failed-delivery test must attempt an ingestion request');
    await page.goto(`${origin}/#about`);
    await page.setViewportSize({ width: 320, height: 720 });
    assert.ok((await page.locator('main').innerText()).includes('organizers use Microsoft Azure Monitor'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (process.env.BROWSER_SCREENSHOT) await page.screenshot({ path: resolve(process.env.BROWSER_SCREENSHOT, '../dictionary-analytics-mobile.png'), fullPage: true });
    let blockedSdk = 0;
    await context.route(`${origin}/src/vendor/ai.min.js`, (route) => { blockedSdk++; return route.abort(); });
    await page.goto(`${origin}/#levels`);
    await page.reload();
    await click('Retake Find It');
    await finish(6, 'none');
    assert.ok(blockedSdk > 0, 'The failed-load test must attempt to load the SDK');
    console.log('Analytics browser validation passed: real SDK payloads, event counts, all stages, resume/reload/history, privacy headers/storage, blocked ingestion and SDK load.');
  } finally { await context.close(); }
}
