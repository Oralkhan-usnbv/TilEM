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

  function setProgress(fraction, label) {
    $('stepFill').style.width = (fraction * 100) + '%';
    $('stepLabel').textContent = label;
  }

  /* ---------- Карточка со словом ---------- */
  function renderCard() {
    const w = words[cardIndex];
    const isLast = cardIndex === words.length - 1;
    setProgress(cardIndex / words.length, `${cardIndex + 1} / ${words.length}`);

    stage.innerHTML = `
      <div class="flash">
        <div class="flash-kk">${w.kazakh}</div>
        <div class="flash-tr">${w.trans}</div>
        <div class="flash-en">${w.english}</div>
      </div>
      <div class="lesson-actions">
        <button class="btn-secondary" id="prevBtn" type="button" ${cardIndex === 0 ? 'disabled' : ''}>← Back</button>
        <button class="btn-primary" id="nextBtn" type="button">${isLast ? 'Finish ✓' : 'Next →'}</button>
      </div>
    `;

    $('prevBtn').onclick = () => { cardIndex--; renderCard(); };
    $('nextBtn').onclick = () => {
      if (isLast) finish();
      else { cardIndex++; renderCard(); }
    };
    $('nextBtn').focus();
  }

  /* ---------- Добавить слова урока в Vocabulary ---------- */
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

  /* ---------- Конец урока: XP, прогресс, словарь ---------- */
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

    const next = TOPICS[topicIndex + 1];
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