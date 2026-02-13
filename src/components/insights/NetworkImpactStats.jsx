import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Award, Briefcase, Heart, TrendingUp } from 'lucide-react';

export default function NetworkImpactStats({
  totalMembers = 0,
  totalQuestions = 0,
  totalAnswers = 0,
  totalMatches = 0,
  totalOpportunities = 0,
  totalSalaryReports = 0,
}) {
  const stats = [
    { label: 'Members', value: totalMembers || '900+', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Questions Asked', value: totalQuestions, icon: MessageSquare, color: 'bg-orange-100 text-orange-600' },
    { label: 'Answers Given', value: totalAnswers, icon: Heart, color: 'bg-pink-100 text-pink-600' },
    { label: 'Matches Made', value: totalMatches, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Opportunities', value: totalOpportunities, icon: Briefcase, color: 'bg-purple-100 text-purple-600' },
    { label: 'Salary Reports', value: totalSalaryReports, icon: Award, color: 'bg-yellow-100 text-yellow-700' },
  ];

  return (
    <Card className="border-2 border-slate-100 shadow-lg rounded-2xl">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
          📊 Gator Network Impact
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}