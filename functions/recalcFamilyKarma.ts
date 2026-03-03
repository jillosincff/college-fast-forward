import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Karma tiers — STANDARD
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
    if (totalKarma >= tier.threshold) {
      currentTier = tier;
    } else {
      break;
    }
  }
  return currentTier;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 1. Fix all FamilyKarma records with wrong karma_level / boost_multiplier
    const allFamilyKarma = await base44.asServiceRole.entities.FamilyKarma.list('-total_karma', 1000);
    
    let fixedCount = 0;
    const fixes = [];

    for (const fk of allFamilyKarma) {
      const total = fk.total_karma || 0;
      const correctTier = getKarmaLevel(total);
      
      const levelWrong = fk.karma_level !== correctTier.name;
      const boostWrong = fk.boost_multiplier !== correctTier.boost;
      
      if (levelWrong || boostWrong) {
        await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
          karma_level: correctTier.name,
          boost_multiplier: correctTier.boost
        });
        fixes.push({
          id: fk.id,
          family_group_id: fk.family_group_id,
          total_karma: total,
          old_level: fk.karma_level,
          new_level: correctTier.name,
          old_boost: fk.boost_multiplier,
          new_boost: correctTier.boost
        });
        fixedCount++;
      }
    }

    // 2. Fix orphaned karma — find parents whose transactions use user_<id> but who have a Family record
    const orphanedTransactions = await base44.asServiceRole.entities.KarmaTransaction.list('-created_date', 500);
    let orphansFixed = 0;
    const orphanFixes = [];

    for (const tx of orphanedTransactions) {
      if (!tx.family_group_id?.startsWith('user_')) continue;
      
      const userId = tx.family_group_id.replace('user_', '');
      
      // Look up user
      let txUser = null;
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: userId });
        if (users.length > 0) txUser = users[0];
      } catch (e) { continue; }
      
      if (!txUser) continue;
      
      // Check if user has a family_group_id now
      let realFamilyGroupId = txUser.family_group_id;
      
      // If not on user, check Family entity
      if (!realFamilyGroupId) {
        try {
          const families = await base44.asServiceRole.entities.Family.filter({ primary_parent_id: userId });
          if (families.length > 0) {
            realFamilyGroupId = families[0].family_group_id;
            // Also fix the user record
            await base44.asServiceRole.entities.User.update(userId, {
              family_group_id: realFamilyGroupId
            });
          }
        } catch (e) { continue; }
      }
      
      if (realFamilyGroupId && realFamilyGroupId !== tx.family_group_id) {
        // Update the transaction to point to real family
        await base44.asServiceRole.entities.KarmaTransaction.update(tx.id, {
          family_group_id: realFamilyGroupId
        });
        orphanFixes.push({
          tx_id: tx.id,
          user_email: tx.parent_email,
          old_group: tx.family_group_id,
          new_group: realFamilyGroupId
        });
        orphansFixed++;
      }
    }

    // 3. Recalculate FamilyKarma totals from actual transactions (after orphan fix)
    // Get all unique family_group_ids from transactions
    const allTransactions = await base44.asServiceRole.entities.KarmaTransaction.list('-created_date', 2000);
    const familyTotals = {};
    
    for (const tx of allTransactions) {
      const fgId = tx.family_group_id;
      if (!fgId || fgId.startsWith('student_')) continue; // skip student karma
      if (!familyTotals[fgId]) familyTotals[fgId] = 0;
      familyTotals[fgId] += (tx.points || 0);
    }

    let totalsFixed = 0;
    for (const [fgId, calculatedTotal] of Object.entries(familyTotals)) {
      const existing = await base44.asServiceRole.entities.FamilyKarma.filter({ family_group_id: fgId });
      if (existing.length > 0) {
        const fk = existing[0];
        if (Math.abs((fk.total_karma || 0) - calculatedTotal) > 0.5) {
          const correctTier = getKarmaLevel(calculatedTotal);
          await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
            total_karma: calculatedTotal,
            karma_level: correctTier.name,
            boost_multiplier: correctTier.boost
          });
          totalsFixed++;
        }
      }
    }

    return Response.json({
      success: true,
      levels_fixed: fixedCount,
      level_fixes: fixes,
      orphans_fixed: orphansFixed,
      orphan_fixes: orphanFixes,
      totals_recalculated: totalsFixed,
      total_family_karma_records: allFamilyKarma.length,
      total_transactions: allTransactions.length
    });

  } catch (error) {
    console.error('recalcFamilyKarma error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});