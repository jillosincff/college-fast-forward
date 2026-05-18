import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract user context
    const firstName = user.full_name?.split(' ')[0] || 'there';
    const schoolAbbrev = user.school_abbreviation || user.school_code?.toUpperCase() || 'UF';
    const desiredIndustry = user.desired_industry || user.target_industry || 'your field';

    // Query user's job applications pipeline
    const applications = await base44.entities.JobApplication.filter({ user_id: user.id, status: { $in: ['APPLIED', 'INTERVIEW_SCHEDULED', 'OFFER_RECEIVED'] } }, '-updated_date', 50);
    
    const totalInPipeline = applications?.length || 0;
    const interviewingCount = applications?.filter(a => a.status === 'INTERVIEW_SCHEDULED').length || 0;

    // Find first application needing outreach
    let needsOutreach = null;
    for (const app of (applications || [])) {
      if (app.status === 'APPLIED' && !app.hasSentOutreach) {
        needsOutreach = app;
        break;
      }
    }

    let actionItem = null;

    // If outreach needed, check for parent connections at that company
    if (needsOutreach) {
      const companyDomain = needsOutreach.companyDomain || needsOutreach.company?.toLowerCase().replace(/\s+/g, '') + '.com';
      
      // Query parent profiles matching company and school
      const parentMatches = await base44.entities.ParentNetworkProfile.filter({
        company_domain: companyDomain,
        school_code: schoolAbbrev,
        is_active: true
      });

      const parentCount = parentMatches?.length || 0;

      if (parentCount > 0) {
        actionItem = {
          companyName: needsOutreach.company,
          roleTitle: needsOutreach.role,
          type: 'SEND_WARM_OUTREACH',
          parentCount
        };
      }
    }

    // If no outreach needed, suggest fresh feed lookup
    if (!actionItem && totalInPipeline > 0) {
      actionItem = {
        type: 'FRESH_FEED_LOOKUP',
        industry: desiredIndustry
      };
    }

    return Response.json({
      studentName: firstName,
      schoolAbbreviation: schoolAbbrev,
      metrics: {
        totalInPipeline,
        interviewingCount
      },
      actionItem
    });

  } catch (error) {
    console.error('getAgentRecapContext error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});