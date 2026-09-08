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
    <h1 id="adult-title">Want to get more involved?</h1>
    <p class="lede">Your child’s dictionary is one example of what local service clubs make possible.</p>
    <p>The five Fargo–Moorhead Rotary Clubs, Horace Lions Club, and Fargo Elks bring people together to serve our community, build relationships, and make good things happen.</p>

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
