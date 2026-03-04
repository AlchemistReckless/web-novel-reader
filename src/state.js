// State module
// ------------
// This module owns values that describe "where the reader is"
// (which chapter, font size, saved bookmarks, theme, etc.).
// It also knows how to save and load these values from
// localStorage so they persist when the page reloads.
//
// IMPORTANT BEGINNER NOTE:
// In ES modules, if you export a primitive value directly
// like `export let fontSize = 1.1`, other files can read that
// value but not reassign it. The binding is also a bit abstract
// when you are new to modules.
//
// To keep things simple and avoid confusion about "stale"
// values, we export a single `state` object. Every file that
// imports this object sees the *same* object. When we update
// a property (like `state.fontSize`) everyone sees the change.

export const state = {
  currentChapterIndex: Number(localStorage.getItem('chapterIndex')) || 0,
  fontSize: Number(localStorage.getItem('fontSize')) || 1.1,
  bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '[]')
};

// When we want to change these values from other files, we
// use small helper functions so the logic for updating
// localStorage always stays in one place.

export function setCurrentChapterIndex(newIndex) {
  state.currentChapterIndex = newIndex;
  localStorage.setItem('chapterIndex', String(state.currentChapterIndex));
}

export function setFontSize(newFontSize) {
  state.fontSize = newFontSize;
  localStorage.setItem('fontSize', String(state.fontSize));
}

export function setBookmarks(newBookmarks) {
  state.bookmarks = newBookmarks;
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

