Deno.serve(async (req) => {
    console.log('[completeVerification] Function started');
    
    try {
        // Log the request method and headers
        console.log('[completeVerification] Request method:', req.method);
        console.log('[completeVerification] Request headers:', Object.fromEntries(req.headers.entries()));
        
        // Try to parse the body
        let body;
        try {
            body = await req.json();
            console.log('[completeVerification] Request body parsed successfully:', body);
        } catch (parseError) {
            console.error('[completeVerification] Error parsing request body:', parseError);
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid JSON in request body' 
            }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        
        const { token } = body;

        if (!token) {
            console.log('[completeVerification] No token provided');
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Token is required' 
            }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        console.log(`[completeVerification] Processing token: ${token}`);
        
        // For now, just return success with debug info
        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Debug: Function reached this point successfully',
            token: token,
            timestamp: new Date().toISOString(),
        }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

    } catch (error) {
        console.error('[completeVerification] Critical error:', error);
        console.error('[completeVerification] Error stack:', error.stack);
        
        return new Response(JSON.stringify({ 
            success: false, 
            error: `Internal server error: ${error.message}`,
            stack: error.stack,
        }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});