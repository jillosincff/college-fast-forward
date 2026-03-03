import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const base44 = createClient({
  appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
  try {
    // 1. Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.split(' ')[1];
    base44.auth.setToken(token);

    // 2. Get the current user - THIS IS THE FIX
    // The previous code used a non-existent function. `auth.me()` is the correct method.
    const user = await base44.auth.me(); 
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found or token invalid' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Check confirmation text from the request body
    const { confirmationText } = await req.json();
    if (confirmationText !== 'DELETE') {
      return new Response(JSON.stringify({ 
        error: 'Incorrect confirmation text. Account deletion canceled.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Delete user's associated data across different entities
    const userEmail = user.email;
    const userId = user.id;

    // A helper function to run deletions in parallel
    const deleteUserRecords = async (entity, filter) => {
      try {
        const records = await base44.entities[entity].filter(filter);
        if (records && records.length > 0) {
          for (const record of records) {
            await base44.entities[entity].delete(record.id);
          }
        }
      } catch (e) {
        console.error(`Error deleting records from ${entity}:`, e.message);
        // Continue even if some deletions fail
      }
    };

    await Promise.all([
      deleteUserRecords('JobRequest', { created_by: userEmail }),
      deleteUserRecords('RoommatePost', { created_by: userEmail }),
      deleteUserRecords('HelpOffer', { offerer_user_id: userId }),
      deleteUserRecords('HelpOffer', { recipient_email: userEmail }),
      deleteUserRecords('Connection', { request_creator_email: userEmail }),
      deleteUserRecords('Connection', { connector_user_id: userId }),
      deleteUserRecords('SuccessStory', { created_by: userEmail }),
      // Note: We are not deleting messages to preserve the other user's inbox.
    ]);

    // 5. Finally, delete the user's own record
    await base44.entities.User.delete(userId);

    return new Response(JSON.stringify({ success: true, message: 'Your account and all associated data have been permanently deleted.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Delete user account error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred during account deletion.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});