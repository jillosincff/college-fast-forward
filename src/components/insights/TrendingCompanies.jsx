import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Building2 } from 'lucide-react';

export default function TrendingCompanies({ jobRequests = [], helpRequests = [] }) {
  // Extract company mentions from JobRequests + HelpRequests
  const companyCounts = {};

  jobRequests.forEach(jr => {
    const company = jr.target_company?.trim();
    if (company) {
      const key = company.toLowerCase();
      companyCounts[key] = companyCounts[key] || { name: company, count: 0 };
      companyCounts[key].count++;
    }
  });

  // Also count industry mentions from help requests
  const industryCounts = {};
  helpRequests.forEach(hr => {
    if (hr.industry) {
      industryCounts[hr.industry] = (industryCounts[hr.industry] || 0) + 1;
    }
  });

  const topCompanies = Object.values(companyCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topIndustries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxCompanyCount = topCompanies[0]?.count || 1;
  const maxIndustryCount = topIndustries[0]?.[1] || 1;

  return (
    <Card className="border-2 border-slate-100 shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          🔥 What Gators Are Asking About
        </h2>

        {topCompanies.length > 0 ? (
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Top Companies</h3>
            {topCompanies.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-800">{c.name}</span>
                    <span className="text-xs text-slate-500">{c.count} mention{c.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#0021A5] to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(c.count / maxCompanyCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-6">No company mentions yet — be the first to post a question!</p>
        )}

        {topIndustries.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Top Industries</h3>
            <div className="flex flex-wrap gap-2">
              {topIndustries.map(([industry, count], i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                >
                  {industry} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}