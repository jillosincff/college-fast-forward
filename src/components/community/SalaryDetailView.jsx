import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, MapPin, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const EXPERIENCE_LABELS = {
  '0-2': 'Entry Level (0-2 yrs)',
  '3-5': 'Mid Level (3-5 yrs)',
  '6-10': 'Senior (6-10 yrs)',
  '11-15': 'Director+ (11-15 yrs)',
  '16+': 'Executive (16+ yrs)'
};

export default function SalaryDetailView({ role, salaries, onBack }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Group by experience level
  const byExperience = {};
  salaries.forEach(s => {
    const band = s.years_experience_band;
    if (!byExperience[band]) {
      byExperience[band] = [];
    }
    byExperience[band].push(s);
  });

  // Group by company
  const byCompany = {};
  salaries.filter(s => s.company).forEach(s => {
    const company = s.company;
    if (!byCompany[company]) {
      byCompany[company] = [];
    }
    byCompany[company].push(s);
  });

  // Group by location
  const byLocation = {};
  salaries.forEach(s => {
    const loc = s.location;
    if (!byLocation[loc]) {
      byLocation[loc] = [];
    }
    byLocation[loc].push(s);
  });

  // Calculate overall median
  const allBases = salaries.map(s => s.base_salary).sort((a, b) => a - b);
  const overallMedian = allBases[Math.floor(allBases.length / 2)] || 0;

  const calculateStats = (data) => {
    if (data.length === 0) return { min: 0, median: 0, max: 0 };
    const bases = data.map(s => s.base_salary).sort((a, b) => a - b);
    return {
      min: bases[Math.floor(bases.length * 0.25)] || bases[0],
      median: bases[Math.floor(bases.length * 0.5)],
      max: bases[Math.floor(bases.length * 0.75)] || bases[bases.length - 1]
    };
  };

  // Get negotiation tips
  const tips = salaries
    .filter(s => s.negotiation_advice)
    .map(s => ({
      advice: s.negotiation_advice,
      experience: s.years_experience_band
    }));

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Salary Insights
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 capitalize">{role}</h1>
        <p className="text-gray-600 mt-1">
          Based on {salaries.length} submission{salaries.length !== 1 ? 's' : ''} from Gator professionals
        </p>
      </div>

      {/* By Experience Level */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Compensation by Experience Level
        </h2>
        
        <div className="space-y-6">
          {['0-2', '3-5', '6-10', '11-15', '16+'].map(band => {
            const data = byExperience[band] || [];
            if (data.length === 0) return null;
            
            const stats = calculateStats(data);
            const width = overallMedian > 0 ? (stats.median / (overallMedian * 2)) * 100 : 50;
            
            return (
              <div key={band}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    {EXPERIENCE_LABELS[band]} · {data.length} report{data.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg"
                    style={{ width: `${Math.min(width, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatCurrency(stats.min)} (25th)</span>
                  <span className="font-semibold text-green-600">{formatCurrency(stats.median)} (Median)</span>
                  <span>{formatCurrency(stats.max)} (75th)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Location */}
      {Object.keys(byLocation).length > 1 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            By Location
          </h2>
          
          <div className="space-y-3">
            {Object.entries(byLocation)
              .map(([loc, data]) => ({
                location: loc,
                count: data.length,
                median: calculateStats(data).median,
                diff: ((calculateStats(data).median - overallMedian) / overallMedian * 100)
              }))
              .sort((a, b) => b.diff - a.diff)
              .map(({ location, count, median, diff }) => (
                <div key={location} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-gray-900">{location}</span>
                    <span className="text-gray-500 text-sm ml-2">({count} reports)</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(0)}% {diff >= 0 ? 'above' : 'below'} avg
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By Company */}
      {Object.keys(byCompany).length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            By Company (where reported)
          </h2>
          
          <div className="space-y-4">
            {Object.entries(byCompany)
              .sort((a, b) => b[1].length - a[1].length)
              .slice(0, 6)
              .map(([company, data]) => {
                const byExp = {};
                data.forEach(s => {
                  const exp = s.years_experience_band;
                  if (!byExp[exp]) byExp[exp] = [];
                  byExp[exp].push(s);
                });
                
                return (
                  <div key={company} className="pb-4 border-b last:border-0">
                    <h3 className="font-semibold text-gray-900">{company} ({data.length} reports)</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {Object.entries(byExp).map(([exp, expData]) => {
                        const bases = expData.map(s => s.base_salary).sort((a, b) => a - b);
                        const stocks = expData.filter(s => s.stock_equity > 0).map(s => s.stock_equity).sort((a, b) => a - b);
                        
                        return (
                          <div key={exp}>
                            <span className="text-gray-500">{EXPERIENCE_LABELS[exp].split(' (')[0]}:</span>{' '}
                            <span className="text-gray-900">
                              {formatCurrency(bases[0])}{bases.length > 1 && `-${formatCurrency(bases[bases.length - 1])}`} base
                            </span>
                            {stocks.length > 0 && (
                              <span className="text-gray-600">
                                {' + '}{formatCurrency(stocks[0])}{stocks.length > 1 && `-${formatCurrency(stocks[stocks.length - 1])}`} stock
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Negotiation Tips */}
      {tips.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            💡 Negotiation Tips
          </h2>
          
          <div className="space-y-4">
            {tips.slice(0, 5).map((tip, idx) => (
              <blockquote key={idx} className="border-l-4 border-green-400 pl-4 py-2">
                <p className="text-gray-700 italic">"{tip.advice}"</p>
                <p className="text-sm text-gray-500 mt-1">
                  — {EXPERIENCE_LABELS[tip.experience]}
                </p>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Connect with professionals */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Connect with Professionals in this Role
        </h3>
        <p className="text-gray-600 mt-1">
          Message Gators who work in similar roles for personalized advice.
        </p>
        <Button 
          className="mt-4 bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('GatorDirectory', { role: role })}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Find People to Message
        </Button>
      </div>
    </div>
  );
}