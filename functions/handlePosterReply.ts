
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { Reminder } from '@/entities/Reminder';
import { OpportunityApplication } from '@/entities/OpportunityApplication';

// This function should be triggered when a poster sends a message in an application thread.
// It updates the application status to "replied" and cancels any pending follow-up reminders.
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const serviceRoleClient = base44.asServiceRole();

    const { applicationId } = await req.json();

    if (!applicationId) {
        return new Response(JSON.stringify({ error: "applicationId is required." }), { status: 400 });
    }

    try {
        // 1. Update application status to "replied"
        await serviceRoleClient.entities.OpportunityApplication.update(applicationId, {
            status: 'replied'
        });

        // 2. Find and cancel any active reminders for this application
        const reminders = await serviceRoleClient.entities.Reminder.filter({
            application_id: applicationId,
            delivered_at: null,
            canceled_at: null,
        });

        const cancelPromises = reminders.map(reminder =>
            serviceRoleClient.entities.Reminder.update(reminder.id, {
                canceled_at: new Date().toISOString()
            })
        );

        await Promise.all(cancelPromises);

        return new Response(JSON.stringify({ success: true, message: `Application ${applicationId} marked as replied and ${reminders.length} reminders canceled.` }), { status: 200 });

    } catch (error) {
        console.error(`Error handling poster reply for application ${applicationId}:`, error);
        return new Response(JSON.stringify({ error: "Failed to process poster reply." }), { status: 500 });
    }
});
