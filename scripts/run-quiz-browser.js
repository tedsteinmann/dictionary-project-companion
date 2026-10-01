import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { access, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import checkQuizBrowser from './check-quiz-browser.js';

const root = fileURLToPath(new URL('../', import.meta.url));
let server;
let browser;

async function cleanup() {
  try {
    await browser?.close();
  } finally {
    if (server && server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      await exited;
    }
  }
}

for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]]) {
  process.once(signal, () => {
    cleanup().finally(() => process.exit(code));
  });
}

try {
  await access(resolve(root, 'dist/index.html'));
  server = spawn('python3', ['scripts/dev.py', '--port', '0'], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  let errors = '';
  server.stderr.on('data', (chunk) => { errors = (errors + chunk).slice(-4000); });
  const url = await new Promise((resolveUrl, reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview server startup timed out.')), 10000);
    const finish = (error, url) => {
      clearTimeout(timeout);
      if (error) reject(error);
      else resolveUrl(url);
    };
    server.once('error', (error) => finish(error));
    server.once('exit', (code) => finish(new Error(`Preview server exited (${code}): ${errors}`)));
    server.stdout.on('data', (chunk) => {
      output += chunk;
      const match = output.match(/Preview: http:\/\/localhost:(\d+)/);
      if (match) finish(null, `http://127.0.0.1:${match[1]}`);
    });
  });
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(url);
  const result = await checkQuizBrowser(page);
  if (!result?.passed) throw new Error('Browser validation did not report success.');
  console.log(`Browser validation passed: ${result.checks}`);
  if (process.env.BROWSER_SCREENSHOT) {
    const screenshot = resolve(process.env.BROWSER_SCREENSHOT);
    try {
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(url);
      await mkdir(dirname(screenshot), { recursive: true });
      await page.screenshot({ path: screenshot, fullPage: true });
      console.log(`Mobile screenshot: ${screenshot}`);
    } catch (error) {
      console.warn(`Screenshot unavailable: ${error.message}`);
    }
  }
} catch (error) {
  console.error(`Browser validation failed: ${error.message}`);
  console.error('Run npm run build first; install Chromium with npx playwright install chromium (Linux dependencies: npx playwright install --with-deps chromium).');
  process.exitCode = 1;
} finally {
  await cleanup();
}
