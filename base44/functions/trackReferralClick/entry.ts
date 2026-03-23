import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const url = new URL(req.url);
        const linkToken = url.pathname.split('/').pop();
        
        if (!linkToken) {
            return new Response('Invalid link', { status: 400 });
        }

        // Find the referral link
        const referralLinks = await base44.entities.ReferralLink.filter({ 
            link_token: linkToken 
        });
        
        if (!referralLinks || referralLinks.length === 0) {
            return new Response('Link not found', { status: 404 });
        }

        const referralLink = referralLinks[0];

        // Check if link has expired
        if (new Date() > new Date(referralLink.expires_at)) {
            return new Response('Link has expired', { status: 410 });
        }

        // Track the click event
        await base44.entities.ReferralEvent.create({
            link_id: referralLink.id,
            event_type: 'clicked',
            occurred_at: new Date().toISOString(),
            metadata: {
                user_agent: req.headers.get('user-agent') || '',
                referrer: req.headers.get('referer') || '',
                ip_address: req.headers.get('x-forwarded-for') || 'unknown'
            }
        });

        // Update click count
        await base44.entities.ReferralLink.update(referralLink.id, {
            click_count: (referralLink.click_count || 0) + 1
        });

        // Redirect to the original request with invite context
        const redirectUrl = `https://collegefastforward.com/#SixDegrees?id=${referralLink.student_request_id}&invite=${linkToken}`;
        
        return Response.redirect(redirectUrl, 302);

    } catch (error) {
        console.error('Track referral click error:', error);
        return new Response('Internal server error', { status: 500 });
    }
});