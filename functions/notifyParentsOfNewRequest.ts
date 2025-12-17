import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { help_request_id } = await req.json();

    if (!help_request_id) {
      return Response.json({ error: 'help_request_id is required' }, { status: 400 });
    }

    // Get the help request
    const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ id: help_request_id });
    const helpRequest = helpRequests?.[0];
    
    if (!helpRequest) {
      return Response.json({ error: 'Help request not found' }, { status: 404 });
    }

    // Get all matches for this request
    const matches = await base44.asServiceRole.entities.Match.filter({
      help_request_id: help_request_id
    }, '-match_score', 20);

    if (!matches || matches.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No matches to notify',
        notificationsSent: 0
      });
    }

    // Get parent emails from matches
    const parentEmails = [...new Set(matches.map(m => m.parent_email || null).filter(Boolean))];

    // Get help types labels
    const helpTypeLabels = {
      career_advice: 'career advice',
      internship_leads: 'internship/job leads',
      resume_review: 'resume review',
      interview_prep: 'interview prep',
      industry_insights: 'industry insights',
      networking_intros: 'networking intros',
      informational_interview: 'informational interview'
    };

    const helpTypesText = helpRequest.help_types
      .map(t => helpTypeLabels[t] || t)
      .join(', ');

    // Send email to each matched parent
    const emailPromises = parentEmails.map(async (parentEmail) => {
      const parentMatch = matches.find(m => m.parent_email === parentEmail);
      
      const subject = `🐊 A UF ${helpRequest.student_major || 'student'} needs ${helpTypesText} - you're a great match!`;
      
      const body = `Hi ${parentMatch?.parent_name?.split(' ')[0] || 'there'},

Great news! A UF student just posted a request that matches your expertise:

**Student:** ${helpRequest.student_name}
**Major:** ${helpRequest.student_major}
**Year:** ${helpRequest.student_year}
**Industry:** ${helpRequest.industry}
**Help Needed:** ${helpTypesText}
**Timeline:** ${helpRequest.timeline === 'this_week' ? 'This week (urgent!)' : helpRequest.timeline === 'this_month' ? 'This month' : 'No rush'}

**Their request:**
"${helpRequest.description}"

**Why you're a match (Score: ${parentMatch?.match_score || 0}%):**
${parentMatch?.match_reasons?.map(r => `• ${r}`).join('\n') || '• Your expertise aligns with their needs'}

🚀 **Want to help?**
Log in to your dashboard to see the full request and reach out to ${helpRequest.student_name?.split(' ')[0] || 'them'}:
${Deno.env.get('APP_URL') || 'https://your-app.com'}/#ParentDashboard

Thanks for being part of the Gator Network!

---
College Fast Forward
Connecting Gators for Career Success`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: parentEmail,
          subject: subject,
          body: body
        });
        return { email: parentEmail, success: true };
      } catch (error) {
        console.error(`Failed to send email to ${parentEmail}:`, error);
        return { email: parentEmail, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    return Response.json({
      success: true,
      notificationsSent: successCount,
      totalMatches: matches.length,
      results: results
    });

  } catch (error) {
    console.error('Error notifying parents:', error);
    return Response.json({ 
      error: 'Failed to notify parents',
      details: error.message 
    }, { status: 500 });
  }
});