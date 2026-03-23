import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { request_id } = await req.json();

    if (!request_id) {
      return Response.json({ error: 'request_id is required' }, { status: 400 });
    }

    // Get the request details
    const request = await base44.asServiceRole.entities.JobRequest.get(request_id);
    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Build search query from request
    const searchTerms = [
      request.role,
      request.target_industry,
      request.target_company,
      request.description
    ].filter(Boolean).join(' ');

    // Use LLM to find semantic matches
    const matchingParentsResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Given this student's help request:
      
Role: ${request.role || 'Not specified'}
Industry: ${request.target_industry || 'Not specified'}
Company: ${request.target_company || 'Not specified'}
Description: ${request.description || 'Not specified'}

I need you to extract key terms and skills that would make someone a good match to help this student. Return a JSON object with:
- key_terms: array of important keywords (industry, role, company, skills)
- ideal_background: string describing the ideal helper profile
- match_summary: short phrase about what makes this a good match

Example: For "Software Engineer at Google", return:
{
  "key_terms": ["software engineering", "google", "tech", "programming", "FAANG"],
  "ideal_background": "someone with software engineering experience, especially at tech companies or FAANG",
  "match_summary": "tech industry experience"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          key_terms: { type: "array", items: { type: "string" } },
          ideal_background: { type: "string" },
          match_summary: { type: "string" }
        }
      }
    });

    // Get all parents
    const parents = await base44.asServiceRole.entities.User.filter({
      persona: 'parent'
    });

    // Also get alumni users
    const alumni = await base44.asServiceRole.entities.User.filter({
      persona: 'alumni'
    });
    const allHelpers = [...parents, ...alumni];

    // Related industry groups for broader matching
    const RELATED_INDUSTRY_GROUPS = [
      ['technology & software', 'engineering'],
      ['finance & banking', 'consulting', 'real estate'],
      ['marketing', 'media & entertainment', 'advertising', 'communications', 'pr', 'digital marketing'],
      ['healthcare', 'non-profit', 'education'],
      ['law & legal', 'government', 'consulting'],
      ['retail', 'hospitality', 'manufacturing'],
      ['media & entertainment', 'hospitality', 'retail', 'marketing'],
    ];

    // Sports-adjacent companies — relevant for sport management students
    const SPORTS_KEYWORDS = ['espn', 'nike', 'nfl', 'nba', 'mlb', 'nhl', 'mls', 'pga', 'ufc', 'fox sports', 'under armour', 'adidas', 'fanatics', 'ticketmaster', 'live nation', 'img', 'octagon', 'wasserman', 'disney', 'comcast', 'nbcuniversal'];

    const requestDesc = (request.description || '').toLowerCase();
    const requestIndustry = (request.target_industry || '').toLowerCase();
    const studentMajor = (request.student_major || '').toLowerCase();
    const isSportsRelated = studentMajor.includes('sport') || requestDesc.includes('sport') || requestDesc.includes('athletic');

    function isRelatedIndustry(i1, i2) {
      if (!i1 || !i2) return false;
      const a = i1.toLowerCase(), b = i2.toLowerCase();
      if (a === b) return true;
      return RELATED_INDUSTRY_GROUPS.some(g => g.includes(a) && g.includes(b));
    }

    // Score each helper based on profile match
    const scoredParents = [];
    
    for (const parent of allHelpers) {
      // Relaxed filter: only skip if we have truly nothing to work with
      if (!parent.job_title && !parent.current_company && !parent.industry && !parent.bio) {
        continue;
      }

      const parentProfile = `${parent.job_title || ''} at ${parent.current_company || ''}. ${parent.industry || ''}. ${parent.bio || ''}`.toLowerCase();
      
      let score = 0;
      const matchReasons = [];

      // Check for keyword matches from LLM analysis
      for (const term of (matchingParentsResult.key_terms || [])) {
        if (parentProfile.includes(term.toLowerCase())) {
          score += 10;
          matchReasons.push(term);
        }
      }

      // Exact industry match
      if (parent.industry && requestIndustry && 
          parent.industry.toLowerCase().includes(requestIndustry)) {
        score += 20;
        matchReasons.push(`${parent.industry} industry`);
      }
      // Related industry match (broadened)
      else if (parent.industry && requestIndustry && isRelatedIndustry(requestIndustry, parent.industry.toLowerCase())) {
        score += 12;
        matchReasons.push(`Related field (${parent.industry})`);
      }

      // Company match (exact or similar)
      if (parent.current_company && request.target_company &&
          parent.current_company.toLowerCase().includes(request.target_company.toLowerCase())) {
        score += 30;
        matchReasons.push(`works at ${parent.current_company}`);
      }

      // Sports adjacency — a parent at ESPN/Nike/etc is valuable to a sports management student
      if (isSportsRelated && parent.current_company) {
        const company = parent.current_company.toLowerCase();
        if (SPORTS_KEYWORDS.some(k => company.includes(k))) {
          score += 25;
          matchReasons.push(`works at ${parent.current_company} (sports-adjacent)`);
        }
      }

      // BROADENED: If still 0 score but parent has substantial experience, give base points
      // Any parent willing to help has value — general career advice matters
      if (score === 0 && (parent.job_title || parent.current_company)) {
        score += 3;
        matchReasons.push('General career experience');
      }

      if (score > 0) {
        scoredParents.push({
          parent,
          score,
          matchReasons,
          matchSummary: matchReasons.join(', ')
        });
      }
    }

    // Sort by score and take top 10 (increased from 5)
    scoredParents.sort((a, b) => b.score - a.score);
    const topMatches = scoredParents.slice(0, 10);

    // Send notifications to matched parents
    const notificationPromises = topMatches.map(async ({ parent, matchSummary }) => {
      const subject = `💬 A UF student asked a question you can answer`;
      const body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0021A5;">💬 A student just asked a question that matches your expertise</h2>
          
          <p>Hi ${parent.full_name || 'there'},</p>
          
          <p>A <strong>UF student</strong> asked a question, and your experience makes you a great person to share advice:</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0021A5;">
            <p style="margin: 0; color: #1f2937; font-size: 16px; font-style: italic;">"${request.description ? request.description.substring(0, 250) + (request.description.length > 250 ? '...' : '') : 'Career guidance needed'}"</p>
            ${request.target_industry ? `<p style="margin: 15px 0 0 0; color: #64748b; font-size: 14px;">Looking for advice about: <strong>${request.target_industry}</strong></p>` : ''}
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>🎯 Why you're a great match:</strong><br/>
              Your experience in <strong>${matchSummary}</strong> is exactly what this student needs!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://collegefastforward.com/#Connections" 
               style="background-color: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Share Your Advice 🐊
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            Your experience can make a real difference. Takes just a few minutes to share your perspective! 🧡💙
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px;">
            You're receiving this because your profile matches this student's question. 
            <a href="https://collegefastforward.com/#Profile">Update your notification preferences</a>
          </p>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: parent.email,
        subject,
        body
      });

      // Create notification record
      await base44.asServiceRole.entities.Notification.create({
        user_id: parent.id,
        type: 'matching_request',
        title: `A student asked a question you can answer`,
        message: `"${request.description?.substring(0, 100) || 'Career question'}..." - Your experience in ${matchSummary} is a great match.`,
        link: `/#Connections`,
        is_read: false,
        metadata: {
          request_id: request.id,
          match_score: matchSummary
        }
      });
    });

    await Promise.all(notificationPromises);

    return Response.json({ 
      success: true, 
      notified_count: topMatches.length,
      top_matches: topMatches.map(m => ({ 
        email: m.parent.email, 
        score: m.score, 
        match: m.matchSummary 
      }))
    });

  } catch (error) {
    console.error('Failed to notify matching parents:', error);
    return Response.json({ 
      error: 'Failed to notify parents',
      details: error.message 
    }, { status: 500 });
  }
});