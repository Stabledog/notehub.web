import { validateToken, repoExists, searchNotes, getNote, updateNote, createNote, archiveNote, listAttachments, uploadAttachment, deleteAttachment, fetchAttachmentBlob, fetchAttachmentCounts, getAttachmentsRepoInfo, rawContentUrl, DEFAULT_HOST, type NoteSearchResult, type Attachment } from './github';
import { logError, logWarn, logInfo, createLogViewer } from './logging-client';


const LS_TOKEN = 'notehub:token';

// Touch device detection — used to skip veditor and open GitHub's editor instead
const isMobile = window.matchMedia('(pointer: coarse)').matches;

// veditor base URL — must be set via VITE_VEDITOR_BASE at build time.
const VEDITOR_BASE = import.meta.env.VITE_VEDITOR_BASE as string | undefined;
if (!VEDITOR_BASE) throw new Error('VITE_VEDITOR_BASE not set at build time');

// veditor API — populated by init() before use (skipped on mobile).
let veditor: typeof import('./veditor');
const LS_HOST = 'notehub:host';
const LS_DEFAULT_REPO = 'notehub:defaultRepo';
const LS_PINNED_ISSUE = 'notehub:pinnedIssue';

interface AppState {
  host: string;
  token: string;
  username: string;
}

interface PinnedIssue {
  owner: string;
  repo: string;
  number: number;
}

const DEFAULT_NEW_TITLE = '\ud83c\udfab New note';
const DEFAULT_NEW_BODY = '# New note';

function getDefaultRepo(): string | null {
  return localStorage.getItem(LS_DEFAULT_REPO);
}

function getPinnedIssue(): PinnedIssue | null {
  const raw = localStorage.getItem(LS_PINNED_ISSUE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.owner && parsed.repo && typeof parsed.number === 'number') {
      return parsed as PinnedIssue;
    }
  } catch { /* ignore */ }
  return null;
}

function isSetupComplete(): boolean {
  return getDefaultRepo() !== null;
}

function getAttachmentsRepo(): { owner: string; repo: string } | null {
  const defaultRepo = getDefaultRepo();
  if (!defaultRepo) return null;
  return getAttachmentsRepoInfo(defaultRepo);
}

async function ensureAttachmentRepo(): Promise<{ owner: string; repo: string } | null> {
  if (!state) return null;
  const ar = getAttachmentsRepo();
  if (!ar) {
    showStatus('No default repo configured — cannot use attachments.', true);
    return null;
  }
  const exists = await repoExists(state.host, state.token, ar.owner, ar.repo);
  if (!exists) {
    showStatus(`Attachments repo "${ar.owner}/${ar.repo}" not found. Create it on GitHub to use attachments.`, true);
    return null;
  }
  return ar;
}

let state: AppState | null = null;
let currentNote: NoteSearchResult | null = null;
let newNoteTarget: { owner: string; repo: string } | null = null;

let originalBody = '';
let originalTitle = '';
let loadedUpdatedAt: string | null = null;
let justCreatedNote: NoteSearchResult | null = null;
let titleHandle: ReturnType<typeof import('./veditor').createVimInput> | null = null;

// Attachment panel state
let currentAttachments: Attachment[] = [];
let selectedAttachmentIndex = 0;
let multiSelectedAttachments = new Set<number>();

const app = document.getElementById('app')!;

export async function init(): Promise<void> {
  // Load veditor CSS + JS from Pages CDN (skip on mobile — use GitHub's editor instead)
  if (!isMobile) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${VEDITOR_BASE}/veditor.css`;
    document.head.appendChild(link);

    try {
      veditor = await import(/* @vite-ignore */ `${VEDITOR_BASE}/veditor.js`);
      const badge = document.getElementById('version-badge');
      if (badge && veditor.VERSION) {
        badge.textContent += ` \u00b7 ve${veditor.VERSION}`;
      }
    } catch (err) {
      logError(`Failed to load editor from ${VEDITOR_BASE}/veditor.js: ${err instanceof Error ? err.message : err}`);
    }
  }

  const token = localStorage.getItem(LS_TOKEN);
  const host = localStorage.getItem(LS_HOST) ?? DEFAULT_HOST;

  if (token && isSetupComplete()) {
    validateToken(host, token)
      .then(user => {
        state = { host, token, username: user.login };
        showNoteList();
      })
      .catch(() => showSettings());
  } else {
    showSettings();
  }
}

function showSettings(error?: string): void {
  titleHandle?.destroy(); titleHandle = null;
  veditor?.destroyEditor();

  const savedHost = localStorage.getItem(LS_HOST) ?? DEFAULT_HOST;
  const savedToken = localStorage.getItem(LS_TOKEN) ?? '';
  const savedRepo = localStorage.getItem(LS_DEFAULT_REPO) ?? '';
  const savedPinned = getPinnedIssue();

  app.innerHTML = `
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>GitHub Issues as notes, with vi keybindings.</p>
      ${error ? `<div class="error">${error}</div>` : ''}
      <form id="settings-form">
        <label>GitHub Host
          <input type="text" id="settings-host" value="${escapeAttr(savedHost)}" required />
        </label>
        <label>Personal Access Token
          <input type="password" id="settings-pat" value="${escapeAttr(savedToken)}" placeholder="ghp_..." required />
        </label>
        <label>Default Repository
          <input type="text" id="settings-repo" value="${escapeAttr(savedRepo)}" placeholder="owner/repo" required />
        </label>
        <label>Pinned Issue Number <span style="color:#6c7086">(optional)</span>
          <input type="number" id="settings-pinned" value="${savedPinned?.number ?? ''}" placeholder="e.g. 7" min="1" />
        </label>
        <button type="submit">Save &amp; Continue</button>
      </form>
    </div>
  `;

  document.getElementById('settings-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const host = (document.getElementById('settings-host') as HTMLInputElement).value.trim();
    const token = (document.getElementById('settings-pat') as HTMLInputElement).value.trim();
    const repoVal = (document.getElementById('settings-repo') as HTMLInputElement).value.trim();
    const pinnedVal = (document.getElementById('settings-pinned') as HTMLInputElement).value.trim();

    const parts = repoVal.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      showSettings('Repository must be in owner/repo format.');
      return;
    }

    try {
      logInfo(`Settings: Validating token for host=${host}`);
      const user = await validateToken(host, token);
      logInfo(`Settings: Token validated for user ${user.login} on ${host}`);
      localStorage.setItem(LS_HOST, host);
      localStorage.setItem(LS_TOKEN, token);
      localStorage.setItem(LS_DEFAULT_REPO, repoVal);
      state = { host, token, username: user.login };

      if (pinnedVal) {
        const num = parseInt(pinnedVal, 10);
        if (isNaN(num) || num < 1) {
          showSettings('Pinned issue must be a positive number.');
          return;
        }
        localStorage.setItem(LS_PINNED_ISSUE, JSON.stringify({ owner: parts[0], repo: parts[1], number: num }));
      } else {
        localStorage.removeItem(LS_PINNED_ISSUE);
      }

      showNoteList();
    } catch (err) {
      logError(`Settings: Token validation failed for host=${host}: ${err instanceof Error ? err.message : err}`);
      showSettings(`Authentication failed: ${err instanceof Error ? err.message : err}`);
    }
  });
}

let cleanupListKeys: (() => void) | null = null;

async function showNoteList(): Promise<void> {
  titleHandle?.destroy(); titleHandle = null;
  veditor?.destroyEditor();
  cleanupListKeys?.();
  cleanupListKeys = null;
  currentNote = null;

  if (!state) return;

  let notesList: NoteSearchResult[] = [];

  app.innerHTML = `
    <div class="note-list-screen">
      <header>
        <h1>notehub</h1>
        <div class="header-info">
          <span>@${state.username}</span>
          <button id="logs-btn" title="View debug logs">Logs</button>
          <button id="settings-btn" title="Settings">Settings</button>
          <button id="sign-out">Sign out</button>
        </div>
      </header>
      <div class="toolbar">
        <button id="new-note">New Note</button>
        <button id="refresh">Refresh</button>
      </div>
      <div id="notes-container"><p>Loading...</p></div>
      <footer class="note-list-footer">
        <span><kbd>j</kbd><kbd>k</kbd> Navigate</span>
        <span><kbd>Enter</kbd> Open note</span>
        <span><kbd>n</kbd> New note</span>
        <span><kbd>r</kbd> Refresh</span>
        <span><kbd>/</kbd> Search</span>
      </footer>
    </div>
  `;

  const container = document.getElementById('notes-container')!;
  let selectedIndex = 0;

  function updateSelection() {
    const rows = container.querySelectorAll('.note-row');
    rows.forEach((row, i) => {
      row.classList.toggle('selected', i === selectedIndex);
    });
    rows[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }

  const onListKey = (e: KeyboardEvent) => {
    // Ignore if typing in an input, or overlay is open
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (searchInputFocused) return; // let the search input handle its own keys
    if (document.getElementById('repo-picker-overlay')) return;

    if (e.key === 'n') {
      e.preventDefault();
      document.getElementById('new-note')!.click();
    } else if (e.key === 'r') {
      e.preventDefault();
      showNoteList();
    } else if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      const rows = container.querySelectorAll('.note-row');
      if (rows.length > 0) {
        selectedIndex = Math.min(selectedIndex + 1, rows.length - 1);
        updateSelection();
      }
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
        updateSelection();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const rows = container.querySelectorAll('.note-row');
      if (rows.length > 0) {
        (rows[selectedIndex] as HTMLElement).click();
      }
    } else if (e.key === 'Escape' && searchActive) {
      e.preventDefault();
      dismissSearch();
    } else if (e.key === '/') {
      e.preventDefault();
      showSearchBar();
    }
  };
  document.addEventListener('keydown', onListKey);
  cleanupListKeys = () => document.removeEventListener('keydown', onListKey);

  // --- Federated search ---
  let searchBarHandle: ReturnType<typeof import('./veditor').createVimInput> | null = null;
  let searchActive = false;
  let searchInputFocused = false; // true only while the search input itself has keyboard focus
  let regexMode = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let fullTableHtml = ''; // stashed when search activates

  interface SearchMatch {
    note: NoteSearchResult;
    index: number; // index in notesList
    context: string; // HTML snippet with <mark> highlighting
  }

  function showSearchBar(): void {
    if (searchActive) return;
    searchActive = true;
    searchInputFocused = true;

    // Stash the current table so we can restore on dismiss
    fullTableHtml = container.innerHTML;

    // Create search bar element
    const bar = document.createElement('div');
    bar.className = 'search-bar';
    bar.id = 'search-bar';
    bar.innerHTML = `
      <span class="search-slash">/</span>
      <div id="search-input-container"></div>
      <button id="search-regex-toggle" class="search-regex-toggle" title="Toggle regex (Ctrl+R)">.*</button>
      <span id="search-count" class="search-count"></span>
    `;

    // Insert before the notes container
    container.parentElement!.insertBefore(bar, container);

    // Track whether the search input has keyboard focus so onListKey knows
    // whether to handle j/k/Enter (list mode) or stay hands-off (input mode).
    bar.addEventListener('focusin', () => { searchInputFocused = true; });
    bar.addEventListener('focusout', () => { searchInputFocused = false; });

    // Create vim input for the search field
    searchBarHandle = veditor.createVimInput(
      document.getElementById('search-input-container')!,
      {
        placeholder: 'Search notes...',
        initialInsert: true,
        onEscape: dismissSearch,
        onChange: (value: string) => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => runSearch(value), 150);
        },
        onEnter: () => {
          // Move focus from the search input to the list so j/k/Enter work there.
          // The search bar stays visible; Escape dismisses it.
          (document.activeElement as HTMLElement)?.blur();
        },
        storagePrefix: 'notehub',
      },
    );
    searchBarHandle.focus();

    updateRegexToggle();

    document.getElementById('search-regex-toggle')!.addEventListener('click', () => {
      regexMode = !regexMode;
      updateRegexToggle();
      // Re-run search with current query
      if (searchBarHandle) runSearch(searchBarHandle.getValue());
    });

    // Ctrl+R toggles regex while search bar is focused
    bar.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        regexMode = !regexMode;
        updateRegexToggle();
        if (searchBarHandle) runSearch(searchBarHandle.getValue());
      }
    });
  }

  function updateRegexToggle(): void {
    const btn = document.getElementById('search-regex-toggle');
    if (btn) btn.classList.toggle('active', regexMode);
  }

  function dismissSearch(): void {
    if (!searchActive) return;
    searchActive = false;
    searchInputFocused = false;

    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    searchBarHandle?.destroy();
    searchBarHandle = null;

    document.getElementById('search-bar')?.remove();

    // Restore original table
    if (fullTableHtml) {
      container.innerHTML = fullTableHtml;
      fullTableHtml = '';
      rebindNoteRows();
    }
    selectedIndex = 0;
    updateSelection();
  }

  function runSearch(query: string): void {
    const countEl = document.getElementById('search-count');
    if (!query.trim()) {
      // Empty query — restore full list
      if (fullTableHtml) {
        container.innerHTML = fullTableHtml;
        rebindNoteRows();
      }
      if (countEl) countEl.textContent = '';
      selectedIndex = 0;
      updateSelection();
      return;
    }

    const matches = performSearch(query, regexMode, notesList);
    if (countEl) countEl.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;
    renderSearchResults(matches);
  }

  function performSearch(query: string, useRegex: boolean, notes: NoteSearchResult[]): SearchMatch[] {
    let matcher: (text: string) => { index: number; length: number } | null;

    if (useRegex) {
      let re: RegExp;
      try {
        re = new RegExp(query, 'gi');
      } catch {
        // Invalid regex — show error indicator
        const countEl = document.getElementById('search-count');
        if (countEl) { countEl.textContent = 'invalid regex'; countEl.classList.add('error'); }
        return [];
      }
      const countEl = document.getElementById('search-count');
      if (countEl) countEl.classList.remove('error');

      matcher = (text: string) => {
        re.lastIndex = 0;
        const m = re.exec(text);
        return m ? { index: m.index, length: m[0].length } : null;
      };
    } else {
      const lower = query.toLowerCase();
      matcher = (text: string) => {
        const idx = text.toLowerCase().indexOf(lower);
        return idx >= 0 ? { index: idx, length: lower.length } : null;
      };
    }

    const results: SearchMatch[] = [];
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      const body = n.body ?? '';
      const titleMatch = matcher(n.title);
      const bodyMatch = matcher(body);
      if (!titleMatch && !bodyMatch) continue;

      // Build context snippet from the best match
      const match = bodyMatch ?? titleMatch!;
      const source = bodyMatch ? body : n.title;
      const contextRadius = 40;
      const start = Math.max(0, match.index - contextRadius);
      const end = Math.min(source.length, match.index + match.length + contextRadius);

      const before = escapeHtml(source.slice(start, match.index));
      const matched = escapeHtml(source.slice(match.index, match.index + match.length));
      const after = escapeHtml(source.slice(match.index + match.length, end));
      const prefix = start > 0 ? '...' : '';
      const suffix = end < source.length ? '...' : '';
      const context = `${prefix}${before}<mark>${matched}</mark>${after}${suffix}`;

      results.push({ note: n, index: i, context });
    }
    return results;
  }

  function renderSearchResults(matches: SearchMatch[]): void {
    if (matches.length === 0) {
      container.innerHTML = '<p class="empty">No matches found.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Context</th><th>Updated</th><th>Repo</th></tr></thead>
        <tbody>
          ${matches.map((m, i) => `
            <tr class="note-row" data-index="${m.index}" data-result-index="${i}">
              <td>${escapeHtml(m.note.title)}</td>
              <td>${m.note.number}</td>
              <td></td>
              <td class="search-context">${m.context}</td>
              <td>${new Date(m.note.updated_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</td>
              <td><span title="${escapeAttr(m.note.owner)}/${escapeAttr(m.note.repo)}">${escapeHtml(m.note.repo)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    selectedIndex = 0;
    updateSelection();

    // Bind click handlers for search result rows
    container.querySelectorAll('.note-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-index')!, 10);
        const note = notesList[idx];
        if (isMobile) {
          window.open(issueUrl(state!.host, note.owner, note.repo, note.number) + '#new_comment_field', '_blank');
        } else {
          openNote(note.owner, note.repo, note.number);
        }
      });
    });
  }

  // Re-bind click handlers after restoring the full table HTML
  function rebindNoteRows(): void {
    container.querySelectorAll('.copy-url-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = (btn as HTMLElement).dataset.url!;
        navigator.clipboard.writeText(url).then(() => {
          btn.innerHTML = checkIcon;
          setTimeout(() => { btn.innerHTML = clipboardIcon; }, 1500);
        });
      });
    });

    container.querySelectorAll('.context-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelector('.note-context-menu')?.remove();

        const idx = parseInt((btn as HTMLElement).dataset.index!, 10);
        const note = notesList[idx];
        const rect = (btn as HTMLElement).getBoundingClientRect();

        const menu = document.createElement('div');
        menu.className = 'note-context-menu';
        menu.innerHTML = `
          <button class="context-github-btn">${externalIcon} Edit on GitHub</button>
          <button class="context-delete-btn">${xIcon} Delete</button>
        `;
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.left = `${rect.right}px`;
        document.body.appendChild(menu);

        const closeMenu = () => { menu.remove(); document.removeEventListener('click', closeMenu); };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);

        menu.querySelector('.context-github-btn')!.addEventListener('click', (ev) => {
          ev.stopPropagation();
          closeMenu();
          window.open(issueUrl(state!.host, note.owner, note.repo, note.number) + '#new_comment_field', '_blank');
        });

        menu.querySelector('.context-delete-btn')!.addEventListener('click', async (ev) => {
          ev.stopPropagation();
          closeMenu();
          try {
            await archiveNote(state!.host, state!.token, note.owner, note.repo, note.number);
            const row = container.querySelector(`.note-row[data-index="${idx}"]`);
            row?.remove();
          } catch (err) {
            alert(`Failed to delete note: ${err instanceof Error ? err.message : err}`);
          }
        });
      });
    });

    container.querySelectorAll('.note-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-index')!, 10);
        const note = notesList[idx];
        if (isMobile) {
          window.open(issueUrl(state!.host, note.owner, note.repo, note.number) + '#new_comment_field', '_blank');
        } else {
          openNote(note.owner, note.repo, note.number);
        }
      });
    });
  }

  document.getElementById('settings-btn')!.addEventListener('click', () => showSettings());

  document.getElementById('sign-out')!.addEventListener('click', () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_HOST);
    state = null;
    showSettings();
  });

  document.getElementById('refresh')!.addEventListener('click', () => showNoteList());

  document.getElementById('logs-btn')!.addEventListener('click', () => {
    document.body.appendChild(createLogViewer());
  });

  try {
    logInfo(`Note list: Fetching notes for all configured repos`);
    notesList = await searchNotes(state.host, state.token);
    logInfo(`Note list: Loaded ${notesList.length} notes`);

    // If we just created a note, the Search API may not have indexed it yet.
    // Merge it into the results if missing.
    if (justCreatedNote) {
      const jc = justCreatedNote;
      justCreatedNote = null;
      const alreadyPresent = notesList.some(
        n => n.owner === jc.owner && n.repo === jc.repo && n.number === jc.number
      );
      if (!alreadyPresent) {
        logWarn(`Note list: Search API may not have indexed newly created note yet; using cache`);
        notesList.unshift(jc);
      }
    }

    // Pin the default issue to the top (if configured)
    const pinned = getPinnedIssue();
    if (pinned) {
      const isPinned = (n: NoteSearchResult) =>
        n.owner === pinned.owner && n.repo === pinned.repo && n.number === pinned.number;
      notesList.sort((a, b) => (isPinned(a) ? -1 : isPinned(b) ? 1 : 0));
    }

    document.getElementById('new-note')!.addEventListener('click', () => {
      showRepoPicker(notesList);
    });
    if (notesList.length === 0) {
      container.innerHTML = '<p class="empty">No notes found.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead><tr><th>Title</th><th>#</th><th></th><th>Updated</th><th></th><th>Repo</th></tr></thead>
        <tbody>
          ${notesList.map((n, i) => `
            <tr class="note-row" data-index="${i}">
              <td>${escapeHtml(n.title)}<span class="attachment-count-badge" data-owner="${escapeAttr(n.owner)}" data-repo="${escapeAttr(n.repo)}" data-issue="${n.number}"></span></td>
              <td><a href="${escapeAttr(issueUrl(state!.host, n.owner, n.repo, n.number))}" target="${hashTarget(issueUrl(state!.host, n.owner, n.repo, n.number))}" class="issue-link" onclick="event.stopPropagation()">${n.number}</a></td>
              <td><button class="copy-url-btn" data-url="${escapeAttr(issueUrl(state!.host, n.owner, n.repo, n.number))}" title="Copy issue URL">${clipboardIcon}</button></td>
              <td>${new Date(n.updated_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</td>
              <td><button class="context-menu-btn" data-index="${i}" title="More actions">&#x2026;</button></td>
              <td><span title="${escapeAttr(n.owner)}/${escapeAttr(n.repo)}">${escapeHtml(n.repo)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.querySelectorAll('.copy-url-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = (btn as HTMLElement).dataset.url!;
        navigator.clipboard.writeText(url).then(() => {
          btn.innerHTML = checkIcon;
          setTimeout(() => { btn.innerHTML = clipboardIcon; }, 1500);
        });
      });
    });

    container.querySelectorAll('.context-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close any existing context menu
        document.querySelector('.note-context-menu')?.remove();

        const idx = parseInt((btn as HTMLElement).dataset.index!, 10);
        const note = notesList[idx];
        const rect = (btn as HTMLElement).getBoundingClientRect();

        const menu = document.createElement('div');
        menu.className = 'note-context-menu';
        menu.innerHTML = `
          <button class="context-github-btn">${externalIcon} Edit on GitHub</button>
          <button class="context-delete-btn">${xIcon} Delete</button>
        `;
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.left = `${rect.right}px`;
        document.body.appendChild(menu);

        const closeMenu = () => { menu.remove(); document.removeEventListener('click', closeMenu); };
        // Close on next click anywhere
        setTimeout(() => document.addEventListener('click', closeMenu), 0);

        menu.querySelector('.context-github-btn')!.addEventListener('click', (ev) => {
          ev.stopPropagation();
          closeMenu();
          window.open(issueUrl(state!.host, note.owner, note.repo, note.number) + '#new_comment_field', '_blank');
        });

        menu.querySelector('.context-delete-btn')!.addEventListener('click', async (ev) => {
          ev.stopPropagation();
          closeMenu();
          try {
            await archiveNote(state!.host, state!.token, note.owner, note.repo, note.number);
            // Remove the row from the list
            const row = container.querySelector(`.note-row[data-index="${idx}"]`);
            row?.remove();
          } catch (err) {
            alert(`Failed to delete note: ${err instanceof Error ? err.message : err}`);
          }
        });
      });
    });

    container.querySelectorAll('.note-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-index')!, 10);
        const note = notesList[idx];
        if (isMobile) {
          window.open(issueUrl(state!.host, note.owner, note.repo, note.number) + '#new_comment_field', '_blank');
        } else {
          openNote(note.owner, note.repo, note.number);
        }
      });
    });

    updateSelection();

    // Async: fetch attachment counts per unique repo and populate badges
    loadAttachmentBadges(notesList).catch(() => {});
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Note list: Failed to load notes: ${msg}`);
    document.getElementById('notes-container')!.innerHTML =
      `<p class="error">Failed to load notes: ${msg}</p>`;
  }
}

async function loadAttachmentBadges(_notes: NoteSearchResult[]): Promise<void> {
  if (!state) return;
  const ar = getAttachmentsRepo();
  if (!ar) return;

  const counts = await fetchAttachmentCounts(state.host, state.token, ar.owner, ar.repo);
  document.querySelectorAll<HTMLElement>('.attachment-count-badge').forEach(badge => {
    const key = `${badge.dataset.owner}/${badge.dataset.repo}/${badge.dataset.issue}`;
    const count = counts.get(key);
    if (count) badge.textContent = ` 📎${count}`;
  });
}

function showRepoPicker(notesList: NoteSearchResult[]): void {
  // Remove existing picker if any
  document.getElementById('repo-picker-overlay')?.remove();

  // Extract unique owner/repo pairs, sorted with default repo first
  const repoSet = new Map<string, { owner: string; repo: string }>();
  // Always include the default repo if configured
  const defaultRepo = getDefaultRepo();
  if (defaultRepo) {
    const [defOwner, defRepo] = defaultRepo.split('/');
    repoSet.set(defaultRepo, { owner: defOwner, repo: defRepo });
  }
  for (const n of notesList) {
    const key = `${n.owner}/${n.repo}`;
    if (!repoSet.has(key)) repoSet.set(key, { owner: n.owner, repo: n.repo });
  }
  const sortedRepos = Array.from(repoSet.entries()).sort((a, b) => {
    if (defaultRepo) {
      if (a[0] === defaultRepo) return -1;
      if (b[0] === defaultRepo) return 1;
    }
    return a[0].localeCompare(b[0]);
  });

  const overlay = document.createElement('div');
  overlay.id = 'repo-picker-overlay';
  overlay.innerHTML = `
    <div class="repo-picker">
      <h2>Select repository</h2>
      <div class="repo-list">
        ${sortedRepos.map(([key, r]) => `
          <button class="repo-option" data-owner="${escapeAttr(r.owner)}" data-repo="${escapeAttr(r.repo)}">${escapeHtml(key)}</button>
        `).join('')}
      </div>
      <div class="repo-other">
        <label>Other
          <input type="text" id="repo-other-input" placeholder="owner/repo" />
        </label>
        <button id="repo-other-go">Go</button>
      </div>
    </div>
  `;

  app.appendChild(overlay);

  // Close on overlay background click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  // Close on Escape
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); }
  };
  document.addEventListener('keydown', onKey);

  // Repo buttons
  overlay.querySelectorAll('.repo-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const owner = (btn as HTMLElement).dataset.owner!;
      const repo = (btn as HTMLElement).dataset.repo!;
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      openNewNote(owner, repo);
    });
  });

  // Other input
  const goBtn = document.getElementById('repo-other-go')!;
  const otherInput = document.getElementById('repo-other-input') as HTMLInputElement;

  const submitOther = () => {
    const val = otherInput.value.trim();
    const parts = val.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      otherInput.classList.add('error');
      return;
    }
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    openNewNote(parts[0], parts[1]);
  };

  goBtn.addEventListener('click', submitOther);
  otherInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitOther();
  });
}

async function openNewNote(owner: string, repo: string): Promise<void> {
  if (isMobile) {
    window.open(`https://${state!.host}/${owner}/${repo}/issues/new`, '_blank');
    return;
  }
  if (!state) return;
  if (!await repoExists(state.host, state.token, owner, repo)) {
    logError(`Auth: Repo validation failed for ${owner}/${repo}`);
    alert(`Repository "${owner}/${repo}" not found. Check the owner and repo name.`);
    return;
  }
  newNoteTarget = { owner, repo };
  currentNote = null;
  originalBody = DEFAULT_NEW_BODY;
  originalTitle = DEFAULT_NEW_TITLE;
  loadedUpdatedAt = null;
  renderEditor(DEFAULT_NEW_TITLE, DEFAULT_NEW_BODY);
}

async function openNote(owner: string, repo: string, number: number): Promise<void> {
  if (!state) return;

  app.innerHTML = `<div class="editor-screen"><p>Loading note #${number}...</p></div>`;

  try {
    logInfo(`Note: Opening note #${number} from ${owner}/${repo}`);
    const note = await getNote(state.host, state.token, owner, repo, number);
    logInfo(`Note: Loaded note #${number}: "${note.title}"`);
    currentNote = { ...note, owner, repo };
    originalBody = note.body ?? '';
    originalTitle = note.title;
    loadedUpdatedAt = note.updated_at;
    renderEditor(note.title, originalBody);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Note: Failed to load note #${number}: ${msg}`);
    app.innerHTML = `<div class="editor-screen"><p class="error">Failed to load note: ${msg}</p></div>`;
  }
}

function renderEditor(title: string, body: string): void {
  cleanupListKeys?.();
  cleanupListKeys = null;

  app.innerHTML = `
    <div class="editor-screen">
      <header>
        <button id="back-to-list" title="Back to notes">&larr;</button>
        <div id="note-title-container"></div>
        <span id="note-number">${currentNote ? `<a href="${escapeAttr(issueUrl(state!.host, currentNote.owner, currentNote.repo, currentNote.number))}" target="${hashTarget(issueUrl(state!.host, currentNote.owner, currentNote.repo, currentNote.number))}" class="issue-link">#${currentNote.number}</a>` : 'Title'}</span>
        ${currentNote ? `<button id="copy-note-url" class="copy-url-btn" title="Copy issue URL">${clipboardIcon}</button>` : ''}
        ${currentNote ? `<button id="attachment-toggle-btn" class="attachment-toggle-btn" title="Attachments (ga)">${paperclipIcon}</button>` : ''}
        ${currentNote ? `<button id="delete-note-btn" class="delete-note-btn" title="Delete note">${xIcon}</button>` : ''}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `;

  document.getElementById('back-to-list')!.addEventListener('click', () => {
    veditor.requestQuit();
  });

  const copyBtn = document.getElementById('copy-note-url');
  if (copyBtn && currentNote) {
    const url = issueUrl(state!.host, currentNote.owner, currentNote.repo, currentNote.number);
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        copyBtn.innerHTML = checkIcon;
        setTimeout(() => { copyBtn.innerHTML = clipboardIcon; }, 1500);
      });
    });
  }

  document.getElementById('attachment-toggle-btn')?.addEventListener('click', () => toggleAttachmentPanel());

  document.getElementById('delete-note-btn')?.addEventListener('click', () => handleDelete());

  titleHandle = veditor.createVimInput(
    document.getElementById('note-title-container')!,
    {
      value: title,
      onEnter: () => veditor.focusEditor(),
      onEscape: () => veditor.focusEditor(),
      storagePrefix: 'notehub',
    },
  );

  veditor.createEditor(document.getElementById('editor-container')!, body, {
    onSave: handleSave,
    onQuit: () => showNoteList(),
    isAppDirty: () => titleHandle!.getValue().trim() !== originalTitle,
  }, {
    storagePrefix: 'notehub',
    normalMappings: {
      'gt': () => titleHandle!.focus(),
      'ga': () => toggleAttachmentPanel(),
    },
  });

  // Auto-open attachment panel if the note already has attachments
  if (currentNote) {
    const note = currentNote;
    const ar = getAttachmentsRepo();
    if (ar) {
      listAttachments(state!.host, state!.token, ar.owner, ar.repo, note.owner, note.repo, note.number)
        .then(attachments => {
          if (attachments.length > 0 && document.querySelector('.editor-screen')) {
            openAttachmentPanel();
          }
        })
        .catch(() => {});
    }
  }
}

async function handleSave(): Promise<void> {
  if (!state) return;

  const body = veditor.getEditorContent();
  const title = (titleHandle?.getValue() ?? '').trim();

  // Creating a new note
  if (!currentNote && newNoteTarget) {
    if (!title) {
      showStatus('Title required', true);
      return;
    }
    try {
      showStatus('Creating...');
      logInfo(`Note: Creating new note in ${newNoteTarget.owner}/${newNoteTarget.repo}`);
      const created = await createNote(state.host, state.token, newNoteTarget.owner, newNoteTarget.repo, title, body);
      logInfo(`Note: Created new note: #${created.number}`);
      currentNote = { ...created, owner: newNoteTarget.owner, repo: newNoteTarget.repo };
      justCreatedNote = currentNote;
      newNoteTarget = null;
      originalBody = created.body ?? '';
      originalTitle = created.title;
      loadedUpdatedAt = created.updated_at;
      // Update header to show issue number
      const numEl = document.getElementById('note-number');
      if (numEl) {
        numEl.innerHTML = `<a href="${escapeAttr(issueUrl(state.host, currentNote.owner, currentNote.repo, currentNote.number))}" target="${hashTarget(issueUrl(state.host, currentNote.owner, currentNote.repo, currentNote.number))}" class="issue-link">#${currentNote.number}</a>`;
      }

      showStatus('Created');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError(`Note: Failed to create note: ${msg}`);
      showStatus(`Create failed: ${msg}`, true);
    }
    return;
  }

  if (!currentNote) return;

  // Updating an existing note
  const data: { title?: string; body?: string } = {};
  if (body !== originalBody) data.body = body;
  if (title !== originalTitle) data.title = title;

  if (Object.keys(data).length === 0) {
    showStatus('No changes');
    return;
  }

  try {
    showStatus('Saving...');
    logInfo(`Note: Save initiated for #${currentNote.number}`);

    // Check for remote changes before saving
    const fresh = await getNote(state.host, state.token, currentNote.owner, currentNote.repo, currentNote.number);
    if (loadedUpdatedAt && fresh.updated_at !== loadedUpdatedAt) {
      logWarn(`Note: Remote conflict detected for #${currentNote.number}; user chose to overwrite`);
      const overwrite = await showConflictDialog();
      if (!overwrite) {
        logInfo(`Note: Save cancelled due to conflict`);
        showStatus('Save cancelled');
        return;
      }
    }

    const updated = await updateNote(state.host, state.token, currentNote.owner, currentNote.repo, currentNote.number, data);
    logInfo(`Note: Save successful for #${currentNote.number}: "${updated.title}"`);
    originalBody = updated.body ?? '';
    originalTitle = updated.title;
    loadedUpdatedAt = updated.updated_at;
    currentNote = { ...updated, owner: currentNote.owner, repo: currentNote.repo };
    showStatus('Saved');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Note: Save failed for #${currentNote.number}: ${msg}`);
    showStatus(`Save failed: ${msg}`, true);
  }
}

async function handleDelete(): Promise<void> {
  if (!state || !currentNote) return;

  const confirmed = confirm(`Delete note "#${currentNote.number}: ${originalTitle}"?`);
  if (!confirmed) return;

  try {
    showStatus('Deleting...');
    const result = await archiveNote(state.host, state.token, currentNote.owner, currentNote.repo, currentNote.number);

    // Verify the note was actually closed
    if (result.state !== 'closed') {
      const msg = 'Delete failed: note was not closed';
      showStatus(msg, true);
      logError(msg);
      return;
    }

    logInfo(`Deleted note #${currentNote.number}: ${originalTitle}`);
    showStatus('Deleted');
    // Give user brief moment to see the status message, then return to list
    setTimeout(() => {
      showNoteList();
    }, 500);
  } catch (err) {
    const msg = `Delete failed: ${err instanceof Error ? err.message : err}`;
    showStatus(msg, true);
    logError(msg);
  }
}

// ---------------------------------------------------------------------------
// Conflict Dialog
// ---------------------------------------------------------------------------

function showConflictDialog(): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'conflict-overlay';
    overlay.innerHTML = `
      <div class="conflict-dialog">
        <h3>Note changed</h3>
        <p>This note has been modified since you opened it. Saving will overwrite those changes.</p>
        <div class="conflict-actions">
          <button id="conflict-cancel">Cancel</button>
          <button id="conflict-overwrite" class="danger">Overwrite</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const cleanup = (result: boolean) => {
      overlay.remove();
      document.removeEventListener('keydown', keyHandler);
      resolve(result);
    };

    function keyHandler(e: KeyboardEvent): void {
      if (e.key === 'Escape') cleanup(false);
    }

    overlay.querySelector('#conflict-cancel')!.addEventListener('click', () => cleanup(false));
    overlay.querySelector('#conflict-overwrite')!.addEventListener('click', () => cleanup(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
    document.addEventListener('keydown', keyHandler);
  });
}

// ---------------------------------------------------------------------------
// Attachment Panel
// ---------------------------------------------------------------------------

function toggleAttachmentPanel(): void {
  if (document.getElementById('attachment-panel')) {
    closeAttachmentPanel();
  } else {
    openAttachmentPanel();
  }
}

function closeAttachmentPanel(): void {
  document.getElementById('attachment-panel')?.remove();
  currentAttachments = [];
  selectedAttachmentIndex = 0;
  multiSelectedAttachments.clear();
  veditor?.focusEditor();
}

async function openAttachmentPanel(): Promise<void> {
  if (!currentNote || !state) return;

  const editorScreen = document.querySelector('.editor-screen');
  if (!editorScreen) return;

  // Build repo link for header
  const ar = getAttachmentsRepo();
  const repoLink = ar && state && currentNote
    ? `https://${state.host}/${ar.owner}/${ar.repo}/tree/main/${currentNote.owner}/${currentNote.repo}/${currentNote.number}`
    : '';

  const panel = document.createElement('div');
  panel.id = 'attachment-panel';
  panel.className = 'attachment-panel';
  panel.tabIndex = 0;
  panel.innerHTML = `
    <div class="attachment-panel-header">
      <span class="attachment-panel-title">
        ${paperclipIcon} Attachments
        ${repoLink ? `<a href="${repoLink}" target="_blank" class="attachment-repo-link" title="Open attachments folder on GitHub">\u2197</a>` : ''}
      </span>
      <button id="attachment-close-btn" class="attachment-close-btn" title="Close (Esc)">\u2715</button>
    </div>
    <div id="attachment-list" class="attachment-list"><p class="attachment-loading">Loading...</p></div>
    <div class="attachment-panel-footer">
      <span class="footer-action" data-action="navigate"><kbd>j</kbd><kbd>k</kbd> Nav</span>
      <span class="footer-action" data-action="select"><kbd>Space</kbd> Select</span>
      <span class="footer-action" data-action="upload"><kbd>a</kbd> Upload</span>
      <span class="footer-action" data-action="download"><kbd>Enter</kbd> Download</span>
      <span class="footer-action" data-action="preview"><kbd>p</kbd> Preview</span>
      <span class="footer-action" data-action="delete"><kbd>x</kbd> Delete</span>
      <span class="footer-action" data-action="close"><kbd>Esc</kbd> Close</span>
    </div>
  `;

  editorScreen.appendChild(panel);
  panel.focus();

  document.getElementById('attachment-close-btn')!.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAttachmentPanel();
  });

  // Clickable footer actions
  panel.querySelectorAll('.footer-action[data-action]').forEach(el => {
    const action = (el as HTMLElement).dataset.action;
    if (action === 'navigate') return; // j/k not meaningful as click
    (el as HTMLElement).style.cursor = 'pointer';
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (action === 'select') toggleMultiSelect();
      else if (action === 'upload') await handleAttachmentUpload();
      else if (action === 'download') await downloadSelectedAttachment();
      else if (action === 'preview') await previewSelectedAttachment();
      else if (action === 'delete') await deleteSelectedAttachments();
      else if (action === 'close') closeAttachmentPanel();
      panel.focus();
    });
  });

  panel.addEventListener('keydown', async (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAttachmentPanel();
    } else if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveAttachmentSelection(1);
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveAttachmentSelection(-1);
    } else if (e.key === 'a') {
      e.preventDefault();
      await handleAttachmentUpload();
    } else if (e.key === 'Enter' || e.key === 'd') {
      e.preventDefault();
      await downloadSelectedAttachment();
    } else if (e.key === 'p') {
      e.preventDefault();
      await previewSelectedAttachment();
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleMultiSelect();
    } else if (e.key === 'x') {
      e.preventDefault();
      await deleteSelectedAttachments();
    }
  });

  await refreshAttachmentList();
}

async function refreshAttachmentList(): Promise<void> {
  if (!currentNote || !state) return;
  const listEl = document.getElementById('attachment-list');
  if (!listEl) return;

  const ar = await ensureAttachmentRepo();
  if (!ar) {
    listEl.innerHTML = '<p class="attachment-error">Attachments repo not available.</p>';
    return;
  }

  try {
    currentAttachments = await listAttachments(
      state.host, state.token, ar.owner, ar.repo, currentNote.owner, currentNote.repo, currentNote.number,
    );
  } catch (err) {
    listEl.innerHTML = `<p class="attachment-error">Failed to load: ${err instanceof Error ? err.message : err}</p>`;
    return;
  }

  selectedAttachmentIndex = 0;
  renderAttachmentRows(listEl);
}

function renderAttachmentRows(listEl: HTMLElement): void {
  if (currentAttachments.length === 0) {
    listEl.innerHTML = '<p class="attachment-empty">No attachments yet. Press <kbd>a</kbd> to upload.</p>';
    return;
  }

  listEl.innerHTML = currentAttachments.map((a, i) => {
    const isCursor = i === selectedAttachmentIndex;
    const isMulti = multiSelectedAttachments.has(i);
    const classes = ['attachment-row', isCursor ? 'selected' : '', isMulti ? 'multi-selected' : ''].filter(Boolean).join(' ');
    return `
    <div class="${classes}" data-index="${i}">
      <span class="attachment-checkbox">${isMulti ? '\u2611' : '\u2610'}</span>
      <span class="attachment-name" title="Click to preview, Ctrl+click to download">${escapeHtml(a.name)}</span>
      <span class="attachment-size">${formatAttachmentSize(a.size)}</span>
    </div>`;
  }).join('');

  // Track whether panel had focus before mousedown (click changes focus)
  let panelHadFocus = false;
  const panel = document.getElementById('attachment-panel');
  listEl.addEventListener('mousedown', () => {
    panelHadFocus = panel === document.activeElement;
  });

  listEl.querySelectorAll('.attachment-row').forEach(row => {
    const idx = parseInt((row as HTMLElement).dataset.index!, 10);

    // Click on checkbox toggles multi-select (only if panel already focused)
    row.querySelector('.attachment-checkbox')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!panelHadFocus) { panel?.focus(); return; }
      selectedAttachmentIndex = idx;
      if (multiSelectedAttachments.has(idx)) multiSelectedAttachments.delete(idx);
      else multiSelectedAttachments.add(idx);
      renderAttachmentRows(listEl);
      panel?.focus();
    });

    // Click on name: Ctrl+click downloads, plain click previews (only if panel focused)
    row.querySelector('.attachment-name')?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!panelHadFocus) { panel?.focus(); return; }
      selectedAttachmentIndex = idx;
      renderAttachmentRows(listEl);
      if ((e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey) {
        await downloadAttachmentByIndex(idx);
      } else {
        await previewSelectedAttachment();
      }
      panel?.focus();
    });

    // Click on row (outside name/checkbox): focus-only if panel wasn't focused, else move cursor
    row.addEventListener('click', () => {
      if (!panelHadFocus) { panel?.focus(); return; }
      selectedAttachmentIndex = idx;
      renderAttachmentRows(listEl);
      panel?.focus();
    });
  });

  // Scroll selected row into view
  const selectedRow = listEl.querySelector('.attachment-row.selected');
  selectedRow?.scrollIntoView({ block: 'nearest' });
}

function moveAttachmentSelection(delta: number): void {
  if (currentAttachments.length === 0) return;
  selectedAttachmentIndex = Math.max(0, Math.min(currentAttachments.length - 1, selectedAttachmentIndex + delta));
  const listEl = document.getElementById('attachment-list');
  if (listEl) renderAttachmentRows(listEl);
}

async function handleAttachmentUpload(): Promise<void> {
  if (!currentNote || !state) return;

  const ar = await ensureAttachmentRepo();
  if (!ar) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.onchange = async () => {
    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    // Fetch current SHA list once for all files
    let existingShas: Record<string, string> = {};
    try {
      const fresh = await listAttachments(
        state!.host, state!.token, ar.owner, ar.repo, currentNote!.owner, currentNote!.repo, currentNote!.number,
      );
      existingShas = Object.fromEntries(fresh.map(a => [a.name, a.sha]));
    } catch { /* ignore — treat as new files */ }

    const uploadedLinks: string[] = [];
    const failed: string[] = [];

    for (const file of files) {
      try {
        showStatus(`Uploading ${uploadedLinks.length + 1}/${files.length}...`);
        logInfo(`Attachment: Uploading ${file.name}`);

        // Read as ArrayBuffer and base64-encode in chunks (safe for large files)
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const CHUNK = 8192;
        let binary = '';
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
        }
        const base64 = btoa(binary);

        const attachment = await uploadAttachment(
          state!.host, state!.token, ar.owner, ar.repo,
          currentNote!.owner, currentNote!.repo, currentNote!.number,
          file.name, base64, existingShas[file.name],
        );

        logInfo(`Attachment: Uploaded ${file.name} (${file.size} bytes)`);

        const rawUrl = rawContentUrl(
          state!.host, ar.owner, ar.repo,
          `${currentNote!.owner}/${currentNote!.repo}/${currentNote!.number}/${file.name}`,
        );
        uploadedLinks.push(`[${file.name}](${rawUrl})`);

        // Update list optimistically from the upload response
        const existingIdx = currentAttachments.findIndex(a => a.name === file.name);
        if (existingIdx >= 0) {
          currentAttachments[existingIdx] = attachment;
        } else {
          currentAttachments.push(attachment);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logError(`Attachment: Upload failed for ${file.name}: ${msg}`);
        failed.push(file.name);
      }
    }

    // Update UI
    const listEl = document.getElementById('attachment-list');
    if (listEl) renderAttachmentRows(listEl);

    // Copy all uploaded links to clipboard
    if (uploadedLinks.length > 0) {
      navigator.clipboard.writeText(uploadedLinks.join('\n'));
      const msg = uploadedLinks.length === 1
        ? 'Uploaded — link copied'
        : `Uploaded ${uploadedLinks.length} files — links copied`;
      showStatus(failed.length > 0 ? `${msg} (${failed.length} failed)` : msg);
    } else {
      showStatus(`Upload failed: ${failed.join(', ')}`, true);
    }

    document.getElementById('attachment-panel')?.focus();
  };
  input.click();
}

async function downloadAttachmentByIndex(idx: number): Promise<void> {
  const a = currentAttachments[idx];
  if (!a || !currentNote || !state) return;
  const ar = getAttachmentsRepo();
  if (!ar) return;
  try {
    showStatus('Downloading...');
    const { blob, filename } = await fetchAttachmentBlob(
      state.host, state.token, ar.owner, ar.repo, a.path,
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
    showStatus('');
  } catch (err) {
    showStatus(`Download failed: ${err instanceof Error ? err.message : err}`, true);
  }
}

async function downloadSelectedAttachment(): Promise<void> {
  await downloadAttachmentByIndex(selectedAttachmentIndex);
}

async function previewSelectedAttachment(): Promise<void> {
  const a = currentAttachments[selectedAttachmentIndex];
  if (!a || !currentNote || !state) return;
  const ar = getAttachmentsRepo();
  if (!ar) return;
  try {
    showStatus('Loading preview...');
    const { blob } = await fetchAttachmentBlob(
      state.host, state.token, ar.owner, ar.repo, a.path,
    );
    const ext = a.name.split('.').pop()?.toLowerCase() ?? '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
      webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp',
      pdf: 'application/pdf', txt: 'text/plain', md: 'text/plain',
      json: 'application/json', csv: 'text/csv', html: 'text/html',
    };
    const typed = mimeTypes[ext] ? new Blob([blob], { type: mimeTypes[ext] }) : blob;
    const url = URL.createObjectURL(typed);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    showStatus('');
  } catch (err) {
    showStatus(`Preview failed: ${err instanceof Error ? err.message : err}`, true);
  }
}

function toggleMultiSelect(): void {
  if (currentAttachments.length === 0) return;
  if (multiSelectedAttachments.has(selectedAttachmentIndex)) {
    multiSelectedAttachments.delete(selectedAttachmentIndex);
  } else {
    multiSelectedAttachments.add(selectedAttachmentIndex);
  }
  const listEl = document.getElementById('attachment-list');
  if (listEl) renderAttachmentRows(listEl);
}

async function deleteSelectedAttachments(): Promise<void> {
  if (!currentNote || !state) return;
  const ar = getAttachmentsRepo();
  if (!ar) return;

  // If multi-selected, delete those; otherwise delete the cursor item
  const indices = multiSelectedAttachments.size > 0
    ? [...multiSelectedAttachments].sort((a, b) => b - a) // descending for safe splicing
    : [selectedAttachmentIndex];

  const names = indices.map(i => currentAttachments[i]?.name).filter(Boolean);
  if (names.length === 0) return;

  const msg = names.length === 1 ? `Delete "${names[0]}"?` : `Delete ${names.length} attachments?\n${names.join('\n')}`;
  if (!confirm(msg)) {
    document.getElementById('attachment-panel')?.focus();
    return;
  }

  try {
    showStatus(`Deleting ${names.length === 1 ? '' : names.length + ' '}...`);
    for (const idx of indices) {
      const a = currentAttachments[idx];
      if (!a) continue;
      logInfo(`Attachment: Deleting ${a.name} from note #${currentNote?.number}`);
      await deleteAttachment(state.host, state.token, ar.owner, ar.repo, a.path, a.sha);
      logInfo(`Attachment: Deleted ${a.name}`);
    }
    showStatus(names.length === 1 ? 'Deleted' : `Deleted ${names.length} attachments`);

    // Remove from array in descending order so indices stay valid
    for (const idx of indices) {
      currentAttachments.splice(idx, 1);
    }
    multiSelectedAttachments.clear();
    selectedAttachmentIndex = Math.min(selectedAttachmentIndex, Math.max(0, currentAttachments.length - 1));
    const listEl = document.getElementById('attachment-list');
    if (listEl) renderAttachmentRows(listEl);
    document.getElementById('attachment-panel')?.focus();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(`Attachment: Delete failed for ${names.join(', ')}: ${msg}`);
    showStatus(`Delete failed: ${err instanceof Error ? err.message : err}`, true);
    document.getElementById('attachment-panel')?.focus();
  }
}

function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showStatus(msg: string, isError = false): void {
  const el = document.getElementById('status-msg');
  if (!el) return;
  el.textContent = msg;
  el.className = isError ? 'error' : 'success';
  if (!isError) {
    setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 2000);
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

const clipboardIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const paperclipIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
const checkIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const xIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const externalIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

function issueUrl(host: string, owner: string, repo: string, number: number): string {
  return `https://${host}/${owner}/${repo}/issues/${number}`;
}

function hashTarget(url: string): string {
  return veditor ? veditor.hashTarget(url) : '_blank';
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
