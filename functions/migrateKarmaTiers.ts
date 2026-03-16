import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * One-time migration script: converts old karma tier names to new display tiers.
 * Old: none / active / engaged / priority / champion (thresholds 0/100/300/500/1000)
 * New: Bronze / Silver / Gold / Platinum (thresholds 0/50/150/300)
 * 
 * Recalculates tier from actual point totals — doesn't just rename.
 */

const NEW_TIERS = [
  { name: 'Bronze',   threshold: 0 },
  { name: 'Silver',   threshold: 50 },
  { name: 'Gold',     threshold: 150 },
  { name: 'Platinum', threshold: 300 },
];

function getTierForPoints(points) {
  let tier = NEW_TIERS[0];
  for (const t of NEW_TIERS) {
    if (points >= t.threshold) tier = t;
    else break;
  }
  return tier.name;
}

// Map old boost values to new
function getBoostForTier(tierName) {
  const boosts = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3 };
  return boosts[tierName] ?? 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const results = { users_updated: 0, families_updated: 0, users_skipped: 0, families_skipped: 0, errors: [] };
    
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // ── 1. Migrate User records ──
    console.log('Starting user karma migration...');
    let offset = 0;
    const batchSize = 50;
    let hasMore = true;

    while (hasMore) {
      const users = await base44.asServiceRole.entities.User.list('-created_date', batchSize, offset);
      if (!users || users.length === 0) { hasMore = false; break; }

      for (const u of users) {
        try {
          const points = u.karma_points || u.karma_earned || 0;
          const currentLevel = u.karma_level || '';
          
          // Skip if already has a valid new tier name
          if (['Bronze', 'Silver', 'Gold', 'Platinum'].includes(currentLevel)) {
            results.users_skipped++;
            continue;
          }

          const newTier = getTierForPoints(points);
          const updateData = { karma_level: newTier };
          if (points > 0) {
            updateData.karma_points = points;
            updateData.karma_earned = points;
          }

          await base44.asServiceRole.entities.User.update(u.id, updateData);
          results.users_updated++;
          
          if (results.users_updated % 25 === 0) {
            console.log(`Migrated ${results.users_updated} users so far...`);
            await sleep(1000); // Rate limit pause
          }
        } catch (e) {
          if (e.message?.includes('Rate limit')) {
            console.log('Rate limit hit, pausing 3s...');
            await sleep(3000);
            // Retry once
            try {
              const newTier = getTierForPoints(u.karma_points || u.karma_earned || 0);
              await base44.asServiceRole.entities.User.update(u.id, { karma_level: newTier });
              results.users_updated++;
            } catch (e2) {
              results.errors.push({ type: 'user', id: u.id, error: e2.message });
            }
          } else {
            results.errors.push({ type: 'user', id: u.id, email: u.email, error: e.message });
          }
        }
      }

      await sleep(500); // Pause between batches
      offset += batchSize;
      if (users.length < batchSize) hasMore = false;
    }

    // ── 2. Migrate FamilyKarma records ──
    console.log('Starting FamilyKarma migration...');
    offset = 0;
    hasMore = true;

    while (hasMore) {
      const families = await base44.asServiceRole.entities.FamilyKarma.list('-created_date', batchSize, offset);
      if (!families || families.length === 0) { hasMore = false; break; }

      for (const fk of families) {
        try {
          const points = fk.total_karma || 0;
          const currentLevel = fk.karma_level || '';

          if (['Bronze', 'Silver', 'Gold', 'Platinum'].includes(currentLevel)) {
            results.families_skipped++;
            continue;
          }

          const newTier = getTierForPoints(points);
          const newBoost = getBoostForTier(newTier);

          await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
            karma_level: newTier,
            boost_multiplier: newBoost,
          });
          results.families_updated++;
          
          if (results.families_updated % 25 === 0) {
            await sleep(1000);
          }
        } catch (e) {
          if (e.message?.includes('Rate limit')) {
            await sleep(3000);
          }
          results.errors.push({ type: 'family', id: fk.id, group: fk.family_group_id, error: e.message });
        }
      }

      await sleep(500);
      offset += batchSize;
      if (families.length < batchSize) hasMore = false;
    }

    console.log('Migration complete:', JSON.stringify(results));
    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('Migration failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});