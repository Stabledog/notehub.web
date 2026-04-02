# notehub-web: Proof of Concept Plan

## Mission

A single-page browser app that uses GitHub Issues as a distributed note-keeping system, with vi-keybinding editing via CodeMirror 6. Zero install, zero config beyond a GitHub PAT.

## Core Premise

The existing notehub CLI makes ~6 GitHub REST API calls behind a label filter. All of these work directly from a browser via `fetch()`. The CLI's reason for existing — editing notes with vi keybindings — is preserved by CodeMirror's vim mode.

## Stack

- **Vite + TypeScript** — build tooling, dev server, production bundle
- **CodeMirror 6** — editor core
- **@replit/codemirror-vim** — vi keybindings
- **CodeMirror markdown mode** — syntax highlighting for note content
- **GitHub REST API** — direct fetch, no backend
- **localStorage** — PAT storage, user preferences (org/repo defaults)
- **No framework** — vanilla DOM manipulation; the UI is a note list and an editor, not a component tree

## Authentication

PAT entry on first visit, stored in `localStorage`. Token used as `Authorization: Bearer <token>` header on all API calls. A "sign out" button clears it. No OAuth flow, no backend, no redirect dance.

Validate the token on entry with `GET /user` and display the username.

## GitHub API Surface

| Action | Method | Endpoint |
|--------|--------|----------|
| Validate token | GET | `/user` |
| List notes | GET | `/repos/{owner}/{repo}/issues?labels=notehub&state=open` |
| Get note | GET | `/repos/{owner}/{repo}/issues/{number}` |
| Create note | POST | `/repos/{owner}/{repo}/issues` |
| Update note | PATCH | `/repos/{owner}/{repo}/issues/{number}` |
| Ensure label | POST | `/repos/{owner}/{repo}/labels` |

All requests go to `https://api.github.com`. GHES support is a future stretch goal (configurable base URL).

## UI Layout

Three states:

1. **Auth screen** — PAT input, optional org/repo defaults, "Connect" button
2. **Note list** — table or list of `[#N] Title`, click to open, "New Note" button, org/repo selector at top
3. **Editor** — CodeMirror with vim mode, showing the issue body as markdown. Title editable above the editor. Save with `:w`, close with `:q`, save-and-close with `:wq` (mapped to API calls).

The editor should feel like opening a file in vi. `:w` writes to GitHub. `:wq` writes and returns to the list.

## `:w` / `:wq` Behavior

Map vim ex commands to application actions:

- `:w` — `PATCH /repos/{owner}/{repo}/issues/{number}` with current body (and title if changed). Visual confirmation on success.
- `:q` — return to note list (warn if unsaved changes)
- `:wq` — save then return to list
- `:q!` — discard changes, return to list

## Proof of Concept Scope

The PoC should validate these specific questions:

### Phase 1: Editor viability
- [ ] Vite project scaffolding with TypeScript
- [ ] CodeMirror 6 + vim mode renders and accepts vi input
- [ ] `:w` ex command can be intercepted and mapped to a custom save action
- [ ] Markdown syntax highlighting works in the editor

### Phase 2: GitHub API integration
- [ ] PAT stored in localStorage, sent as auth header
- [ ] List issues with `notehub` label from a configured repo
- [ ] Fetch a single issue body into the editor
- [ ] Save edited body back via PATCH
- [ ] Create a new issue with the `notehub` label

### Phase 3: Minimal usable app
- [ ] Auth screen with PAT input and org/repo config
- [ ] Note list view with clickable entries
- [ ] Editor view with `:w`, `:q`, `:wq`, `:q!` mapped
- [ ] New note creation flow (title prompt, then editor)
- [ ] Visual feedback on save success/failure
- [ ] "Sign out" to clear PAT

## Deployment

Static files only. Host anywhere:
- `npx vite build` produces a `dist/` folder
- Serve from GitHub Pages, Cloudflare Pages, or open `index.html` locally

## Out of Scope for PoC

- Offline editing / service workers
- Local caching beyond localStorage preferences
- GitHub Enterprise Server support
- OAuth or device flow auth
- Note search / filtering beyond the label
- Multiple repo management in a single session
- Conflict detection (last-write-wins is acceptable for a single-user note system)

## Risk Check

| Risk | Mitigation |
|------|-----------|
| CORS on GitHub API | GitHub API sets `Access-Control-Allow-Origin: *` for authenticated requests — confirmed browser-compatible |
| Vim mode fidelity | @replit/codemirror-vim is actively maintained, used in production by Replit — covers motions, operators, visual mode, registers, macros, ex commands |
| Ex command interception | CodeMirror vim mode exposes `Vim.defineEx()` for custom ex commands — documented API |
| PAT in localStorage | Acceptable for single-user tool; same trust model as the CLI storing tokens in env vars. User can clear on shared machines. |
| API rate limiting | Authenticated requests get 5,000/hour — more than sufficient for note editing |
