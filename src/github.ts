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
