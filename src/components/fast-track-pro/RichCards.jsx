import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Mail, Map, CheckCircle2, Briefcase, DollarSign, Newspaper, MessageSquare } from 'lucide-react';

export function CompanyIntelCard({ data }) {
  if (!data) return null;
  const signal = data.hiring_signal || 'warm';
  const signalConfig = {
    hot: { emoji: '🟢', label: 'Hot', bg: 'bg-green-100 text-green-700' },
    warm: { emoji: '🟡', label: 'Warm', bg: 'bg-yellow-100 text-yellow-700' },
    cool: { emoji: '🔴', label: 'Cool', bg: 'bg-red-100 text-red-700' },
  };
  const s = signalConfig[signal] || signalConfig.warm;

  return (
    <Card className="p-4 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 mt-2 mb-1">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[#0021A5] rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900">{data.company}</p>
          <Badge className={`text-xs ${s.bg}`}>{s.emoji} {s.label} Hiring</Badge>
        </div>
      </div>
      {data.summary && <p className="text-sm text-slate-700 mb-3">{data.summary}</p>}
      {data.open_roles?.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Open Roles</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {data.open_roles.slice(0, 6).map((r, i) => <Badge key={i} variant="outline" className="text-xs">{r}</Badge>)}
          </div>
        </div>
      )}
      {data.salary_range && (
        <div className="flex items-center gap-1.5 mb-2">
          <DollarSign className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs text-slate-600">Salary range: <strong>{data.salary_range}</strong></span>
        </div>
      )}
      {data.recent_news?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Newspaper className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Recent News</span>
          </div>
          <ul className="space-y-1">
            {data.recent_news.slice(0, 3).map((n, i) => (
              <li key={i} className="text-xs text-slate-600">• {n}</li>
            ))}
          </ul>
        </div>
      )}
      {data.interview_tips?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Interview Tips</span>
          </div>
          <ul className="space-y-1">
            {data.interview_tips.slice(0, 3).map((t, i) => (
              <li key={i} className="text-xs text-slate-600">• {t}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export function AlumniListCard({ data }) {
  const alumni = data?.alumni || [];
  if (!alumni.length) return null;
  return (
    <Card className="p-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-700 uppercase">UF Gator Alumni Found</span>
      </div>
      <div className="space-y-3">
        {alumni.slice(0, 5).map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-9 h-9 bg-purple-200 rounded-lg flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
              {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 text-sm truncate">{a.name}</p>
                {a.match_score && (
                  <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0 flex-shrink-0">{a.match_score}%</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{a.role_title} at {a.company}</p>
              {a.degree_info && <p className="text-[11px] text-purple-600 mt-0.5">🐊 {a.degree_info}</p>}
              {a.connection_reason && <p className="text-xs text-slate-600 mt-1">{a.connection_reason}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OutreachDraftCard({ data }) {
  if (!data) return null;
  return (
    <Card className="p-4 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-[#FA4616]" />
        <p className="font-semibold text-slate-900 text-sm">Draft Message</p>
        {data.channel && <Badge variant="outline" className="text-xs ml-auto">{data.channel}</Badge>}
      </div>
      {data.recipient && <p className="text-xs text-slate-500 mb-2">To: {data.recipient}</p>}
      {data.subject && <p className="text-xs text-slate-600 mb-2 font-medium">Subject: {data.subject}</p>}
      <div className="bg-white rounded-lg p-3 border border-orange-200">
        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{data.message}</p>
      </div>
    </Card>
  );
}

export function RoadmapCard({ data }) {
  if (!data) return null;
  const weeks = data.weeks || [];
  return (
    <Card className="p-4 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-4 h-4 text-green-600" />
        <p className="font-semibold text-slate-900 text-sm">{data.title || 'Career Roadmap'}</p>
      </div>
      <div className="space-y-4">
        {weeks.slice(0, 6).map((w, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute left-0 top-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">{w.week_number || i + 1}</span>
            </div>
            {i < weeks.length - 1 && <div className="absolute left-[7px] top-5 w-0.5 h-full bg-green-200" />}
            <div>
              <p className="text-sm font-semibold text-slate-900">{w.focus}</p>
              {w.tasks?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {w.tasks.map((t, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}