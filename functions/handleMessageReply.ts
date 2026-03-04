import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Function to be called when a poster sends a message reply
// Updates application status and cancels reminders
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const serviceRoleClient = base44.asServiceRole;

    try {
        const { applicationId, messageContent, senderId } = await req.json();

        if (!applicationId || !messageContent || !senderId) {
            return new Response(JSON.stringify({ 
                error: "Missing required fields: applicationId, messageContent, senderId" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get the application to verify sender is the opportunity poster
        const application = await serviceRoleClient.entities.OpportunityApplication.get(applicationId);
        if (!application) {
            return new Response(JSON.stringify({ error: "Application not found" }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const opportunity = await serviceRoleClient.entities.Opportunity.get(application.opportunity_id);
        if (!opportunity || opportunity.created_by !== senderId) {
            return new Response(JSON.stringify({ error: "Unauthorized: Not the opportunity poster" }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update application status to 'replied'
        await serviceRoleClient.entities.OpportunityApplication.update(applicationId, {
            status: 'replied'
        });

        // Cancel any pending reminders for this application
        const pendingReminders = await serviceRoleClient.entities.Reminder.filter({
            application_id: applicationId,
            delivered_at: null,
            canceled_at: null
        });

        const cancelPromises = pendingReminders.map(reminder => 
            serviceRoleClient.entities.Reminder.update(reminder.id, {
                canceled_at: new Date().toISOString()
            })
        );

        await Promise.all(cancelPromises);

        return new Response(JSON.stringify({ 
            success: true,
            message: `Application ${applicationId} updated to 'replied', ${pendingReminders.length} reminders canceled`
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error handling message reply:", error);
        return new Response(JSON.stringify({ 
            error: "Failed to handle message reply",
            details: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});