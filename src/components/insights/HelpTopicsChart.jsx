import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HelpCircle } from 'lucide-react';

const HELP_TYPE_LABELS = {
  career_advice: 'Career Advice',
  internship_leads: 'Internship Leads',
  resume_review: 'Resume Review',
  interview_prep: 'Interview Prep',
  industry_insights: 'Industry Insights',
  networking_intros: 'Networking Intros',
  informational_interview: 'Informational Interview',
};

const COLORS = ['#0021A5', '#FA4616', '#1e40af', '#ea580c', '#3b82f6', '#f97316', '#6366f1'];

export default function HelpTopicsChart({ helpRequests = [] }) {
  // Count help types across all requests
  const typeCounts = {};
  helpRequests.forEach(hr => {
    (hr.help_types || []).forEach(t => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
  });

  const data = Object.entries(typeCounts)
    .map(([key, count]) => ({
      name: HELP_TYPE_LABELS[key] || key,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <Card className="border-2 border-slate-100 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            📊 What Students Need Help With
          </h2>
          <p className="text-sm text-slate-500">No data yet — more contributions will unlock this chart!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-100 shadow-lg rounded-2xl">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          📊 What Students Need Help With
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 12, fill: '#475569' }}
            />
            <Tooltip
              formatter={(value) => [`${value} questions`, 'Count']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}