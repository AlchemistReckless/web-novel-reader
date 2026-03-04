// Data module
// -----------
// This file holds the static chapter data for the reader.
// Keeping it in its own module makes it easy to later swap
// this out for data loaded from an API or file, without
// touching the rest of the app.

export const chapters = [
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

