## Repo snapshot

This repository is a Quasar (Vue 3) + Vite project with optional Electron packaging. Key facts:
- UI: Vue 3 + Quasar (see `quasar.config.ts`).
- Router: `vue-router` with hash-mode (see `src/router/*`). Routes are lazy-loaded and use `layouts/` and `pages/`.
- Boot files: app boot scripts live in `src/boot/` and are registered from `quasar.config.ts` (example: `src/boot/axios.ts`).
- Electron: development support under `src-electron/` (main + preload). Dev script: `npm run dev:electron`.
- TypeScript: `build.typescript.strict` is enabled. Project uses `vue-tsc` and `vite-plugin-checker` (see `package.json` + `quasar.config.ts`).

## Goal for AI coding agents
Help contributors by making safe, small, repository-specific changes: add pages/routes, create boot files, adjust Quasar/Vite settings, and implement UI components that follow the lazy-loading and layout patterns used here.

## How to run and common tasks (local dev)
- Install: `yarn` or `npm install` (project has `postinstall: quasar prepare`).
- Run web app (hot reload): `npm run dev` (alias for `quasar dev`).
- Run Electron dev: `npm run dev:electron` (starts Quasar in Electron mode).
- Build (production web/electron): `npm run build` (Quasar build). For Electron packaging you may need `quasar build -m electron` or add project-specific packaging flags.
- Lint: `npm run lint` (uses `eslint.config.js`).

If making changes that affect types or linting, the project runs `vue-tsc` and `eslint` via `vite-plugin-checker`; keep TypeScript errors and ESLint warnings minimal.

## Important file locations and patterns (use these exact files as examples)
- `quasar.config.ts` — central app config: boot files, build options, electron settings, and vite plugin checkers.
- `src/boot/axios.ts` — example boot file. Note it:
  - registers `app.config.globalProperties.$axios` and `$api` for Options API usage;
  - creates and exports `api` (exported for non-Vue modules: `import { api } from 'src/boot/axios'`).
- `src/router/routes.ts` — add routes here. Routes are lazy-loaded with dynamic imports and use `layouts/MainLayout.vue`.
- `src-electron/electron-main.ts` and `src-electron/electron-preload.ts` — Electron entry points.
- `src/components/` — shared UI components (single-file `.vue`).

## Code and change conventions specific to this repo
- Boot files: register boot files in `quasar.config.ts` `boot: [ 'axios' ]`. Boot files may augment `app.config.globalProperties`. Prefer creating small, focused boot modules (e.g., `src/boot/foo.ts`) and register them in the config.
- Router: always add route definitions in `src/router/routes.ts` and prefer lazy-loaded components (e.g. `component: () => import('pages/MyPage.vue')`). Use `layouts/` for shared UI chrome.
- API access: prefer using `src/boot/axios.ts` exported `api` instance for application requests (keeps baseURL centralized). If adding new endpoints, update code that uses `api` rather than creating new axios instances.
- TypeScript: strict mode is enabled. Exported symbols should be typed. Run `vue-tsc --noEmit` locally if unsure.

## Examples to copy/paste
- Register a new boot file (create `src/boot/logger.ts`): add `'logger'` to `quasar.config.ts` boot array.
- Add a route that lazy-loads a page:

  ```ts
  // src/router/routes.ts (add to the routes array)
  {
    path: '/my-feature',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyFeaturePage.vue') }]
  }
  ```

## Integration and external dependencies
- Network: `src/boot/axios.ts` sets `api` baseURL to `'https://api.example.com'` — replace this or use runtime env override for real endpoints.
- Electron: preload is configured in `quasar.config.ts` (`preloadScripts: ['electron-preload']`). Changes to main/preload usually require restarting the Electron dev server.
- Linting & checks: ESLint config is in `eslint.config.js`; Vite uses `vite-plugin-checker` for `vue-tsc` and ESLint.

## Quick debugging tips
- If dev server fails to start, check terminal output from `quasar dev` — Quasar/Vite usually prints precise module/type errors.
- For Electron issues, run `npm run dev:electron` and watch both the dev server terminal and Electron console.
- For TypeScript errors, run `npx vue-tsc --noEmit` or rely on the IDE/type checker; fix exported type mismatches first.

## What not to change without review
- Do not change `quasar.config.ts` build electron bundler options, or `package.json` scripts without a brief PR description — these affect packaging and CI for other contributors.
- Avoid modifying the `boot` array ordering unless necessary; boot file order can affect initialization.

## Questions for the repo owner (placeholders the AI should ask if needed)
1. What is the intended real API base URL or pattern for local vs production? (Currently `https://api.example.com` in `src/boot/axios.ts`.)
2. Do you expect Electron builds to be published with `packager` settings in `quasar.config.ts` or a different packager in CI?

## Closing notes
Keep changes small and locally verifiable: add a page + route, a focused boot file, or a small component. Refer to the files above for canonical examples and prefer using the exported `api` from `src/boot/axios.ts` for HTTP requests.

---
If you'd like, I can refine this further (shorten, expand with more examples, or adapt to an existing company style). Which areas should I expand or clarify?
