// ── Canonical student count ──────────────────────────────────────────
// Source: audited DB query — base44.entities.User with persona='student'
// Run: 2026-09-07 → 280 verified students.
//
// This is the ONLY student count that should appear anywhere in the app.
// Every chip, badge, hero count, and proof line must import and use this.
// Do not invent or hardcode other numbers. If the count changes, update
// this constant after re-auditing the DB — do not guess.
export const VERIFIED_STUDENT_COUNT = 280;
export const VERIFIED_STUDENT_LABEL = '280+';