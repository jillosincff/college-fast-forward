import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, ThumbsUp, Users, MessageSquare, DollarSign } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { InterviewQuestion } from '@/entities/InterviewQuestion';
import { toast } from 'sonner';

const QUESTION_TYPE_LABELS = {
  'behavioral': '📋 BEHAVIORAL',
  'case': '🧩 CASE / PROBLEM-SOLVING',
  'technical': '💻 TECHNICAL',
  'product': '🎨 PRODUCT / DESIGN',
  'system_design': '🏗️ SYSTEM DESIGN',
  'other': '📝 OTHER'
};

const EXPERIENCE_LABELS = {
  'intern': 'Intern',
  'entry': 'Entry Level',
  'mid': 'Mid Level (2-5 yrs)',
  'senior': 'Senior (5+ yrs)'
};

export default function CompanyInterviewDetail({ company, questions, onBack }) {
  const [filters, setFilters] = useState({
    role: 'all',
    type: 'all',
    level: 'all'
  });
  const [upvotedIds, setUpvotedIds] = useState(new Set());

  // Get unique roles
  const roles = [...new Set(questions.map(q => q.role))];
  
  // Get company display name
  const companyName = questions[0]?.company || company;

  const filteredQuestions = questions.filter(q => {
    if (filters.role !== 'all' && q.role !== filters.role) return false;
    if (filters.type !== 'all' && q.question_type !== filters.type) return false;
    if (filters.level !== 'all' && q.experience_level !== filters.level) return false;
    return true;
  });

  // Group by type
  const groupedByType = {};
  filteredQuestions.forEach(q => {
    if (!groupedByType[q.question_type]) {
      groupedByType[q.question_type] = [];
    }
    groupedByType[q.question_type].push(q);
  });

  // Get tips from questions
  const tips = questions
    .filter(q => q.answer_tips && !q.is_anonymous && q.submitter_name)
    .slice(0, 3);

  const handleUpvote = async (questionId) => {
    if (upvotedIds.has(questionId)) return;
    
    try {
      const question = questions.find(q => q.id === questionId);
      await InterviewQuestion.update(questionId, {
        upvote_count: (question.upvote_count || 0) + 1
      });
      setUpvotedIds(new Set([...upvotedIds, questionId]));
      toast.success('Marked as helpful!');
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-400">
          {companyName.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{companyName} Interview Questions</h1>
          <p className="text-gray-600 mt-1">
            {questions.length} questions shared by Gators
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filters.role} onValueChange={(v) => setFilters({ ...filters, role: v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Question Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.level} onValueChange={(v) => setFilters({ ...filters, level: v })}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {Object.entries(EXPERIENCE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Questions grouped by type */}
      {Object.entries(groupedByType)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([type, typeQuestions]) => (
          <div key={type} className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              {QUESTION_TYPE_LABELS[type]} ({typeQuestions.length} questions)
            </h2>
            
            <div className="space-y-4">
              {typeQuestions.slice(0, 5).map(q => (
                <div key={q.id} className="pb-4 border-b last:border-0 last:pb-0">
                  <p className="text-gray-800 font-medium">"{q.question_text}"</p>
                  
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    {q.confirmation_count > 0 && (
                      <span className="text-orange-600">
                        🔥 Reported {q.confirmation_count} times
                      </span>
                    )}
                    {q.interview_date && (
                      <span>Last asked {q.interview_date}</span>
                    )}
                  </div>
                  
                  {q.answer_tips && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      💡 Tip: "{q.answer_tips}"
                    </p>
                  )}
                  
                  <button
                    onClick={() => handleUpvote(q.id)}
                    disabled={upvotedIds.has(q.id)}
                    className={`mt-2 text-sm flex items-center gap-1 ${
                      upvotedIds.has(q.id) 
                        ? 'text-green-600' 
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {(q.upvote_count || 0) + (upvotedIds.has(q.id) ? 1 : 0)} helpful
                  </button>
                </div>
              ))}
              
              {typeQuestions.length > 5 && (
                <button className="text-purple-600 text-sm font-medium hover:underline">
                  Show all {typeQuestions.length} {type} questions →
                </button>
              )}
            </div>
          </div>
        ))}

      {/* Tips from Gators */}
      {tips.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            💡 General Tips from Gators Who Got Offers
          </h2>
          
          <div className="space-y-4">
            {tips.map((q, idx) => (
              <blockquote key={idx} className="border-l-4 border-purple-400 pl-4 py-2">
                <p className="text-gray-700 italic">"{q.answer_tips}"</p>
                <p className="text-sm text-gray-500 mt-1">
                  — {q.submitter_name}{q.submitter_title && `, ${q.submitter_title}`}
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Connect with professionals */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Gators at {companyName} Who Can Help You Prep
        </h3>
        <p className="text-gray-600 mt-1">
          Message Gators who work here for personalized interview tips.
        </p>
        <div className="flex gap-3 mt-4">
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('GatorDirectory', { company: companyName })}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Find People to Message
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('Community', { tab: 'salaries', search: companyName })}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            See {companyName} Salary Data
          </Button>
        </div>
      </div>
    </div>
  );
}