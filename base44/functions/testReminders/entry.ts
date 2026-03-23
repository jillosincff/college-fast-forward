import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { SendEmail } from '@/integrations/Core';

// Test function to manually trigger reminder dispatch for QA
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        // Get the dispatch function URL from the current request
        const url = new URL(req.url);
        const dispatchUrl = `${url.protocol}//${url.host}/functions/dispatchReminders`;
        
        // Call the dispatch function
        const response = await fetch(dispatchUrl, {
            method: 'POST',
            headers: {
                'Authorization': req.headers.get('Authorization') || '',
                'Content-Type': 'application/json'
            }
        });

        let result;
        try {
            result = await response.json();
        } catch (e) {
            result = { error: 'Failed to parse response' };
        }
        
        return new Response(JSON.stringify({ 
            message: 'Test dispatch completed', 
            status: response.status,
            result: result 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error in test reminders:", error);
        return new Response(JSON.stringify({ 
            error: "Failed to test reminders",
            details: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});