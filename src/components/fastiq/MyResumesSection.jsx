import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Plus, Upload, Star, ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: '2px 8px', borderRadius: 6 }}>
      ATS: {score}%
    </span>
  );
}

export default function MyResumesSection({ profile, onOpenChat }) {
  const [tailored, setTailored] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!profile?.user_email) { setLoading(false); return; }
    base44.entities.TailoredResume.filter({ user_email: profile.user_email }, '-created_date', 20)
      .then(r => setTailored(r || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.user_email]);

  const hasMaster = !!profile?.resume_text;
  const hasAny = hasMaster || tailored.length > 0;
  const visibleResumes = expanded ? tailored : tailored.slice(0, 3);

  return (
    <div className="fiq-animate fiq-delay-4" style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: 'rgba(139,92,246,0.1)', color: '#8B5CF6',
            width: 32, height: 32, borderRadius: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>📄</span>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            My Resumes
          </h2>
        </div>
        <button
          onClick={() => onOpenChat('Tailor my resume for a new role')}
          style={{
            fontSize: 11, fontWeight: 700, color: '#0021A5', background: 'rgba(0,33,165,0.06)',
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', minHeight: 'auto',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <Plus style={{ width: 12, height: 12 }} /> Tailor for New Role
        </button>
      </div>

      {!hasAny ? (
        <div style={{
          padding: '28px 20px', background: '#fff', borderRadius: 14, border: '1.5px dashed #CBD5E1',
          textAlign: 'center',
        }}>
          <Upload style={{ width: 28, height: 28, color: '#94A3B8', margin: '0 auto 10px' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>
            Upload your resume to unlock instant tailoring
          </p>
          <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 14 }}>
            One master resume → customized versions for every job
          </p>
          <button
            onClick={() => onOpenChat('Help me upload my resume')}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: '#FA4616', color: '#fff', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Master Resume Row */}
          <div style={{
            padding: '14px 18px', background: '#fff', borderRadius: 12,
            border: '1.5px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: hasMaster ? '#ECFDF5' : '#FEF2F2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Star style={{ width: 18, height: 18, color: hasMaster ? '#10B981' : '#EF4444' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>Master Resume</p>
              <p style={{ fontSize: 11, color: '#94A3B8' }}>
                {hasMaster
                  ? `Updated ${profile.updated_date ? moment(profile.updated_date).fromNow() : 'recently'}`
                  : 'Not uploaded yet'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {hasMaster && (
                <button
                  onClick={() => onOpenChat('Review my resume')}
                  style={{ fontSize: 11, fontWeight: 600, color: '#0021A5', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
                >
                  Review
                </button>
              )}
              <button
                onClick={() => onOpenChat(hasMaster ? 'Help me update my resume' : 'Help me upload my resume')}
                style={{ fontSize: 11, fontWeight: 600, color: '#FA4616', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}
              >
                {hasMaster ? 'Update' : 'Upload'}
              </button>
            </div>
          </div>

          {/* Tailored Resumes */}
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
                width: 38, height: 38, borderRadius: 10, background: '#F5F3FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText style={{ width: 18, height: 18, color: '#8B5CF6' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tr.role_title} at {tr.company_name}
                </p>
                <p style={{ fontSize: 11, color: '#94A3B8' }}>{moment(tr.created_date).fromNow()}</p>
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
        </div>
      )}
    </div>
  );
}