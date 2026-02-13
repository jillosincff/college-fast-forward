import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { ambassadorId, exportCsv = false } = await req.json().catch(() => ({}));

    // Get all ambassadors
    const ambassadors = await base44.asServiceRole.entities.Ambassador.filter({}, '-created_date', 200);

    // Get all users to match invite_code_used
    const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 5000);

    // Build a map: invite_code -> list of users who used it
    const signupsByCode = {};
    for (const u of allUsers) {
      const code = u.invite_code_used;
      if (code) {
        const codeLower = code.toLowerCase();
        if (!signupsByCode[codeLower]) signupsByCode[codeLower] = [];
        signupsByCode[codeLower].push({
          id: u.id,
          full_name: u.full_name || '',
          email: u.email || '',
          persona: u.persona || '',
          created_date: u.created_date
        });
      }
    }

    // If requesting detail for a single ambassador
    if (ambassadorId) {
      const ambassador = ambassadors.find(a => a.id === ambassadorId);
      if (!ambassador) {
        return Response.json({ error: 'Ambassador not found' }, { status: 404 });
      }
      const codeLower = ambassador.invite_code.toLowerCase();
      const signups = signupsByCode[codeLower] || [];

      // Update cached count if different
      if (signups.length !== ambassador.total_signups) {
        try {
          await base44.asServiceRole.entities.Ambassador.update(ambassador.id, {
            total_signups: signups.length
          });
        } catch (e) { console.log('Count update failed:', e.message); }
      }

      if (exportCsv) {
        const header = 'Name,Email,Role,Signed Up';
        const rows = signups.map(s =>
          `"${(s.full_name || '').replace(/"/g, '""')}","${s.email}","${s.persona}","${s.created_date ? new Date(s.created_date).toLocaleDateString() : ''}"`
        );
        const csv = [header, ...rows].join('\n');
        return new Response(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename=ambassador_${ambassador.invite_code}_signups.csv`
          }
        });
      }

      return Response.json({
        success: true,
        ambassador,
        signups,
        total: signups.length
      });
    }

    // Overview: enrich each ambassador with live signup count
    const enriched = ambassadors.map(a => {
      const codeLower = a.invite_code.toLowerCase();
      const signups = signupsByCode[codeLower] || [];
      return {
        ...a,
        live_signups: signups.length
      };
    });

    // Update cached counts in background (fire and forget)
    for (const a of enriched) {
      if (a.live_signups !== a.total_signups) {
        base44.asServiceRole.entities.Ambassador.update(a.id, {
          total_signups: a.live_signups
        }).catch(() => {});
      }
    }

    // If export all as CSV
    if (exportCsv) {
      const header = 'Name,Email,Invite Code,Status,Total Signups,Created';
      const rows = enriched.map(a =>
        `"${(a.name || '').replace(/"/g, '""')}","${a.email}","${a.invite_code}","${a.status}","${a.live_signups}","${a.created_date ? new Date(a.created_date).toLocaleDateString() : ''}"`
      );
      const csv = [header, ...rows].join('\n');
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=ambassadors_report.csv'
        }
      });
    }

    return Response.json({
      success: true,
      ambassadors: enriched,
      totalAmbassadors: enriched.length,
      totalSignups: enriched.reduce((sum, a) => sum + a.live_signups, 0)
    });

  } catch (error) {
    console.error('Ambassador stats error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});