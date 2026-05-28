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
      // Check for actual alumni and parent connections at the company
      let alumniCount = 0;
      let parentCount = 0;
      
      try {
        // Search for alumni at the company (users with school_code matching current user and working at company)
        const allUsers = await base44.entities.User.filter({});
        const companyLower = (needsOutreach.opportunity_company || '').toLowerCase();
        
        alumniCount = allUsers.filter(u => {
          const uSchool = u.school_code?.toLowerCase() || u.school_abbreviation?.toLowerCase() || '';
          const uCompany = (u.current_company || u.company || '').toLowerCase();
          const isAlumni = uSchool === (user.school_code?.toLowerCase() || user.school_abbreviation?.toLowerCase() || '');
          const atCompany = uCompany.includes(companyLower) || companyLower.includes(uCompany);
          return isAlumni && atCompany && u.id !== user.id;
        }).length;
        
        // Search for parents in the network (users with persona='parent' in same industry)
        const parentUsers = allUsers.filter(u => {
          const isParent = u.persona === 'parent' || u.roles?.includes('parent');
          const sameIndustry = (u.industry || '').toLowerCase() === (desiredIndustry || '').toLowerCase();
          return isParent && sameIndustry;
        }).length;
        
        parentCount = parentUsers;
      } catch (err) {
        console.error('Failed to count connections:', err);
      }
      
      // Determine action type based on available connections
      let actionType = 'SEND_WARM_OUTREACH';
      if (alumniCount === 0 && parentCount === 0) {
        actionType = 'NO_CONNECTIONS_YET';
      } else if (alumniCount === 0 && parentCount > 0) {
        actionType = 'PARENT_ADVISOR_PATH';
      }
      
      actionItem = {
        companyName: needsOutreach.opportunity_company,
        roleTitle: needsOutreach.opportunity_title,
        type: actionType,
        alumniCount,
        parentCount
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