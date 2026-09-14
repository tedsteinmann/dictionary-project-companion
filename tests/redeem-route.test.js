import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const mainSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('presents the public redeem route as neutral certificate and prize information', () => {
  assert.match(mainSource, /\['redeem', 'Certificates and prizes'\]/);
  assert.match(mainSource, /const publicRoutes = \[[^\]]*'redeem'[^\]]*\]/);
  assert.match(mainSource, /No certificate redemption program is available for this build\./);
  assert.match(mainSource, /Families can still save or print a child’s certificate as a record of their dictionary challenge\./);
});

test('only offers redemption actions after a passing result or on an earned certificate', () => {
  assert.match(
    mainSource,
    /result\.passed && siteConfig\.redemption\.enabled \? button\('How to redeem your certificate', 'redeem'/
  );
  assert.match(
    mainSource,
    /siteConfig\.redemption\.enabled \? button\('How to redeem this certificate', 'redeem'/
  );

  const actionLabels = [...mainSource.matchAll(/button\('(How to redeem[^']*)', 'redeem'/g)];
  assert.deepEqual(
    actionLabels.map((match) => match[1]),
    ['How to redeem your certificate', 'How to redeem this certificate']
  );
});
