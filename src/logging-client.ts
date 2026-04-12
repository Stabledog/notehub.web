/**
 * Shared diagnostic logging system for notehub, metabrowse, and veditor apps.
 * Stores logs in localStorage with a shared key so all apps can access the same log stream.
 */

const STORAGE_KEY = '_app_debug_logs';
const MAX_ENTRIES = 1000;

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
}

function getLogs(): LogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as LogEntry[];
  } catch {
    return [];
  }
}

function saveLogs(entries: LogEntry[]): void {
  try {
    // Keep only the last MAX_ENTRIES
    const trimmed = entries.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage quota exceeded or other error - silently fail
  }
}

function addLog(level: 'error' | 'warn' | 'info' | 'debug', message: string): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  const logs = getLogs();
  logs.push(entry);
  saveLogs(logs);

  // Also log to console for development
  console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log'](`[${level.toUpperCase()}] ${message}`);
}

export function logError(message: string): void {
  addLog('error', message);
}

export function logWarn(message: string): void {
  addLog('warn', message);
}

export function logInfo(message: string): void {
  addLog('info', message);
}

export function logDebug(message: string): void {
  addLog('debug', message);
}

/** Get all logs formatted as a single string */
export function getFormattedLogs(): string {
  const logs = getLogs();
  if (logs.length === 0) return '(no logs)';

  return logs
    .map(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      return `[${time}] ${entry.level.toUpperCase()}: ${entry.message}`;
    })
    .join('\n');
}

/** Clear all logs */
export function clearLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Create a simple log viewer modal element.
 * Returns an element that can be added to the DOM.
 * Caller is responsible for styling and positioning.
 */
export function createLogViewer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'log-viewer-modal';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #1e1e1e;
    color: #e0e0e0;
    border: 1px solid #444;
    border-radius: 4px;
    width: 80vw;
    max-width: 800px;
    height: 70vh;
    display: flex;
    flex-direction: column;
    font-family: monospace;
    font-size: 12px;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    padding: 10px;
    border-bottom: 1px solid #444;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = '<div>Debug Logs</div>';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #e0e0e0;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
  `;
  closeBtn.addEventListener('click', () => container.remove());
  header.appendChild(closeBtn);

  const content = document.createElement('textarea');
  content.readOnly = true;
  content.value = getFormattedLogs();
  content.style.cssText = `
    flex: 1;
    padding: 10px;
    background: #1e1e1e;
    color: #e0e0e0;
    border: none;
    font-family: monospace;
    font-size: 12px;
    resize: none;
    overflow: auto;
  `;
  // Auto-scroll to bottom
  content.scrollTop = content.scrollHeight;

  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 10px;
    border-top: 1px solid #444;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  `;

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear Logs';
  clearBtn.style.cssText = `
    padding: 6px 12px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `;
  clearBtn.addEventListener('click', () => {
    clearLogs();
    content.value = '(no logs)';
  });
  footer.appendChild(clearBtn);

  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = 'Refresh';
  refreshBtn.style.cssText = `
    padding: 6px 12px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `;
  refreshBtn.addEventListener('click', () => {
    content.value = getFormattedLogs();
    content.scrollTop = content.scrollHeight;
  });
  footer.appendChild(refreshBtn);

  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(footer);
  container.appendChild(modal);

  // Close on backdrop click
  container.addEventListener('click', (e) => {
    if (e.target === container) container.remove();
  });

  return container;
}
