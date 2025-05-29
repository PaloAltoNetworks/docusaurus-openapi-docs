// setupTests.ts
// Global mocks for all Jest tests

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
