import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const RELATED_INDUSTRIES = [
  ['Technology & Software', 'Engineering'],
  ['Finance & Banking', 'Consulting', 'Real Estate'],
  ['Marketing', 'Media & Entertainment', 'Advertising', 'Communications', 'PR', 'Digital Marketing'],
  ['Healthcare', 'Non-Profit', 'Education'],
  ['Law & Legal', 'Government', 'Consulting'],
  ['Retail', 'Hospitality', 'Manufacturing'],
  // Sports/entertainment adjacencies — a parent at ESPN in finance is still valuable to a sports student
  ['Media & Entertainment', 'Hospitality', 'Retail', 'Marketing'],
];

// Broader keyword-based industry matching for edge cases (e.g. "Sport Management" student)
const INDUSTRY_KEYWORDS = {
  'marketing': ['marketing', 'advertising', 'media', 'communications', 'pr', 'digital', 'brand', 'content', 'social media'],
  'media & entertainment': ['media', 'entertainment', 'sports', 'broadcasting', 'film', 'music', 'gaming', 'events', 'recreation'],
  'technology & software': ['tech', 'software', 'engineering', 'data', 'ai', 'cloud', 'cyber', 'it'],
  'finance & banking': ['finance', 'banking', 'investment', 'accounting', 'insurance', 'wealth', 'private equity', 'venture'],
  'consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
  'healthcare': ['health', 'medical', 'pharma', 'biotech', 'hospital', 'clinical'],
  'law & legal': ['law', 'legal', 'attorney', 'compliance', 'regulatory'],
  'education': ['education', 'teaching', 'academic', 'university', 'school'],
  'real estate': ['real estate', 'property', 'construction', 'development'],
  'hospitality': ['hospitality', 'hotel', 'restaurant', 'tourism', 'travel', 'events'],
  'retail': ['retail', 'ecommerce', 'consumer', 'merchandise'],
  'non-profit': ['nonprofit', 'non-profit', 'ngo', 'charity', 'foundation'],
  'government': ['government', 'public', 'policy', 'federal', 'state'],
  'manufacturing': ['manufacturing', 'supply chain', 'logistics', 'operations'],
};

const RELATED_MAJORS = [
  ['Computer Science', 'Information Systems', 'Data Science', 'Software Engineering'],
  ['Marketing', 'Business Administration', 'Communications', 'Advertising'],
  ['Finance', 'Accounting', 'Economics', 'Business Administration'],
  ['Engineering', 'Computer Science', 'Physics', 'Mathematics'],
  ['Biology', 'Chemistry', 'Pre-Med', 'Healthcare Administration'],
  ['Psychology', 'Sociology', 'Social Work', 'Human Resources']
];

function isRelatedIndustry(industry1, industry2) {
  if (!industry1 || !industry2) return false;
  const i1 = industry1.toLowerCase().trim();
  const i2 = industry2.toLowerCase().trim();
  
  // Exact match (case-insensitive)
  if (i1 === i2) return true;
  
  // Check predefined related groups
  const groupMatch = RELATED_INDUSTRIES.some(group => {
    const lower = group.map(g => g.toLowerCase());
    return lower.includes(i1) && lower.includes(i2);
  });
  if (groupMatch) return true;
  
  // Keyword-based fuzzy matching — does parent's industry/company/role relate to student's target?
  // e.g. student wants "marketing", parent works in "Media & Entertainment" → keywords overlap
  for (const [, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    const i1Matches = keywords.some(k => i1.includes(k) || k.includes(i1));
    const i2Matches = keywords.some(k => i2.includes(k) || k.includes(i2));
    if (i1Matches && i2Matches) return true;
  }
  
  return false;
}

// Check if a parent's company or role is relevant to a student's description/major
function isCompanyRelevantToStudent(parentExpertise, helpRequest) {
  const company = (parentExpertise.current_company || '').toLowerCase();
  const role = (parentExpertise.current_role || '').toLowerCase();
  const desc = (helpRequest.description || '').toLowerCase();
  const major = (helpRequest.student_major || '').toLowerCase();
  
  // Sports-related companies are relevant to sport management students
  const sportsKeywords = ['espn', 'nike', 'nfl', 'nba', 'mlb', 'nhl', 'mls', 'pga', 'ufc', 'wwe', 'fox sports', 'turner sports', 'under armour', 'adidas', 'fanatics', 'ticketmaster', 'live nation', 'img', 'octagon', 'wasserman', 'caa sports', 'endeavor', 'disney', 'comcast', 'nbcuniversal'];
  const isSportsMajor = major.includes('sport') || major.includes('athletic') || desc.includes('sport') || desc.includes('athletic');
  
  if (isSportsMajor && sportsKeywords.some(k => company.includes(k) || role.includes(k))) {
    return true;
  }
  
  // Check if company/role keywords appear in the student's description
  if (desc && company) {
    const companyWords = company.split(/\s+/).filter(w => w.length > 3);
    if (companyWords.some(w => desc.includes(w))) return true;
  }
  
  return false;
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

// Convert raw score to percentage (max 100 points = 99%)
function scoreToPercentage(score) {
  return Math.min(Math.round((score / 100) * 100), 99);
}

// Generate quirky match message based on score
function getMatchMessage(score, category) {
  if (score >= 70) {
    return "🎯 Excellent match! Highly relevant experience.";
  } else if (score >= 50) {
    return "💪 Great match! Can definitely help.";
  } else if (score >= 35) {
    return "👍 Solid match. Worth reaching out!";
  } else if (score >= 20) {
    return "🤝 Good general career advice available.";
  } else {
    return "🌱 Growing network - every connection counts!";
  }
}

function calculateParentMatchScore(helpRequest, parentExpertise) {
  let score = 0;
  const reasons = [];
  
  // ═══════════════════════════════════════════════════════
  // TIER 1: HELP TYPE MATCH (0-40 points) - MOST IMPORTANT
  // ═══════════════════════════════════════════════════════
  const helpTypeLabels = {
    'career_advice': 'Career advice',
    'internship_leads': 'Internship leads',
    'resume_review': 'Resume review',
    'interview_prep': 'Interview prep',
    'industry_insights': 'Industry insights',
    'networking_intros': 'Networking intros',
    'informational_interview': 'Informational interviews'
  };
  
  const helpTypeMatches = (helpRequest.help_types || []).filter(type => 
    (parentExpertise.help_types || []).includes(type)
  );
  
  // Each matching help type = 10 points
  score += helpTypeMatches.length * 10;
  
  if (helpTypeMatches.length > 0) {
    const matchedLabels = helpTypeMatches.map(t => helpTypeLabels[t] || t);
    reasons.push(`Can help with: ${matchedLabels.join(', ')}`);
  }
  
  // Bonus: Parent has PROVEN they help students
  const studentsHelped = parentExpertise.students_helped || 0;
  if (studentsHelped > 10) {
    score += 10;
    reasons.push(`✅ Helped ${studentsHelped} students`);
  } else if (studentsHelped > 5) {
    score += 5;
    reasons.push(`Helped ${studentsHelped} students`);
  } else if (studentsHelped > 0) {
    score += 2;
  }
  
  // ═══════════════════════════════════════════════════════
  // TIER 2: RESPONSIVENESS (0-30 points) - SECOND MOST IMPORTANT
  // ═══════════════════════════════════════════════════════
  const responseRate = parentExpertise.response_rate || 0;
  const avgResponseHours = parentExpertise.avg_response_hours || 24;
  
  // Response rate (0-15 points)
  if (responseRate >= 0.9) {
    score += 15;
    reasons.push('⚡ Quick responder (responds to 90%+ messages)');
  } else if (responseRate >= 0.7) {
    score += 10;
    reasons.push('Responds to most messages');
  } else if (responseRate >= 0.5) {
    score += 5;
  }
  
  // Average response time (0-15 points)
  if (avgResponseHours <= 4) {
    score += 15;
    reasons.push('💨 Responds within hours');
  } else if (avgResponseHours <= 24) {
    score += 10;
    reasons.push('Responds within 24h');
  } else if (avgResponseHours <= 48) {
    score += 5;
    reasons.push('Responds within 2 days');
  }
  
  // ═══════════════════════════════════════════════════════
  // TIER 3: INDUSTRY MATCH (0-15 points) - NICE TO HAVE
  // ═══════════════════════════════════════════════════════
  if (helpRequest.industry === parentExpertise.industry) {
    score += 15;
    reasons.push(`${parentExpertise.industry} industry expert`);
  } else if (isRelatedIndustry(helpRequest.industry, parentExpertise.industry)) {
    score += 8;
    reasons.push(`Related industry (${parentExpertise.industry})`);
  } else {
    // Everyone gets SOME points - general career advice is valuable
    score += 2;
    reasons.push('General career expertise');
  }
  
  // ═══════════════════════════════════════════════════════
  // TIER 4: EXPERIENCE (0-15 points)
  // ═══════════════════════════════════════════════════════
  if (parentExpertise.years_experience === '20+') {
    score += 15;
    reasons.push('20+ years experience');
  } else if (parentExpertise.years_experience === '15-20') {
    score += 12;
    reasons.push('15-20 years experience');
  } else if (parentExpertise.years_experience === '10-15') {
    score += 8;
    reasons.push('10-15 years experience');
  } else {
    score += 3;
    reasons.push(`${parentExpertise.years_experience || '5+'} years experience`);
  }
  
  // ═══════════════════════════════════════════════════════
  // BONUS: Company Connections (0-10 points)
  // ═══════════════════════════════════════════════════════
  if (parentExpertise.company_connections && helpRequest.description) {
    const companies = parentExpertise.company_connections.toLowerCase().split(',');
    const mentionedCompany = companies.some(company => 
      helpRequest.description.toLowerCase().includes(company.trim())
    );
    if (mentionedCompany) {
      score += 10;
      reasons.push('🎯 Has connections at companies you mentioned');
    }
  }
  
  // ═══════════════════════════════════════════════════════
  // BONUS MULTIPLIERS
  // ═══════════════════════════════════════════════════════
  
  // Parent marked as "Super Helper" (admin flagged)
  if (parentExpertise.is_super_helper) {
    score = Math.round(score * 1.2); // 20% boost
    reasons.unshift('🌟 Top-rated helper');
  }
  
  // Parent recently active (last 7 days)
  if (parentExpertise.last_active_at) {
    const daysSinceActive = (Date.now() - new Date(parentExpertise.last_active_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive <= 7) {
      score += 5;
      reasons.push('Recently active');
    }
  }
  
  // Fast responder badge
  if (parentExpertise.is_fast_responder) {
    reasons.unshift('⚡ Fast responder');
  }
  
  // ═══════════════════════════════════════════════════════
  // URGENCY-BASED BOOSTS
  // ═══════════════════════════════════════════════════════
  
  // If student needs help ASAP, boost fast responders
  if (helpRequest.timeline === 'this_week' && avgResponseHours <= 4) {
    score += 10;
    reasons.push('🚨 Available for urgent help');
  }
  
  // If student is exploring, boost experienced mentors
  if (helpRequest.timeline === 'no_rush' && 
      (parentExpertise.years_experience === '20+' || parentExpertise.years_experience === '15-20')) {
    score += 5;
    reasons.push('Great for career exploration');
  }
  
  // MINIMUM SCORE: Every parent gets at least 5 points
  score = Math.max(score, 5);
  
  // Determine category
  const category = score >= 40 ? 'high' : 'broader';
  
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
    
    // CRITICAL: Always take TOP 10 parents (more options = better)
    // But boost requests from students with active karma boosts get more matches
    const karmaBoost = helpRequests[0]?.karma_boost || 0;
    const boostActive = karmaBoost > 0 && (!helpRequests[0]?.boosted_until || new Date(helpRequests[0].boosted_until) > new Date());
    const MIN_MATCHES = boostActive ? Math.min(15, allScoredParents.length) : 10;
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