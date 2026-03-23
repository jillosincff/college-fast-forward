import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

console.log('🚀 notifyStudentOfExternalHelp loaded');

Deno.serve(async (req) => {
    console.log('📨 Student notification request received');
    
    try {
        const body = await req.json();
        console.log('Body:', JSON.stringify(body));
        
        const {
            questionId,
            questionType,
            sharerUserId,
            responderName
        } = body;
        
        // Validate required fields
        if (!questionId) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['questionId']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Init SDK');
        const base44 = createClientFromRequest(req);

        // Fetch the question to get student email
        let question = null;
        let source = questionType;
        
        if (!source || source === 'JobRequest') {
            const jobRequests = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
            if (jobRequests && jobRequests.length > 0) {
                question = jobRequests[0];
                source = 'JobRequest';
            }
        }
        
        if (!question && (!questionType || questionType === 'HelpRequest')) {
            const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
            if (helpRequests && helpRequests.length > 0) {
                question = helpRequests[0];
                source = 'HelpRequest';
            }
        }

        if (!question) {
            console.log('Question not found:', questionId);
            return new Response(JSON.stringify({ 
                success: false, 
                reason: 'question_not_found' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get student email - check multiple fields
        const studentEmail = question.poster_email || question.student_email || question.created_by;
        
        if (!studentEmail) {
            console.log('No student email found for question:', questionId);
            return new Response(JSON.stringify({ 
                success: false, 
                reason: 'no_student_email' 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get sharer's name if available
        let sharerName = 'Someone in the community';
        if (sharerUserId) {
            const users = await base44.asServiceRole.entities.User.filter({ id: sharerUserId });
            if (users && users.length > 0) {
                sharerName = users[0].full_name || users[0].first_name || 'A community member';
            }
        }

        // Create unique key to prevent duplicate notifications
        const notificationKey = `student_external_help_${questionId}_${responderName || 'anon'}`;
        
        // Check for existing notification
        const existing = await base44.asServiceRole.entities.Notification.filter({
            recipient_email: studentEmail,
            'metadata.notification_key': notificationKey
        });

        if (existing && existing.length > 0) {
            console.log('Already notified student for this response:', notificationKey);
            return new Response(JSON.stringify({ 
                success: true, 
                alreadyNotified: true 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create notification for the student
        console.log('Creating notification for student:', studentEmail);
        
        await base44.asServiceRole.entities.Notification.create({
            recipient_email: studentEmail,
            type: 'help_offer',
            title: '🎉 Someone was looped in to help you!',
            message: `${sharerName} shared your question with their network, and ${responderName || 'someone'} just responded with advice.`,
            action_url: `QuestionDetail?id=${questionId}`,
            action_label: 'View Response',
            priority: 'high',
            metadata: {
                notification_key: notificationKey,
                question_id: questionId,
                sharer_user_id: sharerUserId,
                responder_name: responderName,
                notification_type: 'external_help_received'
            }
        });

        console.log('✅ Student notification created for:', studentEmail);

        return new Response(JSON.stringify({
            success: true,
            notified: studentEmail,
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