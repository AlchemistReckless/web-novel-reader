// UI module
// ---------
// This module connects:
//   - the data (chapters)
//   - the state (which chapter, font size, bookmarks)
//   - the DOM (the actual HTML on the page)
//
// It contains all the DOM queries, render helpers, and
// event handlers. This keeps index.html very small: it only
// needs to load this module.

import { chapters } from './data.js';
import { state, setCurrentChapterIndex, setFontSize, setBookmarks } from './state.js';

// DOM references: we read elements once at startup and
// reuse the references so the rest of the code is simpler.

const chapterTitleEl = document.getElementById('chapter-title');
const chapterContentEl = document.getElementById('content');
const chapterSelectEl = document.getElementById('chapter-select');
const progressFillEl = document.getElementById('progress-fill');
const statusMessageEl = document.getElementById('status-message');
const bookmarkListEl = document.getElementById('bookmark-list');

const increaseBtn = document.getElementById('increase-font');
const decreaseBtn = document.getElementById('decrease-font');
const toggleThemeBtn = document.getElementById('toggle-theme');
const prevBtn = document.getElementById('prev-chapter');
const nextBtn = document.getElementById('next-chapter');
const saveBookmarkBtn = document.getElementById('save-bookmark');

// Rendering helpers

function renderChapterSelect() {
  chapterSelectEl.innerHTML = '';

  chapters.forEach((chapter, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = chapter.title;
    chapterSelectEl.appendChild(option);
  });

  chapterSelectEl.value = String(state.currentChapterIndex);
}

function renderChapter() {
  const chapter = chapters[state.currentChapterIndex];
  if (!chapter) {
    return;
  }

  chapterTitleEl.textContent = chapter.title;
  chapterContentEl.innerHTML = chapter.content
    .map((paragraph, idx) => `<p id="para-${idx}">${paragraph}</p>`)
    .join('');
  chapterSelectEl.value = String(state.currentChapterIndex);

  // Persist the current chapter index through the state helper.
  setCurrentChapterIndex(state.currentChapterIndex);

  // Reset to top when user changes chapter manually.
  window.scrollTo({ top: 0, behavior: 'auto' });
  updateProgressBar();
}

function renderBookmarks() {
  bookmarkListEl.innerHTML = '';

  if (!state.bookmarks.length) {
    bookmarkListEl.textContent = 'No bookmarks yet.';
    return;
  }

  // Newest bookmark first.
  [...state.bookmarks].reverse().forEach((bookmark) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'bookmark-item';
    item.textContent = `${bookmark.chapterTitle} • ${bookmark.percent}%`;
    item.addEventListener('click', () => goToBookmark(bookmark.id));
    bookmarkListEl.appendChild(item);
  });
}

function setStatus(message) {
  statusMessageEl.textContent = message;
}

// Progress helpers

function getReadingProgress() {
  const doc = document.documentElement;
  const maxScrollable = doc.scrollHeight - window.innerHeight;

  if (maxScrollable <= 0) {
    return 100;
  }

  const rawPercent = (window.scrollY / maxScrollable) * 100;
  return Math.max(0, Math.min(100, Math.round(rawPercent)));
}

function updateProgressBar() {
  const percent = getReadingProgress();
  progressFillEl.style.width = `${percent}%`;
}

// Feature actions

function applyFontSize() {
  document.body.style.fontSize = `${state.fontSize}em`;
}

function increaseFontSize() {
  const newFontSize = Math.min(2.0, state.fontSize + 0.1);
  setFontSize(newFontSize);
  applyFontSize();
}

function decreaseFontSize() {
  const newFontSize = Math.max(0.7, state.fontSize - 0.1);
  setFontSize(newFontSize);
  applyFontSize();
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDarkTheme = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

function previousChapter() {
  if (state.currentChapterIndex > 0) {
    // We mutate the exported variable directly and then call
    // the helper so the change is also saved.
    setCurrentChapterIndex(state.currentChapterIndex - 1);
    renderChapter();
  }
}

function nextChapter() {
  if (state.currentChapterIndex < chapters.length - 1) {
    setCurrentChapterIndex(state.currentChapterIndex + 1);
    renderChapter();
  }
}

function jumpToChapter(index) {
  if (index < 0 || index >= chapters.length) {
    return;
  }

  setCurrentChapterIndex(index);
  renderChapter();
}

// Bookmark helpers

function saveBookmark() {
  const chapter = chapters[state.currentChapterIndex];
  const percent = getReadingProgress();

  // Determine which paragraph is roughly in the middle of the viewport.
  const paragraphs = Array.from(document.querySelectorAll('.chapter-content p'));
  let currentParaIndex = 0;

  paragraphs.forEach((p, idx) => {
    const rect = p.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2) {
      currentParaIndex = idx;
    }
  });

  const bookmark = {
    id: Date.now(),
    chapterIndex: state.currentChapterIndex,
    chapterTitle: chapter.title,
    paragraphIndex: currentParaIndex,
    percent,
    createdAt: new Date().toLocaleString()
  };

  const updatedBookmarks = [...state.bookmarks, bookmark];
  setBookmarks(updatedBookmarks);
  renderBookmarks();
  setStatus(`Bookmark saved at ${percent}% (${bookmark.createdAt})`);
}

function goToBookmark(bookmarkId) {
  const bookmark = state.bookmarks.find((item) => item.id === bookmarkId);
  if (!bookmark) {
    setStatus('Bookmark not found.');
    return;
  }

  setCurrentChapterIndex(bookmark.chapterIndex);
  renderChapter();

  // After the chapter content is rendered, scroll to the
  // paragraph we saved in the bookmark.
  requestAnimationFrame(() => {
    const targetPara = document.getElementById(`para-${bookmark.paragraphIndex}`);
    if (targetPara) {
      targetPara.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    updateProgressBar();
  });

  setStatus(`Jumped to bookmark in ${bookmark.chapterTitle} at ${bookmark.percent}%`);
}

// Setup

function restorePreferences() {
  applyFontSize();

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
}

function bindEvents() {
  increaseBtn.addEventListener('click', increaseFontSize);
  decreaseBtn.addEventListener('click', decreaseFontSize);
  toggleThemeBtn.addEventListener('click', toggleTheme);
  prevBtn.addEventListener('click', previousChapter);
  nextBtn.addEventListener('click', nextChapter);
  saveBookmarkBtn.addEventListener('click', saveBookmark);

  chapterSelectEl.addEventListener('change', (event) => {
    const index = Number(event.target.value);
    jumpToChapter(index);
  });

  // Update progress bar while user scrolls.
  window.addEventListener('scroll', updateProgressBar);
  window.addEventListener('resize', updateProgressBar);
}

function initApp() {
  // Guard: if saved value is out of range, reset to chapter 0.
  if (state.currentChapterIndex < 0 || state.currentChapterIndex >= chapters.length) {
    setCurrentChapterIndex(0);
  }

  restorePreferences();
  renderChapterSelect();
  renderChapter();
  renderBookmarks();
  bindEvents();
  updateProgressBar();
}

// When the page finishes loading, we start the app.
window.addEventListener('load', initApp);

