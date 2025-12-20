import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const RELATED_INDUSTRIES = [
  ['Technology & Software', 'Engineering'],
  ['Finance & Banking', 'Consulting'],
  ['Marketing', 'Media & Entertainment'],
  ['Healthcare', 'Non-Profit']
];

const RELATED_MAJORS = [
  ['Computer Science', 'Information Systems', 'Data Science', 'Software Engineering'],
  ['Marketing', 'Business Administration', 'Communications', 'Advertising'],
  ['Finance', 'Accounting', 'Economics', 'Business Administration'],
  ['Engineering', 'Computer Science', 'Physics', 'Mathematics'],
  ['Biology', 'Chemistry', 'Pre-Med', 'Healthcare Administration'],
  ['Psychology', 'Sociology', 'Social Work', 'Human Resources']
];

function isRelatedIndustry(industry1, industry2) {
  return RELATED_INDUSTRIES.some(group => 
    group.includes(industry1) && group.includes(industry2)
  );
}

function isRelatedMajor(major1, major2) {
  if (!major1 || !major2) return false;
  const m1 = major1.toLowerCase();
  const m2 = major2.toLowerCase();
  return RELATED_MAJORS.some(group => 
    group.some(m => m1.includes(m.toLowerCase())) && 
    group.some(m => m2.includes(m.toLowerCase()))
  );
}

// Convert raw score to percentage (max 50 points = 99%)
function scoreToPercentage(score) {
  return Math.min(Math.round((score / 50) * 100), 99);
}

// Generate quirky match message based on score
function getMatchMessage(score, category) {
  if (score >= 35) {
    return "🎯 Great match! This parent can really help.";
  } else if (score >= 25) {
    return "💪 Solid match. Worth reaching out!";
  } else if (score >= 15) {
    return "👍 Decent match - different industry but can still help.";
  } else if (score >= 10) {
    return "🤝 Not exact, but all career advice helps!";
  } else {
    return "🌱 New to the network - help us grow!";
  }
}

function calculateParentMatchScore(helpRequest, parentExpertise) {
  let score = 0;
  const reasons = [];
  
  // 1. Help Type Overlap (10 points per match)
  const helpTypeMatches = (helpRequest.help_types || []).filter(type => 
    (parentExpertise.help_types || []).includes(type)
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
  
  // 2. Industry Match (20 points for exact, 10 for related, 2 for different)
  if (helpRequest.industry === parentExpertise.industry) {
    score += 20;
    reasons.push(`${parentExpertise.industry} industry experience`);
  } else if (isRelatedIndustry(helpRequest.industry, parentExpertise.industry)) {
    score += 10;
    reasons.push(`Related industry experience`);
  } else {
    // Even different industry gets some points - general career advice is valuable
    score += 2;
    reasons.push(`General career advice`);
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
  
  // 4. Experience Level Bonus
  if (parentExpertise.years_experience === '20+') {
    score += 7;
    reasons.push('20+ years experience');
  } else if (parentExpertise.years_experience === '15-20') {
    score += 5;
    reasons.push('15-20 years experience');
  } else if (parentExpertise.years_experience === '10-15') {
    score += 3;
    reasons.push('10-15 years experience');
  } else {
    score += 1;
    reasons.push(`${parentExpertise.years_experience || '5+'} years experience`);
  }
  
  // MINIMUM SCORE: Every parent gets at least 5 points
  score = Math.max(score, 5);
  
  // Determine category
  const category = score >= 20 ? 'high' : 'broader';
  
  return { score, reasons, category };
}

function calculatePeerMatchScore(helpRequest, peerProfile, requestingStudentMajor) {
  let score = 0;
  const reasons = [];
  
  // 1. Same major (30 points)
  if (peerProfile.student_major && requestingStudentMajor) {
    const peerMajor = peerProfile.student_major.toLowerCase();
    const studentMajor = requestingStudentMajor.toLowerCase();
    if (peerMajor === studentMajor) {
      score += 30;
      reasons.push(`Same major: ${peerProfile.student_major}`);
    } else if (isRelatedMajor(peerProfile.student_major, requestingStudentMajor)) {
      score += 15;
      reasons.push(`Related major: ${peerProfile.student_major}`);
    }
  }
  
  // 2. Same industry interest (20 points)
  if (peerProfile.target_industry === helpRequest.industry) {
    score += 20;
    reasons.push(`Same industry interest: ${helpRequest.industry}`);
  }
  
  // 3. Collaboration type overlap (10 points per overlap)
  const helpTypeToCollab = {
    'resume_review': 'resume_review',
    'interview_prep': 'interview_prep',
    'internship_leads': 'internship_search',
    'career_advice': 'career_development'
  };
  
  const collabMatches = (helpRequest.help_types || []).filter(type => {
    const collabType = helpTypeToCollab[type];
    return collabType && (peerProfile.can_collaborate_on || []).includes(collabType);
  });
  
  score += collabMatches.length * 10;
  if (collabMatches.length > 0) {
    const collabLabels = {
      'resume_review': 'Resume feedback',
      'interview_prep': 'Interview prep',
      'internship_search': 'Internship search',
      'certifications': 'Certifications',
      'study_groups': 'Study groups',
      'career_development': 'Career development'
    };
    const labels = (peerProfile.can_collaborate_on || []).map(c => collabLabels[c] || c);
    reasons.push(`Open to collaborating on: ${labels.slice(0, 3).join(', ')}`);
  }
  
  // 4. Same year bonus (10 points)
  if (peerProfile.student_year === helpRequest.student_year) {
    score += 10;
    reasons.push(`Same year: ${peerProfile.student_year}`);
  }
  
  // 5. Has what_i_can_share filled out (5 points)
  if (peerProfile.what_i_can_share?.trim()) {
    score += 5;
    reasons.push('Has experiences to share');
  }
  
  const category = score >= 40 ? 'high' : 'broader';
  
  return { score, reasons, category };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { help_request_id, parent_expertise_id, mode } = await req.json();
    
    let helpRequests = [];
    let parentProfiles = [];
    let peerProfiles = [];
    
    if (mode === 'for_request') {
      // Get the specific help request
      const request = await base44.asServiceRole.entities.HelpRequest.filter(
        { id: help_request_id, status: 'active' }
      );
      if (!request || request.length === 0) {
        return Response.json({ error: 'Help request not found' }, { status: 404 });
      }
      helpRequests = request;
      
      // Get ALL parent profiles (not just available ones - we need to always show something)
      parentProfiles = await base44.asServiceRole.entities.ParentExpertise.list('-created_date', 100);
      
      // Get all peer profiles open to collaboration (excluding the requesting student)
      const allPeerProfiles = await base44.asServiceRole.entities.StudentPeerProfile.filter(
        { open_to_collaboration: true }
      );
      peerProfiles = allPeerProfiles.filter(p => p.student_id !== helpRequests[0].student_id);
      
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
    
    // CRITICAL: If no parents exist at all, return early with helpful message
    if (parentProfiles.length === 0 && mode === 'for_request') {
      console.log('No parents in database yet - skipping match generation');
      return Response.json({
        success: true,
        matches_created: 0,
        parent_matches: 0,
        peer_matches: 0,
        matches: [],
        message: 'No parents in the network yet. Matches will appear as parents join.'
      });
    }
    
    const allScoredParents = [];
    
    // Score ALL parents for the help request
    for (const helpRequest of helpRequests) {
      for (const parent of parentProfiles) {
        // Check if match already exists
        const existingMatch = await base44.asServiceRole.entities.Match.filter({
          help_request_id: helpRequest.id,
          parent_id: parent.parent_id,
          match_type: 'parent'
        });
        
        if (existingMatch && existingMatch.length > 0) {
          continue; // Skip existing matches
        }
        
        const { score, reasons, category } = calculateParentMatchScore(helpRequest, parent);
        
        allScoredParents.push({
          helpRequest,
          parent,
          score,
          reasons,
          category
        });
      }
    }
    
    // Sort by score (highest first)
    allScoredParents.sort((a, b) => b.score - a.score);
    
    // CRITICAL: Always take TOP 5 parents, regardless of score
    const MIN_MATCHES = 5;
    const topParentMatches = allScoredParents.slice(0, MIN_MATCHES);
    
    const matchesData = [];
    
    // Create matches for top parents
    for (const { helpRequest, parent, score, reasons, category } of topParentMatches) {
      const matchPercentage = scoreToPercentage(score);
      const matchMessage = getMatchMessage(score, category);
      
      matchesData.push({
        help_request_id: helpRequest.id,
        parent_id: parent.parent_id,
        student_id: helpRequest.student_id,
        match_type: 'parent',
        match_category: category,
        match_score: score,
        match_percentage: matchPercentage,
        match_message: matchMessage,
        match_reasons: reasons,
        status: 'pending',
        // Cache parent data
        parent_name: parent.parent_name,
        parent_email: parent.parent_email,
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
    
    // Generate PEER matches (only in for_request mode)
    if (mode === 'for_request' && helpRequests.length > 0) {
      const helpRequest = helpRequests[0];
      let peerMatchCount = 0;
      
      for (const peer of peerProfiles) {
        if (peerMatchCount >= 5) break; // Limit to 5 peer matches
        
        // Skip if match already exists
        const existingPeerMatch = await base44.asServiceRole.entities.Match.filter({
          help_request_id: helpRequest.id,
          peer_id: peer.student_id,
          match_type: 'peer'
        });
        
        if (existingPeerMatch && existingPeerMatch.length > 0) {
          continue;
        }
        
        const { score, reasons, category } = calculatePeerMatchScore(
          helpRequest, 
          peer, 
          helpRequest.student_major
        );
        
        // Lower threshold for peer matches too
        if (score >= 15) {
          const matchPercentage = scoreToPercentage(score);
          const matchMessage = getMatchMessage(score, category);
          
          matchesData.push({
            help_request_id: helpRequest.id,
            peer_id: peer.student_id,
            student_id: helpRequest.student_id,
            match_type: 'peer',
            match_category: category,
            match_score: score,
            match_percentage: matchPercentage,
            match_message: matchMessage,
            match_reasons: reasons,
            status: 'pending',
            // Cache peer data
            peer_name: peer.student_name,
            peer_email: peer.student_email,
            peer_major: peer.student_major,
            peer_year: peer.student_year,
            peer_working_on: peer.what_im_working_on,
            peer_can_share: peer.what_i_can_share,
            peer_collaborate_on: peer.can_collaborate_on,
            // Cache student (requester) data
            student_name: helpRequest.student_name,
            student_major: helpRequest.student_major,
            student_year: helpRequest.student_year,
            // Cache request data
            help_types: helpRequest.help_types,
            timeline: helpRequest.timeline,
            request_description: helpRequest.description
          });
          peerMatchCount++;
        }
      }
    }
    
    // Insert matches
    const createdMatches = [];
    for (const matchData of matchesData) {
      const match = await base44.asServiceRole.entities.Match.create(matchData);
      createdMatches.push(match);
    }
    
    // Update match counts - count ALL matches for this request
    if (mode === 'for_request' && helpRequests.length > 0) {
      const allMatches = await base44.asServiceRole.entities.Match.filter({
        help_request_id: helpRequests[0].id
      });
      await base44.asServiceRole.entities.HelpRequest.update(helpRequests[0].id, {
        match_count: allMatches.length
      });
    }
    
    const parentMatches = createdMatches.filter(m => m.match_type === 'parent' || !m.match_type);
    const peerMatches = createdMatches.filter(m => m.match_type === 'peer');
    
    // Check if all matches are low quality (for messaging purposes)
    const avgScore = createdMatches.length > 0 
      ? createdMatches.reduce((sum, m) => sum + m.match_score, 0) / createdMatches.length 
      : 0;
    const isLowQualityMatches = avgScore < 15;
    
    return Response.json({
      success: true,
      matches_created: createdMatches.length,
      parent_matches: parentMatches.length,
      peer_matches: peerMatches.length,
      matches: createdMatches,
      average_score: Math.round(avgScore),
      is_growing_network: isLowQualityMatches,
      message: isLowQualityMatches 
        ? 'We found some matches! More parents in your industry are joining daily.' 
        : 'Great matches found!'
    });
    
  } catch (error) {
    console.error('Generate matches error:', error);
    return Response.json({ 
      error: 'Failed to generate matches',
      details: error.message 
    }, { status: 500 });
  }
});