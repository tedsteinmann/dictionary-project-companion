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

const adultSponsorProjects = [
  { matches: /Rotary/i, description: 'Five Fargo–Moorhead Rotary Clubs have joined forces to create major community projects like the Rotary Natural Play Hill and Lindenwood Playground, along with literacy, arts, and international service projects.' },
  { matches: /Lions/i, description: 'Horace Lions has given hundreds of thousands of dollars back to the community and provides free vision screening for local children.' },
  { matches: /Elks/i, description: 'Fargo Elks Lodge #260 brings the community together through events like its Summer Car Show Series while raising money and supporting local youth, veterans, and neighbors in need.' }
];

const adultSponsorConfig = {
  sponsors: sponsorConfig.sponsors.map((sponsor) => ({
    ...sponsor,
    description: adultSponsorProjects.find(({ matches }) => matches.test(sponsor.title))?.description || sponsor.description
  }))
};

const button = (label, route, className = 'button') =>
  `<button class="${className}" data-route="${route}">${label}</button>`;

function layout(content, route, wide = false) {
  const childRoutes = ['intro', 'levels', 'challenge', 'review', 'results', 'certificate'];
  const isChildRoute = childRoutes.includes(route);
  const level = session.attempt && levels.find((item) => item.id === session.attempt.levelId);
  const status = route === 'challenge' ? `Question ${session.attempt.index + 1} of ${QUESTIONS_PER_ATTEMPT}`
    : { intro: 'Get ready', levels: 'Choose a stage', review: 'Review answers', results: 'Your results', certificate: 'Certificate' }[route];
  const stageLabel = level && !['intro', 'levels'].includes(route) ? `<strong>${level.name}</strong>` : '';
  const stageControl = session.attempt && route !== 'levels'
    ? '<button class="toolbar-button" data-route="levels">← Stages</button>' : '';
  return `<div class="shell ${wide ? 'shell-wide' : ''}"><header class="brand ${isChildRoute ? 'game-toolbar' : ''}">${isChildRoute ? `${stageControl}<a class="wordmark" href="./" aria-label="Dictionary Challenge home">Dictionary <span>Challenge</span></a><div class="game-status">${stageLabel}<span>${status}</span></div>` : '<a class="wordmark" href="./" aria-label="Dictionary Challenge home">Dictionary <span>Challenge</span></a><span class="brand-tag">Small book. Big discoveries.</span>'}</header>${content}<footer>Discover more with your dictionary.</footer></div>`;
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
      ${button('<span><strong>I’m a Grown-up</strong><span>Learn about the project and its sponsors.</span></span><span class="choice-arrow" aria-hidden="true">→</span>', 'adult', 'button audience-choice adult-choice')}
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
      ${button('For parents and guardians', 'adult', 'text-button')}
    </div>
  </section>`, route);
}

function adult(route) {
  return layout(`<section class="card adult" aria-labelledby="adult-title">
    <button class="text-button" data-route="home">← Back</button>
    <p class="kicker">For grown-ups</p>
    <h1 id="adult-title">Want to get more involved?</h1>
    <p class="lede">Your child’s dictionary is one example of what local service clubs make possible.</p>
    <p>The five Fargo–Moorhead Rotary Clubs, Horace Lions Club, and Fargo Elks bring people together to serve our community, build relationships, and make good things happen.</p>

    <section class="adult-section" aria-labelledby="prize-title">
      <h2 id="prize-title">Certificates and prizes</h2>
      <p>Children use their physical dictionary to answer 10 questions using a mix of choices and short typed answers. Guided lessons teach children how to use the book. A score of 7 or more at any stage earns a printable certificate and unlocks the next stage. Answers and learning feedback appear after submission.</p>
      <p>Save or print the certificate before closing the quiz tab. Show it to a teacher, librarian, or the dictionary project organizer. A parent or guardian should ask the organizer about prize availability and any fulfillment details; the child’s quiz requests no names or contact information.</p>
      <p>The completion code is a reference for the certificate. It is not an online prize claim or a verified redemption code.</p>
    </section>

    <section class="adult-section" aria-labelledby="why-involved-title">
      <h2 id="why-involved-title">Why get involved?</h2>
      <p>As adults, it can be surprisingly hard to meet new people, make genuine friendships, expand our circles, and find meaningful ways to get involved in our community. Service clubs make that easier.</p>
      <p>Getting involved can help you:</p>
      <ul class="benefit-list">
        <li><span class="benefit-icon" aria-hidden="true">diversity_3</span><strong>Meet new people</strong> from different professions, ages, backgrounds, and walks of life.</li>
        <li><span class="benefit-icon" aria-hidden="true">celebration</span><strong>Build friendships and have fun</strong> while doing something worthwhile.</li>
        <li><span class="benefit-icon" aria-hidden="true">trending_up</span><strong>Grow personally and professionally</strong> by learning from others and taking on new challenges.</li>
        <li><span class="benefit-icon" aria-hidden="true">location_city</span><strong>Get to know your community</strong>—its people, organizations, needs, and opportunities.</li>
        <li><span class="benefit-icon" aria-hidden="true">emoji_objects</span><strong>Turn ideas into reality</strong> by connecting with people who have the knowledge, resources, and relationships to help.</li>
        <li><span class="benefit-icon" aria-hidden="true">volunteer_activism</span><strong>Make a difference close to home</strong> through projects you can see and be part of.</li>
      </ul>
    </section>

    <section class="adult-section" aria-labelledby="more-than-dictionaries-title">
      <h2 id="more-than-dictionaries-title">More than dictionaries</h2>
      <p>The Dictionary Project is just one example of what local service clubs make possible.</p>
      <p class="note"><strong>Different clubs. Different projects.</strong> One idea: people working together can accomplish a lot.</p>
    </section>

    <section class="adult-section" aria-labelledby="find-a-club-title">
      <h2 id="find-a-club-title">Find a club that fits your life</h2>
      <p>You don’t need to know someone before you come, and you don’t need to be a business executive or longtime community leader. You just need to be interested in meeting people and getting involved.</p>
      <p>Service clubs aren’t all noon lunch meetings. Local clubs meet on different days, with options at 7:00 a.m., noon, and in the evening. With several clubs to choose from, there’s likely an option that works with your schedule.</p>
    </section>

    ${renderSponsors(adultSponsorConfig, { heading: 'Meet the clubs behind the Dictionary Project', linkLabel: 'Learn more • Find a club • Visit a meeting' })}
    <p class="closing-invitation">Come meet some people. Find your place. Make something happen.</p>
    ${button('Explore the Kid Challenge', 'intro', 'button button-primary')}
  </section>`, route, true);
}

const screenRoutes = new Set(['home', 'intro', 'levels', 'challenge', 'review', 'results', 'certificate', 'adult']);

function renderScreen(route) {
  switch (route) {
    case 'intro': return intro(route);
    case 'levels': return levelPicker(route);
    case 'challenge': return challenge(route);
    case 'review': return review(route);
    case 'results': return results(route);
    case 'certificate': return certificate(route);
    case 'adult': return adult(route);
    default: return welcome(route);
  }
}

function navigate(route, push = true, focus = true) {
  let safeRoute = screenRoutes.has(route) ? route : 'home';
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
  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) return navigate(routeTarget.dataset.route);
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

window.addEventListener('popstate', () => {
  if (location.hash === '#app') return app.focus();
  navigate(location.hash.slice(1) || 'home', false);
});
navigate(location.hash.slice(1) || 'home', false, false);
