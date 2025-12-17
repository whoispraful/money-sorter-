import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Prioritize VITE_API_KEY, fallback to API_KEY (standard Netlify)
  const apiKey = env.VITE_API_KEY || env.API_KEY || '';

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