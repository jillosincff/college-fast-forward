import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// One-time repair: students who uploaded a resume during onboarding were marked
// resume_status='ready' but no Resume record was ever created, so their parsed
// text was lost. Where the uploaded file URL survived, re-parse it and store the
// text so tailoring and overnight prep work for them again.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;
    const users = await svc.entities.User.filter({ resume_status: 'ready' }, '-created_date', 100);

    const results = { considered: users.length, repaired: 0, skipped: 0, reasons: {} as Record<string, number>, no_file: [] as string[] };
    const skip = (why: string) => { results.skipped++; results.reasons[why] = (results.reasons[why] || 0) + 1; };

    for (const u of users) {
      const existing = await svc.entities.Resume.filter({ student_email: u.email }, '-created_date', 5).catch(() => []);
      if ((existing || []).some(r => (r.parsed_text || '').length > 100)) { skip('already_has_text'); continue; }

      const fileUrl = u.resume_file_url || u.resume_url;
      if (!fileUrl) { skip('no_file_url'); results.no_file.push(u.email); continue; }

      const text = await svc.integrations.Core.InvokeLLM({
        prompt: 'Extract the full text content of this resume exactly as written — name, contact, education, experience with all bullet points, activities, and skills. Do not summarize, reword, or invent anything. Return plain text.',
        file_urls: [fileUrl],
      }).catch((e) => { console.error('[backfillOnboardingResumes] parse failed for', u.email, e.message); return null; });

      if (!text || typeof text !== 'string' || text.trim().length < 100) { skip('parse_failed'); continue; }

      await svc.entities.Resume.create({
        student_email: u.email,
        name: 'My Resume',
        original_file_url: fileUrl,
        parsed_text: text.trim(),
        is_active: true,
      });
      results.repaired++;
      console.log('[backfillOnboardingResumes] Repaired', u.email);
    }

    return Response.json(results);
  } catch (error) {
    console.error('[backfillOnboardingResumes] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}