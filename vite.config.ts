import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: ['localhost', '127.0.0.1', '.v0.build', 'sb-4e4xk1o1bh85.vercel.run'],
      hmr: false,
      watch: {},
    },
  };
});
