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

        console.log('🔍 [SendGrid Diagnostic] Starting...');
        console.log('📧 Test email:', test_email);

        // Check if API key exists
        const apiKey = Deno.env.get('SENDGRID_API_KEY');
        if (!apiKey) {
            return Response.json({ 
                error: 'SENDGRID_API_KEY not configured',
                diagnosis: 'Missing API key in environment variables'
            }, { status: 500 });
        }
        console.log('✅ API key found:', apiKey.substring(0, 10) + '...');

        // Test 1: Minimal email through Core integration
        console.log('🧪 Test 1: Minimal email via Core integration...');
        try {
            const result1 = await base44.asServiceRole.integrations.Core.SendEmail({
                from_name: 'Test',
                to: test_email,
                subject: 'Test Email',
                body: 'This is a test email.'
            });
            console.log('✅ Test 1 SUCCESS:', result1);
        } catch (error) {
            console.error('❌ Test 1 FAILED:', error);
            return Response.json({
                error: 'Core.SendEmail failed',
                diagnosis: 'Base44 SendEmail integration error',
                details: error.message,
                stack: error.stack
            }, { status: 500 });
        }

        // Test 2: Direct SendGrid API call
        console.log('🧪 Test 2: Direct SendGrid API call...');
        try {
            const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [{
                        to: [{ email: test_email }]
                    }],
                    from: { 
                        email: 'noreply@collegefastforward.com',
                        name: 'College Fast Forward'
                    },
                    subject: 'Direct SendGrid Test',
                    content: [{
                        type: 'text/plain',
                        value: 'Direct API test'
                    }]
                })
            });

            const responseText = await sendGridResponse.text();
            console.log('SendGrid API response status:', sendGridResponse.status);
            console.log('SendGrid API response body:', responseText);

            if (!sendGridResponse.ok) {
                return Response.json({
                    error: 'SendGrid API rejected the request',
                    diagnosis: 'Direct API call failed',
                    status: sendGridResponse.status,
                    response: responseText
                }, { status: 500 });
            }

            console.log('✅ Test 2 SUCCESS');
        } catch (error) {
            console.error('❌ Test 2 FAILED:', error);
            return Response.json({
                error: 'Direct SendGrid API call failed',
                diagnosis: 'Network or API error',
                details: error.message
            }, { status: 500 });
        }

        return Response.json({
            success: true,
            message: 'All tests passed!',
            diagnosis: 'SendGrid is working correctly'
        });

    } catch (error) {
        console.error('💥 Diagnostic error:', error);
        return Response.json({ 
            error: 'Diagnostic failed',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});