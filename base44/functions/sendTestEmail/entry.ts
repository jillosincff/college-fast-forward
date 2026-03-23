import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        const isAdmin = user.role === 'admin' || user.roles?.includes('admin');
        if (!isAdmin) {
            return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
        }

        const { recipient } = await req.json();
        const recipientEmail = recipient || user.email;

        console.log('Sending test email to:', recipientEmail);

        const emailSubject = '🧪 Test Email from College Fast Forward';
        const emailBody = `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0021A5; font-size: 28px; margin-bottom: 10px;">✅ Email System Working!</h1>
                    <p style="color: #64748b; font-size: 16px;">This is a test email from your College Fast Forward admin dashboard</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: white; font-size: 18px; margin: 0;">🎉 Email integration is configured correctly!</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 10px 0;">Test Details:</h3>
                    <ul style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                        <li>Sent at: ${new Date().toLocaleString()}</li>
                        <li>Sent to: ${recipientEmail}</li>
                        <li>From: Admin Dashboard → Test Email button</li>
                        <li>Integration: SendGrid via Core.SendEmail</li>
                    </ul>
                </div>
                
                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 40px;">
                    If you received this email, your email system is working correctly!<br/>
                    Go Gators! 🐊🧡💙
                </p>
            </div>
        `;

        try {
            const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
                from_name: 'College Fast Forward',
                to: recipientEmail,
                subject: emailSubject,
                body: emailBody
            });
            console.log('Test email sent successfully:', emailResult);

            return Response.json({
                success: true,
                message: 'Test email sent successfully!',
                recipient: recipientEmail
            });
        } catch (emailError) {
            console.error('Failed to send test email:', emailError);
            console.error('Email error details:', emailError.message, emailError.stack);
            
            return Response.json({
                success: false,
                error: 'Email sending failed',
                details: emailError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in sendTestEmail:', error);
        return Response.json({ 
            success: false,
            error: 'Failed to send test email',
            details: error.message
        }, { status: 500 });
    }
});