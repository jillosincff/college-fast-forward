import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    console.log('🚀 sendInvite function called');

    try {
        const base44 = createClientFromRequest(req);
        
        console.log('📧 Parsing request body...');
        const { email, full_name, user_type, reason } = await req.json();
        console.log('📧 Request data:', { email, full_name, user_type, hasReason: !!reason });

        if (!email || !full_name || !user_type) {
            console.error('❌ Missing required fields', { email: !!email, full_name: !!full_name, user_type: !!user_type });
            return Response.json({ 
                success: false, 
                error: 'Missing required fields: email, full_name, user_type' 
            }, { status: 400, headers: corsHeaders });
        }

        console.log('💾 Creating InviteRequest entity...');
        
        // Map user_type to role (entity requires 'role' field)
        let mappedRole = 'parent'; // default
        if (user_type === 'uf_alumni') {
            mappedRole = 'alumni';
        } else if (user_type === 'uf_parent') {
            mappedRole = 'parent';
        }
        // Note: uf_student shouldn't normally hit this flow (they use @ufl.edu instant access)
        
        // Create an InviteRequest entity
        let inviteRequest;
        try {
            inviteRequest = await base44.asServiceRole.entities.InviteRequest.create({
                email,
                name: full_name,
                full_name,
                role: mappedRole,
                user_type,
                reason: reason || 'No reason provided',
                status: 'pending'
            });
            console.log('✅ InviteRequest created:', inviteRequest.id);
        } catch (dbError) {
            console.error('❌ CRITICAL: Failed to create InviteRequest entity:', dbError);
            console.error('Database error details:', JSON.stringify(dbError, null, 2));
            throw new Error('Failed to save invite request to database: ' + dbError.message);
        }

        // Send confirmation email to the requester
        const confirmationSubject = 'Your College Fast Forward Invite Request Received! 🐊';
        const confirmationBody = `Hi ${full_name},

Thank you for your interest in College Fast Forward!

We've received your invite request and our team will review it shortly. You'll receive an invite code via email once approved.

What happens next:
- Our team reviews your request (usually within 24-48 hours)
- You'll receive an email with your unique invite code
- Use that code to complete your registration

We're excited to have you join the Gator network!

Go Gators! 🐊🧡💙

College Fast Forward Team`;

        console.log(`📧 Attempting to send confirmation email to: ${email}`);
        
        let emailSent = false;
        let emailError = null;
        
        try {
            const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
                to: email,
                subject: confirmationSubject,
                body: confirmationBody,
                from_name: 'College Fast Forward'
            });
            console.log('✅ Confirmation email sent successfully:', emailResult);
            emailSent = true;
        } catch (error) {
            console.error(`❌ Failed to send confirmation email to ${email}:`, error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            emailError = error.message;
            // Don't throw - we still want to save the request even if email fails
        }

        // Get all admin users to notify them
        console.log('👥 Fetching admin users...');
        let adminUsers = [];
        try {
            // Fetch all users and filter for admins (User entity uses 'roles' array or 'role' string)
            const allUsers = await base44.asServiceRole.entities.User.list();
            adminUsers = allUsers.filter(u => 
                u.roles?.includes('admin') || u.role === 'admin'
            );
            console.log(`Found ${adminUsers.length} admin users`);
        } catch (adminError) {
            console.error('Failed to fetch admin users:', adminError);
            // Continue without admin notifications
        }

        // Send notification to all admins
        let adminNotificationsSent = 0;
        for (const admin of adminUsers) {
            const adminNotificationSubject = `New Invite Request: ${full_name} (${user_type})`;
            const adminNotificationBody = `A new invite request has been submitted:

Name: ${full_name}
Email: ${email}
User Type: ${user_type}

Reason:
${reason || 'No reason provided'}

Please review this request in the Admin Dashboard and approve/generate an invite code.`;

            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: admin.email,
                    subject: adminNotificationSubject,
                    body: adminNotificationBody,
                    from_name: 'College Fast Forward'
                });
                console.log(`✅ Admin notification sent to ${admin.email}`);
                adminNotificationsSent++;
            } catch (err) {
                console.error(`❌ Failed to notify admin ${admin.email}:`, err);
                console.error('Admin email error details:', JSON.stringify(err, null, 2));
            }
        }
        
        console.log(`📊 Summary: Request created, ${emailSent ? 'confirmation email sent' : 'confirmation email FAILED'}, ${adminNotificationsSent}/${adminUsers.length} admin notifications sent`);
        
        const message = emailSent 
            ? 'Invite request submitted successfully! Check your email for confirmation.'
            : 'Invite request submitted, but we had trouble sending the confirmation email. Our team will still review your request and contact you at ' + email;
        
        return new Response(JSON.stringify({ 
            success: true, 
            message,
            emailSent,
            adminNotificationsSent 
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in sendInvite function:', error);
        return new Response(JSON.stringify({ 
            success: false,
            error: error.message || 'Failed to process invite request' 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});