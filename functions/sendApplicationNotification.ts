import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

console.log('🚀 Function loaded');

Deno.serve(async (req) => {
    console.log('📨 Request received');
    
    try {
        console.log('Step 1: Parse request');
        const body = await req.json();
        console.log('Body:', JSON.stringify(body));
        
        const {
            applicationId,
            posterEmail,
            opportunityTitle,
            applicantName,
            applicantEmail,
            applicationNote,
            resumeUrl
        } = body;
        
        // Validate required fields
        if (!posterEmail || !opportunityTitle || !applicantName) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['posterEmail', 'opportunityTitle', 'applicantName']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Step 2: Init SDK');
        const base44 = createClientFromRequest(req);
        console.log('SDK initialized');

        // Step 3: Create in-app message notification
        console.log('Step 3: Create message');
        let messageCreated = false;
        try {
            const message = await base44.asServiceRole.entities.Message.create({
                recipient_email: posterEmail,
                sender_email: applicantEmail || 'applications@collegefastforward.com',
                subject: `📋 New Application: ${opportunityTitle}`,
                body: `${applicantName} has applied to your opportunity "${opportunityTitle}"!\n\nTheir note: "${applicationNote}"\n\nResume: ${resumeUrl}\n\nView this application in your dashboard.`,
                is_read: false
            });
            messageCreated = true;
            console.log('✅ Message created:', message.id);
        } catch (msgErr) {
            console.error('❌ Message error:', msgErr.message);
        }

        // Step 4: Send email notification
        console.log('Step 4: Send email');
        let emailSent = false;
        try {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: posterEmail,
                subject: `📋 New Application for ${opportunityTitle}!`,
                body: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>🎉 New Application!</h2>
                        <p><strong>${applicantName}</strong> applied to your opportunity: <strong>${opportunityTitle}</strong></p>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Their note:</strong></p>
                            <p style="font-style: italic;">"${applicationNote}"</p>
                        </div>
                        ${resumeUrl ? `<p><a href="${resumeUrl}" style="display: inline-block; padding: 10px 20px; background: #0021A5; color: white; text-decoration: none; border-radius: 6px;">View Resume</a></p>` : ''}
                        <p><a href="https://www.collegefastforward.com">View in Dashboard</a></p>
                        <p style="color: #666; font-size: 14px;">Go Gators! 🧡💙</p>
                    </div>
                `
            });
            emailSent = true;
            console.log('✅ Email sent');
        } catch (emailErr) {
            console.error('❌ Email error:', emailErr.message);
        }

        // Step 5: Return success
        console.log('Step 5: Return success');
        return new Response(JSON.stringify({
            success: messageCreated || emailSent,
            messageCreated,
            emailSent
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