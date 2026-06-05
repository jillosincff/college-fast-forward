import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * findHiringManagerAtCompany
 * Uses Exa to find a relevant hiring manager at a target company based on the user's role interest.
 * For technical roles → finds engineering managers
 * For marketing roles → finds marketing managers
 * For business roles → finds business/operations managers
 * Returns the manager's name, title, LinkedIn URL, and outreach strategy.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { company_name, role_type } = await req.json();
    
    if (!company_name) {
      return Response.json({ error: 'Company name required' }, { status: 400 });
    }

    const EXA_API_KEY = Deno.env.get('EXA_API_KEY');
    if (!EXA_API_KEY) {
      return Response.json({ error: 'EXA_API_KEY not configured' }, { status: 500 });
    }

    // Map role types to manager search terms
    const managerSearchTerms = {
      'software_engineer': 'engineering manager OR "software engineering manager" OR "technical lead" OR "VP of engineering" OR "CTO"',
      'marketing': 'marketing manager OR "brand manager" OR "VP of marketing" OR "CMO" OR "growth manager"',
      'sales': 'sales manager OR "account executive" OR "VP of sales" OR "revenue manager" OR "business development manager"',
      'finance': 'finance manager OR "financial analyst" OR "VP of finance" OR "CFO" OR "investment manager"',
      'operations': 'operations manager OR "program manager" OR "VP of operations" OR "COO" OR "project manager"',
      'design': 'design manager OR "creative director" OR "VP of design" OR "head of design" OR "UX manager"',
      'product': 'product manager OR "senior product manager" OR "VP of product" OR "CPO" OR "director of product"',
      'data': 'data manager OR "analytics manager" OR "VP of data" OR "chief data officer" OR "data science manager"',
      'hr': 'HR manager OR "talent acquisition" OR "VP of people" OR "CHRO" OR "recruiting manager"',
      'general': 'hiring manager OR "team lead" OR "department manager" OR "director"',
    };

    const searchTerm = managerSearchTerms[role_type] || managerSearchTerms['general'];

    // Build Exa query to find LinkedIn profiles of managers at the company
    // Use broader search first, then filter results
    const query = `site:linkedin.com/in "${company_name}" manager OR director OR VP OR lead OR head`;

    try {
      const res = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: { 
        'x-api-key': EXA_API_KEY, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        query,
        type: 'auto',
        numResults: 10,
        contents: { highlights: { maxCharacters: 800 } },
      }),
    });

    if (!res.ok) {
      console.error('[findHiringManagerAtCompany] Exa API error:', res.status, res.statusText);
      const errorText = await res.text();
      console.error('[findHiringManagerAtCompany] Exa error details:', errorText);
      return Response.json({ 
        error: 'Exa API request failed', 
        status: res.status,
        details: errorText 
      }, { status: res.status });
    }

    const data = await res.json();
    console.log('[findHiringManagerAtCompany] Exa results count:', data.results?.length || 0);
    if (data.results?.length > 0) {
      console.log('[findHiringManagerAtCompany] First result:', data.results[0].title);
    }
      
      // Parse and rank results
      const managers = (data.results || [])
        .map(r => {
          // Extract name from LinkedIn title format: "Name - Title | Company"
          const parts = (r.title || '').split(/[|\-·]/).map(s => s.trim()).filter(Boolean);
          const full_name = parts[0]?.replace(/\s+Bio$/i, '').trim() || 'Unknown';
          
          // Try to get job title from highlights (first line usually has current role)
          const highlights = r.highlights || [];
          let job_title = '';
          if (highlights.length > 0) {
            // Extract title from first highlight - look for pattern like "Senior Director, Client Partnerships"
            const firstHighlight = highlights[0];
            // Match title patterns (e.g., "Senior Director", "VP of Marketing", "Chief Business Officer")
            const titleMatch = firstHighlight.match(/([A-Za-z\s]+(?:Manager|Director|VP|Vice President|Lead|Head|Chief|President|Officer|Engineer|Developer|Designer))[,\s]/i);
            if (titleMatch) {
              job_title = titleMatch[1].trim();
            }
          }
          // Fallback to title parts if no match
          if (!job_title && parts[1]) {
            job_title = parts[1].replace(/\[...\]/g, '').replace(/\n/g, ' ').trim().slice(0, 100);
          }
          job_title = job_title || 'Manager';
          
          return {
            full_name,
            job_title: job_title || 'Manager',
            linkedin_url: r.url,
            company: company_name,
          };
        })
        .filter(m => {
          // Filter out invalid results
          if (!m.linkedin_url?.includes('linkedin.com/in/')) return false;
          if (m.full_name === 'Unknown' || m.full_name.length < 2 || m.full_name.length > 50) return false;
          // Exclude recruiters and HR (unless HR is the target role)
          if (role_type !== 'hr' && m.job_title.toLowerCase().includes('recruiter')) return false;
          if (m.job_title.toLowerCase().includes('talent acquisition')) return false;
          return true;
        })
        .slice(0, 3); // Return top 3 managers

      if (managers.length === 0) {
        return Response.json({ 
          success: false, 
          message: 'No relevant managers found at this company',
          manager: null,
        });
      }

      // Generate outreach strategy for the top manager
      const topManager = managers[0];
      const outreachStrategy = generateOutreachStrategy(topManager, role_type, user);

      return Response.json({
        success: true,
        manager: topManager,
        additional_managers: managers.slice(1),
        outreach_strategy: outreachStrategy,
      });

    } catch (error) {
      console.error('[findHiringManagerAtCompany] Exa search failed:', error.message);
      return Response.json({ 
        error: 'Failed to find managers', 
        details: error.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[findHiringManagerAtCompany] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateOutreachStrategy(manager, role_type, user) {
  const roleContext = {
    'software_engineer': 'technical expertise and engineering challenges',
    'marketing': 'marketing initiatives and brand growth',
    'sales': 'revenue goals and market expansion',
    'finance': 'financial strategy and business performance',
    'operations': 'operational efficiency and process optimization',
    'design': 'design vision and user experience',
    'product': 'product strategy and roadmap',
    'data': 'data-driven insights and analytics',
    'hr': 'team building and talent development',
    'general': 'team goals and business objectives',
  };

  return {
    subject_line: `Question about ${manager.company} ${role_type.replace('_', ' ')} opportunities`,
    opening: `Hi ${manager.full_name.split(' ')[0]}, I noticed you lead ${roleContext[role_type] || 'your team'} at ${manager.company}.`,
    value_prop: `I'm particularly interested in how your team approaches [specific challenge related to ${role_type}].`,
    call_to_action: 'Would you be open to a brief 15-minute chat about your experience at the company?',
    tips: [
      `Mention a recent ${manager.company} news item or product launch`,
      `Reference a shared connection or university if applicable`,
      `Keep the message under 150 words`,
      `Follow up once after 5-7 days if no response`,
    ],
  };
}