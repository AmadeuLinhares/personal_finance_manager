/**
 * The API data contract, in one place, shared by the Express API and the client.
 *
 * The API owns these shapes; both apps import them instead of restating them.
 * README.md says what belongs here and what does not.
 */

export * from './primitives.ts';
export * from './envelopes.ts';
export * from './routes.ts';
export * from './accounts.ts';
export * from './categories.ts';
export * from './transactions.ts';
export * from './projects.ts';
export * from './scheduledItems.ts';
export * from './reports.ts';
export * from './projections.ts';
