import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { canRunGated, SOFT_WALL_MESSAGE } from '../../shared/entitlements.ts';
import { normCompany, makeCompanyMatcher, rankAndDedupe, shuffle } from '../../shared/peopleSearch.ts';

// CLIFF People Finder — the two-layer people search that powers the free Magic
// Moment "Wow". Layer 1 is the opt-in CLIFF graph (parents/alumni who joined
// CFF from the student's school + company). When that graph is thin, Layer 2
// runs a Jesse-style PUBLIC web research query (LLM + internet context) for
// real alumni of the student's school at the target company — returning ONLY
// facts that appear in a real public source, with the source URL.
//
// SAFETY: never fabricates names/titles/years. Never scrapes LinkedIn. Never
// emails anyone. Public-web people are surfaced as "found publicly" with a
// source link; only opt-in CFF members can be introduced through the app.
// Public finds are cached to DiscoveredAlumni (24h TTL) so repeat cycles are
// instant and don't burn LLM credits.
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      companyName, targetRole, magic_moment,
      schoolName, schoolCode: schoolCodeRaw, chipText, location,
    } = await req.json().catch(() => ({}));

    // Free during the Magic Moment; Pro-gated otherwise.
    if (!(await canRunGated(base44, user, magic_moment))) {
      return Response.json({ connections: [], recommended: null, upgrade_required: true, message: SOFT_WALL_MESSAGE });
    }

    const target = normCompany(companyName);
    if (!target) return Response.json({ connections: [], recommended: null });

    const schoolCode = (schoolCodeRaw || user.school_code || '').toUpperCase();
    const school = schoolName || user.school || '';
    const sr = base44.asServiceRole;
    const companyMatch = makeCompanyMatcher(companyName);

    const connections = [];

    // ── LAYER 1 — CLIFF opt-in graph (highest trust) ───────────────────────
    // Tier 1: parents/helpers from the student's OWN school at this company.
    if (schoolCode) {
      const own = await sr.entities.ParentNetworkProfile.filter({
        school_code: schoolCode, is_active: true,
      }).catch(() => []);
      for (const p of own || []) {
        if (p.help_scope === 'unavailable') continue;
        if (!companyMatch(p.company_name)) continue;
        const personaLabel = p.persona === 'alumni' ? 'Alum' : 'Parent';
        connections.push({
          tier: 1,
          source: 'opt_in',
          name: [p.first_name, p.last_name].filter(Boolean).join(' '),
          role_title: p.role_title || null,
          company: p.company_name,
          school: school || schoolCode,
          graduation_year: null,
          linkedin_url: p.linkedin_url || null,
          persona: p.persona || 'parent',
          school_code: p.school_code,
          why: `${personaLabel} in your ${schoolCode} network who works at ${p.company_name}`,
          label: 'Possible connection',
          source_url: p.linkedin_url || null,
        });
      }
    }

    // Tier 2: previously-discovered public alumni from the student's school at
    // this company (cached from past Layer 2 runs). Shuffled + sorted by
    // last_shown_at ascending so the least-recently-sown person surfaces first
    // (rotation / soft-cap — prevents the same person going to every student).
    if (schoolCode) {
      const alumni = await sr.entities.DiscoveredAlumni.filter(
        { school_code: schoolCode }, '-created_date', 500
      ).catch(() => []);
      const now = Date.now();
      const fresh = (alumni || []).filter((a) => {
        if (!companyMatch(a.company)) return false;
        if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
        return true;
      });
      // Sort: never-shown first, then least-recently-shown — then shuffle within
      // equal buckets so ties don't always return the same person.
      const sorted = shuffle(fresh).sort((a, b) => {
        const at = a.last_shown_at ? new Date(a.last_shown_at).getTime() : 0;
        const bt = b.last_shown_at ? new Date(b.last_shown_at).getTime() : 0;
        return at - bt;
      });
      for (const a of sorted) {
        connections.push({
          tier: 2,
          source: 'public_web',
          name: a.name,
          role_title: a.role_title || null,
          company: a.company,
          school: school || schoolCode,
          graduation_year: a.degree_info || null,
          linkedin_url: a.linkedin_url || null,
          persona: 'alumni',
          school_code: schoolCode,
          why: `${schoolCode} alum found via public source${a.source_url ? ' — see link' : ''}`,
          label: 'Found publicly',
          source_url: a.source_url || null,
          _alumni_id: a.id,
        });
      }
    }

    // Tier 3: cross-school CFF members who explicitly opted in to help ANY school.
    const anySchool = await sr.entities.ParentNetworkProfile.filter({
      help_scope: 'any_school', is_active: true,
    }).catch(() => []);
    for (const p of anySchool || []) {
      if ((p.school_code || '').toUpperCase() === schoolCode) continue;
      if (!companyMatch(p.company_name)) continue;
      const personaLabel = p.persona === 'alumni' ? 'alum' : 'parent';
      connections.push({
        tier: 3,
        source: 'opt_in',
        name: [p.first_name, p.last_name].filter(Boolean).join(' '),
        role_title: p.role_title || null,
        company: p.company_name,
        school: p.school_code || school,
        graduation_year: null,
        linkedin_url: p.linkedin_url || null,
        persona: p.persona || 'parent',
        school_code: p.school_code,
        why: `CFF ${personaLabel} (${p.school_code}) who opted in to help students from any school`,
        label: 'May be open to helping',
        source_url: p.linkedin_url || null,
      });
    }

    // ── LAYER 2 — public web research (only if Layer 1 found nobody) ───────
    // Jesse-style query: real alumni of [School] at [Company] in [function].
    // Returns ONLY facts that appear in a public source, with the source URL.
    // Never fabricates. Runs once per company per 24h (cached above).
    if (connections.length === 0 && school) {
      try {
        const roleHint = targetRole || chipText || 'a relevant role';
        const prompt = `Find 3 real people who are alumni of ${school} and currently work at ${companyName}, ideally in ${roleHint} or an adjacent function. For each person give: name, title (their job title at ${companyName}), source_url (the LinkedIn profile URL or other public page where you found them), and summary (one sentence on why they're a good connection for the student). Only include real people you found via web search — do not fabricate. Return as JSON.`;

        const llmRes = await sr.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              people: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    title: { type: 'string' },
                    source_url: { type: 'string' },
                    summary: { type: 'string' },
                  },
                },
              },
            },
          },
        });

        // Shuffle so different calls return different people (rotation).
        const people = shuffle((llmRes?.people) || []);
        for (const p of people) {
          // Hard gate: no source URL = not verifiable = dropped. No name = dropped.
          if (!p.name || !p.source_url) continue;
          if (!/^https?:\/\//i.test(p.source_url)) continue;
          const isLinkedIn = /linkedin\.com/i.test(p.source_url);
          connections.push({
            tier: 4,
            source: 'public_web',
            name: p.name,
            role_title: p.title || null,
            company: companyName,
            school: school,
            graduation_year: null,
            linkedin_url: isLinkedIn ? p.source_url : null,
            persona: 'alumni',
            school_code: schoolCode,
            why: p.summary || `${school} alum found via public source`,
            label: 'Found publicly',
            source_url: p.source_url,
          });
        }

        // Cache the fresh public finds so the next cycle is instant. Mark
        // last_shown_at = now so the soft-cap deprioritizes them for the next
        // student (prevents the same person going to everyone within 24h).
        const toCache = connections
          .filter((c) => c.source === 'public_web')
          .slice(0, 3);
        if (toCache.length && schoolCode) {
          const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          const nowIso = new Date().toISOString();
          for (const c of toCache) {
            try {
              const created = await sr.entities.DiscoveredAlumni.create({
                name: c.name,
                role_title: c.role_title || '',
                company: companyName,
                school_code: schoolCode,
                source_url: c.source_url,
                degree_info: c.graduation_year || '',
                location: location || '',
                linkedin_url: c.linkedin_url || '',
                description: c.why || '',
                verified: false,
                expires_at: expires,
                last_shown_at: nowIso,
              });
              if (created?.id) c._alumni_id = created.id;
            } catch (e) { /* cache best-effort */ }
          }
        }
      } catch (e) {
        // Layer 2 failure never breaks the cycle — we just have no public person.
      }
    }

    // Rank + dedupe via the shared helper (same logic as findWorkspaceConnections).
    const deduped = rankAndDedupe(connections, targetRole, 5);

    // Soft-cap: stamp last_shown_at = now on served public-web alumni so the
    // next student gets a different person (least-recently-shown surfaces first).
    const nowIso = new Date().toISOString();
    for (const c of deduped) {
      if (c.source !== 'public_web' || !c._alumni_id) continue;
      try {
        await sr.entities.DiscoveredAlumni.update(c._alumni_id, { last_shown_at: nowIso });
      } catch (e) { /* best-effort */ }
      delete c._alumni_id;
    }

    return Response.json({
      connections: deduped,
      recommended: deduped[0] || null,
      people_source: deduped.length === 0 ? 'none' : (deduped[0].source === 'opt_in' ? 'opt_in' : 'public_web'),
      person_found: deduped.length > 0,
    });
  } catch (error) {
    return Response.json({ connections: [], recommended: null, people_source: 'none', person_found: false, error: error.message }, { status: 500 });
  }
}