import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { match_id, message, parent_email, parent_name } = await req.json();

    if (!match_id || !message || !parent_email) {
      return Response.json({ 
        error: 'match_id, message, and parent_email are required' 
      }, { status: 400 });
    }

    // Get match details
    const matches = await base44.asServiceRole.entities.Match.filter({ id: match_id });
    const match = matches?.[0];
    
    if (!match) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }

    // Get help request details
    const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ 
      id: match.help_request_id 
    });
    const helpRequest = helpRequests?.[0];

    // Format help types
    const helpTypeLabels = {
      career_advice: 'Career advice',
      internship_leads: 'Internship/job leads',
      resume_review: 'Resume review',
      interview_prep: 'Interview prep',
      industry_insights: 'Industry insights',
      networking_intros: 'Networking intros',
      informational_interview: 'Informational interview'
    };

    const helpTypesText = (helpRequest?.help_types || [])
      .map(t => helpTypeLabels[t] || t)
      .join(', ');

    const studentName = user.full_name || user.email;
    const studentEmail = user.email;
    const studentMajor = helpRequest?.student_major || 'UF Student';
    const timeline = helpRequest?.timeline === 'this_week' 
      ? 'This week (urgent!)' 
      : helpRequest?.timeline === 'this_month' 
        ? 'This month' 
        : 'No rush';

    const subject = `🐊 ${studentName} wants to connect about ${helpTypesText}`;
    
    const emailBody = `Hi ${parent_name || 'there'},

A UF student wants your help!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDENT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: ${studentName}
📧 Email: ${studentEmail}
📚 Major: ${studentMajor}
🎯 Looking for: ${helpTypesText}
⏰ Timeline: ${timeline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THEIR MESSAGE TO YOU:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To respond, simply reply to this email or email ${studentName} directly at:
${studentEmail}

Thanks for being part of the Gator Network!

---
College Fast Forward
Where Gators Help Gators`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: parent_email,
      subject: subject,
      body: emailBody
    });

    return Response.json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message to parent:', error);
    return Response.json({ 
      error: 'Failed to send message',
      details: error.message 
    }, { status: 500 });
  }
});