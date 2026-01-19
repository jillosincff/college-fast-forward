import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function getDaysSince(dateStr) {
  if (!dateStr) return 999;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function matchQuestionToParent(question, user) {
  let score = 0;
  
  const userIndustries = user.industries || [];
  const questionIndustry = question.target_industry || question.industry;
  
  if (questionIndustry && userIndustries.some(i => 
    i.toLowerCase().includes(questionIndustry.toLowerCase()) ||
    questionIndustry.toLowerCase().includes(i.toLowerCase())
  )) {
    score += 50;
  }
  
  const userHelpTypes = user.help_types || [];
  const questionHelpTypes = question.help_types || [];
  const helpMatches = questionHelpTypes.filter(h => userHelpTypes.includes(h)).length;
  score += helpMatches * 20;
  
  const daysSincePosted = getDaysSince(question.created_date);
  if (daysSincePosted < 7) score += 10;
  
  return score;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ show: false });
    }
    
    // Only show for parents/alumni
    if (user.persona !== 'parent' && user.persona !== 'alumni') {
      return Response.json({ show: false });
    }
    
    // Check days since last active
    const daysSinceActive = getDaysSince(user.last_active_at || user.updated_date);
    
    // Only show if inactive 3+ days
    if (daysSinceActive < 3) {
      return Response.json({ show: false });
    }
    
    // Get active questions
    const jobRequests = await base44.entities.JobRequest.filter({ status: 'active' });
    const helpRequests = await base44.entities.HelpRequest.filter({ status: 'active' });
    const allQuestions = [...jobRequests, ...helpRequests];
    
    // Score and filter questions
    const scoredQuestions = allQuestions.map(q => ({
      ...q,
      score: matchQuestionToParent(q, user),
      questionType: q.role ? 'job' : 'help'
    }));
    
    const matchedQuestions = scoredQuestions
      .filter(q => q.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    if (matchedQuestions.length === 0) {
      return Response.json({ show: false });
    }
    
    // Format questions for the modal
    const formattedQuestions = matchedQuestions.map(q => ({
      id: q.id,
      questionType: q.questionType,
      posterName: q.poster_name,
      major: q.student_major || q.major || 'Undeclared',
      gradYear: q.student_year || q.graduation_year,
      description: q.description,
      helpTypes: q.help_types,
      createdAt: q.created_date,
      score: q.score
    }));
    
    return Response.json({
      show: true,
      daysSinceActive,
      questions: formattedQuestions
    });
    
  } catch (error) {
    console.error('Welcome back data error:', error);
    return Response.json({ show: false });
  }
});