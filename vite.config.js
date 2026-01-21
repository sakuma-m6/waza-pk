import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';
import browserSync from 'browser-sync';

import imageDimensionPlugin from './vite-plugin-image-dimensions.js';
//imgタグのwidth heightをビルド時に自動入力

// SSI風インクルードミドルウェア
function ssiIncludeMiddleware() {
  return {
    name: 'vite-plugin-ssi-emulator',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]; // クエリ除去
        if (!url || !url.endsWith('.html') && url !== '/') return next();

        const htmlPath = path.join(process.cwd(), url === '/' ? 'index.html' : url.slice(1));
        if (!fs.existsSync(htmlPath)) return next();

        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = resolveIncludes(html);

        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      });
    }
  };
}

// SSI風のインクルード処理関数
const resolveIncludes = (content) => {
  return content.replace(/<!--#include virtual="(.+?)"-->/g, (_, includePath) => {
    const publicDir = path.join(process.cwd(), 'public');
    const basePath = path.join(publicDir, includePath);

    const tryExtensions = ['', '.html', '.htm'];
    for (const ext of tryExtensions) {
      const fullPath = basePath + ext;
      if (fs.existsSync(fullPath)) {
        const includeContent = fs.readFileSync(fullPath, 'utf-8');
        return resolveIncludes(includeContent); // 再帰
      }
    }

    return `<!-- Failed to include ${includePath} -->`;
  });
};

// BrowserSyncプラグイン
function browserSyncPlugin() {
  return {
    name: 'vite-plugin-browsersync',
    configureServer(server) {
      const bs = browserSync.create();
      bs.init({
        proxy: 'http://localhost:5173',
        files: ['index.html', 'public/**/*.htm', 'public/**/*.html', 'src/**/*.{js,scss}'],
        open: false,
        notify: false,
        ui: false,
      });

      server.httpServer?.once('close', () => {
        bs.exit();
      });
    },
  };
}

// Vite 設定
export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        // paywall: path.resolve(__dirname, 'index_free.html'),
      },
    },
  },
  plugins: [
    imageDimensionPlugin(), // imgタグのwidth heightをビルド時に自動入力
    svelte(),
    ssiIncludeMiddleware(),
    browserSyncPlugin(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "/src/styles/mixins.scss" as *;`
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
});
