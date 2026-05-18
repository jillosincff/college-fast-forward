import { useState, useEffect } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function OpportunityDrawer({ lead, onClose, onApplied, user, college, theme, parentCount }) {
  const t = theme || { primary: '#2563eb', secondary: '#1d4ed8', bgTint: '#eff6ff' };
  const shortName = t.shortName || college || 'your university';
  const mascot = t.mascot || 'Gator';
  const mascotSlang = t.mascotSlang || `${mascot}s`;
  const showParentTab = parentCount === null || parentCount >= 20;

  const [activeTab, setActiveTab] = useState('alumni');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sortedAlumni, setSortedAlumni] = useState([]);

  const recruiterName = lead?.recruiter?.split(',')[0] || '[Name]';
  const userFirstName = user?.full_name?.split(' ')[0] || '[Your Name]';
  const userMajor = user?.student_major || '[Your Major]';
  const targetIndustry = user?.target_industries?.[0] || lead?.industry || '[Target Industry]';
  const lastName = user?.full_name?.split(' ')[1] || user?.full_name?.split(' ')[0] || 'Resume';
  const tailoredResumeName = `Master_Resume_${lead?.company?.replace(/\s+/g, '')}.pdf`;

  const alumniScript = `Hi ${recruiterName},\n\nI came across the ${lead?.role} opportunity at ${lead?.company} through the College Fast Forward alumni network. I was thrilled to see that ${lead?.source} — that connection immediately stood out.\n\nI'm a current ${shortName} student actively pursuing this type of role, and I'd love to connect briefly to learn more about the opportunity and share how my background aligns.\n\nThank you for your time,\n${user?.full_name || '[Your Name]'}`;

  const parentScript = `Subject: Connecting with a fellow ${mascot} / Opportunity at ${lead?.company}\n\nHi [Parent First Name],\n\nI hope you're having a great week! I'm a senior at ${shortName} studying ${userMajor}, and I'm currently preparing to launch my career in ${targetIndustry}.\n\nI came across the ${lead?.role} opening on your team at ${lead?.company}. I noticed your connection to the ${shortName} family and wanted to reach out. I know how incredibly supportive the ${mascot} parent network is when it comes to helping students find their footing.\n\nIf you have just 5 minutes sometime soon, I would be incredibly grateful to get your perspective on what it takes to stand out on the team at ${lead?.company}.\n\nGo ${mascotSlang}!\n\nBest,\n${userFirstName}`;

  const activeScript = activeTab === 'alumni' ? alumniScript : parentScript;

  // Smart Alumni Relevancy Engine
  useEffect(() => {
    if (!lead?.role) return;
    
    // Extract keywords from role title
    const roleKeywords = lead.role.toLowerCase().split(' ').filter(w => w.length > 3);
    const departmentMap = {
      marketing: ['marketing', 'brand', 'growth', 'creative', 'content', 'social'],
      sales: ['sales', 'business development', 'account', 'revenue', 'bd'],
      engineering: ['engineer', 'developer', 'software', 'technical', 'dev'],
      finance: ['finance', 'accounting', 'financial', 'analyst', 'controller'],
      operations: ['operations', 'ops', 'logistics', 'supply chain', 'coordinator'],
      hr: ['human resources', 'hr', 'talent', 'recruiting', 'people'],
      product: ['product', 'pm', 'manager', 'strategy', 'roadmap'],
    };
    
    const relevantKeywords = Object.entries(departmentMap)
      .filter(([dept]) => roleKeywords.some(k => k.includes(dept) || dept.includes(k)))
      .flatMap(([, keywords]) => keywords);
    
    // Mock alumni data with relevancy scoring
    const mockAlumni = [
      { name: 'Michael K.', title: 'VP of Product Marketing', isTopMatch: relevantKeywords.some(k => 'marketing product'.includes(k)) },
      { name: 'Jessica L.', title: 'Account Executive', isTopMatch: relevantKeywords.some(k => 'sales account'.includes(k)) },
      { name: 'David T.', title: 'Corporate Accountant', isTopMatch: relevantKeywords.some(k => 'finance accounting'.includes(k)) },
    ];
    
    // Sort by relevancy (top matches first)
    const sorted = mockAlumni.sort((a, b) => (b.isTopMatch ? 1 : 0) - (a.isTopMatch ? 1 : 0));
    setSortedAlumni(sorted);
  }, [lead?.role]);

  // Generate dynamic script based on alum match type
  const generateAlumniScript = (alum) => {
    const isFireMatch = alum.isTopMatch;
    if (isFireMatch) {
      return `Hi ${alum.name.split(' ')[0]},\n\nI noticed you're working as ${alum.title} at ${lead?.company} — that immediately caught my attention since I'm actively pursuing opportunities in this exact space.\n\nAs a fellow ${shortName} student studying ${userMajor}, I'd be incredibly grateful for 15 minutes to hear about your path and any advice on breaking into ${lead?.industry || 'this field'}.\n\nThank you so much for being part of the ${shortName} network!\n\nWarm regards,\n${user?.full_name || '[Your Name]'}`;
    }
    return `Hi ${alum.name.split(' ')[0]},\n\nI came across your profile and noticed we both graduated from ${shortName}. I'm currently a student there studying ${userMajor} and exploring opportunities at ${lead?.company}.\n\nI'd love to hear about your experience and any advice you might have for someone looking to break into your team.\n\nThanks for being part of the ${shortName} network!\n\nBest,\n${user?.full_name || '[Your Name]'}`;
  };

  const handleAutoApply = () => {
    // Trigger confirmation modal instead of immediate apply
    setShowConfirmModal(true);
  };

  const confirmAutoApply = async () => {
    setShowConfirmModal(false);
    setApplying(true);
    await new Promise(r => setTimeout(r, 2000));
    setApplied(true);
    setApplying(false);
    setTimeout(() => {
      onApplied(lead);
      onClose();
    }, 1200);
  };

  const handleCopyAndOpen = async () => {
    try { await navigator.clipboard.writeText(activeScript); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    const linkedinUrl = activeTab === 'parent' && lead?.parentLinkedInId
      ? `https://www.linkedin.com/in/${lead.parentLinkedInId}/`
      : `https://www.linkedin.com/company/${encodeURIComponent(lead?.company?.toLowerCase().replace(/\s+/g, '-'))}/people/`;
    window.open(linkedinUrl, '_blank');
  };

  const handleTailorResume = async () => {
    setTailoring(true);
    // Simulate AI tailoring — in production this calls a backend function
    await new Promise(r => setTimeout(r, 2500));
    const lastName = user?.full_name?.split(' ')[1] || user?.full_name?.split(' ')[0] || 'Resume';
    const fileName = `Resume_${lastName}_${lead?.company?.replace(/\s+/g, '')}.pdf`;
    setTailoredResume({
      fileName,
      tailoredFor: lead?.company,
      tailoredForRole: lead?.role,
      tailoredAt: new Date().toISOString(),
    });
    setTailoring(false);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') { onClose(); setShowConfirmModal(false); }; };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!lead) return null;

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes overlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40000, animation: 'overlayFadeIn 0.2s ease' }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, maxWidth: '95vw',
        background: '#fff', zIndex: 40001, boxShadow: '-8px 0 48px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', animation: 'drawerSlideIn 0.28s cubic-bezier(0.22,1,0.36,1)',
        overflowY: 'auto',
      }}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b7280', minHeight: 'auto', minWidth: 'auto', zIndex: 1 }}
        >×</button>

        {/* ── Section 1: Intelligence Header ── */}
        <div style={{ background: `linear-gradient(135deg, #0a0a0a 0%, #0d1a3a 60%, ${t.primary}22 100%)`, padding: '28px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {lead.logo}
            </div>
            <div>
              <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 2px', lineHeight: 1.2 }}>{lead.role}</p>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600, margin: 0 }}>{lead.company}</p>
            </div>
          </div>

          {/* Backdoor badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.35)', borderRadius: 100, padding: '5px 12px', marginBottom: 14 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#eab308', boxShadow: '0 0 6px rgba(234,179,8,0.8)' }} />
            <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#eab308', letterSpacing: '0.06em' }}>💡 UNADVERTISED ROLE · DETECTED 4 HOURS AGO</span>
          </div>

          {/* Warm link summary */}
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Edge</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
                🐊 {lead.alumCount || 3} {shortName} grads work here
              </p>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
                🎯 Internal Contact: {lead.recruiter}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* ── Section 2: Job Description ── */}
          {lead.jobDescriptionText && (
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px' }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>About the Role</p>
              <div style={{ maxHeight: 300, overflowY: 'auto', paddingRight: 8 }}>
                <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: '0 0 12px', lineHeight: 1.7 }}>{lead.jobDescriptionText}</p>
              </div>
            </div>
          )}

          {/* ── Section 3: Auto-Apply ── */}
          <div style={{ background: '#f8f9fc', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px' }}>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Step 1 — Smart Auto-Apply</p>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 14px', lineHeight: 1.6 }}>
              Our agent will format your <strong style={{ color: '#111827' }}>98% optimized Master Resume</strong>, bypass the standard HR portal, and route your profile directly into the internal referral tracking system.
            </p>
            
            {/* Tailored Resume Button */}
            {!tailoredResume ? (
              <button
                onClick={handleTailorResume}
                disabled={tailoring}
                style={{
                  width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700,
                  color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', marginBottom: 10,
                  cursor: tailoring ? 'not-allowed' : 'pointer', minHeight: 'auto',
                  background: tailoring ? '#9ca3af' : `linear-gradient(135deg, #8b5cf6, #7c3aed)`,
                  boxShadow: tailoring ? 'none' : '0 4px 16px rgba(139,92,246,0.3)',
                  transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {tailoring ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinTailor 0.7s linear infinite' }} />
                    <style>{`@keyframes spinTailor{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                    ✂️ Tailoring Resume for {lead?.company}...
                  </>
                ) : (
                  <>✂️ Tailor Resume for this Role</>
                )}
              </button>
            ) : (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#166534', margin: 0 }}>Resume Tailored!</p>
                    <p style={{ fontFamily: dm, fontSize: 11, color: '#15803d', margin: 0 }}>{tailoredResume.fileName}</p>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Downloading ${tailoredResume.fileName}...`)}
                  style={{ width: '100%', fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#16a34a', border: 'none', borderRadius: 8, padding: '8px 0', cursor: 'pointer', minHeight: 'auto' }}
                >
                  📥 Download Tailored Resume
                </button>
              </div>
            )}

            <button
              onClick={handleAutoApply}
              disabled={applying || applied}
              style={{
                width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 700,
                color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0',
                cursor: applying || applied ? 'not-allowed' : 'pointer', minHeight: 'auto',
                background: applied ? '#16a34a' : applying ? '#4b5563' : `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`,
                boxShadow: applied || applying ? 'none' : `0 4px 16px ${t.primary}44`,
                transition: 'background 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {applied ? (
                '✓ Applied & Routed'
              ) : applying ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                  Deploying Agent...
                </>
              ) : '⚡ Auto-Apply & Route Profile'}
            </button>
          </div>

          {/* ── Section 4: Network Outreach ── */}
          <div style={{ background: '#f8f9fc', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px' }}>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Step 2 — Network Outreach</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: '#e5e7eb', borderRadius: 10, padding: 3 }}>
              {[
                { id: 'alumni', label: '🎓 Alumni Script' },
                ...(showParentTab ? [{ id: 'parent', label: '👨‍💼 Parent Script' }] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700,
                    color: activeTab === tab.id ? '#111827' : '#6b7280',
                    background: activeTab === tab.id ? '#fff' : 'transparent',
                    border: 'none', borderRadius: 8, padding: '8px 0',
                    cursor: 'pointer', minHeight: 'auto',
                    boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Script preview */}
            <div style={{ position: 'relative' }}>
              <pre style={{
                fontFamily: dm, fontSize: 12, color: '#374151',
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: '14px 16px', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.75,
                maxHeight: 200, overflowY: 'auto',
              }}>
                {activeScript}
              </pre>
            </div>

            <button
              onClick={handleCopyAndOpen}
              style={{
                marginTop: 10, width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700,
                color: '#fff', border: 'none', borderRadius: 12, padding: '13px 0',
                cursor: 'pointer', minHeight: 'auto',
                background: copied ? '#16a34a' : `linear-gradient(135deg, #0f172a, #1e293b)`,
                transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {copied
                ? '✅ Copied! LinkedIn opened →'
                : activeTab === 'parent'
                  ? '📋 Copy & Message Parent on LinkedIn'
                  : '📋 Copy & Open LinkedIn Profile'
              }
            </button>
          </div>

          {/* Listing status footer */}
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#92400e', margin: 0, fontWeight: 600 }}>Listing Status: {lead.posted}</p>
          </div>

          {/* ── Smart Alumni Stack ── */}
          {sortedAlumni.length > 0 && (
            <div style={{ background: '#f8f9fc', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px' }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Edge</p>
              <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>
                🐊 {sortedAlumni.length} {shortName} grads work here:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedAlumni.map((alum, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px' }}>
                    <span style={{ fontSize: 16 }}>{alum.isTopMatch ? '🔥' : idx === 0 ? '💼' : '👥'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>
                        {alum.name} · {alum.title}
                        {alum.isTopMatch && <span style={{ color: '#dc2626', fontWeight: 600, marginLeft: 6 }}>(Top Match)</span>}
                      </p>
                      <button
                        onClick={() => {
                          const script = generateAlumniScript(alum);
                          navigator.clipboard.writeText(script);
                          alert('Script copied! Ready to paste into LinkedIn.');
                        }}
                        style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: t.primary, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textDecoration: 'underline', minHeight: 'auto' }}
                      >
                        📋 Copy Script
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Auto-Apply Confirmation Modal ── */}
      {showConfirmModal && (
        <>
          <div
            onClick={() => setShowConfirmModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50000, animation: 'overlayFadeIn 0.2s ease' }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100% - 40px)',
            maxWidth: 480,
            background: '#fff',
            zIndex: 50001,
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'modalSlideIn 0.25s cubic-bezier(0.22,1,0.36,1)',
          }}>
            <style>{`@keyframes modalSlideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }`}</style>
            
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`, padding: '24px 28px', borderRadius: '20px 20px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>🚀</span>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Confirm Your Application</p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>Final check before we lock it in</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '28px 28px 24px' }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 8px', fontWeight: 600 }}>You are about to auto-apply for:</p>
                <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: 0 }}>{lead?.role}</p>
                <p style={{ fontFamily: dm, fontSize: 14, color: t.primary, fontWeight: 700, margin: '2px 0 0' }}>{lead?.company}</p>
              </div>

              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>📄</span>
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: '0 0 2px', textTransform: 'uppercase' }}>Tailored Asset</p>
                    <p style={{ fontFamily: dm, fontSize: 12, color: '#111827', margin: 0, fontWeight: 600 }}>{tailoredResume?.fileName || tailoredResumeName}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🎯</span>
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: '0 0 2px', textTransform: 'uppercase' }}>Routed To</p>
                    <p style={{ fontFamily: dm, fontSize: 12, color: '#111827', margin: 0, fontWeight: 600 }}>{recruiterName} ({lead?.recruiter?.split(', ')[1] || 'Campus Recruiter'})</p>
                  </div>
                </div>
              </div>

              <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6, fontStyle: 'italic' }}>
                *Our agent will officially submit your data. Make sure everything looks right before we lock it in.
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700,
                    color: '#6b7280', background: '#f3f4f6', border: 'none',
                    borderRadius: 12, padding: '14px 0', cursor: 'pointer', minHeight: 'auto',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={confirmAutoApply}
                  disabled={applying}
                  style={{
                    flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700,
                    color: '#fff', background: applying ? '#9ca3af' : `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`,
                    border: 'none', borderRadius: 12, padding: '14px 0',
                    cursor: applying ? 'not-allowed' : 'pointer', minHeight: 'auto',
                    boxShadow: applying ? 'none' : `0 4px 16px ${t.primary}44`,
                    transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {applying ? (
                    <>
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                      Processing...
                    </>
                  ) : (
                    <>⚡ Let's Lock It In</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}