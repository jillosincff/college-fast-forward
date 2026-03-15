import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import titleCase from '@/components/utils/titleCase';

const dmSans = "'DM Sans', sans-serif";
const orange = '#E85D20';

const TIMELINE_LABELS = {
  asap: 'ASAP', '3_months': 'Within 3 months', '6_months': 'Within 6 months',
  next_year: 'Next year', immediately: 'ASAP', '1_3_months': '1–3 months',
  '3_6_months': '3–6 months', '6_plus_months': '6+ months', exploring: 'Exploring',
};
const STAGE_LABELS = {
  just_starting: 'Just starting', applying: 'Applying',
  interviewing: 'Interviewing', have_offers: 'Have offers',
};

function formatTimeline(value) {
  if (!value) return '—';
  if (TIMELINE_LABELS[value]) return TIMELINE_LABELS[value];
  // Generic formatter: "fall_2026" → "Fall 2026"
  return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function ChatSidebar({ profile, onBack, onResearchCompany, onRerunAssessment, onProfileUpdated, onOpenChat }) {
  const [companies, setCompanies] = useState([]);
  const [researchedSet, setResearchedSet] = useState(new Set());
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    setCompanies((profile?.target_companies || []).map(titleCase));
  }, [profile?.target_companies]);

  useEffect(() => {
    if (!companies.length) return;
    base44.entities.CompanyIntelCache.filter({}, '-created_date', 50)
      .then(items => {
        const set = new Set();
        items.forEach(item => { if (item.company_name) set.add(item.company_name.toLowerCase()); });
        setResearchedSet(set);
      }).catch(() => {});
  }, [companies]);

  const removeCompany = async (idx) => {
    if (!profile?.id) return;
    const updated = companies.filter((_, i) => i !== idx);
    setCompanies(updated);
    await base44.entities.FastTrackProProfile.update(profile.id, { target_companies: updated });
    if (onProfileUpdated) onProfileUpdated({ ...profile, target_companies: updated });
  };

  const industry = profile?.target_industry || '—';
  const timeline = formatTimeline(profile?.career_timeline);
  const stage = STAGE_LABELS[profile?.current_stage] || profile?.current_stage || '—';
  const location = profile?.location_preference || '';

  const signalColor = (c) => {
    return researchedSet.has(c.toLowerCase()) ? '#4ADE80' : 'rgba(244,240,232,0.2)';
  };

  const emptyStyle = { fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.2)', fontStyle: 'italic' };
  const valueStyle = { fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.5)' };

  return (
    <div style={{
      width: 240, flexShrink: 0, background: '#0d1117',
      borderRight: '0.5px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', height: '100%',
      overflowY: 'auto', fontFamily: dmSans,
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          padding: '16px 16px 12px', background: 'none', border: 'none',
          fontFamily: dmSans, fontSize: 13, fontWeight: 400,
          color: 'rgba(244,240,232,0.4)', cursor: 'pointer',
          textAlign: 'left', transition: 'color 0.2s',
          minHeight: 'auto', width: 'auto',
        }}
        onMouseEnter={e => e.currentTarget.style.color = orange}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,240,232,0.4)'}
      >
        ← Back to FASTIQ
      </button>

      {/* YOUR TARGETS */}
      <div style={{ padding: '0 16px 16px' }}>
        <p style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(244,240,232,0.25)', marginBottom: 8,
        }}>YOUR TARGETS</p>

        {companies.length === 0 ? (
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.35)', marginBottom: 10 }}>
              No targets yet
            </p>
            <button
              onClick={() => onOpenChat?.('Help me find target companies based on my background')}
              style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: orange,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                minHeight: 'auto', width: 'auto', textAlign: 'left',
              }}
            >
              Ask FASTIQ to find companies →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {companies.map((c, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: signalColor(c), flexShrink: 0,
                  boxShadow: researchedSet.has(c.toLowerCase()) ? '0 0 6px rgba(74,222,128,0.5)' : 'none',
                }} />
                <button
                  onClick={() => onResearchCompany(c)}
                  style={{
                    flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 400,
                    color: 'rgba(244,240,232,0.7)', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', padding: 0, minHeight: 'auto',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f4f0e8'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(244,240,232,0.7)'}
                >
                  {c}
                </button>
                {hoveredIdx === i && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCompany(i); }}
                    style={{
                      fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.3)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      minHeight: 'auto', width: 'auto', lineHeight: 1,
                    }}
                  >×</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

      {/* YOUR PROFILE */}
      <div style={{ padding: '16px' }}>
        <p style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(244,240,232,0.25)', marginBottom: 8,
        }}>YOUR PROFILE</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            ['Industry', industry],
            ['Timeline', timeline],
            ['Stage', stage],
            ['Location', location || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.35)', width: 56, flexShrink: 0 }}>{label}</span>
              <span style={value === '—' ? emptyStyle : valueStyle}>{value}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onRerunAssessment}
          style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: orange,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            marginTop: 6, minHeight: 'auto', width: 'auto',
          }}
        >
          Edit profile →
        </button>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

      {/* MY ACTION PLAN */}
      <div style={{ padding: '16px' }}>
        <button
          onClick={() => navigate('ActionPlanTracker')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
            transition: 'all 0.2s', textAlign: 'left',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l2 2 4-4" /><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7 3v4M13 3v4M3 9h14" />
          </svg>
          <div>
            <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#f4f0e8', display: 'block' }}>My Action Plan</span>
            <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.35)' }}>Goals, milestones & activity</span>
          </div>
        </button>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

      {/* MASTER RESUME */}
      <div style={{ padding: '16px' }}>
        <p style={{
          fontFamily: dmSans, fontSize: 10, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'rgba(244,240,232,0.25)', marginBottom: 8,
        }}>MASTER RESUME</p>
        {profile?.resume_text ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px rgba(74,222,128,0.5)' }} />
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.5)' }}>On file</span>
            </div>
            <button
              onClick={() => onOpenChat?.('Review my resume')}
              style={{
                fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: orange,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                minHeight: 'auto', width: 'auto',
              }}
            >
              Replace →
            </button>
          </div>
        ) : (
          <button
            onClick={() => onOpenChat?.('Help me build a resume')}
            style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: orange,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              minHeight: 'auto', width: 'auto',
            }}
          >
            Upload resume →
          </button>
        )}
      </div>
    </div>
  );
}