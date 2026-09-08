// Run with the Playwright browser tool (pass this function as its code argument).
// Start npm run dev first and navigate the browser to that local preview.
// This checks behavior through UI controls; sessionStorage is read only to obtain
// the randomized question IDs for test answers. No application state is forged.
export default async function checkQuizBrowser(page) {
  const base = page.url().split('/').slice(0, 3).join('/');
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  const bank = await page.evaluate(async () => (await import('/src/content/questions.js')).questions);
  const state = () => page.evaluate(() => JSON.parse(sessionStorage.getItem('dictionary-challenge-v2')));
  const click = (name) => page.getByRole('button', { name, exact: true }).click();
  const noOverflow = async (label) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: horizontal overflow`);
  const noResults = async () => assert(!/Correct answer:|You cracked \d/.test(await page.locator('main').innerText()), 'Premature answer feedback');
  await page.setViewportSize({ width: 320, height: 720 });
  await noOverflow('welcome');
  await page.getByRole('button', { name: 'I’m a Grown-up' }).click();
  assert(await page.getByRole('heading', { name: 'Certificates and prizes' }).isVisible(), 'Adult prize guidance');
  assert((await page.locator('.benefit-icon').count()) === 6, 'Adult service information retained');
  await noOverflow('adult');
  await click('Explore the Kid Challenge');
  assert((await page.locator('main').innerText()).includes('physical book'), 'Dictionary requirement');
  await click('Choose your level →');
  assert((await page.locator('[data-level]').count()) === 1, 'Only Level 1 initially available');
  await noOverflow('levels');
  await click('Start Codebreaker');
  const firstIds = (await state()).attempt.questionIds;
  await noOverflow('question');
  await page.getByLabel('Your answer', { exact: true }).fill('   ');
  await click('Next question →');
  assert((await state()).attempt.index === 0, 'Blank answer must not advance');
  await page.getByLabel('Your answer', { exact: true }).fill('temporary');
  await click('Next question →');
  await click('← Previous');
  assert(await page.getByLabel('Your answer', { exact: true }).inputValue() === 'temporary', 'Previous preserves answer');
  await page.reload();
  assert(await page.getByLabel('Your answer', { exact: true }).inputValue() === 'temporary', 'Reload preserves answer');
  await page.getByLabel('Your answer', { exact: true }).focus();
  assert(await page.getByLabel('Your answer', { exact: true }).evaluate((el) => getComputedStyle(el).outlineStyle !== 'none'), 'Visible keyboard focus');

  const finish = async (score) => {
    const ids = (await state()).attempt.questionIds;
    for (let index = 0; index < 10; index++) {
      const question = bank.find((q) => q.id === ids[index]);
      const value = index < score ? `  ${question.answer.toUpperCase()}  ` : '<b>still exploring</b>';
      await page.getByLabel('Your answer', { exact: true }).fill(value);
      await noResults();
      await click(index === 9 ? 'Review answers →' : 'Next question →');
    }
    await noResults();
    assert((await page.locator('.review-list li').count()) === 10, 'Review lists ten answers');
    assert((await page.locator('.review-list b').count()) === 0, 'Typed text is escaped');
    await noOverflow('review');
    await page.getByRole('button', { name: 'Change answer for question 1', exact: true }).click();
    assert((await state()).attempt.index === 0, 'Review edits requested question');
    await page.goBack();
    await click('Submit quiz');
    assert(await page.getByRole('heading', { name: `You cracked ${score} out of 10!`, exact: true }).isVisible(), `Score ${score}`);
    assert((await page.locator('.result-review li').count()) === 10 - score, 'Missed questions reviewed');
    for (const item of await page.locator('.result-review li').all()) {
      const index = Number(await item.getAttribute('value')) - 1;
      const answer = bank.find((q) => q.id === ids[index]).answer;
      assert((await item.innerText()).includes(`Correct answer: ${answer}`), 'Primary answer shown unchanged');
    }
    await noOverflow('results');
  };
  await finish(6);
  assert((await page.locator('[data-certificate]').count()) === 0, 'No certificate below passing score');
  assert((await state()).passedLevels.length === 0, 'Failed attempt does not unlock');
  await click('Try Codebreaker again');
  const retryIds = (await state()).attempt.questionIds;
  assert(JSON.stringify([...firstIds].sort()) !== JSON.stringify([...retryIds].sort()), 'Retake changes question set');
  await finish(7);
  await click('View and print certificate');
  assert(await page.getByRole('heading', { name: 'Certificate of completion' }).isVisible(), 'Level 1 earns certificate');
  const firstCode = await page.locator('.completion-code').innerText();
  await page.reload();
  assert(await page.locator('.completion-code').innerText() === firstCode, 'Certificate stable across reload');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await noOverflow(`certificate ${width}`);
  }
  await page.emulateMedia({ media: 'print' });
  assert(!(await page.locator('.no-print').isVisible()), 'Print hides controls');
  assert(!(await page.locator('.brand').isVisible()), 'Print hides navigation');
  assert(await page.locator('.certificate').isVisible(), 'Print includes certificate');
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => { window.print = () => { window.__printCalled = true; }; });
  await click('Print or save certificate');
  assert(await page.evaluate(() => window.__printCalled), 'Print button invokes printing');
  await click('Continue to Code Cracker →');
  await page.setViewportSize({ width: 390, height: 844 });
  await finish(8);
  await click('Try Level 3: Master Codebreaker →');
  await finish(10);
  assert((await page.locator('main').innerText()).includes('You completed all three levels'), 'All levels complete');
  await click('View and print certificate');
  assert((await page.locator('[data-level]').count()) === 0, 'No nonexistent fourth level');
  await click('Choose a level');
  assert((await page.locator('[data-certificate]').count()) === 3, 'Earlier certificates retained');
  await click('View Codebreaker certificate');
  assert(await page.locator('.completion-code').innerText() === firstCode, 'Earlier certificate remains available');
  await click('Choose a level');
  await click('Retake Codebreaker');
  await page.goBack();
  await page.goForward();
  await noResults();
  assert((await state()).attempt.submitted === false, 'Browser navigation preserves fresh attempt');

  // A separate page has its own tab session. Direct routes cannot reveal results.
  const isolated = await page.context().newPage();
  await isolated.goto(`${base}/#certificate`);
  assert(await isolated.getByRole('heading', { name: 'Three levels to crack.' }).isVisible(), 'Direct certificate guarded');
  await isolated.goto(`${base}/#results`);
  assert(await isolated.getByRole('heading', { name: 'Three levels to crack.' }).isVisible(), 'Direct results guarded');
  await isolated.close();

  const blockedStorage = await page.context().newPage();
  await blockedStorage.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw Error('Storage disabled'); } });
  });
  await blockedStorage.goto(`${base}/#levels`);
  await blockedStorage.getByRole('button', { name: 'Start Codebreaker', exact: true }).click();
  for (let index = 0; index < 10; index++) {
    const title = await blockedStorage.locator('#question-title').innerText();
    const question = bank.find((q) => q.question === title);
    await blockedStorage.getByLabel('Your answer', { exact: true }).fill(question.answer);
    // Keyboard submission also exercises native form behavior.
    await blockedStorage.getByLabel('Your answer', { exact: true }).press('Enter');
  }
  await blockedStorage.getByRole('button', { name: 'Submit quiz', exact: true }).click();
  assert(await blockedStorage.getByRole('heading', { name: 'You cracked 10 out of 10!', exact: true }).isVisible(), 'Quiz works with storage blocked');
  await blockedStorage.close();
  assert(errors.length === 0, `Browser errors: ${errors.join(', ')}`);
  return { passed: true, checks: 'Child/adult paths; all levels; 6/7/8/10 scoring; answer editing/escaping; retakes; reload/history; certificates; print; route guards; 320–1280px layouts', firstCode };
}
