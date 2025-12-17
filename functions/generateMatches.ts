import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RELATED_INDUSTRIES = [
  ['Technology & Software', 'Engineering'],
  ['Finance & Banking', 'Consulting'],
  ['Marketing', 'Media & Entertainment'],
  ['Healthcare', 'Non-Profit']
];

function isRelatedIndustry(industry1, industry2) {
  return RELATED_INDUSTRIES.some(group => 
    group.includes(industry1) && group.includes(industry2)
  );
}

function calculateMatchScore(helpRequest, parentExpertise) {
  let score = 0;
  const reasons = [];
  
  // 1. Help Type Overlap (10 points per match)
  const helpTypeMatches = helpRequest.help_types.filter(type => 
    parentExpertise.help_types.includes(type)
  );
  score += helpTypeMatches.length * 10;
  if (helpTypeMatches.length > 0) {
    const labels = {
      'career_advice': 'Career advice',
      'internship_leads': 'Internship leads',
      'resume_review': 'Resume review',
      'interview_prep': 'Interview prep',
      'industry_insights': 'Industry insights',
      'networking_intros': 'Networking intros',
      'informational_interview': 'Informational interviews'
    };
    const matchedLabels = helpTypeMatches.map(t => labels[t] || t);
    reasons.push(`Can help with: ${matchedLabels.join(', ')}`);
  }
  
  // 2. Industry Match (20 points for exact, 10 for related)
  if (helpRequest.industry === parentExpertise.industry) {
    score += 20;
    reasons.push(`${parentExpertise.industry} industry experience`);
  } else if (isRelatedIndustry(helpRequest.industry, parentExpertise.industry)) {
    score += 10;
    reasons.push(`Related industry experience`);
  }
  
  // 3. Company Connections (15 points if student mentioned target companies)
  if (parentExpertise.company_connections && helpRequest.description) {
    const companies = parentExpertise.company_connections.toLowerCase().split(',');
    const mentionedCompany = companies.some(company => 
      helpRequest.description.toLowerCase().includes(company.trim())
    );
    if (mentionedCompany) {
      score += 15;
      reasons.push('Has connections at companies you mentioned');
    }
  }
  
  // 4. Experience Level Bonus (5 points for 15+ years)
  if (['15-20', '20+'].includes(parentExpertise.years_experience)) {
    score += 5;
    reasons.push(`${parentExpertise.years_experience} years experience`);
  }
  
  return { score, reasons };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { help_request_id, parent_expertise_id, mode } = await req.json();
    
    // Mode: 'for_request' (student posted) or 'for_parent' (parent updated profile)
    let helpRequests = [];
    let parentProfiles = [];
    
    if (mode === 'for_request') {
      // Get the specific help request
      const request = await base44.asServiceRole.entities.HelpRequest.filter(
        { id: help_request_id, status: 'active' }
      );
      if (!request || request.length === 0) {
        return Response.json({ error: 'Help request not found' }, { status: 404 });
      }
      helpRequests = request;
      
      // Get all available parent profiles
      parentProfiles = await base44.asServiceRole.entities.ParentExpertise.filter(
        { available: true }
      );
    } else if (mode === 'for_parent') {
      // Get the specific parent profile
      const profile = await base44.asServiceRole.entities.ParentExpertise.filter(
        { id: parent_expertise_id, available: true }
      );
      if (!profile || profile.length === 0) {
        return Response.json({ error: 'Parent profile not found' }, { status: 404 });
      }
      parentProfiles = profile;
      
      // Get all active help requests
      helpRequests = await base44.asServiceRole.entities.HelpRequest.filter(
        { status: 'active' }
      );
    } else {
      return Response.json({ error: 'Invalid mode. Use "for_request" or "for_parent"' }, { status: 400 });
    }
    
    const matchesData = [];
    
    for (const helpRequest of helpRequests) {
      for (const parent of parentProfiles) {
        // Skip if match already exists
        const existingMatch = await base44.asServiceRole.entities.Match.filter({
          help_request_id: helpRequest.id,
          parent_id: parent.parent_id
        });
        
        if (existingMatch && existingMatch.length > 0) {
          continue;
        }
        
        const { score, reasons } = calculateMatchScore(helpRequest, parent);
        
        // Minimum threshold: 20 points
        if (score >= 20) {
          matchesData.push({
            help_request_id: helpRequest.id,
            parent_id: parent.parent_id,
            student_id: helpRequest.student_id,
            match_score: score,
            match_reasons: reasons,
            status: 'pending',
            // Cache parent data
            parent_name: parent.parent_name,
            parent_role: parent.current_role,
            parent_company: parent.current_company,
            parent_industry: parent.industry,
            parent_years_experience: parent.years_experience,
            // Cache student data
            student_name: helpRequest.student_name,
            student_major: helpRequest.student_major,
            student_year: helpRequest.student_year,
            // Cache request data
            help_types: helpRequest.help_types,
            timeline: helpRequest.timeline,
            request_description: helpRequest.description
          });
        }
      }
    }
    
    // Sort by score (highest first)
    matchesData.sort((a, b) => b.match_score - a.match_score);
    
    // Insert matches
    const createdMatches = [];
    for (const matchData of matchesData) {
      const match = await base44.asServiceRole.entities.Match.create(matchData);
      createdMatches.push(match);
    }
    
    // Update match counts
    if (mode === 'for_request' && helpRequests.length > 0) {
      await base44.asServiceRole.entities.HelpRequest.update(helpRequests[0].id, {
        match_count: createdMatches.length
      });
    }
    
    return Response.json({
      success: true,
      matches_created: createdMatches.length,
      matches: createdMatches
    });
    
  } catch (error) {
    console.error('Generate matches error:', error);
    return Response.json({ 
      error: 'Failed to generate matches',
      details: error.message 
    }, { status: 500 });
  }
});