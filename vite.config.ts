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
      // Route Vite HMR through the hosted preview's secure WebSocket proxy.
      hmr: {
        protocol: 'wss',
        host: 'sb-1ugv4joh7x6n.vercel.run',
        clientPort: 443,
      },
      watch: {},
    },
  };
});
