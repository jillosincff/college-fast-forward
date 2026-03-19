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

    const subject = `🌟 ${student_name}, unlock opportunities through the Gator network`;
    
    // Build invite link with parent context for Flow A
    const parentFirstName = parent_name.split(' ')[0] || parent_name;
    // Get student's university from parent's onboarding data if available
    let studentSchool = '';
    try {
      const parentUser = await base44.asServiceRole.entities.User.filter({ email: user.email });
      if (parentUser?.[0]) {
        // Check for student university stored during parent onboarding
        const studentEmails = parentUser[0].student_emails || [];
        studentSchool = body.student_university || parentUser[0].student_university || '';
      }
    } catch (e) { /* non-critical */ }

    const inviteParams = new URLSearchParams({
      email: student_email,
      parent: parentFirstName,
      ...(studentSchool ? { school: studentSchool } : {}),
    });
    const inviteLink = `https://www.collegefastforward.com/#StudentInvitedOnboarding?${inviteParams.toString()}`;

    const emailBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #0021A5; text-align: center; font-size: 24px; margin-top: 0;">🎓 Your next step starts here</h2>
          <p style="font-size: 16px;">Hi ${student_name},</p>
          <p style="font-size: 16px;">Your parent, ${parent_name}, invited you to join <strong>College Fast Forward</strong> — a platform built exclusively for UF students, parents, and alumni.</p>
          <p style="font-size: 16px;">Here, you can:</p>
          <ul style="list-style-type: none; padding: 0; font-size: 16px;">
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;"><span style="margin-right: 10px;">🌟</span><span>Connect with alumni & parents who want to help you succeed</span></li>
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;"><span style="margin-right: 10px;">💼</span><span>Discover internships and job opportunities shared by the Gator community</span></li>
            <li style="margin-bottom: 12px; display: flex; align-items: flex-start;"><span style="margin-right: 10px;">💬</span><span>Ask for advice or mentorship from people who've been where you are</span></li>
          </ul>
          <p style="font-size: 16px;">At College Fast Forward, we believe it takes a village. This is your chance to tap into the power of Gator Nation and take the next step toward your future.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #FA4616; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
              👉 Join College Fast Forward
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Your parent won't be posting on your behalf — this journey is yours. But they wanted to make sure you had access to the Gator community that's here to support you. 💙🐊
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