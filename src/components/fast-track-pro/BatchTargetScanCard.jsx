import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, TrendingUp, Star } from 'lucide-react';
import titleCase from '@/components/utils/titleCase';
import SuggestedActions from './SuggestedActions';

const signalConfig = {
  hot: { emoji: '🟢', label: 'Hot', bg: 'bg-green-100 text-green-700' },
  warm: { emoji: '🟡', label: 'Warm', bg: 'bg-yellow-100 text-yellow-700' },
  cool: { emoji: '🔴', label: 'Cool', bg: 'bg-red-100 text-red-700' },
};

const matchConfig = {
  strong: { label: 'Strong Match', bg: 'bg-green-100 text-green-700' },
  moderate: { label: 'Moderate', bg: 'bg-yellow-100 text-yellow-700' },
  weak: { label: 'Weak', bg: 'bg-red-100 text-red-700' },
};

function CompanyRow({ company, isBestMatch, onResearch }) {
  const signal = signalConfig[company.hiring_signal] || signalConfig.warm;
  const match = matchConfig[company.profile_match] || matchConfig.moderate;
  const roles = company.roles || [];

  return (
    <div className={`rounded-xl border p-3 ${isBestMatch ? 'border-green-300 bg-green-50/50 ring-1 ring-green-200' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {isBestMatch && <Star className="w-4 h-4 text-green-600 flex-shrink-0" />}
          <p className="font-semibold text-slate-900 text-sm truncate">{titleCase(company.company_name || '')}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Badge className={`text-[10px] ${signal.bg} border-0`}>{signal.emoji} {signal.label}</Badge>
          <Badge className={`text-[10px] ${match.bg} border-0`}>{match.label}</Badge>
        </div>
      </div>

      {roles.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {roles.slice(0, 4).map((r, i) => (
            <Badge key={i} variant="outline" className="text-[10px] gap-1">
              <Briefcase className="w-2.5 h-2.5" />
              {r.title}{r.type === 'internship' ? ' (intern)' : ''}
            </Badge>
          ))}
          {roles.length > 4 && (
            <Badge variant="outline" className="text-[10px]">+{roles.length - 4} more</Badge>
          )}
        </div>
      )}

      {company.summary && (
        <p className="text-xs text-slate-600 mb-2 line-clamp-2">{company.summary}</p>
      )}

      <button
        onClick={() => onResearch(company.company_name)}
        className="text-[11px] font-medium text-[#0021A5] hover:underline bg-transparent border-0 p-0 cursor-pointer"
        style={{ minHeight: 'auto', minWidth: 'auto' }}
      >
        🔍 Deep dive into {titleCase(company.company_name || '')}
      </button>
    </div>
  );
}

export default function BatchTargetScanCard({ data, onResearchCompany, onSendMessage }) {
  const companies = data?.companies || [];
  const bestMatch = data?.best_match || '';

  if (!companies.length) return null;

  const totalRoles = companies.reduce((sum, c) => sum + (c.roles?.length || 0), 0);

  return (
    <Card className="p-4 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 bg-[#0021A5] rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">Target Companies Scan</p>
          <p className="text-xs text-slate-500">{companies.length} companies · {totalRoles} roles found</p>
        </div>
      </div>

      <div className="space-y-2">
        {companies.map((c, i) => (
          <CompanyRow
            key={i}
            company={c}
            isBestMatch={c.company_name?.toLowerCase() === bestMatch?.toLowerCase()}
            onResearch={(name) => onResearchCompany && onResearchCompany(name)}
          />
        ))}
      </div>

      <SuggestedActions actions={data.suggested_next_steps || data.next_steps} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-indigo-200" />
    </Card>
  );
}