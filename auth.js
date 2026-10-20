/* TilEM: вход, регистрация и профиль (Supabase).
   Подключается на каждой странице ПОСЛЕ библиотеки supabase-js:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.1"></script>
   <script src="auth.js"></script>
*/
(function () {
  'use strict';

  // Эти два значения публичные, их можно хранить в коде сайта.
  var SUPABASE_URL = 'https://sdkjuyimwcipblzxsmwl.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_pueV9MEqYuProOiam9i9kg_JhZAykvd';

  var CACHE_KEY = 'tilem_profile_cache';
  var DEFAULT_AVATAR = '🙂';
  var AVATARS = ['🙂', '😎', '🦊', '🐺', '🦅', '🐎', '🐪', '🦌', '🌙', '⭐', '🔥', '🏔️'];

  /* ---------- Подключение к Supabase ---------- */
  var sb = null;
  try {
    if (window.supabase && window.supabase.createClient) {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (e) { sb = null; }

  /* ---------- Понятные ошибки ---------- */
  function UserError(message) {
    this.name = 'UserError';
    this.message = message;
  }
  UserError.prototype = Object.create(Error.prototype);

  function niceError(err) {
    if (err instanceof UserError) return err.message;
    if (!sb) return 'No connection to the server. Check your internet and reload the page.';
    var m = String((err && err.message) || '').toLowerCase();
    if (m.indexOf('invalid login') !== -1) return 'Wrong email or password.';
    if (m.indexOf('already registered') !== -1 || m.indexOf('already been registered') !== -1) {
      return 'This email is already registered. Try logging in.';
    }
    if (m.indexOf('password should be at least') !== -1) return 'Password must be at least 6 characters.';
    if (m.indexOf('email') !== -1 && m.indexOf('invalid') !== -1) return 'Please check your email address.';
    if (m.indexOf('rate limit') !== -1 || m.indexOf('too many') !== -1) return 'Too many attempts. Wait a minute and try again.';
    if (m.indexOf('failed to fetch') !== -1 || m.indexOf('network') !== -1) return 'No connection. Check your internet and try again.';
    return 'Something went wrong. Please try again.';
  }

  // Любая ошибка наружу выходит уже с понятным текстом
  function wrap(fn) {
    return async function () {
      try {
        return await fn.apply(null, arguments);
      } catch (e) {
        throw (e instanceof UserError) ? e : new UserError(niceError(e));
      }
    };
  }

  function checkName(name) {
    var n = String(name || '').trim();
    if (n.length < 2 || n.length > 20) throw new UserError('Name must be 2–20 characters.');
    return n;
  }

  /* ---------- Кеш профиля (чтобы шапка не мигала) ---------- */
  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (c && c.username) return c;
    } catch (e) {}
    return null;
  }
  function writeCache(p) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        username: p.username,
        avatar: p.avatar || DEFAULT_AVATAR
      }));
    } catch (e) {}
  }
  function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
  }

  /* ---------- Пользователь и профиль ---------- */
  async function getUserRaw() {
    if (!sb) return null;
    var res = await sb.auth.getSession();
    return res.data && res.data.session ? res.data.session.user : null;
  }

  async function getProfileRaw() {
    var user = await getUserRaw();
    if (!user) return null;

    var cols = 'username, avatar, xp, created_at';
    var res = await sb.from('profiles').select(cols).eq('id', user.id).maybeSingle();
    if (res.error) throw res.error;
    var profile = res.data;

    // Если профиль почему-то не создался сам при регистрации, создаём его
    if (!profile) {
      var fallbackName = (user.user_metadata && user.user_metadata.username) ||
                         String(user.email || 'user').split('@')[0];
      var ins = await sb.from('profiles')
        .insert({ id: user.id, username: fallbackName, avatar: DEFAULT_AVATAR })
        .select(cols).single();
      if (ins.error) throw ins.error;
      profile = ins.data;
    }

    writeCache(profile);
    return {
      id: user.id,
      email: user.email,
      username: profile.username,
      avatar: profile.avatar || DEFAULT_AVATAR,
      xp: profile.xp || 0,
      created_at: profile.created_at
    };
  }

  var getUser = wrap(getUserRaw);
  var getProfile = wrap(getProfileRaw);

  /* ---------- Регистрация, вход, выход ---------- */
  var signUp = wrap(async function (username, email, password) {
    if (!sb) throw new UserError(niceError(null));
    var name = checkName(username);
    var res = await sb.auth.signUp({
      email: String(email || '').trim(),
      password: password,
      options: { data: { username: name } }
    });
    if (res.error) throw res.error;
    // Если подтверждение почты выключено, сессия приходит сразу
    if (!res.data.session) return { needsConfirm: true };
    await getProfileRaw();
    return { needsConfirm: false };
  });

  var signIn = wrap(async function (email, password) {
    if (!sb) throw new UserError(niceError(null));
    var res = await sb.auth.signInWithPassword({
      email: String(email || '').trim(),
      password: password
    });
    if (res.error) throw res.error;
    await getProfileRaw();
  });

  var signOut = wrap(async function () {
    if (sb) await sb.auth.signOut();
    clearCache();
  });

  /* ---------- Смена имени и авы ---------- */
  var updateProfile = wrap(async function (fields) {
    var user = await getUserRaw();
    if (!user) throw new UserError('Please log in first.');

    var patch = {};
    if (typeof fields.username === 'string') patch.username = checkName(fields.username);
    if (fields.avatar) {
      if (AVATARS.indexOf(fields.avatar) === -1) throw new UserError('Please choose an avatar from the list.');
      patch.avatar = fields.avatar;
    }

    var res = await sb.from('profiles').update(patch).eq('id', user.id)
      .select('username, avatar').single();
    if (res.error) throw res.error;

    writeCache(res.data);
    applyHeader();
    return res.data;
  });

  /* ---------- Шапка сайта: имя и ава из профиля ---------- */
  function applyHeader() {
    var pill = document.querySelector('.header-profile') ||
               document.querySelector('.header-profile-sm');
    if (!pill) return;

    var cache = readCache();
    var avatarEl = pill.querySelector('.avatar, .avatar-sm');
    var nameEl = pill.querySelector('.user-name');
    var subEl = pill.querySelector('.greeting-sub');

    if (avatarEl) {
      avatarEl.textContent = cache ? (cache.avatar || DEFAULT_AVATAR) : DEFAULT_AVATAR;
      avatarEl.style.fontSize = '1.1rem';
      avatarEl.style.lineHeight = '1';
    }
    if (nameEl) nameEl.textContent = cache ? cache.username : 'Guest';
    if (subEl) subEl.textContent = cache ? 'Сәлем! 👋' : 'Log in →';

    pill.style.cursor = 'pointer';
    pill.setAttribute('role', 'link');
    pill.setAttribute('title', cache ? 'Open profile' : 'Log in');
    pill.onclick = function () {
      window.location.href = readCache() ? 'profile.html' : 'login.html';
    };
  }

  // Тихо проверяем сервер: вдруг вход уже закончился или имя поменяли с другого устройства
  async function syncHeader() {
    try {
      var user = await getUserRaw();
      if (!user) { clearCache(); applyHeader(); return; }
      await getProfileRaw();
      applyHeader();
    } catch (e) { /* нет сети: оставляем то, что в кеше */ }
  }

  function getCachedName() {
    var c = readCache();
    return c ? c.username : '';
  }

  function init() {
    applyHeader();
    syncHeader();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TilEM = {
    AVATARS: AVATARS,
    DEFAULT_AVATAR: DEFAULT_AVATAR,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    getUser: getUser,
    getProfile: getProfile,
    updateProfile: updateProfile,
    applyHeader: applyHeader,
    getCachedName: getCachedName
  };
})();
