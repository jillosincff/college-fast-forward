import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Mail, Briefcase, DollarSign, Newspaper, MessageSquare, Copy, Check, Pencil, X, TrendingUp, ClipboardList, Sparkles, ArrowRight, ExternalLink, CheckCircle2, Search } from 'lucide-react';
import SuggestedActions from './SuggestedActions';
import { toast } from 'sonner';
import titleCase from '@/components/utils/titleCase';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

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

export function CompanyIntelCard({ data, onSendMessage }) {
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

        {/* Key stats row — focused on student-relevant roles */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {hiringScore !== null && (
            <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
              <TrendingUp className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
              <p className="text-lg font-bold text-slate-900">{hiringScore}</p>
              <p className="text-[10px] text-slate-500 uppercase">Hiring Score</p>
            </div>
          )}
          <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
            <Briefcase className="w-3.5 h-3.5 mx-auto mb-0.5 text-indigo-600" />
            <p className="text-lg font-bold text-slate-900">
              {((data.entry_level_roles_count || 0) + (data.intern_roles_count || 0)) || (openRolesCount ?? '—')}
            </p>
            <p className="text-[10px] text-slate-500 uppercase">
              {data.roles_found_label 
                ? data.roles_found_label 
                : (data.entry_level_roles_count != null || data.intern_roles_count != null) 
                  ? 'Entry / Intern' 
                  : 'Open Roles'}
            </p>
            {openRolesCount != null && (data.entry_level_roles_count != null || data.intern_roles_count != null) && (
              <p className="text-[9px] text-slate-400 mt-0.5">{openRolesCount} total</p>
            )}
          </div>
          {data.salary_range && (
            <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
              <DollarSign className="w-3.5 h-3.5 mx-auto mb-0.5 text-green-600" />
              <p className="text-sm font-bold text-slate-900">{String(data.salary_range)}</p>
              <p className="text-[10px] text-slate-500 uppercase">{data.salary_label || 'Entry Salary'}</p>
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

        {/* Alumni found alongside intel */}
        {data.alumni && data.alumni.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 uppercase">UF Alumni at {titleCase(String(data.company || ''))}</span>
            </div>
            <div className="space-y-2">
              {data.alumni.slice(0, 3).map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-purple-100">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${a.is_cff_member ? 'bg-green-200 text-green-700' : 'bg-purple-200 text-purple-700'}`}>
                    {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-xs truncate">{a.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{a.role_title}{a.match_score ? ` · ${a.match_score}% match` : ''}</p>
                  </div>
                  {onSendMessage && (
                    <button
                      onClick={() => onSendMessage(`Draft a message to ${a.name} at ${a.company}`)}
                      className="text-[10px] font-bold text-[#0021A5] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 cursor-pointer transition-colors flex-shrink-0"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      Draft Intro →
                    </button>
                  )}
                </div>
              ))}
            </div>
            {data.alumni.length > 3 && (
              <p className="text-[10px] text-purple-600 mt-1.5 font-medium">+{data.alumni.length - 3} more alumni found</p>
            )}
          </div>
        )}

        {/* Scenario-Aware Actions */}
        {data.suggested_actions && data.suggested_actions.length > 0 && onSendMessage && (
          <div className="mt-3 pt-3 border-t border-blue-200 space-y-1.5">
            {data.suggested_actions.map((action, i) => {
              const cleanAction = String(action).replace(/\s*→\s*$/, '').trim();
              return (
                <button
                  key={i}
                  onClick={() => onSendMessage(cleanAction)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    i === 0
                      ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-sm'
                      : 'bg-white border-2 border-blue-200 text-[#0021A5] hover:bg-blue-50'
                  }`}
                  style={{ minHeight: 'auto' }}
                >
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                  {cleanAction}
                </button>
              );
            })}
          </div>
        )}

        {/* Fallback: Tailor Resume Button (when no suggested_actions) */}
        {(!data.suggested_actions || data.suggested_actions.length === 0) && data.company && onSendMessage && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <button
              onClick={() => onSendMessage(`Tailor my resume for a role at ${titleCase(String(data.company))}`)}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm"
              style={{ minHeight: 'auto' }}
            >
              ✨ Tailor Resume for {titleCase(String(data.company))} →
            </button>
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
              <div className="flex flex-wrap gap-1.5">
                {data.personalized_analysis.next_actions.map((action, i) => {
                  const cleanAction = String(action).replace(/^→\s*/, '');
                  return (
                    <button
                      key={i}
                      onClick={() => onSendMessage && onSendMessage(cleanAction)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 border-[#0021A5] text-[#0021A5] bg-transparent hover:bg-[#0021A5] hover:text-white transition-all duration-200 cursor-pointer"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      <ArrowRight className="w-3 h-3 flex-shrink-0" />
                      {cleanAction}
                    </button>
                  );
                })}
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
  const [verifiedMap, setVerifiedMap] = React.useState({});
  if (!alumni.length) return null;
  const cffCount = alumni.filter(a => a.is_cff_member).length;

  const handleVerify = async (alumniName) => {
    setVerifiedMap(prev => ({ ...prev, [alumniName]: true }));
    try {
      const records = await base44.entities.DiscoveredAlumni.filter({ name: alumniName });
      if (records?.[0]) {
        const user = await base44.auth.me();
        await base44.entities.DiscoveredAlumni.update(records[0].id, { verified: true, verified_by: user?.email || '' });
      }
    } catch (e) { console.log('Verify error:', e.message); }
    toast.success(`Marked ${getFirstName(alumniName)} as verified`);
  };

  const getLinkedInUrl = (a) => {
    if (a.linkedin_url && a.linkedin_url.includes('linkedin.com')) return a.linkedin_url;
    return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent((a.name || '') + ' ' + (a.company || ''))}`;
  };

  const hasDirectLinkedIn = (a) => !!(a.linkedin_url && a.linkedin_url.includes('linkedin.com'));

  const handleCFFMessage = (a) => {
    const email = a.cff_email || '';
    if (email) {
      navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(a.name || '')}`);
    }
  };

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
        {alumni.slice(0, 5).map((a, i) => {
          const isVerified = a.verified || verifiedMap[a.name];
          return (
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
                {/* Degree info + verification */}
                {a.degree_info && (
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-purple-600">🐊 {a.degree_info}</span>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600">🔍 Verify on LinkedIn before reaching out</span>
                    )}
                  </div>
                )}
                {!a.degree_info && !isVerified && (
                  <p className="text-[10px] text-amber-600 mt-0.5">🔍 Verify on LinkedIn before reaching out</p>
                )}
                {/* LinkedIn / CFF link */}
                {a.is_cff_member ? (
                  <button
                    onClick={() => handleCFFMessage(a)}
                    className="mt-1 text-[11px] font-medium text-green-700 hover:text-green-800 hover:underline bg-transparent border-0 p-0 cursor-pointer inline-flex items-center gap-1"
                    style={{ minHeight: 'auto', minWidth: 'auto' }}
                  >
                    💬 Message on CFF →
                  </button>
                ) : (
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <a
                      href={getLinkedInUrl(a)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-[#0077B5] hover:text-[#005885] hover:underline inline-flex items-center gap-1"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      {hasDirectLinkedIn(a) ? (
                        <>🔗 View LinkedIn Profile →</>
                      ) : (
                        <><Search className="w-3 h-3" /> Search on LinkedIn →</>
                      )}
                    </a>
                    {!isVerified && (
                      <button
                        onClick={() => handleVerify(a.name)}
                        className="text-[10px] font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-full px-2 py-0.5 cursor-pointer transition-colors inline-flex items-center gap-0.5"
                        style={{ minHeight: 'auto', minWidth: 'auto' }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark Verified
                      </button>
                    )}
                  </div>
                )}
                {a.connection_reason && <p className="text-xs text-slate-600 mt-1">{a.connection_reason}</p>}
                {/* Draft message button */}
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
          );
        })}
      </div>
      {/* Bottom actions — scenario-driven */}
      {alumni.length > 0 && onDraftMessage && (() => {
        let topMatchName = data?.top_match;
        if (!topMatchName) {
          const sorted = [...alumni].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
          topMatchName = sorted[0]?.name;
        }
        const topFirstName = getFirstName(topMatchName);
        // Use suggested_actions from backend if available
        const backendActions = data?.suggested_actions;
        if (backendActions && backendActions.length > 0 && onDraftMessage) {
          return (
            <div className="mt-3 pt-3 border-t border-purple-200 space-y-1.5">
              {backendActions.map((action, i) => {
                const cleanAction = String(action).replace(/\s*→\s*$/, '').trim();
                return (
                  <button key={i} onClick={() => onDraftMessage(cleanAction)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${i === 0 ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-sm' : 'bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50'}`}
                    style={{ minHeight: 'auto' }}>
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                    {cleanAction}
                  </button>
                );
              })}
            </div>
          );
        }
        return (
        <div className="mt-3 pt-3 border-t border-purple-200 space-y-1.5">
          <button
            onClick={() => onDraftMessage(topMatchName)}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#0021A5] text-white hover:bg-[#001580] shadow-sm cursor-pointer transition-all"
            style={{ minHeight: 'auto' }}
          >
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            Draft intro to {topFirstName}
          </button>
          {alumni.length > 1 && (
            <button
              onClick={() => onDraftMessage(`See all alumni at ${titleCase(alumni[0]?.company || '')}`)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer transition-all"
              style={{ minHeight: 'auto' }}
            >
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              See all {alumni.length} alumni
            </button>
          )}
        </div>
        );
      })()}
    </Card>
  );
}

// P1 FIX: Use local state for message/subject instead of mutating props
export function OutreachDraftCard({ data, onSendMessage }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(data?.message || '');
  const [currentSubject, setCurrentSubject] = useState(data?.subject || '');

  if (!data) return null;

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
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              className="w-full text-xs border border-orange-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Subject line..."
            />
          )}
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
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
                setCurrentMessage(data.message || '');
                setCurrentSubject(data.subject || '');
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

      <SuggestedActions actions={data.suggested_next_steps || data.next_steps} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-orange-200" accentColor="#EA580C" />
    </Card>
  );
}

// RoadmapCard moved to RoadmapTimelineCard.jsx with interactive checkboxes
// Re-export for backward compatibility
export { default as RoadmapCard } from './RoadmapTimelineCard';