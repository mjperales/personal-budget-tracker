/**
 * Formats a number as USD currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats an ISO date string for display
 * @param dateString - ISO 8601 date string (e.g., "2026-08-13")
 * @returns Formatted date string (e.g., "Aug 13, 2026")
 */
export function formatDate(dateString: string): string {
  // Parse as UTC to avoid timezone issues with date-only strings
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
