import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

console.log('🚀 trackHelpOffer function loaded');

Deno.serve(async (req) => {
    console.log('📨 Help offer request received');
    
    try {
        // Step 1: Parse request with all data
        console.log('Step 1: Parse request');
        const body = await req.json();
        console.log('Body received:', JSON.stringify(body, null, 2));
        
        const {
            requestId,
            message,
            helpTypes = [],
            // Helper info (passed directly, no DB query needed)
            helperEmail,
            helperName,
            helperPersona,
            // Request info (passed directly, no DB query needed)
            requestCreatorEmail,
            requestTitle,
            requestDescription,
            studentName
        } = body;
        
        // Validate required fields
        if (!requestId || !message || !helperEmail || !requestCreatorEmail) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['requestId', 'message', 'helperEmail', 'requestCreatorEmail']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Step 2: Init SDK');
        const base44 = createClientFromRequest(req);
        console.log('SDK initialized');

        // Step 3: Create in-app message
        console.log('Step 3: Create in-app message');
        let messageCreated = false;
        let messageId = null;
        
        try {
            const newMessage = await base44.asServiceRole.entities.Message.create({
                recipient_email: requestCreatorEmail,
                sender_email: helperEmail,
                subject: `🙋 ${helperName} wants to help with: ${requestTitle}`,
                body: `${helperName} (${helperPersona || 'Gator'}) offered to help!\n\n${message}\n\nView this in your Activity tab to respond.`,
                is_read: false
            });
            messageCreated = true;
            messageId = newMessage.id;
            console.log('✅ Message created:', messageId);
        } catch (msgErr) {
            console.error('❌ Message creation failed:', msgErr.message);
        }

        // Step 4: Send email notification
        console.log('Step 4: Send email notification');
        let emailSent = false;
        
        try {
            const emailSubject = `🙋 ${helperName} wants to help with your request!`;
            
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0021A5;">Great news, ${studentName}! 🎉</h2>
                    
                    <p><strong>${helperName}</strong> wants to help with your request:</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #334155;">${requestTitle}</h3>
                        ${requestDescription ? `<p style="color: #64748b; margin: 0;">${requestDescription.substring(0, 150)}...</p>` : ''}
                    </div>
                    
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #92400e;">Their message:</h4>
                        <p style="margin: 0; color: #451a03;">"${message}"</p>
                    </div>
                    
                    ${helpTypes.length > 0 ? `
                    <div style="margin: 20px 0;">
                        <p style="font-weight: 600; margin-bottom: 10px;">They can help with:</p>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${helpTypes.map(type => `<li style="margin: 5px 0;">${type.replace('_', ' ')}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://collegefastforward.com/#Dashboard" 
                           style="background-color: #0021A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            View in Your Dashboard →
                        </a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">
                        This is the Gator network in action! 🧡💙
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">
                        You're receiving this because someone offered to help with your request on College Fast Forward.
                    </p>
                </div>
            `;

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: requestCreatorEmail,
                subject: emailSubject,
                body: emailBody
            });
            
            emailSent = true;
            console.log('✅ Email sent to:', requestCreatorEmail);
        } catch (emailErr) {
            console.error('❌ Email sending failed:', emailErr.message);
        }

        // Step 5: Update request metrics (optional, non-blocking)
        console.log('Step 5: Update request metrics');
        try {
            // Try to update the request's offer count, but don't fail if it doesn't work
            const request = await base44.asServiceRole.entities.JobRequest.get(requestId);
            if (request) {
                await base44.asServiceRole.entities.JobRequest.update(requestId, {
                    offers_count: (request.offers_count || 0) + 1,
                    last_activity_at: new Date().toISOString()
                });
                console.log('✅ Request metrics updated');
            }
        } catch (updateErr) {
            console.log('⚠️ Could not update metrics (non-critical):', updateErr.message);
        }

        console.log('Step 6: Return success');
        return new Response(JSON.stringify({
            success: messageCreated || emailSent,
            messageCreated,
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