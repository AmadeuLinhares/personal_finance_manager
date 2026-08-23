/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute API base for a build that does not go through Vite's dev proxy.
   * Unset in dev, where `/api` is proxied to localhost:4000 and stays same-origin.
   */
  readonly VITE_API_URL?: string;
}
