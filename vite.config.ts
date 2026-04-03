import { defineConfig } from 'vite';

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

export default defineConfig({
  base,
});
