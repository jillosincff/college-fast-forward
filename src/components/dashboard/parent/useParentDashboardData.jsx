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
    studentRequest: null,
    studentQueueStatus: { hasActiveRequest: false, position: null, totalQuestions: 0 },
    matchedQuestions: [],
    allQuestionsCount: 0,
    matchedCount: 0,
    newTodayCount: 0,
    unansweredCount: 0,
    myJobs: [],
    studentsHelped: 0,
    familyKarma: 0,
    familyKarmaLevel: 'none',
    familyBoostMultiplier: 0,
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
        base44.functions.invoke('getFamilyKarma', {}),
        JobAnswer.filter({ responder_email: user.email }),
      ]);

      // Process linked students
      let linkedStudent = null;
      let studentRequest = null;
      let studentQueueStatus = { hasActiveRequest: false, position: null, totalQuestions: 0 };
      
      if (familyStudentsResult.status === 'fulfilled' && familyStudentsResult.value?.data?.students?.length > 0) {
        const students = familyStudentsResult.value.data.students;
        linkedStudent = students[0];
        
        // Check if student has active request (privacy-safe - we only check existence, not content)
        if (jobRequestsResult.status === 'fulfilled') {
          const allActive = (jobRequestsResult.value || []).filter(r => r.status === 'active');
          const studentEmails = students.map(s => s.email?.toLowerCase());
          const foundStudentRequest = allActive.find(r => 
            studentEmails.includes(r.poster_email?.toLowerCase()) || 
            studentEmails.includes(r.created_by?.toLowerCase())
          );
          
          if (foundStudentRequest) {
            studentRequest = foundStudentRequest;
            // Calculate position based on karma-weighted priority
            const sortedByPriority = [...allActive].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
            const position = sortedByPriority.findIndex(r => r.id === foundStudentRequest.id) + 1;
            
            studentQueueStatus = {
              hasActiveRequest: true,
              position: position || allActive.length,
              totalQuestions: allActive.length,
            };
          } else {
            studentQueueStatus = {
              hasActiveRequest: false,
              position: null,
              totalQuestions: allActive.length,
            };
          }
        }
      }

      // Process questions with smart matching
      let matchedQuestions = [];
      let allQuestionsCount = 0;
      let matchedCount = 0;
      let newTodayCount = 0;
      let unansweredCount = 0;
      
      if (jobRequestsResult.status === 'fulfilled') {
        const allQuestions = jobRequestsResult.value || [];
        allQuestionsCount = allQuestions.length;
        
        // Count new today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        newTodayCount = allQuestions.filter(q => new Date(q.created_date) >= today).length;
        unansweredCount = allQuestions.filter(q => (q.answer_count || 0) === 0).length;
        
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

      // Family karma - extract full karma data for StudentBoostCard
      let familyKarmaTotal = user?.karma_points || 0;
      let familyKarmaLevel = 'none';
      let familyBoostMultiplier = 0;
      
      if (familyKarmaResult.status === 'fulfilled' && familyKarmaResult.value?.data) {
        const kd = familyKarmaResult.value.data;
        familyKarmaTotal = kd.total_karma || user?.karma_points || 0;
        familyKarmaLevel = kd.karma_level || 'none';
        familyBoostMultiplier = kd.boost_multiplier || 0;
      }
      const familyKarma = familyKarmaTotal;

      // Students helped - count unique students from answers, fall back to user field
      let studentsHelpedCount = user?.students_helped_count || 0;
      if (answersResult.status === 'fulfilled') {
        const answers = answersResult.value || [];
        // Count unique job_request_ids as a proxy for unique students helped
        const uniqueStudents = new Set(answers.map(a => a.job_request_id));
        studentsHelpedCount = Math.max(studentsHelpedCount, uniqueStudents.size);
      }

      // Real activity feed (will be populated from real data in future)
      const recentActivity = [];

      setData({
        linkedStudent,
        studentRequest,
        studentQueueStatus,
        matchedQuestions,
        allQuestionsCount,
        matchedCount,
        newTodayCount,
        unansweredCount,
        myJobs,
        studentsHelped: studentsHelpedCount,
        familyKarma,
        familyKarmaLevel,
        familyBoostMultiplier,
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