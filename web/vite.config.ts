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
  server: {
    host: 'localhost', // 로컬 접속으로 바인딩(필요하면 '0.0.0.0'으로 변경)
    // 개발 중 CORS 문제 회피: /api 를 백엔드로 프록시
    proxy: {
      '/api': {
        target: 'http://52.79.93.142:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    // HMR WebSocket 문제 완화
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173, // 브라우저가 연결할 포트 강제 지정
    },
    watch: {
      // 파일 시스템 이벤트 불안정 시 폴링으로 대체 (네트워크 드라이브 등)
      usePolling: false,
    },
  },
});
