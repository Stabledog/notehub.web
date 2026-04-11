const DEFAULT_HOST = 'github.com';

function apiBase(host: string): string {
  if (host === 'github.com') return 'https://api.github.com';
  return `https://${host}/api/v3`;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string | null;
  updated_at: string;
  state: string;
}

export interface NoteSearchResult extends GitHubIssue {
  owner: string;
  repo: string;
}

interface SearchResponse {
  total_count: number;
  items: (GitHubIssue & { repository_url: string })[];
}

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

export { DEFAULT_HOST };

async function apiFetch<T>(host: string, token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase(host)}${path}`, {
    ...init,
    headers: { ...headers(token), ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function validateToken(host: string, token: string): Promise<GitHubUser> {
  return apiFetch<GitHubUser>(host, token, '/user');
}

export async function repoExists(host: string, token: string, owner: string, repo: string): Promise<boolean> {
  try {
    await apiFetch(host, token, `/repos/${owner}/${repo}`);
    return true;
  } catch {
    return false;
  }
}

export function listNotes(host: string, token: string, owner: string, repo: string): Promise<GitHubIssue[]> {
  return apiFetch<GitHubIssue[]>(
    host, token,
    `/repos/${owner}/${repo}/issues?labels=notehub&state=open&per_page=100&sort=updated&direction=desc`,
  );
}

export async function searchNotes(host: string, token: string): Promise<NoteSearchResult[]> {
  const q = encodeURIComponent('is:issue label:notehub state:open');
  const data = await apiFetch<SearchResponse>(
    host, token,
    `/search/issues?q=${q}&sort=updated&order=desc&per_page=100`,
  );
  return data.items.map(item => {
    // repository_url looks like https://{host}/api/v3/repos/{owner}/{repo}
    const parts = item.repository_url.split('/');
    const repo = parts.pop()!;
    const owner = parts.pop()!;
    return { ...item, owner, repo };
  });
}

export function getNote(host: string, token: string, owner: string, repo: string, number: number): Promise<GitHubIssue> {
  return apiFetch<GitHubIssue>(host, token, `/repos/${owner}/${repo}/issues/${number}`);
}

export function updateNote(
  host: string, token: string, owner: string, repo: string, number: number,
  data: { title?: string; body?: string },
): Promise<GitHubIssue> {
  return apiFetch<GitHubIssue>(host, token, `/repos/${owner}/${repo}/issues/${number}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function createNote(
  host: string, token: string, owner: string, repo: string,
  title: string, body: string,
): Promise<GitHubIssue> {
  await ensureLabel(host, token, owner, repo);
  return apiFetch<GitHubIssue>(host, token, `/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body, labels: ['notehub'] }),
  });
}

export function archiveNote(
  host: string, token: string, owner: string, repo: string, number: number,
): Promise<GitHubIssue> {
  return apiFetch<GitHubIssue>(host, token, `/repos/${owner}/${repo}/issues/${number}`, {
    method: 'PATCH',
    body: JSON.stringify({ state: 'closed' }),
  });
}

// ---------------------------------------------------------------------------
// File Attachments — stored in a dedicated sibling repo: {defaultRepo}.attachments
// Path structure: {noteOwner}/{noteRepo}/{issueNumber}/{filename}
// ---------------------------------------------------------------------------

export interface Attachment {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string;
}

export function getAttachmentsRepoInfo(defaultRepo: string): { owner: string; repo: string } {
  const [owner, repo] = defaultRepo.split('/');
  return { owner, repo: `${repo}.attachments` };
}

export function rawContentUrl(host: string, owner: string, repo: string, path: string): string {
  if (host === 'github.com') return `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
  return `https://${host}/raw/${owner}/${repo}/main/${path}`;
}

interface TreeEntry { path: string; type: string; }

/**
 * Returns a map of "{noteOwner}/{noteRepo}/{issueNumber}" → file count
 * for all issues with attachments. Uses the Git Trees API for a single call.
 */
export async function fetchAttachmentCounts(
  host: string, token: string, attachOwner: string, attachRepo: string,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  try {
    const tree = await apiFetch<{ tree: TreeEntry[] }>(
      host, token, `/repos/${attachOwner}/${attachRepo}/git/trees/main?recursive=1`,
    );
    for (const entry of tree.tree) {
      if (entry.type !== 'blob') continue;
      const parts = entry.path.split('/');
      // Expected: noteOwner/noteRepo/issueNumber/filename (4+ segments)
      if (parts.length < 4) continue;
      const key = `${parts[0]}/${parts[1]}/${parts[2]}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  } catch {
    // 404 = repo doesn't exist or is empty
  }
  return counts;
}

export async function listAttachments(
  host: string, token: string, attachOwner: string, attachRepo: string,
  noteOwner: string, noteRepo: string, issueNumber: number,
): Promise<Attachment[]> {
  try {
    return await apiFetch<Attachment[]>(
      host, token,
      `/repos/${attachOwner}/${attachRepo}/contents/${noteOwner}/${noteRepo}/${issueNumber}`,
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) return [];
    throw err;
  }
}

export async function uploadAttachment(
  host: string, token: string, attachOwner: string, attachRepo: string,
  noteOwner: string, noteRepo: string, issueNumber: number,
  filename: string, base64Content: string, existingSha?: string,
): Promise<Attachment> {
  const body: Record<string, unknown> = {
    message: `notehub: attach ${filename} to ${noteOwner}/${noteRepo}#${issueNumber}`,
    content: base64Content,
  };
  if (existingSha) body.sha = existingSha;

  const res = await apiFetch<{ content: Attachment }>(
    host, token,
    `/repos/${attachOwner}/${attachRepo}/contents/${noteOwner}/${noteRepo}/${issueNumber}/${encodeURIComponent(filename)}`,
    { method: 'PUT', body: JSON.stringify(body) },
  );
  return res.content;
}

export async function fetchAttachmentBlob(
  host: string, token: string, attachOwner: string, attachRepo: string, path: string,
): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(
    `${apiBase(host)}/repos/${attachOwner}/${attachRepo}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.raw+json',
      },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  const blob = await res.blob();
  const filename = path.split('/').pop()!;
  return { blob, filename };
}

export async function deleteAttachment(
  host: string, token: string, attachOwner: string, attachRepo: string,
  path: string, sha: string,
): Promise<void> {
  await apiFetch<unknown>(
    host, token,
    `/repos/${attachOwner}/${attachRepo}/contents/${path}`,
    {
      method: 'DELETE',
      body: JSON.stringify({
        message: `notehub: remove ${path.split('/').pop()}`,
        sha,
      }),
    },
  );
}

async function ensureLabel(host: string, token: string, owner: string, repo: string): Promise<void> {
  try {
    await apiFetch(host, token, `/repos/${owner}/${repo}/labels`, {
      method: 'POST',
      body: JSON.stringify({ name: 'notehub', color: '1d76db', description: 'notehub note' }),
    });
  } catch {
    // label already exists — fine
  }
}
