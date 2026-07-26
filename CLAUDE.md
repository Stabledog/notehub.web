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

Deployment is handled by the parent workspace. From the workspace root:

```bash
make deploy-notehub      # builds with GHES paths, pushes dist/ to gh-pages
```

On the GHES buildserver, pushing to `main` triggers an automatic build and deploy via the webhook server. Both `VITE_BASE` and `VITE_VEDITOR_BASE` are required and supplied by the parent (Makefile or buildserver config).

## Architecture

Three source files in `src/`, no framework, vanilla DOM:

- **`main.ts`** — entry point, imports CSS and calls `init()`
- **`app.ts`** — app state machine with three screens (auth, note list, editor). Manages localStorage persistence for host/token/owner/repo. All GitHub API calls are threaded through a `host` parameter. Dynamically imports the editor component from veditor.web at runtime.
- **`github.ts`** — GitHub REST API client. Supports both GHES (`https://{host}/api/v3`) and github.com (`https://api.github.com`). Default host: `github.com`. Functions: `validateToken`, `listNotes`, `getNote`, `updateNote`, `createNote`, `ensureLabel`.

The editor (CodeMirror 6 + vim mode) is provided by **veditor.web** (`Stabledog/veditor.web`), a shared component also used by metabrowse. It is loaded at runtime from GitHub Pages via dynamic `import()`. The base URL is set at build time via the `VITE_VEDITOR_BASE` environment variable (defaults to `https://stabledog.github.io/veditor.web` for public builds; must be overridden for GHES). veditor.web must be deployed to gh-pages before notehub.web can function.

## Key Patterns

- **No framework** — all UI is innerHTML + addEventListener. Three "screens" managed by functions: `showAuth()`, `showNoteList()`, `renderEditor()`.
- **Configurable GitHub host** — defaults to github.com, supports any GHES instance. The host is configurable on the auth screen and stored in localStorage.
- **Vim ex commands as app actions** — `:w` triggers a PATCH to save, `:q` navigates back to the list, `:wq` saves then navigates. These are registered by veditor.web via the `onSave`/`onQuit` callbacks. The `gt` normal-mode mapping (focus title input) is passed via `normalMappings` in `VEditorOptions`.
- **All API functions take `host` as the first parameter** — this threads through from `AppState.host` in `app.ts`.

## Attachments

Attachments are stored in a **separate sibling repo**, `{defaultRepo}.attachments` (see `getAttachmentsRepoInfo` in `github.ts`), never in the note repo itself. Files are laid out per note at `{noteOwner}/{noteRepo}/{issueNumber}/{filename}`.

**Privacy model — private by design.** Keep the `.attachments` repo private. Attachment privacy rests entirely on this convention; there is no other enforcement. Do **not** enable GitHub Pages on the `.attachments` repo, and do not make it public — either would expose every attachment.

Two distinct access paths, both backed by that private repo:

- **Previews & downloads (PDFs, etc.)** — `fetchAttachmentBlob` (`github.ts`) fetches raw bytes through the REST contents API (`Accept: application/vnd.github.raw`) authenticated with the **stored PAT**, then wraps them in an in-memory `Blob` and opens a `URL.createObjectURL(...)` `blob:` URL. This is robustly private: access is gated by the PAT and works only through the app. The `blob:https://<app-origin>/<uuid>` URL is a browser-local, in-memory handle (auto-revoked after 60s) — it is *not* a server resource, so stripping the `blob:` prefix always 404s.
- **Pasted/inline images** — `uploadAndInsertImage` embeds a durable `https://{host}/{owner}/{repo}/raw/main/{path}` link into the note markdown. This URL relies on the **browser's GitHub session cookie**, not the PAT. It renders inline for a logged-in owner but is *not* a public or shareable link — anyone without repo access (or without a GitHub session) gets 403/404.

## Git & Remote

- Main branch: `main`
- Deploy branch: `gh-pages` (managed by `gh-pages` npm package, do not edit manually)

## Style

- Dark theme using Catppuccin Mocha colors
- TypeScript strict mode enabled
- No test framework yet
