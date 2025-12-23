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

        const { request_id, action } = await req.json();
        console.log('Processing request:', { request_id, action });

        // Get the request
        let requests;
        try {
            requests = await base44.asServiceRole.entities.InviteRequest.filter({ id: request_id });
            console.log('Filter result:', requests?.length, 'requests found');
        } catch (filterError) {
            console.error('Error fetching invite request:', filterError.message);
            return Response.json({ 
                error: 'Failed to fetch invite request', 
                details: filterError.message 
            }, { status: 500 });
        }
        
        if (!requests || requests.length === 0) {
            return Response.json({ error: 'Request not found', request_id }, { status: 404 });
        }

        const raw = requests[0];
        console.log('Raw request object keys:', Object.keys(raw));
        console.log('Raw request:', JSON.stringify(raw));
        
        // Extract data - SDK returns { id, data: {...} } structure
        const data = raw.data || raw;
        const requestId = raw.id || request_id;
        const email = data.email;
        const status = data.status;
        const userType = data.user_type;
        const role = data.role;
        
        console.log('Extracted fields:', { requestId, email, status, userType, role });
        
        if (status === 'approved') {
            console.log('Request already approved');
            return Response.json({
                success: true,
                message: 'Already approved',
                code: data.invite_code_generated,
                alreadyProcessed: true
            });
        }

        if (action === 'approve') {
            // Determine role
            let assignedRole = 'parent';
            let inviteType = 'admin_to_parent';
            
            if (userType === 'uf_alumni' || role === 'alumni') {
                assignedRole = 'alumni';
                inviteType = 'admin_to_alumni';
            } else if (userType === 'uf_student') {
                assignedRole = 'gator';
                inviteType = 'admin_to_gator';
            }
            
            console.log('Role determination:', { userType, role, assignedRole, inviteType });

            // Generate invite code
            const prefix = assignedRole === 'alumni' ? 'ALUM' : (assignedRole === 'gator' ? 'GATOR' : 'PRNT');
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let suffix = '';
            for (let i = 0; i < 6; i++) {
                suffix += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            const code = `${prefix}-${suffix}`;

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            // Create invite code
            const inviterId = user.id || 'admin-system';
            console.log('Creating invite code:', { code, inviterId });
            
            try {
                await base44.asServiceRole.entities.InviteCode.create({
                    code: code,
                    inviter_id: inviterId,
                    inviter_email: user.email || 'admin@collegefastforward.com',
                    inviter_name: user.full_name || 'CFF Admin',
                    invite_type: inviteType,
                    role: assignedRole,
                    status: 'active',
                    expires_at: expiresAt.toISOString()
                });
                console.log('InviteCode created successfully');
            } catch (createError) {
                console.error('Failed to create InviteCode:', createError.message);
                return Response.json({ 
                    error: 'Failed to create invite code', 
                    details: createError.message
                }, { status: 500 });
            }

            // Update request status - include role field since it's required by the schema
            try {
                await base44.asServiceRole.entities.InviteRequest.update(requestId, {
                    status: 'approved',
                    approved_by: user.email,
                    invite_code_generated: code,
                    role: assignedRole  // Required field - backfill from determined role
                });
                console.log('InviteRequest updated successfully');
            } catch (updateError) {
                console.error('Failed to update InviteRequest:', updateError.message);
                console.error('Error data:', JSON.stringify(updateError));
                return Response.json({
                    success: false,
                    error: 'Code created but failed to update request',
                    code: code,
                    details: updateError.message
                }, { status: 500 });
            }

            // Send email
            if (!email) {
                console.error('No email found');
                return Response.json({
                    success: true,
                    warning: 'Approved but no email to send to',
                    code: code
                });
            }

            try {
                const apiKey = Deno.env.get('SENDGRID_API_KEY');
                if (!apiKey) {
                    throw new Error('SENDGRID_API_KEY not configured');
                }

                const emailBody = `
                    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #0021A5;">🐊 You're In!</h1>
                        <p>Your invite to College Fast Forward has been approved.</p>
                        <div style="background: linear-gradient(135deg, #0021A5, #FA4616); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                            <p style="color: white; margin: 0 0 10px 0;">Your Invite Code</p>
                            <p style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 3px; margin: 0; font-family: monospace;">${code}</p>
                        </div>
                        <p>Role: <strong>${assignedRole === 'alumni' ? '🎓 UF Alumni' : '👨‍👩‍👧 UF Parent'}</strong></p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://www.collegefastforward.com" style="background: #FA4616; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Join Now →</a>
                        </div>
                        <p style="color: #94a3b8; font-size: 13px;">Code expires in 30 days. Go Gators! 🐊</p>
                    </div>
                `;

                const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        personalizations: [{ to: [{ email: email }] }],
                        from: { email: 'jill@uffastforward.com', name: 'College Fast Forward' },
                        subject: '🐊 Welcome to College Fast Forward!',
                        content: [{ type: 'text/html', value: emailBody }]
                    })
                });

                if (!resp.ok) {
                    const errText = await resp.text();
                    console.error('SendGrid error:', resp.status, errText);
                    throw new Error(`SendGrid error: ${resp.status}`);
                }
                console.log('Email sent successfully');
            } catch (emailError) {
                console.error('Email failed:', emailError.message);
                return Response.json({
                    success: true,
                    warning: 'Approved but email failed',
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
            await base44.asServiceRole.entities.InviteRequest.update(requestId, {
                status: 'rejected',
                approved_by: user.email
            });
            return Response.json({ success: true, message: 'Request rejected' });
        } else {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('OUTER ERROR:', error.message, error.stack);
        return Response.json({ 
            error: 'Failed to process request',
            details: error.message
        }, { status: 500 });
    }
});