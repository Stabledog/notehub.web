// Thumbnail byte cache — content-addressed by git blob SHA.
//
// Grid/thumbnail view needs the actual image bytes to render a miniature, and
// those bytes are fetched through the authenticated GitHub contents API (see
// fetchAttachmentBlob). Caching them in IndexedDB (localStorage is ~5MB and
// string-only; IndexedDB stores Blobs and is far larger) lets thumbnails paint
// instantly on subsequent opens, even across reloads.
//
// The cache key is the file's `sha` (its git blob hash), so invalidation is
// automatic: re-uploading a file yields a new SHA — a new key — and the stale
// bytes are simply never requested again. A total-size cap prunes the
// least-recently-used entries so the store can't grow without bound.
//
// Every operation degrades gracefully to a miss (returns null / no-ops) if
// IndexedDB is unavailable (private mode, quota, etc.); callers just fall back
// to the network.

const DB_NAME = 'notehub-thumbs';
const STORE = 'thumbs';
const DB_VERSION = 1;
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB total cap

interface ThumbEntry {
  sha: string;
  blob: Blob;
  size: number;
  lastUsed: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'sha' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

/** Return cached bytes for a git blob SHA, or null on miss/unavailable. */
export async function getThumb(sha: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const req = store.get(sha);
      req.onsuccess = () => {
        const entry = req.result as ThumbEntry | undefined;
        if (!entry) { resolve(null); return; }
        entry.lastUsed = Date.now();
        store.put(entry); // best-effort LRU touch
        resolve(entry.blob);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** Store bytes under a git blob SHA, then prune if over the size cap. */
export async function putThumb(sha: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const entry: ThumbEntry = { sha, blob, size: blob.size, lastUsed: Date.now() };
      tx.objectStore(STORE).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    await pruneIfNeeded();
  } catch {
    // ignore cache write failures — the image still displays from the network
  }
}

async function pruneIfNeeded(): Promise<void> {
  try {
    const db = await openDB();
    const entries = await new Promise<ThumbEntry[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result as ThumbEntry[]);
      req.onerror = () => reject(req.error);
    });
    let total = entries.reduce((n, e) => n + (e.size || 0), 0);
    if (total <= MAX_BYTES) return;
    entries.sort((a, b) => a.lastUsed - b.lastUsed); // oldest first
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      for (const e of entries) {
        if (total <= MAX_BYTES) break;
        store.delete(e.sha);
        total -= e.size || 0;
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore prune failures
  }
}
