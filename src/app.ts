import { validateToken, searchNotes, getNote, updateNote, createNote, archiveNote, DEFAULT_HOST, type NoteSearchResult } from './github';


const LS_TOKEN = 'notehub:token';

// Touch device detection — used to skip veditor and open GitHub's editor instead
const isMobile = window.matchMedia('(pointer: coarse)').matches;

// veditor base URL — override via VITE_VEDITOR_BASE for GHES or local dev.
const VEDITOR_BASE = import.meta.env.VITE_VEDITOR_BASE || 'https://stabledog.github.io/veditor.web';

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

let state: AppState | null = null;
let currentNote: NoteSearchResult | null = null;
let newNoteTarget: { owner: string; repo: string } | null = null;

let originalBody = '';
let originalTitle = '';
let justCreatedNote: NoteSearchResult | null = null;
let titleHandle: ReturnType<typeof import('./veditor').createVimInput> | null = null;

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
    } catch (err) {
      app.innerHTML = `<div class="auth-screen"><h1>notehub</h1><p class="error">Failed to load editor from ${VEDITOR_BASE}/veditor.js: ${err instanceof Error ? err.message : err}</p></div>`;
      return;
    }
  }

  const token = localStorage.getItem(LS_TOKEN);
  const host = localStorage.getItem(LS_HOST) ?? DEFAULT_HOST;

  if (token) {
    validateToken(host, token)
      .then(user => {
        state = { host, token, username: user.login };
        if (!isSetupComplete()) {
          showSetup();
        } else {
          showNoteList();
        }
      })
      .catch(() => showAuth());
  } else {
    showAuth();
  }
}

function showAuth(error?: string): void {
  titleHandle?.destroy(); titleHandle = null;
  veditor?.destroyEditor();
  const savedHost = localStorage.getItem(LS_HOST) ?? DEFAULT_HOST;

  app.innerHTML = `
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>GitHub Issues as notes, with vi keybindings.</p>
      ${error ? `<div class="error">${error}</div>` : ''}
      <form id="auth-form">
        <label>GitHub Host
          <input type="text" id="host" value="${savedHost}" required />
        </label>
        <label>Personal Access Token
          <input type="password" id="pat" placeholder="ghp_..." required />
        </label>
        <button type="submit">Connect</button>
      </form>
    </div>
  `;

  document.getElementById('auth-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const host = (document.getElementById('host') as HTMLInputElement).value.trim();
    const token = (document.getElementById('pat') as HTMLInputElement).value.trim();

    try {
      const user = await validateToken(host, token);
      localStorage.setItem(LS_HOST, host);
      localStorage.setItem(LS_TOKEN, token);
      state = { host, token, username: user.login };
      if (!isSetupComplete()) {
        showSetup();
      } else {
        showNoteList();
      }
    } catch (err) {
      showAuth(`Authentication failed: ${err instanceof Error ? err.message : err}`);
    }
  });
}

function showSetup(error?: string): void {
  titleHandle?.destroy(); titleHandle = null;
  veditor?.destroyEditor();
  if (!state) return;

  const suggestedRepo = `${state.username}/notehub.default`;

  app.innerHTML = `
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>Welcome, @${state.username}! Configure your default repository for new notes.</p>
      ${error ? `<div class="error">${error}</div>` : ''}
      <form id="setup-form">
        <label>Default Repository
          <input type="text" id="setup-repo" value="${suggestedRepo}" placeholder="owner/repo" required />
        </label>
        <label>Pinned Issue Number <span style="color:#6c7086">(optional)</span>
          <input type="number" id="setup-pinned" placeholder="e.g. 7" min="1" />
        </label>
        <button type="submit">Save &amp; Continue</button>
      </form>
    </div>
  `;

  document.getElementById('setup-form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    const repoVal = (document.getElementById('setup-repo') as HTMLInputElement).value.trim();
    const pinnedVal = (document.getElementById('setup-pinned') as HTMLInputElement).value.trim();

    const parts = repoVal.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      showSetup('Repository must be in owner/repo format.');
      return;
    }

    localStorage.setItem(LS_DEFAULT_REPO, repoVal);

    if (pinnedVal) {
      const num = parseInt(pinnedVal, 10);
      if (isNaN(num) || num < 1) {
        showSetup('Pinned issue must be a positive number.');
        return;
      }
      localStorage.setItem(LS_PINNED_ISSUE, JSON.stringify({ owner: parts[0], repo: parts[1], number: num }));
    } else {
      localStorage.removeItem(LS_PINNED_ISSUE);
    }

    showNoteList();
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
    // Ignore if typing in an input or if overlay is open
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
    }
  };
  document.addEventListener('keydown', onListKey);
  cleanupListKeys = () => document.removeEventListener('keydown', onListKey);

  document.getElementById('sign-out')!.addEventListener('click', () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_HOST);
    state = null;
    showAuth();
  });

  document.getElementById('refresh')!.addEventListener('click', () => showNoteList());

  try {
    notesList = await searchNotes(state.host, state.token);

    // If we just created a note, the Search API may not have indexed it yet.
    // Merge it into the results if missing.
    if (justCreatedNote) {
      const jc = justCreatedNote;
      justCreatedNote = null;
      const alreadyPresent = notesList.some(
        n => n.owner === jc.owner && n.repo === jc.repo && n.number === jc.number
      );
      if (!alreadyPresent) {
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
        <thead><tr><th>Repo</th><th>#</th><th>Title</th><th>Updated</th><th></th></tr></thead>
        <tbody>
          ${notesList.map((n, i) => `
            <tr class="note-row" data-index="${i}">
              <td>${escapeHtml(n.owner)}/${escapeHtml(n.repo)}</td>
              <td><a href="${escapeAttr(issueUrl(state!.host, n.owner, n.repo, n.number))}" target="${hashTarget(issueUrl(state!.host, n.owner, n.repo, n.number))}" class="issue-link" onclick="event.stopPropagation()">${n.number}</a></td>
              <td>${escapeHtml(n.title)}</td>
              <td>${new Date(n.updated_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}</td>
              <td><button class="copy-url-btn" data-url="${escapeAttr(issueUrl(state!.host, n.owner, n.repo, n.number))}" title="Copy issue URL">${clipboardIcon}</button></td>
              <td><button class="context-menu-btn" data-index="${i}" title="More actions">&#x2026;</button></td>
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
  } catch (err) {
    document.getElementById('notes-container')!.innerHTML =
      `<p class="error">Failed to load notes: ${err instanceof Error ? err.message : err}</p>`;
  }
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

function openNewNote(owner: string, repo: string): void {
  if (isMobile) {
    window.open(`https://${state!.host}/${owner}/${repo}/issues/new`, '_blank');
    return;
  }
  newNoteTarget = { owner, repo };
  currentNote = null;
  originalBody = DEFAULT_NEW_BODY;
  originalTitle = DEFAULT_NEW_TITLE;
  renderEditor(DEFAULT_NEW_TITLE, DEFAULT_NEW_BODY);
}

async function openNote(owner: string, repo: string, number: number): Promise<void> {
  if (!state) return;

  app.innerHTML = `<div class="editor-screen"><p>Loading note #${number}...</p></div>`;

  try {
    const note = await getNote(state.host, state.token, owner, repo, number);
    currentNote = { ...note, owner, repo };
    originalBody = note.body ?? '';
    originalTitle = note.title;
    renderEditor(note.title, originalBody);
  } catch (err) {
    app.innerHTML = `<div class="editor-screen"><p class="error">Failed to load note: ${err instanceof Error ? err.message : err}</p></div>`;
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
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `;

  document.getElementById('back-to-list')!.addEventListener('click', () => {
    veditor.executeExCommand('q');
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

  titleHandle = veditor.createVimInput(
    document.getElementById('note-title-container')!,
    {
      value: title,
      onEnter: () => veditor.focusEditor(),
      onEscape: () => veditor.focusEditor(),
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
    },
  });
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
      const created = await createNote(state.host, state.token, newNoteTarget.owner, newNoteTarget.repo, title, body);
      currentNote = { ...created, owner: newNoteTarget.owner, repo: newNoteTarget.repo };
      justCreatedNote = currentNote;
      newNoteTarget = null;
      originalBody = created.body ?? '';
      originalTitle = created.title;
      // Update header to show issue number
      const numEl = document.getElementById('note-number');
      if (numEl) {
        numEl.innerHTML = `<a href="${escapeAttr(issueUrl(state.host, currentNote.owner, currentNote.repo, currentNote.number))}" target="${hashTarget(issueUrl(state.host, currentNote.owner, currentNote.repo, currentNote.number))}" class="issue-link">#${currentNote.number}</a>`;
      }

      showStatus('Created');
    } catch (err) {
      showStatus(`Create failed: ${err instanceof Error ? err.message : err}`, true);
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
    const updated = await updateNote(state.host, state.token, currentNote.owner, currentNote.repo, currentNote.number, data);
    originalBody = updated.body ?? '';
    originalTitle = updated.title;
    currentNote = { ...updated, owner: currentNote.owner, repo: currentNote.repo };
    showStatus('Saved');
  } catch (err) {
    showStatus(`Save failed: ${err instanceof Error ? err.message : err}`, true);
  }
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
