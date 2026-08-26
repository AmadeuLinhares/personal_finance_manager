export const SCREENS = ['Overview', 'Transactions', 'Reports', 'Planning'] as const;

export type Screen = (typeof SCREENS)[number];

export type Destination = Exclude<Screen, 'Overview'>;
