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

function layout(content, eyebrow = 'Dictionary Detective Challenge', wide = false) {
  return `<div class="shell ${wide ? 'shell-wide' : ''}"><header class="brand"><a href="./" aria-label="Dictionary Detective Challenge home"><span class="brand-mark" aria-hidden="true">D<span>?</span></span><span>${eyebrow}</span></a><span class="brand-tag">Small book. Big discoveries.</span></header>${content}<footer>A literacy adventure powered by your book.<span class="color-bar" aria-hidden="true"></span></footer></div>`;
}

function welcome() {
  return layout(`<section class="welcome" aria-labelledby="welcome-title">
    <div class="hero">
      <div class="hero-copy">
        <p class="kicker">Calling all curious minds</p>
        <h1 id="welcome-title">Can you crack<br /><span>the dictionary?</span></h1>
        <p class="challenge-ribbon">Take the Dictionary Detective Challenge!</p>
        <p class="lede">Grab your dictionary. Follow the clues.<br />There’s a whole world of words waiting inside.</p>
      </div>
      <div class="book-scene" aria-hidden="true">
        <span class="spark spark-one">✦</span><span class="spark spark-two">✦</span>
        <div class="detective-seal">8 clues.<br /><strong>Endless<br />discoveries.</strong></div>
        <div class="book-stack"><div class="book book-blue">Explore</div><div class="book book-green">Learn</div><div class="book book-yellow">Discover</div><div class="book book-red">Grow</div><div class="book book-navy">Succeed</div></div>
      </div>
    </div>
    <div class="audience-choices">
      ${button('<span class="audience-icon" aria-hidden="true">✎</span><span><strong>I’m a Kid</strong><span>Start the dictionary detective challenge!</span></span><span class="choice-arrow" aria-hidden="true">→</span>', 'intro', 'button audience-choice kid-choice')}
      ${button('<span class="audience-icon" aria-hidden="true">☀</span><span><strong>I’m a Grown-up</strong><span>Meet the community groups behind the books.</span></span><span class="choice-arrow" aria-hidden="true">→</span>', 'adult', 'button audience-choice adult-choice')}
    </div>
    <p class="welcome-note">Your book is the key. No timer. Just curiosity.</p>
  </section>${renderSponsors(sponsorConfig, { compact: true })}`, undefined, true);
}

function intro() {
  return layout(`<section class="card" aria-labelledby="intro-title">
    <button class="text-button" data-route="home">← Back</button>
    <div class="book-icon" aria-hidden="true">📖</div>
    <p class="kicker">Before you begin</p>
    <h1 id="intro-title">Grab Your Dictionary!</h1>
    <p class="lede">You’ll need the physical book for the challenge ahead.</p>
    <ul class="feature-list">
      <li><span>1</span> Find words faster</li>
      <li><span>2</span> Understand definitions</li>
      <li><span>3</span> Discover new ideas</li>
    </ul>
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
    <div class="progress-copy"><span>Challenge ${progress.current} of ${progress.total}</span><span>${question.mission}</span></div>
    <div class="progress-track" role="progressbar" aria-label="Challenge progress" aria-valuemin="1" aria-valuemax="${progress.total}" aria-valuenow="${progress.current}"><span style="width: ${progress.percent}%"></span></div>
    <p class="mission">Mission: ${question.mission}</p>
    <p class="find-prompt">${question.prompt}</p>
    <h1 id="question-title">${question.question}</h1>
    <div class="answers" ${quizState.status === 'correct' ? 'inert' : ''}>
      ${question.type === 'acknowledgement'
        ? `<button class="button button-primary" data-action="acknowledge">${question.acknowledgementLabel}</button>`
        : question.answers.map((answer) => `<button class="answer${quizState.answerId === answer.id ? ' selected' : ''}" data-answer="${answer.id}">${answer.text}</button>`).join('')}
    </div>
    ${feedback}
  </section>`, 'Dictionary mission');
}

function complete() {
  return layout(`<section class="card completion" aria-labelledby="complete-title">
    <div class="celebration" aria-hidden="true">★</div>
    <p class="kicker">Mission complete</p>
    <h1 id="complete-title">You Did It!</h1>
    <p class="badge">Dictionary Detective</p>
    <p class="lede">You used your dictionary to find words, understand meanings, and discover something new.</p>
    <p>You practiced alphabetical order, guide words, definitions, context, parts of speech, and vocabulary discovery.</p>
    <div class="next-challenge"><strong>Keep discovering:</strong><br />What new word will you look up next?</div>
    <button class="button button-primary" data-action="replay">Play Again</button>
    ${button('Back to Welcome', 'home', 'text-button centered')}
  </section>`);
}

function adult() {
  return layout(`<section class="card" aria-labelledby="adult-title">
    <button class="text-button" data-route="home">← Back</button>
    <p class="kicker">For grown-ups</p>
    <h1 id="adult-title">Why this dictionary?</h1>
    <p class="lede">Community sponsors help put dictionaries in children’s hands as a tool for literacy, learning, and independence.</p>
    <div class="adult-grid"><article><h2>A book to keep</h2><p>It can help children build vocabulary, improve spelling, understand what they read, and solve language questions on their own.</p></article><article><h2>Learning through service</h2><p>Community service organizations bring volunteers together to help their neighbors. Supporting literacy gives children tools they can use for a lifetime.</p></article></div>
    <p class="note">This challenge teaches children to use the physical dictionary—it never replaces it.</p>
    <h2>Local help, wider possibilities</h2><p>Service starts close to home. Rotary Clubs, for example, support education locally and work with clubs in other countries on projects such as clean water and health.</p>
    ${renderSponsors(sponsorConfig)}
    ${button('Explore the Kid Challenge', 'intro', 'button button-primary')}
  </section>`);
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
