import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), mkcert()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ 절대경로 alias
    },
  },
  // 개발 서버 설정: 아래 proxy는 개발환경(Vite dev server)에서만 동작합니다.
  // 프로덕션 빌드/배포에는 영향을 주지 않습니다.
  server: {
    // @ts-ignore vite 버전에 따라 boolean 허용. mkcert 활성화를 위해 HTTPS 켭니다
    https: true, // 로컬 HTTPS 활성화 (mkcert 필요). 배포에는 영향 없음
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        // 백엔드가 도메인 기반 쿠키를 내려주는 경우, 개발 환경(localhost:5173)에서 쿠키가 저장되도록 재작성
        cookieDomainRewrite: { '*': '' }, // Domain 제거 → 현재 호스트(localhost)에 저장
        cookiePathRewrite: { '*': '/' }, // 경로 통일
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
