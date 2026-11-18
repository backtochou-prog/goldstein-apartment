import { defineConfig } from 'vite';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, normalize, extname } from 'node:path';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Serves the private reference library (../reference) at /ref/ during dev and preview, so the
// reference-camera overlays work. The images are git-ignored and are NOT copied into the build.
const REF_ROOT = resolve(__dirname, '../reference');
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
function serveReference() {
  const mw = (req, res, next) => {
    if (!req.url.startsWith('/ref/')) return next();
    const rel = decodeURIComponent(req.url.slice(5).split('?')[0]);
    const file = normalize(resolve(REF_ROOT, rel));
    if (!file.startsWith(REF_ROOT) || !existsSync(file) || !statSync(file).isFile() || !TYPES[extname(file).toLowerCase()]) {
      res.statusCode = 404; return res.end('not found');
    }
    res.setHeader('Content-Type', TYPES[extname(file).toLowerCase()]);
    createReadStream(file).pipe(res);
  };
  // block bodies on purpose: a returned function would be treated by Vite as a post-middleware hook
  return {
    name: 'serve-reference',
    configureServer(s) { s.middlewares.use(mw); },
    configurePreviewServer(s) { s.middlewares.use(mw); },
  };
}

export default defineConfig(({ mode }) => ({
  // 'lan' mode: HTTPS with a self-signed certificate so a headset on the same home network can use WebXR.
  plugins: [serveReference(), ...(mode === 'lan' ? [basicSsl()] : [])],
  server: { host: mode === 'lan' ? true : 'localhost', port: 5174, strictPort: true },
  preview: { host: 'localhost', port: 5175, strictPort: true },
  build: { outDir: 'dist', chunkSizeWarningLimit: 900 },
}));
