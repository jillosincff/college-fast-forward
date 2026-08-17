import { base44 } from '@/api/base44Client';
import { getTodaysBestMoves } from '@/functions/getTodaysBestMoves';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';

// Shared source of truth for CLIFF's daily ranked moves.
// The hero card and the full move list read/write the SAME cached state so
// completing a move in one place is reflected in the other.

export const movesStorageKey = (email) =>
  `cliff_best_moves_v3_${email}_${new Date().toISOString().slice(0, 10)}`;

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
  const state = { moves: data?.moves || [], done: (data?.moves || []).map(() => false) };
  writeMovesCache(email, state);
  return state;
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