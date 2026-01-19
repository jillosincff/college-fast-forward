import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function getDaysSince(dateStr) {
  if (!dateStr) return 999;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    // Get settings (create default if none exists)
    let settings = await base44.asServiceRole.entities.ReengagementSettings.filter({});
    
    if (settings.length === 0) {
      // Create default settings for UF
      const defaultSettings = await base44.asServiceRole.entities.ReengagementSettings.create({
        school_id: 'uf',
        school_name: 'University of Florida',
        enabled: false,
        day1_threshold: 7,
        day2_threshold: 21,
        day3_threshold: 45,
        stop_threshold: 60,
        max_emails_per_day: 100
      });
      settings = [defaultSettings];
    }
    
    const schoolSettings = settings[0];
    
    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.filter({});
    
    // Filter to parents/alumni with completed onboarding
    const eligibleParents = allUsers.filter(u => 
      (u.persona === 'parent' || u.persona === 'alumni') &&
      u.onboarding_completed === true
    );
    
    // Calculate eligible counts by day threshold
    const day1Threshold = schoolSettings.day1_threshold || 7;
    const day2Threshold = schoolSettings.day2_threshold || 21;
    const day3Threshold = schoolSettings.day3_threshold || 45;
    const stopThreshold = schoolSettings.stop_threshold || 60;
    
    const eligibleDay1 = eligibleParents.filter(u => {
      const days = getDaysSince(u.last_active_at || u.updated_date);
      const emailCount = u.reengagement_email_count || 0;
      return days >= day1Threshold && days < day2Threshold && emailCount === 0;
    });
    
    const eligibleDay2 = eligibleParents.filter(u => {
      const days = getDaysSince(u.last_active_at || u.updated_date);
      const emailCount = u.reengagement_email_count || 0;
      return days >= day2Threshold && days < day3Threshold && emailCount === 1;
    });
    
    const eligibleDay3 = eligibleParents.filter(u => {
      const days = getDaysSince(u.last_active_at || u.updated_date);
      const emailCount = u.reengagement_email_count || 0;
      return days >= day3Threshold && days < stopThreshold && emailCount === 2;
    });
    
    // Get email stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentEmails = await base44.asServiceRole.entities.ReengagementEmail.filter({});
    const last30DaysEmails = recentEmails.filter(e => 
      e.sent_at && new Date(e.sent_at) >= new Date(thirtyDaysAgo)
    );
    
    const emailsSent = last30DaysEmails.length;
    const emailsOpened = last30DaysEmails.filter(e => e.opened_at).length;
    const emailsClicked = last30DaysEmails.filter(e => e.clicked_at).length;
    const emailsConverted = last30DaysEmails.filter(e => e.converted_at).length;
    
    // Stats by email type
    const statsByType = {};
    ['day7', 'day21', 'day45'].forEach(type => {
      const typeEmails = last30DaysEmails.filter(e => e.email_type === type);
      statsByType[type] = {
        sent: typeEmails.length,
        opened: typeEmails.filter(e => e.opened_at).length,
        clicked: typeEmails.filter(e => e.clicked_at).length,
        converted: typeEmails.filter(e => e.converted_at).length
      };
    });
    
    return Response.json({
      success: true,
      settings: {
        id: schoolSettings.id,
        school_id: schoolSettings.school_id,
        school_name: schoolSettings.school_name,
        enabled: schoolSettings.enabled,
        enabled_at: schoolSettings.enabled_at,
        enabled_by: schoolSettings.enabled_by,
        day1_threshold: schoolSettings.day1_threshold,
        day2_threshold: schoolSettings.day2_threshold,
        day3_threshold: schoolSettings.day3_threshold,
        stop_threshold: schoolSettings.stop_threshold,
        max_emails_per_day: schoolSettings.max_emails_per_day
      },
      eligible_users: {
        day1: eligibleDay1.length,
        day2: eligibleDay2.length,
        day3: eligibleDay3.length,
        total: eligibleDay1.length + eligibleDay2.length + eligibleDay3.length
      },
      stats_30d: {
        emails_sent: emailsSent,
        emails_opened: emailsOpened,
        emails_clicked: emailsClicked,
        emails_converted: emailsConverted,
        open_rate: emailsSent > 0 ? Math.round((emailsOpened / emailsSent) * 100) : null,
        click_rate: emailsOpened > 0 ? Math.round((emailsClicked / emailsOpened) * 100) : null,
        conversion_rate: emailsClicked > 0 ? Math.round((emailsConverted / emailsClicked) * 100) : null
      },
      stats_by_type: statsByType,
      total_parents: eligibleParents.length
    });
    
  } catch (error) {
    console.error('Get reengagement stats error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});