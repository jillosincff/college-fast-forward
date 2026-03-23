import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

console.log('🚀 notifySharerOfResponse loaded');

Deno.serve(async (req) => {
    console.log('📨 Sharer notification request received');
    
    try {
        const body = await req.json();
        console.log('Body:', JSON.stringify(body));
        
        const {
            questionId,
            sharerUserId,
            responderUserId,
            responderName
        } = body;
        
        // Validate required fields
        if (!questionId || !sharerUserId) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['questionId', 'sharerUserId']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Init SDK');
        const base44 = createClientFromRequest(req);

        // Check if we've already notified this sharer for this responder on this question
        // This prevents spam if the same person posts multiple times
        const notificationKey = `sharer_notified_${sharerUserId}_${questionId}_${responderUserId || 'anon'}`;
        
        // Try to find existing notification to prevent duplicates
        const existingNotifications = await base44.asServiceRole.entities.Notification.filter({
            recipient_email: { $exists: true }, // Will be replaced with actual email lookup
            type: 'referral_signup',
            'metadata.notification_key': notificationKey
        });

        // Look up the sharer's email
        const users = await base44.asServiceRole.entities.User.filter({ id: sharerUserId });
        
        if (!users || users.length === 0) {
            console.log('Sharer user not found:', sharerUserId);
            return new Response(JSON.stringify({ 
                success: false, 
                reason: 'sharer_not_found' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const sharerUser = users[0];
        const sharerEmail = sharerUser.email;

        // Check for existing notification to this sharer for this question/responder combo
        const existingForSharer = await base44.asServiceRole.entities.Notification.filter({
            recipient_email: sharerEmail,
            type: 'referral_signup',
            'metadata.notification_key': notificationKey
        });

        if (existingForSharer && existingForSharer.length > 0) {
            console.log('Already notified sharer for this response:', notificationKey);
            return new Response(JSON.stringify({ 
                success: true, 
                alreadyNotified: true 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create the notification
        console.log('Creating notification for sharer:', sharerEmail);
        
        await base44.asServiceRole.entities.Notification.create({
            recipient_email: sharerEmail,
            type: 'referral_signup', // Using existing type that fits
            title: 'Someone you looped in responded 🎉',
            message: 'Your share helped bring in a new perspective on a student question. Thank you for being a connector.',
            action_url: `QuestionDetail?id=${questionId}`,
            action_label: 'View Response',
            priority: 'normal',
            metadata: {
                notification_key: notificationKey,
                question_id: questionId,
                responder_user_id: responderUserId,
                responder_name: responderName,
                notification_type: 'sharer_gratitude'
            }
        });

        console.log('✅ Sharer notification created for:', sharerEmail);

        return new Response(JSON.stringify({
            success: true,
            notified: sharerEmail,
            questionId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        return new Response(JSON.stringify({ 
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});