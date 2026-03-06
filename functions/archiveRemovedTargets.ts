import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Archives data associated with removed target companies.
 * Keeps active pipeline contacts (reached_out, replied, interview, offer) visible.
 * Only archives "identified" pipeline records.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { removed_companies, profile_id } = await req.json();
    if (!removed_companies || removed_companies.length === 0) {
      return Response.json({ success: true, archived: 0 });
    }

    const email = user.email;
    const removedLower = removed_companies.map(c => c.toLowerCase());
    let totalArchived = 0;

    // 1. Archive ScoutedOpportunity records for removed companies
    const allOpps = await base44.entities.ScoutedOpportunity.filter({ user_email: email });
    for (const opp of (allOpps || [])) {
      if (removedLower.includes((opp.company_name || '').toLowerCase())) {
        await base44.entities.ScoutedOpportunity.update(opp.id, { status: 'dismissed', is_new: false });
        totalArchived++;
      }
    }

    // 2. Archive NetworkingPipeline records — ONLY "identified" status
    const allPipeline = await base44.entities.NetworkingPipeline.filter({ user_email: email });
    for (const p of (allPipeline || [])) {
      if (removedLower.includes((p.company || '').toLowerCase()) && p.status === 'identified') {
        await base44.entities.NetworkingPipeline.update(p.id, { notes: (p.notes || '') + '\n[archived: target removed]' });
        totalArchived++;
      }
    }

    // 3. Reset new_alerts_count on profile
    if (profile_id) {
      await base44.entities.FastTrackProProfile.update(profile_id, { new_alerts_count: 0 });
    }

    return Response.json({ success: true, archived: totalArchived, removed_companies });
  } catch (error) {
    console.error('archiveRemovedTargets error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});