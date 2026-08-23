/** Kept out of AppHeader so that file exports only components and HMR stays intact. */
export const SCREENS = ['Overview', 'Transactions', 'Reports', 'Planning', 'Projects'] as const;

export type Screen = (typeof SCREENS)[number];

/**
 * The screens wired to the API. Everything else is still layout over fixtures,
 * and says so — a half-wired screen that looks finished is worse than one that
 * admits what it is.
 */
export const IMPLEMENTED_SCREENS: readonly Screen[] = ['Transactions'];
