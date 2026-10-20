(function () {
  // Какая тема открыта, берём из адреса: lesson.html?topic=food
  const topicId = new URLSearchParams(location.search).get('topic');
  const topicIndex = TOPICS.findIndex(t => t.id === topicId);
  if (topicIndex === -1) {
    location.replace('lessons.html');
    return;
  }

  const topic = TOPICS[topicIndex];
  const words = getTopicWords(topic);
  const $ = id => document.getElementById(id);
  const stage = $('stage');

  $('lessonTitle').textContent = topic.title;
  $('lessonSubtitle').textContent = topic.kk;

  let cardIndex = 0; // номер карточки, которую показываем

  /* ---------- Этапы урока: карточки -> тест 1 -> тест 2 -> итог ---------- */
  const PAIRS_PER_ROUND = 5;
  const matchRounds = Math.ceil(words.length / PAIRS_PER_ROUND);
  const totalSteps = words.length * 2 + matchRounds; // карточки + вопросы + раунды
  let stepsDone = 0;

  const quiz = { index: 0, correct: 0, questions: [] };
  const match = { round: 0, mistakes: 0 };

  function setProgress(fraction, label) {
    $('stepFill').style.width = (fraction * 100) + '%';
    $('stepLabel').textContent = label;
  }

  function setStep(label) {
    setProgress(stepsDone / totalSteps, label);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* Карточки со словами */
  function renderCard() {
    const w = words[cardIndex];
    const isLast = cardIndex === words.length - 1;
    stepsDone = cardIndex;
    setStep(`Words ${cardIndex + 1} / ${words.length}`);

    stage.innerHTML = `
      <div class="flash">
        <div class="flash-kk">${w.kazakh}</div>
        <div class="flash-tr">${w.trans}</div>
        <div class="flash-en">${w.english}</div>
      </div>
      <div class="lesson-actions">
        <button class="btn-secondary" id="prevBtn" type="button" ${cardIndex === 0 ? 'disabled' : ''}>← Back</button>
        <button class="btn-primary" id="nextBtn" type="button">${isLast ? 'Start quiz →' : 'Next →'}</button>
      </div>
    `;

    $('prevBtn').onclick = () => { cardIndex--; renderCard(); };
    $('nextBtn').onclick = () => {
      if (isLast) startQuiz();
      else { cardIndex++; renderCard(); }
    };
    $('nextBtn').focus();
  }

  /* ================= ТЕСТ 1: выбери перевод (3 варианта) ================= */

  function buildQuestions() {
    return shuffle(words).map(w => {
      const toEnglish = Math.random() < 0.5;       // kk -> en или en -> kk
      const field = toEnglish ? 'english' : 'kazakh';
      const answer = w[field];

      // неправильные варианты: сначала из этой темы, потом из всего словаря
      const pool = shuffle(words.concat(shuffle(DICT)))
        .map(x => x[field])
        .filter(v => v !== answer);
      const wrong = [...new Set(pool)].slice(0, 2);

      return {
        prompt: toEnglish ? w.kazakh : w.english,
        sub: toEnglish ? w.trans : '',
        hint: toEnglish ? 'Choose the English translation' : 'Choose the Kazakh translation',
        answer,
        options: shuffle([answer, ...wrong])
      };
    });
  }

  function startQuiz() {
    quiz.index = 0;
    quiz.correct = 0;
    quiz.questions = buildQuestions();
    renderQuestion();
  }

  function renderQuestion() {
    const q = quiz.questions[quiz.index];
    stepsDone = words.length + quiz.index;
    setStep(`Quiz ${quiz.index + 1} / ${words.length}`);

    stage.innerHTML = `
      <div class="quiz-hint">${q.hint}</div>
      <div class="quiz-prompt">
        <div class="quiz-word">${q.prompt}</div>
        ${q.sub ? `<div class="quiz-tr">${q.sub}</div>` : ''}
      </div>
      <div class="quiz-options" id="quizOptions">
        ${q.options.map((o, i) => `<button class="quiz-option" type="button" data-i="${i}">${o}</button>`).join('')}
      </div>
      <div class="quiz-feedback" id="quizFeedback"></div>
      <div class="lesson-actions lesson-actions-end">
        <button class="btn-primary" id="quizNext" type="button" hidden>
          ${quiz.index === quiz.questions.length - 1 ? 'Next test →' : 'Next →'}
        </button>
      </div>
    `;

    const buttons = [...stage.querySelectorAll('.quiz-option')];
    buttons.forEach(btn => {
      btn.onclick = () => {
        const chosen = q.options[+btn.dataset.i];
        const ok = chosen === q.answer;
        buttons.forEach(b => {
          b.disabled = true;
          if (q.options[+b.dataset.i] === q.answer) b.classList.add('correct');
        });
        if (!ok) btn.classList.add('wrong');
        if (ok) quiz.correct++;

        $('quizFeedback').textContent = ok ? '✓ Correct!' : `✗ Correct answer: ${q.answer}`;
        $('quizFeedback').className = 'quiz-feedback ' + (ok ? 'ok' : 'bad');
        $('quizNext').hidden = false;
        $('quizNext').focus();
      };
    });

    $('quizNext').onclick = () => {
      if (quiz.index === quiz.questions.length - 1) startMatch();
      else { quiz.index++; renderQuestion(); }
    };
  }

  /* ================= ТЕСТ 2: соедини пары ================= */

  function startMatch() {
    match.round = 0;
    match.mistakes = 0;
    renderMatchRound();
  }

  function renderMatchRound() {
    const chunk = words.slice(match.round * PAIRS_PER_ROUND, (match.round + 1) * PAIRS_PER_ROUND);
    stepsDone = words.length * 2 + match.round;
    setStep(`Match ${match.round + 1} / ${matchRounds}`);

    const left = shuffle(chunk);
    const right = shuffle(chunk);
    let selected = null;   // выбранная кнопка слева
    let matched = 0;
    let busy = false;      // пока горит красный, клики игнорируем

    stage.innerHTML = `
      <div class="quiz-hint">Match each Kazakh word with its English translation</div>
      <div class="match-grid">
        <div class="match-col" id="matchLeft">
          ${left.map(w => `<button class="match-item" type="button" data-kk="${w.kazakh}">${w.kazakh}</button>`).join('')}
        </div>
        <div class="match-col" id="matchRight">
          ${right.map(w => `<button class="match-item" type="button" data-kk="${w.kazakh}">${w.english}</button>`).join('')}
        </div>
      </div>
      <div class="lesson-actions lesson-actions-end">
        <button class="btn-primary" id="matchNext" type="button" hidden>
          ${match.round === matchRounds - 1 ? 'Finish ✓' : 'Next →'}
        </button>
      </div>
    `;

    const leftBtns = [...stage.querySelectorAll('#matchLeft .match-item')];
    const rightBtns = [...stage.querySelectorAll('#matchRight .match-item')];

    leftBtns.forEach(b => b.onclick = () => {
      if (busy || b.classList.contains('correct')) return;
      leftBtns.forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      selected = b;
    });

    rightBtns.forEach(b => b.onclick = () => {
      if (busy || !selected || b.classList.contains('correct')) return;
      const left = selected;

      if (left.dataset.kk === b.dataset.kk) {
        left.classList.remove('selected');
        left.classList.add('correct');
        b.classList.add('correct');
        left.disabled = b.disabled = true;
        selected = null;
        if (++matched === chunk.length) {
          $('matchNext').hidden = false;
          $('matchNext').focus();
        }
      } else {
        match.mistakes++;
        busy = true;
        left.classList.add('wrong');
        b.classList.add('wrong');
        setTimeout(() => {
          left.classList.remove('wrong', 'selected');
          b.classList.remove('wrong');
          selected = null;
          busy = false;
        }, 600);
      }
    });

    $('matchNext').onclick = () => {
      if (match.round === matchRounds - 1) finish();
      else { match.round++; renderMatchRound(); }
    };
  }

  /* Добавление слов */
  function addWordsToVocab() {
    const KEY = 'tilem_vocab_exact'; // тот же ключ, что в vocabulary.html
    let vocab = [];
    try { vocab = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}

    let added = 0;
    words.forEach(w => {
      if (!vocab.some(v => v.kazakh === w.kazakh)) {
        vocab.push({ kazakh: w.kazakh, english: w.english, trans: w.trans });
        added++;
      }
    });

    localStorage.setItem(KEY, JSON.stringify(vocab));
    return added;
  }

  /* Функция финиш и четкая последовательность */
  function finish() {
    const p = loadProgress();
    const firstTime = !p.done[topic.id];
    const xpGained = firstTime ? words.length * XP_PER_WORD : 0;
    // слова в словарь кладём только при первом прохождении,
    // чтобы не возвращать слова, которые ты сам удалил
    const added = firstTime ? addWordsToVocab() : 0;

    p.done[topic.id] = true;
    p.xp += xpGained;
    saveProgress(p);
    recordStudyDay(); // засчитываем сегодняшний день для streak

    const next = TOPICS[topicIndex + 1];
    stepsDone = totalSteps;
    setProgress(1, 'Done');

    let vocabLine = '';
    if (firstTime) {
      vocabLine = added > 0
        ? `<div class="result-note">✓ ${added} new words added to your Vocabulary</div>`
        : '<div class="result-note">✓ These words are already in your Vocabulary</div>';
    }

    stage.innerHTML = `
      <div class="result">
        <div class="result-emoji">🎉</div>
        <div class="result-title">Lesson complete!</div>
        <div class="result-score">You learned ${words.length} new words</div>
        <div class="result-stats">
          <div class="stat"><span class="stat-num">${quiz.correct}/${words.length}</span><span class="stat-label">Quiz</span></div>
          <div class="stat"><span class="stat-num">${match.mistakes}</span><span class="stat-label">Match mistakes</span></div>
        </div>
        ${xpGained > 0
          ? `<div class="result-xp">+${xpGained} XP ⚡</div>`
          : '<div class="result-note">XP is given for the first completion only</div>'}
        ${vocabLine}

        <div class="result-actions">
          ${next ? `<a class="btn-primary" href="lesson.html?topic=${next.id}">Next lesson →</a>` : ''}
          <a class="btn-orange" href="vocabulary.html">Open Vocabulary</a>
          <a class="btn-secondary" href="lessons.html">All lessons</a>
        </div>
      </div>
    `;
  }

  renderCard();
})();