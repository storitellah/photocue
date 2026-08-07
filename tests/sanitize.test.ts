import { describe, expect, it } from 'vitest';
import { escapeHtml, sanitizeText, sanitizeMultiline, sanitizeTag } from '../src/util/sanitize';

describe('text sanitisation and escaping', () => {
  it('escapes HTML metacharacters so location names cannot inject markup', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
    expect(escapeHtml('a & b "c" \'d\' `e`')).toBe('a &amp; b &quot;c&quot; &#39;d&#39; &#96;e&#96;');
  });

  it('strips angle brackets and control characters from short fields', () => {
    expect(sanitizeText('<b>Kibera</b>')).toBe('bKibera/b');
    expect(sanitizeText('Nairobi  CBD')).toBe('Nairobi CBD');
  });

  it('bounds short fields to a safe length', () => {
    const long = 'x'.repeat(500);
    expect(sanitizeText(long).length).toBe(120);
  });

  it('preserves newlines in notes but removes control characters and brackets', () => {
    const bell = String.fromCharCode(7);
    const note = `Line one\nLine two <img>${bell} end`;
    const out = sanitizeMultiline(note);
    expect(out).toContain('Line one\nLine two');
    expect(out).not.toContain('<');
    expect(out.includes(bell)).toBe(false);
  });

  it('normalises tags to a safe slug charset', () => {
    expect(sanitizeTag('Public Space!!!')).toBe('public space');
    expect(sanitizeTag('<xss>')).toBe('xss');
  });

  it('handles null and undefined without throwing', () => {
    expect(sanitizeText(undefined)).toBe('');
    expect(escapeHtml(null)).toBe('');
  });
});
