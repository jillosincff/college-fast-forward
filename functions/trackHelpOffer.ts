import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

console.log('🚀 trackHelpOffer function loaded');

Deno.serve(async (req) => {
    console.log('📨 Help offer request received');
    
    try {
        // Step 1: Parse request with all data
        console.log('Step 1: Parse request');
        const body = await req.json();
        console.log('Body received:', JSON.stringify(body, null, 2));
        
        const {
            requestId,
            message,
            helpTypes = [],
            // Helper info (passed directly, no DB query needed)
            helperEmail,
            helperName,
            helperPersona,
            // Request info (passed directly, no DB query needed)
            requestCreatorEmail,
            requestTitle,
            requestDescription,
            studentName
        } = body;
        
        // Validate required fields
        if (!requestId || !message || !helperEmail || !requestCreatorEmail) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['requestId', 'message', 'helperEmail', 'requestCreatorEmail']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Step 2: Init SDK');
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        console.log('SDK initialized, user:', user?.email);

        // Step 2.5: Create HelpOffer record (CRITICAL - this is what we count!)
        console.log('Step 2.5: Create HelpOffer record');
        let helpOfferId = null;
        
        try {
            console.log('📝 Creating HelpOffer with data:', {
                job_request_id: requestId,
                offerer_user_id: user?.id || 'unknown',
                offerer_name: helperName,
                offerer_email: helperEmail,
                request_creator_email: requestCreatorEmail,
                help_type: helpTypes[0] || 'career_guidance',
                message: message?.substring(0, 50) + '...',
                status: 'pending'
            });
            
            const helpOffer = await base44.asServiceRole.entities.HelpOffer.create({
                job_request_id: requestId,
                offerer_user_id: user?.id || 'unknown',
                offerer_name: helperName,
                offerer_email: helperEmail,
                request_creator_email: requestCreatorEmail,
                help_type: helpTypes[0] || 'career_guidance',
                message: message,
                status: 'pending'
            });
            helpOfferId = helpOffer.id;
            console.log('✅ HelpOffer created successfully:', helpOfferId);
            console.log('📊 HelpOffer details:', helpOffer);
        } catch (offerErr) {
            console.error('❌ HelpOffer creation FAILED:', offerErr);
            console.error('Error details:', offerErr.message);
            console.error('Stack:', offerErr.stack);
            // This is critical - if we can't create the offer, the count won't work
            throw offerErr; // Throw to prevent false success response
        }

        // Step 3: Create in-app message
        console.log('Step 3: Create in-app message');
        let messageCreated = false;
        let messageId = null;
        
        try {
            const newMessage = await base44.asServiceRole.entities.Message.create({
                recipient_email: requestCreatorEmail,
                sender_email: helperEmail,
                subject: `🙋 ${helperName} wants to help with: ${requestTitle}`,
                body: `${helperName} (${helperPersona || 'Gator'}) offered to help!\n\n${message}\n\nView this in your Activity tab to respond.`,
                is_read: false,
                post_id: requestId,
                post_title: requestTitle
            });
            messageCreated = true;
            messageId = newMessage.id;
            console.log('✅ Message created:', messageId);
        } catch (msgErr) {
            console.error('❌ Message creation failed:', msgErr.message);
        }

        // Step 4: Send email notification
        console.log('Step 4: Send email notification');
        let emailSent = false;
        
        try {
            const emailSubject = `🙋 ${helperName} wants to help with your request!`;
            
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0021A5;">Great news, ${studentName}! 🎉</h2>
                    
                    <p><strong>${helperName}</strong> wants to help with your request:</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #334155;">${requestTitle}</h3>
                        ${requestDescription ? `<p style="color: #64748b; margin: 0;">${requestDescription.substring(0, 150)}...</p>` : ''}
                    </div>
                    
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #92400e;">Their message:</h4>
                        <p style="margin: 0; color: #451a03;">"${message}"</p>
                    </div>
                    
                    ${helpTypes.length > 0 ? `
                    <div style="margin: 20px 0;">
                        <p style="font-weight: 600; margin-bottom: 10px;">They can help with:</p>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${helpTypes.map(type => `<li style="margin: 5px 0;">${type.replace('_', ' ')}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://collegefastforward.com/#Dashboard" 
                           style="background-color: #0021A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            View in Your Dashboard →
                        </a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">
                        This is the Gator network in action! 🧡💙
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">
                        You're receiving this because someone offered to help with your request on College Fast Forward.
                    </p>
                </div>
            `;

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: requestCreatorEmail,
                subject: emailSubject,
                body: emailBody
            });
            
            emailSent = true;
            console.log('✅ Email sent to:', requestCreatorEmail);
        } catch (emailErr) {
            console.error('❌ Email sending failed:', emailErr.message);
        }

        // Step 5: Update request metrics (CRITICAL for message counter)
        console.log('Step 5: Update request metrics');
        try {
            const request = await base44.asServiceRole.entities.JobRequest.get(requestId);
            console.log('📊 Current request state:', {
                id: request?.id,
                messages_count: request?.messages_count,
                offers_count: request?.offers_count
            });
            
            if (request) {
                const newMessagesCount = (request.messages_count || 0) + 1;
                const newOffersCount = (request.offers_count || 0) + 1;
                
                console.log('📈 Updating counts:', {
                    messages_count: `${request.messages_count || 0} → ${newMessagesCount}`,
                    offers_count: `${request.offers_count || 0} → ${newOffersCount}`
                });
                
                const updated = await base44.asServiceRole.entities.JobRequest.update(requestId, {
                    messages_count: newMessagesCount,
                    offers_count: newOffersCount,
                    last_activity_at: new Date().toISOString()
                });
                
                console.log('✅ Request metrics updated successfully:', {
                    id: updated?.id,
                    messages_count: updated?.messages_count,
                    offers_count: updated?.offers_count
                });
            } else {
                console.error('❌ Request not found:', requestId);
            }
        } catch (updateErr) {
            console.error('❌ FAILED to update metrics:', updateErr.message);
            console.error('Stack:', updateErr.stack);
        }

        // Step 6: If parent is helping, trigger boost for linked students
        console.log('Step 6: Check if parent boost should trigger');
        if (helperPersona === 'parent') {
            console.log('🚀 Parent helped student - triggering boost...');
            try {
                // Get helper's full user record to find linked students
                const helper = await base44.asServiceRole.entities.User.filter({ email: helperEmail });
                if (helper && helper.length > 0) {
                    const helperUser = helper[0];
                    console.log('Helper user found:', helperUser.id);
                    
                    // Trigger boost asynchronously (don't wait for response)
                    base44.asServiceRole.functions.invoke('boostStudentRequests', {
                        parentId: helperUser.id,
                        parentEmail: helperEmail,
                        actionType: 'help_offer_sent'
                    }).then(() => {
                        console.log('✅ Boost triggered successfully');
                    }).catch(err => {
                        console.error('❌ Boost failed (non-critical):', err.message);
                    });
                }
            } catch (boostErr) {
                console.log('⚠️ Could not trigger boost (non-critical):', boostErr.message);
            }
        }

        console.log('Step 7: Return success');
        return new Response(JSON.stringify({
            success: (messageCreated || emailSent) && helpOfferId !== null,
            messageCreated,
            emailSent,
            helpOfferCreated: helpOfferId !== null,
            messageId,
            helpOfferId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        console.error('Stack:', error.stack);
        return new Response(JSON.stringify({ 
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});