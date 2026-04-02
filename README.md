# notehub.web

A single-page browser app that uses GitHub Issues as a note-keeping system, with vi keybindings via CodeMirror 6. Zero install, zero backend — just static files and a GitHub PAT.

Hosted on GitHub Pages: `https://bbgithub.dev.bloomberg.com/pages/training-lmatheson4/notehub.web/`

## Quick Start

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
```

Open the browser, enter your GitHub host and PAT, and start editing. Notes are GitHub Issues labeled `notehub`, discovered across all repos you have access to.

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

## TODO

- [x] Cross-org/repo note discovery — search by `notehub` label across all repos via Search API, not just one repo
- [x] Filter to notehub-tagged issues only — exclude unrelated issues everywhere
- [ ] Opening page shows all notes + manual refresh — list all discovered notes on landing, with a refresh button
- [ ] Vim-style navigation on notes list — j/k to move, enter to open, new-note via keyboard and mouse
- [ ] New note creation — need repo selection UX since notes can live in any repo

## Project Structure

```
src/
  main.ts       — entry point
  app.ts        — app state machine (auth, note list, editor screens)
  editor.ts     — CodeMirror setup, vim ex command registration
  github.ts     — GitHub API client (supports GHES and github.com)
  style.css     — Catppuccin Mocha dark theme
```
