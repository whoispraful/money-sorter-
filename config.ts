/**
 * API Key Configuration
 * 
 * The API Key is injected by Vite at build time via `process.env.API_KEY`.
 * See vite.config.ts for the injection logic.
 */

export const getApiKey = (): string | undefined => {
  // Vite will replace `process.env.API_KEY` with the actual string value during the build.
  // We do not check `typeof process` because `process` does not exist in the browser,
  // but the string replacement happens at compile time.
  return process.env.API_KEY;
};

export const hasValidKey = (): boolean => {
  const key = getApiKey();
  return !!key && key.length > 0;
};