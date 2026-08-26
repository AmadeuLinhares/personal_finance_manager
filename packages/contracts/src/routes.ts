export const routes = {
  meta: '/meta',

  accounts: {
    list: '/accounts',
    balances: '/accounts/balances',
    byId: (id: string) => `/accounts/${id}`,
    balance: (id: string) => `/accounts/${id}/balance`,
    balanceHistory: (id: string) => `/accounts/${id}/balance-history`,
    create: '/accounts',
    update: (id: string) => `/accounts/${id}`,
    delete: (id: string) => `/accounts/${id}`,
  },

  transactions: {
    list: '/transactions',
    byId: (id: string) => `/transactions/${id}`,
    create: '/transactions',
    bulk: '/transactions/bulk',
    bulkUpdate: '/transactions/bulk-update',
    update: (id: string) => `/transactions/${id}`,
    delete: (id: string) => `/transactions/${id}`,
  },

  transfers: {
    list: '/transfers',
    byId: (transferId: string) => `/transfers/${transferId}`,
    create: '/transfers',
    delete: (transferId: string) => `/transfers/${transferId}`,
  },

  categories: {
    list: '/categories',
    byId: (id: string) => `/categories/${id}`,
    create: '/categories',
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`,
  },

  projects: {
    list: '/projects',
    byId: (id: string) => `/projects/${id}`,
    summary: (id: string) => `/projects/${id}/summary`,
    create: '/projects',
    update: (id: string) => `/projects/${id}`,
    delete: (id: string) => `/projects/${id}`,
  },

  scheduledItems: {
    list: '/scheduled-items',
    occurrences: '/scheduled-items/occurrences',
    byId: (id: string) => `/scheduled-items/${id}`,
    itemOccurrences: (id: string) => `/scheduled-items/${id}/occurrences`,
    create: '/scheduled-items',
    update: (id: string) => `/scheduled-items/${id}`,
    delete: (id: string) => `/scheduled-items/${id}`,
    post: (id: string) => `/scheduled-items/${id}/post`,
    skip: (id: string) => `/scheduled-items/${id}/skip`,
    unskip: (id: string) => `/scheduled-items/${id}/unskip`,
  },

  reports: {
    monthlyExpenses: '/reports/monthly-expenses',
    categoryBreakdown: '/reports/category-breakdown',
    cashFlow: '/reports/cash-flow',
  },

  projections: {
    budget: '/projections/budget',
  },

  dev: {
    reset: '/dev/reset',
    settings: '/dev/settings',
    stats: '/dev/stats',
  },
} as const;
