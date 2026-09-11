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
  await page.setViewportSize({ width: 1024, height: 800 });
  const primary = page.getByRole('navigation', { name: 'Primary' });
  const publicPages = {
    About: ['Why a physical dictionary?', 'Find → Understand → Apply → Discover'],
    Sponsors: ['Meet the project sponsors.', 'Participating organizations'],
    Redeem: ['Certificates and prizes', 'completion code is a reference only'],
    Contact: ['Contact the project.', 'does not use a contact form']
  };
  for (const destination of Object.keys(publicPages)) {
    assert(await primary.getByRole('link', { name: destination, exact: true }).isVisible(), `${destination} appears in public navigation`);
  }
  assert(await primary.getByRole('link', { name: 'Start Challenge', exact: true }).isVisible(), 'Challenge action appears in public navigation');
  assert(await page.getByRole('link', { name: 'Dictionary Challenge home' }).getAttribute('aria-current') === 'page', 'Public home identifies the active page');
  await page.getByRole('link', { name: 'Dictionary Challenge home' }).focus();
  await page.keyboard.press('Tab');
  assert(await primary.getByRole('link', { name: 'About', exact: true }).evaluate((element) => element === document.activeElement), 'Public links follow the wordmark in keyboard order');
  for (const [destination, [heading, text]] of Object.entries(publicPages)) {
    await primary.getByRole('link', { name: destination, exact: true }).click();
    assert(await page.getByRole('link', { name: destination, exact: true }).getAttribute('aria-current') === 'page', `${destination} identifies the active page`);
    assert(await page.getByRole('heading', { name: heading, exact: true }).isVisible(), `${destination} heading`);
    assert((await page.locator('main').innerText()).includes(text), `${destination} content`);
  }
  const config = await page.evaluate(async () => (await import('/src/content/site-config.js')).siteConfig);
  await page.goto(`${base}/#redeem`);
  assert(await page.getByRole('heading', { name: 'Certificates and prizes', exact: true }).isVisible(), 'Direct #redeem access renders the redemption screen');
  assert((await page.locator('main').innerText()).includes('not online verification or a guaranteed prize claim'), 'Redemption explains the local reference code limitation');
  assert((await page.locator('.redemption-grid').count()) === 0, 'Disabled or location-free configuration has no empty location grid');
  assert((await page.locator('main').innerText()).includes('No certificate redemption program is available'), 'Unavailable redemption has a neutral message');
  const enabledConfig = {
    ...config,
    site: {
      ...config.site,
      telephone: '(555) 555-0111',
      email: 'organizer@example.org',
      website: 'https://example.org/dictionary-project'
    },
    redemption: {
      enabled: true,
      instructions: 'A parent or guardian should bring the certificate code to a participating library desk, mention the Dictionary Challenge stage, ask staff to confirm age guidance and current inventory, and follow any local pickup rules before leaving with a prize.',
      deadline: 'June 30, 2027',
      locations: [{
        name: 'North Branch Library',
        addressLines: ['100 Elm Street', 'Exampletown'],
        instructions: 'Ask at the children’s desk.',
        telephone: '(555) 555-0120',
        website: 'https://example.org/north-branch'
      }, {
        name: 'South Branch Library',
        addressLines: ['250 River Avenue', 'Exampletown'],
        instructions: 'Show the certificate at the welcome desk.',
        telephone: '(555) 555-0130',
        website: 'https://example.org/south-branch'
      }]
    }
  };
  await page.evaluate(async (nextConfig) => {
    const mod = await import('/src/content/site-config.js');
    mod.siteConfig.site = nextConfig.site;
    mod.siteConfig.sponsors = nextConfig.sponsors;
    mod.siteConfig.redemption = nextConfig.redemption;
  }, enabledConfig);
  await page.goto(`${base}/#redeem`);
  assert((await page.locator('.redemption-location').count()) === enabledConfig.redemption.locations.length, 'Every configured library is rendered');
  assert((await page.locator('main').innerText()).includes('parent or guardian should handle'), 'Redemption is directed to a parent or guardian');
  assert((await page.locator('main').innerText()).includes('printed certificate or a saved copy'), 'Redemption says what to bring');
  assert((await page.locator('main').innerText()).includes('Redemption deadline: June 30, 2027'), 'Enabled redemption shows its deadline');
  assert(await page.getByRole('heading', { name: 'Project organizer', exact: true }).isVisible(), 'Enabled redemption includes organizer contact details');
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await page.goBack();
  assert(await page.getByRole('heading', { name: 'Certificates and prizes', exact: true }).isVisible(), 'Browser Back restores redemption');
  await page.goForward();
  assert(await page.getByRole('heading', { name: 'Why a physical dictionary?', exact: true }).isVisible(), 'Browser Forward restores the following public screen');
  await page.getByRole('link', { name: 'Dictionary Challenge home' }).click();
  const bank = await page.evaluate(async () => (await import('/src/content/questions.js')).questions);
  const state = () => page.evaluate(() => JSON.parse(sessionStorage.getItem('dictionary-challenge-v2')));
  const click = (name) => page.getByRole('button', { name, exact: true }).click();
  const noOverflow = async (label) => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label}: horizontal overflow`);
  const noResults = async () => assert(!/Correct answer:|You cracked \d/.test(await page.locator('main').innerText()), 'Premature answer feedback');
  await page.setViewportSize({ width: 320, height: 720 });
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  assert(await menu.isVisible() && await menu.getAttribute('aria-expanded') === 'false', 'Phone navigation uses a collapsed button disclosure');
  await menu.focus();
  await page.keyboard.press('Enter');
  assert(await menu.getAttribute('aria-expanded') === 'true' && await page.getByRole('link', { name: 'About', exact: true }).isVisible(), 'Phone menu opens from the keyboard');
  await page.keyboard.press('Escape');
  assert(await menu.getAttribute('aria-expanded') === 'false', 'Escape closes the phone menu');
  await noOverflow('welcome');
  await page.getByRole('button', { name: 'I’m a Grown-up' }).click();
  assert(await page.getByRole('heading', { name: 'Why a physical dictionary?' }).isVisible(), 'Adult path opens About');
  assert((await page.locator('main').innerText()).includes('Find → Understand → Apply → Discover'), 'Adult literacy guidance retained');
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
  assert(await page.locator('.game-toolbar').isVisible(), 'Child activity uses a game toolbar');
  assert((await page.locator('.game-status').innerText()).includes('Find It\nQuestion 1 of 10'), 'Toolbar shows stage and question progress');
  assert((await page.locator('.game-toolbar .public-nav').count()) === 0, 'Question toolbar omits distracting public links');
  const homeControl = page.getByRole('link', { name: 'Return to public home', exact: true });
  assert(await homeControl.evaluate((element) => element.getBoundingClientRect().height >= 44), 'Toolbar home link has a large target');
  await homeControl.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  assert(await page.getByRole('link', { name: 'Return to Challenge', exact: true }).isVisible(), 'Public header offers a return to the active attempt');
  await page.getByRole('link', { name: 'Return to Challenge', exact: true }).focus();
  await page.keyboard.press('Enter');
  assert(await page.getByText('You have a quiz in progress.').isVisible(), 'Challenge return opens the active attempt stage screen');
  await click('Continue your quiz →');
  const stagesControl = page.getByRole('button', { name: '← Stages' });
  assert(await stagesControl.evaluate((el) => el.getBoundingClientRect().height >= 44), 'Toolbar control has a large target');
  await stagesControl.focus();
  await page.keyboard.press('Enter');
  assert(await page.getByText('You have a quiz in progress.').isVisible(), 'Keyboard returns to an in-progress child flow');
  await click('Continue your quiz →');
  await noOverflow('question');
  await click('Submit answer →');
  assert((await state()).attempt.index === 0, 'An unanswered choice must not advance');
  const firstOptions = await page.getByRole('radio').evaluateAll((radios) => radios.map((r) => r.value));
  await page.getByRole('radio').first().focus();
  await page.getByRole('radio').first().press('Space');
  assert((await state()).attempt.index === 0, 'Choosing does not advance automatically');
  await click('Submit answer →');
  await click('← Previous question');
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
      await click(index === 9 ? 'Submit answer and review →' : 'Submit answer →');
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
  assert((await page.getByRole('button', { name: /redeem/i }).count()) === 0, 'Failed results do not expose redemption messaging');
  assert((await state()).passedLevels.length === 0, 'Failed attempt does not unlock');
  await click('Try Find It again');
  const retryIds = (await state()).attempt.questionIds;
  assert(JSON.stringify([...firstIds].sort()) !== JSON.stringify([...retryIds].sort()), 'Retake changes question set');
  await finish(7);
  if (enabledConfig.redemption.enabled) {
    const resultsRedeem = page.getByRole('button', { name: 'How to redeem your certificate', exact: true });
    assert(await resultsRedeem.isVisible(), 'Passing results offer redemption only after the certificate is earned');
  }
  await click('View and print certificate');
  assert(await page.getByRole('heading', { name: 'Certificate of completion' }).isVisible(), 'Find It earns certificate');
  assert((await page.locator('.certificate').innerText()).includes('Stage 1 · Find It'), 'Certificate names Find It');
  if (enabledConfig.redemption.enabled) {
    assert((await page.locator('.certificate').innerText()).includes('For redemption details, have a parent or guardian contact the project organizer at (555) 555-0111.'), 'Long instructions use contact fallback in printable certificate guidance');
    const redeemAction = page.getByRole('button', { name: 'How to redeem this certificate', exact: true });
    assert(await redeemAction.isVisible(), 'Certificate provides a no-print redemption action');
    await redeemAction.focus();
    assert(await redeemAction.evaluate((element) => getComputedStyle(element).outlineStyle !== 'none'), 'Redemption action has visible keyboard focus');
    await redeemAction.press('Enter');
    assert(await page.getByRole('heading', { name: 'Certificates and prizes', exact: true }).isVisible(), 'Certificate action navigates to redemption');
    await page.goBack();
  }
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
  assert(!(await page.getByRole('button', { name: 'How to redeem this certificate', exact: true }).isVisible().catch(() => false)), 'Print excludes the redemption action');
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
    await blockedStorage.getByRole('button', { name: index === 9 ? 'Submit answer and review →' : 'Submit answer →', exact: true }).focus();
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
    await guidePage.getByRole('button', { name: 'Submit answer →', exact: true }).click();
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
