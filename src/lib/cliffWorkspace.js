// Cross-page handoff for the CLIFF Job Workspace.
// Job cards store the full job here, then route to the workspace page.
const KEY = 'cliff_workspace_job';

export function openCliffWorkspace(job) {
  try { sessionStorage.setItem(KEY, JSON.stringify(job)); } catch {}
  window.location.hash = '#/CliffJobWorkspace';
}

export function readWorkspaceJob() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Progressive-guide step state for the job workspace (Interested → Tailor →
// Apply → Track). Persisted in sessionStorage per job so it survives the
// Tailor navigation (which unmounts the workspace). `applied` is NOT stored
// here — it's read from the real NetworkingPipeline record so warm connections
// only unlock after a genuine tracked application.
const STEP_PREFIX = 'cliff_workspace_step_';
export function readWorkspaceStep(jobKey) {
  try {
    const raw = sessionStorage.getItem(STEP_PREFIX + (jobKey || ''));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
export function saveWorkspaceStep(jobKey, patch) {
  try {
    const cur = readWorkspaceStep(jobKey);
    sessionStorage.setItem(STEP_PREFIX + (jobKey || ''), JSON.stringify({ ...cur, ...patch }));
  } catch {}
}