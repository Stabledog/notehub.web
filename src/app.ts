import { validateToken, listNotes, getNote, updateNote, createNote, type GitHubIssue } from './github';
import { createEditor, getEditorContent, isEditorDirty, destroyEditor } from './editor';

const LS_TOKEN = 'notehub:token';
const LS_OWNER = 'notehub:owner';
const LS_REPO = 'notehub:repo';

interface AppState {
  token: string;
  owner: string;
  repo: string;
  username: string;
}

let state: AppState | null = null;
let currentNote: GitHubIssue | null = null;
let originalBody = '';
let originalTitle = '';

const app = document.getElementById('app')!;

export function init(): void {
  const token = localStorage.getItem(LS_TOKEN);
  const owner = localStorage.getItem(LS_OWNER);
  const repo = localStorage.getItem(LS_REPO);

  if (token && owner && repo) {
    validateToken(token)
      .then(user => {
        state = { token, owner, repo, username: user.login };
        showNoteList();
      })
      .catch(() => showAuth());
  } else {
    showAuth();
  }
}

function showAuth(error?: string): void {
  destroyEditor();
  const savedOwner = localStorage.getItem(LS_OWNER) ?? '';
  const savedRepo = localStorage.getItem(LS_REPO) ?? '';

  app.innerHTML = `
    <div class="auth-screen">
      <h1>notehub</h1>
      <p>GitHub Issues as notes, with vi keybindings.</p>
      ${error ? `<div class="error">${error}</div>` : ''}
      <form id="auth-form">
        <label>GitHub Personal Access Token
          <input type="password" id="pat" placeholder="ghp_..." required />
        </label>
        <label>Owner (org or user)
          <input type="text" id="owner" value="${savedOwner}" placeholder="my-org" required />
        </label>
        <label>Repository
          <input type="text" id="repo" value="${savedRepo}" placeholder="my-notes" required />
        </label>
        <button type="submit">Connect</button>
      </form>
    </div>
  `;

  document.getElementById('auth-form')!.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = (document.getElementById('pat') as HTMLInputElement).value.trim();
    const owner = (document.getElementById('owner') as HTMLInputElement).value.trim();
    const repo = (document.getElementById('repo') as HTMLInputElement).value.trim();

    try {
      const user = await validateToken(token);
      localStorage.setItem(LS_TOKEN, token);
      localStorage.setItem(LS_OWNER, owner);
      localStorage.setItem(LS_REPO, repo);
      state = { token, owner, repo, username: user.login };
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

  app.innerHTML = `
    <div class="note-list-screen">
      <header>
        <h1>notehub</h1>
        <div class="header-info">
          <span>${state.owner}/${state.repo}</span>
          <span>@${state.username}</span>
          <button id="sign-out">Sign out</button>
        </div>
      </header>
      <div class="toolbar">
        <button id="new-note">New Note</button>
        <button id="refresh">Refresh</button>
      </div>
      <div id="notes-container"><p>Loading...</p></div>
    </div>
  `;

  document.getElementById('sign-out')!.addEventListener('click', () => {
    localStorage.removeItem(LS_TOKEN);
    state = null;
    showAuth();
  });

  document.getElementById('new-note')!.addEventListener('click', () => {
    const title = prompt('Note title:');
    if (!title) return;
    openNewNote(title);
  });

  document.getElementById('refresh')!.addEventListener('click', () => showNoteList());

  try {
    const notes = await listNotes(state.token, state.owner, state.repo);
    const container = document.getElementById('notes-container')!;

    if (notes.length === 0) {
      container.innerHTML = '<p class="empty">No notes yet. Create one!</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Title</th><th>Updated</th></tr></thead>
        <tbody>
          ${notes.map(n => `
            <tr class="note-row" data-number="${n.number}">
              <td>${n.number}</td>
              <td>${escapeHtml(n.title)}</td>
              <td>${new Date(n.updated_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.querySelectorAll('.note-row').forEach(row => {
      row.addEventListener('click', () => {
        const num = parseInt(row.getAttribute('data-number')!, 10);
        openNote(num);
      });
    });
  } catch (err) {
    document.getElementById('notes-container')!.innerHTML =
      `<p class="error">Failed to load notes: ${err instanceof Error ? err.message : err}</p>`;
  }
}

async function openNote(number: number): Promise<void> {
  if (!state) return;

  app.innerHTML = `<div class="editor-screen"><p>Loading note #${number}...</p></div>`;

  try {
    const note = await getNote(state.token, state.owner, state.repo, number);
    currentNote = note;
    originalBody = note.body ?? '';
    originalTitle = note.title;
    renderEditor(note.title, originalBody);
  } catch (err) {
    app.innerHTML = `<div class="editor-screen"><p class="error">Failed to load note: ${err instanceof Error ? err.message : err}</p></div>`;
  }
}

async function openNewNote(title: string): Promise<void> {
  if (!state) return;

  try {
    showStatus('Creating note...');
    const note = await createNote(state.token, state.owner, state.repo, title, '');
    currentNote = note;
    originalBody = '';
    originalTitle = title;
    renderEditor(title, '');
  } catch (err) {
    showStatus(`Failed to create note: ${err instanceof Error ? err.message : err}`, true);
  }
}

function renderEditor(title: string, body: string): void {
  app.innerHTML = `
    <div class="editor-screen">
      <header>
        <button id="back-to-list">&larr; Notes</button>
        <input type="text" id="note-title" value="${escapeAttr(title)}" />
        <span id="note-number">${currentNote ? `#${currentNote.number}` : 'new'}</span>
        <span id="status-msg"></span>
      </header>
      <div id="editor-container"></div>
    </div>
  `;

  document.getElementById('back-to-list')!.addEventListener('click', () => {
    handleQuit(false);
  });

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
    const updated = await updateNote(state.token, state.owner, state.repo, currentNote.number, data);
    originalBody = updated.body ?? '';
    originalTitle = updated.title;
    currentNote = updated;
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

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
