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

    // Get match count
    const matches = await base44.asServiceRole.entities.Match.filter({
      help_request_id: help_request_id
    });

    const matchCount = matches?.length || 0;

    if (matchCount === 0) {
      return Response.json({ 
        success: true, 
        message: 'No matches to notify about',
        matchCount: 0
      });
    }

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

    const subject = `🎉 ${matchCount} UF parent${matchCount > 1 ? 's' : ''} can help with your ${helpTypesText} request!`;
    
    const body = `Hi ${helpRequest.student_name?.split(' ')[0] || 'there'},

Great news! We've matched you with ${matchCount} experienced UF parent${matchCount > 1 ? 's' : ''} who can help with your request for ${helpTypesText}.

**Your request:**
"${helpRequest.description}"

**What's next?**
1. Log in to your dashboard to see your matches
2. Review each parent's background and expertise
3. Click "Connect" to reach out to the ones you'd like to talk to

🚀 **View Your Matches:**
${Deno.env.get('APP_URL') || 'https://your-app.com'}/#Dashboard

These parents are ready and willing to help. Don't be shy — they signed up specifically to support UF students like you!

Good luck,
The UF Network Team

---
College Fast Forward
Where UF Helps UF`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: helpRequest.student_email,
      subject: subject,
      body: body
    });

    return Response.json({
      success: true,
      matchCount: matchCount,
      emailSent: true
    });

  } catch (error) {
    console.error('Error notifying student:', error);
    return Response.json({ 
      error: 'Failed to notify student',
      details: error.message 
    }, { status: 500 });
  }
});