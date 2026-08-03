// Track & Redirect leaves a gap: the student opens the employer's site in a new
// tab and often never tells us whether they finished. This queues a single
// lightweight confirmation per application so the pipeline stays honest.

const KEY = 'cff_apply_confirmations';
const DELAY_MS = 30 * 60 * 1000; // ask ~30 minutes after they leave for the employer site

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}

function writeAll(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function queueApplyConfirmation({ pipelineId, company, role }) {
  if (!pipelineId) return;
  const list = readAll();
  if (list.some(c => c.pipelineId === pipelineId)) return; // never nag twice
  list.push({ pipelineId, company, role: role || '', dueAt: Date.now() + DELAY_MS });
  writeAll(list);
}

export function getDueConfirmation() {
  return readAll().find(c => Date.now() >= c.dueAt) || null;
}

export function resolveConfirmation(pipelineId) {
  writeAll(readAll().filter(c => c.pipelineId !== pipelineId));
}

// "Not yet" — push the reminder out rather than dropping it.
export function snoozeConfirmation(pipelineId, hours = 24) {
  writeAll(readAll().map(c =>
    c.pipelineId === pipelineId ? { ...c, dueAt: Date.now() + hours * 3600000 } : c
  ));
}