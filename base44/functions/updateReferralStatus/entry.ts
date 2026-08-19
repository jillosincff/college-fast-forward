import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
    try {
        const base44 = createClientFromRequest(req);
        const currentUser = await base44.auth.me();
        if (!currentUser) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { linkId, eventType, metadata = {}, trackingMethod, details, reportedBy } = body;

        // Verify the user owns this referral link
        const referralLinks = await base44.entities.ReferralLink.filter({
            id: linkId,
            helper_user_id: currentUser.id
        });

        if (!referralLinks || referralLinks.length === 0) {
            return Response.json({ error: 'Referral link not found or access denied' }, { status: 404 });
        }

        const link = referralLinks[0];

        // Enhanced metadata for interview tracking
        const enhancedMetadata = {
            ...metadata,
            updated_by: currentUser.email,
            manual_entry: true,
            tracking_method: trackingMethod,
            details: details,
            reported_by: reportedBy,
            confidence_level: trackingMethod === 'confirmed' ? 'high' : 'medium'
        };

        // Create the event
        await base44.entities.ReferralEvent.create({
            link_id: linkId,
            event_type: eventType,
            occurred_at: new Date().toISOString(),
            metadata: enhancedMetadata
        });

        // Update the counters on the referral link
        const updateData = {};
        if (eventType === 'interview') {
            updateData.interview_count = (link.interview_count || 0) + 1;

            // Send notification to student if this is a new interview report
            if (trackingMethod === 'scheduled') {
                try {
                    await base44.integrations.Core.SendEmail({
                        to: link.student_email,
                        subject: `Interview update for your ${link.request_title} request`,
                        body: `Hi! ${currentUser.full_name} mentioned that you may have an interview scheduled related to the referral they shared for your "${link.request_title}" request.\n\nCan you confirm this in your dashboard? This helps us track the success of our referral network.\n\nView your dashboard: https://collegefastforward.com/#Dashboard\n\nThanks!\nThe College Fast Forward Team`
                    });
                } catch (emailError) {
                    console.error('Failed to send notification email:', emailError);
                    // Don't fail the main request if email fails
                }
            }
        } else if (eventType === 'offer') {
            updateData.offer_count = (link.offer_count || 0) + 1;
            updateData.status = 'converted';
        }

        if (Object.keys(updateData).length > 0) {
            await base44.entities.ReferralLink.update(linkId, updateData);
        }

        return Response.json({
            success: true,
            message: `${eventType} event recorded successfully`,
            tracking_method: trackingMethod,
            notification_sent: eventType === 'interview' && trackingMethod === 'scheduled'
        });

    } catch (error) {
        console.error('Error updating referral status:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}