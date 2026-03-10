import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Activity, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';
import { JobRequest } from '@/entities/JobRequest';
import { Answer } from '@/entities/Answer';
import { Message } from '@/entities/Message';

export default function EngagementAnalyticsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => { loadEngagementStats(); }, []);

  const loadEngagementStats = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [allUsers, allJobRequests, allAnswers, allMessages] = await Promise.all([
        base44.entities.User.filter({}, '-updated_date', 9999),
        JobRequest.filter({}, '-created_date', 500),
        Answer.filter({}, '-created_date', 500),
        Message.filter({}, '-created_date', 500)
      ]);

      const activeParents = (allUsers || []).filter(u =>
        (u.persona === 'parent' || u.roles?.includes('parent')) &&
        u.updated_date && new Date(u.updated_date) >= new Date(thirtyDaysAgo)
      );
      const studentQuestions = (allJobRequests || []).filter(r => r.poster_type === 'student' && !r.is_alumni_career_request && r.status === 'active');
      const unansweredQuestions = studentQuestions.filter(q => (q.answer_count || 0) === 0);
      const answeredQuestionIds = new Set((allAnswers || []).map(a => a.question_id).filter(Boolean));
      const questionsWithAnswers = studentQuestions.filter(q => answeredQuestionIds.has(q.id));
      const questionPostersWithAnswers = [...new Set(questionsWithAnswers.map(q => q.poster_email || q.created_by).filter(Boolean))];
      const postersWhoSentMessages = questionPostersWithAnswers.filter(email => (allMessages || []).some(m => m.sender_email === email));

      setStats({
        activeParentsLast30Days: activeParents.length,
        totalParents: (allUsers || []).filter(u => u.persona === 'parent' || u.roles?.includes('parent')).length,
        unansweredStudentQuestions: unansweredQuestions.length,
        totalStudentQuestions: studentQuestions.length,
        questionsWithAnswers: questionsWithAnswers.length,
        uniquePostersWithAnswers: questionPostersWithAnswers.length,
        postersWhoSentMessages: postersWhoSentMessages.length,
        alternativeResponseRate: questionPostersWithAnswers.length > 0 ? Math.round((postersWhoSentMessages.length / questionPostersWithAnswers.length) * 100) : 0,
        totalAnswers: (allAnswers || []).length,
        totalMessages: (allMessages || []).length,
        recentUnanswered: unansweredQuestions.slice(0, 10)
      });
    } catch (error) {
      console.error('Failed to load engagement stats:', error);
      toast({ title: "Error", description: "Failed to load engagement statistics", variant: "destructive" });
    } finally { setLoading(false); }
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" /><p className="text-slate-600">Calculating engagement metrics...</p></div>;
  if (!stats) return <div className="text-center py-12 text-slate-500"><AlertTriangle className="w-12 h-12 mx-auto mb-2" /><p>Could not load engagement data</p><Button onClick={loadEngagementStats} className="mt-4">Try Again</Button></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-orange-200 bg-orange-50"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm text-orange-700 font-medium">Parents Active (Last 30 Days)</p><p className="text-4xl font-bold text-orange-900 mt-2">{stats.activeParentsLast30Days}</p><p className="text-sm text-orange-600 mt-1">of {stats.totalParents} total ({stats.totalParents > 0 ? Math.round((stats.activeParentsLast30Days / stats.totalParents) * 100) : 0}%)</p></div><div className="p-3 bg-orange-200 rounded-lg"><Users className="w-6 h-6 text-orange-700" /></div></div></CardContent></Card>
        <Card className={`border-red-200 ${stats.unansweredStudentQuestions > 10 ? 'bg-red-50' : 'bg-yellow-50 border-yellow-200'}`}><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm text-red-700 font-medium">Unanswered Student Questions</p><p className="text-4xl font-bold text-red-900 mt-2">{stats.unansweredStudentQuestions}</p><p className="text-sm text-red-600 mt-1">of {stats.totalStudentQuestions} total ({stats.totalStudentQuestions > 0 ? Math.round((stats.unansweredStudentQuestions / stats.totalStudentQuestions) * 100) : 0}% unanswered)</p></div><div className="p-3 bg-red-200 rounded-lg"><MessageCircle className="w-6 h-6 text-red-700" /></div></div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm text-teal-700 font-medium">Students Who Reply After Getting Help</p><p className="text-4xl font-bold text-teal-900 mt-2">{stats.alternativeResponseRate}%</p><p className="text-sm text-teal-600 mt-1">{stats.postersWhoSentMessages} of {stats.uniquePostersWithAnswers} students sent messages</p></div><div className="p-3 bg-teal-200 rounded-lg"><Activity className="w-6 h-6 text-teal-700" /></div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-lg">Engagement Summary</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{v:stats.totalAnswers,l:'Total Answers'},{v:stats.totalMessages,l:'Total Messages'},{v:stats.questionsWithAnswers,l:'Questions w/ Answers'},{v:`${stats.totalStudentQuestions>0?Math.round(((stats.totalStudentQuestions-stats.unansweredStudentQuestions)/stats.totalStudentQuestions)*100):0}%`,l:'Questions Answered'}].map((m,i)=><div key={i} className="bg-slate-100 rounded-lg p-4 text-center"><p className="text-2xl font-bold text-slate-900">{m.v}</p><p className="text-xs text-slate-600">{m.l}</p></div>)}</div></CardContent></Card>
      {stats.recentUnanswered.length > 0 && <Card className="border-red-200"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" />Recent Unanswered Questions</CardTitle></CardHeader><CardContent><div className="space-y-3 max-h-[400px] overflow-y-auto">{stats.recentUnanswered.map(q=>{const d=Math.floor((Date.now()-new Date(q.created_date).getTime())/(1000*60*60*24));return<div key={q.id} className="p-3 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-start justify-between"><div className="flex-1"><p className="font-medium text-slate-900">{q.role||q.title||'Untitled'}</p><p className="text-sm text-slate-600 mt-1 line-clamp-2">{q.description?.substring(0,150)}...</p><div className="flex items-center gap-3 mt-2 text-xs text-slate-500"><span>{q.poster_name||'Student'}</span><span>•</span><span className={d>7?'text-red-600 font-semibold':''}>{d===0?'Today':`${d}d ago`}</span></div></div><Button size="sm" variant="outline" onClick={()=>navigate(`QuestionDetail?id=${q.id}`)}>View</Button></div></div>})}</div></CardContent></Card>}
      <Button onClick={loadEngagementStats} variant="outline" className="w-full"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
    </div>
  );
}