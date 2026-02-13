import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

import InsightsHero from '@/components/insights/InsightsHero';
import AskInsightsChat from '@/components/insights/AskInsightsChat';
import TrendingCompanies from '@/components/insights/TrendingCompanies';
import HelpTopicsChart from '@/components/insights/HelpTopicsChart';
import SalaryInsights from '@/components/insights/SalaryInsights';
import InterviewInsights from '@/components/insights/InterviewInsights';
import NetworkImpactStats from '@/components/insights/NetworkImpactStats';

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    helpRequests: [],
    jobRequests: [],
    salaryReports: [],
    salarySubmissions: [],
    interviewQuestions: [],
    answers: [],
    matches: [],
    opportunities: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        helpRequests,
        jobRequests,
        salaryReports,
        salarySubmissions,
        interviewQuestions,
        answers,
        opportunities,
      ] = await Promise.all([
        base44.entities.HelpRequest.list('-created_date', 200),
        base44.entities.JobRequest.list('-created_date', 200),
        base44.entities.SalaryReport.list('-created_date', 200),
        base44.entities.SalarySubmission.list('-created_date', 200),
        base44.entities.InterviewQuestion.list('-created_date', 200),
        base44.entities.Answer.list('-created_date', 200),
        base44.entities.Opportunity.list('-created_date', 50),
      ]);

      setData({
        helpRequests: helpRequests || [],
        jobRequests: jobRequests || [],
        salaryReports: salaryReports || [],
        salarySubmissions: salarySubmissions || [],
        interviewQuestions: interviewQuestions || [],
        answers: answers || [],
        opportunities: opportunities || [],
      });
    } catch (err) {
      console.error('Failed to load insights data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = data.helpRequests.length + data.jobRequests.length;
  const totalSalaryReports = data.salaryReports.length + data.salarySubmissions.length;

  // Build context string for AI chat
  const statsContext = `UF Gator Network Stats:
- Total questions asked: ${totalQuestions}
- Help requests: ${data.helpRequests.length}
- Job requests: ${data.jobRequests.length}
- Salary reports submitted: ${totalSalaryReports}
- Interview questions shared: ${data.interviewQuestions.length}
- Answers given: ${data.answers.length}
- Opportunities posted: ${data.opportunities.length}
- Top industries: ${[...new Set(data.helpRequests.map(r => r.industry).filter(Boolean))].slice(0, 5).join(', ')}
- Top companies mentioned: ${[...new Set(data.jobRequests.map(r => r.target_company).filter(Boolean))].slice(0, 5).join(', ')}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0021A5] mx-auto mb-3" />
          <p className="text-slate-500">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <InsightsHero
        totalMembers="900+"
        totalQuestions={totalQuestions}
        totalSalaryReports={totalSalaryReports}
      />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* AI Chat */}
        <AskInsightsChat statsContext={statsContext} />

        {/* Two column layout for trending + topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendingCompanies
            jobRequests={data.jobRequests}
            helpRequests={data.helpRequests}
          />
          <HelpTopicsChart helpRequests={data.helpRequests} />
        </div>

        {/* Salary Insights */}
        <SalaryInsights
          salaryReports={data.salaryReports}
          salarySubmissions={data.salarySubmissions}
        />

        {/* Interview Insights */}
        <InterviewInsights interviewQuestions={data.interviewQuestions} />

        {/* Network Impact */}
        <NetworkImpactStats
          totalMembers="900+"
          totalQuestions={totalQuestions}
          totalAnswers={data.answers.length}
          totalMatches={0}
          totalOpportunities={data.opportunities.length}
          totalSalaryReports={totalSalaryReports}
        />
      </div>
    </div>
  );
}