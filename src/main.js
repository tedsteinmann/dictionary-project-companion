import { sponsorConfig } from './content/sponsors.js';
import { escapeHtml, renderSponsorNames, renderSponsors } from './sponsors.js';
import { questions } from './content/questions.js';
import { renderAnswerInput, readAnswer } from './components/answer-input.js';
import { dictionaryHelp } from './components/dictionary-help.js';
import { learningReview, discoveryActivity } from './components/learning-review.js';
import { levels, PASSING_SCORE, QUESTIONS_PER_ATTEMPT } from './content/levels.js';
import {
  canStartLevel, choicesFor, gradeAttempt, moveToQuestion, persistSession, restoreSession,
  saveAnswer, startAttempt, submitAttempt
} from './quiz.js';

const app = document.querySelector('#app');
let storage;
try { storage = window.sessionStorage; } catch { /* Storage may be disabled. */ }
let session = restoreSession(storage, questions);
const updateSession = (next) => {
  session = next;
  persistSession(session, storage);
};
const currentLevel = () => levels.find((level) => level.id === session.attempt.levelId);
const selectedCertificate = () => session.certificates.find((item) => item.code === session.certificateCode)
  || session.attempt?.certificate || session.certificates.at(-1);

const button = (label, route, className = 'button') =>
  `<button class="${className}" data-route="${route}">${label}</button>`;

const publicRoutes = ['home', 'about', 'sponsors', 'redeem', 'contact'];

function publicHeader(route) {
  const resumableAttempt = session.attempt && !session.attempt.submitted;
  const challengeRoute = resumableAttempt ? 'levels' : 'intro';
  const link = (label, destination) =>
    `<a href="#${destination}" data-route="${destination}"${route === destination ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="brand public-header">
    <a class="wordmark" href="./" data-route="home" aria-label="Dictionary Challenge home"${route === 'home' ? ' aria-current="page"' : ''}>Dictionary <span>Challenge</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="public-navigation" data-action="menu">Menu</button>
    <nav class="public-nav" id="public-navigation" aria-label="Primary">
      ${link('About', 'about')}${link('Sponsors', 'sponsors')}${link('Redeem', 'redeem')}${link('Contact', 'contact')}
      <a class="start-challenge" href="#${challengeRoute}" data-route="${challengeRoute}">${resumableAttempt ? 'Return to Challenge' : 'Start Challenge'}</a>
    </nav>
  </header>`;
}

function gameToolbar(route) {
  const level = session.attempt && levels.find((item) => item.id === session.attempt.levelId);
  const status = route === 'challenge' ? `Question ${session.attempt.index + 1} of ${QUESTIONS_PER_ATTEMPT}`
    : { intro: 'Get ready', levels: 'Choose a stage', review: 'Review answers', results: 'Your results', certificate: 'Certificate' }[route];
  const stageLabel = level && !['intro', 'levels'].includes(route) ? `<strong>${level.name}</strong>` : '';
  const stageControl = session.attempt && route !== 'levels'
    ? '<button class="toolbar-button" data-route="levels">← Stages</button>' : '';
  return `<header class="brand game-toolbar">
    <a class="toolbar-home" href="./" data-route="home" aria-label="Return to public home">Home</a>
    ${stageControl}<span class="toolbar-title" aria-hidden="true">Dictionary Challenge</span>
    <div class="game-status">${stageLabel}<span>${status}</span></div>
  </header>`;
}

function layout(content, route, wide = false) {
  const header = publicRoutes.includes(route) ? publicHeader(route) : gameToolbar(route);
  return `<div class="shell ${wide ? 'shell-wide' : ''}">${header}${content}<footer>Discover more with your dictionary.</footer></div>`;
}

function welcome(route) {
  return layout(`<section class="welcome" aria-labelledby="welcome-title">
    <div class="hero">
      <div class="hero-copy">
        <p class="kicker">A little curiosity goes a long way</p>
        <h1 id="welcome-title">Explore your dictionary.</h1>
        <p class="lede">Build your dictionary skills through three stages, one discovery at a time.</p>
      </div>
      <img class="hero-dictionary" src="./src/assets/dictionary-detective.webp" alt="A cheerful dictionary character exploring words with a magnifying glass." width="1448" height="1086" fetchpriority="high" />
    </div>
    <div class="audience-choices">
      ${button('<span><strong>I’m a Kid</strong><span>Grab your book and start exploring.</span></span><span class="choice-arrow" aria-hidden="true">→</span>', 'intro', 'button audience-choice kid-choice')}
      ${button('<span><strong>I’m a Grown-up</strong><span>Learn about the project and its sponsors.</span></span><span class="choice-arrow" aria-hidden="true">→</span>', 'about', 'button audience-choice adult-choice')}
    </div>
    <p class="welcome-note">Your dictionary is all you need. Take your time.</p>
  </section>${renderSponsors(sponsorConfig, { compact: true })}`, route, true);
}

function intro(route) {
  return layout(`<section class="card" aria-labelledby="intro-title">
    ${button('← Back', 'home', 'text-button')}
    <p class="kicker">Before you begin</p>
    <h1 id="intro-title">Grab your dictionary.</h1>
    <p class="lede">Use your physical book to answer 10 questions. Crack ${PASSING_SCORE} to earn a certificate and unlock the next stage.</p>
    <p class="progress-copy">Take your time—you can change answers before submitting.</p>
    ${button('Choose your stage →', 'levels', 'button button-primary')}
  </section>`, route);
}

function levelPicker(route) {
  return layout(`<section class="card" aria-labelledby="levels-title">
    ${button('← Back', 'intro', 'text-button')}
    <p class="kicker">Your dictionary adventure</p>
    <h1 id="levels-title">Three stages to explore.</h1>
    <p>Use your physical dictionary. Each challenge has 10 questions. Score ${PASSING_SCORE} or more to complete a stage and earn a certificate.</p>
    ${session.attempt && !session.attempt.submitted ? `<p class="note">You have a quiz in progress.</p>${button('Continue your quiz →', 'challenge', 'button button-primary')}` : ''}
    <ol class="level-list">${levels.map((level) => {
      const unlocked = canStartLevel(session, level.id);
      const passed = session.passedLevels.includes(level.id);
      const certificate = session.certificates.findLast((item) => item.levelId === level.id);
      const previousLevel = [...levels].filter((item) => item.id < level.id).sort((a, b) => b.id - a.id)[0];
      return `<li class="level-card">
        <p class="kicker">Stage ${level.id}${passed ? ' · Completed' : ''}</p>
        <h2>${level.name}</h2>
        <p>${level.description}</p>
        ${unlocked ? `<button class="button ${passed ? 'button-secondary' : 'button-primary'}" data-level="${level.id}">${passed ? 'Retake' : 'Start'} ${level.name}</button>`
          : `<p class="progress-copy">Complete ${previousLevel.name} to unlock this stage.</p>`}
        ${certificate ? `<button class="text-button return-link" data-certificate="${certificate.code}">View ${level.name} certificate</button>` : ''}
      </li>`;
    }).join('')}</ol>
    <p class="progress-copy">Retakes bring a new mix of questions. Some discoveries may appear again.</p>
  </section>`, route);
}

function challenge(route) {
  const { attempt } = session;
  const level = currentLevel();
  const question = questions.find((item) => item.id === attempt.questionIds[attempt.index]);
  const current = attempt.index + 1;
  return layout(`<section class="card challenge" aria-labelledby="question-title">
    <p class="kicker">Stage ${level.id} · ${level.name}</p>
    <div class="progress-copy">Question ${current} of ${QUESTIONS_PER_ATTEMPT}</div>
    <div class="progress-track" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${current}"><span style="width: ${current * 10}%"></span></div>
    <p class="mission">${escapeHtml(question.category)} · ${escapeHtml(question.subcategory)}</p>
    ${dictionaryHelp(question)}
    <h1 id="question-title">${escapeHtml(question.question)}</h1>
    <form id="answer-form">
      ${renderAnswerInput(question, attempt.answers[attempt.index], choicesFor(attempt, question))}
      <div class="quiz-actions">
        <button type="submit" class="button button-primary">${current === QUESTIONS_PER_ATTEMPT ? 'Submit answer and review →' : 'Submit answer →'}</button>
        ${attempt.index > 0 ? '<a href="#challenge" class="text-button previous-link" data-action="previous">← Previous question</a>' : ''}
      </div>
    </form>
    ${button('Back to stages', 'levels', 'text-button return-link')}
  </section>`, route);
}

function review(route) {
  const { attempt } = session;
  const answered = attempt.answers.filter((answer) => answer.trim()).length;
  return layout(`<section class="card" aria-labelledby="review-title">
    <p class="kicker">${currentLevel().name} · ${answered} of 10 answered</p>
    <h1 id="review-title">Ready to crack the code?</h1>
    <p>Check your answers below. You can change any answer before submitting. Your score and the correct answers will appear afterward.</p>
    <ol class="review-list">${attempt.questionIds.map((id, index) => {
      const question = questions.find((item) => item.id === id);
      return `<li><p>${escapeHtml(question.question)}</p><p><strong>Your answer:</strong> ${escapeHtml(attempt.answers[index]) || 'Not answered yet'}</p><button class="text-button" data-question="${index}">Change answer<span class="sr-only"> for question ${index + 1}</span></button></li>`;
    }).join('')}</ol>
    ${answered === QUESTIONS_PER_ATTEMPT ? '<button class="button button-primary" data-action="submit">Submit quiz</button>' : '<p class="note">Answer each question before submitting your quiz.</p>'}
    ${button('Back to quiz', 'challenge', 'text-button return-link')}
  </section>`, route);
}

function results(route) {
  const level = currentLevel();
  const result = gradeAttempt(session.attempt, questions);
  const missed = result.details.filter((item) => !item.correct);
  return layout(`<section class="card" aria-labelledby="results-title">
    <p class="kicker">Stage ${level.id} · ${level.name}</p>
    <h1 id="results-title">You cracked ${result.score} out of 10!</h1>
    <p class="lede">${result.passed ? `Stage completed! You earned your ${level.name} certificate.` : 'Keep exploring! Crack 7 or more to complete this stage. Your dictionary can help you try again.'}</p>
    <div class="quiz-actions">
      ${result.passed ? `<button class="button button-primary" data-certificate="${session.attempt.certificate.code}">View and print certificate</button>` : ''}
      ${result.passed && level.id < levels.length ? `<button class="button button-primary" data-level="${level.id + 1}">Start ${levels[level.id].name} →</button>` : ''}
      <button class="button button-secondary" data-level="${level.id}">Try ${level.name} again</button>
    </div>
    ${result.passed && level.id === levels.length ? '<p class="note">You completed all three stages. Great detective work—keep discovering!</p>' : ''}
    <section class="result-review" aria-labelledby="missed-title">
      <h2 id="missed-title">${missed.length ? 'Discover the answers you missed' : 'Great find—all 10 cracked!'}</h2>
      ${missed.length ? `<ol class="review-list">${result.details.map((item, index) => item.correct ? '' : `<li value="${index + 1}"><p>${escapeHtml(item.question.question)}</p><p><strong>Your answer:</strong> ${escapeHtml(item.answer)}</p><p><strong>Correct answer:</strong> ${escapeHtml(item.question.answer)}</p></li>`).join('')}</ol>` : '<p>Keep your dictionary close for your next discovery.</p>'}
    </section>
    ${learningReview(result.details)}
    ${discoveryActivity()}
    <p class="note">Keep discovering with your dictionary. Rotary volunteers support learning in local schools and work together on projects such as clean water and community health around the world.</p>
    ${button('Choose a stage', 'levels', 'text-button return-link')}
  </section>`, route);
}

function certificate(route) {
  const earned = selectedCertificate();
  const level = levels.find((item) => item.id === earned.levelId);
  return layout(`<section aria-labelledby="certificate-title">
    <div class="card certificate">
      <p class="kicker">Dictionary Challenge</p>
      <h1 id="certificate-title">Certificate of completion</h1>
      <p class="lede">Stage ${level.id} · ${level.name}</p>
      <p>You used your physical dictionary to find answers, explore ideas, and complete the challenge.</p>
      <p class="certificate-score">You cracked ${earned.score} out of 10!</p>
      <p>Completed <time datetime="${earned.date}">${earned.date}</time></p>
      <p>Completion code<br /><strong class="completion-code">${earned.code}</strong></p>
      <p>Show this certificate to a parent, guardian, teacher, or librarian. A parent or guardian can ask the organizer about any available prize and how to claim it.</p>
      ${renderSponsorNames(sponsorConfig)}
    </div>
    <div class="quiz-actions no-print">
      <button class="button button-primary" data-action="print">Print or save certificate</button>
      ${level.id < levels.length ? `<button class="button button-secondary" data-level="${level.id + 1}">Continue to ${levels[level.id].name} →</button>` : ''}
      ${button('Choose a stage', 'levels', 'button')}
      ${button('For parents and guardians', 'about', 'text-button')}
    </div>
  </section>`, route);
}

function about(route) {
  return layout(`<section class="card adult" aria-labelledby="adult-title">
    <p class="kicker">For grown-ups</p>
    <h1 id="adult-title">Why a physical dictionary?</h1>
    <p class="lede">The Dictionary Challenge helps a child learn to use the book they received—it does not replace that book with an online lookup.</p>

    <section class="adult-section" aria-labelledby="learning-title">
      <h2 id="learning-title">Find → Understand → Apply → Discover</h2>
      <p>Children first find information in their physical dictionary, understand the entry, apply what it means, and discover how independent reading and writing can open new ideas.</p>
      <p>The short challenges build practical skills such as alphabetical order, guide words, definitions, parts of speech, and choosing a meaning from context.</p>
    </section>

    <section class="adult-section" aria-labelledby="support-title">
      <h2 id="support-title">How adults can help</h2>
      <p>Put the physical dictionary within reach, invite the child to read the instructions aloud, and ask questions such as “Which guide words could help?” or “Which meaning fits the sentence?” Give them time to search instead of giving the answer.</p>
      <p>Celebrate the search strategy and persistence, whether or not the first answer is correct. The goal is confidence in finding and understanding information.</p>
    </section>

    <section class="adult-section" aria-labelledby="privacy-title">
      <h2 id="privacy-title">A private, child-friendly activity</h2>
      <p>The challenge asks for no name, email address, birthday, school, address, or location. Quiz progress is temporary to this browser tab; there are no child accounts or public scores.</p>
    </section>
    ${button('Explore the Kid Challenge', 'intro', 'button button-primary')}
  </section>`, route, true);
}

function sponsorsPage(route) {
  return layout(`<section class="card adult" aria-labelledby="sponsors-page-title">
    <p class="kicker">Community support</p>
    <h1 id="sponsors-page-title">Meet the project sponsors.</h1>
    <p class="lede">Participating organizations made this local dictionary project possible by supporting children, books, and literacy.</p>
    <p>The physical dictionary and the child’s learning come first. Sponsor information is provided here so families can recognize the community partners behind the project.</p>
    ${renderSponsors(sponsorConfig, { heading: 'Participating organizations', linkLabel: 'Visit organization website' })}
  </section>`, route, true);
}

function redeem(route) {
  return layout(`<section class="card adult" aria-labelledby="redeem-title">
    <p class="kicker">For parents and guardians</p>
    <h1 id="redeem-title">Certificates and prizes</h1>
    <p class="lede">A child earns a printable certificate by scoring ${PASSING_SCORE} or more in a challenge stage.</p>
    <p>Save or print the certificate before closing the quiz tab, then show it to a teacher, librarian, or dictionary project organizer.</p>
    <p>A parent or guardian should ask the organizer whether a prize is available and how to claim it. The completion code is a certificate reference, not an online redemption code.</p>
    <p class="note">The challenge collects no names or contact information.</p>
  </section>`, route, true);
}

function contact(route) {
  const { organizer, sponsors } = sponsorConfig;
  const organizerDetails = organizer ? `<address>
    ${organizer.name ? `<strong>${escapeHtml(organizer.name)}</strong><br />` : ''}
    ${organizer.address ? `${escapeHtml(organizer.address).replace(/\n/g, '<br />')}<br />` : ''}
    ${organizer.phone ? `<a href="tel:${escapeHtml(organizer.phone.replace(/[^+\d]/g, ''))}">${escapeHtml(organizer.phone)}</a><br />` : ''}
    ${organizer.email ? `<a href="mailto:${escapeHtml(organizer.email)}">Email ${escapeHtml(organizer.name || 'the project organizer')}</a>` : ''}
  </address>` : '<p>Organizer contact details are not included in this build.</p>';
  return layout(`<section class="card adult" aria-labelledby="contact-title">
    <p class="kicker">Project information</p>
    <h1 id="contact-title">Contact the project.</h1>
    <p class="lede">For questions about the local dictionary project or prize availability, contact the configured organizer. This site does not use a contact form or collect visitor details.</p>
    <section class="adult-section" aria-labelledby="organizer-title"><h2 id="organizer-title">Project organizer</h2>${organizerDetails}</section>
    <section class="adult-section" aria-labelledby="website-title"><h2 id="website-title">Sponsor websites</h2>
      <ul>${sponsors.map((sponsor) => `<li><a href="${escapeHtml(sponsor.url)}" rel="noreferrer">Visit the ${escapeHtml(sponsor.title)} website <span aria-hidden="true">↗</span></a></li>`).join('')}</ul>
    </section>
  </section>`, route, true);
}

const screenRoutes = new Set([...publicRoutes, 'intro', 'levels', 'challenge', 'review', 'results', 'certificate', 'adult']);

const screens = {
  home: welcome, intro, levels: levelPicker, challenge, review, results, certificate,
  about, sponsors: sponsorsPage, redeem, contact,
  adult: () => about('about')
};

function renderScreen(route) {
  return (screens[route] || screens.home)(route);
}

function navigate(route, push = true, focus = true) {
  let safeRoute = route === 'adult' ? 'about' : (screenRoutes.has(route) ? route : 'home');
  if (['challenge', 'review', 'results'].includes(safeRoute)) {
    if (!session.attempt) safeRoute = 'levels';
    else if (session.attempt.submitted) safeRoute = 'results';
    else if (safeRoute === 'results') safeRoute = 'challenge';
  }
  if (safeRoute === 'certificate' && !selectedCertificate()) safeRoute = 'levels';
  const url = safeRoute === 'home' ? './' : `#${safeRoute}`;
  if (push && location.hash !== `#${safeRoute}`) history.pushState({ route: safeRoute }, '', url);
  else if (safeRoute !== route) history.replaceState({ route: safeRoute }, '', url);
  app.innerHTML = renderScreen(safeRoute);
  if (focus) {
    app.focus();
    window.scrollTo(0, 0);
  }
}

app.addEventListener('input', (event) => {
  if (event.target.name === 'answer') {
    event.target.setCustomValidity('');
    updateSession(saveAnswer(session, readAnswer(event.target.form)));
  }
});

app.addEventListener('submit', (event) => {
  if (event.target.id !== 'answer-form') return;
  event.preventDefault();
  const value = readAnswer(event.target);
  if (!value.trim()) {
    const input = event.target.querySelector('[name=answer]');
    input.setCustomValidity('Use your dictionary and give an answer before continuing.');
    input.reportValidity();
    return;
  }
  updateSession(saveAnswer(session, value));
  if (session.attempt.index === QUESTIONS_PER_ATTEMPT - 1) return navigate('review');
  updateSession(moveToQuestion(session, session.attempt.index + 1));
  navigate('challenge', false);
});

app.addEventListener('click', (event) => {
  const menuToggle = event.target.closest('[data-action="menu"]');
  if (menuToggle) {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.closest('.public-header').classList.toggle('menu-open', !expanded);
    return;
  }
  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) {
    event.preventDefault();
    return navigate(routeTarget.dataset.route);
  }
  const levelTarget = event.target.closest('[data-level]');
  if (levelTarget) {
    const next = startAttempt(session, questions, Number(levelTarget.dataset.level));
    if (next === session) return;
    updateSession(next);
    return navigate('challenge');
  }
  const certificateTarget = event.target.closest('[data-certificate]');
  if (certificateTarget) {
    updateSession({ ...session, certificateCode: certificateTarget.dataset.certificate });
    return navigate('certificate');
  }
  const questionTarget = event.target.closest('[data-question]');
  if (questionTarget) {
    updateSession(moveToQuestion(session, Number(questionTarget.dataset.question)));
    return navigate('challenge');
  }
  if (event.target.closest('[data-action="previous"]')) {
    event.preventDefault();
    updateSession(moveToQuestion(session, session.attempt.index - 1));
    return navigate('challenge', false);
  }
  if (event.target.closest('[data-action="submit"]')) {
    updateSession(submitAttempt(session, questions));
    return navigate('results');
  }
  if (event.target.closest('[data-action="print"]')) window.print();
});

app.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const menuToggle = app.querySelector('[data-action="menu"][aria-expanded="true"]');
  if (!menuToggle) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.closest('.public-header').classList.remove('menu-open');
  menuToggle.focus();
});

window.addEventListener('popstate', () => {
  if (location.hash === '#app') return app.focus();
  navigate(location.hash.slice(1) || 'home', false);
});
navigate(location.hash.slice(1) || 'home', false, false);
