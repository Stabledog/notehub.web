const API_BASE = 'https://api.github.com';

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

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

async function apiFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers(token), ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function validateToken(token: string): Promise<GitHubUser> {
  return apiFetch<GitHubUser>(token, '/user');
}

export function listNotes(token: string, owner: string, repo: string): Promise<GitHubIssue[]> {
  return apiFetch<GitHubIssue[]>(
    token,
    `/repos/${owner}/${repo}/issues?labels=notehub&state=open&per_page=100&sort=updated&direction=desc`,
  );
}

export function getNote(token: string, owner: string, repo: string, number: number): Promise<GitHubIssue> {
  return apiFetch<GitHubIssue>(token, `/repos/${owner}/${repo}/issues/${number}`);
}

export function updateNote(
  token: string, owner: string, repo: string, number: number,
  data: { title?: string; body?: string },
): Promise<GitHubIssue> {
  return apiFetch<GitHubIssue>(token, `/repos/${owner}/${repo}/issues/${number}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function createNote(
  token: string, owner: string, repo: string,
  title: string, body: string,
): Promise<GitHubIssue> {
  await ensureLabel(token, owner, repo);
  return apiFetch<GitHubIssue>(token, `/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body, labels: ['notehub'] }),
  });
}

async function ensureLabel(token: string, owner: string, repo: string): Promise<void> {
  try {
    await apiFetch(token, `/repos/${owner}/${repo}/labels`, {
      method: 'POST',
      body: JSON.stringify({ name: 'notehub', color: '1d76db', description: 'notehub note' }),
    });
  } catch {
    // label already exists — fine
  }
}
