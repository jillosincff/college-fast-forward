import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple token decoding
function decodeToken(token) {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ success: false, error: 'invalid_link' });
    }

    // Decode and validate token
    const payload = decodeToken(token);
    
    if (!payload) {
      return Response.json({ success: false, error: 'invalid_link' });
    }

    // Check expiration
    if (payload.exp && Date.now() > payload.exp) {
      return Response.json({ success: false, error: 'expired' });
    }

    // Track that the link was opened
    try {
      // Find and update the referral record
      const referrals = await base44.asServiceRole.entities.Referral.filter({ 
        referral_token: token 
      });

      if (referrals && referrals.length > 0) {
        await base44.asServiceRole.entities.Referral.update(referrals[0].id, {
          link_opened_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.log('Could not update referral record:', e);
    }

    // Track analytics
    try {
      await base44.analytics.track({
        eventName: 'referral_link_opened',
        properties: {
          question_id: payload.q,
          referrer_id: payload.r
        }
      });
    } catch (e) {
      console.log('Analytics tracking failed:', e);
    }

    return Response.json({ 
      success: true,
      questionId: payload.q,
      referrerId: payload.r,
      referrerName: payload.rn,
      referrerEmail: payload.re
    });

  } catch (error) {
    console.error('Error validating token:', error);
    return Response.json({ success: false, error: 'invalid_link' });
  }
});