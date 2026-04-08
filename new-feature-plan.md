# notehub.web Feature Plan: Federated Search + File Attachments

## Context

notehub.web is heavily used as a daily notes tool. Two features would make it significantly more powerful: (1) searching across all note bodies with regex support and vim-style result navigation, and (2) managing file attachments on notes via the GitHub API.

Both features must work on github.com AND GHES. The app is vanilla TypeScript with vim-centric UX.

---

## Feature 1: Federated Search

### Key Insight
The existing `searchNotes()` call already returns note bodies (via `...item` spread from GitHub Search API response). No additional API calls are needed — we just need to search the data we already have.

### UI Flow
1. Press `/` on the note list screen (vim convention)
2. A search bar appears at top using `veditor.createVimInput` (vim keybindings in the input)
3. Results filter in real time (debounced ~150ms) with context snippets
4. j/k to navigate results, Enter to open, Escape to dismiss
5. Toggle regex mode with `Ctrl+R` or a button

### Search Results Table
```
Repo       | # | Title          | Match Context                          | Updated
user/notes | 7 | Meeting notes  | ...discussed the **migration** plan... | 4/2
```
Match text highlighted with `<mark>`. Shows ~40 chars of surrounding context.

### Implementation

**`app.ts` changes:**
- Store `notesList` at module scope (or pass to search) so bodies are accessible
- Add `/` handler in `onListKey` (line 246 area) → calls `showSearchBar()`
- New `showSearchBar()`: creates search input bar with `createVimInput`, regex toggle button, match count display
- New `performSearch(query, regexMode, notes)`: filters notes by title+body match, extracts context snippets with `<mark>` highlighting
- New `renderSearchResults(results)`: renders filtered table with context column, same j/k/Enter navigation
- Escape → dismiss search bar, restore full list
- Update footer to show `<kbd>/</kbd> Search`

**`style.css` changes:**
- `.search-bar` — flex row for input + toggle + count
- `.search-context mark` — highlight color (Catppuccin yellow `#f9e2af`)
- `.search-regex-toggle` — small toggleable button

**No changes needed to `github.ts`** — bodies are already returned.

### Phase 2 (later)
- Jump-to-match in editor: pass search pattern to veditor, execute `/{pattern}` ex command after opening
- Search history in localStorage
- GitHub Search API text-match fallback for >100 notes

---

## Feature 2: File Attachments

### Approach: GitHub Contents API
Store files at `.notehub/attachments/{issue_number}/{filename}` in the repo. This is:
- Fully documented REST API (`GET/PUT/DELETE /repos/{owner}/{repo}/contents/{path}`)
- Works identically on GHES
- Supports files up to ~50MB (base64 encoded)
- Full CRUD control

Rejected alternatives:
- Undocumented upload-to-S3 endpoint — browser-only, no GHES support, could break
- Comment-based attachments — requires same undocumented upload flow
- Vim ex commands (`:files`, `:att`) — routes UI through global vim state, awkward for a panel feature

### UI Flow
1. Press `ga` in normal mode (vim mapping, consistent with `gt` for title), OR click the paperclip button in the editor header
2. Attachment panel opens **below the editor** — completely separate from CodeMirror/vim
3. Panel receives focus; keyboard events are handled by the panel's own listener (not vim)
4. `j`/`k` navigate the file list, `a` opens file picker, `d` downloads selected file, `x` deletes (with confirmation)
5. After upload, a markdown link `[filename](url)` is copied to clipboard
6. `Esc` closes the panel and returns focus to the editor
7. Panel button is hidden/disabled when `currentNote` is null (unsaved new note)

### Attachment Panel Layout
```
📎 Attachments (3)                                         [✕ Close]
----------------------------------------------------------------------
  notes-diagram.png     12.4 KB    2026-04-01
  meeting-audio.mp3     1.2 MB     2026-03-28
----------------------------------------------------------------------
<kbd>a</kbd> Upload  <kbd>d</kbd> Download  <kbd>x</kbd> Delete  <kbd>Esc</kbd> Close
```

### Implementation

**`github.ts` additions** (4 new functions):

```typescript
export interface Attachment {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string;
}

listAttachments(host, token, owner, repo, issueNumber) → Attachment[]
  // GET /repos/{o}/{r}/contents/.notehub/attachments/{n}
  // Returns [] on 404

uploadAttachment(host, token, owner, repo, issueNumber, filename, base64Content, existingSha?) → Attachment
  // PUT /repos/{o}/{r}/contents/.notehub/attachments/{n}/{filename}
  // { message: "notehub: attach {filename} to #{n}", content: base64, sha? }
  // Caller must pass existingSha if overwriting an existing file

deleteAttachment(host, token, owner, repo, path, sha) → void
  // DELETE /repos/{o}/{r}/contents/{path} with { message, sha }
```

**`app.ts` additions:**
- Add paperclip button to editor header in `renderEditor()` (hidden when `currentNote` is null)
- Add `'ga': () => toggleAttachmentPanel()` to `normalMappings` in `renderEditor()`
- New `toggleAttachmentPanel()`: creates/removes panel, calls `listAttachments()`, renders list, focuses panel
- New `renderAttachmentList(attachments, panelEl)`: renders file rows with j/k selection state
- New `handleUpload()`: triggers `<input type="file">`, reads as `ArrayBuffer`, base64-encodes manually, checks for existing file (to get SHA for overwrite), calls `uploadAttachment()`
- Download: open `attachment.download_url` in a new tab (works on both github.com and GHES HTTPS without blob overhead)
- Delete: `confirm()` → `deleteAttachment()` → re-render list
- On `Esc` in panel keydown: remove panel, return focus to editor

**`style.css` additions:**
- `.attachment-panel` — dark panel below editor, border-top, max-height with scroll
- `.attachment-row`, `.attachment-row.selected` — same pattern as note rows

### Phase 2 (later)
- Drag-and-drop upload onto editor
- Paste-to-upload (screenshots)
- Inline image thumbnails in panel
- Large file support via Git Blob API (>50MB)

---

## Implementation Order

| Phase | Status | Scope | Files |
|-------|--------|-------|-------|
| **1a** | ✅ Done | Federated Search (core) | `app.ts`, `style.css` |
| **1b** | 🔄 Next | File Attachments (core) | `github.ts`, `app.ts`, `style.css` |
| **2** | — | Search polish (jump-to-match, history) | `app.ts` |
| **3** | — | Attachment polish (drag-drop, paste, previews) | `app.ts` |

## Verification
- `VITE_BASE=/ npm run dev` — start dev server
- Test search: create a few notes with known body text, press `/`, verify matches appear with context
- Test regex: toggle regex mode, use patterns like `\d{4}-\d{2}`
- Test attachments: open a note, `:files`, upload a small file, verify it appears in the panel and in the repo at `.notehub/attachments/{n}/`
- Test download: select attachment, press `d`, verify browser downloads the file
- Test delete: select attachment, press `x`, confirm, verify removed
- `npx tsc --noEmit` — typecheck passes
