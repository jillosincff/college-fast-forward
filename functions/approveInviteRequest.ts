import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
        const requests = await base44.asServiceRole.entities.InviteRequest.filter({ id: request_id });
        if (!requests || requests.length === 0) {
            return Response.json({ error: 'Request not found' }, { status: 404 });
        }

        const inviteRequest = requests[0];

        if (action === 'approve') {
            // Generate invite code
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days for admin-approved codes

            // Determine invite type based on requested role
            const inviteTypeMap = {
                'student': 'parent_to_student',
                'parent': 'student_to_parent', 
                'alumni': 'alum_to_student'
            };
            const requestedRole = inviteRequest.requested_role || 'parent';
            const inviteType = inviteTypeMap[requestedRole.toLowerCase()] || 'parent_to_student';

            // Create invite code
            await base44.asServiceRole.entities.InviteCode.create({
                code: code,
                inviter_id: user.id,
                inviter_email: 'admin@collegefastforward.com',
                inviter_name: 'CFF Admin Team',
                invite_type: inviteType,
                status: 'active',
                expires_at: expiresAt.toISOString()
            });

            // Update request status
            await base44.asServiceRole.entities.InviteRequest.update(request_id, {
                status: 'approved',
                approved_by: user.email,
                invite_code_generated: code
            });

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
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${req.headers.get('origin') || 'https://www.collegefastforward.com'}/#InviteRequired?code=${code}" 
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
                console.log('Sending approval email to:', inviteRequest.email);
                
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
                            email: 'noreply@collegefastforward.com',
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
                    throw new Error(`SendGrid error: ${errorText}`);
                }

                console.log('Email sent successfully via SendGrid');
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                console.error('Email error details:', emailError.message, emailError.stack);
                return Response.json({
                    success: true,
                    warning: 'Invite approved but email failed to send',
                    code: code,
                    emailError: emailError.message
                });
            }

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
        console.error('Error processing invite request:', error);
        return Response.json({ 
            error: 'Failed to process request',
            details: error.message
        }, { status: 500 });
    }
});