import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Current tier system
const KARMA_TIERS = [
  { name: 'none', threshold: 0, boost: 0 },
  { name: 'active', threshold: 1, boost: 0.5 },
  { name: 'engaged', threshold: 50, boost: 1 },
  { name: 'priority', threshold: 150, boost: 2 },
  { name: 'champion', threshold: 500, boost: 3 }
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
  return { level: currentTier.name, boost: currentTier.boost };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // ============================================================
    // ACTION 1: Fix legacy tier names on FamilyKarma records
    // ============================================================
    if (action === 'fix_tiers') {
      const allFamilyKarma = await base44.asServiceRole.entities.FamilyKarma.list();
      const results = [];

      for (const fk of allFamilyKarma) {
        const { level, boost } = getKarmaLevel(fk.total_karma || 0);
        const oldLevel = fk.karma_level;
        
        if (oldLevel !== level || fk.boost_multiplier !== boost) {
          await base44.asServiceRole.entities.FamilyKarma.update(fk.id, {
            karma_level: level,
            boost_multiplier: boost
          });
          results.push({
            id: fk.id,
            family_group_id: fk.family_group_id,
            total_karma: fk.total_karma,
            old_level: oldLevel,
            new_level: level,
            old_boost: fk.boost_multiplier,
            new_boost: boost
          });
        }
      }

      return Response.json({ success: true, action: 'fix_tiers', updated: results.length, results });
    }

    // ============================================================
    // ACTION 2: Merge Jill's accounts into canonical
    // ============================================================
    if (action === 'merge_jill') {
      const {
        canonicalUserId,
        canonicalEmail,
        secondaryUserIds,
        secondaryEmails,
        targetFamilyGroupId,
        studentUserId,
        studentEmail
      } = body;

      const log = [];

      // Step 1: Reassign KarmaTransactions from secondary accounts to canonical
      for (const secEmail of secondaryEmails) {
        const transactions = await base44.asServiceRole.entities.KarmaTransaction.filter({
          parent_email: secEmail
        });
        
        for (const t of transactions) {
          await base44.asServiceRole.entities.KarmaTransaction.update(t.id, {
            parent_user_id: canonicalUserId,
            parent_email: canonicalEmail,
            family_group_id: targetFamilyGroupId
          });
          log.push(`Reassigned transaction ${t.id} from ${secEmail} to ${canonicalEmail}`);
        }
      }

      // Step 2: Calculate total karma from all transactions
      const allTransactions = await base44.asServiceRole.entities.KarmaTransaction.filter({
        parent_email: canonicalEmail
      });
      const totalKarma = allTransactions.reduce((sum, t) => sum + (t.points || 0), 0);
      const { level, boost } = getKarmaLevel(totalKarma);

      log.push(`Total karma calculated: ${totalKarma} (${level}, ${boost}x boost)`);

      // Step 3: Delete secondary FamilyKarma records and update/create canonical one
      const allFamilyKarma = await base44.asServiceRole.entities.FamilyKarma.list();
      
      // Find the canonical FamilyKarma (if exists) or any record to keep
      let canonicalFK = allFamilyKarma.find(fk => fk.family_group_id === targetFamilyGroupId);
      const secondaryFKs = allFamilyKarma.filter(fk => {
        if (fk.family_group_id === targetFamilyGroupId) return false;
        // Check if this belongs to any of the secondary accounts
        return secondaryEmails.some(email => {
          return secondaryUserIds.some(uid => fk.family_group_id.includes(uid));
        });
      });

      // Delete secondary FamilyKarma records
      for (const sfk of secondaryFKs) {
        await base44.asServiceRole.entities.FamilyKarma.delete(sfk.id);
        log.push(`Deleted secondary FamilyKarma ${sfk.id} (${sfk.family_group_id})`);
      }

      // Update or create canonical FamilyKarma
      if (canonicalFK) {
        await base44.asServiceRole.entities.FamilyKarma.update(canonicalFK.id, {
          total_karma: totalKarma,
          karma_level: level,
          boost_multiplier: boost,
          last_karma_earned_at: new Date().toISOString()
        });
        log.push(`Updated canonical FamilyKarma ${canonicalFK.id}: ${totalKarma} karma, ${level}`);
      } else {
        canonicalFK = await base44.asServiceRole.entities.FamilyKarma.create({
          family_group_id: targetFamilyGroupId,
          total_karma: totalKarma,
          karma_level: level,
          boost_multiplier: boost,
          last_karma_earned_at: new Date().toISOString()
        });
        log.push(`Created canonical FamilyKarma: ${totalKarma} karma, ${level}`);
      }

      // Step 4: Update canonical user with family_group_id and karma
      await base44.asServiceRole.entities.User.update(canonicalUserId, {
        family_group_id: targetFamilyGroupId,
        karma_points: totalKarma,
        karma_earned: totalKarma,
        karma_level: level,
        family_karma: totalKarma,
        karma_tier: level,
        student_emails: [studentEmail],
        student_email: studentEmail
      });
      log.push(`Updated canonical user ${canonicalEmail} with family_group_id and karma`);

      // Step 5: Link student to family
      if (studentUserId) {
        await base44.asServiceRole.entities.User.update(studentUserId, {
          family_group_id: targetFamilyGroupId,
          parent_id: canonicalUserId,
          linked_parent_emails: [canonicalEmail],
          linked_parent_ids: [canonicalUserId],
          boost_level: boost,
          family_karma: totalKarma,
          karma_tier: level
        });
        log.push(`Linked student ${studentEmail} to family ${targetFamilyGroupId}`);
      }

      return Response.json({
        success: true,
        action: 'merge_jill',
        total_karma: totalKarma,
        karma_level: level,
        boost: boost,
        log
      });
    }

    // ============================================================
    // ACTION 3: Create Family record for parent-student link
    // ============================================================
    if (action === 'create_family') {
      const { parentUserId, parentEmail, studentUserId, studentEmail, familyGroupId } = body;

      // Create the Family entity record
      const family = await base44.asServiceRole.entities.Family.create({
        member_number: 0,
        price_tier: 'founding',
        locked_price_monthly: 0,
        primary_parent_id: parentUserId,
        parent_ids: [parentUserId],
        student_ids: [studentUserId],
        subscription_status: 'none'
      });

      const log = [`Created Family record ${family.id}`];

      return Response.json({ success: true, action: 'create_family', family_id: family.id, log });
    }

    return Response.json({ error: 'Unknown action. Use: fix_tiers, merge_jill, create_family' }, { status: 400 });

  } catch (error) {
    console.error('migrateKarmaData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});