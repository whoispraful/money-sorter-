/**
 * API Key Configuration
 * 
 * The API Key is injected by Vite at build time via `process.env.API_KEY`.
 * See vite.config.ts for the injection logic.
 */

export const getApiKey = (): string | undefined => {
  // The value is replaced by the bundler (Vite)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return undefined;
};

export const hasValidKey = (): boolean => {
  const key = getApiKey();
  return !!key && key.length > 0;
};