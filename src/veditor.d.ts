/** Type declarations for veditor.web runtime import. */

export interface VEditorCallbacks {
  onSave: () => Promise<void>;
  onQuit: () => void;
  onCloseRequest?: () => boolean | void;
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
export function markDirty(): void;
export function focusEditor(): void;
export function destroyEditor(): void;
export function exitInsertMode(): void;
export function executeExCommand(cmd: string): void;
export function hashTarget(url: string): string;
