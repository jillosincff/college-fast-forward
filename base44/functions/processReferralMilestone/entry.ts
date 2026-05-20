import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * processReferralMilestone
 *
 * Called when a referred user hits the school-selection step (Screen 7) of onboarding.
 * Validates the referral is legitimate, marks it QUALIFIED, and credits the referrer +1 bonus token.
 *
 * Payload:
 *   referrerUserId  — from the ?r= param stored in localStorage during onboarding
 *   refereeEmailHash — SHA-256 hex of the referee's email (fraud-dedup key)
 *   schoolShortName  — school they just selected
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);

  const { referrerUserId, refereeEmailHash, schoolShortName } = await req.json();

  if (!referrerUserId || !refereeEmailHash) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // ── 1. Anti-fraud: check if this email hash has already been used as a referee ──
  const existingTracks = await base44.asServiceRole.entities.ReferralTrack.filter({
    referee_email_hash: refereeEmailHash,
    status: 'QUALIFIED',
  });

  if (existingTracks.length > 0) {
    return Response.json({
      success: false,
      message: 'This account has already been used in a referral.',
    });
  }

  // ── 2. Check if a PENDING track already exists for this referrer+hash pair ──
  const pendingTracks = await base44.asServiceRole.entities.ReferralTrack.filter({
    referrer_user_id: referrerUserId,
    referee_email_hash: refereeEmailHash,
  });

  // ── 3. Upsert the track record ──
  if (pendingTracks.length > 0) {
    await base44.asServiceRole.entities.ReferralTrack.update(pendingTracks[0].id, {
      status: 'QUALIFIED',
      school_short_name: schoolShortName || '',
      token_credited: true,
      credited_at: new Date().toISOString(),
    });
  } else {
    await base44.asServiceRole.entities.ReferralTrack.create({
      referrer_user_id: referrerUserId,
      referee_email_hash: refereeEmailHash,
      school_short_name: schoolShortName || '',
      status: 'QUALIFIED',
      token_credited: true,
      credited_at: new Date().toISOString(),
    });
  }

  // ── 4. Increment referrer's referral_bonus_tokens by +1 ──
  const referrerList = await base44.asServiceRole.entities.User.filter({ id: referrerUserId });
  if (referrerList.length === 0) {
    return Response.json({ error: 'Referrer not found' }, { status: 404 });
  }
  const referrer = referrerList[0];
  const currentTokens = referrer.referral_bonus_tokens || 0;

  await base44.asServiceRole.entities.User.update(referrerUserId, {
    referral_bonus_tokens: currentTokens + 1,
  });

  // ── 5. Log analytics event ──
  await base44.asServiceRole.entities.AnalyticsEvent.create({
    event_name: 'referral_milestone_qualified',
    user_id: referrerUserId,
    user_email: referrer.email || '',
    school_code: referrer.school_code || '',
    properties: {
      referee_school: schoolShortName,
      new_token_balance: currentTokens + 1,
    },
  });

  return Response.json({
    success: true,
    message: 'Referral qualified. Bonus token credited to referrer.',
    new_token_balance: currentTokens + 1,
  });
});