import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_NAMES = {
  usc: 'University of South Carolina',
  osu: 'Ohio State',
  ucf: 'University of Central Florida',
  umich: 'University of Michigan',
  udel: 'University of Delaware',
  uga: 'University of Georgia',
  psu: 'Pennsylvania State',
  tulane: 'Tulane',
  umd: 'University of Maryland',
  fau: 'Florida Atlantic',
  fsu: 'Florida State',
  jmu: 'James Madison',
  miami: 'University of Miami',
  utexas: 'University of Texas',
  uky: 'University of Kentucky',
  uf: 'University of Florida',
  ufl: 'University of Florida',
};

function startOf(daysAgo) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const day7 = startOf(7);
    const day14 = startOf(14);
    const day30 = startOf(30);
    const day37 = startOf(37);

    // ── Fetch all users (up to 5000) ──────────────────────────────────────────
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // ── Signups ───────────────────────────────────────────────────────────────
    const newThisWeek     = allUsers.filter(u => u.created_date >= day7);
    const newLastWeek     = allUsers.filter(u => u.created_date >= day14 && u.created_date < day7);
    const newParents      = newThisWeek.filter(u => u.persona === 'parent');
    const newAlumni       = newThisWeek.filter(u => u.persona === 'alumni');
    const newStudents     = newThisWeek.filter(u => ['student','gator'].includes(u.persona));
    const prevParents     = newLastWeek.filter(u => u.persona === 'parent');
    const prevAlumni      = newLastWeek.filter(u => u.persona === 'alumni');
    const prevStudents    = newLastWeek.filter(u => ['student','gator'].includes(u.persona));

    // ── School breakdown ──────────────────────────────────────────────────────
    // Reverse map: full school name → code (for users who have school_name but no school_code)
    const NAME_TO_CODE = Object.fromEntries(
      Object.entries(SCHOOL_NAMES).map(([code, name]) => [name.toLowerCase(), code])
    );

    const schoolMap = {};
    const grandTotal = allUsers.length;
    for (const u of allUsers) {
      let code = u.school_code?.toLowerCase();
      // Fallback: try to infer code from school_name or school field
      if (!code) {
        const nameField = (u.school_name || u.school || '').toLowerCase().trim();
        code = nameField ? (NAME_TO_CODE[nameField] || nameField) : 'unassigned';
      }
      if (!schoolMap[code]) schoolMap[code] = { parents: 0, alumni: 0, students: 0, total: 0, newThisWeek: 0 };
      schoolMap[code].total++;
      if (u.persona === 'parent') schoolMap[code].parents++;
      else if (u.persona === 'alumni') schoolMap[code].alumni++;
      else if (['student','gator'].includes(u.persona)) schoolMap[code].students++;
      if (u.created_date >= day7) schoolMap[code].newThisWeek++;
    }
    const schools = Object.entries(schoolMap)
      .map(([code, data]) => ({
        code,
        name: code === 'unassigned' ? 'Unassigned' : (SCHOOL_NAMES[code] || code),
        ...data,
        pct: grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => {
        // Always push 'unassigned' to the bottom
        if (a.code === 'unassigned') return 1;
        if (b.code === 'unassigned') return -1;
        return b.total - a.total;
      });

    // ── Outreach engagement ───────────────────────────────────────────────────
    // Fetch outreach drafts
    let outreachAll = [];
    try {
      outreachAll = await base44.asServiceRole.entities.OutreachDraft.list('-sent_at', 2000);
    } catch (_) { outreachAll = []; }

    const sentThisWeek = outreachAll.filter(o => o.status !== 'draft' && o.sent_at >= day7);
    const sentLastWeek = outreachAll.filter(o => o.status !== 'draft' && o.sent_at >= day14 && o.sent_at < day7);
    const sent30Days   = outreachAll.filter(o => o.status !== 'draft' && o.sent_at >= day30);
    const replied30    = sent30Days.filter(o => o.status === 'replied' || !!o.replied_date);
    const responseRate = sent30Days.length > 0
      ? Math.round((replied30.length / sent30Days.length) * 100)
      : null;

    // % of helpers contacted this month
    const helpers = allUsers.filter(u => ['parent','alumni'].includes(u.persona));
    const contactedHelperEmails = new Set(
      outreachAll
        .filter(o => o.sent_at >= day30 && o.status !== 'draft' && o.recipient_linkedin_url)
        .map(o => o.recipient_name) // best proxy we have without a direct email field
    );
    // Actually check by recipient_name or recipient_email if available
    const outreach30 = outreachAll.filter(o => o.sent_at >= day30 && o.status !== 'draft');
    // Count unique recipients (by recipient_name as proxy)
    const uniqueRecipients = new Set(outreach30.map(o => (o.recipient_name || '').toLowerCase().trim()).filter(Boolean));
    const helpersContactedPct = helpers.length > 0
      ? Math.round((uniqueRecipients.size / helpers.length) * 100)
      : null;

    return Response.json({
      northStar: {
        thisWeek: sentThisWeek.length,
        lastWeek: sentLastWeek.length,
        delta: sentThisWeek.length - sentLastWeek.length,
      },
      signups: {
        total:       { thisWeek: newThisWeek.length,  lastWeek: newLastWeek.length,  delta: newThisWeek.length - newLastWeek.length },
        parents:     { thisWeek: newParents.length,   lastWeek: prevParents.length,  delta: newParents.length - prevParents.length },
        alumni:      { thisWeek: newAlumni.length,    lastWeek: prevAlumni.length,   delta: newAlumni.length - prevAlumni.length },
        students:    { thisWeek: newStudents.length,  lastWeek: prevStudents.length, delta: newStudents.length - prevStudents.length },
      },
      schools,
      grandTotal,
      engagement: {
        sentThisWeek:       sentThisWeek.length,
        sentLastWeek:       sentLastWeek.length,
        sentDelta:          sentThisWeek.length - sentLastWeek.length,
        responseRate,
        replied30:          replied30.length,
        sent30:             sent30Days.length,
        totalHelpers:       helpers.length,
        uniqueContacted:    uniqueRecipients.size,
        helpersContactedPct,
      },
    });
  } catch (e) {
    console.error('getAdminDashboardData error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});