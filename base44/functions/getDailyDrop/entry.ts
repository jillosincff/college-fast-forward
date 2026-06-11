import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Reset time: 4AM Eastern
function getDailyDropDate() {
  const now = new Date();
  // Convert to ET (UTC-4 or UTC-5)
  const etOffset = -4; // EDT (summer) — close enough
  const etNow = new Date(now.getTime() + etOffset * 60 * 60 * 1000);
  const hour = etNow.getUTCHours();
  // Before 4AM ET → still "yesterday's" drop date
  if (hour < 4) {
    etNow.setUTCDate(etNow.getUTCDate() - 1);
  }
  return etNow.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getNextResetTime() {
  const now = new Date();
  const etOffset = -4;
  const etNow = new Date(now.getTime() + etOffset * 60 * 60 * 1000);
  const nextReset = new Date(etNow);
  nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  nextReset.setUTCHours(4, 0, 0, 0);
  // Convert back to UTC
  return new Date(nextReset.getTime() - etOffset * 60 * 60 * 1000).toISOString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Fetch FRESH user data to ensure we have latest career_goals
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dropDate = getDailyDropDate();

    // Force refresh if requested via query param
    const forceRefresh = body.force_refresh === true;

    // ── 1. Check for a valid cached drop (skip if force refresh) ─────────
    if (!forceRefresh) {
      const existing = await base44.entities.UserDailyDrop.filter({
        user_id: user.id,
        drop_date: dropDate,
      });

      if (existing && existing.length > 0) {
        const drop = existing[0];
        console.log(`[getDailyDrop] Cache hit for ${user.email} on ${dropDate}`);
        return Response.json({
          success: true,
          slots: drop.slots || [],
          actioned_keys: drop.actioned_keys || [],
          drop_date: dropDate,
          drop_id: drop.id,
          from_cache: true,
        });
      }
    } else {
      console.log(`[getDailyDrop] Force refresh requested for ${user.email}`);
    }

    // ── 2. Generate a fresh daily drop ────────────────────────────────────
    console.log(`[getDailyDrop] Generating fresh drop for ${user.email} on ${dropDate}`);

    // Companies shown in the user's last 3 drops — exclude so jobs feel new each day
    const seenCompanies = new Set();
    try {
      const recentDrops = await base44.entities.UserDailyDrop.filter({ user_id: user.id }, '-created_date', 3);
      for (const d of recentDrops || []) {
        for (const s of d.slots || []) {
          if (s.company) seenCompanies.add(s.company.toLowerCase().replace(/[^a-z0-9]/g, ''));
        }
      }
    } catch (e) {
      console.warn('[getDailyDrop] Could not load recent drops:', e.message);
    }
    const isSeen = (name) => seenCompanies.has((name || '').toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Clear any stale drops for today (force refresh / duplicates) so the cache stays clean
    try {
      const staleToday = await base44.entities.UserDailyDrop.filter({ user_id: user.id, drop_date: dropDate });
      for (const d of staleToday || []) await base44.entities.UserDailyDrop.delete(d.id);
    } catch (e) {
      console.warn('[getDailyDrop] Could not clear stale drops:', e.message);
    }

    const goals = user.career_goals || {};
    const targetIndustries = (goals.target_industries || goals.industries || []).map(i => i.toLowerCase());
    const targetRole = goals.target_roles?.[0] || goals.role || '';
    const sizePref = goals.company_size_preference || 'all';
    const location = user.location_preference || user.location || '';

    // Normalize size pref → ordered array for the live search
    const sizeMap = {
      startup: ['startup', 'mid', 'large'],
      midmarket: ['mid', 'startup', 'large'],
      mid: ['mid', 'startup', 'large'],
      enterprise: ['large', 'mid', 'startup'],
      large: ['large', 'mid', 'startup'],
    };
    const sizeArray = sizeMap[sizePref] || ['large', 'mid', 'startup'];

    // Slots 1 & 2: Live web results (fresh, dynamic)
    let liveSlots = [];
    try {
      const liveRes = await Promise.race([
        base44.asServiceRole.functions.invoke('getLiveJobMatchesFn', {
          career_goals: {
            role: targetRole || (targetIndustries[0] ? `${targetIndustries[0]} analyst` : 'analyst'),
            industries: targetIndustries.map(i => i.charAt(0).toUpperCase() + i.slice(1)),
            locations: location ? [location] : [],
            company_size_preference: sizeArray,
          },
        }),
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 20000)),
      ]);
      const companies = liveRes?.companies || [];
      const freshLive = companies.filter(c => !isSeen(c.name));
      const orderedLive = [...freshLive, ...companies.filter(c => isSeen(c.name))];
      liveSlots = orderedLive.slice(0, 2).map(c => ({
        company: c.name,
        role: targetRole || `${targetIndustries[0] || 'Business'} Analyst`,
        jobDescription: c.hiring_description || `${c.name} is actively hiring for ${targetRole || 'entry-level'} roles.`,
        jobSource: `${c.name.toLowerCase().replace(/\s+/g, '')}.com/careers`,
        jobSourceCategory: 'B',
        companyTier: c.size === 'startup' ? 3 : c.size === 'mid' ? 2 : 1,
        isLiveResult: true,
        slotType: 'live',
        leadTier: 'target',
        alumniCount: 0,
        parentCount: 0,
      }));
    } catch (e) {
      console.warn('[getDailyDrop] Live fetch failed:', e.message);
    }

    // Slots 3 & 4: Curated pool from getPersonalizedNetworkCarousel
    let curatedSlots = [];
    let wildcardSlot = null;
    try {
      const carouselRes = await Promise.race([
        base44.asServiceRole.functions.invoke('getPersonalizedNetworkCarousel', {
          target_industries: targetIndustries,
          target_role: targetRole,
          company_size_preference: sizePref,
        }),
        new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 25000)),
      ]);

      const insiders = carouselRes?.priorityInsiders || [];
      const discoveries = carouselRes?.targetedDiscoveries || [];
      const allCurated = [...insiders, ...discoveries];

      // Deduplicate against live slots by company name
      const liveCompanyKeys = new Set(liveSlots.map(s => s.company.toLowerCase().replace(/[^a-z0-9]/g, '')));
      const dedupedAll = allCurated.filter(j => {
        const key = (j.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return !liveCompanyKeys.has(key);
      });
      // Prefer companies the user hasn't seen in recent drops
      const freshCurated = dedupedAll.filter(j => !isSeen(j.company));
      const deduped = [...freshCurated, ...dedupedAll.filter(j => isSeen(j.company))];

      // Slots 3 & 4: prioritize insider leads (they're highest value)
      curatedSlots = deduped.slice(0, 2).map(j => ({ ...j, slotType: 'curated' }));

      // Slot 5: Wildcard — pick a different company size tier to broaden horizons
      const wildcardTierPref = sizePref === 'startup' ? 1 : sizePref === 'enterprise' ? 3 : 2;
      const wildcardPool = deduped.filter(j => (j.companyTier || 1) === wildcardTierPref);
      const wildcardSource = wildcardPool.length > 2
        ? wildcardPool[2]
        : deduped[2] || null;

      if (wildcardSource) {
        wildcardSlot = { ...wildcardSource, slotType: 'wildcard' };
      }
    } catch (e) {
      console.warn('[getDailyDrop] Carousel fetch failed:', e.message);
    }

    // Assemble final 5 slots
    const slots = [
      ...liveSlots,
      ...curatedSlots,
      ...(wildcardSlot ? [wildcardSlot] : []),
    ].slice(0, 5);

    // Ensure at least 3 slots — pad from fallback if needed
    if (slots.length < 3) {
      const fallbackSlots = [
        { company: 'Deloitte', role: 'Business Analyst', jobDescription: 'Strategy and advisory associates across all US offices.', jobSource: 'deloitte.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Google', role: 'Associate Product Manager', jobDescription: 'APM program for new graduates across product and engineering.', jobSource: 'careers.google.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Ramp', role: 'Finance & Strategy Analyst', jobDescription: 'Series D fintech — real ownership from day one.', jobSource: 'ramp.com/careers', jobSourceCategory: 'B', companyTier: 3, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'JPMorgan Chase', role: 'Analyst Development Program', jobDescription: 'Rotational analyst program across banking, markets, and operations.', jobSource: 'careers.jpmorgan.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Salesforce', role: 'Associate Solution Engineer', jobDescription: 'New grad program blending tech, business, and customer strategy.', jobSource: 'salesforce.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Nike', role: 'Marketing Associate', jobDescription: 'Brand and digital marketing roles for early-career talent.', jobSource: 'jobs.nike.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Accenture', role: 'Consulting Analyst', jobDescription: 'Entry-level consulting across strategy, tech, and operations.', jobSource: 'accenture.com/careers', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Spotify', role: 'Associate, Strategy & Operations', jobDescription: 'Early-career roles in music-tech strategy and analytics.', jobSource: 'lifeatspotify.com', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Stripe', role: 'Business Operations Analyst', jobDescription: 'High-growth fintech — analytical roles for new grads.', jobSource: 'stripe.com/jobs', jobSourceCategory: 'B', companyTier: 2, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
        { company: 'Procter & Gamble', role: 'Brand Management Associate', jobDescription: 'Classic CPG brand-building track with real P&L ownership.', jobSource: 'pgcareers.com', jobSourceCategory: 'C', companyTier: 1, slotType: 'curated', leadTier: 'target', alumniCount: 0, parentCount: 0 },
      ];
      const existing_companies = new Set(slots.map(s => s.company.toLowerCase()));
      // Try unseen fallbacks first, then allow repeats if we still need slots
      const orderedFallbacks = [...fallbackSlots.filter(f => !isSeen(f.company)), ...fallbackSlots.filter(f => isSeen(f.company))];
      for (const fb of orderedFallbacks) {
        if (!existing_companies.has(fb.company.toLowerCase())) {
          slots.push(fb);
          existing_companies.add(fb.company.toLowerCase());
        }
        if (slots.length >= 5) break;
      }
    }

    // ── 3. Persist the drop ───────────────────────────────────────────────
    const newDrop = await base44.entities.UserDailyDrop.create({
      user_id: user.id,
      user_email: user.email,
      drop_date: dropDate,
      slots,
      actioned_keys: [],
      expires_at: getNextResetTime(),
    });

    console.log(`[getDailyDrop] Created drop for ${user.email}: ${slots.length} slots`);
    return Response.json({
      success: true,
      slots,
      actioned_keys: [],
      drop_date: dropDate,
      drop_id: newDrop.id,
      from_cache: false,
    });

  } catch (error) {
    console.error('[getDailyDrop] Error:', error.message);
    return Response.json({ error: error.message, slots: [] }, { status: 500 });
  }
});