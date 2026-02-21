/*
  Web Novel Reader Script
  -----------------------
  This file is organized by feature so it is easier to edit:
  1) Data and state
  2) DOM references
  3) UI render helpers
  4) Feature actions
  5) Event wiring and startup
*/

// 1) Chapter data: edit this array to add/remove chapters.
const chapters = [
    {
        id: 1,
        title: 'Chapter 1: The Beginning',
        content: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        ]
    },
    {
        id: 2,
        title: 'Chapter 2: Through the Gate',
        content: [
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
            'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        ]
    },
    {
        id: 3,
        title: 'Chapter 3: A New Clue',
        content: [
            'Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.',
            'Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris.'
        ]
    }
];

// 2) App state: values that change while reading.
let currentChapterIndex = Number(localStorage.getItem('chapterIndex')) || 0;
let fontSize = Number(localStorage.getItem('fontSize')) || 1.1;
let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

// 3) DOM references.
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

// 4) Rendering helpers.
function renderChapterSelect() {
    chapterSelectEl.innerHTML = '';

    chapters.forEach((chapter, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = chapter.title;
        chapterSelectEl.appendChild(option);
    });

    chapterSelectEl.value = String(currentChapterIndex);
}

function renderChapter() {
    const chapter = chapters[currentChapterIndex];
    if (!chapter) {
        return;
    }

    chapterTitleEl.textContent = chapter.title;
    chapterContentEl.innerHTML = chapter.content.map((paragraph) => `<p>${paragraph}</p>`).join('');
    chapterSelectEl.value = String(currentChapterIndex);

    localStorage.setItem('chapterIndex', String(currentChapterIndex));

    // Reset to top when user changes chapter manually.
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateProgressBar();
}

function renderBookmarks() {
    bookmarkListEl.innerHTML = '';

    if (!bookmarks.length) {
        bookmarkListEl.textContent = 'No bookmarks yet.';
        return;
    }

    // Newest bookmark first.
    [...bookmarks].reverse().forEach((bookmark) => {
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

// 5) Progress helpers.
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

// 6) Feature actions.
function increaseFontSize() {
    fontSize = Math.min(2.0, fontSize + 0.1);
    applyFontSize();
}

function decreaseFontSize() {
    fontSize = Math.max(0.7, fontSize - 0.1);
    applyFontSize();
}

function applyFontSize() {
    document.body.style.fontSize = `${fontSize}em`;
    localStorage.setItem('fontSize', String(fontSize));
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

function previousChapter() {
    if (currentChapterIndex > 0) {
        currentChapterIndex -= 1;
        renderChapter();
    }
}

function nextChapter() {
    if (currentChapterIndex < chapters.length - 1) {
        currentChapterIndex += 1;
        renderChapter();
    }
}

function jumpToChapter(index) {
    if (index < 0 || index >= chapters.length) {
        return;
    }

    currentChapterIndex = index;
    renderChapter();
}

function saveBookmark() {
    const chapter = chapters[currentChapterIndex];
    const percent = getReadingProgress();
    const scrollY = window.scrollY;

    const bookmark = {
        id: Date.now(),
        chapterIndex: currentChapterIndex,
        chapterTitle: chapter.title,
        scrollY,
        percent,
        createdAt: new Date().toLocaleString()
    };

    bookmarks.push(bookmark);
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    renderBookmarks();
    setStatus(`Bookmark saved at ${percent}% (${bookmark.createdAt})`);
}

function goToBookmark(bookmarkId) {
    const bookmark = bookmarks.find((item) => item.id === bookmarkId);
    if (!bookmark) {
        setStatus('Bookmark not found.');
        return;
    }

    currentChapterIndex = bookmark.chapterIndex;
    renderChapter();

    // Wait until render is complete, then restore exact scroll position.
    requestAnimationFrame(() => {
        window.scrollTo({ top: bookmark.scrollY, behavior: 'auto' });
        updateProgressBar();
    });

    setStatus(`Jumped to bookmark in ${bookmark.chapterTitle} at ${bookmark.percent}%`);
}

// 7) Setup.
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
    if (currentChapterIndex < 0 || currentChapterIndex >= chapters.length) {
        currentChapterIndex = 0;
    }

    restorePreferences();
    renderChapterSelect();
    renderChapter();
    renderBookmarks();
    bindEvents();
    updateProgressBar();
}

window.addEventListener('load', initApp);