import { validateToken, searchNotes, getNote, updateNote, DEFAULT_HOST, type NoteSearchResult } from './github';
import { createEditor, getEditorContent, isEditorDirty, destroyEditor } from './editor';

const LS_TOKEN = 'notehub:token';
const LS_HOST = 'notehub:host';

interface AppState {
  host: string;
  token: string;
  username: string;
}

let state: AppState | null = null;
let currentNote: NoteSearchResult | null = null;
let originalBody = '';
let originalTitle = '';

const app = document.getElementById('app')!;

export function init(): void {
  const token = localStorage.getItem(LS_TOKEN);
  const host = localStorage.getItem(LS_HOST) ?? DEFAULT_HOST;

  if (token) {
    validateToken(host, token)
      .then(user => {
        state = { host, token, username: user.login };
        showNoteList();
      })
      .catch(() => showAuth());
  } else {
    showAuth();
  }
}

function showAuth(error?: string): void {
  destroyEditor();
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
      showNoteList();
    } catch (err) {
      showAuth(`Authentication failed: ${err instanceof Error ? err.message : err}`);
    }
  });
}

async function showNoteList(): Promise<void> {
  destroyEditor();
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
        <button id="refresh">Refresh</button>
      </div>
      <div id="notes-container"><p>Loading...</p></div>
    </div>
  `;

  document.getElementById('sign-out')!.addEventListener('click', () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_HOST);
    state = null;
    showAuth();
  });

  document.getElementById('refresh')!.addEventListener('click', () => showNoteList());

  try {
    notesList = await searchNotes(state.host, state.token);
    const container = document.getElementById('notes-container')!;

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
              <td>${n.number}</td>
              <td>${escapeHtml(n.title)}</td>
              <td>${new Date(n.updated_at).toLocaleDateString()}</td>
              <td><button class="copy-url-btn" data-url="${escapeAttr(issueUrl(state!.host, n.owner, n.repo, n.number))}" title="Copy issue URL">Copy URL</button></td>
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
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        });
      });
    });

    container.querySelectorAll('.note-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-index')!, 10);
        const note = notesList[idx];
        openNote(note.owner, note.repo, note.number);
      });
    });
  } catch (err) {
    document.getElementById('notes-container')!.innerHTML =
      `<p class="error">Failed to load notes: ${err instanceof Error ? err.message : err}</p>`;
  }
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
  app.innerHTML = `
    <div class="editor-screen">
      <header>
        <button id="back-to-list">&larr; Notes</button>
        <input type="text" id="note-title" value="${escapeAttr(title)}" />
        <span id="note-number">${currentNote ? `#${currentNote.number}` : 'new'}</span>
        ${currentNote ? `<button id="copy-note-url" title="Copy issue URL">Copy URL</button>` : ''}
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `;

  document.getElementById('back-to-list')!.addEventListener('click', () => {
    handleQuit(false);
  });

  const copyBtn = document.getElementById('copy-note-url');
  if (copyBtn && currentNote) {
    const url = issueUrl(state!.host, currentNote.owner, currentNote.repo, currentNote.number);
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = orig; }, 1500);
      });
    });
  }

  createEditor(document.getElementById('editor-container')!, body, {
    onSave: handleSave,
    onQuit: handleQuit,
  });
}

async function handleSave(): Promise<void> {
  if (!state || !currentNote) return;

  const body = getEditorContent();
  const titleEl = document.getElementById('note-title') as HTMLInputElement;
  const title = titleEl.value.trim();

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

function handleQuit(force: boolean): void {
  const titleEl = document.getElementById('note-title') as HTMLInputElement | null;
  const titleChanged = titleEl ? titleEl.value.trim() !== originalTitle : false;

  if (!force && (isEditorDirty(originalBody) || titleChanged)) {
    if (!confirm('Unsaved changes. Discard?')) return;
  }
  showNoteList();
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

function issueUrl(host: string, owner: string, repo: string, number: number): string {
  return `https://${host}/${owner}/${repo}/issues/${number}`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
