import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Building2, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#0021A5', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];

function formatSalary(n) {
  if (!n) return '$0';
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n}`;
}

export default function SalaryInsights({ salaryReports = [], salarySubmissions = [] }) {
  const [tab, setTab] = useState('overview');

  // Merge both data sources for aggregate stats
  const allSalaries = [
    ...salaryReports.map(r => ({
      company: r.company,
      role: r.role,
      industry: r.industry,
      location: r.location,
      baseSalary: r.base_salary || 0,
      offerType: r.offer_type,
      source: 'report',
    })),
    ...salarySubmissions.filter(s => s.is_visible !== false).map(s => ({
      company: s.company,
      role: s.job_title,
      industry: s.industry,
      location: s.location,
      baseSalary: s.base_salary || 0,
      offerType: s.years_experience_band === '0-2' ? 'entry' : 'experienced',
      source: 'submission',
    })),
  ].filter(s => s.baseSalary > 0);

  const totalReports = allSalaries.length;
  const avgSalary = totalReports > 0 ? Math.round(allSalaries.reduce((s, r) => s + r.baseSalary, 0) / totalReports) : 0;
  const maxSalary = totalReports > 0 ? Math.max(...allSalaries.map(s => s.baseSalary)) : 0;
  const minSalary = totalReports > 0 ? Math.min(...allSalaries.map(s => s.baseSalary)) : 0;

  // By industry
  const byIndustry = {};
  allSalaries.forEach(s => {
    const ind = s.industry || 'Other';
    if (!byIndustry[ind]) byIndustry[ind] = { salaries: [], count: 0 };
    byIndustry[ind].salaries.push(s.baseSalary);
    byIndustry[ind].count++;
  });

  const industryData = Object.entries(byIndustry)
    .map(([name, data]) => ({
      name: name.length > 18 ? name.substring(0, 16) + '...' : name,
      avg: Math.round(data.salaries.reduce((a, b) => a + b, 0) / data.salaries.length),
      count: data.count,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);

  // Top companies by report count
  const byCompany = {};
  allSalaries.forEach(s => {
    if (!s.company) return;
    const key = s.company.toLowerCase().trim();
    if (!byCompany[key]) byCompany[key] = { name: s.company, salaries: [] };
    byCompany[key].salaries.push(s.baseSalary);
  });

  const topCompanies = Object.values(byCompany)
    .map(c => ({
      name: c.name,
      avg: Math.round(c.salaries.reduce((a, b) => a + b, 0) / c.salaries.length),
      count: c.salaries.length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  if (totalReports === 0) {
    return (
      <Card className="border-2 border-green-100 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            💰 Salary Insights
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-slate-600 mb-2">No salary data yet.</p>
            <p className="text-sm text-slate-500">Be the first to share — it's completely anonymous and helps the entire Gator community!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-100 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
          <DollarSign className="w-5 h-5 text-green-600" />
          💰 Salary Insights
        </h2>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-700">{totalReports}</p>
            <p className="text-xs text-green-600">Reports</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-700">{formatSalary(avgSalary)}</p>
            <p className="text-xs text-green-600">Average</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-700">{formatSalary(minSalary)}</p>
            <p className="text-xs text-green-600">Low</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-700">{formatSalary(maxSalary)}</p>
            <p className="text-xs text-green-600">High</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['overview', 'companies'].map(t => (
            <Button
              key={t}
              variant={tab === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(t)}
              className={tab === t ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {t === 'overview' ? 'By Industry' : 'By Company'}
            </Button>
          ))}
        </div>

        {tab === 'overview' && industryData.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={industryData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" tickFormatter={formatSalary} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: '#475569' }} />
              <Tooltip
                formatter={(value) => [formatSalary(value), 'Avg Salary']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="avg" radius={[0, 6, 6, 0]} barSize={22}>
                {industryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === 'companies' && (
          <div className="space-y-3">
            {topCompanies.length > 0 ? topCompanies.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.count} report{c.count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-700">{formatSalary(c.avg)}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">Not enough company data yet.</p>
            )}
          </div>
        )}

        <p className="text-xs text-slate-400 mt-4 text-center">
          All data is anonymous and aggregated. Individual salaries are never shown.
        </p>
      </CardContent>
    </Card>
  );
}