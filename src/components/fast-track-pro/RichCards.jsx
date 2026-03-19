import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Mail, Briefcase, DollarSign, Newspaper, MessageSquare, Copy, Check, Pencil, X, TrendingUp, ClipboardList, Sparkles, ArrowRight, ExternalLink, CheckCircle2, Search, AlertTriangle, ShieldCheck, ShieldQuestion } from 'lucide-react';
import SuggestedActions from './SuggestedActions';
import { toast } from 'sonner';
import titleCase from '@/components/utils/titleCase';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import FollowCompanyButton from '@/components/fastiq/FollowCompanyButton';

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

export function CompanyIntelCard({ data, onSendMessage, user }) {
  if (!data || typeof data !== 'object') return null;

  try {
    const openRoles = toArray(data.open_roles);
    const recentNews = toArray(data.recent_news);
    const interviewTips = toArray(data.interview_tips);
    const signal = (typeof data.hiring_signal === 'string' ? data.hiring_signal : 'warm');
    const overallSignal = data.overall_signal || (signal === 'hot' ? 'green' : signal === 'cool' ? 'red' : 'yellow');
    const signalConfig = {
      hot: { emoji: '🟢', label: 'Hot', bg: 'bg-green-100 text-green-700' },
      warm: { emoji: '🟡', label: 'Warm', bg: 'bg-yellow-100 text-yellow-700' },
      cool: { emoji: '🔴', label: 'Cool', bg: 'bg-red-100 text-red-700' },
    };
    const overallSignalConfig = {
      green: { emoji: '🟢', label: 'Actively Hiring', bg: 'bg-green-100 text-green-700', border: 'border-l-green-500' },
      yellow: { emoji: '🟡', label: 'Mixed Signals', bg: 'bg-yellow-100 text-yellow-700', border: 'border-l-yellow-500' },
      red: { emoji: '🔴', label: 'Proceed with Caution', bg: 'bg-red-100 text-red-700', border: 'border-l-red-500' },
    };
    const s = signalConfig[signal] || signalConfig.warm;
    const os = overallSignalConfig[overallSignal] || overallSignalConfig.yellow;
    const warnings = Array.isArray(data.warning_signals) ? data.warning_signals : [];
    const similarCompanies = Array.isArray(data.similar_companies) ? data.similar_companies : [];
    const recommendationText = data.recommendation_text || '';

    const hiringScore = typeof data.hiring_score === 'number' ? data.hiring_score : null;
    const openRolesCount = typeof data.open_roles_count === 'number' ? data.open_roles_count : null;
    const companySummary = data.company_summary || data.summary || '';
    const interviewProcess = data.interview_process || '';

    return (
      <Card className="p-4 border border-[#2A2A2A] bg-[#1A1A1A] mt-2 mb-1">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#E85D20] rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">{titleCase(String(data.company || ''))}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge className={`text-xs ${overallSignal === 'green' ? 'bg-green-900/30 text-green-400' : overallSignal === 'red' ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'} border-0`}>{os.emoji} {os.label}</Badge>
              {overallSignal !== (signal === 'hot' ? 'green' : signal === 'cool' ? 'red' : 'yellow') && (
                <Badge className={`text-xs ${signal === 'hot' ? 'bg-green-900/30 text-green-400' : signal === 'cool' ? 'bg-red-900/30 text-red-400' : 'bg-amber-900/30 text-amber-400'} border-0`}>{s.emoji} {s.label} Hiring</Badge>
              )}
            </div>
          </div>
          {user && data.company && <FollowCompanyButton companyName={titleCase(String(data.company))} user={user} />}
        </div>

        {/* Key stats row — focused on student-relevant roles */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {hiringScore !== null && (
            <div className="bg-[#0A0A0A] rounded-lg p-2 text-center border border-[#2A2A2A]">
              <TrendingUp className="w-3.5 h-3.5 mx-auto mb-0.5 text-[#E85D20]" />
              <p className="text-lg font-bold text-white">{hiringScore}</p>
              <p className="text-[10px] text-[#888888] uppercase">Hiring Score</p>
            </div>
          )}
          <div className="bg-[#0A0A0A] rounded-lg p-2 text-center border border-[#2A2A2A]">
            <Briefcase className="w-3.5 h-3.5 mx-auto mb-0.5 text-[#E85D20]" />
            <p className="text-lg font-bold text-white">
              {((data.entry_level_roles_count || 0) + (data.intern_roles_count || 0)) || (openRolesCount ?? '—')}
            </p>
            <p className="text-[10px] text-[#888888] uppercase">
              {data.roles_found_label 
                ? data.roles_found_label 
                : (data.entry_level_roles_count != null || data.intern_roles_count != null) 
                  ? 'Entry / Intern' 
                  : 'Open Roles'}
            </p>
            {openRolesCount != null && (data.entry_level_roles_count != null || data.intern_roles_count != null) && (
              <p className="text-[9px] text-slate-400 mt-0.5">{openRolesCount} total</p>
            )}
            {((data.entry_level_roles_count || 0) + (data.intern_roles_count || 0)) === 0 && openRolesCount > 0 && (
              <p className="text-[9px] text-[#E85D20] mt-1">Other roles available — may lead to entry paths</p>
            )}
          </div>
          {data.salary_range && (
            <div className="bg-[#0A0A0A] rounded-lg p-2 text-center border border-[#2A2A2A]">
              <DollarSign className="w-3.5 h-3.5 mx-auto mb-0.5 text-[#22C55E]" />
              <p className="text-sm font-bold text-white">{String(data.salary_range)}</p>
              <p className="text-[10px] text-[#888888] uppercase">{data.salary_label || 'Entry Salary'}</p>
            </div>
          )}
        </div>

        {/* Company summary */}
        {companySummary && <p className="text-sm text-[#CCCCCC] mb-3">{String(companySummary)}</p>}

        {/* Open roles list (if provided as array) */}
        {openRoles.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#888888]" />
              <span className="text-xs font-semibold text-[#888888] uppercase">Open Roles</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {openRoles.slice(0, 6).map((r, i) => <Badge key={i} variant="outline" className="text-xs border-[#2A2A2A] text-[#CCCCCC]">{String(r)}</Badge>)}
            </div>
          </div>
        )}

        {/* Recent news */}
        {recentNews.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Newspaper className="w-3.5 h-3.5 text-[#888888]" />
              <span className="text-xs font-semibold text-[#888888] uppercase">Recent News</span>
            </div>
            <ul className="space-y-1">
              {recentNews.slice(0, 4).map((n, i) => (
                <li key={i} className="text-xs text-[#CCCCCC]">• {String(n)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning signals */}
        {warnings.length > 0 && (
          <div className="mt-3" style={{ background: 'rgba(229,57,53,0.06)', border: '0.5px solid rgba(229,57,53,0.15)', borderRadius: 8, padding: '10px 12px' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(229,57,53,0.8)' }}>⚠️ Heads up</p>
            {warnings.map((w, i) => (
              <div key={i} className="mb-1 last:mb-0">
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(229,57,53,0.7)' }}>{String(w.text)}{w.date ? ` (${w.date})` : ''}</p>
                {w.source && <a href={w.source} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: 'rgba(229,57,53,0.5)' }}>Source →</a>}
              </div>
            ))}
          </div>
        )}

        {/* FASTIQ's take — recommendation */}
        {recommendationText && (
          <div className="mt-3" style={{ background: 'rgba(232,93,32,0.08)', border: '0.5px solid rgba(232,93,32,0.2)', borderRadius: 8, padding: '10px 12px' }}>
            <p className="mb-1" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888' }}>FASTIQ's take</p>
            <p className="text-sm leading-relaxed italic text-[#CCCCCC]">{recommendationText}</p>
          </div>
        )}

        {/* Similar companies — shown when signal is red or no alumni */}
        {similarCompanies.length > 0 && (overallSignal === 'red' || !(data.alumni && data.alumni.length > 0)) && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <p className="text-xs text-[#888888] mb-2">Worth considering instead:</p>
            <div className="flex flex-wrap gap-2">
              {similarCompanies.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage && onSendMessage(`Research ${c.name} for me`)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#E85D20] hover:bg-[#E85D20]/10 transition-all cursor-pointer"
                  style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.signal === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <span className="font-medium text-white">{c.name}</span>
                  {c.alumni_count > 0 && <span className="text-[#888888]">{c.alumni_count} alumni</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interview process */}
        {interviewProcess && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-[#888888]" />
              <span className="text-xs font-semibold text-[#888888] uppercase">Interview Process</span>
            </div>
            <p className="text-xs text-[#CCCCCC]">{String(interviewProcess)}</p>
          </div>
        )}

        {/* Interview tips (legacy) */}
        {interviewTips.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#888888]" />
              <span className="text-xs font-semibold text-[#888888] uppercase">Interview Tips</span>
            </div>
            <ul className="space-y-1">
              {interviewTips.slice(0, 3).map((t, i) => (
                <li key={i} className="text-xs text-[#CCCCCC]">• {String(t)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Alumni found alongside intel */}
        {data.alumni && data.alumni.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-[#E85D20]" />
              <span className="text-xs font-semibold text-[#E85D20] uppercase">UF Alumni at {titleCase(String(data.company || ''))}</span>
            </div>
            <p className="text-[10px] text-amber-400 mb-2">⚠️ Verify current roles on LinkedIn before outreach</p>
            <div className="space-y-2">
              {data.alumni.slice(0, 3).map((a, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#0A0A0A] rounded-lg p-2 border border-[#2A2A2A]">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${a.is_cff_member ? 'bg-green-900/30 text-green-400' : 'bg-[#E85D20]/20 text-[#E85D20]'}`}>
                    {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-white text-xs truncate">{a.name}</p>
                      {a.confidence === 'high' && <ShieldCheck className="w-3 h-3 text-green-400 flex-shrink-0" />}
                      {a.confidence === 'medium' && <ShieldQuestion className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#888888] truncate">{a.role_title}{a.match_score ? ` · ${a.match_score}% match` : ''}</p>
                    <a
                      href={a.linkedin_url && a.linkedin_url.includes('linkedin.com') ? a.linkedin_url : `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent((a.name || '') + ' ' + (a.company || data.company || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-medium text-[#E85D20] hover:underline inline-flex items-center gap-0.5 mt-0.5"
                    >
                      {a.linkedin_url && a.linkedin_url.includes('linkedin.com') ? '🔗 LinkedIn' : <><Search className="w-2.5 h-2.5" /> Find on LinkedIn</>}
                    </a>
                  </div>
                  {onSendMessage && (
                    <button
                      onClick={() => onSendMessage(`Draft a message to ${a.name} at ${a.company}`)}
                      className="text-[10px] font-bold text-[#E85D20] bg-[#E85D20]/10 hover:bg-[#E85D20]/20 px-2 py-1 rounded-md border border-[#E85D20]/30 cursor-pointer transition-colors flex-shrink-0"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      Draft Intro →
                    </button>
                  )}
                </div>
              ))}
            </div>
            {data.alumni.length > 3 && (
              <p className="text-[10px] text-[#E85D20] mt-1.5 font-medium">+{data.alumni.length - 3} more alumni found</p>
            )}
          </div>
        )}

        {/* Scenario-Aware Actions */}
        {data.suggested_actions && data.suggested_actions.length > 0 && onSendMessage && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A] space-y-1.5">
            {data.suggested_actions.map((action, i) => {
              const cleanAction = String(action).replace(/\s*→\s*$/, '').trim();
              return (
                <button
                  key={i}
                  onClick={() => onSendMessage(cleanAction)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    i === 0
                      ? 'bg-[#E85D20] text-white hover:bg-[#d44e14] shadow-sm'
                      : 'bg-[#0A0A0A] border border-[#2A2A2A] text-[#E85D20] hover:bg-[#E85D20]/10'
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
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <button
              onClick={() => onSendMessage(`Tailor my resume for a role at ${titleCase(String(data.company))}`)}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg bg-[#E85D20] text-white hover:bg-[#d44e14] transition-all shadow-sm"
              style={{ minHeight: 'auto' }}
            >
              ✨ Tailor Resume for {titleCase(String(data.company))} →
            </button>
          </div>
        )}

        {/* Personalized Analysis */}
        {data.personalized_analysis && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E85D20]" />
              <span className="text-xs font-semibold text-[#E85D20] uppercase">What This Means For You</span>
            </div>
            {data.personalized_analysis.next_actions && data.personalized_analysis.next_actions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.personalized_analysis.next_actions.map((action, i) => {
                  const cleanAction = String(action).replace(/^→\s*/, '');
                  return (
                    <button
                      key={i}
                      onClick={() => onSendMessage && onSendMessage(cleanAction)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#E85D20] text-[#E85D20] bg-transparent hover:bg-[#E85D20] hover:text-white transition-all duration-200 cursor-pointer"
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
      <Card className="p-4 border border-[#2A2A2A] bg-[#1A1A1A] mt-2 mb-1">
        <p className="text-sm text-[#CCCCCC]">Company intel loaded — see the summary above for details.</p>
      </Card>
    );
  }
}

export function AlumniListCard({ data, onDraftMessage, onResearchCompany }) {
  const alumni = toArray(data?.alumni);
  const [verifiedMap, setVerifiedMap] = useState({});
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
    <Card className="p-4 border border-[#2A2A2A] bg-[#1A1A1A] mt-2 mb-1">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-[#E85D20]" />
        <span className="text-xs font-semibold text-[#E85D20] uppercase">
          {data?.role_search ? `UF ALUMNI IN ${(data.role_search_term || '').toUpperCase()}` : 'UF Alumni Found'}
        </span>
        {cffCount > 0 && (
          <Badge className="bg-green-900/30 text-green-400 text-[10px] px-1.5 py-0 border-0">
            {cffCount} CFF Member{cffCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      {/* Accuracy disclaimer */}
      <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-500/30 rounded-lg p-2.5 mb-3">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-400 leading-relaxed">
          Results based on public data — <strong>always verify current roles on LinkedIn</strong> before reaching out. FASTIQ is improving accuracy.
        </p>
      </div>
      <div className="space-y-3">
        {alumni.slice(0, 5).map((a, i) => {
          const isVerified = a.verified || verifiedMap[a.name];
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                a.is_cff_member ? 'bg-green-900/30 text-green-400 ring-2 ring-green-500/30' : 'bg-[#E85D20]/20 text-[#E85D20]'
              }`}>
                {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white text-sm truncate">{a.name}</p>
                  {a.is_cff_member && (
                    <Badge className="bg-green-900/30 text-green-400 text-[10px] px-1.5 py-0 border-0 gap-0.5 flex-shrink-0">
                      ✓ CFF Member
                    </Badge>
                  )}
                  {a.uf_verified === false && a.confidence === 'low' ? (
                    <Badge title="School connection unverified — check LinkedIn" className="bg-amber-900/30 text-amber-400 text-[10px] px-1.5 py-0 border-0 gap-0.5 flex-shrink-0 cursor-help">
                      <AlertTriangle className="w-2.5 h-2.5" /> UF Unverified
                    </Badge>
                  ) : a.confidence === 'high' || a.uf_verified ? (
                    <Badge title="Confirmed University of Florida graduate/alum" className="bg-green-900/30 text-green-400 text-[10px] px-1.5 py-0 border-0 gap-0.5 flex-shrink-0 cursor-help">
                      <ShieldCheck className="w-2.5 h-2.5" /> UF Verified
                    </Badge>
                  ) : a.confidence === 'medium' ? (
                    <Badge title="Likely UF connection — verify on LinkedIn before outreach" className="bg-amber-900/30 text-amber-400 text-[10px] px-1.5 py-0 border-0 gap-0.5 flex-shrink-0 cursor-help">
                      <ShieldQuestion className="w-2.5 h-2.5" /> Verify UF
                    </Badge>
                  ) : null}
                  {a.match_score && a.confidence !== 'low' && (
                    <Badge title="Match strength based on your interests + UF connection" className="bg-[#E85D20]/20 text-[#E85D20] text-[10px] px-1.5 py-0 border-0 flex-shrink-0 cursor-help">{a.match_score}%</Badge>
                  )}
                </div>
                <p className="text-xs text-[#888888] truncate">{a.role_title}{a.company ? ` at ${titleCase(a.company)}` : ''}</p>
                {a.location && data?.role_search && <p className="text-[10px] text-[#888888] truncate">📍 {a.location}</p>}
                {/* Degree info + confidence-aware verification */}
                {a.degree_info && a.uf_verified !== false && (
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-[#E85D20]">🐊 {a.degree_info}</span>
                    {(isVerified || a.confidence === 'high' || a.uf_verified) ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400">🔍 Verify on LinkedIn</span>
                    )}
                  </div>
                )}
                {a.uf_verified === false && (
                  <p className="text-[10px] text-amber-400 mt-0.5">⚠️ UF connection unverified — check LinkedIn education section</p>
                )}
                {!a.degree_info && a.uf_verified !== false && !isVerified && a.confidence !== 'high' && (
                  <p className="text-[10px] text-amber-400 mt-0.5">🔍 Verify current role on LinkedIn before reaching out</p>
                )}
                {a.verification_note && a.confidence !== 'high' && (
                  <p className="text-[10px] text-[#888888] mt-0.5 italic">{a.verification_note}</p>
                )}
                {/* LinkedIn / CFF link */}
                {a.is_cff_member ? (
                  <button
                    onClick={() => handleCFFMessage(a)}
                    className="mt-1 text-[11px] font-medium text-green-400 hover:text-green-300 hover:underline bg-transparent border-0 p-0 cursor-pointer inline-flex items-center gap-1"
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
                      className="text-[11px] font-medium text-[#E85D20] hover:text-[#d44e14] hover:underline inline-flex items-center gap-1"
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
                        className="text-[10px] font-medium text-green-400 hover:text-green-300 bg-green-900/20 hover:bg-green-900/30 border border-green-500/30 rounded-full px-2 py-0.5 cursor-pointer transition-colors inline-flex items-center gap-0.5"
                        style={{ minHeight: 'auto', minWidth: 'auto' }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark Verified
                      </button>
                    )}
                  </div>
                )}
                {a.connection_reason && <p className="text-xs text-[#CCCCCC] mt-1">{a.connection_reason}</p>}
                {/* Draft message button */}
                {onDraftMessage && a.confidence !== 'low' && (
                  <button
                    onClick={() => onDraftMessage(`Draft a warm intro message to ${a.name}${a.role_title ? ', ' + a.role_title : ''}${a.company ? ' at ' + a.company : ''}`)}
                    className="mt-1.5 text-[11px] font-medium text-[#E85D20] hover:text-[#d44e14] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    style={{ minHeight: 'auto', minWidth: 'auto' }}
                  >
                    ✉️ Draft message to {getFirstName(a.name)}
                  </button>
                )}
                {a.confidence === 'low' && (
                  <p className="text-[10px] text-[#888888] mt-1 italic">Outreach not recommended — verify connection first</p>
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
            <div className="mt-3 pt-3 border-t border-[#2A2A2A] space-y-1.5">
              {backendActions.map((action, i) => {
                const cleanAction = String(action).replace(/\s*→\s*$/, '').trim();
                return (
                  <button key={i} onClick={() => onDraftMessage(cleanAction)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${i === 0 ? 'bg-[#E85D20] text-white hover:bg-[#d44e14] shadow-sm' : 'bg-[#0A0A0A] border border-[#2A2A2A] text-[#E85D20] hover:bg-[#E85D20]/10'}`}
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
        <div className="mt-3 pt-3 border-t border-[#2A2A2A] space-y-1.5">
          <button
            onClick={() => onDraftMessage(topMatchName)}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#E85D20] text-white hover:bg-[#d44e14] shadow-sm cursor-pointer transition-all"
            style={{ minHeight: 'auto' }}
          >
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            Draft intro to {topFirstName}
          </button>
          {alumni.length > 1 && (
            <button
              onClick={() => onDraftMessage(`See all alumni at ${titleCase(alumni[0]?.company || '')}`)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#0A0A0A] border border-[#2A2A2A] text-[#E85D20] hover:bg-[#E85D20]/10 cursor-pointer transition-all"
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
    <Card className="p-4 border border-[#2A2A2A] bg-[#1A1A1A] mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-[#E85D20]" />
        <p className="font-semibold text-white text-sm">Draft Message</p>
        {data.channel && <Badge variant="outline" className="text-xs border-[#2A2A2A] text-[#CCCCCC]">{data.channel}</Badge>}
        {data.ask_type && <Badge className="bg-[#E85D20]/20 text-[#E85D20] text-[10px] border-0">{data.ask_type}</Badge>}
      </div>

      {data.recipient && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[#888888]">To:</span>
          <span className="text-xs font-medium text-white">{data.recipient}</span>
          {data.recipient_title && <span className="text-xs text-[#888888]">· {data.recipient_title}</span>}
          {data.recipient_company && <span className="text-xs text-[#888888]">at {data.recipient_company}</span>}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-2 mb-3">
          {data.channel === 'Email' && (
            <input
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              className="w-full text-xs border border-[#E85D20]/50 rounded-lg px-3 py-2 bg-[#0A0A0A] text-white focus:outline-none focus:ring-2 focus:ring-[#E85D20]"
              placeholder="Subject line..."
            />
          )}
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            rows={8}
            className="w-full text-sm border border-[#E85D20]/50 rounded-lg px-3 py-2 bg-[#0A0A0A] text-white focus:outline-none focus:ring-2 focus:ring-[#E85D20] resize-y leading-relaxed"
          />
        </div>
      ) : (
        <>
          {currentSubject && <p className="text-xs text-[#CCCCCC] mb-2 font-medium">Subject: {currentSubject}</p>}
          <div className="bg-[#0A0A0A] rounded-lg p-3 border-l-2 border-[#E85D20] mb-3">
            <p className="text-sm text-[#CCCCCC] whitespace-pre-wrap leading-relaxed">{currentMessage}</p>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="flex-1 gap-2 border-[#E85D20] text-[#E85D20] hover:bg-[#E85D20] hover:text-white"
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
              className="gap-1.5 bg-[#E85D20] hover:bg-[#d44e14] text-white"
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
              className="gap-1.5 text-[#888888]"
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
            className="gap-1.5 border-[#2A2A2A] hover:bg-[#2A2A2A] text-[#CCCCCC]"
            style={{ minHeight: 'auto' }}
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        )}
      </div>

      <SuggestedActions actions={data.suggested_next_steps || data.next_steps} onSendMessage={onSendMessage} className="mt-3 pt-3 border-t border-[#2A2A2A]" accentColor="#E85D20" />
    </Card>
  );
}

// RoadmapCard moved to RoadmapTimelineCard.jsx with interactive checkboxes
// Re-export for backward compatibility
export { default as RoadmapCard } from './RoadmapTimelineCard';