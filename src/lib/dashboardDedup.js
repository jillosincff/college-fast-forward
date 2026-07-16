// Shared recommendation-dedup layer: one underlying action must never appear
// as several dashboard modules. The hero registers its Today's Priority; other
// surfaces (Today's Plan, prompts) check against it before rendering.
const normalize = (t) => (t || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

let heroPriority = '';

export function setHeroPriority(title) {
  heroPriority = normalize(title);
  try { window.dispatchEvent(new Event('cliff:hero-priority')); } catch {}
}

export function matchesHeroPriority(text) {
  if (!heroPriority) return false;
  const t = normalize(text);
  if (!t) return false;
  return t.includes(heroPriority) || heroPriority.includes(t);
}