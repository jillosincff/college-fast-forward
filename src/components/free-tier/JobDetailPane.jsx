import React, { useState, useEffect } from 'react';
import { getStandoutInsight } from '@/functions/getStandoutInsight';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

export default function JobDetailPane({ lead, user, onAddToPipeline, onColdInroad, schoolAbbr }) {
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [alumni, setAlumni] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);

  const companyName = lead.company || lead.companyName || '';
  const jobTitle = lead.job_title || lead.role || '';
  const jobDesc = lead.hiring_description || lead.description || lead.jobDescription || '';
  const jobUrl = lead.job_url || lead.url || '';
  const location = lead.location || lead.location_text || '';
  const salary = lead.salary_range || lead.salary || '';
  const hasAlumni = lead.alumniCount > 0;
  const hasParent = lead.parentCount > 0;
  const networkCount = (lead.alumniCount || 0) + (lead.parentCount || 0);

  // Load insight on mount
  useEffect(() => {
    if (!lead) return;
    setLoadingInsight(true);
    getStandoutInsight({ company: companyName, job_title: jobTitle, job_description: jobDesc, job_url: jobUrl })
      .then(res => {
        const data = res?.data || res;
        if (data?.standout_tip) setInsight(data);
      })
      .catch(() => {})
      .finally(() => setLoadingInsight(false));
  }, [lead]);

  // Load alumni on mount
  useEffect(() => {
    if (!lead || !hasAlumni) return;
    setLoadingAlumni(true);
    scoutCompanyBackdoor({ jobId: companyName, companyName })
      .then(res => {
        const data = res?.data || res;
        if (data?.alumni) setAlumni(data.alumni.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoadingAlumni(false));
  }, [lead, hasAlumni]);

  const handleApply = () => {
    if (jobUrl) {
      window.open(jobUrl, '_blank', 'noopener,noreferrer');
    }
    onAddToPipeline?.(lead);
  };

  const handleFindConnection = () => {
    if (hasAlumni && alumni.length > 0) {
      const firstAlumni = alumni[0];
      window.location.hash = `#OutreachDrafts?context=alumni_search&company=${encodeURIComponent(companyName)}&jobTitle=${encodeURIComponent(jobTitle)}&alumniName=${encodeURIComponent(firstAlumni.name || '')}&alumniRole=${encodeURIComponent(firstAlumni.role_title || '')}&alumniLinkedin=${encodeURIComponent(firstAlumni.linkedin_url || '')}&skipForm=1`;
    } else {
      onColdInroad?.(lead);
    }
  };

  if (!lead) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 40,
        textAlign: 'center',
        background: '#faf5ff',
        borderRadius: 16,
        border: '2px dashed #e9d5ff',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🎯</div>
        <h3 style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#6d28d9', margin: '0 0 8px' }}>Select a Role</h3>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#9ca3af', margin: 0, maxWidth: 280 }}>
          Click any job from the feed to view details, network connections, and apply.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
    }}>
      {/* Zone A: Action Header (Sticky) */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <h2 style={{
          fontFamily: dm,
          fontSize: 20,
          fontWeight: 900,
          color: '#111827',
          margin: '0 0 4px',
        }}>{jobTitle}</h2>
        <p style={{
          fontFamily: dm,
          fontSize: 14,
          fontWeight: 700,
          color: '#7c3aed',
          margin: '0 0 16px',
        }}>{companyName}</p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleApply}
            style={{
              fontFamily: dm,
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              border: 'none',
              borderRadius: 12,
              padding: '13px 20px',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            📋 Apply & Track via CLIFF
          </button>
          <button
            onClick={handleFindConnection}
            style={{
              fontFamily: dm,
              fontSize: 13,
              fontWeight: 700,
              color: '#7c3aed',
              background: 'transparent',
              border: '2px solid #7c3aed',
              borderRadius: 12,
              padding: '12px 20px',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f5f3ff';
              e.currentTarget.style.borderColor = '#6d28d9';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#7c3aed';
            }}
          >
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Find {hasAlumni ? schoolAbbr : 'Parent'} Connection
          </button>
        </div>
      </div>

      {/* Zone B: Network Advantage */}
      {(hasAlumni || hasParent) && (
        <div style={{
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
          borderBottom: '1px solid #e9d5ff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg style={{ width: 18, height: 18, color: '#6d28d9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h4 style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#6d28d9', margin: 0 }}>
              Network Advantage
            </h4>
          </div>
          <p style={{
            fontFamily: dm,
            fontSize: 12,
            color: '#5b21b6',
            margin: '0 0 12px',
            lineHeight: 1.5,
          }}>
            There {networkCount === 1 ? 'is' : 'are'} <strong>{networkCount}</strong> {hasAlumni && hasParent ? 'alumni & parents' : hasAlumni ? 'alumni' : 'parents'} available to champion your application at {companyName}.
          </p>

          {/* Alumni List */}
          {loadingAlumni ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 11 }}>
              <span style={{ width: 12, height: 12, border: '2px solid #d8b4fe', borderTop: '2px solid #6d28d9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              Loading connections…
            </div>
          ) : alumni.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alumni.map((a, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#fff',
                  borderRadius: 8,
                  padding: '8px 10px',
                  border: '1px solid #e9d5ff',
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {a.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.name}
                    </p>
                    {a.role_title && (
                      <p style={{ fontFamily: dm, fontSize: 9, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.role_title}
                      </p>
                    )}
                  </div>
                  {a.linkedin_url && (
                    <a
                      href={a.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: '#0077b5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 800,
                        textDecoration: 'none',
                        flexShrink: 0,
                      }}
                    >
                      in
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Zone C: Job Details & Intelligence */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        background: '#faf5ff',
      }}>
        {/* Metadata */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
            Role Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
                <span>📍</span> {location}
              </div>
            )}
            {salary && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
                <span>💰</span> {salary}
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        {jobDesc && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
              About the Role
            </h4>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: '16px',
              border: '1px solid #e5e7eb',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#374151',
            }}>
              {(jobDesc || '').split(/\n\n+|\n+/).filter(p => p.trim()).map((para, idx) => (
                <p key={idx} style={{ margin: idx === 0 ? '0 0 12px' : '0 0 12px' }}>{para.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {/* Stand-Out Tips */}
        <div>
          <h4 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
            💡 CLIFF Stand-Out Tips
          </h4>
          {loadingInsight ? (
            <div style={{
              background: '#fef3c7',
              borderRadius: 12,
              padding: '16px',
              border: '1px solid #fcd34d',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#92400e',
            }}>
              <span style={{ width: 14, height: 14, border: '2px solid #fcd34d', borderTop: '2px solid #d97706', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              Generating insights…
            </div>
          ) : insight?.standout_tip ? (
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: 12,
              padding: '16px',
              border: '1px solid #fcd34d',
              fontSize: 12,
              lineHeight: 1.6,
              color: '#92400e',
            }}>
              {insight.standout_tip}
            </div>
          ) : (
            <div style={{
              background: '#fef3c7',
              borderRadius: 12,
              padding: '16px',
              border: '1px solid #fcd34d',
              fontSize: 12,
              color: '#92400e',
            }}>
              Loading insights…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}