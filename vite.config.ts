import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['sb-1ugv4joh7x6n.vercel.run'],
      // The hosted preview does not proxy Vite's development WebSocket.
      hmr: false,
      watch: {},
    },
  };
});
