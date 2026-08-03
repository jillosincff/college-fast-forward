import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        // Request-scoped client — a module-level singleton shared across
        // concurrent requests causes token/identity race conditions.
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { action, details, ip_address } = await req.json();

        // Create audit log entry
        const logEntry = {
            user_id: user.id,
            user_email: user.email,
            action: action,
            details: details || {},
            ip_address: ip_address || req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown',
            user_agent: req.headers.get('User-Agent') || 'unknown',
            timestamp: new Date().toISOString()
        };

        // In a production environment, you'd store this in a dedicated audit log table
        // For now, we'll log to console and could extend to external logging service
        console.log('AUDIT LOG:', JSON.stringify(logEntry, null, 2));

        // Could also send to external logging service like DataDog, LogRocket, etc.
        // await sendToLoggingService(logEntry);

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Audit log error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});