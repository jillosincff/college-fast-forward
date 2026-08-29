import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// CLIFF Networking Intelligence Engine.
// Assigns every opportunity an INTERNAL networking value (HIGH/MEDIUM/LOW/NONE)
// from multiple factors — relationship strength, role relevance, connection depth,
// existing student progress — never a single factor, never an exposed number.
// Also records every assessment for the learning engine and handles outcome updates.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { companyName, roleTitle = '', action, recId, status } = body;
    const sr = base44.asServiceRole;
    const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // ── Learning engine: outcome updates ──
    if (action === 'drafted' && recId) {
      await sr.entities.NetworkingRecommendation.update(recId, { drafted: true });
      return Response.json({ ok: true });
    }
    if (action === 'outcome' && recId && status) {
      const patch = { status };
      if (status === 'contacted') patch.sent = true;
      await sr.entities.NetworkingRecommendation.update(recId, patch);
      return Response.json({ ok: true });
    }

    if (!companyName) return Response.json({ error: 'companyName required' }, { status: 400 });

    // 1. Tiered, permission-respecting connection search (existing engine)
    // Pass the target role so the public-search + ranking can scope to THIS function
    // (a sales intern must not be handed an Application Security Engineer).
    const connRes = await base44.functions.invoke('findWorkspaceConnections', { companyName, targetRole: roleTitle });
    const connData = connRes?.data || connRes || {};
    const connections = connData.connections || [];

    // A contact is on-function if their title overlaps the target role's tokens,
    // or they're a role-agnostic helper (recruiter / talent / HR / campus / advisor).
    // Unknown titles are allowed through (can't prove a mismatch).
    const roleWords = (roleTitle || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const isOnFunction = (c: any) => {
      const t = (c?.role_title || '').toLowerCase();
      if (!t) return true;
      if (/\b(recruit|talent|hir|people partner|human resources|\bhr\b|campus|university|early talent|early career|advisor|coach)\b/.test(t)) return true;
      if (roleWords.length && roleWords.some((w) => t.includes(w))) return true;
      return false;
    };
    // Never surface an off-function contact as the "best path" — fall to null
    // (which renders as "no one found yet" / cold apply) rather than hand the
    // student a contact from a different function.
    const best = connections.find(isOnFunction) || null;

    // 2. Existing student progress on this opportunity
    const pursuits = await base44.entities.JobPursuit.filter(
      { user_email: user.email, company_name: companyName }
    ).catch(() => []);
    const pursuit = (pursuits || [])[0] || null;

    // 3. Multi-factor internal score — never exposed to the student
    let score = 0;
    if (best) {
      // Relationship strength
      score += best.tier === 1 ? 50 : best.tier === 2 ? 40 : 30;
      // Contact role relevance
      const rt = (best.role_title || '').toLowerCase();
      if (/recruit|talent/.test(rt)) score += 25;
      else if (/hiring|manager|director|head of|vp|vice president|chief/.test(rt)) score += 15;
      // Same department / role overlap
      const roleWords = (roleTitle || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3);
      if (roleWords.some((w) => rt.includes(w))) score += 15;
      // Network depth
      score += Math.min(Math.max(connections.length - 1, 0), 2) * 5;
      // Outreach already in motion — networking need drops
      if (pursuit && ['sent', 'replied'].includes(pursuit.outreach_status || '')) score -= 25;
    }

    const value = !best ? 'NONE' : score >= 70 ? 'HIGH' : score >= 45 ? 'MEDIUM' : 'LOW';

    const firstName = (best?.name || '').split(' ')[0] || '';
    const reason =
      value === 'HIGH'
        ? `${best.name} is a strong warm path into ${companyName} — a short, respectful message here materially improves your odds.`
        : value === 'MEDIUM'
        ? `I found someone who may be worth contacting at ${companyName}. It could help, but a strong application matters more.`
        : value === 'LOW'
        ? `There's a distant possible connection at ${companyName}, but I don't recommend prioritizing it.`
        : `I don't think networking adds much value for this opportunity. I'd spend your time strengthening the application.`;

    // 4. Prepared outreach — only when networking is actually recommended
    let draft = null;
    let sequence = null;
    if (value === 'HIGH' || value === 'MEDIUM') {
      const school = (user.school_code || 'my school').toUpperCase();
      const role = roleTitle || 'a role';
      draft = {
        subject: `${school} student — quick question about ${companyName}`,
        message: `Hi ${firstName},\n\nI'm a ${school} student and I just applied for the ${role} position at ${companyName}. I came across your name and would really value 15 minutes to hear about your experience there — no ask beyond that.\n\nThanks so much for considering it.\n\n${user.full_name || ''}`.trim(),
        timing: 'Apply first, then send this the next day.',
        reason: best.why || reason,
      };
    }
    if (value === 'HIGH') {
      sequence = [
        'Review your tailored resume',
        'Apply',
        'Wait one day',
        `Send the prepared message to ${firstName}`,
        'Follow up in 4–5 days if no reply',
      ];
    }

    // 5. Record the assessment for the learning engine (dedupe by key)
    const recKey = `${norm(companyName)}||${norm(roleTitle)}`;
    let rec = null;
    const existing = await sr.entities.NetworkingRecommendation.filter(
      { user_email: user.email, rec_key: recKey }
    ).catch(() => []);
    if (existing && existing[0]) {
      rec = existing[0];
      if (rec.networking_value !== value) {
        await sr.entities.NetworkingRecommendation.update(rec.id, {
          networking_value: value,
          reason,
          best_contact_name: best?.name || '',
          contact_persona: best?.persona || '',
          contact_tier: best?.tier || 0,
        });
      }
    } else {
      rec = await sr.entities.NetworkingRecommendation.create({
        user_email: user.email,
        rec_key: recKey,
        company_name: companyName,
        role_title: roleTitle,
        networking_value: value,
        reason,
        best_contact_name: best?.name || '',
        contact_persona: best?.persona || '',
        contact_tier: best?.tier || 0,
        status: 'assessed',
        school_code: (user.school_code || '').toUpperCase(),
        major: user.major || '',
        graduation_year: String(user.graduation_year || ''),
      });
    }

    return Response.json({
      value,
      reason,
      recId: rec?.id || null,
      best_contact: best,
      connections,
      draft,
      sequence,
      existing_outreach: !!(pursuit && ['sent', 'replied'].includes(pursuit.outreach_status || '')),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});