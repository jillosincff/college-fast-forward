import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { student_email, student_name, parent_name } = body;

    if (!student_email || !student_name || !parent_name) {
        return new Response(JSON.stringify({ error: 'Missing required parameters: student_email, student_name, parent_name' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const subject = `🌟 ${student_name}, unlock opportunities through the Gator network`;
    
    // Use www.collegefastforward.com
    const inviteLink = `https://www.collegefastforward.com/#PreAuth?email=${encodeURIComponent(student_email)}`;

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

    try {
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: student_email,
            subject: subject,
            body: emailBody,
            from_name: "College Fast Forward"
        });

        return new Response(JSON.stringify({ success: true, message: 'Invite email sent successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});