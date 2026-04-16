// Hash-based router for notehub.web
//
// URL scheme:
//   #/                              → note list
//   #/edit/{owner}/{repo}/{number}  → editor for existing note
//   #/new/{owner}/{repo}            → editor for new note

export type Route =
  | { screen: 'list' }
  | { screen: 'edit'; owner: string; repo: string; number: number }
  | { screen: 'new'; owner: string; repo: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  if (!path) return { screen: 'list' };

  const parts = path.split('/');

  // #/edit/{owner}/{repo}/{number}
  if (parts[0] === 'edit' && parts.length === 4) {
    const num = parseInt(parts[3], 10);
    if (num > 0 && Number.isFinite(num)) {
      return { screen: 'edit', owner: parts[1], repo: parts[2], number: num };
    }
  }

  // #/new/{owner}/{repo}
  if (parts[0] === 'new' && parts.length === 3) {
    return { screen: 'new', owner: parts[1], repo: parts[2] };
  }

  return { screen: 'list' };
}

export function buildHash(route: Route): string {
  switch (route.screen) {
    case 'list':
      return '#/';
    case 'edit':
      return `#/edit/${route.owner}/${route.repo}/${route.number}`;
    case 'new':
      return `#/new/${route.owner}/${route.repo}`;
  }
}

/** Navigate by setting the hash — pushes a history entry and triggers hashchange. */
export function navigate(route: Route): void {
  location.hash = buildHash(route);
}

/** Update the hash without pushing a history entry — use to sync URL bar from within a screen. */
export function replaceRoute(route: Route): void {
  const hash = buildHash(route);
  history.replaceState(null, '', hash);
}

/** Start listening for hashchange events. Returns a cleanup function. */
export function startRouter(dispatch: (route: Route) => void): () => void {
  const handler = () => dispatch(parseHash(location.hash));
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}
