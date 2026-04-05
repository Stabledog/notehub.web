# CLAUDE.md

## Project Overview

notehub.web is a single-page app (no framework) that uses GitHub Issues as a note-keeping backend, with a CodeMirror 6 vim-mode editor. It supports both github.com and GitHub Enterprise Server (GHES) instances — the host is configurable on the auth screen.

## Build & Dev

The `VITE_BASE` environment variable is required for all Vite commands. It sets the URL base path for the deployment target.

```bash
npm install                                        # install dependencies
VITE_BASE=/ npm run dev                            # start Vite dev server
VITE_BASE=/notehub.web/ npm run build              # production build for public GH Pages
VITE_BASE=/pages/user/notehub.web/ npm run build   # production build for GHES Pages
npx tsc --noEmit                                   # typecheck only
```

## Deploy

```bash
./build-and-deploy.sh
```

The script auto-detects the Pages base path from the git remote URL (`/{repo}/` for github.com, `/pages/{owner}/{repo}/` for GHES). It installs deps, builds, and pushes `dist/` to the `gh-pages` branch.

## Architecture

Three source files in `src/`, no framework, vanilla DOM:

- **`main.ts`** — entry point, imports CSS and calls `init()`
- **`app.ts`** — app state machine with three screens (auth, note list, editor). Manages localStorage persistence for host/token/owner/repo. All GitHub API calls are threaded through a `host` parameter. Dynamically imports the editor component from veditor.web at runtime.
- **`github.ts`** — GitHub REST API client. Supports both GHES (`https://{host}/api/v3`) and github.com (`https://api.github.com`). Default host: `github.com`. Functions: `validateToken`, `listNotes`, `getNote`, `updateNote`, `createNote`, `ensureLabel`.

The editor (CodeMirror 6 + vim mode) is provided by **veditor.web** (`Stabledog/veditor.web`), a shared component also used by metabrowse. It is loaded at runtime from GitHub Pages via dynamic `import()`. The base URL defaults to `https://stabledog.github.io/veditor.web` and can be overridden via the `VITE_VEDITOR_BASE` environment variable (required for GHES deployments).

## Key Patterns

- **No framework** — all UI is innerHTML + addEventListener. Three "screens" managed by functions: `showAuth()`, `showNoteList()`, `renderEditor()`.
- **Configurable GitHub host** — defaults to github.com, supports any GHES instance. The host is configurable on the auth screen and stored in localStorage.
- **Vim ex commands as app actions** — `:w` triggers a PATCH to save, `:q` navigates back to the list, `:wq` saves then navigates. These are registered by veditor.web via the `onSave`/`onQuit` callbacks. The `gt` normal-mode mapping (focus title input) is passed via `normalMappings` in `VEditorOptions`.
- **All API functions take `host` as the first parameter** — this threads through from `AppState.host` in `app.ts`.

## Git & Remote

- Main branch: `main`
- Deploy branch: `gh-pages` (managed by `gh-pages` npm package, do not edit manually)

## Style

- Dark theme using Catppuccin Mocha colors
- TypeScript strict mode enabled
- No test framework yet
