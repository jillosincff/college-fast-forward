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

    // PARENTS
    const parentEligible = allUsers.filter(u => {
      if (u.persona !== 'parent') return false;
      if (isUpgraded(u)) return false;
      if (isUnsubscribed(u)) return false;
      if (wasRecentlyEmailedAboutFastIQ(u)) return false;
      const hasLinkedStudent = u.linked_students && Array.isArray(u.linked_students) && u.linked_students.length > 0;
      if (!hasLinkedStudent) return false;
      return u.email ? true : false;
    });

    const snapshot = {
      timestamp: new Date().toISOString(),
      note: "SNAPSHOT LOCKED — Use this list for April 30 8am blast. Do NOT re-query at runtime.",
      total_eligible: studentEligible.length + parentEligible.length,
      students: studentEligible.map(u => ({
        email: u.email,
        name: u.full_name,
        school: u.school || u.school_name,
      })),
      parents: parentEligible.map(u => ({
        email: u.email,
        name: u.full_name,
        school: u.school || u.school_name,
        linked_students: u.linked_students?.length || 0,
      })),
    };

    return Response.json(snapshot);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});