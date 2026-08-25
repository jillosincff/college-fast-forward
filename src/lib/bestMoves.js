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
  const moves = (data?.moves || []).filter(m => {
    const entry = ledger[moveKey(m)];
    if (!entry) return true;
    if (m.kind === 'followup') return false;
    return (entry.count || 0) < 2;
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