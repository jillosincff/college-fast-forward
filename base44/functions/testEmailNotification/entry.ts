import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    console.log('🧪 testEmailNotification called');
    
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();
        const { testEmail } = body;
        
        if (!testEmail) {
            return new Response(JSON.stringify({ error: 'testEmail is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('📧 Sending test email to:', testEmail);
        
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #0021A5;">Test Email from College Fast Forward</h1>
                <p>This is a test email sent at: ${new Date().toISOString()}</p>
                <p>If you receive this, email notifications are working!</p>
                <a href="https://www.collegefastforward.com/#Dashboard" style="display: inline-block; padding: 12px 24px; background-color: #FA4616; color: white; text-decoration: none; border-radius: 8px;">Go to Dashboard</a>
            </div>
        `;
        
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: testEmail,
            subject: '🧪 Test Email - College Fast Forward',
            body: emailHtml,
            from_name: 'College Fast Forward Test'
        });
        
        console.log('✅ Test email sent successfully');
        
        return new Response(JSON.stringify({
            success: true,
            message: `Test email sent to ${testEmail}`,
            timestamp: new Date().toISOString()
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return new Response(JSON.stringify({ 
            success: false,
            error: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});