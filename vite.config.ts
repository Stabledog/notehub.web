import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import pkg from './package.json';

const devPluginPath = new URL('../veditor.web/dev-plugin.js', import.meta.url);
const veditorDev = existsSync(devPluginPath)
  ? (await import(devPluginPath.href)).default
  : () => ({ name: 'veditor-dev-noop' });

const base = process.env.VITE_BASE;
if (!base) {
  throw new Error(
    'VITE_BASE environment variable is required. Set it to the base path for your deployment.\n' +
    'Examples:\n' +
    '  VITE_BASE=/notehub.web/ npm run build          # public GitHub Pages\n' +
    '  VITE_BASE=/pages/user/notehub.web/ npm run build  # GHES Pages\n' +
    '  VITE_BASE=/ npm run dev                         # local development',
  );
}

const buildHash = execSync('../scripts/source-hash.sh').toString().trim();

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_HASH__: JSON.stringify(buildHash),
  },
  plugins: [veditorDev(), {
    name: 'version-json',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: pkg.version, hash: buildHash }),
      });
    },
  }],
  build: {
    sourcemap: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
