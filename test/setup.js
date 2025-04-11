// test/setup.js
// Mock the document functions and elements needed for the tests

// Mock the window.scrollTo function
window.scrollTo = jest.fn();

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Success', user: { id: 1 } })
  })
);

// Mock console methods
console.error = jest.fn();
console.log = jest.fn();