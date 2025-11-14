import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Returns the number of founding member spots remaining.
 * Uses service role to access user count without requiring authentication.
 */

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const base44 = createClientFromRequest(req);
    
    // Use service role to get user count (bypasses RLS)
    const allUsers = await base44.asServiceRole.entities.User.list(null, 1001);
    const usersCount = allUsers?.length || 0;
    
    // Calculate spots left (first 1,000 are founding members)
    const spotsLeft = Math.max(0, 1000 - usersCount);
    
    return Response.json({
      success: true,
      spotsLeft,
      totalUsers: usersCount,
      foundingThreshold: 1000,
      isFull: usersCount >= 1000
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error in getFoundingSpotsLeft:', error);
    
    // Return default values so page still works
    return Response.json({ 
      success: false,
      error: 'Failed to get founding spots count',
      details: error.message,
      spotsLeft: 965,
      totalUsers: 0,
      foundingThreshold: 1000,
      isFull: false
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});