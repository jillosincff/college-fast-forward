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