import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Check for resume in Resume entity
  const resumes = await base44.entities.Resume.filter({ 
    created_by: user?.email 
  }).catch(() => []);

  const hasResumeRecord = resumes.length > 0;
  const primaryResume = resumes.find(r => r.is_active) || resumes[0];
  const hasAnalysis = !!primaryResume?.analysis_data;
  const resumeScoreFromEntity = primaryResume?.analysis_data?.score || primaryResume?.score || null;

  // Auto-trigger analysis if resume exists but no analysis yet
  if (hasResumeRecord && !hasAnalysis && primaryResume?.parsed_text) {
    const { isFastIQ } = await req.json().catch(() => ({}));
    if (isFastIQ) {
      base44.asServiceRole.functions.invoke('analyzeResumeAgainstGoals', {
        resumeText: primaryResume.parsed_text,
        careerGoals: user?.career_goals,
      }).then(async (res) => {
        if (res?.data?.analysis) {
          await base44.asServiceRole.entities.Resume.update(primaryResume.id, {
            analysis_data: res.data.analysis,
          }).catch(() => {});
        }
      }).catch(() => {}); // fire and forget
    }
  }

  const {
    firstName,
    completionState,
    lastLoginDays,
    pendingFollowUps,
    unreadMessages,
    resumeScore: receivedResumeScore,
    archetypeName,
    targetRoles,
    targetCompanies,
    targetIndustries,
    graduationYear,
    newAlumniCount,
    outreachStats,
    isFastIQ,
  } = await req.json();

  // Override with actual Resume entity data
  const actualResumeScore = resumeScoreFromEntity || receivedResumeScore || null;
  completionState.hasResume = hasResumeRecord;
  completionState.hasResumeAnalysis = hasAnalysis;

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
- Resume analyzed: ${completionState.hasResumeAnalysis}
- Resume score: ${actualResumeScore || 'not yet scored'}
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
- Resume uploaded but not analyzed yet → "Your resume is uploaded — FastIQ is scoring it now. Check back in a minute to see where you stand."
- Resume uploaded and scored → reference actual score + push next step:
  - Under 60: "Fix resume first — let's improve these gaps before outreach"
  - 60-80: "Good foundation — let's tailor this and start reaching out"
  - 80+: "You're ready — go find alumni at your target companies"
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

  const text = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: 'claude_sonnet_4_6',
  });

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