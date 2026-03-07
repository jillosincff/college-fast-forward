import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { intro, request, helper } = await req.json();

        // Get the student who posted the request using the User entity
        const students = await base44.asServiceRole.entities.User.filter({ email: request.created_by });
        const student = students && students.length > 0 ? students[0] : null;
        
        if (!student) {
            console.error('Student not found for email:', request.created_by);
            return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
        }

        const emailSubject = `🤝 ${helper.full_name || 'A Gator'} made an introduction for you!`;
        
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0021A5;">Amazing! A Gator made an introduction for you 🐊</h2>
                
                <p>Hi ${student.full_name || 'fellow Gator'},</p>
                
                <p><strong>${helper.full_name || 'A Gator'}</strong> just connected you with someone from their network:</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #334155;">Introduction for: ${request.title || request.role}</h3>
                    <p style="color: #64748b; margin: 0;"><strong>Industry:</strong> ${request.target_industry}</p>
                    ${request.target_company ? `<p style="color: #64748b; margin: 5px 0 0 0;"><strong>Company:</strong> ${request.target_company}</p>` : ''}
                </div>
                
                <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #1e40af;">Introduction Details:</h4>
                    <p style="margin: 0; color: #1e3a8a;">"${intro.custom_note || 'Check your email for the introduction details!'}"</p>
                </div>
                
                <p><strong>Next steps:</strong></p>
                <ul>
                    <li>Check your email for the introduction message</li>
                    <li>Follow up promptly with the person you were introduced to</li>
                    <li>Thank ${helper.full_name || 'your Gator helper'} for making the connection</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://collegefastforward.com/#Activity" 
                       style="background-color: #0021A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        View Your Activity →
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">
                    The power of the Gator network in action! 🧡💙
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="color: #94a3b8; font-size: 12px;">
                    You're receiving this because someone made an introduction for you on College Fast Forward. 
                    <a href="https://collegefastforward.com">Visit your dashboard</a> to manage notifications.
                </p>
            </div>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
            to: student.email,
            subject: emailSubject,
            body: emailBody
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Failed to send intro notification:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to send notification',
            details: error.message 
        }), { status: 500 });
    }
});