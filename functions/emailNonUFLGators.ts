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

We noticed you signed up for College Fast Forward as a "Student" but your email (${gator.email}) isn't a @ufl.edu address.

Could you reply and let us know which best describes you?

1. **Current UF Student** - Please reply with your @ufl.edu email and we'll update your account
2. **UF Alumni** - Reply "Alumni" and we'll switch your account to alumni status
3. **UF Parent** - Reply "Parent" and we'll switch your account to parent status

This helps us connect you with the right people and features!

Thanks,
The College Fast Forward Team
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: gator.email,
          subject: "Quick question about your College Fast Forward account",
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