import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Database, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import AICareerAdvisor from '@/components/ai-advisor/AICareerAdvisor';
import DataSubmissionModal from '@/components/ai-advisor/DataSubmissionModal';
import { navigate } from '@/components/utils/navigation';

export default function AIAdvisorPage() {
  const { user } = useAuth();
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionTab, setSubmissionTab] = useState('salary');

  const handleMentorConnect = (mentor) => {
    // Navigate to message composer with mentor info
    navigate(`MessageComposer?to=${mentor.user_id}&subject=Career advice from AI Advisor`);
  };

  const openSalarySubmission = () => {
    setSubmissionTab('salary');
    setShowSubmissionModal(true);
  };

  const openInterviewSubmission = () => {
    setSubmissionTab('interview');
    setShowSubmissionModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">AI Career Advisor</h1>
          <p className="text-slate-600 mt-1">
            Get personalized career advice powered by real data from the UF network
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <AICareerAdvisor onMentorConnect={handleMentorConnect} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contribute CTA */}
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Help Future Gators</h3>
                  <p className="text-xs text-slate-500">Share anonymously, help enormously</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                The AI advisor is only as good as the data feeding it. Contribute your salary or interview experience to help future students.
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={openSalarySubmission}
                  className="w-full bg-[#0021A5] hover:bg-[#001878]"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Share Salary Data
                </Button>
                <Button 
                  onClick={openInterviewSubmission}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Share Interview Experience
                </Button>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Network Intelligence</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-slate-600">Salary Data Points</span>
                  </div>
                  <span className="font-semibold text-slate-900">847+</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-600">Interview Insights</span>
                  </div>
                  <span className="font-semibold text-slate-900">523+</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-slate-600">Mentors Available</span>
                  </div>
                  <span className="font-semibold text-slate-900">200+</span>
                </div>
              </div>
            </Card>

            {/* What You Can Ask */}
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-3">What You Can Ask</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">💰</span>
                  <span>"How does my $85K PM offer compare?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">🎤</span>
                  <span>"Prep me for my Google interview"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">📊</span>
                  <span>"Should I take equity over salary?"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">🤝</span>
                  <span>"Help me negotiate my offer"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">🎯</span>
                  <span>"Consulting vs startup — which path?"</span>
                </li>
              </ul>
            </Card>

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 text-center px-4">
              The AI advisor provides general guidance based on aggregated, anonymous data. It's not financial or legal advice.
            </p>
          </div>
        </div>
      </div>

      {/* Data Submission Modal */}
      <DataSubmissionModal 
        open={showSubmissionModal} 
        onOpenChange={setShowSubmissionModal}
        defaultTab={submissionTab}
      />
    </div>
  );
}