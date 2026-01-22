import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This allows process.env.API_KEY to be replaced with the actual key at build time on Vercel
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || ''),
    },
    server: {
      host: true,
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      emptyOutDir: true,
    },
  }
});