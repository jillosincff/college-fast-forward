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

    // Query user's opportunity applications pipeline (entity is OpportunityApplication)
    const applications = await base44.entities.OpportunityApplication.filter(
      { applicant_id: user.id },
      '-updated_date',
      50
    );

    const totalInPipeline = applications?.length || 0;
    const interviewingCount = applications?.filter(a => a.status === 'interview').length || 0;

    // Find first application that may need a follow-up
    let needsOutreach = null;
    for (const app of (applications || [])) {
      if (app.status === 'applied') {
        needsOutreach = app;
        break;
      }
    }

    let actionItem = null;

    if (needsOutreach) {
      actionItem = {
        companyName: needsOutreach.opportunity_company,
        roleTitle: needsOutreach.opportunity_title,
        type: 'SEND_WARM_OUTREACH',
        parentCount: 0
      };
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