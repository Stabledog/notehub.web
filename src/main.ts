import './style.css';
import { init } from './app';
import { APP_VERSION, BUILD_HASH } from './version';

const badge = document.createElement('span');
badge.className = 'version-badge';
badge.id = 'version-badge';
badge.textContent = `v${APP_VERSION}`;
badge.title = BUILD_HASH;
document.body.appendChild(badge);

init();
