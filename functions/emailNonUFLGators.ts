import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dryRun = true } = await req.json().catch(() => ({}));

    // Find all gators with non-UFL emails
    const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 9999);
    
    const nonUFLGators = (allUsers || []).filter(u => {
      const isGator = u.persona === 'gator' || u.persona === 'student';
      const isNonUFL = u.email && !u.email.toLowerCase().endsWith('@ufl.edu');
      const notAdmin = !u.roles?.includes('admin');
      return isGator && isNonUFL && notAdmin;
    });

    if (dryRun) {
      return Response.json({
        success: true,
        dryRun: true,
        count: nonUFLGators.length,
        users: nonUFLGators.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          created_date: u.created_date
        }))
      });
    }

    // Send emails
    const results = {
      sent: [],
      errors: []
    };

    for (const gator of nonUFLGators) {
      try {
        const emailBody = `
Hi ${gator.full_name || 'there'},

We noticed you signed up for College Fast Forward as a student using ${gator.email}.

To get the full student experience and connect with UF parents and alumni who can help with your career, please sign up again using your @ufl.edu email address.

Here's how:
1. Go to https://collegefastforward.com
2. Click "Join as Student"
3. Sign in with your @ufl.edu Google account

This ensures you're verified as a current UF student and can access all features.

Questions? Just reply to this email.

Go Gators! 🐊
The College Fast Forward Team
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: gator.email,
          subject: "Action Required: Please sign up with your @ufl.edu email",
          body: emailBody,
          from_name: "College Fast Forward"
        });

        results.sent.push({
          email: gator.email,
          name: gator.full_name
        });

      } catch (error) {
        console.error(`Failed to email ${gator.email}:`, error);
        results.errors.push({
          email: gator.email,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      dryRun: false,
      totalFound: nonUFLGators.length,
      sent: results.sent.length,
      errors: results.errors.length,
      details: results
    });

  } catch (error) {
    console.error('emailNonUFLGators error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});