// words-db.js должен быть подключён ДО этого файла.

/* ---------- Транскрипция: казахские буквы -> латиница ---------- */
const TRANSLIT = {
  'а':'a','ә':'a','б':'b','в':'v','г':'g','ғ':'gh','д':'d','е':'e','ё':'yo',
  'ж':'zh','з':'z','и':'i','й':'y','к':'k','қ':'q','л':'l','м':'m','н':'n',
  'ң':'ng','о':'o','ө':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ү':'u',
  'ұ':'u','ф':'f','х':'kh','һ':'h','ц':'ts','ч':'ch','ш':'sh','щ':'shch',
  'ъ':'','ы':'y','і':'i','ь':'','э':'e','ю':'yu','я':'ya'
};

function transliterate(text) {
  let out = '';
  for (const ch of text.toLowerCase()) out += (ch in TRANSLIT) ? TRANSLIT[ch] : ch;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/* ---------- Словарь: строки "Казахское|English" -> объекты ---------- */
const DICT = KK_DICT_RAW.map(line => {
  const [kazakh, english] = line.split('|');
  return { kazakh, english, trans: '[' + transliterate(kazakh) + ']' };
});

function getWord(kazakh) {
  return DICT.find(w => w.kazakh === kazakh);
}

/* ---------- Темы ----------
   words: казахские слова, они должны совпадать со словами в words-db.js */
const TOPICS = [
  { id: 'greetings', icon: '👋', title: 'Greetings', kk: 'Сәлемдесу',
    words: ['Сәлем', 'Сәлеметсіз бе', 'Қайырлы таң', 'Қайырлы күн', 'Қайырлы кеш',
            'Қайырлы түн', 'Сау бол', 'Рақмет', 'Өтінемін', 'Кешіріңіз'] },
  { id: 'numbers', icon: '🔢', title: 'Numbers', kk: 'Сандар',
    words: ['Бір', 'Екі', 'Үш', 'Төрт', 'Бес', 'Алты', 'Жеті', 'Сегіз', 'Тоғыз', 'Он'] },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family', kk: 'Отбасы',
    words: ['Отбасы', 'Ана', 'Әке', 'Аға', 'Іні', 'Әпке', 'Қарындас', 'Ата', 'Әже', 'Бала'] },
  { id: 'food', icon: '🍽️', title: 'Food', kk: 'Тамақ',
    words: ['Су', 'Нан', 'Шай', 'Сүт', 'Ет', 'Балық', 'Алма', 'Қант', 'Тұз', 'Күріш'] }
];

function getTopicWords(topic) {
  return topic.words.map(getWord).filter(Boolean);
}

/* ---------- XP и прогресс (хранятся в браузере) ---------- */
const XP_PER_WORD = 5;
const PROGRESS_KEY = 'tilem_progress';

function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (p) return { xp: p.xp || 0, done: p.done || {} };
  } catch (e) {}
  return { xp: 0, done: {} };
}

function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

/* ---------- Streak: сколько дней подряд ты проходишь уроки ---------- */
const STREAK_KEY = 'tilem_streak';

// Дата в местном времени вида "2026-10-13" (не UTC, чтобы день менялся в полночь по твоему времени)
function dayString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function loadStreak() {
  try {
    const s = JSON.parse(localStorage.getItem(STREAK_KEY));
    if (s && typeof s.count === 'number' && s.last) return s;
  } catch (e) {}
  return { count: 0, last: null };
}

// Сколько дней стрик показывать сейчас: если вчера ты занимался, он ещё жив,
// если пропустил день или больше, то 0
function getCurrentStreak() {
  const s = loadStreak();
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return (s.last === dayString(now) || s.last === dayString(yesterday)) ? s.count : 0;
}

// Вызываем, когда пройден урок
function recordStudyDay() {
  const s = loadStreak();
  const today = dayString(new Date());
  if (s.last === today) return s; // сегодня уже засчитано

  s.count = getCurrentStreak() + 1; // вчера занимался -> +1, иначе начинаем с 1
  s.last = today;
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}
