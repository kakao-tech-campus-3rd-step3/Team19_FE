import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ 절대경로 alias
    },
  },
  // 개발 서버 설정: 아래 proxy는 개발환경(Vite dev server)에서만 동작합니다.
  // 프로덕션 빌드/배포에는 영향을 주지 않습니다.
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        // 필요 시 경로 재작성: rewrite: (p) => p.replace(/^\/api/, '')
        // Spring CORS 403 회피: Origin 헤더 제거
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            try {
              // @ts-ignore - removeHeader는 런타임에서 존재
              proxyReq.removeHeader && proxyReq.removeHeader('origin');
            } catch {}
          });
        },
      },
    },
  },
});
