// Issue status constants
export const ISSUE_STATUS = {
  OPEN: 'OPEN',
  SOLVED: 'SOLVED',
};

// Issue status options for dropdowns
export const ISSUE_STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'red' },
  { value: 'SOLVED', label: 'Solved', color: 'green' },
];

// Issue type constants (based on Prisma schema)
export const ISSUE_TYPES = {
  SLOWNESS: 'SLOWNESS',
  NO_CONNECTION: 'NO_CONNECTION',
  ON_OFF: 'ON_OFF',
  RELOCATION: 'RELOCATION',
  OFFLINE: 'OFFLINE',
  OTHER: 'OTHER',
};

// Issue type options for dropdowns
export const ISSUE_TYPE_OPTIONS = [
  { value: 'SLOWNESS', label: 'Slowness' },
  { value: 'NO_CONNECTION', label: 'No Connection' },
  { value: 'ON_OFF', label: 'On/Off Issues' },
  { value: 'RELOCATION', label: 'Relocation' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'OTHER', label: 'Other' },
];

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  sortBy: 'submittedAt',
  sortOrder: 'desc',
};

// Date format helpers
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy HH:mm',
  DISPLAY_DATE: 'MMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
};

// API endpoints
export const API_ENDPOINTS = {
  ISSUES: '/issues',
  STATS: '/issues/stats',
  EXPORT: '/issues/export',
};
