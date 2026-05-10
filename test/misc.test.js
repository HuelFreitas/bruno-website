import { describe, it, expect } from 'vitest';
import { formatDate, uid, combineDateTime, getDateInputValue } from '../src/utils/misc.js';

describe('misc utils', () => {
  it('formatDate returns formatted string for valid date', () => {
    const out = formatDate('2025-11-18T12:34:00');
    expect(typeof out).toBe('string');
    expect(out).not.toBe('Não informado');
  });

  it('formatDate returns "Não informado" for invalid input', () => {
    expect(formatDate('invalid-date')).toBe('Não informado');
    expect(formatDate(null)).toBe('Não informado');
  });

  it('uid returns string containing prefix and hyphens', () => {
    const id = uid('test');
    expect(id).toContain('test-');
    expect(typeof id).toBe('string');
  });

  it('combineDateTime builds ISO-like string or empty on invalid', () => {
    expect(combineDateTime('2025-11-18', '08:30')).toBe('2025-11-18T08:30:00');
    expect(combineDateTime('', '08:30')).toBe('');
    expect(combineDateTime('2025-11-18', '')).toBe('');
  });

  it('getDateInputValue returns yyyy-mm-dd or empty', () => {
    expect(getDateInputValue('2025-11-18T12:00:00')).toBe('2025-11-18');
    expect(getDateInputValue('invalid')).toBe('');
  });
});
