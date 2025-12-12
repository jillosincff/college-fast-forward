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
            const inviteType = inviteTypeMap[inviteRequest.email.toLowerCase().trim()] || 'parent_to_student';

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

            // Note: Cannot send email to users not yet in the app (Base44 restriction)
            // Admin must manually share the code
            return Response.json({
                success: true,
                message: 'Invite code generated - share it with the user manually',
                code: code,
                user_email: inviteRequest.email,
                manual_share: true
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