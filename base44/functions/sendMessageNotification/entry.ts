import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

console.log('🚀 sendMessageNotification loaded v3');

Deno.serve(async (req) => {
    console.log('📨 sendMessageNotification called');
    
    try {
        const body = await req.json();
        
        const {
            messageId,
            senderName,
            senderEmail,
            recipientEmail,
            recipientName,
            subject,
            messageBody,
            messagePreview
        } = body;
        
        // Log ALL received parameters for debugging
        console.log('📨 FULL BODY:', JSON.stringify(body, null, 2));
        console.log('📨 recipientEmail:', recipientEmail);
        console.log('📨 recipientName:', recipientName);
        console.log('📨 senderName:', senderName);
        console.log('📨 senderEmail:', senderEmail);
        console.log('📨 subject:', subject);
        console.log('📨 messageBody:', messageBody?.substring(0, 100));
        console.log('📨 messagePreview:', messagePreview?.substring(0, 100));
        
        // Validate required fields - support both old and new format
        const actualMessage = messageBody || messagePreview;
        if (!recipientEmail || !senderName || !actualMessage) {
            console.error('❌ Missing required fields:', { recipientEmail: !!recipientEmail, senderName: !!senderName, actualMessage: !!actualMessage });
            return new Response(JSON.stringify({ 
                success: false,
                error: 'Missing required fields',
                required: ['recipientEmail', 'senderName', 'messageBody or messagePreview']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const base44 = createClientFromRequest(req);

        // Determine recipient first name for greeting
        const recipientFirstName = recipientName?.split(' ')[0] || 'there';
        const displayMessage = actualMessage.substring(0, 500);
        
        const emailHtmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px;">
                        <h1 style="margin: 0; font-size: 24px;">💬 New Message</h1>
                    </div>
                    
                    <p style="font-size: 16px;">Hi ${recipientFirstName},</p>
                    
                    <p style="font-size: 16px;"><strong>${senderName}</strong> sent you a message:</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0021A5;">
                        <p style="margin: 0; font-size: 16px; font-style: italic; color: #1f2937;">"${displayMessage}${actualMessage.length > 500 ? '...' : ''}"</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.collegefastforward.com/#MyMessages" style="background-color: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">View Message & Reply →</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                        This message was sent through College Fast Forward.
                    </p>
                    <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 5px 0 0 0;">
                        Go Gators!
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
                        <a href="https://www.collegefastforward.com/#ProfileEdit" style="color: #9ca3af;">Manage notification preferences</a>
                    </p>
                </div>
            </div>
        `;

        // Send email with explicit error handling
        try {
            console.log('📧 Attempting to send email to:', recipientEmail);
            
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: recipientEmail,
                subject: `${senderName} sent you a message - College Fast Forward`,
                body: emailHtmlBody,
                from_name: 'College Fast Forward'
            });
            
            console.log('✅ Email notification sent to:', recipientEmail);
            
            return new Response(JSON.stringify({
                success: true,
                emailSent: true,
                recipientEmail,
                messageId
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        } catch (emailError) {
            console.error('❌ Email send failed:', emailError.message);
            console.error('❌ Email error details:', JSON.stringify(emailError));
            
            return new Response(JSON.stringify({ 
                success: false, 
                emailSent: false,
                error: emailError.message,
                recipientEmail
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        console.error('Stack:', error.stack);
        return new Response(JSON.stringify({ 
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});