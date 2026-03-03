import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const KARMA_TIERS = [
  { name: 'none', threshold: 0, boost: 0 },
  { name: 'active', threshold: 100, boost: 1 },
  { name: 'engaged', threshold: 300, boost: 2 },
  { name: 'priority', threshold: 500, boost: 3 },
  { name: 'champion', threshold: 1000, boost: 5 }
];

function getKarmaLevel(totalKarma) {
  let currentTier = KARMA_TIERS[0];
  for (const tier of KARMA_TIERS) {
    if (totalKarma >= tier.threshold) currentTier = tier;
    else break;
  }
  return currentTier;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'fix_levels'; // 'fix_levels', 'fix_orphans', 'recalc_totals'

    if (mode === 'fix_levels') {
      // Step 1: Fix karma_level and boost_multiplier on all FamilyKarma records
      const allFK = await base44.asServiceRole.entities.FamilyKarma.list('-total_karma', 500);
      const fixes = [];

      for (const fk of allFK) {
        const total = fk.total_karma || 0;
        const correct = getKarmaLevel(total);
        
        if (fk.karma_level !== correct.name || fk.boost_multiplier !== correct.boost) {
          await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
            karma_level: correct.name,
            boost_multiplier: correct.boost
          });
          fixes.push({
            id: fk.id,
            family_group_id: fk.family_group_id,
            total: total,
            old: `${fk.karma_level}/${fk.boost_multiplier}`,
            new: `${correct.name}/${correct.boost}`
          });
          // Rate limit protection
          if (fixes.length % 5 === 0) await sleep(500);
        }
      }

      return Response.json({ success: true, mode, total_records: allFK.length, fixed: fixes.length, fixes });
    }

    if (mode === 'fix_orphans') {
      // Step 2: Fix orphaned transactions (user_<id> → real family group)
      const txs = await base44.asServiceRole.entities.KarmaTransaction.list('-created_date', 200);
      const orphanTxs = txs.filter(tx => tx.family_group_id?.startsWith('user_'));
      
      const fixes = [];
      const userCache = {};

      for (const tx of orphanTxs) {
        const userId = tx.family_group_id.replace('user_', '');
        
        // Cache user lookups
        if (!userCache[userId]) {
          try {
            const families = await base44.asServiceRole.entities.Family.filter({ primary_parent_id: userId });
            userCache[userId] = families.length > 0 ? families[0].family_group_id : null;
            await sleep(200);
          } catch (e) {
            userCache[userId] = null;
          }
        }

        const realFGId = userCache[userId];
        if (realFGId) {
          await base44.asServiceRole.entities.KarmaTransaction.update(tx.id, {
            family_group_id: realFGId
          });
          fixes.push({ tx_id: tx.id, email: tx.parent_email, old: tx.family_group_id, new: realFGId });
          if (fixes.length % 5 === 0) await sleep(500);
        }
      }

      // Also fix user records missing family_group_id
      for (const [userId, fgId] of Object.entries(userCache)) {
        if (fgId) {
          try {
            await base44.asServiceRole.entities.User.update(userId, { family_group_id: fgId });
          } catch (e) {
            console.log(`Could not fix user ${userId}:`, e.message);
          }
        }
      }

      return Response.json({ success: true, mode, orphan_txs_found: orphanTxs.length, fixed: fixes.length, fixes });
    }

    if (mode === 'recalc_totals') {
      // Step 3: Recalculate totals from transactions
      const allTx = await base44.asServiceRole.entities.KarmaTransaction.list('-created_date', 2000);
      const totals = {};
      
      for (const tx of allTx) {
        const fgId = tx.family_group_id;
        if (!fgId || fgId.startsWith('student_')) continue;
        totals[fgId] = (totals[fgId] || 0) + (tx.points || 0);
      }

      const allFK = await base44.asServiceRole.entities.FamilyKarma.list('-total_karma', 500);
      const fkMap = {};
      for (const fk of allFK) {
        fkMap[fk.family_group_id] = fk;
      }

      const fixes = [];
      for (const [fgId, calcTotal] of Object.entries(totals)) {
        const fk = fkMap[fgId];
        if (!fk) continue;
        
        if (Math.abs((fk.total_karma || 0) - calcTotal) > 0.5) {
          const correct = getKarmaLevel(calcTotal);
          await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
            total_karma: calcTotal,
            karma_level: correct.name,
            boost_multiplier: correct.boost
          });
          fixes.push({
            family_group_id: fgId,
            old_total: fk.total_karma,
            new_total: calcTotal,
            level: correct.name
          });
          if (fixes.length % 5 === 0) await sleep(500);
        }
      }

      return Response.json({ success: true, mode, families_checked: Object.keys(totals).length, totals_fixed: fixes.length, fixes });
    }

    return Response.json({ error: 'Invalid mode. Use fix_levels, fix_orphans, or recalc_totals' }, { status: 400 });

  } catch (error) {
    console.error('recalcFamilyKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});