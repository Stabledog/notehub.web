import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { vim, Vim } from '@replit/codemirror-vim';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { basicSetup } from 'codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

/** Find a URL at a given character offset within a line of text. */
function urlAtPosition(lineText: string, col: number): string | null {
  const urlRe = /https?:\/\/[^\s)\]>]+/g;
  let m;
  while ((m = urlRe.exec(lineText)) !== null) {
    if (col >= m.index && col < m.index + m[0].length) return m[0];
  }
  return null;
}

/** Ctrl+Click opens URLs in a new tab. */
const clickableLinks = EditorView.domEventHandlers({
  click(event: MouseEvent, view: EditorView) {
    if (!event.ctrlKey) return false;
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos == null) return false;
    const line = view.state.doc.lineAt(pos);
    const col = pos - line.from;
    const url = urlAtPosition(line.text, col);
    if (url) {
      window.open(url, '_blank', 'noopener');
      event.preventDefault();
      return true;
    }
    return false;
  },
});

export interface EditorCallbacks {
  onSave: () => Promise<void>;
  onQuit: (force: boolean) => void;
}

let editorView: EditorView | null = null;

export function createEditor(
  parent: HTMLElement,
  content: string,
  callbacks: EditorCallbacks,
): EditorView {
  destroyEditor();

  Vim.defineEx('w', 'w', () => {
    callbacks.onSave();
  });

  Vim.defineEx('q', 'q', (_cm: unknown, params: { argString?: string; bang?: boolean }) => {
    const force = params?.bang ?? false;
    callbacks.onQuit(force);
  });

  Vim.defineEx('wq', 'wq', async () => {
    await callbacks.onSave();
    callbacks.onQuit(false);
  });

  Vim.map('jk', '<Esc>', 'insert');

  const state = EditorState.create({
    doc: content,
    extensions: [
      vim(),
      basicSetup,
      markdown({ codeLanguages: languages }),
      oneDark,
      keymap.of([]),
      clickableLinks,
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
      }),
    ],
  });

  editorView = new EditorView({ state, parent });
  editorView.focus();
  return editorView;
}

export function getEditorContent(): string {
  if (!editorView) return '';
  return editorView.state.doc.toString();
}

export function isEditorDirty(original: string): boolean {
  return getEditorContent() !== original;
}

export function destroyEditor(): void {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
}
