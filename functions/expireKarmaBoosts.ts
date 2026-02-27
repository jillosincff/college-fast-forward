import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Scheduled task to expire karma boosts after 48 hours
 * Run this every hour to clean up expired boosts
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Admin check for manual triggers
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin' && !user.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const now = new Date();
    console.log('Running karma boost expiry check at:', now.toISOString());
    
    // Find students with expired boosts
    const boostedStudents = await base44.asServiceRole.entities.User.filter({
      boost_level: { $gt: 0 }
    });
    
    let expiredCount = 0;
    
    for (const student of boostedStudents) {
      if (student.boost_expires_at) {
        const expiresAt = new Date(student.boost_expires_at);
        if (expiresAt < now) {
          // Boost expired - reset
          await base44.asServiceRole.entities.User.update(student.id, {
            boost_level: 0,
            boost_expires_at: null,
            boosted_by_parent_email: null
          });
          console.log(`Expired boost for student: ${student.email}`);
          expiredCount++;
        }
      }
    }
    
    // Also expire boosts on questions
    const boostedQuestions = await base44.asServiceRole.entities.JobRequest.filter({
      karma_boost: { $gt: 0 }
    });
    
    let questionsExpired = 0;
    
    for (const q of boostedQuestions) {
      if (q.boosted_until) {
        const expiresAt = new Date(q.boosted_until);
        if (expiresAt < now) {
          await base44.asServiceRole.entities.JobRequest.update(q.id, {
            karma_boost: 0,
            boosted_until: null,
            priority_score: q.is_boosted ? 999 : 0
          });
          questionsExpired++;
        }
      }
    }
    
    // Also expire boosts on HelpRequests
    let helpRequestsExpired = 0;
    try {
      const boostedHelpRequests = await base44.asServiceRole.entities.HelpRequest.filter({
        karma_boost: { $gt: 0 }
      });
      for (const hr of boostedHelpRequests) {
        if (hr.boosted_until) {
          const expiresAt = new Date(hr.boosted_until);
          if (expiresAt < now) {
            await base44.asServiceRole.entities.HelpRequest.update(hr.id, {
              karma_boost: 0,
              boosted_until: null
            });
            helpRequestsExpired++;
          }
        }
      }
    } catch (e) {
      console.log('HelpRequest expiry check failed (non-critical):', e.message);
    }

    console.log(`Expired ${expiredCount} student boosts, ${questionsExpired} question boosts, ${helpRequestsExpired} help request boosts`);
    
    return Response.json({
      success: true,
      expired_students: expiredCount,
      expired_questions: questionsExpired,
      expired_help_requests: helpRequestsExpired,
      checked_at: now.toISOString()
    });
    
  } catch (error) {
    console.error('expireKarmaBoosts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});