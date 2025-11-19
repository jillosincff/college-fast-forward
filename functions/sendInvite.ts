import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const base44 = createClientFromRequest(req);
        const { email, full_name, user_type, reason } = await req.json();

        if (!email || !full_name || !user_type || !reason) {
            return Response.json({ 
                success: false, 
                error: 'Missing required fields: email, full_name, user_type, reason' 
            }, { status: 400 });
        }

        // Create an InviteRequest entity
        await base44.asServiceRole.entities.InviteRequest.create({
            email,
            full_name,
            user_type,
            reason,
            status: 'pending'
        });

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

        await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: confirmationSubject,
            body: confirmationBody
        });

        // Get all admin users to notify them
        const adminUsers = await base44.asServiceRole.entities.User.filter({
            role: 'admin'
        });

        // Send notification to all admins
        for (const admin of adminUsers) {
            const adminNotificationSubject = `New Invite Request: ${full_name} (${user_type})`;
            const adminNotificationBody = `A new invite request has been submitted:

Name: ${full_name}
Email: ${email}
User Type: ${user_type}

Reason:
${reason}

Please review this request in the Admin Dashboard and approve/generate an invite code.`;

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: admin.email,
                subject: adminNotificationSubject,
                body: adminNotificationBody
            }).catch(err => {
                console.log(`Failed to notify admin ${admin.email}:`, err.message);
            });
        }
        
        console.log(`Invite request recorded and confirmation email sent to ${email}`);
        
        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Invite request submitted successfully! Check your email for confirmation.' 
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