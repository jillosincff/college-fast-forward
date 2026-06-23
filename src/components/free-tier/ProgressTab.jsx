import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

const STATUS_CONFIG = {
  applied: { label: 'Applied', color: '#2563eb', bg: '#eff6ff' },
  reached_out: { label: 'Reached Out', color: '#2563eb', bg: '#eff6ff' },
  messaged: { label: 'Messaged', color: '#2563eb', bg: '#eff6ff' },
  replied: { label: 'Replied', color: '#7c3aed', bg: '#f5f3ff' },
  coffee_chat: { label: 'Coffee Chat', color: '#7c3aed', bg: '#f5f3ff' },
  intro_made: { label: 'Intro Made', color: '#7c3aed', bg: '#f5f3ff' },
  interview: { label: 'Interview', color: '#ea580c', bg: '#fff7ed' },
  offer: { label: 'Offer', color: '#16a34a', bg: '#f0fdf4' },
};

const ACTIONABLE_STATUSES = ['applied', 'reached_out', 'messaged', 'replied', 'coffee_chat', 'intro_made', 'interview', 'offer'];

export default function ProgressTab({ user, onUpgrade }) {
  const [pipeline, setPipeline] = useState([]);
  const [tailoredResumes, setTailoredResumes] = useState([]);
  const [tailoredCount, setTailoredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }

    const loadData = async () => {
      try {
        const [pipelineRecords, tailored] = await Promise.all([
          base44.entities.NetworkingPipeline.list('-created_date', 200),
          base44.entities.TailoredResume.filter({ user_email: user.email }, '-created_date', 100),
        ]);
        // Filter to only actionable statuses (exclude identified/matched)
        const actionable = (pipelineRecords || []).filter(r => ACTIONABLE_STATUSES.includes(r.status));
        setPipeline(actionable);
        setTailoredResumes(tailored || []);
        setTailoredCount((tailored || []).filter(t => t.status === 'completed').length);
      } catch (e) {
        console.error('ProgressTab load error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const handler = () => loadData();
    window.addEventListener('cff:pipeline-changed', handler);
    return () => window.removeEventListener('cff:pipeline-changed', handler);
  }, [user?.email]);

  const all = pipeline;
  const applied = all.filter(r => r.status === 'applied').length;
  const directMessages = all.filter(r => r.status === 'reached_out' || r.status === 'messaged').length;
  const replies = all.filter(r => ['replied', 'coffee_chat', 'intro_made'].includes(r.status)).length;
  const interviews = all.filter(r => r.status === 'interview').length;
  const offers = all.filter(r => r.status === 'offer').length;

  // Streak: count distinct days with pipeline activity in last 7 days
  const streak = (() => {
    const days = new Set();
    const now = Date.now();
    for (const r of all) {
      const d = r.status_date || r.created_date;
      if (!d) continue;
      const diffDays = Math.floor((now - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        days.add(diffDays);
      }
    }
    return days.size;
  })();

  // Recent activity (last 5)
  const recent = all.slice(0, 5);

  // Find tailored resume for a given company/role
  const findTailoredResume = (company, role) => {
    if (!tailoredResumes.length) return null;
    const match = tailoredResumes.find(t => 
      t.company_name?.toLowerCase() === company?.toLowerCase() && 
      t.role_title?.toLowerCase() === role?.toLowerCase()
    );
    return match || tailoredResumes.find(t => t.company_name?.toLowerCase() === company?.toLowerCase());
  };

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  // Funnel stages
  const funnel = [
    { label: 'Applied', value: applied, icon: '📋', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Direct Messages', value: directMessages, icon: '💬', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Replies', value: replies, icon: '💬', color: '#0891b2', bg: '#ecfeff' },
    { label: 'Interviews', value: interviews, icon: '🎤', color: '#ea580c', bg: '#fff7ed' },
    { label: 'Offers', value: offers, icon: '🎉', color: '#16a34a', bg: '#f0fdf4' },
  ];

  const responseRate = applied > 0 ? Math.round((replies / applied) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          📋 Application Tracker
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          Track every application, outreach, and interview. Your pipeline to hired.
        </p>
      </div>

      {/* Streak / Momentum banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5, #7c3aed)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        boxShadow: '0 4px 14px rgba(79,70,229,0.25)',
      }}>
        <div style={{ fontSize: 36, flexShrink: 0 }}>🔥</div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <p style={{ fontFamily: dm, fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
            {streak} day{streak !== 1 ? 's' : ''} active this week
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>
            {streak >= 3 ? "You're on fire! Keep the momentum going." : streak >= 1 ? "Great start — keep showing up daily!" : "Start your streak — add a pipeline entry today!"}
          </p>
        </div>
        {responseRate > 0 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: dm, fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>{responseRate}%</p>
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: 0, textTransform: 'uppercase' }}>Reply Rate</p>
          </div>
        )}
      </div>

      {/* Funnel stats - Clickable */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8,
      }} className="progress-funnel">
        {funnel.map((stage, idx) => {
          const isClickable = stage.value > 0;
          return (
            <div
              key={stage.label}
              onClick={() => isClickable && handleEntryClick({ funnelStage: stage.label })}
              style={{
                background: '#fff',
                border: `1px solid ${stage.bg}`,
                borderRadius: 12,
                padding: '12px 8px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'transform 0.1s, box-shadow 0.1s',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => {
                if (isClickable && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>{stage.icon}</div>
              <p style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: stage.color, margin: 0, lineHeight: 1 }}>
                {loading ? '–' : stage.value}
              </p>
              <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#6b7280', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .progress-funnel { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* Recent activity */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
        padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <h3 style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>
          Recent Activity
        </h3>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 44, background: '#f9fafb', borderRadius: 10, animation: 'shimmer 1.5s infinite linear' }} />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>
              No applications tracked yet. Add your first opportunity on the Dashboard!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.map(r => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.applied;
              const tailoredResume = findTailoredResume(r.company, r.job_title);
              const isOutreach = r.status === 'reached_out' || r.status === 'messaged';
              const isReply = ['replied', 'coffee_chat', 'intro_made'].includes(r.status);
              return (
                <div
                  key={r.id}
                  onClick={() => handleEntryClick(r)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#f9fafb', borderRadius: 10, padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0,
                  }}>
                    {isOutreach ? '💬' : r.status === 'interview' ? '🎤' : r.status === 'offer' ? '🎉' : '📋'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.company}{r.job_title ? ` — ${r.job_title}` : ''}
                    </p>
                    <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                      {r.created_date ? new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      {tailoredResume && r.status === 'applied' && <span style={{ marginLeft: 8, color: '#7c3aed' }}>• {tailoredResume.ats_score ? `ATS ${tailoredResume.ats_score}` : 'Tailored'}</span>}
                      {isOutreach && r.alumni_name && <span style={{ marginLeft: 8, color: '#7c3aed' }}>• {r.alumni_name}</span>}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: dm, fontSize: 10, fontWeight: 700, color: cfg.color,
                    background: cfg.bg, borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tailored resumes count */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      }} className="progress-mini-stats">
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
          padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>📄</div>
          <p style={{ fontFamily: dm, fontSize: 22, fontWeight: 800, color: '#4F46E5', margin: 0 }}>
            {loading ? '–' : tailoredCount}
          </p>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', margin: '4px 0 0', textTransform: 'uppercase' }}>
            Resumes Tailored
          </p>
        </div>
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
          padding: 16, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>⚡</div>
          <p style={{ fontFamily: dm, fontSize: 22, fontWeight: 800, color: '#16a34a', margin: 0 }}>
            {loading ? '–' : Math.round((directMessages / Math.max(applied, 1)) * 100)}%
          </p>
          <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', margin: '4px 0 0', textTransform: 'uppercase' }}>
            Outreach Rate
          </p>
        </div>
      </div>

      {/* Upgrade nudge */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff, #eef2ff)',
        border: '1px solid #c7d2fe', borderRadius: 16, padding: 20,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', cursor: 'pointer',
      }} onClick={() => onUpgrade?.('Advanced Analytics')}>
        <div style={{ fontSize: 24, flexShrink: 0 }}>📊</div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
            Want deeper analytics?
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            Premium unlocks response rate trends, company-level insights, and automated follow-up tracking.
          </p>
        </div>
        <span style={{
          fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#4F46E5',
          background: '#fff', border: '1px solid #c7d2fe', borderRadius: 100,
          padding: '5px 14px', whiteSpace: 'nowrap',
        }}>
          Unlock →
        </span>
      </div>

      {/* Application Detail Modal */}
      {showModal && selectedEntry && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }} onClick={() => setShowModal(false)}>
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              maxWidth: 500,
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color="#6b7280" />
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                {selectedEntry.company}
              </h3>
              {selectedEntry.job_title && (
                <p style={{ fontFamily: dm, fontSize: 14, color: '#6b7280', margin: 0 }}>
                  {selectedEntry.job_title}
                </p>
              )}
            </div>

            {/* Status */}
            {selectedEntry.status && (
              <div style={{
                background: STATUS_CONFIG[selectedEntry.status]?.bg || '#f3f4f6',
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 20,
              }}>
                <p style={{
                  fontFamily: dm,
                  fontSize: 12,
                  fontWeight: 700,
                  color: STATUS_CONFIG[selectedEntry.status]?.color || '#6b7280',
                  margin: 0,
                  textTransform: 'uppercase',
                }}>
                  Status: {STATUS_CONFIG[selectedEntry.status]?.label || selectedEntry.status}
                </p>
              </div>
            )}

            {/* Resume Section - Only show for Applied status */}
            {selectedEntry.status === 'applied' && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>
                  📄 Resume Submitted
                </h4>
                {(() => {
                  const tailoredResume = findTailoredResume(selectedEntry.company, selectedEntry.job_title);
                  if (tailoredResume) {
                    return (
                      <div style={{
                        background: '#f5f3ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: 12,
                        padding: '14px 16px',
                      }}>
                        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6d28d9', margin: '0 0 6px' }}>
                          ✨ Tailored Resume
                        </p>
                        <p style={{ fontFamily: dm, fontSize: 11, color: '#5b21b6', margin: '0 0 8px', lineHeight: 1.5 }}>
                          Customized for {tailoredResume.company_name} • {tailoredResume.role_title}
                        </p>
                        {tailoredResume.changes_summary && (
                          <div style={{
                            background: '#fff',
                            borderRadius: 8,
                            padding: '10px 12px',
                            marginBottom: 8,
                          }}>
                            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#6b7280', margin: '0 0 4px' }}>
                              KEY CHANGES:
                            </p>
                            <p style={{ fontFamily: dm, fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                              {tailoredResume.changes_summary}
                            </p>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                          {tailoredResume.ats_score && (
                            <span style={{
                              fontFamily: dm,
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#16a34a',
                              background: '#f0fdf4',
                              borderRadius: 100,
                              padding: '4px 10px',
                            }}>
                              ATS Score: {tailoredResume.ats_score}/100
                            </span>
                          )}
                          {tailoredResume.keywords_matched !== undefined && (
                            <span style={{
                              fontFamily: dm,
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#2563eb',
                              background: '#eff6ff',
                              borderRadius: 100,
                              padding: '4px 10px',
                            }}>
                              {tailoredResume.keywords_matched}/{tailoredResume.keywords_total} keywords
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: '14px 16px',
                      }}>
                        <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6b7280', margin: '0 0 4px' }}>
                          Standard Resume
                        </p>
                        <p style={{ fontFamily: dm, fontSize: 11, color: '#9ca3af', margin: 0 }}>
                          No tailored resume found for this application
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {/* Additional Details - Direct Messages */}
            {(selectedEntry.status === 'reached_out' || selectedEntry.status === 'messaged' || selectedEntry.status === 'replied') && selectedEntry.alumni_name && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                  🤝 Contact
                </h4>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#111827', margin: '0 0 2px' }}>
                  {selectedEntry.alumni_name}
                </p>
                {selectedEntry.alumni_role && (
                  <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>
                    {selectedEntry.alumni_role}
                  </p>
                )}
              </div>
            )}

            {/* Date Info */}
            {selectedEntry.created_date && (
              <div>
                <h4 style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                  📅 Date
                </h4>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>
                  {new Date(selectedEntry.created_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}