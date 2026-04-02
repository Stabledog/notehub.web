# notehub.web

A single-page browser app that uses GitHub Issues as a note-keeping system, with vi keybindings via CodeMirror 6. Zero install, zero backend — just static files and a GitHub PAT.

Hosted on GitHub Pages: `https://bbgithub.dev.bloomberg.com/pages/training-lmatheson4/notehub.web/`

## Quick Start

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
```

Open the browser, enter your PAT, org/repo, and start editing. Notes are GitHub Issues labeled `notehub`.

## Editor Keybindings

Full vim mode. The following ex commands are wired to the app:

| Command | Action |
|---------|--------|
| `:w`    | Save note to GitHub |
| `:q`    | Return to note list (warns on unsaved changes) |
| `:wq`   | Save and return to list |
| `:q!`   | Discard changes and return to list |

## Deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

The `gh-pages` package pushes the contents of `dist/` to the `gh-pages` branch. The repo's Pages settings should serve from that branch.

**Important:** The Vite `base` path in `vite.config.ts` must match the Pages URL path. Currently set to `/pages/training-lmatheson4/notehub.web/` for bbgithub GHES.

## Stack

- **Vite + TypeScript** — build tooling
- **CodeMirror 6** — editor core
- **@replit/codemirror-vim** — vi keybindings
- **@codemirror/lang-markdown** — markdown syntax highlighting
- **@codemirror/theme-one-dark** — editor theme
- **GitHub REST API** — direct fetch from browser, no backend
- **localStorage** — PAT, host, org/repo persistence

## Project Structure

```
src/
  main.ts       — entry point
  app.ts        — app state machine (auth, note list, editor screens)
  editor.ts     — CodeMirror setup, vim ex command registration
  github.ts     — GitHub API client (supports GHES and github.com)
  style.css     — Catppuccin Mocha dark theme
```
