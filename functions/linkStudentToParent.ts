import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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

function getNextTier(totalKarma) {
  for (const tier of KARMA_TIERS) {
    if (totalKarma < tier.threshold) {
      return { name: tier.name, threshold: tier.threshold, points_remaining: tier.threshold - totalKarma };
    }
  }
  return { name: 'max', threshold: 500, points_remaining: 0 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { studentEmail, action } = body;

    // ACTION: auto_link - called during student signup to check for pending links
    if (action === 'auto_link') {
      const { studentUserId, studentEmailAddress } = body;
      if (!studentEmailAddress) {
        return Response.json({ error: 'Missing studentEmailAddress' }, { status: 400 });
      }

      // Check for pending Family records where this student email is listed but not yet linked
      const families = await base44.asServiceRole.entities.Family.filter({
        student_email: studentEmailAddress.toLowerCase()
      });

      const pendingFamily = families.find(f => !f.linked || !f.student_user_id);

      if (!pendingFamily) {
        return Response.json({ success: true, linked: false, message: 'No pending family link found' });
      }

      // Complete the link
      const familyGroupId = pendingFamily.family_group_id || `family_${pendingFamily.primary_parent_id}_${Date.now()}`;
      
      // Update Family record
      const studentIds = pendingFamily.student_ids || [];
      if (studentUserId && !studentIds.includes(studentUserId)) {
        studentIds.push(studentUserId);
      }

      await base44.asServiceRole.entities.Family.update(pendingFamily.id, {
        student_ids: studentIds,
        linked: true,
        linked_at: new Date().toISOString()
      });

      // Update student User record
      if (studentUserId) {
        await base44.asServiceRole.entities.User.update(studentUserId, {
          family_group_id: familyGroupId,
          parent_id: pendingFamily.primary_parent_id
        });
      }

      // Apply existing karma boost
      const existingKarma = await base44.asServiceRole.entities.FamilyKarma.filter({
        family_group_id: familyGroupId
      });

      let boostResult = { boost: 0, totalKarma: 0 };
      if (existingKarma.length > 0) {
        const fk = existingKarma[0];
        const { boost } = getKarmaLevel(fk.total_karma || 0);
        boostResult = { boost, totalKarma: fk.total_karma || 0 };

        // Boost student's active questions
        if (boost > 0 && studentEmailAddress) {
          const boostExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
          const studentQuestions = await base44.asServiceRole.entities.JobRequest.filter({
            created_by: studentEmailAddress,
            status: 'active'
          });
          for (const q of studentQuestions) {
            await base44.asServiceRole.entities.JobRequest.update(q.id, {
              karma_boost: boost,
              boosted_until: boostExpiry.toISOString(),
              priority_score: (q.is_boosted ? 999 : 0) + (boost * 100)
            });
          }
        }
      }

      // Notify parent
      try {
        const parentUsers = await base44.asServiceRole.entities.User.filter({ id: pendingFamily.primary_parent_id });
        if (parentUsers.length > 0) {
          const parent = parentUsers[0];
          const studentName = user.full_name || studentEmailAddress.split('@')[0];
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: parent.email,
            subject: `🎉 ${studentName} just joined CFF! Your Karma is now boosting them.`,
            body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0021A5;">Great news!</h2>
              <p>${studentName} just signed up on College Fast Forward and your accounts are now linked.</p>
              ${boostResult.totalKarma > 0 ? `<p style="background: #f0f7ff; padding: 16px; border-radius: 8px;">
                <strong>🔥 Your ${boostResult.totalKarma} Family Karma points are now active!</strong><br>
                ${studentName}'s questions will get a <strong>${boostResult.boost}x boost</strong> in the feed.
              </p>` : ''}
              <p>Keep helping students to boost ${studentName} even higher!</p>
            </div>`
          });
        }
      } catch (emailErr) {
        console.log('Parent notification email failed (non-critical):', emailErr.message);
      }

      return Response.json({
        success: true,
        linked: true,
        family_group_id: familyGroupId,
        boost_applied: boostResult.boost,
        total_karma: boostResult.totalKarma,
        message: `Student linked to family. ${boostResult.boost}x boost applied.`
      });
    }

    // ACTION: link (default) - parent links their student
    if (!studentEmail || !studentEmail.includes('@')) {
      return Response.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const normalizedEmail = studentEmail.trim().toLowerCase();

    // Only parents can link
    if (user.persona !== 'parent' && !user.roles?.includes('parent') && user.role !== 'admin') {
      return Response.json({ error: 'Only parents can link students' }, { status: 403 });
    }

    // Check for existing link to prevent duplicates
    const existingFamilies = await base44.asServiceRole.entities.Family.filter({
      primary_parent_id: user.id
    });
    const alreadyLinked = existingFamilies.find(f => 
      f.student_email === normalizedEmail || 
      (f.student_ids || []).some(id => id === normalizedEmail)
    );
    if (alreadyLinked) {
      return Response.json({ success: true, already_linked: true, family_group_id: alreadyLinked.family_group_id || user.family_group_id });
    }

    // Create or get family_group_id
    const familyGroupId = user.family_group_id || `family_${user.id}_${Date.now()}`;

    // Check if student already exists on platform
    let studentUser = null;
    try {
      const allUsers = await base44.asServiceRole.entities.User.list();
      studentUser = allUsers.find(u => u.email?.toLowerCase() === normalizedEmail);
    } catch (e) {
      console.log('User lookup failed:', e.message);
    }

    const isLinkedNow = !!studentUser;

    // Create Family record
    const familyRecord = await base44.asServiceRole.entities.Family.create({
      family_name: `${user.full_name || 'Parent'}'s Family`,
      member_number: existingFamilies.length + 1,
      price_tier: 'founding',
      locked_price_monthly: 0,
      subscription_status: 'active',
      primary_parent_id: user.id,
      parent_ids: [user.id],
      student_ids: studentUser ? [studentUser.id] : [],
      student_email: normalizedEmail,
      linked: isLinkedNow,
      linked_at: isLinkedNow ? new Date().toISOString() : null,
      family_group_id: familyGroupId
    });

    // Update parent User record
    const parentStudentEmails = user.student_emails || [];
    if (!parentStudentEmails.includes(normalizedEmail)) {
      parentStudentEmails.push(normalizedEmail);
    }

    await base44.asServiceRole.entities.User.update(user.id, {
      family_group_id: familyGroupId,
      student_email: normalizedEmail,
      student_emails: parentStudentEmails,
      student_ids: studentUser ? [...new Set([...(user.student_ids || []), studentUser.id])] : user.student_ids || []
    });

    // If student exists, link them too and notify them
    if (studentUser) {
      await base44.asServiceRole.entities.User.update(studentUser.id, {
        family_group_id: familyGroupId,
        parent_id: user.id,
        linked_parent_emails: [...new Set([...(studentUser.linked_parent_emails || []), user.email])],
        linked_parent_ids: [...new Set([...(studentUser.linked_parent_ids || []), user.id])]
      });

      // Send email to student
      const parentName = user.full_name?.split(',').reverse().map(s => s.trim()).join(' ') || user.email.split('@')[0];
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: normalizedEmail,
          subject: '🎉 Your parent just connected their CFF account!',
          body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0021A5;">Great news, Gator!</h2>
            <p><strong>${parentName}</strong> just connected their College Fast Forward account to yours.</p>
            <p style="background: linear-gradient(135deg, #f0f7ff 0%, #eff6ff 100%); padding: 16px; border-radius: 12px; border-left: 4px solid #0021A5;">
              <strong>⚡ Their Family Karma is now boosting your questions in the feed!</strong><br>
              Every time ${parentName} helps a student on CFF, YOUR questions move higher — making it more likely you'll get help faster.
            </p>
            ${familyKarma.total_karma > 0 ? `<p>They've already earned <strong>${familyKarma.total_karma} Karma</strong> — that's a <strong>${familyKarma.boost_multiplier}x boost</strong> on your questions right now!</p>` : ''}
            <p style="margin-top: 24px;">
              <a href="${Deno.env.get('APP_BASE_URL') || 'https://app.collegefastforward.com'}/#PostRequest" 
                 style="display: inline-block; background: #0021A5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Post a Question to Get Boosted →
              </a>
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">The more questions you post, the more ${parentName}'s karma can help you!</p>
          </div>`
        });
      } catch (emailErr) {
        console.log('Student link notification email failed (non-critical):', emailErr.message);
      }

      // Create in-app notification for student
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_id: studentUser.id,
          user_email: normalizedEmail,
          type: 'family_linked',
          title: `${parentName} connected their CFF account!`,
          message: `Their Family Karma (${familyKarma.total_karma || 0} pts, ${familyKarma.boost_multiplier || 0}x boost) is now boosting your questions in the feed.`,
          is_read: false,
          action_url: '#PostRequest',
          action_label: 'Post a Question'
        });
      } catch (notifErr) {
        console.log('Student notification creation failed (non-critical):', notifErr.message);
      }
    }

    // Ensure FamilyKarma record exists
    const existingFamilyKarma = await base44.asServiceRole.entities.FamilyKarma.filter({
      family_group_id: familyGroupId
    });

    let familyKarma;
    const parentKarma = user.karma_points || 0;

    if (existingFamilyKarma.length === 0) {
      const { level, boost } = getKarmaLevel(parentKarma);
      familyKarma = await base44.asServiceRole.entities.FamilyKarma.create({
        family_group_id: familyGroupId,
        total_karma: parentKarma,
        karma_level: level,
        boost_multiplier: boost,
        last_karma_earned_at: new Date().toISOString()
      });
    } else {
      familyKarma = existingFamilyKarma[0];
    }

    // If student exists AND has active questions, apply boost immediately
    let boostApplied = 0;
    let questionsBosted = 0;
    if (studentUser && familyKarma.boost_multiplier > 0) {
      const boostExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const studentQuestions = await base44.asServiceRole.entities.JobRequest.filter({
        created_by: normalizedEmail,
        status: 'active'
      });

      for (const q of studentQuestions) {
        await base44.asServiceRole.entities.JobRequest.update(q.id, {
          karma_boost: familyKarma.boost_multiplier,
          boosted_until: boostExpiry.toISOString(),
          priority_score: (q.is_boosted ? 999 : 0) + (familyKarma.boost_multiplier * 100)
        });
        questionsBosted++;
      }
      boostApplied = familyKarma.boost_multiplier;
    }

    // Estimate boost impact
    let boostImpact = null;
    if (boostApplied > 0 && questionsBosted > 0) {
      try {
        const allActiveQuestions = await base44.asServiceRole.entities.JobRequest.filter({ status: 'active' });
        const estimatedJump = Math.max(1, Math.round(allActiveQuestions.length * 0.2 * boostApplied));
        boostImpact = {
          positions_gained: estimatedJump,
          total_questions: allActiveQuestions.length,
          student_name: studentUser?.full_name?.split(' ')[0] || normalizedEmail.split('@')[0]
        };
      } catch (e) {
        console.log('Boost impact estimation failed:', e.message);
      }
    }

    const nextTier = getNextTier(familyKarma.total_karma || parentKarma);

    return Response.json({
      success: true,
      linked: isLinkedNow,
      pending: !isLinkedNow,
      family_group_id: familyGroupId,
      family_id: familyRecord.id,
      student_name: studentUser?.full_name || null,
      student_email: normalizedEmail,
      total_karma: familyKarma.total_karma || parentKarma,
      karma_level: familyKarma.karma_level,
      boost_multiplier: familyKarma.boost_multiplier || 0,
      boost_applied: boostApplied,
      questions_boosted: questionsBosted,
      boost_impact: boostImpact,
      next_tier: nextTier
    });

  } catch (error) {
    console.error('linkStudentToParent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});