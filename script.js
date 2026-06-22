// script.js
// Word flashcard app behavior: load/save words, display card, manage page, auto-fill via dictionary API

const STORAGE_KEY = 'flash_words_v1';

const elements = {
  flashcard: document.getElementById('flashcard'),
  cardWord: document.getElementById('card-word'),
  cardTranslation: document.getElementById('card-translation'),
  cardPos: document.getElementById('card-pos'),
  cardExample: document.getElementById('card-example'),
  cardRoot: document.getElementById('card-root'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  progress: document.getElementById('progress'),
  statsText: document.getElementById('stats-text'),
  pages: document.querySelectorAll('.nav-btn'),
  studyPage: document.getElementById('study-page'),
  managePage: document.getElementById('manage-page'),
  wordForm: document.getElementById('word-form'),
  wordInput: document.getElementById('word-input'),
  translationInput: document.getElementById('translation-input'),
  posInput: document.getElementById('pos-input'),
  exampleInput: document.getElementById('example-input'),
  rootInput: document.getElementById('root-input'),
  btnAutoFill: document.getElementById('btn-auto-fill'),
  wordList: document.getElementById('word-list'),
  toast: document.getElementById('toast')
};

// Seed five words if none exist
const seedWords = [
  {
    id: genId(),
    word: 'abundant',
    translation: '豐富的；大量的',
    pos: 'adj.',
    example: 'The region is abundant in natural resources.',
    root: '来自拉丁語 「ab-」(away) + 「und」(波動) -> 豐盈流動',
  },
  {
    id: genId(),
    word: 'benevolent',
    translation: '仁慈的；慈善的',
    pos: 'adj.',
    example: 'A benevolent person donated to the shelter.',
    root: '來自拉丁語「bene」(good) + 「vol」(wish)',
  },
  {
    id: genId(),
    word: 'candid',
    translation: '坦率的；直言不諱的',
    pos: 'adj.',
    example: 'She gave a candid interview about her career.',
    root: '源自拉丁語「candidus」(白淨、真誠)',
  },
  {
    id: genId(),
    word: 'diligent',
    translation: '勤勉的；用功的',
    pos: 'adj.',
    example: 'He is a diligent student who always completes his work.',
    root: '來自拉丁語「diligere」(to value, to love) -> 勤勉',
  },
  {
    id: genId(),
    word: 'eloquent',
    translation: '有口才的；雄辯的',
    pos: 'adj.',
    example: 'Her speech was eloquent and persuasive.',
    root: '源自拉丁語「eloquentia」(speech)'
  }
];

let words = [];
let currentIndex = 0;

// Helpers
function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function loadWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load words', e);
    return null;
  }
}

function showToast(msg, ms = 2500) {
  if (!elements.toast) return;
  elements.toast.textContent = msg;
  elements.toast.classList.add('opacity-100');
  elements.toast.style.display = 'block';
  setTimeout(() => {
    elements.toast.style.display = 'none';
  }, ms);
}

// UI Rendering
function renderCard() {
  if (!words.length) {
    elements.cardWord.textContent = 'No words';
    elements.cardTranslation.textContent = '請先在管理頁新增單字';
    elements.cardPos.textContent = '';
    elements.cardExample.textContent = '';
    elements.cardRoot.textContent = '';
    elements.progress.textContent = '0 / 0';
    elements.statsText.textContent = '尚未載入任何單字';
    return;
  }

  const w = words[currentIndex];
  elements.cardWord.textContent = w.word;
  elements.cardTranslation.textContent = w.translation || '';
  elements.cardPos.textContent = w.pos ? `詞性：${w.pos}` : '';
  elements.cardExample.textContent = w.example || '';
  elements.cardRoot.textContent = w.root || '';
  elements.progress.textContent = `${currentIndex + 1} / ${words.length}`;
  elements.statsText.textContent = `共 ${words.length} 個單字`;
}

function renderWordList() {
  elements.wordList.innerHTML = '';
  if (!words.length) {
    const p = document.createElement('p');
    p.className = 'text-center text-muted';
    p.textContent = '單字列表會在這裡顯示';
    elements.wordList.appendChild(p);
    return;
  }

  const ul = document.createElement('div');
  ul.className = 'space-y-2';

  words.forEach((w, idx) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between p-2 rounded-md bg-surface-2';

    const left = document.createElement('div');
    left.innerHTML = `
      <div class="text-sm font-medium">${escapeHtml(w.word)}</div>
      <div class="text-xs text-muted">${escapeHtml(w.translation || '')}</div>
    `;

    const right = document.createElement('div');
    right.className = 'flex items-center gap-2';

    const btnUse = document.createElement('button');
    btnUse.className = 'px-2 py-1 text-xs rounded bg-accent text-black';
    btnUse.textContent = '使用';
    btnUse.addEventListener('click', () => {
      currentIndex = idx;
      switchToPage('study');
      renderCard();
      // ensure card face is front
      elements.flashcard.classList.remove('is-flipped');
    });

    const btnDel = document.createElement('button');
    btnDel.className = 'px-2 py-1 text-xs rounded bg-transparent border border-glow text-muted';
    btnDel.textContent = '刪除';
    btnDel.addEventListener('click', () => {
      if (!confirm(`確定要刪除「${w.word}」嗎？`)) return;
      words.splice(idx, 1);
      if (currentIndex >= words.length) currentIndex = Math.max(0, words.length - 1);
      saveWords();
      renderWordList();
      renderCard();
    });

    right.appendChild(btnUse);
    right.appendChild(btnDel);

    row.appendChild(left);
    row.appendChild(right);
    ul.appendChild(row);
  });

  elements.wordList.appendChild(ul);
}

function escapeHtml(s){
  if (!s) return '';
  return s.replace(/[&<>"']/g, function(c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
  });
}

// Page switch
function switchToPage(page) {
  elements.pages.forEach(b => b.classList.remove('active'));
  const btn = Array.from(elements.pages).find(b => b.dataset.page === page);
  if (btn) btn.classList.add('active');

  if (page === 'study') {
    elements.studyPage.style.display = '';
    elements.managePage.style.display = 'none';
  } else {
    elements.studyPage.style.display = 'none';
    elements.managePage.style.display = '';
  }
}

// Events
function setupEvents() {
  // flip card on click
  elements.flashcard.addEventListener('click', (e) => {
    // ignore clicks on buttons inside the card if any
    if (e.target.tagName.toLowerCase() === 'button') return;
    elements.flashcard.classList.toggle('is-flipped');
  });

  elements.btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!words.length) return;
    currentIndex = (currentIndex + 1) % words.length;
    elements.flashcard.classList.remove('is-flipped');
    renderCard();
  });

  elements.btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!words.length) return;
    currentIndex = (currentIndex - 1 + words.length) % words.length;
    elements.flashcard.classList.remove('is-flipped');
    renderCard();
  });

  // nav buttons
  elements.pages.forEach(btn => {
    btn.addEventListener('click', () => {
      switchToPage(btn.dataset.page);
    });
  });

  // form submit
  elements.wordForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const w = elements.wordInput.value.trim();
    if (!w) return alert('請輸入單字');
    const entry = {
      id: genId(),
      word: w,
      translation: elements.translationInput.value.trim(),
      pos: elements.posInput.value.trim(),
      example: elements.exampleInput.value.trim(),
      root: elements.rootInput.value.trim()
    };
    words.push(entry);
    saveWords();
    renderWordList();
    showToast('已新增單字');
    elements.wordForm.reset();
  });

  // auto-fill button
  elements.btnAutoFill.addEventListener('click', async () => {
    const w = elements.wordInput.value.trim();
    if (!w) return alert('請先輸入要自動填入的英文單字');
    elements.btnAutoFill.disabled = true;
    elements.btnAutoFill.textContent = '取得中...';
    try {
      const data = await fetchDictionary(w);
      if (!data) {
        showToast('找不到該單字的自動資料');
        return;
      }
      // fill fields if available
      if (data.translation) elements.translationInput.value = data.translation;
      if (data.pos) elements.posInput.value = data.pos;
      if (data.example) elements.exampleInput.value = data.example;
      if (data.root) elements.rootInput.value = data.root;
      showToast('自動填入完成');
    } catch (err) {
      console.error(err);
      showToast('自動填入失敗');
    } finally {
      elements.btnAutoFill.disabled = false;
      elements.btnAutoFill.textContent = '自動填入';
    }
  });
}

// Simple dictionary fetch using dictionaryapi.dev and heuristics
async function fetchDictionary(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) return null;
    const entry = json[0];
    // try to extract a Chinese translation from meanings definitions if available (dictionaryapi.dev is english-only)
    const pos = entry.meanings && entry.meanings[0] && entry.meanings[0].partOfSpeech;
    const definitions = entry.meanings && entry.meanings[0] && entry.meanings[0].definitions;
    const def = definitions && definitions[0] && definitions[0].definition;
    const example = definitions && definitions[0] && definitions[0].example;

    // translation: if no Chinese available, keep English definition as fallback
    const translation = def || '';

    // root/etymology might be in entry.origin
    const root = entry.origin || '';

    return {
      pos: pos || '',
      translation: translation,
      example: example || '',
      root: root || ''
    };
  } catch (e) {
    console.error('fetchDictionary error', e);
    return null;
  }
}

// Init
(function init(){
  const stored = loadWords();
  if (stored && Array.isArray(stored) && stored.length) {
    words = stored;
  } else {
    words = seedWords.slice();
    saveWords();
  }

  // ensure currentIndex is valid
  if (currentIndex >= words.length) currentIndex = 0;

  setupEvents();
  renderWordList();
  renderCard();
})();
