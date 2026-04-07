/** Type declarations for veditor.web runtime import. */

export interface VEditorCallbacks {
  onSave: () => Promise<void>;
  onQuit: () => void;
  isAppDirty?: () => boolean;
}

export interface VEditorOptions {
  storagePrefix?: string;
  clickableLinks?: boolean;
  exCommands?: Record<string, (...args: unknown[]) => void>;
  normalMappings?: Record<string, () => void>;
  extensions?: unknown[];
}

export function createEditor(
  parent: HTMLElement,
  content: string,
  callbacks: VEditorCallbacks,
  options?: VEditorOptions,
): unknown;

export function getEditorContent(): string;
export function isEditorDirty(original: string): boolean;
export function focusEditor(): void;
export function destroyEditor(): void;
export function exitInsertMode(): void;
export function executeExCommand(cmd: string): void;
export function hashTarget(url: string): string;

export interface VimInputOptions {
  value?: string;
  placeholder?: string;
  onEnter?: () => void;
  onEscape?: () => void;
  onChange?: (value: string) => void;
  initialInsert?: boolean;
  extensions?: unknown[];
}

export interface VimInputHandle {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  destroy: () => void;
  dom: HTMLElement;
}

export function createVimInput(
  parent: HTMLElement,
  options?: VimInputOptions,
): VimInputHandle;
