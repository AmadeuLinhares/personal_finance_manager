/**
 * Fixtures for the layout, shaped like the API contract: money is integer minor
 * units, dates are `YYYY-MM-DD` calendar strings, and every account declares its
 * own currency because CAD and USD are never summed.
 *
 * Nothing here talks to the server. When the real data arrives, these types are
 * the seam to replace.
 */

export type Currency = 'CAD' | 'USD';
type TxStatus = 'posted' | 'pending';
export type OccurrenceStatus = 'overdue' | 'scheduled' | 'posted' | 'skipped';
export type ProjectStatus = 'active' | 'planned' | 'completed';

export interface Account {
  id: string;
  name: string;
  /** The card's small-caps line: type and institution. */
  kicker: string;
  currency: Currency;
  posted: number;
  pending: number;
  /** Cards only. Null on deposit accounts. */
  creditLimit: number | null;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  /** Null is a real state — the review queue, not a category called "Other". */
  category: string | null;
  accountId: string;
  amount: number;
  status: TxStatus;
  project?: string;
  /** Both legs of a transfer share it. Reports exclude them. */
  transferId?: string;
}

export interface Occurrence {
  id: string;
  due: string;
  name: string;
  amount: number;
  status: OccurrenceStatus;
  frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  accountId: string;
  category: string;
  note?: string;
  project?: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  budget: number;
  spent: number;
  committed: number;
  transactionCount: number;
  recent: { date: string; label: string; amount: number }[];
}

export const TODAY = '2026-08-21';
export const CURRENT_MONTH = '2026-08';

export const ACCOUNTS: Account[] = [
  {
    id: 'acc_chequing',
    name: 'Everyday Chequing',
    kicker: 'Chequing · Banque Nationale',
    currency: 'CAD',
    posted: 482055,
    pending: 0,
    creditLimit: null,
  },
  {
    id: 'acc_savings',
    name: 'High-Interest Savings',
    kicker: 'Savings · Banque Nationale',
    currency: 'CAD',
    posted: 1240000,
    pending: 0,
    creditLimit: null,
  },
  {
    id: 'acc_visa',
    name: 'Travel Rewards Visa',
    kicker: 'Credit card · Travel Rewards Visa',
    currency: 'CAD',
    posted: -627122,
    pending: -74500,
    creditLimit: 1500000,
  },
  {
    id: 'acc_cash',
    name: 'Cash Wallet',
    kicker: 'Cash · Wallet',
    currency: 'CAD',
    posted: 21035,
    pending: 0,
    creditLimit: null,
  },
  {
    id: 'acc_usd',
    name: 'USD Chequing',
    kicker: 'Chequing · USD account',
    currency: 'USD',
    posted: 133518,
    pending: 0,
    creditLimit: null,
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: 't01',
    date: '2026-08-20',
    description: 'Metro Plus',
    category: 'Groceries',
    accountId: 'acc_chequing',
    amount: -6430,
    status: 'posted',
  },
  {
    id: 't02',
    date: '2026-08-19',
    description: 'Refund · Amazon return',
    category: 'Shopping',
    accountId: 'acc_visa',
    amount: 4599,
    status: 'posted',
  },
  {
    id: 't03',
    date: '2026-08-18',
    description: 'Hydro-Québec',
    category: 'Utilities',
    accountId: 'acc_chequing',
    amount: -7214,
    status: 'posted',
  },
  {
    id: 't04',
    date: '2026-08-17',
    description: 'Hotel hold · Fairmont',
    category: 'Travel',
    accountId: 'acc_visa',
    amount: -74500,
    status: 'pending',
  },
  {
    id: 't05',
    date: '2026-08-16',
    description: 'Home Depot · tiles',
    category: 'Home',
    accountId: 'acc_visa',
    amount: -41280,
    status: 'posted',
    project: 'Kitchen remodel',
  },
  {
    id: 't06',
    date: '2026-08-16',
    description: 'Savings interest',
    category: 'Income',
    accountId: 'acc_savings',
    amount: 1240,
    status: 'posted',
  },
  {
    id: 't07',
    date: '2026-08-15',
    description: 'Rent · Rue Saint-Denis',
    category: 'Housing',
    accountId: 'acc_chequing',
    amount: -215000,
    status: 'posted',
  },
  {
    id: 't08',
    date: '2026-08-15',
    description: 'Salary · Acme Studio',
    category: 'Income',
    accountId: 'acc_chequing',
    amount: 172500,
    status: 'posted',
  },
  {
    id: 't09',
    date: '2026-08-14',
    description: 'STM monthly pass',
    category: 'Transport',
    accountId: 'acc_chequing',
    amount: -9750,
    status: 'posted',
  },
  {
    id: 't10',
    date: '2026-08-13',
    description: 'POS PURCHASE 8841',
    category: null,
    accountId: 'acc_visa',
    amount: -3145,
    status: 'posted',
  },
  {
    id: 't11',
    date: '2026-08-12',
    description: 'Pharmaprix',
    category: 'Health',
    accountId: 'acc_chequing',
    amount: -2390,
    status: 'posted',
  },
  {
    id: 't12',
    date: '2026-08-11',
    description: 'Plumber · deposit',
    category: 'Home',
    accountId: 'acc_chequing',
    amount: -60000,
    status: 'posted',
    project: 'Kitchen remodel',
  },
  {
    id: 't13',
    date: '2026-08-10',
    description: 'Transfer to Savings',
    category: 'Transfer',
    accountId: 'acc_chequing',
    amount: -50000,
    status: 'posted',
    transferId: 'trf_1',
  },
  {
    id: 't14',
    date: '2026-08-10',
    description: 'Transfer from Chequing',
    category: 'Transfer',
    accountId: 'acc_savings',
    amount: 50000,
    status: 'posted',
    transferId: 'trf_1',
  },
  {
    id: 't15',
    date: '2026-08-09',
    description: 'Air France · flight deposit',
    category: 'Travel',
    accountId: 'acc_visa',
    amount: -34000,
    status: 'posted',
    project: 'Trip to France',
  },
  {
    id: 't16',
    date: '2026-08-08',
    description: 'AWS invoice',
    category: 'Other',
    accountId: 'acc_usd',
    amount: -3200,
    status: 'posted',
  },
  {
    id: 't17',
    date: '2026-08-05',
    description: 'Freelance invoice #218',
    category: 'Income',
    accountId: 'acc_chequing',
    amount: 124000,
    status: 'posted',
  },
  {
    id: 't18',
    date: '2026-08-03',
    description: 'Paint & supplies',
    category: 'Home',
    accountId: 'acc_chequing',
    amount: -18635,
    status: 'posted',
    project: 'Kitchen remodel',
  },
  {
    id: 't19',
    date: '2026-08-01',
    description: 'Salary · Acme Studio',
    category: 'Income',
    accountId: 'acc_chequing',
    amount: 172500,
    status: 'posted',
  },
  {
    id: 't20',
    date: '2026-08-01',
    description: 'Pre-auth reversal',
    category: 'Other',
    accountId: 'acc_visa',
    amount: 0,
    status: 'posted',
  },
  {
    id: 't21',
    date: '2026-07-31',
    description: 'Costco',
    category: 'Groceries',
    accountId: 'acc_chequing',
    amount: -14210,
    status: 'posted',
  },
];

/** Monthly budget per category, in minor units. Absent means unbudgeted. */
export const BUDGETS: Record<string, number | undefined> = {
  Groceries: 60000,
  Dining: 30000,
  Housing: 215000,
  Utilities: 15000,
  Transport: 12000,
  Travel: 50000,
  Health: 10000,
  Home: 100000,
  Shopping: 25000,
};

export const OCCURRENCES: Occurrence[] = [
  {
    id: 'o1',
    due: '2026-08-19',
    name: 'Internet · Vidéotron',
    amount: -6499,
    status: 'overdue',
    frequency: 'monthly',
    accountId: 'acc_chequing',
    category: 'Utilities',
  },
  {
    id: 'o2',
    due: '2026-08-20',
    name: 'Netflix',
    amount: -1699,
    status: 'scheduled',
    frequency: 'monthly',
    accountId: 'acc_visa',
    category: 'Other',
  },
  {
    id: 'o3',
    due: '2026-08-29',
    name: 'Salary · Acme Studio',
    amount: 172500,
    status: 'scheduled',
    frequency: 'biweekly',
    accountId: 'acc_chequing',
    category: 'Income',
  },
  {
    id: 'o4',
    due: '2026-08-31',
    name: 'Water · quarterly',
    amount: -9800,
    status: 'scheduled',
    frequency: 'quarterly',
    accountId: 'acc_chequing',
    category: 'Utilities',
    note: 'anchored to the 31st — clamps in short months',
  },
  {
    id: 'o5',
    due: '2026-09-01',
    name: 'Rent · Rue Saint-Denis',
    amount: -215000,
    status: 'scheduled',
    frequency: 'monthly',
    accountId: 'acc_chequing',
    category: 'Housing',
  },
  {
    id: 'o6',
    due: '2026-09-05',
    name: 'French course · Alliance',
    amount: -22000,
    status: 'scheduled',
    frequency: 'once',
    accountId: 'acc_chequing',
    category: 'Travel',
    project: 'Trip to France',
  },
  {
    id: 'o7',
    due: '2026-09-12',
    name: 'Salary · Acme Studio',
    amount: 172500,
    status: 'scheduled',
    frequency: 'biweekly',
    accountId: 'acc_chequing',
    category: 'Income',
  },
  {
    id: 'o8',
    due: '2026-09-15',
    name: 'Kitchen contractor · final',
    amount: -45500,
    status: 'scheduled',
    frequency: 'once',
    accountId: 'acc_chequing',
    category: 'Home',
    project: 'Kitchen remodel',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'proj_kitchen',
    name: 'Kitchen remodel',
    status: 'active',
    budget: 3400000,
    spent: 3160650,
    committed: 45500,
    transactionCount: 18,
    recent: [
      { date: '2026-08-16', label: 'Home Depot · tiles', amount: -41280 },
      { date: '2026-08-11', label: 'Plumber · deposit', amount: -60000 },
      { date: '2026-08-03', label: 'Paint & supplies', amount: -18635 },
    ],
  },
  {
    id: 'proj_france',
    name: 'Trip to France',
    status: 'planned',
    budget: 350000,
    spent: 118000,
    committed: 22000,
    transactionCount: 4,
    recent: [{ date: '2026-08-09', label: 'Air France · flight deposit', amount: -34000 }],
  },
  {
    id: 'proj_office',
    name: 'Home office',
    status: 'completed',
    budget: 250000,
    spent: 238420,
    committed: 0,
    transactionCount: 11,
    recent: [
      { date: '2026-05-12', label: 'Standing desk', amount: -79900 },
      { date: '2026-04-28', label: 'Monitor · Dell 27"', amount: -45900 },
      { date: '2026-03-15', label: 'Chair · secondhand', amount: -22000 },
    ],
  },
];
