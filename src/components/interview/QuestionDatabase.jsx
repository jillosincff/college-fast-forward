import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InterviewQuestion } from '@/entities/InterviewQuestion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, BookOpen, Lightbulb, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuestionDatabase() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, categoryFilter, difficultyFilter, industryFilter]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const allQuestions = await InterviewQuestion.filter({}, '-usage_count', 200);
      setQuestions(allQuestions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(lowercasedQuery) ||
        (q.sample_answer && q.sample_answer.toLowerCase().includes(lowercasedQuery))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(q => q.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficultyFilter);
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(q =>
        q.industries && q.industries.includes(industryFilter)
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setShowDetailsModal(true);
  };

  const categoryColors = {
    behavioral: 'bg-blue-100 text-blue-800',
    technical: 'bg-purple-100 text-purple-800',
    situational: 'bg-green-100 text-green-800',
    case_study: 'bg-orange-100 text-orange-800',
    culture_fit: 'bg-pink-100 text-pink-800',
    leadership: 'bg-indigo-100 text-indigo-800',
    problem_solving: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Filter Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="situational">Situational</SelectItem>
                  <SelectItem value="case_study">Case Study</SelectItem>
                  <SelectItem value="culture_fit">Culture Fit</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="problem_solving">Problem Solving</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Industry</label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-900">
          {filteredQuestions.length} Questions Found
        </h3>
        {(searchQuery || categoryFilter !== 'all' || difficultyFilter !== 'all' || industryFilter !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setDifficultyFilter('all');
              setIndustryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading questions...</p>
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="grid gap-4">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                onClick={() => handleQuestionClick(question)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={categoryColors[question.category] || 'bg-slate-100 text-slate-800'}>
                          {question.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {question.difficulty} level
                        </Badge>
                        {question.industries && question.industries.length > 0 && (
                          <Badge variant="outline" className="bg-slate-50">
                            {question.industries[0]}
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">
                        {question.question}
                      </h4>
                      {question.tips && question.tips.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span>{question.tips.length} tips available</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Questions Found
            </h3>
            <p className="text-slate-600">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      )}

      {/* Question Details Modal */}
      {selectedQuestion && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={categoryColors[selectedQuestion.category] || 'bg-slate-100 text-slate-800'}>
                  {selectedQuestion.category.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {selectedQuestion.difficulty} level
                </Badge>
              </div>
              <DialogTitle className="text-2xl leading-relaxed pr-8">
                {selectedQuestion.question}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Tips */}
              {selectedQuestion.tips && selectedQuestion.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Tips for Answering
                  </h4>
                  <ul className="space-y-2">
                    {selectedQuestion.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="text-blue-600 font-bold flex-shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Answer */}
              {selectedQuestion.sample_answer && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Sample Answer</h4>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedQuestion.sample_answer}
                    </p>
                  </div>
                </div>
              )}

              {/* Follow-up Questions */}
              {selectedQuestion.follow_up_questions && selectedQuestion.follow_up_questions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Common Follow-up Questions
                  </h4>
                  <ul className="space-y-2">
                    {selectedQuestion.follow_up_questions.map((followUp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="text-purple-600 font-bold flex-shrink-0">→</span>
                        <span>{followUp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}