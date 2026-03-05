import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Sparkles, CheckCircle2, FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: '2px 8px', borderRadius: 6 }}>
      ATS: {score}%
    </span>
  );
}

function NoResumeState({ onOpenChat }) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      }}>
        {/* Left: Upload */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0',
          padding: '28px 20px', textAlign: 'center',
          transition: 'all 0.2s', cursor: 'pointer',
        }}
          onClick={() => onOpenChat('Help me upload my resume')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0021A5'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,33,165,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: '#EFF6FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <Upload style={{ width: 22, height: 22, color: '#0021A5' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>I have a resume</p>
          <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16, lineHeight: 1.4 }}>Upload PDF, DOCX, or paste text</p>
          <button style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: '#0021A5', color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', minHeight: 'auto', width: '100%',
          }}>
            Upload Resume
          </button>
        </div>

        {/* Right: Build */}
        <div style={{
          background: '#fff', borderRadius: 14, border: '1.5px solid #E2E8F0',
          padding: '28px 20px', textAlign: 'center',
          transition: 'all 0.2s', cursor: 'pointer',
        }}
          onClick={() => onOpenChat('Help me build a resume')}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#FA4616'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(250,70,22,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: '#FFF7ED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <Sparkles style={{ width: 22, height: 22, color: '#FA4616' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>I need to create one</p>
          <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16, lineHeight: 1.4 }}>FASTIQ will build it with you in minutes</p>
          <button style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: '#FA4616', color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', minHeight: 'auto', width: '100%',
          }}>
            Build My Resume →
          </button>
        </div>
      </div>

      <p style={{
        fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 14, lineHeight: 1.5,
      }}>
        Your resume powers everything — better company matches, tailored outreach, smarter interview prep, and instant resume customization for any job.
      </p>
    </div>
  );
}

function HasResumeState({ profile, tailored, onOpenChat }) {
  const [expanded, setExpanded] = useState(false);
  const visibleResumes = expanded ? tailored : tailored.slice(0, 3);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'recently';
    return moment(dateStr).format('MMM D');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Master Resume Summary */}
      <div style={{
        padding: '16px 18px', background: '#fff', borderRadius: 12,
        border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: '#ECFDF5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <CheckCircle2 style={{ width: 20, height: 20, color: '#10B981' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>Master Resume</span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#10B981',
              background: '#ECFDF5', padding: '2px 8px', borderRadius: 10,
            }}>
              ✓ Active
            </span>
          </div>
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
            Last updated {formatDate(profile?.updated_date)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => onOpenChat('Tailor my resume for a new role')}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: '#0021A5', color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            ✨ Tailor for a Job →
          </button>
          <button
            onClick={() => onOpenChat('Review my resume')}
            style={{
              padding: '8px 12px', borderRadius: 10, border: '1px solid #E2E8F0',
              background: '#F8FAFC', color: '#64748B', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Review
          </button>
          <button
            onClick={() => onOpenChat('Help me update my resume')}
            style={{
              padding: '8px 12px', borderRadius: 10, border: '1px solid #E2E8F0',
              background: '#F8FAFC', color: '#64748B', fontSize: 11, fontWeight: 600,
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Update
          </button>
        </div>
      </div>

      {/* Tailored Resumes List */}
      {visibleResumes.map(tr => (
        <div key={tr.id} style={{
          padding: '12px 18px', background: '#fff', borderRadius: 12,
          border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', transition: 'all 0.2s',
        }}
          onClick={() => onOpenChat(`Show me my tailored resume for ${tr.role_title} at ${tr.company_name}`)}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.transform = 'translateX(3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#F5F3FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileText style={{ width: 16, height: 16, color: '#8B5CF6' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Tailored for {tr.role_title} at {tr.company_name}
            </p>
            <p style={{ fontSize: 11, color: '#94A3B8' }}>{formatDate(tr.created_date)}</p>
          </div>
          {tr.ats_score > 0 && <ScoreBadge score={tr.ats_score} />}
        </div>
      ))}

      {tailored.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            width: '100%', padding: '8px 0', background: 'transparent',
            border: '1px dashed #CBD5E1', borderRadius: 10, fontSize: 11,
            fontWeight: 600, color: '#64748B', cursor: 'pointer', minHeight: 'auto',
          }}
        >
          {expanded ? <><ChevronUp style={{ width: 12, height: 12 }} /> Show less</> : <><ChevronDown style={{ width: 12, height: 12 }} /> Show all {tailored.length} resumes</>}
        </button>
      )}

      {/* Tailor for New Role button */}
      {tailored.length > 0 && (
        <button
          onClick={() => onOpenChat('Tailor my resume for a new role')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '10px 0', background: '#F8FAFC',
            border: '1px dashed #0021A5', borderRadius: 10, fontSize: 12,
            fontWeight: 700, color: '#0021A5', cursor: 'pointer', minHeight: 'auto',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; }}
        >
          <Plus style={{ width: 14, height: 14 }} /> Tailor for New Role
        </button>
      )}
    </div>
  );
}

export default function MyResumeSection({ profile, onOpenChat }) {
  const [tailored, setTailored] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasResume = !!profile?.resume_text;

  useEffect(() => {
    if (!profile?.user_email) { setLoading(false); return; }
    base44.entities.TailoredResume.filter({ user_email: profile.user_email }, '-created_date', 20)
      .then(r => setTailored(r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.user_email]);

  return (
    <div className="fiq-animate fiq-delay-3" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{
          fontSize: 11, fontWeight: 700, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0,
        }}>
          📄 My Resume
        </h2>
        {hasResume && (
          <button
            onClick={() => onOpenChat('Help me update my resume')}
            style={{
              fontSize: 11, fontWeight: 600, color: '#0021A5', background: 'none',
              border: 'none', cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Update
          </button>
        )}
      </div>

      {hasResume ? (
        <HasResumeState profile={profile} tailored={tailored} onOpenChat={onOpenChat} />
      ) : (
        <NoResumeState onOpenChat={onOpenChat} />
      )}
    </div>
  );
}