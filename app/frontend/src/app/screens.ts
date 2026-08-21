/** Kept out of AppHeader so that file exports only components and HMR stays intact. */
export const SCREENS = ['Overview', 'Transactions', 'Reports', 'Planning', 'Projects'] as const;

export type Screen = (typeof SCREENS)[number];
