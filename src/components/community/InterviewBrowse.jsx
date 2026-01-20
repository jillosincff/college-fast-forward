import React, { useState, useEffect } from 'react';
import { InterviewQuestion } from '@/entities/InterviewQuestion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import InterviewQuestionForm from './InterviewQuestionForm';
import CompanyInterviewDetail from './CompanyInterviewDetail';
import { Search, Mic, Building2, TrendingUp, Plus, Loader2, Briefcase } from 'lucide-react';

const POPULAR_COMPANIES = [
  'Google', 'Goldman Sachs', 'McKinsey', 'Meta', 'Amazon', 'Microsoft'
];

const ROLE_FILTERS = [
  'Product Manager',
  'Software Engineer',
  'Investment Banking',
  'Consulting',
  'Marketing',
  'Data Science',
  'Sales',
  'Design'
];

export default function InterviewBrowse() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [stats, setStats] = useState({ total: 0, byCompany: {}, byRole: {} });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await InterviewQuestion.filter({ is_visible: true }, '-created_date', 500);
      setQuestions(data);
      
      // Calculate stats
      const byCompany = {};
      const byRole = {};
      data.forEach(q => {
        const company = q.company_normalized || q.company.toLowerCase();
        byCompany[company] = byCompany[company] || { name: q.company, count: 0, roles: new Set() };
        byCompany[company].count++;
        byCompany[company].roles.add(q.role);
        
        const role = q.role_normalized || q.role.toLowerCase();
        byRole[role] = (byRole[role] || 0) + 1;
      });
      
      setStats({ total: data.length, byCompany, byRole });
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!q.company_normalized?.includes(query) && 
          !q.role_normalized?.includes(query) &&
          !q.question_text.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (roleFilter !== 'all') {
      if (!q.role_normalized?.includes(roleFilter.toLowerCase())) return false;
    }
    return true;
  });

  // Get top companies by question count
  const topCompanies = Object.entries(stats.byCompany)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  const recentQuestions = [...questions].slice(0, 5);

  if (selectedCompany) {
    return (
      <CompanyInterviewDetail 
        company={selectedCompany}
        questions={questions.filter(q => 
          (q.company_normalized || q.company.toLowerCase()) === selectedCompany.toLowerCase()
        )}
        onBack={() => setSelectedCompany(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Mic className="w-8 h-8 text-purple-600" />
          Interview Questions
        </h1>
        <p className="text-gray-600 mt-2">
          Real questions from real interviews — shared by {stats.total.toLocaleString()} Gators
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-sm text-gray-500">Popular:</span>
          {POPULAR_COMPANIES.map(company => (
            <button
              key={company}
              onClick={() => setSelectedCompany(company)}
              className="text-sm text-purple-600 hover:underline"
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Top Companies */}
          {!searchQuery && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Companies with Most Data
              </h2>
              <div className="space-y-3">
                {topCompanies.map(([key, data]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedCompany(key)}
                    className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-400">
                        {data.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{data.name}</h3>
                        <p className="text-sm text-gray-500">
                          {data.count} questions · {[...data.roles].slice(0, 3).join(', ')}
                          {data.roles.size > 3 && ` +${data.roles.size - 3} more`}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-purple-600">
                      View →
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browse by Role */}
          {!searchQuery && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Browse by Role
              </h2>
              <div className="flex flex-wrap gap-2">
                {ROLE_FILTERS.map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      roleFilter === role
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role}
                  </button>
                ))}
                {roleFilter !== 'all' && (
                  <button
                    onClick={() => setRoleFilter('all')}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200"
                  >
                    Clear ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recently Added */}
          {!searchQuery && roleFilter === 'all' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recently Added
              </h2>
              <div className="space-y-2">
                {recentQuestions.map(q => (
                  <div
                    key={q.id}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCompany(q.company_normalized || q.company)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium text-gray-900">{q.company}</span>
                        <span className="text-gray-500"> {q.role}: </span>
                        <span className="text-gray-700">"{q.question_text.slice(0, 80)}..."</span>
                        {q.confirmation_count > 0 && (
                          <span className="text-orange-600 text-sm ml-2">
                            🔥 reported {q.confirmation_count} times
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(q.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search/Filter Results */}
          {(searchQuery || roleFilter !== 'all') && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {filteredQuestions.length} questions found
              </h2>
              <div className="space-y-3">
                {filteredQuestions.slice(0, 20).map(q => (
                  <div
                    key={q.id}
                    className="p-4 bg-white rounded-xl border hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedCompany(q.company_normalized || q.company)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{q.company}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{q.role}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                        {q.question_type}
                      </span>
                    </div>
                    <p className="text-gray-700">"{q.question_text}"</p>
                    {q.answer_tips && (
                      <p className="text-sm text-gray-500 mt-2">
                        💡 {q.answer_tips.slice(0, 100)}...
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {q.confirmation_count > 0 && (
                        <span className="text-orange-600">
                          🔥 {q.confirmation_count} confirmed
                        </span>
                      )}
                      <span>▲ {q.upvote_count || 0} helpful</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">💡 Been interviewed recently?</h3>
                <p className="text-gray-600 mt-1">
                  Share the questions you were asked. Help other Gators prep.
                </p>
              </div>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Share Questions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <InterviewQuestionForm 
                    onSuccess={() => {
                      setShowAddForm(false);
                      loadQuestions();
                    }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </>
      )}
    </div>
  );
}