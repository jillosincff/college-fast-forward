import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY');

  const {
    firstName,
    completionState,
    lastLoginDays,
    pendingFollowUps,
    unreadMessages,
    resumeScore,
    archetypeName,
    targetRoles,
    targetCompanies,
    targetIndustries,
    graduationYear,
    newAlumniCount,
    outreachStats,
  } = await req.json();

  const stateContext = `
STUDENT PROFILE:
- Name: ${firstName}
- Target Roles: ${targetRoles?.join(', ') || 'not set'}
- Target Companies: ${targetCompanies?.join(', ') || 'not set'}
- Target Industries: ${targetIndustries?.join(', ') || 'not set'}
- Graduating: ${graduationYear || 'not set'}
- Career Archetype: ${archetypeName || 'not taken'}

COMPLETION STATE:
- Career goals set: ${completionState.hasGoals}
- Resume uploaded: ${completionState.hasResume}
- Resume score: ${resumeScore || 'not scored'}
- Has searched alumni: ${completionState.hasSearchedAlumni}
- Has messaged a connection: ${completionState.hasMessaged}
- Has drafted outreach: ${completionState.hasDraftedOutreach}
- FastIQ active: ${completionState.isFastIQ}
- Career assessment taken: ${completionState.hasArchetype}
- LinkedIn reviewed: ${completionState.hasLinkedInReview}
- Mock interview done: ${completionState.hasMockInterview}

ACTIVITY:
- Days since last login: ${lastLoginDays || 0}
- Pending follow-ups due: ${pendingFollowUps || 0}
- Unread messages: ${unreadMessages || 0}
- Outreach sent: ${outreachStats?.sent || 0}
- Outreach replied: ${outreachStats?.replied || 0}
- New alumni in network this week: ${newAlumniCount || 0}
`;

  const prompt = `You are FastIQ, the AI career engine inside College Fast Forward. Generate a personalized dashboard briefing for this student.

${stateContext}

Write a briefing that is:
- 2-3 sentences maximum
- Warm, smart, and direct — like a career coach who knows them well
- Starts with their name
- Acknowledges what they've done (briefly)
- Gives ONE clear next action
- Urgent but not pushy
- Never generic — always specific to their actual data

BRIEFING RULES BY STATE:
- No goals set → push hard to set goals, it unlocks everything
- Goals set, no resume → praise goals, push resume upload
- Resume uploaded, not scored → push resume score
- Resume scored, no alumni search → reference their score + push alumni search at target companies
- Has searched alumni, no outreach → push drafting a message to someone specific
- Has outreach sent, no reply → nudge follow-up if 5+ days
- Multiple steps complete → acknowledge progress, push the next unlock
- FastIQ not active → gently mention what they're missing
- Returning after 7+ days → acknowledge absence warmly, re-engage with where they left off
- Has archetype → weave archetype name into advice occasionally

TONE EXAMPLES:
- "Hey Jill — your resume scored 74% against Marketing roles. The gap is keywords. Let's fix that before you reach out to the Disney alumni you found."
- "Welcome back, Jill. It's been a week — Jennifer Gomez still hasn't replied. Want FastIQ to draft a follow-up while you're here?"
- "Hey Jill — you're 3 steps in and already ahead of 80% of students on CFF. Next: find a UF alumni at ${targetCompanies?.[0] || 'one of your target companies'} and send your first message."

Respond with ONLY a JSON object:
{
  "greeting": "<2-3 sentence briefing>",
  "cta_label": "<short action button label e.g. 'Score My Resume' or 'Find Alumni at Disney'>",
  "cta_page": "<page name to navigate to e.g. 'ResumeTailoring' or 'AlumniSearch'>"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';

  try {
    const briefing = JSON.parse(text.replace(/```json|```/g, '').trim());
    return Response.json({ success: true, briefing });
  } catch {
    return Response.json({
      success: true,
      briefing: {
        greeting: `Hey ${firstName}! Ready to move your career forward today?`,
        cta_label: 'Go to Dashboard',
        cta_page: 'FreeTierDashboard',
      }
    });
  }
});