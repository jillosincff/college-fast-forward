import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MockInterviewSession } from '@/entities/MockInterviewSession';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  Play,
  Book,
  Lightbulb,
  Award,
  Clock,
  Target,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import MockInterviewInterface from '@/components/interview/MockInterviewInterface';
import QuestionDatabase from '@/components/interview/QuestionDatabase';
import InterviewResources from '@/components/interview/InterviewResources';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InterviewPrepPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    averageScore: 0,
    questionsAnswered: 0,
    improvementRate: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('LandingPage');
      return;
    }
    loadRecentSessions();
  }, [user]);

  const loadRecentSessions = async () => {
    if (!user?.id) return;
    
    setIsLoadingSessions(true);
    try {
      const sessions = await MockInterviewSession.filter(
        { user_id: user.id },
        '-created_date',
        5
      );
      
      setRecentSessions(sessions || []);
      
      // Calculate stats
      if (sessions && sessions.length > 0) {
        const completedSessions = sessions.filter(s => s.completed);
        const totalQuestions = sessions.reduce((sum, s) => sum + (s.questions_asked?.length || 0), 0);
        const avgScore = completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / completedSessions.length
          : 0;
        
        setStats({
          totalSessions: sessions.length,
          averageScore: Math.round(avgScore),
          questionsAnswered: totalQuestions,
          improvementRate: sessions.length >= 2 
            ? Math.round(((sessions[0]?.overall_score || 0) - (sessions[sessions.length - 1]?.overall_score || 0)))
            : 0
        });
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">AI-Powered Interview Prep</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Ace Your Next Interview
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 max-w-2xl mx-auto mb-8"
            >
              Practice with AI, master common questions, and learn proven interview techniques
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">{stats.totalSessions}</div>
                <div className="text-sm text-white/80">Practice Sessions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">{stats.averageScore}</div>
                <div className="text-sm text-white/80">Avg Score</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">{stats.questionsAnswered}</div>
                <div className="text-sm text-white/80">Questions Answered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold mb-1">
                  {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate}
                </div>
                <div className="text-sm text-white/80">Improvement</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto gap-2 bg-transparent">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md py-3"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="mock-interview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md py-3"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Mock Interview
            </TabsTrigger>
            <TabsTrigger 
              value="questions"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md py-3"
            >
              <Book className="w-4 h-4 mr-2" />
              Question Bank
            </TabsTrigger>
            <TabsTrigger 
              value="resources"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md py-3"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Start Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                onClick={() => setActiveTab('mock-interview')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Start Mock Interview</CardTitle>
                  <CardDescription>
                    Practice with AI and get instant feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Start Practicing
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-300"
                onClick={() => setActiveTab('questions')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Browse Questions</CardTitle>
                  <CardDescription>
                    1000+ questions by industry and role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-2 border-green-600 text-green-700 hover:bg-green-50">
                    Explore Database
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-orange-300"
                onClick={() => setActiveTab('resources')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Learn Best Practices</CardTitle>
                  <CardDescription>
                    Master interview etiquette and techniques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-2 border-orange-600 text-orange-700 hover:bg-orange-50">
                    View Resources
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Recent Practice Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">
                              {session.role || 'General Interview'}
                            </h4>
                            <Badge variant={session.completed ? "default" : "secondary"}>
                              {session.completed ? 'Completed' : 'In Progress'}
                            </Badge>
                            {session.difficulty && (
                              <Badge variant="outline">
                                {session.difficulty} level
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>{session.questions_asked?.length || 0} questions</span>
                            {session.overall_score && (
                              <span className="flex items-center gap-1">
                                <Award className="w-4 h-4" />
                                Score: {session.overall_score}/100
                              </span>
                            )}
                            <span>{new Date(session.created_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {session.overall_score && (
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              session.overall_score >= 80 ? 'text-green-600' :
                              session.overall_score >= 60 ? 'text-blue-600' :
                              'text-orange-600'
                            }`}>
                              {session.overall_score}
                            </div>
                            <div className="text-xs text-slate-500">out of 100</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Section */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Pro Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Practice Regularly</h4>
                      <p className="text-sm text-slate-600">
                        Aim for 2-3 mock interviews per week to build confidence
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Use the STAR Method</h4>
                      <p className="text-sm text-slate-600">
                        Structure answers with Situation, Task, Action, Result
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Review Your Feedback</h4>
                      <p className="text-sm text-slate-600">
                        Learn from AI feedback and track your improvement over time
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Tailor to the Role</h4>
                      <p className="text-sm text-slate-600">
                        Practice questions specific to your target industry and position
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mock Interview Tab */}
          <TabsContent value="mock-interview">
            <MockInterviewInterface onComplete={loadRecentSessions} />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions">
            <QuestionDatabase />
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <InterviewResources />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}