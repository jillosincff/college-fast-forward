import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        console.log('User attempting approval:', { email: user?.email, role: user?.role, roles: user?.roles, id: user?.id });
        
        if (!user) {
            return Response.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        const isAdmin = user.role === 'admin' || user.roles?.includes('admin');
        if (!isAdmin) {
            return Response.json({ 
                error: 'Unauthorized - Admin access required',
                debug: { email: user.email, role: user.role, roles: user.roles }
            }, { status: 403 });
        }

        const { request_id, action } = await req.json(); // action: 'approve' or 'reject'

        // Get the request
        console.log('Fetching invite request with id:', request_id);
        let requests;
        try {
            requests = await base44.asServiceRole.entities.InviteRequest.filter({ id: request_id });
            console.log('Filter result:', requests?.length, 'requests found');
        } catch (filterError) {
            console.error('Error fetching invite request:', filterError.message, filterError.stack);
            return Response.json({ 
                error: 'Failed to fetch invite request', 
                details: filterError.message 
            }, { status: 500 });
        }
        
        if (!requests || requests.length === 0) {
            return Response.json({ error: 'Request not found', request_id }, { status: 404 });
        }

        const inviteRequestRaw = requests[0];
        console.log('Raw invite request object:', JSON.stringify(inviteRequestRaw));
        
        // SDK filter returns objects with data nested inside - extract the actual data
        // The structure is: { id, data: { email, status, ... }, ... }
        const inviteRequest = {
            id: inviteRequestRaw.id,
            ...(inviteRequestRaw.data || inviteRequestRaw)
        };
        console.log('Processed invite request:', JSON.stringify(inviteRequest));
        
        // CRITICAL: Skip if already approved to prevent duplicate emails/codes
        if (inviteRequest.status === 'approved') {
            console.log('Request already approved, skipping:', request_id);
            return Response.json({
                success: true,
                message: 'Already approved',
                code: inviteRequest.invite_code_generated,
                alreadyProcessed: true
            });
        }

        if (action === 'approve') {
            // Determine role from either new 'role' field or legacy 'user_type' field
            let assignedRole = 'parent'; // default
            let inviteType = 'admin_to_parent';
            
            // Check legacy user_type field first (older requests like Carole Seago)
            if (inviteRequest.user_type) {
                if (inviteRequest.user_type === 'uf_alumni') {
                    assignedRole = 'alumni';
                    inviteType = 'admin_to_alumni';
                } else if (inviteRequest.user_type === 'uf_parent') {
                    assignedRole = 'parent';
                    inviteType = 'admin_to_parent';
                } else if (inviteRequest.user_type === 'uf_student') {
                    assignedRole = 'gator';
                    inviteType = 'admin_to_gator';
                }
            }
            
            // New role field overrides if present
            if (inviteRequest.role) {
                if (inviteRequest.role === 'alumni') {
                    assignedRole = 'alumni';
                    inviteType = 'admin_to_alumni';
                } else if (inviteRequest.role === 'parent') {
                    assignedRole = 'parent';
                    inviteType = 'admin_to_parent';
                }
            }
            
            console.log('Role determination:', { 
                legacyUserType: inviteRequest.user_type, 
                newRole: inviteRequest.role, 
                finalRole: assignedRole,
                inviteType 
            });

            // Generate invite code with role prefix
            const prefix = assignedRole === 'alumni' ? 'ALUM' : (assignedRole === 'gator' ? 'GATOR' : 'PRNT');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let suffix = '';
            for (let i = 0; i < 6; i++) {
                suffix += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const code = `${prefix}-${suffix}`;

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days for admin-approved codes

            // Create invite code with role field
            // CRITICAL: user.id is required - use a fallback admin ID if not available
            const inviterId = user.id || 'admin-system';
            console.log('Creating invite code with:', { 
                code, 
                inviteType, 
                assignedRole, 
                inviterId, 
                userEmail: user.email,
                userId: user.id 
            });
            
            try {
                const inviteCodeData = {
                    code: code,
                    inviter_id: inviterId,
                    inviter_email: user.email || 'jill@uffastforward.com',
                    inviter_name: user.full_name || 'CFF Admin Team',
                    invite_type: inviteType,
                    role: assignedRole,
                    status: 'active',
                    expires_at: expiresAt.toISOString()
                };
                console.log('InviteCode create payload:', JSON.stringify(inviteCodeData));
                
                await base44.asServiceRole.entities.InviteCode.create(inviteCodeData);
            } catch (createError) {
                console.error('Failed to create InviteCode:', createError.message);
                console.error('Create error stack:', createError.stack);
                console.error('Create error full:', JSON.stringify(createError, Object.getOwnPropertyNames(createError)));
                return Response.json({ 
                    error: 'Failed to create invite code', 
                    details: createError.message,
                    stack: createError.stack
                }, { status: 500 });
            }

            console.log('Invite code created successfully:', code);
            
            // Update request status - CRITICAL: This MUST succeed or we'll have duplicates
            console.log('Updating invite request status to approved for request_id:', request_id);
            try {
                const updateResult = await base44.asServiceRole.entities.InviteRequest.update(request_id, {
                    status: 'approved',
                    approved_by: user.email,
                    invite_code_generated: code
                });
                console.log('InviteRequest update result:', JSON.stringify(updateResult));
            } catch (updateError) {
                console.error('CRITICAL: Failed to update InviteRequest status:', updateError.message, updateError.stack);
                // This is a critical failure - return error so admin knows
                return Response.json({
                    success: false,
                    error: 'Invite code created but failed to update request status. Please manually mark as approved.',
                    code: code,
                    details: updateError.message
                }, { status: 500 });
            }

            // Send approval email
            const emailSubject = '🐊 Welcome to College Fast Forward!';
            const emailBody = `
                <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #0021A5; font-size: 28px; margin-bottom: 10px;">🧡💙 You're In! 🐊</h1>
                        <p style="color: #64748b; font-size: 16px;">Your invite to College Fast Forward has been approved</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                        <p style="color: white; font-size: 14px; margin: 0 0 10px 0;">Your Invite Code</p>
                        <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 0; font-family: monospace;">${code}</p>
                    </div>
                    
                    <p style="color: #334155; font-size: 14px; margin-bottom: 20px;">
                        You're joining as: <strong style="color: ${assignedRole === 'alumni' ? '#0021A5' : '#FA4616'};">
                            ${assignedRole === 'alumni' ? '🎓 UF Alumni' : '👨‍👩‍👧 UF Parent'}
                        </strong>
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.collegefastforward.com" 
                           style="background: #FA4616; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                            Join the Network →
                        </a>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 10px 0;">What's Next?</h3>
                        <ol style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                            <li>Click the button above or visit collegefastforward.com</li>
                            <li>Enter your invite code: <strong>${code}</strong></li>
                            <li>Sign in with Google (use @ufl.edu for students)</li>
                            <li>Complete your profile and start connecting!</li>
                        </ol>
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 40px;">
                        This code expires in 30 days. Questions? Reply to this email.<br/>
                        Go Gators! 🐊🧡💙
                    </p>
                </div>
            `;

            // Send email directly via SendGrid (Base44 Core.SendEmail only works for registered users)
            try {
                const recipientEmail = inviteRequest.email;
                if (!recipientEmail) {
                    console.error('No email found in invite request:', JSON.stringify(inviteRequest));
                    throw new Error('No email address found in invite request');
                }
                console.log('Sending approval email to:', recipientEmail);
                
                const apiKey = Deno.env.get('SENDGRID_API_KEY');
                if (!apiKey) {
                    throw new Error('SENDGRID_API_KEY not configured');
                }

                const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        personalizations: [{
                            to: [{ email: inviteRequest.email }]
                        }],
                        from: { 
                            email: 'jill@uffastforward.com',
                            name: 'College Fast Forward'
                        },
                        subject: emailSubject,
                        content: [{
                            type: 'text/html',
                            value: emailBody
                        }]
                    })
                });

                if (!sendGridResponse.ok) {
                    const errorText = await sendGridResponse.text();
                    console.error('SendGrid error response:', errorText);
                    console.error('SendGrid status:', sendGridResponse.status);
                    throw new Error(`SendGrid error (${sendGridResponse.status}): ${errorText}`);
                }

                console.log('✅ Email sent successfully via SendGrid');
            } catch (emailError) {
                console.error('❌ Failed to send email:', emailError);
                console.error('Email error details:', emailError.message, emailError.stack);
                return Response.json({
                    success: true,
                    warning: 'Invite approved but email failed to send',
                    code: code,
                    emailError: emailError.message
                });
            }

            console.log('📤 Returning success response');
            return Response.json({
                success: true,
                message: 'Request approved and invite sent!',
                code: code
            });

        } else if (action === 'reject') {
            await base44.asServiceRole.entities.InviteRequest.update(request_id, {
                status: 'rejected',
                approved_by: user.email
            });

            return Response.json({
                success: true,
                message: 'Request rejected'
            });
        } else {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('🚨 OUTER CATCH - Error processing invite request:', error);
        console.error('Error stack:', error.stack);
        return Response.json({ 
            error: 'Failed to process request',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});