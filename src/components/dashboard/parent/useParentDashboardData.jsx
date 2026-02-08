import { useState, useEffect, useCallback } from 'react';
import { JobRequest } from '@/entities/JobRequest';
import { JobAnswer } from '@/entities/JobAnswer';
import { Opportunity } from '@/entities/Opportunity';
import { base44 } from '@/api/base44Client';

// Scoring weights for question matching
const MATCH_WEIGHTS = {
  INDUSTRY_MATCH: 50,
  JOB_FUNCTION_MATCH: 40,
  SKILL_OVERLAP: 10, // per skill
  RECENCY_BOOST: 20, // questions < 24h old
  UNANSWERED_BOOST: 25,
};

// Calculate match score between a question and parent's profile
function calculateMatchScore(question, parentProfile) {
  let score = 0;
  let matchReasons = [];

  // Industry match
  const parentIndustry = parentProfile.industry?.toLowerCase() || '';
  const questionIndustry = question.target_industry?.toLowerCase() || '';
  
  if (parentIndustry && questionIndustry && 
      (parentIndustry.includes(questionIndustry) || questionIndustry.includes(parentIndustry))) {
    score += MATCH_WEIGHTS.INDUSTRY_MATCH;
    matchReasons.push(`Matches your ${parentProfile.industry} background`);
  }

  // Job function match
  const parentTitle = parentProfile.title?.toLowerCase() || '';
  const parentCompany = parentProfile.company?.toLowerCase() || '';
  const questionText = `${question.title || ''} ${question.description || ''} ${question.role || ''}`.toLowerCase();
  
  const jobFunctions = ['marketing', 'finance', 'engineering', 'sales', 'product', 'operations', 'hr', 'legal', 'consulting', 'healthcare', 'tech', 'software'];
  for (const func of jobFunctions) {
    if ((parentTitle.includes(func) || parentCompany.includes(func)) && questionText.includes(func)) {
      score += MATCH_WEIGHTS.JOB_FUNCTION_MATCH;
      matchReasons.push(`Related to your ${func} experience`);
      break;
    }
  }

  // Skill overlap
  const parentSkills = parentProfile.skills || parentProfile.expertise_areas || [];
  const questionSkills = question.tags || [];
  const matchedSkills = parentSkills.filter(skill => 
    questionSkills.some(qs => qs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(qs.toLowerCase())) ||
    questionText.includes(skill.toLowerCase())
  );
  if (matchedSkills.length > 0) {
    score += matchedSkills.length * MATCH_WEIGHTS.SKILL_OVERLAP;
    if (!matchReasons.length) {
      matchReasons.push(`Matches your ${matchedSkills[0]} expertise`);
    }
  }

  // Recency boost (questions less than 24 hours old)
  const questionAge = Date.now() - new Date(question.created_date).getTime();
  const hoursOld = questionAge / (1000 * 60 * 60);
  if (hoursOld < 24) {
    score += MATCH_WEIGHTS.RECENCY_BOOST;
  }

  // Unanswered boost
  if ((question.answer_count || 0) === 0) {
    score += MATCH_WEIGHTS.UNANSWERED_BOOST;
  }

  return { score, matchReasons, isMatch: score >= MATCH_WEIGHTS.INDUSTRY_MATCH };
}

export function useParentDashboardData(user) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    linkedStudent: null,
    studentQueueStatus: { hasActiveRequest: false, position: null },
    matchedQuestions: [],
    allQuestionsCount: 0,
    matchedCount: 0,
    newTodayCount: 0,
    myJobs: [],
    studentsHelped: 0,
    familyKarma: 0,
    leaderboard: [],
    recentActivity: [],
    parentIndustry: null,
  });

  const loadData = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Parallel fetch all data
      const [jobRequestsResult, opportunitiesResult, familyStudentsResult, familyKarmaResult, answersResult] = await Promise.allSettled([
        JobRequest.filter({ status: 'active' }),
        Opportunity.filter({ created_by: user.email }),
        base44.functions.invoke('getFamilyStudents', {}),
        user.family_group_id ? base44.functions.invoke('getFamilyKarma', { family_group_id: user.family_group_id }) : Promise.resolve({ data: { total_karma: 0 } }),
        JobAnswer.filter({ responder_email: user.email }),
      ]);

      // Process linked students
      let linkedStudent = null;
      let studentQueueStatus = { hasActiveRequest: false, position: null };
      
      if (familyStudentsResult.status === 'fulfilled' && familyStudentsResult.value?.data?.students?.length > 0) {
        const students = familyStudentsResult.value.data.students;
        linkedStudent = students[0];
        
        // Check if student has active request (privacy-safe - we only check existence, not content)
        if (jobRequestsResult.status === 'fulfilled') {
          const studentEmails = students.map(s => s.email);
          const studentRequest = jobRequestsResult.value?.find(r => 
            studentEmails.includes(r.poster_email) && r.status === 'active'
          );
          
          if (studentRequest) {
            // Calculate position based on karma-weighted priority
            const allActive = jobRequestsResult.value.filter(r => r.status === 'active');
            const sortedByPriority = [...allActive].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
            const position = sortedByPriority.findIndex(r => r.id === studentRequest.id) + 1;
            
            studentQueueStatus = {
              hasActiveRequest: true,
              position: position || Math.floor(Math.random() * 20) + 5, // Fallback for demo
            };
          }
        }
      }

      // Process questions with smart matching
      let matchedQuestions = [];
      let allQuestionsCount = 0;
      let matchedCount = 0;
      let newTodayCount = 0;
      
      if (jobRequestsResult.status === 'fulfilled') {
        const allQuestions = jobRequestsResult.value || [];
        allQuestionsCount = allQuestions.length;
        
        // Count new today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        newTodayCount = allQuestions.filter(q => new Date(q.created_date) >= today).length;
        
        // Build parent profile for matching
        const parentProfile = {
          industry: user.industry || user.target_industry,
          title: user.title || user.job_title,
          company: user.company,
          skills: user.skills || user.expertise_areas || [],
        };

        // Score and sort questions
        const scoredQuestions = allQuestions.map(q => {
          const { score, matchReasons, isMatch } = calculateMatchScore(q, parentProfile);
          return { ...q, matchScore: score, matchReasons, isMatch };
        });

        // Sort by match score (highest first)
        scoredQuestions.sort((a, b) => b.matchScore - a.matchScore);
        
        matchedCount = scoredQuestions.filter(q => q.isMatch).length;
        matchedQuestions = scoredQuestions.slice(0, 5); // Top 5 for display
      }

      // Process jobs
      const myJobs = opportunitiesResult.status === 'fulfilled' ? (opportunitiesResult.value || []) : [];

      // Family karma
      const familyKarma = familyKarmaResult.status === 'fulfilled' 
        ? (familyKarmaResult.value?.data?.total_karma || user?.karma_points || 0)
        : (user?.karma_points || 0);

      // Students helped - count unique students from answers, fall back to user field
      let studentsHelpedCount = user?.students_helped_count || 0;
      if (answersResult.status === 'fulfilled') {
        const answers = answersResult.value || [];
        // Count unique job_request_ids as a proxy for unique students helped
        const uniqueStudents = new Set(answers.map(a => a.job_request_id));
        studentsHelpedCount = Math.max(studentsHelpedCount, uniqueStudents.size);
      }

      // Mock leaderboard (would come from backend in production)
      const leaderboard = [
        { rank: 1, name: "Patricia M.", helped: 47, isYou: false },
        { rank: 2, name: "Robert S.", helped: 41, isYou: false },
        { rank: 3, name: "Jennifer L.", helped: 38, isYou: false },
        { rank: 4, name: "Michael T.", helped: 29, isYou: false },
        { rank: 5, name: "You", helped: user?.students_helped_count || 0, isYou: true },
      ];

      // Mock recent activity
      const recentActivity = [
        { type: 'help', name: 'Sarah M.', action: 'just helped a Finance student' },
        { type: 'job', name: 'David R.', action: 'posted a Marketing role' },
        { type: 'best', name: 'Lisa K.', action: 'earned Best Answer 🏆' },
      ];

      setData({
        linkedStudent,
        studentQueueStatus,
        matchedQuestions,
        allQuestionsCount,
        matchedCount,
        newTodayCount,
        myJobs,
        studentsHelped: studentsHelpedCount,
        familyKarma,
        leaderboard,
        recentActivity,
        parentIndustry: user.industry || user.target_industry || null,
      });

    } catch (error) {
      console.error('Failed to load parent dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { loading, data, refresh: loadData };
}