const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
  document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
  document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
  document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
  document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
  document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f4f4f5');
}

const API = '';
let currentChild = null;
let children = [];
let activeSleep = null;
let sleepTimerInterval = null;

function getHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (tg?.initData) h['X-Telegram-Init-Data'] = tg.initData;
  return h;
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

// ==================== INIT ====================
async function init() {
  try {
    await api('/api/auth', { method: 'POST' });
    children = await api('/api/children');
    if (children.length === 0) {
      showScreen('onboarding');
    } else {
      currentChild = children[0];
      updateHeader();
      showScreen('home');
    }
  } catch (e) {
    console.error(e);
    // Dev mode fallback
    document.getElementById('app').innerHTML = `
      <div class="card p-4 text-center">
        <p class="mb-3">Ошибка авторизации. Для теста локально поставь DEV_MODE=1</p>
        <p class="text-sm text-[var(--tg-theme-hint-color)]">${e.message}</p>
      </div>`;
  }
}

function updateHeader() {
  if (!currentChild) return;
  document.getElementById('childName').textContent = currentChild.name;
  const months = currentChild.age_months || 0;
  document.getElementById('childAge').textContent = months < 12
    ? `${months} мес.`
    : `${Math.floor(months / 12)} г. ${months % 12} мес.`;
}

// ==================== SCREENS ====================
function showScreen(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('text-[var(--tg-theme-button-color)]'));
  const nav = document.querySelector(`[data-screen="${name}"]`);
  if (nav) nav.classList.add('text-[var(--tg-theme-button-color)]');

  const app = document.getElementById('app');
  if (name === 'onboarding') renderOnboarding(app);
  else if (name === 'home') renderHome(app);
  else if (name === 'track') renderTrack(app);
  else if (name === 'dev') renderDev(app);
  else if (name === 'stats') renderStats(app);
  else if (name === 'more') renderMore(app);
  else if (name === 'profile') renderProfile(app);
  else if (name === 'sleep') renderSleep(app);
  else if (name === 'feeding') renderFeeding(app);
  else if (name === 'diaper') renderDiaper(app);
  else if (name === 'rhymes') renderRhymes(app);
  else if (name === 'milestones') renderMilestones(app);
  else if (name === 'vaccines') renderVaccines(app);
  else if (name === 'doctor') renderDoctor(app);
  else if (name === 'measurements') renderMeasurements(app);
  else if (name === 'teeth') renderTeeth(app);
  else if (name === 'toys') renderToys(app);
  else if (name === 'walks') renderWalks(app);
  else if (name === 'baths') renderBaths(app);
  else if (name === 'foods') renderFoods(app);
  else if (name === 'illnesses') renderIllnesses(app);
  else if (name === 'faq') renderFaq(app);
  else if (name === 'photos') renderPhotos(app);
}

// ==================== ONBOARDING ====================
function renderOnboarding(el) {
  el.innerHTML = `
    <div class="card p-5 space-y-4">
      <h2 class="text-xl font-bold text-center">Добавим малыша 👶</h2>
      <div>
        <label class="text-sm text-[var(--tg-theme-hint-color)]">Имя</label>
        <input id="newName" class="w-full mt-1 p-3 rounded-xl border border-gray-300 bg-white" placeholder="Маша" />
      </div>
      <div>
        <label class="text-sm text-[var(--tg-theme-hint-color)]">Дата рождения</label>
        <input id="newBirth" type="date" class="w-full mt-1 p-3 rounded-xl border border-gray-300 bg-white" />
      </div>
      <div>
        <label class="text-sm text-[var(--tg-theme-hint-color)]">Пол</label>
        <select id="newGender" class="w-full mt-1 p-3 rounded-xl border border-gray-300 bg-white">
          <option value="">Не указан</option>
          <option value="girl">Девочка</option>
          <option value="boy">Мальчик</option>
        </select>
      </div>
      <button onclick="createChild()" class="btn-primary w-full py-3 rounded-xl font-semibold">Создать</button>
    </div>`;
}

async function createChild() {
  const name = document.getElementById('newName').value.trim();
  const birth_date = document.getElementById('newBirth').value;
  const gender = document.getElementById('newGender').value || null;
  if (!name || !birth_date) return alert('Заполни имя и дату рождения');
  try {
    currentChild = await api('/api/children', {
      method: 'POST',
      body: JSON.stringify({ name, birth_date, gender })
    });
    children = [currentChild];
    updateHeader();
    showScreen('home');
    tg?.HapticFeedback?.notificationOccurred('success');
  } catch (e) {
    alert(e.message);
  }
}

// ==================== HOME ====================
async function renderHome(el) {
  el.innerHTML = `<div class="text-center py-10">Загрузка...</div>`;
  try {
    const [sleeps, feedings, diapers] = await Promise.all([
      api(`/api/children/${currentChild.id}/sleeps`),
      api(`/api/children/${currentChild.id}/feedings`),
      api(`/api/children/${currentChild.id}/diapers`)
    ]);
    activeSleep = sleeps.find(s => s.is_active) || null;

    const lastFeed = feedings[0];
    const lastDiaper = diapers[0];

    el.innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        <button onclick="showScreen('sleep')" class="card p-4 text-left">
          <div class="text-2xl mb-1">💤</div>
          <div class="font-semibold">Сон</div>
          <div class="text-xs text-[var(--tg-theme-hint-color)] mt-1">
            ${activeSleep ? `<span class="timer text-green-600 font-bold" id="liveTimer">идёт...</span>` : 'Не спит'}
          </div>
        </button>
        <button onclick="showScreen('feeding')" class="card p-4 text-left">
          <div class="text-2xl mb-1">🍼</div>
          <div class="font-semibold">Кормление</div>
          <div class="text-xs text-[var(--tg-theme-hint-color)] mt-1">
            ${lastFeed ? timeAgo(lastFeed.time) : 'Нет записей'}
          </div>
        </button>
        <button onclick="showScreen('diaper')" class="card p-4 text-left">
          <div class="text-2xl mb-1">🧷</div>
          <div class="font-semibold">Подгузник</div>
          <div class="text-xs text-[var(--tg-theme-hint-color)] mt-1">
            ${lastDiaper ? timeAgo(lastDiaper.time) : 'Нет записей'}
          </div>
        </button>
        <button onclick="showScreen('walks')" class="card p-4 text-left">
          <div class="text-2xl mb-1">🚶</div>
          <div class="font-semibold">Прогулка</div>
          <div class="text-xs text-[var(--tg-theme-hint-color)] mt-1">Отметить</div>
        </button>
      </div>

      <div class="card p-4">
        <h3 class="font-semibold mb-3">Быстрые действия</h3>
        <div class="flex flex-wrap gap-2">
          <button onclick="quickDiaper('wet')" class="px-3 py-2 rounded-full bg-blue-100 text-blue-800 text-sm">💧 Мокрый</button>
          <button onclick="quickDiaper('dirty')" class="px-3 py-2 rounded-full bg-amber-100 text-amber-800 text-sm">💩 Грязный</button>
          <button onclick="quickDiaper('both')" class="px-3 py-2 rounded-full bg-purple-100 text-purple-800 text-sm">💧💩 Оба</button>
          <button onclick="showScreen('feeding')" class="px-3 py-2 rounded-full bg-pink-100 text-pink-800 text-sm">🍼 Кормление</button>
          <button onclick="showScreen('baths')" class="px-3 py-2 rounded-full bg-cyan-100 text-cyan-800 text-sm">🛁 Купание</button>
        </div>
      </div>

      <div class="card p-4">
        <h3 class="font-semibold mb-2">Сегодня</h3>
        <button onclick="showScreen('stats')" class="text-sm text-[var(--tg-theme-button-color)]">Смотреть статистику →</button>
      </div>`;

    if (activeSleep) startLiveTimer(activeSleep.start_time);
  } catch (e) {
    el.innerHTML = `<div class="card p-4 text-red-500">${e.message}</div>`;
  }
}

function timeAgo(iso) {
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  return d.toLocaleDateString('ru');
}

function startLiveTimer(startIso) {
  if (sleepTimerInterval) clearInterval(sleepTimerInterval);
  const start = new Date(startIso);
  const el = () => document.getElementById('liveTimer');
  const tick = () => {
    const node = el();
    if (!node) { clearInterval(sleepTimerInterval); return; }
    const sec = Math.floor((Date.now() - start) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    node.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  tick();
  sleepTimerInterval = setInterval(tick, 1000);
}

async function quickDiaper(type) {
  try {
    await api(`/api/children/${currentChild.id}/diapers`, {
      method: 'POST', body: JSON.stringify({ type })
    });
    tg?.HapticFeedback?.impactOccurred('light');
    showScreen('home');
  } catch (e) { alert(e.message); }
}

// ==================== TRACK MENU ====================
function renderTrack(el) {
  el.innerHTML = `
    <div class="space-y-2">
      ${trackItem('💤', 'Сон', 'sleep')}
      ${trackItem('🍼', 'Кормление', 'feeding')}
      ${trackItem('🧷', 'Подгузник', 'diaper')}
      ${trackItem('🚶', 'Прогулка', 'walks')}
      ${trackItem('🛁', 'Купание', 'baths')}
      ${trackItem('🥄', 'Прикорм', 'foods')}
      ${trackItem('📏', 'Рост и вес', 'measurements')}
    </div>`;
}

function trackItem(emoji, title, screen) {
  return `<button onclick="showScreen('${screen}')" class="card w-full p-4 flex items-center gap-3 text-left">
    <span class="text-2xl">${emoji}</span><span class="font-medium">${title}</span>
  </button>`;
}

// ==================== SLEEP ====================
async function renderSleep(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const sleeps = await api(`/api/children/${currentChild.id}/sleeps`);
  activeSleep = sleeps.find(s => s.is_active) || null;

  el.innerHTML = `
    <button onclick="showScreen('home')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-5 text-center mb-4">
      ${activeSleep ? `
        <div class="text-4xl font-bold timer mb-2" id="sleepTimerBig">00:00:00</div>
        <p class="text-sm text-[var(--tg-theme-hint-color)] mb-4">Сон идёт</p>
        <button onclick="endSleep(${activeSleep.id})" class="btn-primary px-8 py-3 rounded-xl font-semibold">Проснулся</button>
      ` : `
        <div class="text-4xl mb-3">😴</div>
        <p class="mb-4">Ребёнок не спит</p>
        <button onclick="startSleep()" class="btn-primary px-8 py-3 rounded-xl font-semibold">Начать сон</button>
      `}
    </div>
    <h3 class="font-semibold mb-2">Последние сны</h3>
    <div class="space-y-2">
      ${sleeps.filter(s => !s.is_active).slice(0, 10).map(s => `
        <div class="card p-3 flex justify-between text-sm">
          <span>${fmtTime(s.start_time)} – ${s.end_time ? fmtTime(s.end_time) : '...'}</span>
          <span class="font-medium">${s.duration_minutes ? s.duration_minutes + ' мин' : ''}</span>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет записей</p>'}
    </div>`;

  if (activeSleep) {
    const start = new Date(activeSleep.start_time);
    const tick = () => {
      const node = document.getElementById('sleepTimerBig');
      if (!node) return;
      const sec = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      node.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    };
    tick();
    if (sleepTimerInterval) clearInterval(sleepTimerInterval);
    sleepTimerInterval = setInterval(tick, 1000);
  }
}

async function startSleep() {
  await api(`/api/children/${currentChild.id}/sleeps/start`, { method: 'POST', body: '{}' });
  tg?.HapticFeedback?.notificationOccurred('success');
  showScreen('sleep');
}

async function endSleep(id) {
  await api(`/api/children/${currentChild.id}/sleeps/${id}/end`, { method: 'POST', body: '{}' });
  tg?.HapticFeedback?.notificationOccurred('success');
  showScreen('sleep');
}

// ==================== FEEDING ====================
async function renderFeeding(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/feedings`);
  el.innerHTML = `
    <button onclick="showScreen('track')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Новое кормление</h3>
      <div class="flex flex-wrap gap-2">
        <button onclick="addFeeding('breast')" class="px-4 py-2 rounded-full bg-pink-100 text-pink-800">🤱 Грудь</button>
        <button onclick="addFeeding('bottle')" class="px-4 py-2 rounded-full bg-blue-100 text-blue-800">🍼 Бутылочка</button>
        <button onclick="addFeeding('formula')" class="px-4 py-2 rounded-full bg-amber-100 text-amber-800">🥛 Смесь</button>
        <button onclick="addFeeding('solid')" class="px-4 py-2 rounded-full bg-green-100 text-green-800">🥄 Прикорм</button>
      </div>
      <div class="flex gap-2">
        <input id="feedMl" type="number" placeholder="мл" class="w-24 p-2 rounded-lg border" />
        <input id="feedNote" placeholder="Заметка" class="flex-1 p-2 rounded-lg border" />
      </div>
    </div>
    <h3 class="font-semibold mb-2">История</h3>
    <div class="space-y-2">
      ${list.slice(0, 15).map(f => `
        <div class="card p-3 text-sm flex justify-between">
          <span>${typeLabel(f.type)} ${f.amount_ml ? f.amount_ml + ' мл' : ''}</span>
          <span class="text-[var(--tg-theme-hint-color)]">${fmtDateTime(f.time)}</span>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пусто</p>'}
    </div>`;
}

function typeLabel(t) {
  return { breast: '🤱 Грудь', bottle: '🍼 Бутылочка', formula: '🥛 Смесь', solid: '🥄 Прикорм' }[t] || t;
}

async function addFeeding(type) {
  const amount_ml = parseInt(document.getElementById('feedMl')?.value) || null;
  const note = document.getElementById('feedNote')?.value || null;
  await api(`/api/children/${currentChild.id}/feedings`, {
    method: 'POST', body: JSON.stringify({ type, amount_ml, note })
  });
  tg?.HapticFeedback?.impactOccurred('light');
  showScreen('feeding');
}

// ==================== DIAPER ====================
async function renderDiaper(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/diapers`);
  el.innerHTML = `
    <button onclick="showScreen('track')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Смена подгузника</h3>
      <div class="flex gap-2 justify-center">
        <button onclick="addDiaper('wet')" class="px-5 py-3 rounded-xl bg-blue-100 text-blue-800 font-medium">💧 Мокрый</button>
        <button onclick="addDiaper('dirty')" class="px-5 py-3 rounded-xl bg-amber-100 text-amber-800 font-medium">💩 Грязный</button>
        <button onclick="addDiaper('both')" class="px-5 py-3 rounded-xl bg-purple-100 text-purple-800 font-medium">Оба</button>
      </div>
    </div>
    <h3 class="font-semibold mb-2">История</h3>
    <div class="space-y-2">
      ${list.slice(0, 15).map(d => `
        <div class="card p-3 text-sm flex justify-between">
          <span>${d.type === 'wet' ? '💧' : d.type === 'dirty' ? '💩' : '💧💩'}</span>
          <span class="text-[var(--tg-theme-hint-color)]">${fmtDateTime(d.time)}</span>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пусто</p>'}
    </div>`;
}

async function addDiaper(type) {
  await api(`/api/children/${currentChild.id}/diapers`, { method: 'POST', body: JSON.stringify({ type }) });
  tg?.HapticFeedback?.impactOccurred('light');
  showScreen('diaper');
}

// ==================== DEVELOPMENT ====================
function renderDev(el) {
  el.innerHTML = `
    <div class="space-y-2">
      ${trackItem('🧠', 'Навыки и вехи', 'milestones')}
      ${trackItem('📏', 'Рост и вес', 'measurements')}
      ${trackItem('🦷', 'Зубы', 'teeth')}
      ${trackItem('🧸', 'Любимые игрушки', 'toys')}
      ${trackItem('💉', 'Прививки', 'vaccines')}
      ${trackItem('🏥', 'Приёмы врача', 'doctor')}
      ${trackItem('🤒', 'Болезни', 'illnesses')}
    </div>`;
}

// ==================== MILESTONES ====================
async function renderMilestones(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/milestones`);
  const byMonth = {};
  list.forEach(m => {
    if (!byMonth[m.month]) byMonth[m.month] = [];
    byMonth[m.month].push(m);
  });
  const months = Object.keys(byMonth).map(Number).sort((a, b) => a - b);

  el.innerHTML = `
    <button onclick="showScreen('dev')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <h2 class="text-lg font-bold mb-3">Вехи развития</h2>
    <div class="space-y-4">
      ${months.map(month => `
        <div class="card p-4">
          <h3 class="font-semibold mb-2">${month === 0 ? 'Новорождённый' : month + ' мес.'}</h3>
          <div class="space-y-2">
            ${byMonth[month].map(m => `
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" ${m.achieved ? 'checked' : ''} 
                  onchange="toggleMilestone(${m.id}, this.checked)" 
                  class="mt-1 w-5 h-5 accent-[var(--tg-theme-button-color)]" />
                <span class="text-sm ${m.achieved ? 'line-through opacity-60' : ''}">${m.skill}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>`;
}

async function toggleMilestone(id, achieved) {
  await api(`/api/children/${currentChild.id}/milestones/${id}`, {
    method: 'PATCH', body: JSON.stringify({ achieved })
  });
  tg?.HapticFeedback?.selectionChanged();
}

// ==================== MEASUREMENTS ====================
async function renderMeasurements(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/measurements`);
  el.innerHTML = `
    <button onclick="showScreen('dev')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Новое измерение</h3>
      <div class="grid grid-cols-3 gap-2">
        <input id="mWeight" type="number" step="0.1" placeholder="Вес кг" class="p-2 rounded-lg border" />
        <input id="mHeight" type="number" step="0.1" placeholder="Рост см" class="p-2 rounded-lg border" />
        <input id="mHead" type="number" step="0.1" placeholder="Голова см" class="p-2 rounded-lg border" />
      </div>
      <button onclick="addMeasurement()" class="btn-primary w-full py-2 rounded-xl">Сохранить</button>
    </div>
    <div class="space-y-2">
      ${list.map(m => `
        <div class="card p-3 text-sm">
          <div class="font-medium">${m.date}</div>
          <div class="text-[var(--tg-theme-hint-color)]">
            ${m.weight_kg ? m.weight_kg + ' кг' : ''} 
            ${m.height_cm ? '• ' + m.height_cm + ' см' : ''}
            ${m.head_cm ? '• голова ' + m.head_cm + ' см' : ''}
          </div>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет измерений</p>'}
    </div>`;
}

async function addMeasurement() {
  const weight_kg = parseFloat(document.getElementById('mWeight').value) || null;
  const height_cm = parseFloat(document.getElementById('mHeight').value) || null;
  const head_cm = parseFloat(document.getElementById('mHead').value) || null;
  await api(`/api/children/${currentChild.id}/measurements`, {
    method: 'POST', body: JSON.stringify({ weight_kg, height_cm, head_cm })
  });
  showScreen('measurements');
}

// ==================== VACCINES ====================
async function renderVaccines(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/vaccines`);
  el.innerHTML = `
    <button onclick="showScreen('dev')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Добавить прививку</h3>
      <input id="vName" placeholder="Название (АКДС, Полио и т.д.)" class="w-full p-2 rounded-lg border" />
      <input id="vDate" type="date" class="w-full p-2 rounded-lg border" />
      <button onclick="addVaccine()" class="btn-primary w-full py-2 rounded-xl">Сохранить</button>
    </div>
    <div class="space-y-2">
      ${list.map(v => `
        <div class="card p-3 text-sm">
          <div class="font-medium">${v.name}</div>
          <div class="text-[var(--tg-theme-hint-color)]">${v.date}${v.next_date ? ' → след. ' + v.next_date : ''}</div>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет прививок</p>'}
    </div>`;
}

async function addVaccine() {
  const name = document.getElementById('vName').value.trim();
  const date = document.getElementById('vDate').value;
  if (!name || !date) return alert('Заполни название и дату');
  await api(`/api/children/${currentChild.id}/vaccines`, {
    method: 'POST', body: JSON.stringify({ name, date })
  });
  showScreen('vaccines');
}

// ==================== DOCTOR ====================
async function renderDoctor(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/doctor-visits`);
  el.innerHTML = `
    <button onclick="showScreen('dev')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Новый приём</h3>
      <input id="dType" placeholder="Врач (педиатр, невролог...)" class="w-full p-2 rounded-lg border" />
      <input id="dDate" type="date" class="w-full p-2 rounded-lg border" />
      <input id="dReason" placeholder="Причина / диагноз" class="w-full p-2 rounded-lg border" />
      <button onclick="addDoctor()" class="btn-primary w-full py-2 rounded-xl">Сохранить</button>
    </div>
    <div class="space-y-2">
      ${list.map(v => `
        <div class="card p-3 text-sm">
          <div class="font-medium">${v.doctor_type} — ${v.date}</div>
          <div class="text-[var(--tg-theme-hint-color)]">${v.reason || v.diagnosis || ''}</div>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет приёмов</p>'}
    </div>`;
}

async function addDoctor() {
  const doctor_type = document.getElementById('dType').value.trim();
  const date = document.getElementById('dDate').value;
  const reason = document.getElementById('dReason').value.trim() || null;
  if (!doctor_type || !date) return alert('Заполни врача и дату');
  await api(`/api/children/${currentChild.id}/doctor-visits`, {
    method: 'POST', body: JSON.stringify({ doctor_type, date, reason })
  });
  showScreen('doctor');
}

// ==================== TEETH ====================
async function renderTeeth(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/teeth`);
  el.innerHTML = `
    <button onclick="showScreen('dev')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Новый зуб</h3>
      <input id="tName" placeholder="Например: нижний центральный резец" class="w-full p-2 rounded-lg border" />
      <input id="tDate" type="date" class="w-full p-2 rounded-lg border" />
      <button onclick="addTooth()" class="btn-primary w-full py-2 rounded-xl">Сохранить</button>
    </div>
    <div class="space-y-2">
      ${list.map(t => `
        <div class="card p-3 text-sm flex justify-between">
          <span>🦷 ${t.tooth_name}</span>
          <span class="text-[var(--tg-theme-hint-color)]">${t.date}</span>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Зубов пока нет</p>'}
    </div>`;
}

async function addTooth() {
  const tooth_name = document.getElementById('tName').value.trim();
  const date = document.getElementById('tDate').value;
  if (!tooth_name || !date) return alert('Заполни');
  await api(`/api/children/${currentChild.id}/teeth`, {
    method: 'POST', body: JSON.stringify({ tooth_name, date })
  });
  showScreen('teeth');
}

// ==================== TOYS ====================
async function renderToys(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/toys`);
  el.innerHTML = `
    <button onclick="showScreen('dev')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Добавить игрушку</h3>
      <input id="toyName" placeholder="Название" class="w-full p-2 rounded-lg border" />
      <div class="flex gap-2">
        <input id="toyFrom" type="number" placeholder="с мес." class="w-24 p-2 rounded-lg border" />
        <input id="toyTo" type="number" placeholder="до мес." class="w-24 p-2 rounded-lg border" />
      </div>
      <button onclick="addToy()" class="btn-primary w-full py-2 rounded-xl">Сохранить</button>
    </div>
    <div class="space-y-2">
      ${list.map(t => `
        <div class="card p-3 text-sm">
          <div class="font-medium">${t.favorite ? '⭐ ' : ''}🧸 ${t.name}</div>
          <div class="text-[var(--tg-theme-hint-color)]">${t.age_from_months}${t.age_to_months ? '–' + t.age_to_months : '+'} мес.</div>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет игрушек</p>'}
    </div>`;
}

async function addToy() {
  const name = document.getElementById('toyName').value.trim();
  const age_from_months = parseInt(document.getElementById('toyFrom').value) || 0;
  const age_to_months = parseInt(document.getElementById('toyTo').value) || null;
  if (!name) return alert('Название обязательно');
  await api(`/api/children/${currentChild.id}/toys`, {
    method: 'POST', body: JSON.stringify({ name, age_from_months, age_to_months })
  });
  showScreen('toys');
}

// ==================== WALKS ====================
async function renderWalks(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/walks`);
  const active = list.find(w => !w.end_time);
  el.innerHTML = `
    <button onclick="showScreen('track')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-5 text-center mb-4">
      ${active ? `
        <p class="mb-3">Прогулка идёт с ${fmtTime(active.start_time)}</p>
        <button onclick="endWalk(${active.id})" class="btn-primary px-6 py-3 rounded-xl">Завершить</button>
      ` : `
        <button onclick="startWalk()" class="btn-primary px-6 py-3 rounded-xl">🚶 Начать прогулку</button>
      `}
    </div>
    <div class="space-y-2">
      ${list.filter(w => w.end_time).slice(0, 10).map(w => `
        <div class="card p-3 text-sm flex justify-between">
          <span>${fmtDateTime(w.start_time)}</span>
          <span>${w.duration_minutes || 0} мин</span>
        </div>
      `).join('')}
    </div>`;
}

async function startWalk() {
  await api(`/api/children/${currentChild.id}/walks/start`, { method: 'POST', body: '{}' });
  showScreen('walks');
}
async function endWalk(id) {
  await api(`/api/children/${currentChild.id}/walks/${id}/end`, { method: 'POST', body: '{}' });
  showScreen('walks');
}

// ==================== BATHS ====================
async function renderBaths(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/baths`);
  el.innerHTML = `
    <button onclick="showScreen('track')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Купание</h3>
      <div class="flex gap-2">
        <input id="bathDur" type="number" placeholder="мин" class="w-24 p-2 rounded-lg border" />
        <input id="bathTemp" type="number" step="0.1" placeholder="°C" class="w-24 p-2 rounded-lg border" />
      </div>
      <button onclick="addBath()" class="btn-primary w-full py-2 rounded-xl">🛁 Отметить купание</button>
    </div>
    <div class="space-y-2">
      ${list.slice(0, 10).map(b => `
        <div class="card p-3 text-sm flex justify-between">
          <span>${fmtDateTime(b.time)}</span>
          <span>${b.duration_minutes || ''} мин ${b.temperature ? b.temperature + '°' : ''}</span>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет</p>'}
    </div>`;
}

async function addBath() {
  const duration_minutes = parseInt(document.getElementById('bathDur').value) || null;
  const temperature = parseFloat(document.getElementById('bathTemp').value) || null;
  await api(`/api/children/${currentChild.id}/baths`, {
    method: 'POST', body: JSON.stringify({ duration_minutes, temperature })
  });
  showScreen('baths');
}

// ==================== FOODS ====================
async function renderFoods(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/foods`);
  el.innerHTML = `
    <button onclick="showScreen('track')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Новый продукт</h3>
      <input id="foodProduct" placeholder="Что дали (кабачок, яблоко...)" class="w-full p-2 rounded-lg border" />
      <input id="foodAmount" placeholder="Количество" class="w-full p-2 rounded-lg border" />
      <input id="foodReaction" placeholder="Реакция (если была)" class="w-full p-2 rounded-lg border" />
      <button onclick="addFood()" class="btn-primary w-full py-2 rounded-xl">Сохранить</button>
    </div>
    <div class="space-y-2">
      ${list.slice(0, 15).map(f => `
        <div class="card p-3 text-sm">
          <div class="font-medium">${f.product} ${f.amount || ''}</div>
          <div class="text-[var(--tg-theme-hint-color)]">${f.date}${f.reaction ? ' • ' + f.reaction : ''}</div>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет</p>'}
    </div>`;
}

async function addFood() {
  const product = document.getElementById('foodProduct').value.trim();
  const amount = document.getElementById('foodAmount').value.trim() || null;
  const reaction = document.getElementById('foodReaction').value.trim() || null;
  if (!product) return alert('Укажи продукт');
  await api(`/api/children/${currentChild.id}/foods`, {
    method: 'POST', body: JSON.stringify({ product, amount, reaction })
  });
  showScreen('foods');
}

// ==================== ILLNESSES ====================
async function renderIllnesses(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/illnesses`);
  el.innerHTML = `
    <button onclick="showScreen('dev')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Болезнь</h3>
      <input id="illName" placeholder="Название / диагноз" class="w-full p-2 rounded-lg border" />
      <input id="illStart" type="date" class="w-full p-2 rounded-lg border" />
      <input id="illSymptoms" placeholder="Симптомы" class="w-full p-2 rounded-lg border" />
      <button onclick="addIllness()" class="btn-primary w-full py-2 rounded-xl">Сохранить</button>
    </div>
    <div class="space-y-2">
      ${list.map(i => `
        <div class="card p-3 text-sm">
          <div class="font-medium">${i.name}</div>
          <div class="text-[var(--tg-theme-hint-color)]">${i.start_date}${i.end_date ? ' – ' + i.end_date : ''}</div>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)]">Пока нет</p>'}
    </div>`;
}

async function addIllness() {
  const name = document.getElementById('illName').value.trim();
  const start_date = document.getElementById('illStart').value;
  const symptoms = document.getElementById('illSymptoms').value.trim() || null;
  if (!name || !start_date) return alert('Заполни');
  await api(`/api/children/${currentChild.id}/illnesses`, {
    method: 'POST', body: JSON.stringify({ name, start_date, symptoms })
  });
  showScreen('illnesses');
}

// ==================== RHYMES ====================
async function renderRhymes(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/rhymes?child_id=${currentChild.id}`);
  const cats = {};
  list.forEach(r => {
    if (!cats[r.category]) cats[r.category] = [];
    cats[r.category].push(r);
  });
  const catNames = { sleep: '💤 Сон', bath: '🛁 Купание', feed: '🍼 Кормление', walk: '🚶 Прогулка', general: '🎵 Общие' };

  el.innerHTML = `
    <button onclick="showScreen('more')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Добавить свой стишок</h3>
      <select id="rCat" class="w-full p-2 rounded-lg border">
        <option value="sleep">Сон</option>
        <option value="bath">Купание</option>
        <option value="feed">Кормление</option>
        <option value="walk">Прогулка</option>
        <option value="general">Общее</option>
      </select>
      <input id="rTitle" placeholder="Название" class="w-full p-2 rounded-lg border" />
      <textarea id="rText" placeholder="Текст стишка" class="w-full p-2 rounded-lg border h-24"></textarea>
      <button onclick="addRhyme()" class="btn-primary w-full py-2 rounded-xl">Добавить</button>
    </div>
    ${Object.keys(cats).map(cat => `
      <div class="mb-4">
        <h3 class="font-semibold mb-2">${catNames[cat] || cat}</h3>
        <div class="space-y-2">
          ${cats[cat].map(r => `
            <div class="card p-3">
              <div class="font-medium text-sm mb-1">${r.title}</div>
              <pre class="text-xs whitespace-pre-wrap text-[var(--tg-theme-hint-color)]">${r.text}</pre>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}`;
}

async function addRhyme() {
  const category = document.getElementById('rCat').value;
  const title = document.getElementById('rTitle').value.trim();
  const text = document.getElementById('rText').value.trim();
  if (!title || !text) return alert('Заполни');
  await api(`/api/children/${currentChild.id}/rhymes`, {
    method: 'POST', body: JSON.stringify({ category, title, text })
  });
  showScreen('rhymes');
}

// ==================== STATS ====================
async function renderStats(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const day = await api(`/api/children/${currentChild.id}/stats/day`);
  const week = await api(`/api/children/${currentChild.id}/stats/week`);

  el.innerHTML = `
    <h2 class="text-lg font-bold mb-3">Статистика</h2>
    <div class="card p-4 mb-4">
      <h3 class="font-semibold mb-3">Сегодня (${day.date})</h3>
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div>💤 Сон: <b>${Math.floor(day.sleep_total_minutes/60)}ч ${day.sleep_total_minutes%60}м</b> (${day.sleep_count})</div>
        <div>🍼 Кормлений: <b>${day.feeding_count}</b></div>
        <div>🧷 Подгузников: <b>${day.diaper_count}</b></div>
        <div>🚶 Прогулка: <b>${day.walk_total_minutes} мин</b></div>
        <div>🛁 Купаний: <b>${day.bath_count}</b></div>
      </div>
      <div class="mt-4 p-3 bg-amber-50 rounded-xl text-sm">
        <div class="font-medium mb-1">💡 Рекомендации:</div>
        ${day.recommendations.map(r => `<p>• ${r}</p>`).join('')}
      </div>
    </div>
    <div class="card p-4">
      <h3 class="font-semibold mb-2">За неделю</h3>
      <p class="text-sm mb-2">${week.recommendation}</p>
      <p class="text-sm text-[var(--tg-theme-hint-color)]">Всего кормлений: ${week.total_feedings}</p>
    </div>`;
}

// ==================== MORE ====================
function renderMore(el) {
  el.innerHTML = `
    <div class="space-y-2">
      ${trackItem('🎵', 'Стишки и песни', 'rhymes')}
      ${trackItem('❓', 'Частые вопросы (FAQ)', 'faq')}
      ${trackItem('📷', 'Ежемесячные фото', 'photos')}
      ${trackItem('👶', 'Профиль ребёнка', 'profile')}
    </div>`;
}

// ==================== FAQ ====================
async function renderFaq(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api('/api/faq');
  el.innerHTML = `
    <button onclick="showScreen('more')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <h2 class="text-lg font-bold mb-3">Частые вопросы</h2>
    <div class="space-y-3">
      ${list.map(f => `
        <div class="card p-4">
          <div class="font-medium mb-1">${f.q}</div>
          <div class="text-sm text-[var(--tg-theme-hint-color)]">${f.a}</div>
        </div>
      `).join('')}
    </div>`;
}

// ==================== PHOTOS ====================
async function renderPhotos(el) {
  el.innerHTML = `<div class="text-center py-8">Загрузка...</div>`;
  const list = await api(`/api/children/${currentChild.id}/photos`);
  el.innerHTML = `
    <button onclick="showScreen('more')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-4 space-y-3 mb-4">
      <h3 class="font-semibold">Загрузить фото</h3>
      <input id="photoMonth" type="number" placeholder="Месяц возраста" class="w-full p-2 rounded-lg border" />
      <input id="photoFile" type="file" accept="image/*" class="w-full" />
      <button onclick="uploadPhoto()" class="btn-primary w-full py-2 rounded-xl">Загрузить</button>
    </div>
    <div class="grid grid-cols-2 gap-3">
      ${list.map(p => `
        <div class="card overflow-hidden">
          <img src="${p.url}" class="w-full h-32 object-cover" />
          <div class="p-2 text-xs">${p.month} мес. ${p.caption || ''}</div>
        </div>
      `).join('') || '<p class="text-sm text-[var(--tg-theme-hint-color)] col-span-2">Пока нет фото</p>'}
    </div>`;
}

async function uploadPhoto() {
  const month = parseInt(document.getElementById('photoMonth').value);
  const fileInput = document.getElementById('photoFile');
  if (!month || !fileInput.files[0]) return alert('Выбери месяц и файл');
  const fd = new FormData();
  fd.append('month', month);
  fd.append('file', fileInput.files[0]);
  const headers = {};
  if (tg?.initData) headers['X-Telegram-Init-Data'] = tg.initData;
  await fetch(`/api/children/${currentChild.id}/photos`, { method: 'POST', headers, body: fd });
  showScreen('photos');
}

// ==================== PROFILE ====================
function renderProfile(el) {
  el.innerHTML = `
    <button onclick="showScreen('home')" class="text-sm text-[var(--tg-theme-hint-color)] mb-3">← Назад</button>
    <div class="card p-5 text-center">
      <div class="text-5xl mb-3">👶</div>
      <h2 class="text-xl font-bold">${currentChild.name}</h2>
      <p class="text-[var(--tg-theme-hint-color)] mt-1">
        ${currentChild.birth_date} • ${currentChild.age_months || 0} мес.
      </p>
      <p class="text-sm mt-3">${currentChild.gender === 'girl' ? 'Девочка' : currentChild.gender === 'boy' ? 'Мальчик' : ''}</p>
      ${currentChild.notes ? `<p class="text-sm mt-2">${currentChild.notes}</p>` : ''}
    </div>
    <button onclick="showScreen('onboarding')" class="mt-4 w-full card p-3 text-center text-sm">
      + Добавить другого ребёнка
    </button>`;
}

// ==================== HELPERS ====================
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
}
function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' }) + ' ' + fmtTime(iso);
}

// Start
init();
