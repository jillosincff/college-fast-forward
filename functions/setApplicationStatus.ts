import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Function for posters to update application status
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: "Authentication required" }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { applicationId, status } = await req.json();

        if (!applicationId || !status) {
            return new Response(JSON.stringify({ 
                error: "Missing required fields: applicationId, status" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate status
        const validStatuses = ['applied', 'in_review', 'replied', 'interview', 'closed'];
        if (!validStatuses.includes(status)) {
            return new Response(JSON.stringify({ 
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get the application and verify the user owns the opportunity
        const application = await base44.entities.OpportunityApplication.get(applicationId);
        if (!application) {
            return new Response(JSON.stringify({ error: "Application not found" }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const opportunity = await base44.entities.Opportunity.get(application.opportunity_id);
        if (!opportunity || opportunity.created_by !== user.email) {
            return new Response(JSON.stringify({ error: "Unauthorized: Not your opportunity" }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update the application status
        const updatedApplication = await base44.entities.OpportunityApplication.update(applicationId, {
            status: status
        });

        // If status is 'replied', cancel any pending reminders
        if (status === 'replied') {
            const serviceRoleClient = base44.asServiceRole();
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
        }

        return new Response(JSON.stringify({ 
            success: true,
            application: updatedApplication,
            message: `Application status updated to '${status}'`
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error setting application status:", error);
        return new Response(JSON.stringify({ 
            error: "Failed to update application status",
            details: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});