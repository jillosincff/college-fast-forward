/**
 * Title-case a string: "goldman sachs" → "Goldman Sachs"
 * Handles edge cases like empty strings and single words.
 */
export default function titleCase(str) {
  if (!str || typeof str !== 'string') return str || '';
  return str.replace(/\b\w/g, c => c.toUpperCase());
}