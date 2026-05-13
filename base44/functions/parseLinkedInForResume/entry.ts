import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { linkedInUrl, linkedInJson } = await req.json();

    if (!linkedInUrl && !linkedInJson) {
      return Response.json(
        { error: 'Either linkedInUrl or linkedInJson is required' },
        { status: 400 }
      );
    }

    let profileData = linkedInJson;

    // If URL provided, use Firecrawl to scrape
    if (linkedInUrl && !linkedInJson) {
      const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('FIRECRAWL_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: linkedInUrl,
          formats: ['markdown'],
        }),
      });

      if (!firecrawlRes.ok) {
        return Response.json(
          { error: 'Failed to scrape LinkedIn profile' },
          { status: 400 }
        );
      }

      const scrapeData = await firecrawlRes.json();
      profileData = parseMarkdownProfile(scrapeData.markdown);
    }

    // Extract structured data for resume
    const extracted = extractResumeData(profileData);

    return Response.json({
      success: true,
      careerObjective: extracted.careerObjective,
      experience: extracted.experience,
      education: extracted.education,
      skills: extracted.skills,
      headline: extracted.headline,
      summary: extracted.summary,
      rawProfile: profileData,
    });
  } catch (error) {
    console.error('LinkedIn parsing error:', error);
    return Response.json(
      { error: error.message || 'Failed to parse LinkedIn profile' },
      { status: 500 }
    );
  }
});

// Parse markdown content from Firecrawl scrape
function parseMarkdownProfile(markdown) {
  if (!markdown) return {};

  const result = {
    headline: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
  };

  const lines = markdown.split('\n');
  let currentSection = '';
  let currentEntry = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect sections
    if (line.toLowerCase().includes('about') || line.toLowerCase().includes('summary')) {
      currentSection = 'summary';
      continue;
    }
    if (line.toLowerCase().includes('experience') || line.toLowerCase().includes('work')) {
      currentSection = 'experience';
      continue;
    }
    if (line.toLowerCase().includes('education')) {
      currentSection = 'education';
      continue;
    }
    if (line.toLowerCase().includes('skill')) {
      currentSection = 'skills';
      continue;
    }

    // Parse headline (usually first non-empty line or in About section)
    if (!result.headline && line && !line.startsWith('#') && i < 5) {
      result.headline = line;
    }

    // Parse content based on section
    if (currentSection === 'summary' && line && !line.startsWith('#')) {
      result.summary += (result.summary ? ' ' : '') + line;
    } else if (currentSection === 'experience') {
      if (line.startsWith('**') || line.startsWith('### ')) {
        if (currentEntry.title) {
          result.experience.push(currentEntry);
        }
        currentEntry = { title: line.replace(/\*\*|###\s/g, ''), description: '' };
      } else if (line && currentEntry.title) {
        currentEntry.description += (currentEntry.description ? ' ' : '') + line;
      }
    } else if (currentSection === 'education') {
      if (line.startsWith('**') || line.startsWith('### ')) {
        if (currentEntry.school) {
          result.education.push(currentEntry);
        }
        currentEntry = { school: line.replace(/\*\*|###\s/g, ''), degree: '' };
      } else if (line && currentEntry.school) {
        currentEntry.degree += (currentEntry.degree ? ' ' : '') + line;
      }
    } else if (currentSection === 'skills' && line && !line.startsWith('#')) {
      result.skills.push(line.replace(/^[-*]\s/, ''));
    }
  }

  // Push last entries
  if (currentEntry.title && currentSection === 'experience') {
    result.experience.push(currentEntry);
  }
  if (currentEntry.school && currentSection === 'education') {
    result.education.push(currentEntry);
  }

  return result;
}

// Extract structured resume data from profile
function extractResumeData(profile) {
  const headline = profile.headline || '';
  const summary = profile.summary || '';

  // Generate career objective from headline and summary
  const careerObjective =
    `Seeking a role where I can leverage my expertise in ${extractKeySkills(headline, summary).slice(0, 3).join(', ')}. ${summary.substring(0, 150)}...`;

  // Format experience with metrics and impact
  const experience = (profile.experience || []).map((exp) => ({
    role: exp.title || '',
    description: exp.description || '',
    bullets: extractBullets(exp.description),
  }));

  // Format education
  const education = (profile.education || []).map((edu) => ({
    school: edu.school || '',
    degree: edu.degree || '',
  }));

  // Extract and deduplicate skills
  const skills = [...new Set([...profile.skills, ...extractKeySkills(headline, summary)])].filter(Boolean);

  return {
    careerObjective: careerObjective.substring(0, 500),
    experience,
    education,
    skills: skills.slice(0, 15),
    headline,
    summary,
  };
}

// Extract key skills from text
function extractKeySkills(text1 = '', text2 = '') {
  const combined = `${text1} ${text2}`.toLowerCase();
  const skillKeywords = [
    'leadership',
    'management',
    'communication',
    'strategy',
    'marketing',
    'sales',
    'product',
    'design',
    'engineering',
    'analytics',
    'data',
    'python',
    'javascript',
    'react',
    'aws',
    'cloud',
    'agile',
    'project',
  ];

  return skillKeywords.filter((skill) => combined.includes(skill));
}

// Extract bullet points from description
function extractBullets(text = '') {
  if (!text) return [];
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .slice(0, 3);
}