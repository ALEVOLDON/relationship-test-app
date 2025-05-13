// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/relationship-test-app/', // 👈 ВАЖНО
  plugins: [react()],
});
