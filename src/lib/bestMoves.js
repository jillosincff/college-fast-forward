import { base44 } from '@/api/base44Client';
import { getTodaysBestMoves } from '@/functions/getTodaysBestMoves';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';

// Shared source of truth for CLIFF's daily ranked moves.
// The hero card and the full move list read/write the SAME cached state so
// completing a move in one place is reflected in the other.

export const movesStorageKey = (email) =>
  `cliff_best_moves_v3_${email}_${new Date().toISOString().slice(0, 10)}`;

// Cross-day ledger of moves the student acted on ("Did it" / "Send").
// The home queue must be alive: a completed follow-up never returns, and a
// move dismissed twice across days stops being shown entirely.
const ledgerKey = (email) => `cliff_move_ledger_v1_${email}`;

// Every rendered move must name a real target: role + company, or a named
// person. A dangling "Apply to " row is worse than no row at all.
const BROKEN_TAIL = /^(apply to|follow up on|follow up with|message|start your|finish your|prepare resume for)\s*$/i;

export function isRenderableMove(m) {
  const title = (m?.title || '').trim();
  if (!title || BROKEN_TAIL.test(title)) return false;
  const a = m.action || {};
  // A workspace/apply row without a company has nowhere to send the student.
  if (a.type === 'workspace' && !(a.company || '').trim()) return false;
  if (a.type === 'followup' && !(a.company || '').trim() && !(a.contactName || '').trim()) return false;
  return true;
}

// Both the hero and the plan re-read the shared cache when either one advances,
// so completing a move updates the whole queue the same day.
export const MOVES_UPDATED = 'cliff:moves-updated';

// Fired when the student edits their career goals. Today's queue was built for
// the OLD goals, so every surface must drop its cache and re-ask CLIFF.
export const GOALS_UPDATED = 'cff:goals-updated';

export function clearMovesCache(email) {
  try { localStorage.removeItem(movesStorageKey(email)); } catch {}
}

export const moveKey = (m) =>
  [m.kind || '', (m.company || '').toLowerCase().trim(), (m.action?.role || '').toLowerCase().trim()].join('|');

function readLedger(email) {
  try { return JSON.parse(localStorage.getItem(ledgerKey(email))) || {}; } catch { return {}; }
}

function bumpLedger(email, move) {
  try {
    const ledger = readLedger(email);
    const key = moveKey(move);
    const entry = ledger[key] || { count: 0 };
    ledger[key] = { count: (entry.count || 0) + 1, last: new Date().toISOString() };
    localStorage.setItem(ledgerKey(email), JSON.stringify(ledger));
  } catch {}
}

export function readMovesCache(email) {
  try {
    const saved = JSON.parse(localStorage.getItem(movesStorageKey(email)));
    return saved?.moves ? saved : null;
  } catch { return null; }
}

export function writeMovesCache(email, state) {
  try { localStorage.setItem(movesStorageKey(email), JSON.stringify(state)); } catch {}
}

export async function loadBestMoves(email) {
  const cached = readMovesCache(email);
  if (cached) return cached;
  const res = await getTodaysBestMoves({});
  const data = res?.data || res;
  // Never re-serve a move the student already acted on: a completed follow-up
  // does not come back, and any move acted on / dismissed twice stops showing.
  const ledger = readLedger(email);
  // A move the student already acted on ("Did it" / "Send") is done for good —
  // it never resurfaces, so the plan actually evolves day to day.
  const moves = (data?.moves || []).filter(m => {
    if (!isRenderableMove(m)) return false;
    const entry = ledger[moveKey(m)];
    return !entry; // any prior action prunes the move
  });
  const state = { moves, done: moves.map(() => false) };
  writeMovesCache(email, state);
  return state;
}

// Marks a move complete, persists it, and records the real-world side effect.
// "Did it" on a follow-up means the student sent it — write that to the
// pipeline so tomorrow's queue knows (unless the draft modal already did).
export function completeMove(email, state, index, { sentViaModal = false } = {}) {
  const move = state.moves[index];
  const next = { ...state, done: state.done.map((d, j) => (j === index ? true : d)) };
  writeMovesCache(email, next);
  try { window.dispatchEvent(new CustomEvent(MOVES_UPDATED)); } catch {}
  if (move) {
    bumpLedger(email, move);
    const a = move.action || {};
    if (a.type === 'followup' && a.pipelineId && !sentViaModal) {
      base44.entities.NetworkingPipeline.update(a.pipelineId, {
        follow_up_date: new Date().toISOString(),
        follow_up_count: (a.followUpCount || 0) + 1,
      }).catch(() => {});
    }
  }
  return next;
}

// Executes a move's CTA. Returns 'followup' when the caller must open the
// draft modal instead of navigating.
export function runMoveAction(move) {
  if (move.discoveryId) {
    base44.entities.CliffDiscovery.update(move.discoveryId, { status: 'actioned' }).catch(() => {});
  }
  const a = move.action || {};
  if (a.type === 'followup') return 'followup';
  if (a.type === 'workspace') {
    openCliffWorkspace({ company: a.company, role: a.role || '', jobUrl: a.jobUrl || '', location: a.location || '' });
  } else if (a.route?.startsWith('#/')) {
    let route = a.route;
    if (a.company && route.toLowerCase().includes('applicationtracker')) {
      route += (route.includes('?') ? '&' : '?') + 'highlight=' + encodeURIComponent(a.company);
    }
    window.location.hash = route;
  }
  return 'navigated';
}