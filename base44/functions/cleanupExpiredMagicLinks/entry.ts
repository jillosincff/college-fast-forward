import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allTokens = await base44.asServiceRole.entities.MagicLink.filter({ used: false });
    const now = new Date();
    const expired = (allTokens || []).filter(t => new Date(t.expires_at) < now);

    for (const token of expired) {
      await base44.asServiceRole.entities.MagicLink.delete(token.id);
    }

    console.log(`[cleanupExpiredMagicLinks] Deleted ${expired.length} expired tokens`);
    return Response.json({ success: true, deleted: expired.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});