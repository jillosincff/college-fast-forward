import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function generateRandomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Reuse an existing active text-referral code for this student
    const existing = await base44.asServiceRole.entities.InviteCode.filter({
      inviter_id: user.id,
      invite_type: 'gator_to_parent',
      description: 'text_referral_3day',
      status: 'active',
    });

    let code;
    if (existing && existing.length > 0) {
      code = existing[0].code;
    } else {
      // Generate a unique code
      let attempts = 0;
      while (attempts < 10) {
        const candidate = generateRandomCode();
        const dupes = await base44.asServiceRole.entities.InviteCode.filter({ code: candidate });
        if (dupes.length === 0) { code = candidate; break; }
        attempts++;
      }
      if (!code) return Response.json({ error: 'Failed to generate code' }, { status: 500 });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      await base44.asServiceRole.entities.InviteCode.create({
        code,
        inviter_id: user.id,
        inviter_email: user.email,
        inviter_name: user.full_name || user.email,
        invite_type: 'gator_to_parent',
        role: 'parent',
        description: 'text_referral_3day',
        status: 'active',
        max_uses: 2,
        current_uses: 0,
        expires_at: expiresAt.toISOString(),
      });
    }

    const origin = Deno.env.get('APP_BASE_URL') || 'https://collegefastforward.com';
    const link = `${origin}/#/GatorAuth?pref=${code}&role=parent`;
    const firstName = (user.full_name || '').split(' ')[0] || 'Your student';
    const smsBody = `Hey! I'm using CliFF (College Fast Forward) for my job search. Can you join as a parent? It takes 2 minutes and helps me get warm intros to companies. Sign up here: ${link}`;

    return Response.json({ success: true, code, link, sms_body: smsBody, first_name: firstName });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});