import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ── CLIFF Location Intelligence — THE single shared location evaluator. ──────
// Every recommendation system (Daily Drop, Best Moves, Decision Engine,
// Discovery, Best Path) calls this instead of implementing its own rules.
//
// Input:  { jobs: [{ key, location, title }], log_context?: string }
//         Pass jobs: [] to get only the preference summary.
// Output: { has_preferences, strict, remote_preference, preferred_labels,
//           evaluations: [{ key, location_match, location_reason,
//             requires_relocation, remote_match, hard_constraint_violation,
//             ranking_adjustment, display_explanation }] }
// ranking_adjustment is internal for ordering — never show it to students.

const STATE_NAMES: Record<string, string> = {
  AL:'alabama',AK:'alaska',AZ:'arizona',AR:'arkansas',CA:'california',CO:'colorado',
  CT:'connecticut',DE:'delaware',FL:'florida',GA:'georgia',HI:'hawaii',ID:'idaho',
  IL:'illinois',IN:'indiana',IA:'iowa',KS:'kansas',KY:'kentucky',LA:'louisiana',
  ME:'maine',MD:'maryland',MA:'massachusetts',MI:'michigan',MN:'minnesota',MS:'mississippi',
  MO:'missouri',MT:'montana',NE:'nebraska',NV:'nevada',NH:'new hampshire',NJ:'new jersey',
  NM:'new mexico',NY:'new york',NC:'north carolina',ND:'north dakota',OH:'ohio',OK:'oklahoma',
  OR:'oregon',PA:'pennsylvania',RI:'rhode island',SC:'south carolina',SD:'south dakota',
  TN:'tennessee',TX:'texas',UT:'utah',VT:'vermont',VA:'virginia',WA:'washington',
  WV:'west virginia',WI:'wisconsin',WY:'wyoming',DC:'district of columbia',
};
const NAME_TO_ABBR: Record<string, string> = {};
for (const [abbr, name] of Object.entries(STATE_NAMES)) NAME_TO_ABBR[name] = abbr.toLowerCase();

// Short tokens (state abbreviations) must match as whole words — "fl" must not
// match "buffalo". Longer tokens use substring matching.
function tokenHit(loc: string, token: string): boolean {
  if (!token) return false;
  const t = token.trim();
  if (t.length <= 3) {
    const safe = t.replace(/[^a-z0-9]/g, '');
    if (!safe) return false;
    return new RegExp(`\\b${safe}\\b`).test(loc);
  }
  return loc.includes(t);
}

function buildPrefs(user: any, memories: any[]) {
  const prefs: any = {
    tokens: [] as string[], labels: [] as string[], excluded: [] as string[],
    remote: user.remote_preference || 'unknown',
    relocation: user.relocation_openness || 'unknown',
    flexibility: user.location_flexibility || '',
    types: Array.isArray(user.location_preference_type) ? user.location_preference_type : [],
  };
  const addToken = (v: any, into: string[]) => {
    v = (v || '').toLowerCase().trim();
    if (v && !into.includes(v)) into.push(v);
  };
  const addStateForms = (st: string, into: string[]) => {
    addToken(st, into);
    const full = STATE_NAMES[st.toUpperCase()];
    if (full) addToken(full, into);
    const abbr = NAME_TO_ABBR[st.toLowerCase()];
    if (abbr) addToken(abbr, into);
  };

  // Structured profile fields are authoritative
  for (const l of (Array.isArray(user.preferred_locations) ? user.preferred_locations : [])) {
    if (!l) continue;
    const label = l.display_label || l.city || l.metro || l.state || '';
    if (label && !prefs.labels.includes(label)) prefs.labels.push(label);
    addToken(l.display_label, prefs.tokens);
    addToken(l.city, prefs.tokens);
    addToken(l.metro, prefs.tokens);
    if (l.state) addStateForms(String(l.state), prefs.tokens);
  }

  // Location memories: explicit statements override inferred/behavioral ones
  const locMems = (memories || []).filter((m: any) => m.category === 'preferred_locations');
  const explicit = locMems.filter((m: any) => m.source === 'explicit' || m.pinned);
  const usable = explicit.length ? explicit : locMems.filter((m: any) => (m.confidence || 0) >= 50);
  for (const m of usable) {
    const v = (m.value || '').toLowerCase().trim();
    if (!v || v === 'near my school' || v === 'near home') continue;
    addToken(v, prefs.tokens);
    if (NAME_TO_ABBR[v] || STATE_NAMES[v.toUpperCase()]) addStateForms(v, prefs.tokens);
    if (!prefs.labels.some((l: string) => l.toLowerCase() === v)) prefs.labels.push(m.value);
  }
  for (const m of (memories || []).filter((m: any) =>
    m.category === 'excluded_locations' && (m.source === 'explicit' || m.pinned || (m.confidence || 0) >= 70))) {
    addToken(m.value, prefs.excluded);
    const v = (m.value || '').toLowerCase().trim();
    if (NAME_TO_ABBR[v] || STATE_NAMES[v.toUpperCase()]) addStateForms(v, prefs.excluded);
  }
  if (prefs.remote === 'unknown') {
    const rm = (memories || []).find((m: any) => m.category === 'remote_preference' && (m.source === 'explicit' || m.pinned));
    if (rm && ['required', 'preferred', 'acceptable', 'not_preferred'].includes(rm.value)) prefs.remote = rm.value;
  }

  prefs.strict = prefs.flexibility === 'stay' || prefs.relocation === 'no';
  prefs.broad = prefs.types.includes('nationwide') || prefs.types.includes('flexible');
  prefs.unsure = prefs.types.includes('unknown');
  prefs.hasTokens = prefs.tokens.length > 0;
  prefs.hasPreferences = prefs.hasTokens || prefs.excluded.length > 0 || prefs.remote !== 'unknown' || prefs.broad || prefs.types.length > 0;
  return prefs;
}

function evaluateJob(job: any, prefs: any) {
  const loc = (job.location || '').toLowerCase().trim();
  const isRemote = /\bremote\b/.test(loc) || /\bremote\b/.test((job.title || '').toLowerCase());
  const out: any = {
    key: job.key,
    location_match: 'unknown',
    location_reason: '',
    requires_relocation: false,
    remote_match: isRemote,
    hard_constraint_violation: false,
    ranking_adjustment: 0,
    display_explanation: '',
  };
  const labels = prefs.labels.join(' / ');

  // Explicit "avoid" always wins (unless the role is remote — location moot)
  const ex = loc ? prefs.excluded.find((t: string) => tokenHit(loc, t)) : null;
  if (ex && !isRemote) {
    out.location_match = 'mismatch';
    out.hard_constraint_violation = true;
    out.ranking_adjustment = -6;
    out.location_reason = `Located in ${job.location}, which you asked me to avoid.`;
    out.display_explanation = `I'd skip this — you asked me to avoid ${ex}.`;
    return out;
  }

  // Remote required → clearly on-site roles are out
  if (prefs.remote === 'required') {
    if (isRemote) {
      out.location_match = 'strong';
      out.ranking_adjustment = 2;
      out.location_reason = 'Remote role — you require remote.';
      out.display_explanation = 'Remote, which you marked as required.';
      return out;
    }
    if (!loc) {
      out.location_reason = 'No location listed — attendance requirement unclear.';
      return out;
    }
    out.location_match = 'mismatch';
    out.hard_constraint_violation = true;
    out.ranking_adjustment = -6;
    out.location_reason = `On-site in ${job.location} — you require remote.`;
    out.display_explanation = `I'd skip this — it's on-site in ${job.location} and you need remote.`;
    return out;
  }

  if (isRemote) {
    if (prefs.remote === 'preferred') {
      out.location_match = 'strong';
      out.ranking_adjustment = 2;
      out.location_reason = 'Remote role — you marked remote as ideal.';
      out.display_explanation = 'Remote, which you marked as ideal.';
    } else if (prefs.remote === 'not_preferred') {
      out.location_match = 'tradeoff';
      out.ranking_adjustment = -1;
      out.location_reason = 'Remote role — you said you prefer in-person.';
      out.display_explanation = 'Remote — you said you prefer in-person.';
    } else {
      out.location_match = 'acceptable';
      out.ranking_adjustment = 1;
      out.location_reason = 'Remote role — works from anywhere.';
      out.display_explanation = 'Remote — works from anywhere.';
    }
    return out;
  }

  if (!loc) {
    out.location_reason = 'No location listed.';
    return out;
  }

  if (prefs.hasTokens) {
    const hit = prefs.tokens.find((t: string) => tokenHit(loc, t));
    if (hit) {
      const label = prefs.labels.find((l: string) =>
        l.toLowerCase().includes(hit) || hit.includes(l.toLowerCase())) || hit;
      out.location_match = 'strong';
      out.ranking_adjustment = 2;
      out.location_reason = `In ${job.location} — matches your ${label} preference.`;
      out.display_explanation = `Matches your ${label} preference.`;
      return out;
    }
    out.requires_relocation = true;
    if (prefs.strict) {
      out.location_match = 'mismatch';
      out.hard_constraint_violation = true;
      out.ranking_adjustment = -6;
      out.location_reason = `In ${job.location} — outside the locations you asked me to stay in (${labels}).`;
      out.display_explanation = `I'd skip this — it's in ${job.location} and you asked me to stay in ${labels}.`;
      return out;
    }
    out.location_match = 'tradeoff';
    out.ranking_adjustment = -2;
    if (prefs.relocation === 'yes') {
      out.location_reason = `In ${job.location} — outside your preferred area, but you're open to relocating for the right role.`;
      out.display_explanation = 'Outside your preferred area — only worth it if the role is an unusually strong fit.';
    } else {
      out.location_reason = `In ${job.location} — outside your preferred area (${labels}).`;
      out.display_explanation = `Outside your preferred area (${labels}).`;
    }
    return out;
  }

  if (prefs.broad) {
    out.location_match = 'acceptable';
    out.location_reason = 'You told me anywhere in the U.S. works.';
    return out;
  }

  // Unsure / no preference: never hard-filter — learn from behavior over time
  out.location_reason = 'No location preference set yet.';
  return out;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { jobs = [], log_context = '' } = await req.json().catch(() => ({}));

    const memories = await base44.entities.StudentMemory
      .filter({ user_email: user.email, active: true }, '-confidence', 100)
      .catch(() => []);
    const prefs = buildPrefs(user, memories || []);

    const evaluations = (Array.isArray(jobs) ? jobs : []).map((j: any) => evaluateJob(j || {}, prefs));

    // Analytics: match distribution per surface (fire-and-forget)
    if (log_context && evaluations.length) {
      const dist: any = { context: log_context, strong: 0, acceptable: 0, tradeoff: 0, mismatch: 0, unknown: 0, violations: 0, strict: prefs.strict };
      for (const ev of evaluations) {
        dist[ev.location_match] = (dist[ev.location_match] || 0) + 1;
        if (ev.hard_constraint_violation) dist.violations++;
      }
      base44.asServiceRole.entities.AnalyticsEvent.create({
        event_name: 'location_match_distribution',
        user_id: user.id,
        user_email: user.email,
        properties: dist,
      }).catch(() => {});
    }

    return Response.json({
      has_preferences: prefs.hasPreferences,
      strict: prefs.strict,
      remote_preference: prefs.remote,
      relocation_openness: prefs.relocation,
      preferred_labels: prefs.labels,
      evaluations,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});