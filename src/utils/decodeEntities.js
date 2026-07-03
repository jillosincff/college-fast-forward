// Decode HTML entities (e.g. "&amp;" → "&") that come through in job feed data
export default function decodeEntities(str) {
  if (!str || typeof str !== 'string' || !str.includes('&')) return str || '';
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}