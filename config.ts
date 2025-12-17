/**
 * API Key Configuration
 */

export const setCustomApiKey = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ocr_custom_api_key', key);
    // Reload to apply changes immediately
    window.location.reload();
  }
};

export const getApiKey = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  // 1. Check URL Parameter (Demo Mode)
  // Example: https://myapp.netlify.app/?key=AIza...
  const params = new URLSearchParams(window.location.search);
  const urlKey = params.get('key');
  if (urlKey) return urlKey;

  // 2. Check Local Storage (Manual Entry)
  const manualKey = localStorage.getItem('ocr_custom_api_key');
  if (manualKey) return manualKey;

  // 3. Vite Environment Variable (Netlify Standard)
  // Note: Vite replaces import.meta.env at build time.
  try {
    const meta = import.meta as any;
    if (meta.env && meta.env.VITE_API_KEY) {
      return meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore
  }

  // 4. Process Environment (Legacy/Create-React-App)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
    if (process.env.API_KEY) return process.env.API_KEY;
  }

  // 5. Runtime Injection (AI Studio)
  const win = window as any;
  if (win.ENV && win.ENV.API_KEY) return win.ENV.API_KEY;

  return undefined;
};

export const hasValidKey = (): boolean => {
  const key = getApiKey();
  return !!key && key.startsWith('AIza');
};
