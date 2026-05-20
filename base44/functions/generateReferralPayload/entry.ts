import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const INDUSTRY_COPY = {
  finance: (school, url) =>
    `Yo, if you're tracking finance/IB recruiting cycles, check this out. CLiFF literally cracks open active ${school} alumni connections at elite advisory firms and drafts your warm networking scripts. Tap in here: ${url}`,
  tech: (school, url) =>
    `Heads up — if you're targeting SWE/PM roles and tired of the Handshake black hole, CLiFF maps ${school} alumni on hiring teams at actual tech companies and writes your outreach for you. Skip the waitlist: ${url}`,
  consulting: (school, url) =>
    `If you're recruiting for consulting and grinding cold apps, stop. CLiFF connects you to ${school} alumni at MBB + boutiques and generates your networking scripts. Use my link: ${url}`,
  marketing: (school, url) =>
    `If you're trying to break into brand/growth/marketing, CLiFF maps ${school} alumni at top agencies and consumer brands and writes your outreach scripts for hidden roles. Bypass the job board: ${url}`,
  default: (school, url) =>
    `Hey, if you're trying to bypass Handshake or the regular job boards, check this out. This AI agent CLiFF literally maps our school's alumni network and writes your outreach scripts for hidden jobs. Use my link to skip the waitlist: ${url}`,
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const base44 = createClientFromRequest(req);
  // Parse body BEFORE auth (body stream must be read before SDK consumes req internals)
  const body = await req.json().catch(() => ({}));
  const user = await base44.auth.me();
  const userId     = user?.id || body.userId || 'anon';
  const firstName  = body.userFirstName || user?.full_name?.split(' ')[0] || 'You';
  const school     = body.schoolShortName || user?.school_code || 'UF';
  const track      = (body.targetTrack || '').toLowerCase();

  const trackingUrl = `https://cff.dev/join?r=${userId}&campus=${encodeURIComponent(school)}`;

  const copyFn = INDUSTRY_COPY[track] || INDUSTRY_COPY.default;
  const smsPayload = copyFn(school, trackingUrl);

  // Log the share event
  await base44.asServiceRole.entities.AnalyticsEvent.create({
    event_name: 'referral_payload_generated',
    user_id: userId,
    properties: { school, track, url: trackingUrl },
  }).catch(() => {});

  return Response.json({
    success: true,
    shareLink: trackingUrl,
    smsPayload,
  });
});