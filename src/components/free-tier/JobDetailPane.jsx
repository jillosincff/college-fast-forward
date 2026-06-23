import React, { useState, useEffect } from 'react';
import { getStandoutInsight } from '@/functions/getStandoutInsight';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';
import { base44 } from '@/api/base44Client';
import InAppApplyModal from './InAppApplyModal';

const dm = "'DM Sans', system-ui, sans-serif";

export default function JobDetailPane({ lead, user, onAddToPipeline, onColdInroad, schoolAbbr }) {
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [alumni, setAlumni] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [networkDismissed, setNetworkDismissed] = useState(false);

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

  // Hybrid network search: on role open, do a FREE cache-only lookup so any
  // already-discovered alumni show instantly. The paid web search only fires
  // when the student taps "Scan network" (handleScanNetwork below).
  const [scanned, setScanned] = useState(false);   // true once a full Exa scan has run
  const [scanning, setScanning] = useState(false);  // full scan in flight
  useEffect(() => {
    if (!lead || !companyName) return;
    setAlumni([]);
    setScanned(false);
    setScanning(false);
    setNetworkDismissed(false);
    setLoadingAlumni(true);
    scoutCompanyBackdoor({ jobId: companyName, companyName, cacheOnly: true })
      .then(res => {
        const data = res?.data || res;
        if (data?.alumni?.length) setAlumni(data.alumni.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoadingAlumni(false));
  }, [lead, companyName]);

  const handleScanNetwork = () => {
    setScanning(true);
    scoutCompanyBackdoor({ jobId: companyName, companyName })
      .then(res => {
        const data = res?.data || res;
        if (data?.alumni?.length) setAlumni(data.alumni.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => {
        setScanning(false);
        setScanned(true);
      });
  };

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const handleFindConnection = () => {
    if (alumni.length > 0) {
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
      overflow: 'hidden',
    }}>
      {/* Zone A: Action Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
      }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{
            fontFamily: dm,
            fontSize: 18,
            fontWeight: 900,
            color: '#111827',
            margin: '0 0 4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{jobTitle}</h2>
          <p style={{
            fontFamily: dm,
            fontSize: 14,
            fontWeight: 700,
            color: '#6b7280',
            margin: 0,
            textTransform: 'capitalize',
          }}>{companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase()}</p>
        </div>

        {/* Single Primary CTA */}
        <button
          onClick={handleApply}
          style={{
            fontFamily: dm,
            fontSize: 14,
            fontWeight: 800,
            color: '#fff',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            border: 'none',
            borderRadius: 12,
            padding: '14px 24px',
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
      </div>

      {/* Zone B: Network Advantage — always shown so the search is visible */}
      {!networkDismissed && (
      <div style={{
          position: 'relative',
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
          borderBottom: '1px solid #e9d5ff',
        }}>
              <button
                onClick={() => setNetworkDismissed(true)}
                aria-label="Close network advantage"
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: '#7c3aed',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 4,
                  minHeight: 'auto',
                  minWidth: 'auto',
                }}
              >
                ✕
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingRight: 24 }}>
                <svg style={{ width: 18, height: 18, color: '#6d28d9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h4 style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#6d28d9', margin: 0 }}>
                  Network Advantage
                </h4>
              </div>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

              {loadingAlumni ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontSize: 12 }}>
                  <span style={{ width: 13, height: 13, border: '2px solid #d8b4fe', borderTop: '2px solid #6d28d9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Checking your network for connections at {companyName}…
                </div>
              ) : alumni.length > 0 ? (
                <p style={{ fontFamily: dm, fontSize: 12, color: '#5b21b6', margin: '0 0 12px', lineHeight: 1.5 }}>
                  We found <strong>{alumni.length}</strong> {alumni.length === 1 ? 'connection' : 'connections'} who can champion your application at {companyName}.
                </p>
              ) : scanning ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontSize: 12 }}>
                  <span style={{ width: 13, height: 13, border: '2px solid #d8b4fe', borderTop: '2px solid #6d28d9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Scanning {schoolAbbr || 'your'} network at {companyName}…
                </div>
              ) : scanned ? (
                <p style={{ fontFamily: dm, fontSize: 12, color: '#5b21b6', margin: 0, lineHeight: 1.5 }}>
                  No verified {schoolAbbr || 'network'} connections at {companyName} yet — CLIFF can still help you find a backdoor in. Use <strong>Find Connection</strong> below to scout cold contacts.
                </p>
              ) : (
                <>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#5b21b6', margin: '0 0 12px', lineHeight: 1.5 }}>
                    See if anyone from your school can champion your application here.
                  </p>
                  <button
                    onClick={handleScanNetwork}
                    style={{
                      fontFamily: dm,
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '10px 16px',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                    }}
                  >
                    🔍 Scan {schoolAbbr || 'my'} network at {companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase()}
                  </button>
                </>
              )}

              {/* Alumni List */}
              {!loadingAlumni && alumni.length > 0 ? (
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

      {/* Zone C: Job Details */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        background: '#faf5ff',
      }}>
        {/* Metadata */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                Role Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

            {/* About the Company */}
            {(loadingInsight || insight?.about_company) && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                  About {companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase()}
                </h4>
                <div style={{
                  fontFamily: dm,
                  fontSize: 13,
                  color: '#1f2937',
                  lineHeight: 1.7,
                  background: '#fff',
                  borderRadius: 12,
                  padding: '16px 20px',
                  border: '1px solid #e9d5ff',
                }}>
                  {loadingInsight ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 12 }}>
                      <span style={{ width: 12, height: 12, border: '2px solid #e5e7eb', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Loading company overview…
                    </div>
                  ) : (
                    <p style={{ margin: 0 }}>{insight.about_company}</p>
                  )}
                </div>
              </div>
            )}

            {/* Job Description - Full Width, Premium Readability */}
            {jobDesc && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>
                  About the Role
                </h4>
                <div style={{
                  fontFamily: dm,
                  fontSize: 13,
                  color: '#1f2937',
                  lineHeight: 1.8,
                  background: '#faf5ff',
                  borderRadius: 12,
                  padding: '20px 24px',
                  border: '1px solid #e9d5ff',
                }}>
                  {jobDesc.split('\n').map((para, i) => (
                    <p key={i} style={{ margin: para.trim() ? '0 0 12px' : '0', whiteSpace: 'pre-wrap' }}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Remove duplicate insight rendering below */}

            {/* Apply Link */}
            {jobUrl && (
              <div>
                <a
                  href={jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: dm,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#7c3aed',
                    textDecoration: 'none',
                    padding: '8px 12px',
                    background: '#f5f3ff',
                    borderRadius: 8,
                    border: '1px solid #e9d5ff',
                  }}
                >
                  🔗 View Original Posting
                </a>
              </div>
            )}
      </div>

      {/* In-App Application Modal */}
      {showApplyModal && (
        <InAppApplyModal
          lead={lead}
          user={user}
          schoolAbbr={schoolAbbr}
          standoutTip={insight?.standout_tip || ''}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            onAddToPipeline?.(lead);
          }}
        />
      )}
    </div>
  );
}