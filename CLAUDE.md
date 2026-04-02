# CLAUDE.md

## Project Overview

notehub.web is a single-page app (no framework) that uses GitHub Issues as a note-keeping backend, with a CodeMirror 6 vim-mode editor. It targets Bloomberg's GHES instance (bbgithub.dev.bloomberg.com) by default.

## Build & Dev

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server
npm run build        # typecheck + production build (outputs to dist/)
npx tsc --noEmit     # typecheck only
```

## Deploy

```bash
npm run build
npx gh-pages -d dist
```

This pushes `dist/` to the `gh-pages` branch. The repo's GitHub Pages serves from that branch.

The `base` path in `vite.config.ts` must match the GHES Pages URL structure: `/pages/{owner}/{repo}/`. Currently `/pages/training-lmatheson4/notehub.web/`.

## Architecture

Four source files in `src/`, no framework, vanilla DOM:

- **`main.ts`** — entry point, imports CSS and calls `init()`
- **`app.ts`** — app state machine with three screens (auth, note list, editor). Manages localStorage persistence for host/token/owner/repo. All GitHub API calls are threaded through a `host` parameter.
- **`editor.ts`** — creates CodeMirror 6 instance with vim mode, markdown highlighting, one-dark theme. Registers `:w`, `:q`, `:q!`, `:wq` via `Vim.defineEx()`. Exposes `createEditor()`, `getEditorContent()`, `isEditorDirty()`, `destroyEditor()`.
- **`github.ts`** — GitHub REST API client. Supports both GHES (`https://{host}/api/v3`) and github.com (`https://api.github.com`). Default host: `bbgithub.dev.bloomberg.com`. Functions: `validateToken`, `listNotes`, `getNote`, `updateNote`, `createNote`, `ensureLabel`.

## Key Patterns

- **No framework** — all UI is innerHTML + addEventListener. Three "screens" managed by functions: `showAuth()`, `showNoteList()`, `renderEditor()`.
- **GHES-first** — the default GitHub host is bbgithub.dev.bloomberg.com, not github.com. The host is configurable on the auth screen and stored in localStorage.
- **Vim ex commands as app actions** — `:w` triggers a PATCH to save, `:q` navigates back to the list, `:wq` saves then navigates. These are registered via `Vim.defineEx()` in `editor.ts`.
- **All API functions take `host` as the first parameter** — this threads through from `AppState.host` in `app.ts`.

## Git & Remote

- Remote: `origin` -> `bbgithub:training-lmatheson4/notehub.web.git`
- Main branch: `main`
- Deploy branch: `gh-pages` (managed by `gh-pages` npm package, do not edit manually)
- Push: `git push origin main`

## Style

- Dark theme using Catppuccin Mocha colors
- TypeScript strict mode enabled
- No test framework yet
