import './style.css';
import { init } from './app';
import { APP_VERSION } from './version';

const badge = document.createElement('span');
badge.className = 'version-badge';
badge.id = 'version-badge';
badge.textContent = `v${APP_VERSION}`;
document.body.appendChild(badge);

init();
