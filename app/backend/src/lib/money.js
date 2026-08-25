/**
 * Money is *always* an integer number of minor units (cents for CAD/USD/EUR).
 * Nothing in this API accepts or returns a decimal amount — floats are rejected
 * at the edge so rounding errors can never enter the store.
 *
 *   -4599  =>  an outflow of $45.99
 *    320000 => an inflow of $3,200.00
 *
 * Sign convention, everywhere:
 *   amount  < 0  money left the account (expense, bill, transfer out)
 *   amount  > 0  money entered the account (income, refund, transfer in)
 *   balance < 0  the account is overdrawn, or (for a credit card) you owe money
 */

import { CURRENCY_CODES } from '@pfm/contracts';

/**
 * Which currencies exist is the contract's call (@pfm/contracts owns the list the
 * client types against); how each one is written is this module's. Building the
 * map from CURRENCY_CODES means a currency added to the contract cannot be one
 * this API silently rejects.
 */
const SYMBOLS = { CAD: '$', USD: '$', EUR: '€' };

export const CURRENCIES = Object.fromEntries(
  CURRENCY_CODES.map((code) => [code, { code, minorUnits: 2, symbol: SYMBOLS[code] ?? '$' }]),
);

export const BASE_CURRENCY = 'CAD';

/** Formats minor units for log output. Never used in responses. */
export function formatMinor(amount, currency = BASE_CURRENCY) {
  const { minorUnits, symbol } = CURRENCIES[currency] ?? CURRENCIES[BASE_CURRENCY];
  const factor = 10 ** minorUnits;
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}${symbol}${Math.floor(abs / factor)}.${String(abs % factor).padStart(minorUnits, '0')}`;
}
