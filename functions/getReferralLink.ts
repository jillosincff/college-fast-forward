import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { v4 as uuidv4 } from 'npm:uuid';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { data: existingReferrals } = await base44.asServiceRole.entities.UserReferral.filter({ user_id: user.id }, '', 1);

        let referralCode;
        if (existingReferrals && existingReferrals.length > 0) {
            referralCode = existingReferrals[0].referral_code;
        } else {
            referralCode = uuidv4().split('-')[0]; // A short, unique code
            await base44.asServiceRole.entities.UserReferral.create({
                user_id: user.id,
                referral_code: referralCode,
            });
        }

        const appUrl = 'https://www.collegefastforward.com';
        const referralUrl = `${appUrl}/#LandingPage?ref=${referralCode}`;

        return new Response(JSON.stringify({ url: referralUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error in getReferralLink:', error);
        return new Response(JSON.stringify({ error: 'Could not generate referral link.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});