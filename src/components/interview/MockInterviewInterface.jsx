import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthContext';
import { InterviewQuestion } from '@/entities/InterviewQuestion';
import { MockInterviewSession } from '@/entities/MockInterviewSession';
import { useToast } from '@/components/ui/use-toast';
import { evaluateInterviewAnswer } from '@/functions/evaluateInterviewAnswer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Award,
  SkipForward,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MockInterviewInterface({ onComplete }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState('setup'); // setup, interview, results
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [difficulty, setDifficulty] = useState('entry');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [overallResults, setOverallResults] = useState(null);

  const loadQuestions = async () => {
    try {
      // Load questions based on filters
      const allQuestions = await InterviewQuestion.filter({}, '-usage_count', 50);
      
      let filtered = allQuestions.filter(q => q.difficulty === difficulty);
      
      if (industry) {
        filtered = filtered.filter(q => 
          !q.industries || q.industries.length === 0 || q.industries.includes(industry)
        );
      }
      
      // Select 5 random questions
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      
      setQuestions(selected);
      return selected;
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast({
        title: "Failed to load questions",
        description: "Please try again.",
        variant: "destructive"
      });
      return [];
    }
  };

  const startInterview = async () => {
    if (!role) {
      toast({
        title: "Role required",
        description: "Please enter the role you're interviewing for.",
        variant: "destructive"
      });
      return;
    }

    const loadedQuestions = await loadQuestions();
    
    if (loadedQuestions.length === 0) {
      toast({
        title: "No questions available",
        description: "Please try different filters.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create session
      const session = await MockInterviewSession.create({
        user_id: user.id,
        role,
        industry,
        difficulty,
        questions_asked: [],
        completed: false
      });
      
      setSessionId(session.id);
      setMode('interview');
      setCurrentQuestionIndex(0);
      setAnswer('');
      setEvaluations([]);
    } catch (error) {
      console.error('Failed to create session:', error);
      toast({
        title: "Failed to start interview",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsEvaluating(true);
    
    try {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Call AI evaluation function
      const { data } = await evaluateInterviewAnswer({
        question: currentQuestion.question,
        answer: answer,
        role: role,
        industry: industry,
        difficulty: difficulty
      });

      if (data.success) {
        const evaluation = data.evaluation;
        
        // Store evaluation
        const newEvaluation = {
          question_id: currentQuestion.id,
          question_text: currentQuestion.question,
          user_answer: answer,
          ai_feedback: evaluation.feedback,
          score: evaluation.score,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements
        };
        
        setEvaluations(prev => [...prev, newEvaluation]);
        
        // Update session
        await MockInterviewSession.update(sessionId, {
          questions_asked: [...evaluations, newEvaluation]
        });
        
        toast({
          title: "✅ Answer submitted!",
          description: `Score: ${evaluation.score}/100`,
        });
        
        // Move to next question or results
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setAnswer('');
        } else {
          // Calculate overall results
          await finishInterview([...evaluations, newEvaluation]);
        }
      } else {
        throw new Error(data.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      toast({
        title: "Evaluation failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const skipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      toast({
        title: "Question skipped",
        description: "Moving to next question.",
      });
    } else {
      finishInterview(evaluations);
    }
  };

  const finishInterview = async (allEvaluations) => {
    try {
      const avgScore = allEvaluations.reduce((sum, e) => sum + e.score, 0) / allEvaluations.length;
      
      const allStrengths = allEvaluations.flatMap(e => e.strengths);
      const allImprovements = allEvaluations.flatMap(e => e.improvements);
      
      // Get top 3 most common strengths and improvements
      const strengthCounts = {};
      const improvementCounts = {};
      
      allStrengths.forEach(s => {
        strengthCounts[s] = (strengthCounts[s] || 0) + 1;
      });
      
      allImprovements.forEach(i => {
        improvementCounts[i] = (improvementCounts[i] || 0) + 1;
      });
      
      const topStrengths = Object.entries(strengthCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([strength]) => strength);
      
      const topImprovements = Object.entries(improvementCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([improvement]) => improvement);
      
      const results = {
        overall_score: Math.round(avgScore),
        key_strengths: topStrengths,
        key_improvements: topImprovements,
        overall_feedback: avgScore >= 80 
          ? "Excellent performance! You demonstrated strong communication skills and structured thinking."
          : avgScore >= 60
          ? "Good job! With some refinements, you'll be ready to impress in real interviews."
          : "Keep practicing! Focus on the improvement areas and try again."
      };
      
      setOverallResults(results);
      
      // Update session
      await MockInterviewSession.update(sessionId, {
        questions_asked: allEvaluations,
        overall_score: results.overall_score,
        overall_feedback: results.overall_feedback,
        key_strengths: results.key_strengths,
        key_improvements: results.key_improvements,
        completed: true,
        duration_minutes: Math.round((Date.now() - new Date(sessionId).getTime()) / 60000)
      });
      
      setMode('results');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Failed to finish interview:', error);
      toast({
        title: "Failed to save results",
        description: "Your answers were recorded but results couldn't be saved.",
        variant: "destructive"
      });
    }
  };

  const resetInterview = () => {
    setMode('setup');
    setRole('');
    setIndustry('');
    setDifficulty('entry');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setSessionId(null);
    setEvaluations([]);
    setOverallResults(null);
  };

  // Setup Mode
  if (mode === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set Up Your Mock Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              What role are you interviewing for? *
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineer, Product Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Industry (optional)
            </label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Experience Level
            </label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button
              onClick={startInterview}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Mock Interview
            </Button>
            <p className="text-sm text-slate-500 text-center mt-3">
              You'll answer 5 questions with AI feedback on each response
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Interview Mode
  if (mode === 'interview') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Badge variant="outline">
                {difficulty} level
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge>{currentQuestion.category}</Badge>
                  {currentQuestion.industries && currentQuestion.industries.length > 0 && (
                    <Badge variant="outline">{currentQuestion.industries[0]}</Badge>
                  )}
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your answer here... Use the STAR method: Situation, Task, Action, Result"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[200px] text-base"
                  disabled={isEvaluating}
                />

                <div className="flex gap-3">
                  <Button
                    onClick={submitAnswer}
                    disabled={isEvaluating || !answer.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={skipQuestion}
                    variant="outline"
                    disabled={isEvaluating}
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Previous Evaluations */}
        {evaluations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previous Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluations.map((evaluation, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Question {idx + 1}
                    </span>
                    <div className={`text-lg font-bold ${
                      evaluation.score >= 80 ? 'text-green-600' :
                      evaluation.score >= 60 ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      {evaluation.score}/100
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Results Mode
  if (mode === 'results' && overallResults) {
    return (
      <div className="space-y-6">
        {/* Overall Score Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              Interview Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className={`text-6xl font-bold mb-2 ${
                overallResults.overall_score >= 80 ? 'text-green-600' :
                overallResults.overall_score >= 60 ? 'text-blue-600' :
                'text-orange-600'
              }`}>
                {overallResults.overall_score}
              </div>
              <div className="text-slate-600 text-lg mb-4">out of 100</div>
              <p className="text-slate-700 max-w-2xl mx-auto">
                {overallResults.overall_feedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="w-5 h-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overallResults.key_strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <TrendingDown className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overallResults.key_improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{improvement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Question Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {evaluations.map((evaluation, idx) => (
              <div key={idx} className="border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">Question {idx + 1}</h4>
                  <Badge className={
                    evaluation.score >= 80 ? 'bg-green-600' :
                    evaluation.score >= 60 ? 'bg-blue-600' :
                    'bg-orange-600'
                  }>
                    {evaluation.score}/100
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{evaluation.question_text}</p>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-700">{evaluation.ai_feedback}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={resetInterview}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New Interview
          </Button>
        </div>
      </div>
    );
  }

  return null;
}