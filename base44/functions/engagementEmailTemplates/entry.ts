/**
 * CFF Engagement Agent — Email Templates Library
 * This file is NOT a standalone function — it is imported by runEngagementAgent.
 * It exports template generators for each email in Workflow 1 and Workflow 2.
 *
 * Voice rules enforced here:
 * - Hi [first name] or [first name],
 * - Sign "— Jill"
 * - 4-8 sentences per email
 * - Always end with P.S.
 * - No photos reference
 * - No FastIQ pricing
 * - Banned words: discover, unlock, transform, elevate, game-changing, revolutionary,
 *   must-have, "in today's competitive job market", "career journey", "dream job"
 */

Deno.serve(async (_req) => {
  return Response.json({ message: "This is a template library, not a callable endpoint." }, { status: 200 });
});