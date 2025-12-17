// Fix: Removed 'vite/client' reference to resolve "Cannot find type definition" error.
// Fix: Augmented NodeJS.ProcessEnv instead of redeclaring global 'process' to fix conflict and restore 'process.cwd()' visibility in vite.config.ts.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
