import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const INTENT_EVENTS = ['fastiq_feature_used', 'trial_ended', 'upgrade_clicked'];
const SIXTY_DAYS_AGO = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const allEvents = await base44.asServiceRole.entities.AnalyticsEvent.list('-created_date', 10000);
    const allPrefs = await base44.asServiceRole.entities.EmailPreference.list('-created_date', 5000);
    const allEmailLogs = await base44.asServiceRole.entities.EmailLog.list('-sent_at', 10000);

    const recentEvents = allEvents.filter(e => new Date(e.created_date) >= new Date(SIXTY_DAYS_AGO));
    const recentEmailLogs = allEmailLogs.filter(e => 
      e.sent_at && new Date(e.sent_at) >= new Date(THIRTY_DAYS_AGO)
    );

    function isUpgraded(u) {
      return u.subscription_status === 'active' || u.membership_tier === 'fastiq' || u.fastiq_trial_active === true;
    }

    function isUnsubscribed(u) {
      const pref = allPrefs.find(p => p.user_email?.toLowerCase() === u.email?.toLowerCase());
      return pref && pref.all_emails === false;
    }

    function hasIntentSignal(u) {
      return recentEvents.some(e => 
        e.user_email?.toLowerCase() === u.email?.toLowerCase() && 
        INTENT_EVENTS.includes(e.event_name)
      );
    }

    function wasRecentlyEmailedAboutFastIQ(u) {
      return recentEmailLogs.some(log => 
        log.user_email?.toLowerCase() === u.email?.toLowerCase() &&
        (log.email_type?.includes('fastiq') || log.email_type?.includes('paywall') || 
         log.subject?.toLowerCase().includes('fastiq') || log.subject?.toLowerCase().includes('correction'))
      );
    }

    // STUDENTS
    const studentEligible = allUsers.filter(u =>
      u.persona === 'student' &&
      !isUpgraded(u) &&
      !isUnsubscribed(u) &&
      !wasRecentlyEmailedAboutFastIQ(u) &&
      hasIntentSignal(u) &&
      u.email &&
      u.email.toLowerCase() !== 'jill@uffastforward.com'
    );

    // PARENTS (full list, all fields)
    const parentEligible = allUsers.filter(u => {
      if (u.persona !== 'parent') return false;
      if (isUpgraded(u)) return false;
      if (isUnsubscribed(u)) return false;
      if (wasRecentlyEmailedAboutFastIQ(u)) return false;
      const hasLinkedStudent = u.linked_students && Array.isArray(u.linked_students) && u.linked_students.length > 0;
      if (!hasLinkedStudent) return false;
      return u.email ? true : false;
    });

    // CHECK: Josh Flusser legitimacy
    const joshUser = allUsers.find(u => u.email?.toLowerCase() === 'joshflusser@gmail.com');
    const joshLegitCheck = {
      email: joshUser?.email,
      persona: joshUser?.persona,
      school: joshUser?.school || joshUser?.school_name,
      onboarding_completed: joshUser?.onboarding_completed,
      created_date: joshUser?.created_date,
      intent_signals: recentEvents.filter(e => e.user_email?.toLowerCase() === 'joshflusser@gmail.com').map(e => e.event_name),
      flag: joshUser?.school?.toUpperCase() !== 'UNIVERSITY OF FLORIDA' ? 'NON-UF: VERIFY INCLUSION' : 'LEGIT',
    };

    // CHECK: samigreen219 email rendering
    const samiUser = allUsers.find(u => u.email?.toLowerCase() === 'samigreen219@gmail.com');
    const firstName = samiUser?.full_name?.split(' ')?.[0] || 'there';
    const renderedGreeting = `Hi ${firstName},`;
    const samiEmailCheck = {
      email: samiUser?.email,
      full_name: samiUser?.full_name,
      extracted_first_name: firstName,
      rendered_greeting: renderedGreeting,
      uses_fallback: firstName === 'there' ? 'YES (no name found)' : 'NO (has name)',
      flag: firstName === 'samigreen219' ? 'NAME IS BROKEN DIGIT STRING - SHOULD USE FALLBACK' : 'OK',
    };

    return Response.json({
      total_students: studentEligible.length,
      total_parents: parentEligible.length,
      total_audience: studentEligible.length + parentEligible.length,
      parents_full_list: parentEligible.map(p => ({
        name: p.full_name || 'N/A',
        email: p.email,
        school: p.school || p.school_name || 'Unknown',
        linked_students: p.linked_students?.length || 0,
      })),
      josh_flusser_check: joshLegitCheck,
      samigreen219_email_check: samiEmailCheck,
    });
  } catch (error) {
    console.error('[preBlastDiagnostics] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});