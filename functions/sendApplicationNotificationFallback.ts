import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Fallback notification function with minimal dependencies
 * This runs on a cron or can be manually triggered to catch missed notifications
 */
Deno.serve(async (req) => {
    console.log('🔄 Fallback notification check');
    
    try {
        const base44 = createClientFromRequest(req);
        
        // Get recent applications without notifications (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const recentApps = await base44.asServiceRole.entities.OpportunityApplication.filter({
            created_date: { $gte: oneDayAgo }
        });
        
        console.log(`Found ${recentApps?.length || 0} recent applications`);
        
        let notificationsSent = 0;
        
        for (const app of (recentApps || [])) {
            try {
                // Check if notification already exists
                const existingMessages = await base44.asServiceRole.entities.Message.filter({
                    subject: { $regex: `New Application.*${app.opportunity_id}` },
                    created_date: { $gte: app.created_date }
                });
                
                if (existingMessages && existingMessages.length > 0) {
                    console.log(`Notification already exists for application ${app.id}`);
                    continue;
                }
                
                // Get opportunity and poster
                const opportunity = await base44.asServiceRole.entities.Opportunity.get(app.opportunity_id);
                if (!opportunity) continue;
                
                const posters = await base44.asServiceRole.entities.User.filter({ email: opportunity.created_by });
                const poster = posters?.[0];
                if (!poster) continue;
                
                // Create notification
                await base44.asServiceRole.entities.Message.create({
                    recipient_email: poster.email,
                    sender_email: 'notifications@collegefastforward.com',
                    subject: `📋 New Application: ${opportunity.title}`,
                    body: `You have a new application for "${opportunity.title}".\n\nView it in your dashboard.`,
                    is_read: false
                });
                
                notificationsSent++;
                console.log(`✅ Sent notification for application ${app.id}`);
                
            } catch (err) {
                console.error(`Failed to send notification for app ${app.id}:`, err.message);
            }
        }
        
        return Response.json({
            success: true,
            applicationsChecked: recentApps?.length || 0,
            notificationsSent
        });
        
    } catch (error) {
        console.error('Fallback function error:', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }
});