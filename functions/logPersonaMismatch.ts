import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Logs persona mismatch events for monitoring and debugging.
 * This helps identify if there are systematic issues with persona assignment.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse the request body
    const { user_id, email, expected, actual, attempt, location } = await req.json();
    
    // Log the mismatch event
    const logEntry = {
      timestamp: new Date().toISOString(),
      user_id,
      email,
      expected_persona: expected,
      actual_persona: actual,
      attempt,
      location,
      user_agent: req.headers.get('user-agent') || 'unknown'
    };
    
    console.log('🚨 [PersonaMismatch]', JSON.stringify(logEntry));
    
    // You could also store this in a database entity for long-term tracking
    // For now, just log to console which goes to Deno Deploy logs
    
    return Response.json({ 
      success: true, 
      logged: true,
      timestamp: logEntry.timestamp 
    });
    
  } catch (error) {
    console.error('Error in logPersonaMismatch:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});