import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const APP_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

  try {
    // Called by trusted scheduled automation — no user auth required

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get all parents with completed onboarding — batch to avoid rate limits
    const allUsers = await base44.asServiceRole.entities.User.filter({}, '-updated_date', 500);
    const parents = (allUsers || []).filter(u =>
      (u.persona === 'parent' || u.roles?.includes('parent')) &&
      u.onboarding_completed !== false &&
      u.email && !u.email.includes('service+')
    );

    // Get this week's questions
    const recentQuestions = await base44.asServiceRole.entities.JobRequest.filter(
      { status: 'active', poster_type: 'student' },
      '-created_date',
      100
    );
    const thisWeekQuestions = (recentQuestions || []).filter(q =>
      q.created_date && new Date(q.created_date).toISOString() >= oneWeekAgo &&
      !q.is_alumni_career_request
    );

    // Get all answers for karma counting  
    const recentAnswers = await base44.asServiceRole.entities.Answer.filter({}, '-created_date', 500);

    // Pre-fetch email prefs and existing digests in bulk to reduce per-parent queries
    const allPrefs = await base44.asServiceRole.entities.EmailPreference.filter({}, undefined, 500);
    const prefsMap = new Map((allPrefs || []).map(p => [p.user_email, p]));

    const allDigests = await base44.asServiceRole.entities.ReengagementEmail.filter({ email_type: 'weekly_parent_digest' }, '-sent_at', 500);

    let sent = 0;
    let skipped = 0;

    // Limit to 50 parents per run to avoid timeouts
    const batchParents = parents.slice(0, 50);

    for (const parent of batchParents) {
      // Check email preferences from pre-fetched map
      const prefs = prefsMap.get(parent.email);
      if (prefs?.all_emails === false || prefs?.weekly_digest === false) {
        skipped++;
        continue;
      }

      // Check if already sent this week from pre-fetched data
      const alreadySentThisWeek = (allDigests || []).some(e => 
        e.user_email === parent.email && e.sent_at && e.sent_at >= oneWeekAgo
      );
      if (alreadySentThisWeek) {
        skipped++;
        continue;
      }

      // Find questions matching parent's industry
      const parentIndustry = parent.industries?.[0] || parent.industry;
      // Small delay between sends to avoid rate limits
      if (sent > 0 && sent % 10 === 0) {
        await new Promise(r => setTimeout(r, 1000));
      }

      const matchedQuestions = parentIndustry
        ? thisWeekQuestions.filter(q => q.target_industry?.toLowerCase().includes(parentIndustry.toLowerCase()))
        : thisWeekQuestions;

      // Count parent's karma (answers)
      const parentAnswers = (recentAnswers || []).filter(a => a.answerer_email === parent.email);
      const karmaScore = parentAnswers.length * 15;
      const studentsHelped = new Set(parentAnswers.map(a => a.question_id)).size;

      // Find a featured unanswered question
      const unanswered = (matchedQuestions.length > 0 ? matchedQuestions : thisWeekQuestions)
        .filter(q => (q.answer_count || 0) === 0);
      const featured = unanswered[0];

      const firstName = (() => {
        const fn = parent.full_name?.trim() || '';
        if (fn.includes(',')) return fn.split(',')[1]?.trim().split(/\s+/)[0] || 'there';
        return fn.split(/\s+/)[0] || 'there';
      })();

      const subject = `This week at UF — ${thisWeekQuestions.length} students who need your help`;

      const featuredHtml = featured ? `
        <div style="background: #FFF7ED; border: 2px solid #FA4616; padding: 20px; border-radius: 12px; margin: 24px 0;">
          <p style="color: #FA4616; font-weight: 700; margin: 0 0 8px 0;">🌟 Question of the Week</p>
          <p style="color: #1E293B; font-size: 15px; margin: 0 0 12px 0;">"${(featured.title || featured.description || '').substring(0, 150)}"</p>
          <p style="color: #64748B; font-size: 13px; margin: 0 0 12px 0;">— ${featured.poster_name || 'A UF Student'} · ${featured.student_major || ''} ${featured.student_year ? `'${featured.student_year}` : ''}</p>
          <a href="${APP_URL}/#QuestionDetail?id=${featured.id}" style="display: inline-block; background: #FA4616; color: white; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 600;">Answer This Question (+15 karma) →</a>
        </div>
      ` : '';

      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0021A5 0%, #001580 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Your Weekly CFF Digest 📬</h1>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">
              Hi ${firstName}, here's what happened this week in the CFF network:
            </p>
            
            <div style="display: flex; gap: 12px; margin: 24px 0;">
              <div style="flex: 1; background: #F0F9FF; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #0021A5;">${thisWeekQuestions.length}</div>
                <div style="color: #64748B; font-size: 13px;">New Questions</div>
              </div>
              <div style="flex: 1; background: #FFF7ED; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #FA4616;">${karmaScore}</div>
                <div style="color: #64748B; font-size: 13px;">Your Karma</div>
              </div>
              <div style="flex: 1; background: #F0FDF4; border-radius: 12px; padding: 16px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #16A34A;">${studentsHelped}</div>
                <div style="color: #64748B; font-size: 13px;">Students Helped</div>
              </div>
            </div>

            ${matchedQuestions.length > 0 ? `
              <p style="color: #334155; font-size: 15px;">
                <strong>${matchedQuestions.length} new questions</strong> match your ${parentIndustry || ''} background this week.
              </p>
            ` : ''}

            ${featuredHtml}

            <div style="text-align: center; margin: 24px 0;">
              <a href="${APP_URL}/#ParentDashboard" style="display: inline-block; background: #0021A5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700;">Go to Dashboard →</a>
            </div>
          </div>
          <div style="background: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94A3B8; font-size: 12px; margin: 0;">College Fast Forward — The Private Career Network for UF Families</p>
          </div>
        </div>
      `;

      const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: parent.email }] }],
          from: { email: 'notifications@collegefastforward.com', name: 'College Fast Forward' },
          subject,
          content: [{ type: 'text/html', value: htmlBody }]
        })
      });

      await base44.asServiceRole.entities.ReengagementEmail.create({
        user_id: parent.id,
        user_email: parent.email,
        email_type: 'weekly_parent_digest',
        status: sgResponse.ok ? 'sent' : 'failed',
        sent_at: new Date().toISOString()
      });

      await base44.asServiceRole.entities.EmailLog.create({
        user_email: parent.email,
        email_type: 'weekly_parent_digest',
        subject,
        status: sgResponse.ok ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
        persona: 'parent'
      });

      if (sgResponse.ok) sent++;
    }

    return Response.json({ success: true, totalParents: parents.length, sent, skipped });
  } catch (error) {
    console.error('weeklyParentDigest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});