import { describe, it, expect } from 'vitest';
import { escapeHtml, safeTrim } from '../src/utils/string.js';

describe('string utils', () => {
  it('escapeHtml should escape special characters', () => {
    const raw = `Tom & Jerry <script>alert('x')</script> "quote"`;
    const out = escapeHtml(raw);
    expect(out).toContain('&amp;');
    expect(out).toContain('&lt;');
    expect(out).toContain('&gt;');
    expect(out).toContain('&quot;');
    expect(out).toContain('&#39;');
  });

  it('safeTrim should trim strings and return empty for non-strings', () => {
    expect(safeTrim('  hello  ')).toBe('hello');
    expect(safeTrim(null)).toBe('');
    expect(safeTrim(123)).toBe('');
  });
});
