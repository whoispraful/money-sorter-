import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  // Prioritize VITE_API_KEY, but ALSO check process.env.API_KEY (system env vars)
  // This is critical for cloud environments where keys are in the shell environment, not .env files.
  const apiKey = process.env.API_KEY || env.VITE_API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // This maps the Netlify environment variable to process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});