import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user?.roles?.includes('admin')) {
            return Response.json({ error: 'Admin only' }, { status: 403 });
        }

        const { test_email } = await req.json();

        if (!test_email) {
            return Response.json({ error: 'test_email required' }, { status: 400 });
        }

        const testCode = 'TEST1234';
        
        const emailSubject = '🐊 Welcome to College Fast Forward!';
        const emailBody = `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0021A5; font-size: 28px; margin-bottom: 10px;">🧡💙 You're In! 🐊</h1>
                    <p style="color: #64748b; font-size: 16px;">Your invite to College Fast Forward has been approved</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: white; font-size: 14px; margin: 0 0 10px 0;">Your Invite Code</p>
                    <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 0; font-family: monospace;">${testCode}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${req.headers.get('origin') || 'https://www.collegefastforward.com'}/#GatorInviteCode" 
                       style="background: #FA4616; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Join the Network →
                    </a>
                </div>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 10px 0;">What's Next?</h3>
                    <ol style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                        <li>Click "Join the Network" button above</li>
                        <li>Enter your invite code: <strong>${testCode}</strong></li>
                        <li>Sign in with Google</li>
                        <li>Start connecting with Gators!</li>
                    </ol>
                </div>
                
                <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 40px;">
                    This code expires in 30 days. Questions? Reply to this email.<br/>
                    Go Gators! 🐊🧡💙
                </p>
            </div>
        `;

        console.log('Attempting to send test email to:', test_email);

        const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'College Fast Forward',
            to: test_email,
            subject: emailSubject,
            body: emailBody
        });

        console.log('Email sent successfully:', emailResult);

        return Response.json({
            success: true,
            message: 'Test email sent successfully',
            recipient: test_email,
            code: testCode,
            emailResult: emailResult
        });

    } catch (error) {
        console.error('Test email error:', error);
        return Response.json({ 
            error: 'Failed to send test email',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});