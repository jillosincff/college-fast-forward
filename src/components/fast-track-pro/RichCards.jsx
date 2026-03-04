import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Mail, Briefcase, DollarSign, Newspaper, MessageSquare, Copy, Check, Pencil, X, TrendingUp, ClipboardList, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import titleCase from '@/components/utils/titleCase';

// Extract first name only, stripping titles like Dr., Mr., etc.
function getFirstName(fullName) {
  if (!fullName) return '';
  const cleaned = fullName.replace(/^(?:Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?)\s+/i, '');
  return cleaned.split(' ')[0] || cleaned;
}

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    // Split multi-line or comma-separated strings
    const lines = val.split(/\n|(?:,\s*)/).map(s => s.trim()).filter(Boolean);
    return lines.length > 0 ? lines : [val.trim()];
  }
  return [];
}

export function CompanyIntelCard({ data }) {
  if (!data || typeof data !== 'object') return null;

  try {
    const openRoles = toArray(data.open_roles);
    const recentNews = toArray(data.recent_news);
    const interviewTips = toArray(data.interview_tips);
    const signal = (typeof data.hiring_signal === 'string' ? data.hiring_signal : 'warm');
    const signalConfig = {
      hot: { emoji: '🟢', label: 'Hot', bg: 'bg-green-100 text-green-700' },
      warm: { emoji: '🟡', label: 'Warm', bg: 'bg-yellow-100 text-yellow-700' },
      cool: { emoji: '🔴', label: 'Cool', bg: 'bg-red-100 text-red-700' },
    };
    const s = signalConfig[signal] || signalConfig.warm;

    const hiringScore = typeof data.hiring_score === 'number' ? data.hiring_score : null;
    const openRolesCount = typeof data.open_roles_count === 'number' ? data.open_roles_count : null;
    const companySummary = data.company_summary || data.summary || '';
    const interviewProcess = data.interview_process || '';

    return (
      <Card className="p-4 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 mt-2 mb-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#0021A5] rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{titleCase(String(data.company || ''))}</p>
            <Badge className={`text-xs ${s.bg}`}>{s.emoji} {s.label} Hiring</Badge>
          </div>
        </div>

        {/* Key stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {hiringScore !== null && (
            <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
              <TrendingUp className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
              <p className="text-lg font-bold text-slate-900">{hiringScore}</p>
              <p className="text-[10px] text-slate-500 uppercase">Hiring Score</p>
            </div>
          )}
          {openRolesCount !== null && (
            <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
              <Briefcase className="w-3.5 h-3.5 mx-auto mb-0.5 text-indigo-600" />
              <p className="text-lg font-bold text-slate-900">{openRolesCount.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 uppercase">Open Roles</p>
            </div>
          )}
          {data.salary_range && (
            <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
              <DollarSign className="w-3.5 h-3.5 mx-auto mb-0.5 text-green-600" />
              <p className="text-sm font-bold text-slate-900">{String(data.salary_range)}</p>
              <p className="text-[10px] text-slate-500 uppercase">Salary Range</p>
            </div>
          )}
        </div>

        {/* Company summary */}
        {companySummary && <p className="text-sm text-slate-700 mb-3">{String(companySummary)}</p>}

        {/* Open roles list (if provided as array) */}
        {openRoles.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Open Roles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {openRoles.slice(0, 6).map((r, i) => <Badge key={i} variant="outline" className="text-xs">{String(r)}</Badge>)}
            </div>
          </div>
        )}

        {/* Recent news */}
        {recentNews.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Newspaper className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Recent News</span>
            </div>
            <ul className="space-y-1">
              {recentNews.slice(0, 4).map((n, i) => (
                <li key={i} className="text-xs text-slate-600">• {String(n)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Interview process */}
        {interviewProcess && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Interview Process</span>
            </div>
            <p className="text-xs text-slate-600">{String(interviewProcess)}</p>
          </div>
        )}

        {/* Interview tips (legacy) */}
        {interviewTips.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase">Interview Tips</span>
            </div>
            <ul className="space-y-1">
              {interviewTips.slice(0, 3).map((t, i) => (
                <li key={i} className="text-xs text-slate-600">• {String(t)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Personalized Analysis */}
        {data.personalized_analysis && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FA4616]" />
              <span className="text-xs font-semibold text-[#FA4616] uppercase">What This Means For You</span>
            </div>
            {data.personalized_analysis.next_actions && data.personalized_analysis.next_actions.length > 0 && (
              <div className="space-y-1.5">
                {data.personalized_analysis.next_actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-blue-100">
                    <ArrowRight className="w-3.5 h-3.5 text-[#0021A5] mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-700 font-medium">{String(action).replace(/^→\s*/, '')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  } catch (err) {
    console.error('CompanyIntelCard render error:', err);
    return (
      <Card className="p-4 border-2 border-blue-200 bg-blue-50 mt-2 mb-1">
        <p className="text-sm text-slate-700">Company intel loaded — see the summary above for details.</p>
      </Card>
    );
  }
}

export function AlumniListCard({ data, onDraftMessage, onResearchCompany }) {
  const alumni = toArray(data?.alumni);
  if (!alumni.length) return null;
  const cffCount = alumni.filter(a => a.is_cff_member).length;
  return (
    <Card className="p-4 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-700 uppercase">UF Alumni Found</span>
        {cffCount > 0 && (
          <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 border-0">
            {cffCount} CFF Member{cffCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      <div className="space-y-3">
        {alumni.slice(0, 5).map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
              a.is_cff_member ? 'bg-green-200 text-green-700 ring-2 ring-green-400' : 'bg-purple-200 text-purple-700'
            }`}>
              {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-900 text-sm truncate">{a.name}</p>
                {a.is_cff_member && (
                  <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 border-0 gap-0.5 flex-shrink-0">
                    ✓ CFF Member
                  </Badge>
                )}
                {a.match_score && (
                  <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0 flex-shrink-0">{a.match_score}%</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">{a.role_title} at {titleCase(a.company)}</p>
              {a.degree_info && <p className="text-[11px] text-purple-600 mt-0.5">🐊 {a.degree_info}</p>}
              {a.is_cff_member ? (
                <p className="text-[11px] text-green-600 mt-0.5 font-medium">💬 Message directly on CFF</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">🔗 Reach out via LinkedIn</p>
              )}
              {a.connection_reason && <p className="text-xs text-slate-600 mt-1">{a.connection_reason}</p>}
              {/* Action button per alumni */}
              {onDraftMessage && (
                <button
                  onClick={() => onDraftMessage(a.name)}
                  className="mt-1.5 text-[11px] font-medium text-[#0021A5] hover:text-[#001580] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  ✉️ Draft message to {getFirstName(a.name)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Bottom actions */}
      {alumni.length > 0 && onDraftMessage && (() => {
        // Use top_match from agent recommendation, fallback to highest score
        let topMatchName = data?.top_match;
        if (!topMatchName) {
          const sorted = [...alumni].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
          topMatchName = sorted[0]?.name;
        }
        const topFirstName = getFirstName(topMatchName);
        return (
        <div className="mt-3 pt-3 border-t border-purple-200 flex flex-wrap gap-2">
          <button
            onClick={() => onDraftMessage(topMatchName)}
            className="text-xs bg-[#0021A5] text-white px-3 py-1.5 rounded-lg hover:bg-[#001580] transition-colors font-medium"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            ✉️ Draft outreach to {topFirstName}
          </button>
          {alumni[0]?.company && (
            <button
              onClick={() => onResearchCompany && onResearchCompany(alumni[0].company)}
              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors font-medium"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              🏢 Research {titleCase(alumni[0].company)}
            </button>
          )}
        </div>
        );
      })()}
    </Card>
  );
}

export function OutreachDraftCard({ data }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(data?.message || '');
  const [editedSubject, setEditedSubject] = useState(data?.subject || '');

  if (!data) return null;

  const currentMessage = isEditing ? editedMessage : (data.message || '');
  const currentSubject = isEditing ? editedSubject : (data.subject || '');

  const handleCopy = () => {
    const fullText = currentSubject
      ? `Subject: ${currentSubject}\n\n${currentMessage}`
      : currentMessage;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    data.message = editedMessage;
    data.subject = editedSubject;
    setIsEditing(false);
  };

  return (
    <Card className="p-4 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-[#FA4616]" />
        <p className="font-semibold text-slate-900 text-sm">Draft Message</p>
        {data.channel && <Badge variant="outline" className="text-xs">{data.channel}</Badge>}
        {data.ask_type && <Badge className="bg-orange-100 text-orange-700 text-[10px] border-0">{data.ask_type}</Badge>}
      </div>

      {data.recipient && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-500">To:</span>
          <span className="text-xs font-medium text-slate-700">{data.recipient}</span>
          {data.recipient_title && <span className="text-xs text-slate-400">· {data.recipient_title}</span>}
          {data.recipient_company && <span className="text-xs text-slate-400">at {data.recipient_company}</span>}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2 mb-3">
          {data.channel === 'Email' && (
            <input
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              className="w-full text-xs border border-orange-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Subject line..."
            />
          )}
          <textarea
            value={editedMessage}
            onChange={(e) => setEditedMessage(e.target.value)}
            rows={8}
            className="w-full text-sm border border-orange-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 resize-y leading-relaxed"
          />
        </div>
      ) : (
        <>
          {currentSubject && <p className="text-xs text-slate-600 mb-2 font-medium">Subject: {currentSubject}</p>}
          <div className="bg-white rounded-lg p-3 border border-orange-200 mb-3">
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{currentMessage}</p>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="flex-1 gap-2 border-orange-300 hover:bg-orange-100 text-orange-700"
          style={{ minHeight: 'auto' }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        {isEditing ? (
          <>
            <Button
              onClick={handleSaveEdit}
              size="sm"
              className="gap-1.5 bg-orange-600 hover:bg-orange-700 text-white"
              style={{ minHeight: 'auto' }}
            >
              <Check className="w-3.5 h-3.5" /> Save
            </Button>
            <Button
              onClick={() => {
                setEditedMessage(data.message || '');
                setEditedSubject(data.subject || '');
                setIsEditing(false);
              }}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-500"
              style={{ minHeight: 'auto' }}
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-300 hover:bg-slate-100 text-slate-600"
            style={{ minHeight: 'auto' }}
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        )}
      </div>
    </Card>
  );
}

// RoadmapCard moved to RoadmapTimelineCard.jsx with interactive checkboxes
// Re-export for backward compatibility
export { default as RoadmapCard } from './RoadmapTimelineCard';