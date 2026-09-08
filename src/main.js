import { sponsorConfig } from './content/sponsors.js';
import { renderSponsors } from './sponsors.js';
import { questions } from './content/questions.js';
import {
  acknowledgeQuestion,
  answerQuestion,
  getProgress,
  initialQuizState,
  nextQuestion,
  resetQuiz,
  retryQuestion
} from './quiz.js';

const app = document.querySelector('#app');
let quizState = initialQuizState;

const button = (label, route, className = 'button') =>
  `<button class="${className}" data-route="${route}">${label}</button>`;

function layout(content, wide = false) {
  return `<div class="shell ${wide ? 'shell-wide' : ''}"><header class="brand"><a href="./" aria-label="Dictionary Detective Challenge home">Dictionary Detective<span>Challenge</span></a><span class="brand-tag">Small book. Big discoveries.</span></header>${content}<footer>Discover more with your dictionary.</footer></div>`;
}

function welcome() {
  return layout(`<section class="welcome" aria-labelledby="welcome-title">
    <div class="hero">
      <div class="hero-copy">
        <p class="kicker">A little curiosity goes a long way</p>
        <h1 id="welcome-title">Explore your dictionary.</h1>
        <p class="lede">Use your book to solve eight short challenges.</p>
      </div>
      <img class="hero-dictionary" src="./src/assets/dictionary-detective.webp" alt="A cheerful dictionary character exploring words with a magnifying glass." width="1448" height="1086" fetchpriority="high" />
    </div>
    <div class="audience-choices">
      ${button('<span><strong>I’m a Kid</strong><span>Grab your book and start exploring.</span></span><span class="choice-arrow" aria-hidden="true">→</span>', 'intro', 'button audience-choice kid-choice')}
      ${button('<span><strong>I’m a Grown-up</strong><span>Learn about the project and its sponsors.</span></span><span class="choice-arrow" aria-hidden="true">→</span>', 'adult', 'button audience-choice adult-choice')}
    </div>
    <p class="welcome-note">Your dictionary is all you need. Take your time.</p>
  </section>${renderSponsors(sponsorConfig, { compact: true })}`, true);
}

function intro() {
  return layout(`<section class="card" aria-labelledby="intro-title">
    <button class="text-button" data-route="home">← Back</button>
    <p class="kicker">Before you begin</p>
    <h1 id="intro-title">Grab your dictionary.</h1>
    <p class="lede">You’ll need the physical book for the challenge ahead.</p>
    <ol class="feature-list">
      <li>Find words faster</li>
      <li>Understand definitions</li>
      <li>Discover new ideas</li>
    </ol>
    <p class="note">No timer. No score pressure. Just you and your dictionary.</p>
    ${button('Start the Challenge →', 'challenge', 'button button-primary')}
  </section>`);
}

function challenge() {
  const question = questions[quizState.currentQuestionIndex];
  const progress = getProgress(quizState, questions.length);
  const isLastQuestion = quizState.currentQuestionIndex === questions.length - 1;
  const rotaryContext = question.rotaryContext ? `<p>${question.rotaryContext}</p>` : '';
  const feedback = quizState.status === 'correct'
    ? `<div class="feedback success" role="status"><h2>${question.success}</h2>${rotaryContext}<button class="button button-primary" data-action="${isLastQuestion ? 'complete' : 'next'}">${isLastQuestion ? 'See What You Learned →' : 'Next Challenge →'}</button></div>`
    : quizState.status === 'incorrect'
      ? `<div class="feedback retry" role="alert"><h2>Almost!</h2><p>${question.hint}</p><button class="button button-secondary" data-action="retry">Try Again</button></div>`
      : '';

  return layout(`<section class="card challenge" aria-labelledby="question-title">
    <div class="progress-copy"><span>Challenge ${progress.current} of ${progress.total}</span></div>
    <div class="progress-track" role="progressbar" aria-label="Challenge progress" aria-valuemin="1" aria-valuemax="${progress.total}" aria-valuenow="${progress.current}"><span style="width: ${progress.percent}%"></span></div>
    <p class="mission">Mission: ${question.mission}</p>
    <p class="find-prompt">${question.prompt}</p>
    <h1 id="question-title">${question.question}</h1>
    <div class="answers" ${quizState.status === 'correct' ? 'inert' : ''}>
      ${question.type === 'acknowledgement'
        ? `<button class="button button-primary" data-action="acknowledge">${question.acknowledgementLabel}</button>`
        : question.answers.map((answer) => `<button class="answer${quizState.answerId === answer.id ? ' selected' : ''}" data-answer="${answer.id}" aria-pressed="${quizState.answerId === answer.id}"><span class="answer-marker" aria-hidden="true"></span><span>${answer.text}</span></button>`).join('')}
    </div>
    ${feedback}
  </section>`);
}

function complete() {
  return layout(`<section class="card completion" aria-labelledby="complete-title">
    <p class="kicker">Mission complete</p>
    <h1 id="complete-title">You did it!</h1>
    <p class="lede">You used your dictionary to find words, understand meanings, and discover something new.</p>
    <p>You practiced alphabetical order, guide words, definitions, context, parts of speech, and vocabulary discovery.</p>
    <div class="next-challenge"><strong>Keep discovering:</strong><br />What new word will you look up next?</div>
    <button class="button button-primary" data-action="replay">Play Again</button>
    ${button('Back to Welcome', 'home', 'text-button return-link')}
  </section>`);
}

function adult() {
  return layout(`<section class="card adult" aria-labelledby="adult-title">
    <button class="text-button" data-route="home">← Back</button>
    <p class="kicker">For grown-ups</p>
    <h1 id="adult-title">Why this dictionary?</h1>
    <p class="lede">Community sponsors help put dictionaries in children’s hands as a tool for literacy, learning, and independence.</p>
    <div class="adult-grid"><article><h2>A book to keep</h2><p>It can help children build vocabulary, improve spelling, understand what they read, and solve language questions on their own.</p></article><article><h2>Learning through service</h2><p>Community service organizations bring volunteers together to help their neighbors. Supporting literacy gives children tools they can use for a lifetime.</p></article></div>
    <p class="note">This challenge teaches children to use the physical dictionary—it never replaces it.</p>
    <h2>Local help, wider possibilities</h2><p>Service starts close to home. Rotary Clubs, for example, support education locally and work with clubs in other countries on projects such as clean water and health.</p>
    ${renderSponsors(sponsorConfig)}
    ${button('Explore the Kid Challenge', 'intro', 'button button-primary')}
  </section>`, true);
}

const screens = { home: welcome, intro, challenge, complete, adult };

function navigate(route, push = true, focus = true) {
  const safeRoute = screens[route] ? route : 'home';
  if (safeRoute === 'challenge' && location.hash !== '#challenge') quizState = resetQuiz();
  if (push) history.pushState({ route: safeRoute }, '', safeRoute === 'home' ? './' : `#${safeRoute}`);
  app.innerHTML = screens[safeRoute]();
  if (focus) app.focus();
}

app.addEventListener('click', (event) => {
  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) return navigate(routeTarget.dataset.route);

  const answerTarget = event.target.closest('[data-answer]');
  if (answerTarget) {
    const question = questions[quizState.currentQuestionIndex];
    quizState = answerQuestion(quizState, question, answerTarget.dataset.answer);
    return navigate('challenge', false);
  }

  if (event.target.closest('[data-action="retry"]')) {
    quizState = retryQuestion(quizState);
    return navigate('challenge', false);
  }

  if (event.target.closest('[data-action="next"]')) {
    quizState = nextQuestion(quizState, questions.length);
    return navigate('challenge', false);
  }

  if (event.target.closest('[data-action="acknowledge"]')) {
    quizState = acknowledgeQuestion(quizState, questions[quizState.currentQuestionIndex]);
    return navigate('challenge', false);
  }

  if (event.target.closest('[data-action="complete"]')) return navigate('complete');

  if (event.target.closest('[data-action="replay"]')) {
    quizState = resetQuiz();
    return navigate('intro');
  }
});

window.addEventListener('popstate', () => navigate(location.hash.slice(1) || 'home', false));
navigate(location.hash.slice(1) || 'home', false, false);
