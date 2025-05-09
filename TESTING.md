# Testing Docusaurus Theme Components

This project uses Jest and Testing Library to test custom Docusaurus theme components. The following conventions and workarounds are in place to ensure tests run smoothly in a Docusaurus monorepo environment:

## Global Test Mocks

- **Browser APIs:**
  - `ResizeObserver` and other browser-only globals are mocked in [`setupTests.ts`](./setupTests.ts), which is loaded automatically for all tests via Jest config.
- **Docusaurus Theme/Internal Modules:**
  - Manual mocks are provided in the [`__mocks__`](./__mocks__) directory for imports like `@docusaurus/theme-common/internal`, `@theme/Heading`, etc.
  - If you add new components that import other Docusaurus internals, add or extend mocks in this directory.

## TypeScript Workarounds

- Some files (such as those importing `@docusaurus/theme-common/internal`) require `// @ts-nocheck` at the top. This is necessary because TypeScript cannot resolve these modules outside of a full Docusaurus context. This is a common and accepted workaround in plugin/theme projects.
- If you encounter new TS errors related to Docusaurus internals, prefer targeted type declarations in `global.d.ts` or `theme-modules.d.ts`, but use `// @ts-nocheck` when necessary to unblock tests.

## Running Tests

```sh
yarn test
```

## Best Practices

- Keep mocks minimal—only mock what is required for your test to pass.
- Prefer global setup for browser APIs and repeated mocks.
- Document any new workarounds or test patterns in this file for future contributors.

---

For more details, see the comments in `setupTests.ts`, `jest.config.js`, and the `__mocks__` directory.
