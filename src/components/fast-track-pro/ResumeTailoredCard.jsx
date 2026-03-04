import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download, RefreshCw, Mail, Users, FileText, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function ScoreGauge({ score, size = 90 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(score, 100)) / 100;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 24, fontWeight: 800, fontFamily: "'Space Mono', monospace", fill: color }}>
        {score}
      </text>
    </svg>
  );
}

function KeywordBar({ matched, total }) {
  const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
  const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{matched}/{total}</span>
    </div>
  );
}

export default function ResumeTailoredCard({ data, onSendMessage }) {
  const [activeTab, setActiveTab] = useState('changes');
  const [copied, setCopied] = useState(false);

  if (!data || typeof data !== 'object') return null;

  const resume = data.resume || {};
  const atsScore = data.ats_score || 0;
  const keywordsMatched = data.keywords_matched || [];
  const keywordsAdded = data.keywords_added || [];
  const keywordsMissing = data.keywords_missing || [];
  const changesSummary = data.changes_summary || '';
  const changes = data.changes || [];
  const company = data.company_name || 'the company';
  const role = data.role_title || 'the role';
  const totalKeywords = keywordsMatched.length + keywordsAdded.length + keywordsMissing.length;
  const matchedCount = keywordsMatched.length + keywordsAdded.length;

  const buildPlainText = () => {
    const lines = [];
    if (resume.contact?.name) lines.push(resume.contact.name);
    if (resume.contact?.email) lines.push(resume.contact.email);
    if (resume.contact?.phone) lines.push(resume.contact.phone);
    if (resume.contact?.linkedin) lines.push(resume.contact.linkedin);
    if (resume.contact?.location) lines.push(resume.contact.location);
    lines.push('');
    if (resume.summary) { lines.push('PROFESSIONAL SUMMARY'); lines.push(resume.summary); lines.push(''); }
    if (resume.education?.length) {
      lines.push('EDUCATION');
      resume.education.forEach(e => {
        lines.push(`${e.school} — ${e.degree}`);
        if (e.graduation_date) lines.push(`Graduation: ${e.graduation_date}`);
        if (e.gpa) lines.push(`GPA: ${e.gpa}`);
        if (e.relevant_coursework) lines.push(`Relevant Coursework: ${e.relevant_coursework}`);
        lines.push('');
      });
    }
    if (resume.experience?.length) {
      lines.push('EXPERIENCE');
      resume.experience.forEach(exp => {
        lines.push(`${exp.title} — ${exp.company} (${exp.dates})`);
        (exp.bullets || []).forEach(b => lines.push(`• ${b}`));
        lines.push('');
      });
    }
    if (resume.skills) {
      lines.push('SKILLS');
      if (resume.skills.technical?.length) lines.push(`Technical: ${resume.skills.technical.join(', ')}`);
      if (resume.skills.tools?.length) lines.push(`Tools: ${resume.skills.tools.join(', ')}`);
      if (resume.skills.soft?.length) lines.push(`Soft Skills: ${resume.skills.soft.join(', ')}`);
      lines.push('');
    }
    if (resume.projects?.length) {
      lines.push('PROJECTS');
      resume.projects.forEach(p => {
        lines.push(p.name);
        (p.bullets || []).forEach(b => lines.push(`• ${b}`));
        lines.push('');
      });
    }
    if (resume.certifications?.length) {
      lines.push('CERTIFICATIONS');
      resume.certifications.forEach(c => lines.push(`• ${c}`));
    }
    return lines.join('\n');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(buildPlainText());
    setCopied(true);
    toast.success('Resume text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { key: 'changes', label: 'What Changed' },
    { key: 'resume', label: 'Final Resume' },
    { key: 'keywords', label: 'Keywords' },
  ];

  return (
    <Card className="p-0 border-2 border-violet-300 bg-gradient-to-br from-violet-50 via-white to-purple-50 mt-2 mb-1 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0021A5] to-[#4338CA] px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Resume Tailored For</span>
        </div>
        <p className="text-white font-bold text-sm mt-0.5">{role} at {company}</p>
      </div>

      {/* Score Row */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-violet-100">
        <ScoreGauge score={atsScore} />
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-1">ATS Match Score</p>
          <p className="text-sm font-bold text-slate-900 mb-2">
            {atsScore >= 80 ? '🎯 Strong match!' : atsScore >= 60 ? '👍 Good match' : '⚠️ Needs improvement'}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Keywords Matched</p>
          <KeywordBar matched={matchedCount} total={totalKeywords} />
        </div>
      </div>

      {/* Changes Summary */}
      {changesSummary && (
        <div className="px-4 py-2.5 bg-violet-50/50 border-b border-violet-100">
          <p className="text-xs text-slate-600 italic leading-relaxed">{changesSummary}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-violet-100">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 text-xs font-semibold py-2.5 transition-colors ${activeTab === tab.key ? 'text-[#0021A5] border-b-2 border-[#0021A5] bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
            style={{ minHeight: 'auto' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 py-3 max-h-[400px] overflow-y-auto">
        {activeTab === 'changes' && (
          <div className="space-y-3">
            {changes.length > 0 ? changes.map((c, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{c.section || `Change ${i + 1}`}</p>
                {c.before && (
                  <div className="mb-2">
                    <span className="text-[10px] font-semibold text-red-500 uppercase">Before:</span>
                    <p className="text-xs text-slate-500 mt-0.5 line-through">{c.before}</p>
                  </div>
                )}
                {c.after && (
                  <div>
                    <span className="text-[10px] font-semibold text-green-600 uppercase">After:</span>
                    <p className="text-xs text-slate-800 mt-0.5 font-medium">{c.after}</p>
                  </div>
                )}
                {c.keywords_added && c.keywords_added.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.keywords_added.map((kw, j) => (
                      <Badge key={j} className="bg-orange-100 text-orange-700 text-[9px] border-0">+ {kw}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )) : (
              <p className="text-xs text-slate-500">No detailed changes available.</p>
            )}
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="space-y-4 text-sm">
            {resume.contact && (
              <div className="text-center pb-3 border-b border-slate-200">
                <p className="font-bold text-lg text-slate-900">{resume.contact.name}</p>
                <p className="text-xs text-slate-500">{[resume.contact.email, resume.contact.phone, resume.contact.location].filter(Boolean).join(' | ')}</p>
                {resume.contact.linkedin && <p className="text-xs text-blue-600">{resume.contact.linkedin}</p>}
              </div>
            )}
            {resume.summary && (
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Professional Summary</p>
                <p className="text-xs text-slate-700 leading-relaxed">{resume.summary}</p>
              </div>
            )}
            {resume.education?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Education</p>
                {resume.education.map((edu, i) => (
                  <div key={i} className="mb-1.5">
                    <p className="text-xs font-semibold text-slate-800">{edu.school} — {edu.degree}</p>
                    <p className="text-[11px] text-slate-500">{[edu.graduation_date, edu.gpa ? `GPA: ${edu.gpa}` : null].filter(Boolean).join(' | ')}</p>
                    {edu.relevant_coursework && <p className="text-[11px] text-slate-500">Coursework: {edu.relevant_coursework}</p>}
                  </div>
                ))}
              </div>
            )}
            {resume.experience?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Experience</p>
                {resume.experience.map((exp, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-xs font-semibold text-slate-800">{exp.title} — {exp.company}</p>
                    <p className="text-[11px] text-slate-500 mb-1">{exp.dates}</p>
                    <ul className="space-y-0.5">
                      {(exp.bullets || []).map((b, j) => <li key={j} className="text-[11px] text-slate-700">• {b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {resume.skills && (
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Skills</p>
                {resume.skills.technical?.length > 0 && <p className="text-[11px] text-slate-700"><strong>Technical:</strong> {resume.skills.technical.join(', ')}</p>}
                {resume.skills.tools?.length > 0 && <p className="text-[11px] text-slate-700"><strong>Tools:</strong> {resume.skills.tools.join(', ')}</p>}
                {resume.skills.soft?.length > 0 && <p className="text-[11px] text-slate-700"><strong>Soft Skills:</strong> {resume.skills.soft.join(', ')}</p>}
              </div>
            )}
            {resume.projects?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Projects</p>
                {resume.projects.map((p, i) => (
                  <div key={i} className="mb-1.5">
                    <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                    <ul className="space-y-0.5">
                      {(p.bullets || []).map((b, j) => <li key={j} className="text-[11px] text-slate-700">• {b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {resume.certifications?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Certifications</p>
                {resume.certifications.map((c, i) => <p key={i} className="text-[11px] text-slate-700">• {c}</p>)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-3">
            {keywordsMatched.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-green-700 uppercase mb-1.5">✅ Matched ({keywordsMatched.length})</p>
                <div className="flex flex-wrap gap-1">
                  {keywordsMatched.map((k, i) => <Badge key={i} className="bg-green-100 text-green-700 text-[10px] border-0">{k}</Badge>)}
                </div>
              </div>
            )}
            {keywordsAdded.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-orange-700 uppercase mb-1.5">✨ Added ({keywordsAdded.length})</p>
                <div className="flex flex-wrap gap-1">
                  {keywordsAdded.map((k, i) => <Badge key={i} className="bg-orange-100 text-orange-700 text-[10px] border-0">{k}</Badge>)}
                </div>
              </div>
            )}
            {keywordsMissing.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">⚠️ Missing ({keywordsMissing.length})</p>
                <div className="space-y-1.5">
                  {keywordsMissing.map((k, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{k}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-3 border-t border-violet-100 bg-violet-50/30">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            style={{ minHeight: 'auto' }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
          <button onClick={() => onSendMessage?.(`Tailor my resume for another role`)}
            className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            style={{ minHeight: 'auto' }}>
            <RefreshCw className="w-3 h-3" /> New Role
          </button>
          <button onClick={() => onSendMessage?.(`Draft a cover letter for ${role} at ${company}`)}
            className="flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg bg-[#0021A5] hover:bg-[#001580] text-white transition-colors"
            style={{ minHeight: 'auto' }}>
            <Mail className="w-3 h-3" /> Cover Letter
          </button>
        </div>
        <button onClick={() => onSendMessage?.(`Find UF alumni at ${company}`)}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
          style={{ minHeight: 'auto' }}>
          <Users className="w-3 h-3" /> Find Alumni at {company} →
        </button>
      </div>
    </Card>
  );
}