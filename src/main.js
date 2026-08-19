import { questions } from './content/questions.js';
import { answerQuestion, initialQuizState } from './quiz.js';

const app = document.querySelector('#app');
let quizState = initialQuizState;

const button = (label, route, className = 'button') =>
  `<button class="${className}" data-route="${route}">${label}</button>`;

function layout(content, eyebrow = 'Rotary Dictionary Challenge') {
  return `<div class="shell"><header class="brand"><span class="brand-mark" aria-hidden="true">✦</span><span>${eyebrow}</span></header>${content}<footer>A literacy adventure powered by your book.</footer></div>`;
}

function welcome() {
  return layout(`<section class="card welcome" aria-labelledby="welcome-title">
    <p class="kicker">Open a book. Unlock an adventure.</p>
    <h1 id="welcome-title">Welcome, explorer!</h1>
    <p class="lede">Your dictionary has more inside it than you might think.</p>
    <p class="question-copy">Who’s exploring today?</p>
    <div class="choice-stack">
      ${button('<span aria-hidden="true">📖</span> I’m a Kid', 'intro', 'button button-primary')}
      ${button('<span aria-hidden="true">☀</span> I’m a Grown-up', 'adult', 'button button-secondary')}
    </div>
  </section>`);
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
  const question = questions[0];
  const feedback = quizState.status === 'correct'
    ? `<div class="feedback success" role="status"><h2>${question.success}</h2><p>${question.rotaryContext}</p>${button('Finish Challenge →', 'complete', 'button button-primary')}</div>`
    : quizState.status === 'incorrect'
      ? `<div class="feedback retry" role="alert"><h2>Almost!</h2><p>${question.hint}</p><button class="button button-secondary" data-action="retry">Try Again</button></div>`
      : '';

  return layout(`<section class="card challenge" aria-labelledby="question-title">
    <div class="progress-copy"><span>Challenge 1 of 1</span><span>Definition detective</span></div>
    <div class="progress-track" role="progressbar" aria-label="Challenge progress" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${quizState.status === 'correct' ? 1 : 0}"><span></span></div>
    <p class="mission">Mission: ${question.mission}</p>
    <p class="find-prompt">${question.prompt}</p>
    <h1 id="question-title">${question.question}</h1>
    <div class="answers" ${quizState.status === 'correct' ? 'inert' : ''}>
      ${question.answers.map((answer) => `<button class="answer${quizState.answerId === answer.id ? ' selected' : ''}" data-answer="${answer.id}">${answer.text}</button>`).join('')}
    </div>
    ${feedback}
  </section>`, 'Dictionary mission');
}

function complete() {
  return layout(`<section class="card completion" aria-labelledby="complete-title">
    <div class="celebration" aria-hidden="true">★</div>
    <p class="kicker">Mission complete</p>
    <h1 id="complete-title">You Did It!</h1>
    <p class="badge">Dictionary Explorer</p>
    <p class="lede">You found a word, read its definition, and connected it to the world around you.</p>
    <div class="next-challenge"><strong>One more challenge:</strong><br />What new word will you look up today?</div>
    ${button('Play Again', 'intro', 'button button-primary')}
    ${button('Back to Welcome', 'home', 'text-button centered')}
  </section>`);
}

function adult() {
  return layout(`<section class="card" aria-labelledby="adult-title">
    <button class="text-button" data-route="home">← Back</button>
    <p class="kicker">For grown-ups</p>
    <h1 id="adult-title">Why this dictionary?</h1>
    <p class="lede">A local Rotary Club gave this dictionary as a tool for literacy, learning, and independence.</p>
    <div class="adult-grid"><article><h2>A book to keep</h2><p>It can help children build vocabulary, improve spelling, understand what they read, and solve language questions on their own.</p></article><article><h2>Learning through service</h2><p>Rotary Clubs bring volunteers together to help their communities. Literacy projects are one way clubs invest in long-term opportunity.</p></article></div>
    <p class="note">This challenge teaches children to use the physical dictionary—it never replaces it.</p>
    ${button('Explore the Kid Challenge', 'intro', 'button button-primary')}
  </section>`);
}

const screens = { home: welcome, intro, challenge, complete, adult };

function navigate(route, push = true) {
  const safeRoute = screens[route] ? route : 'home';
  if (safeRoute !== 'challenge') quizState = initialQuizState;
  if (push) history.pushState({ route: safeRoute }, '', safeRoute === 'home' ? './' : `#${safeRoute}`);
  app.innerHTML = screens[safeRoute]();
  app.focus();
}

app.addEventListener('click', (event) => {
  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) return navigate(routeTarget.dataset.route);

  const answerTarget = event.target.closest('[data-answer]');
  if (answerTarget) {
    quizState = answerQuestion(questions[0], answerTarget.dataset.answer);
    return navigate('challenge', false);
  }

  if (event.target.closest('[data-action="retry"]')) {
    quizState = initialQuizState;
    navigate('challenge', false);
  }
});

window.addEventListener('popstate', () => navigate(location.hash.slice(1) || 'home', false));
navigate(location.hash.slice(1) || 'home', false);
