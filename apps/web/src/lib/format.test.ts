import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
  it('formats positive amounts correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative amounts correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large amounts with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(0.99)).toBe('$0.99');
  });

  it('formats whole dollar amounts with cents', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });
});

describe('formatDate', () => {
  it('formats ISO date string correctly', () => {
    expect(formatDate('2026-08-13')).toBe('Aug 13, 2026');
  });

  it('formats January dates correctly', () => {
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
  });

  it('formats December dates correctly', () => {
    expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
  });

  it('handles different years', () => {
    expect(formatDate('2025-06-15')).toBe('Jun 15, 2025');
  });
});
