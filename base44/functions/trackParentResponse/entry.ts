import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Track when a parent responds to a student message.
 * Updates response rate, avg response time, and students helped count.
 * 
 * Call this function when a parent sends a message to a student.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, response_time_hours } = await req.json();

    // Get parent's expertise profile
    const profiles = await base44.asServiceRole.entities.ParentExpertise.filter({
      parent_id: user.id
    });

    if (!profiles || profiles.length === 0) {
      return Response.json({ error: 'Parent profile not found' }, { status: 404 });
    }

    const profile = profiles[0];
    
    // Calculate new stats
    const messagesReceived = (profile.messages_received || 0) + 1;
    const messagesResponded = (profile.messages_responded || 0) + 1;
    const responseRate = messagesResponded / messagesReceived;
    
    // Calculate rolling average response time
    const oldAvg = profile.avg_response_hours || 24;
    const oldCount = profile.messages_responded || 0;
    const newAvgResponseHours = oldCount > 0 
      ? ((oldAvg * oldCount) + response_time_hours) / (oldCount + 1)
      : response_time_hours;
    
    // Determine if they're a fast responder (avg under 4 hours)
    const isFastResponder = newAvgResponseHours <= 4;

    // Update profile
    await base44.asServiceRole.entities.ParentExpertise.update(profile.id, {
      messages_received: messagesReceived,
      messages_responded: messagesResponded,
      response_rate: responseRate,
      avg_response_hours: Math.round(newAvgResponseHours * 10) / 10, // 1 decimal place
      is_fast_responder: isFastResponder,
      last_active_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      stats: {
        response_rate: Math.round(responseRate * 100),
        avg_response_hours: Math.round(newAvgResponseHours * 10) / 10,
        is_fast_responder: isFastResponder
      }
    });

  } catch (error) {
    console.error('Track parent response error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});