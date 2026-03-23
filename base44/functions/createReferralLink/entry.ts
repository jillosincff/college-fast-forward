import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        // Auth check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const currentUser = await base44.auth.me();
        if (!currentUser) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Parse request body
        const body = await req.json();
        const { studentRequestId, requestTitle, studentName, studentEmail } = body;

        // Generate unique token and short URL
        const linkToken = crypto.randomUUID();
        const shortUrl = `https://collegefastforward.com/r/${linkToken}`;

        // Create the referral link
        const referralLink = await base44.entities.ReferralLink.create({
            helper_user_id: currentUser.id,
            student_request_id: studentRequestId,
            request_title: requestTitle,
            student_name: studentName,
            student_email: studentEmail,
            link_token: linkToken,
            short_url: shortUrl,
            status: 'active',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            click_count: 0,
            connection_count: 0,
            success_count: 0
        });

        // If user is a parent, trigger badge & notification flow
        const isParent = currentUser.persona === 'parent' || currentUser.roles?.includes('parent');
        if (isParent && currentUser.family_group_id) {
            try {
                // Call handleParentInvite to grant badges and send notifications
                const inviteResponse = await fetch(`${new URL(req.url).origin}/handleParentInvite`, {
                    method: 'POST',
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        invite_id: referralLink.id,
                        parent_email: currentUser.email
                    })
                });

                if (!inviteResponse.ok) {
                    console.error('Failed to handle parent invite:', await inviteResponse.text());
                }
            } catch (err) {
                console.error('Error calling handleParentInvite:', err);
                // Don't block the main flow
            }
        }

        return new Response(JSON.stringify({
            success: true,
            link: referralLink,
            shortUrl: shortUrl
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error('Create referral link error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
});