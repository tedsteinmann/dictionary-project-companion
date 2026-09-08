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
  await click('Choose your stage →');
  assert((await page.locator('[data-level]').count()) === 1, 'Only Find It initially available');
  const stagePickerText = await page.locator('main').innerText();
  assert(stagePickerText.includes('Find It'), 'Initial child screen names Find It');
  assert(stagePickerText.includes('Figure It Out'), 'Initial child screen names Figure It Out');
  assert(stagePickerText.includes('Discover More'), 'Initial child screen names Discover More');
  assert(stagePickerText.includes('Complete Find It to unlock this stage.'), 'Figure It Out starts locked');
  assert(stagePickerText.includes('Complete Figure It Out to unlock this stage.'), 'Discover More starts locked');
  assert(!/Codebreaker|Code Cracker|Master Codebreaker/.test(stagePickerText), 'Old stage names are absent');
  await noOverflow('levels');
  await click('Start Find It');
  const firstIds = (await state()).attempt.questionIds;
  await noOverflow('question');
  await click('Next question →');
  assert((await state()).attempt.index === 0, 'An unanswered choice must not advance');
  const firstOptions = await page.getByRole('radio').evaluateAll((radios) => radios.map((r) => r.value));
  await page.getByRole('radio').first().focus();
  await page.getByRole('radio').first().press('Space');
  assert((await state()).attempt.index === 0, 'Choosing does not advance automatically');
  await click('Next question →');
  await click('← Previous');
  assert(await page.getByRole('radio').first().isChecked(), 'Previous preserves selection');
  await page.reload();
  assert(await page.getByRole('radio').first().isChecked(), 'Reload preserves selection');
  assert(JSON.stringify(await page.getByRole('radio').evaluateAll((radios) => radios.map((r) => r.value))) === JSON.stringify(firstOptions), 'Reload preserves choice order');
  await page.getByRole('radio').first().focus();
  assert(await page.getByRole('radio').first().evaluate((el) => getComputedStyle(el).outlineStyle !== 'none'), 'Visible keyboard focus');
  await page.getByRole('radio').first().press('ArrowDown');
  assert((await state()).attempt.answers[0] === firstOptions[1], 'Arrow keys select and save another choice');
  assert(await page.locator('.choice-option').evaluateAll((labels) => labels.every((el) => el.getBoundingClientRect().height >= 44)), 'Large answer targets');
  await page.locator('.dictionary-tip summary').click();
  assert(await page.locator('.dictionary-tip p').isVisible(), 'Dictionary tip expands');
  const formats = new Set();
  const answer = async (target, question, correct) => {
    formats.add(question.type);
    if (question.choices) {
      const value = correct ? question.answer : question.choices.find((choice) => choice !== question.answer);
      await target.getByRole('radio', { name: value, exact: true }).check();
    } else {
      await target.getByLabel('Type your answer', { exact: true }).fill(correct ? `  ${question.answer.toUpperCase()}  ` : '<b>still exploring</b>');
    }
  };

  const finish = async (score) => {
    const ids = (await state()).attempt.questionIds;
    for (let index = 0; index < 10; index++) {
      const question = bank.find((q) => q.id === ids[index]);
      await answer(page, question, index < score);
      await noOverflow(`question ${question.type}`);
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
    await page.locator('.learning-review summary').click();
    assert((await page.locator('.learning-review li').count()) === 10, 'Learning review includes every question');
    await page.locator('.discovery-activity summary').click();
    assert((await state()).attempt.submitted, 'Optional discovery does not change submission');
  };
  await finish(6);
  assert((await page.locator('[data-certificate]').count()) === 0, 'No certificate below passing score');
  assert((await state()).passedLevels.length === 0, 'Failed attempt does not unlock');
  await click('Try Find It again');
  const retryIds = (await state()).attempt.questionIds;
  assert(JSON.stringify([...firstIds].sort()) !== JSON.stringify([...retryIds].sort()), 'Retake changes question set');
  await finish(7);
  await click('View and print certificate');
  assert(await page.getByRole('heading', { name: 'Certificate of completion' }).isVisible(), 'Find It earns certificate');
  assert((await page.locator('.certificate').innerText()).includes('Stage 1 · Find It'), 'Certificate names Find It');
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
  await click('Continue to Figure It Out →');
  await page.setViewportSize({ width: 390, height: 844 });
  await finish(8);
  await click('Start Discover More →');
  await finish(10);
  assert((await page.locator('main').innerText()).includes('You completed all three stages'), 'All stages complete');
  await click('View and print certificate');
  assert((await page.locator('[data-level]').count()) === 0, 'No nonexistent fourth level');
  await click('Choose a stage');
  assert((await page.locator('[data-certificate]').count()) === 3, 'Earlier certificates retained');
  await click('View Find It certificate');
  assert(await page.locator('.completion-code').innerText() === firstCode, 'Earlier certificate remains available');
  await click('Choose a stage');
  await click('Retake Find It');
  await page.goBack();
  await page.goForward();
  await noResults();
  assert((await state()).attempt.submitted === false, 'Browser navigation preserves fresh attempt');

  // A separate page has its own tab session. Direct routes cannot reveal results.
  const isolated = await page.context().newPage();
  await isolated.goto(`${base}/#certificate`);
  assert(await isolated.getByRole('heading', { name: 'Three stages to explore.' }).isVisible(), 'Direct certificate guarded');
  await isolated.goto(`${base}/#results`);
  assert(await isolated.getByRole('heading', { name: 'Three stages to explore.' }).isVisible(), 'Direct results guarded');
  await isolated.close();

  const blockedStorage = await page.context().newPage();
  await blockedStorage.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw Error('Storage disabled'); } });
  });
  await blockedStorage.goto(`${base}/#levels`);
  await blockedStorage.getByRole('button', { name: 'Start Find It', exact: true }).click();
  for (let index = 0; index < 10; index++) {
    const title = await blockedStorage.locator('#question-title').innerText();
    const question = bank.find((q) => q.question === title);
    await answer(blockedStorage, question, true);
    // Keyboard submission works with either input format.
    await blockedStorage.getByRole('button', { name: index === 9 ? 'Review answers →' : 'Next question →', exact: true }).focus();
    await blockedStorage.keyboard.press('Enter');
  }
  await blockedStorage.getByRole('button', { name: 'Submit quiz', exact: true }).click();
  assert(await blockedStorage.getByRole('heading', { name: 'You cracked 10 out of 10!', exact: true }).isVisible(), 'Quiz works with storage blocked');
  await blockedStorage.close();

  // Exercise yes/no and its guide-word diagram through a real randomized attempt.
  const guidePage = await page.context().newPage();
  await guidePage.goto(`${base}/#levels`);
  let guideIndex = -1;
  let guideState;
  for (let attempt = 0; attempt < 20 && guideIndex < 0; attempt++) {
    await guidePage.getByRole('button', { name: 'Start Find It', exact: true }).click();
    guideState = await guidePage.evaluate(() => JSON.parse(sessionStorage.getItem('dictionary-challenge-v2')));
    guideIndex = guideState.attempt.questionIds.indexOf('community-guide-words');
    if (guideIndex < 0) await guidePage.getByRole('button', { name: 'Back to stages', exact: true }).click();
  }
  assert(guideIndex >= 0, 'Guide-word lesson remains in the playable pool');
  for (let index = 0; index < guideIndex; index++) {
    await answer(guidePage, bank.find((q) => q.id === guideState.attempt.questionIds[index]), true);
    await guidePage.getByRole('button', { name: 'Next question →', exact: true }).click();
  }
  await guidePage.setViewportSize({ width: 320, height: 720 });
  assert(await guidePage.locator('.guide-example').isVisible(), 'SVG guide-word example');
  assert((await guidePage.getByRole('radio').count()) === 2, 'Yes/no offers two native choices');
  await answer(guidePage, bank.find((q) => q.id === 'community-guide-words'), true);
  assert(await guidePage.getByRole('radio', { name: 'Yes', exact: true }).isChecked(), 'Yes/no selection');
  assert(await guidePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Guide lesson fits phone');
  await guidePage.close();
  assert(formats.size === 3, 'All three input formats exercised');
  assert(errors.length === 0, `Browser errors: ${errors.join(', ')}`);
  return { passed: true, checks: 'Mixed input formats; original lessons; SVG guide words; teaching tips; child/adult paths; all stages; 6/7/8/10 scoring; answer editing/escaping; retakes; reload/history; certificates; print; route guards; 320–1280px layouts', firstCode };
}
