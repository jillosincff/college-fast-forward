import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * One-time migration: converts old karma tier names to Bronze/Silver/Gold/Platinum.
 * 
 * Payload options:
 *   { startOffset: 0, maxRecords: 50 }
 * 
 * Run multiple times with increasing startOffset to process all records
 * without hitting rate limits. Each run processes up to maxRecords users.
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

function getBoostForTier(tierName) {
  const boosts = { Bronze: 0, Silver: 1, Gold: 2, Platinum: 3 };
  return boosts[tierName] ?? 0;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const startOffset = body.startOffset || 0;
    const maxRecords = Math.min(body.maxRecords || 50, 100);
    const migrateType = body.type || 'all'; // 'users', 'families', or 'all'

    const results = { users_updated: 0, families_updated: 0, users_skipped: 0, families_skipped: 0, errors: [], next_offset: startOffset };

    // ── Users ──
    if (migrateType === 'users' || migrateType === 'all') {
      console.log(`Fetching users at offset ${startOffset}, max ${maxRecords}...`);
      const users = await base44.asServiceRole.entities.User.list('-created_date', maxRecords, startOffset);
      
      if (users && users.length > 0) {
        for (let i = 0; i < users.length; i++) {
          const u = users[i];
          try {
            const points = u.karma_points || u.karma_earned || 0;
            const currentLevel = u.karma_level || '';

            if (['Bronze', 'Silver', 'Gold', 'Platinum'].includes(currentLevel)) {
              results.users_skipped++;
              continue;
            }

            const newTier = getTierForPoints(points);
            await base44.asServiceRole.entities.User.update(u.id, {
              karma_level: newTier,
              ...(points > 0 ? { karma_points: points, karma_earned: points } : {}),
            });
            results.users_updated++;
          } catch (e) {
            results.errors.push({ type: 'user', id: u.id, error: e.message });
          }

          // Pause every 5 records to stay under rate limits
          if ((i + 1) % 5 === 0) {
            await sleep(2000);
          }
        }
        results.next_offset = startOffset + users.length;
        results.has_more_users = users.length === maxRecords;
      } else {
        results.has_more_users = false;
      }
    }

    // ── FamilyKarma ──
    if (migrateType === 'families' || migrateType === 'all') {
      await sleep(2000);
      console.log('Fetching FamilyKarma records...');
      const families = await base44.asServiceRole.entities.FamilyKarma.list('-created_date', maxRecords, 0);

      if (families && families.length > 0) {
        for (let i = 0; i < families.length; i++) {
          const fk = families[i];
          try {
            const points = fk.total_karma || 0;
            const currentLevel = fk.karma_level || '';

            if (['Bronze', 'Silver', 'Gold', 'Platinum'].includes(currentLevel)) {
              results.families_skipped++;
              continue;
            }

            const newTier = getTierForPoints(points);
            await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
              karma_level: newTier,
              boost_multiplier: getBoostForTier(newTier),
            });
            results.families_updated++;
          } catch (e) {
            results.errors.push({ type: 'family', id: fk.id, error: e.message });
          }

          if ((i + 1) % 5 === 0) {
            await sleep(2000);
          }
        }
      }
    }

    console.log('Batch complete:', JSON.stringify(results));
    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('Migration failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});