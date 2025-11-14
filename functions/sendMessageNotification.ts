import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

console.log('🚀 sendMessageNotification loaded');

Deno.serve(async (req) => {
    console.log('📨 Message notification request received');
    
    try {
        console.log('Step 1: Parse request');
        const body = await req.json();
        console.log('Body:', JSON.stringify(body));
        
        const {
            messageId,
            senderName,
            senderEmail,
            recipientEmail,
            recipientName,
            subject,
            body: messageBody
        } = body;
        
        // Validate required fields
        if (!recipientEmail || !senderName || !messageBody) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['recipientEmail', 'senderName', 'messageBody']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Step 2: Init SDK');
        const base44 = createClientFromRequest(req);
        console.log('SDK initialized');

        // Step 3: Send email notification
        console.log('Step 3: Send email notification');
        let emailSent = false;
        try {
            const recipientFirstName = recipientName?.split(' ')[0] || 'there';
            
            const emailHtmlBody = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px;">
                            <h1 style="margin: 0; font-size: 24px;">🐊 College Fast Forward</h1>
                        </div>
                        
                        <p style="font-size: 16px;">Hi ${recipientFirstName},</p>
                        
                        <p style="font-size: 16px;">You have a new message from <strong>${senderName}</strong> on College Fast Forward:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0021A5;">
                            <p style="margin: 0 0 10px 0; font-weight: 600; color: #0021A5;">Subject:</p>
                            <p style="margin: 0 0 15px 0; font-size: 16px;">${subject || 'New Message'}</p>
                            
                            <p style="margin: 0 0 10px 0; font-weight: 600; color: #0021A5;">Message:</p>
                            <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${messageBody}</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://www.collegefastforward.com/#Dashboard" 
                               style="background-color: #0021A5; color: white; padding: 14px 28px; 
                                      text-decoration: none; border-radius: 8px; display: inline-block; 
                                      font-weight: 600; font-size: 16px;">
                                Reply on College Fast Forward →
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                            This message was sent through the College Fast Forward platform.
                        </p>
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 5px 0 0 0;">
                            Go Gators! 🧡💙
                        </p>
                    </div>
                </div>
            `;

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: recipientEmail,
                subject: `💬 New Message from ${senderName} on College Fast Forward`,
                body: emailHtmlBody,
                from_name: 'College Fast Forward'
            });
            
            emailSent = true;
            console.log('✅ Email sent to:', recipientEmail);
        } catch (emailErr) {
            console.error('❌ Email error:', emailErr.message);
        }

        console.log('Step 4: Return success');
        return new Response(JSON.stringify({
            success: emailSent,
            emailSent,
            messageId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        console.error('Stack:', error.stack);
        return new Response(JSON.stringify({ 
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});