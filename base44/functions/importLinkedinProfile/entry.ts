import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { linkedinUrl } = await req.json();

    if (!linkedinUrl || !linkedinUrl.includes('linkedin.com')) {
      return Response.json({ error: 'Invalid LinkedIn URL' }, { status: 400 });
    }

    // Use Firecrawl to scrape the profile
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: linkedinUrl,
        formats: ['markdown'],
      }),
    });

    if (!scrapeResponse.ok) {
      console.error('Firecrawl scrape failed:', scrapeResponse.status);
      return Response.json({ error: 'Could not scrape LinkedIn profile' }, { status: 400 });
    }

    const scrapedData = await scrapeResponse.json();
    const markdown = scrapedData.data?.markdown || '';

    // Parse the markdown to extract structured data
    const extracted = parseLinkedInMarkdown(markdown);

    return Response.json({
      success: true,
      name: extracted.name,
      headline: extracted.headline,
      experience: extracted.experience,
      education: extracted.education,
      skills: extracted.skills,
    });
  } catch (error) {
    console.error('LinkedIn import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function parseLinkedInMarkdown(markdown) {
  const result = {
    name: '',
    headline: '',
    experience: [],
    education: [],
    skills: [],
  };

  // Extract name (usually first heading or prominent text)
  const nameMatch = markdown.match(/^#\s+(.+?)$/m);
  if (nameMatch) {
    result.name = nameMatch[1].trim();
  }

  // Extract headline
  const headlineMatch = markdown.match(/##\s+(.+?)(?:\n|$)/);
  if (headlineMatch) {
    result.headline = headlineMatch[1].trim();
  }

  // Extract experience section
  const expSection = markdown.match(/#+\s*(?:Experience|Work Experience)([\s\S]*?)(?=#+\s*(?:Education|Skills|$))/i);
  if (expSection) {
    const expText = expSection[1];
    // Look for job entries (usually with company and role patterns)
    const jobMatches = expText.match(/[•\-]\s*(.+?)(?:at|@)\s*(.+?)(?:\n|$)/gi);
    if (jobMatches) {
      jobMatches.forEach(job => {
        const match = job.match(/[•\-]\s*(.+?)(?:at|@)\s*(.+?)(?:\n|$)/i);
        if (match) {
          result.experience.push({
            title: match[1].trim(),
            company: match[2].trim(),
            description: '',
          });
        }
      });
    }
  }

  // Extract education section
  const eduSection = markdown.match(/#+\s*Education([\s\S]*?)(?=#+\s*(?:Skills|$))/i);
  if (eduSection) {
    const eduText = eduSection[1];
    const schoolMatches = eduText.match(/[•\-]\s*(.+?)(?:\n|$)/gi);
    if (schoolMatches) {
      schoolMatches.forEach(school => {
        const cleaned = school.replace(/[•\-]\s*/, '').trim();
        if (cleaned) {
          result.education.push({
            school: cleaned,
            degree: '',
            field: '',
            year: '',
          });
        }
      });
    }
  }

  // Extract skills
  const skillsSection = markdown.match(/#+\s*Skills([\s\S]*?)(?=#+\s*|$)/i);
  if (skillsSection) {
    const skillsText = skillsSection[1];
    const skillMatches = skillsText.match(/[•\-]\s*(.+?)(?:\n|$)/gi);
    if (skillMatches) {
      skillMatches.forEach(skill => {
        const cleaned = skill.replace(/[•\-]\s*/, '').trim();
        if (cleaned) {
          result.skills.push(cleaned);
        }
      });
    }
  }

  return result;
}