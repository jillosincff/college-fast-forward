import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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

    // A helper function to run deletions in parallel — uses service role to bypass RLS
    const deleteUserRecords = async (entity, filter) => {
      try {
        const records = await base44.asServiceRole.entities[entity].filter(filter);
        if (records && records.length > 0) {
          for (const record of records) {
            await base44.asServiceRole.entities[entity].delete(record.id);
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
      deleteUserRecords('Resume', { student_email: userEmail }),
      deleteUserRecords('Resume', { created_by: userEmail }),
      deleteUserRecords('TailoredResume', { created_by: userEmail }),
      deleteUserRecords('OutreachDraft', { created_by: userEmail }),
      deleteUserRecords('OpportunityApplication', { applicant_id: userId }),
      deleteUserRecords('NotebookEntry', { created_by: userEmail }),
      deleteUserRecords('NetworkingPipeline', { created_by: userEmail }),
      deleteUserRecords('ActionPlan', { created_by: userEmail }),
      deleteUserRecords('AIAdvisorConversation', { created_by: userEmail }),
      deleteUserRecords('Notification', { recipient_email: userEmail }),
      deleteUserRecords('Message', { sender_email: userEmail }),
      deleteUserRecords('Message', { recipient_email: userEmail }),
      // GDPR additions
      deleteUserRecords('AnalyticsEvent', { user_id: userId }),
      deleteUserRecords('MagicLink', { email: userEmail }),
      deleteUserRecords('ReferralLink', { created_by: userEmail }),
      deleteUserRecords('Family', { primary_parent_id: userId }),
      deleteUserRecords('KarmaTransaction', { parent_user_id: userId }),
    ]);

    // Cancel Stripe subscription if exists
    const userRecords = await base44.asServiceRole.entities.User.filter({ id: userId });
    const userRecord = userRecords?.[0];
    if (userRecord?.stripe_subscription_id) {
      try {
        const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
        await fetch(
          `https://api.stripe.com/v1/subscriptions/${userRecord.stripe_subscription_id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${STRIPE_SECRET}` },
          }
        );
        console.log(`[GDPR] Cancelled Stripe subscription ${userRecord.stripe_subscription_id}`);
      } catch (e) {
        console.error('Failed to cancel Stripe subscription:', e.message);
      }
    }

    // 5. Finally, delete the user's own record
    await base44.asServiceRole.entities.User.delete(userId);

    console.log(`[GDPR] User deletion completed for ${userId} at ${new Date().toISOString()}`);

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