import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { vim, Vim } from '@replit/codemirror-vim';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { basicSetup } from 'codemirror';
import { oneDark } from '@codemirror/theme-one-dark';

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

  const state = EditorState.create({
    doc: content,
    extensions: [
      vim(),
      basicSetup,
      markdown({ codeLanguages: languages }),
      oneDark,
      keymap.of([]),
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
