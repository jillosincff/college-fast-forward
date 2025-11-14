import { createClientFromRequest } from 'npm:@base44/sdk@0.7.0';

// This function should be run on a schedule (e.g., every 10 minutes via a cron job).
// It finds and delivers due reminders for application follow-ups.
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const serviceRoleClient = base44.asServiceRole;

    try {
        const now = new Date().toISOString();
        const dueReminders = await serviceRoleClient.entities.Reminder.filter({
            remind_at: { $lte: now },
            delivered_at: null,
            canceled_at: null,
        });

        if (dueReminders.length === 0) {
            return new Response(JSON.stringify({ message: "No reminders to send." }), { status: 200 });
        }

        const deliveryPromises = dueReminders.map(async (reminder) => {
            try {
                // Fetch associated data for the email content
                const [user, application] = await Promise.all([
                    serviceRoleClient.entities.User.get(reminder.user_id),
                    serviceRoleClient.entities.OpportunityApplication.get(reminder.application_id)
                ]);

                const opportunity = await serviceRoleClient.entities.Opportunity.get(application.opportunity_id);

                if (!user || !opportunity) return;

                // Send email notification using the correct SDK syntax
                await serviceRoleClient.integrations.Core.SendEmail({
                    from: { 
                        email: 'reminders@collegefastforward.com', 
                        name: 'College Fast Forward' 
                    },
                    to: user.email,
                    subject: `Time to follow up on your application?`,
                    body: `
                        <p>Hi ${user.full_name},</p>
                        <p>It's been a week since you applied to the "<strong>${opportunity.title}</strong>" opportunity. It might be a good time to send a friendly follow-up.</p>
                        <p>You can review your applications on your dashboard.</p>
                        <a href="https://collegefastforward.com#MyApplications">View My Applications</a>
                        <p>Go Gators!</p>
                    `,
                });

                // Mark reminder as delivered to prevent re-sending
                await serviceRoleClient.entities.Reminder.update(reminder.id, {
                    delivered_at: new Date().toISOString()
                });

            } catch (e) {
                console.error(`Failed to process reminder ${reminder.id}:`, e);
            }
        });

        await Promise.all(deliveryPromises);

        return new Response(JSON.stringify({ message: `Processed ${dueReminders.length} reminders.` }), { status: 200 });

    } catch (error) {
        console.error("Error dispatching reminders:", error);
        return new Response(JSON.stringify({ error: "Failed to dispatch reminders." }), { status: 500 });
    }
});