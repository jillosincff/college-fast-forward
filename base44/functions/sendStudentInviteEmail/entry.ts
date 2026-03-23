import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    console.log('=== SEND STUDENT INVITE EMAIL STARTED ===');
    console.log('Request method:', req.method);
    console.log('Timestamp:', new Date().toISOString());
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204 });
    }
    
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        console.log('User authenticated:', user?.email);
        
        if (!user) {
            console.error('❌ No user authenticated');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const body = await req.json();
        const { student_email, student_name, parent_name } = body;
        
        console.log('📧 Sending invite to:', student_email);
        console.log('Student name:', student_name);
        console.log('Parent name:', parent_name);

        if (!student_email || !student_name || !parent_name) {
            console.error('❌ Missing required parameters');
            return Response.json({ error: 'Missing required parameters: student_email, student_name, parent_name' }, {
                status: 400,
            });
        }

    const subject = `${student_name}, ${parent_name} just set something up for you`;
    
    // Build invite link with parent context for Flow A
    const parentFirstName = parent_name.split(' ')[0] || parent_name;
    const studentSchool = body.student_university || '';

    const inviteParams = new URLSearchParams({
      email: student_email,
      parent: parentFirstName,
      ...(studentSchool ? { school: studentSchool } : {}),
    });
    const inviteLink = `https://www.collegefastforward.com/#StudentInvitedOnboarding?${inviteParams.toString()}`;

    const emailBody = `
      <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #ffffff; background-color: #0A0A0A; padding: 40px 20px;">
        <div style="max-width: 520px; margin: 0 auto; text-align: center;">
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: #E85D20; margin-bottom: 24px;">
            ${parentFirstName} invited you to College Fast Forward
          </p>
          <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 12px;">
            ${parentFirstName} just set something up for you.
          </h1>
          <p style="font-size: 18px; font-style: italic; color: #E85D20; margin-bottom: 24px;">
            Your job search just got a serious upgrade.
          </p>
          <p style="font-size: 15px; color: #ffffff; line-height: 1.7; margin-bottom: 36px;">
            FastIQ is ready to build your career plan — target companies, alumni to contact, and personalized outreach messages. All you need to do is get started.
          </p>
          <div style="margin: 0 0 24px;">
            <a href="${inviteLink}" style="background-color: #E85D20; color: white; padding: 16px 40px; text-decoration: none; border-radius: 100px; font-weight: 600; font-size: 16px; display: inline-block;">
              Get Started →
            </a>
          </div>
          <p style="font-size: 13px; color: #888888;">
            Takes less than 60 seconds.
          </p>
        </div>
      </div>
    `;

        console.log('📤 Calling SendEmail integration...');
        console.log('To:', student_email);
        console.log('Subject:', subject);
        
        const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
            to: student_email,
            subject: subject,
            body: emailBody,
            from_name: "College Fast Forward"
        });

        console.log('✅ Email sent successfully!');
        console.log('Email result:', emailResult);

        return Response.json({ success: true, message: 'Invite email sent successfully.' });

    } catch (error) {
        console.error('=== SEND STUDENT INVITE EMAIL ERROR ===');
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        return Response.json({ error: error.message }, { status: 500 });
    }
});