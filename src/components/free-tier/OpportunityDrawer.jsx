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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sortedAlumni, setSortedAlumni] = useState([]);
  const [tailoringStep, setTailoringStep] = useState(0);

  // Fix #1: Smart greeting — use first name if it looks like a real name, else use "Company Team"
  const rawRecruiter = lead?.recruiter || '';
  const recruiterLooksLikeName = rawRecruiter && !rawRecruiter.toLowerCase().includes(lead?.role?.toLowerCase().split(' ').pop() || '___') && rawRecruiter.split(' ').length <= 3 && !rawRecruiter.includes(',');
  const recruiterName = recruiterLooksLikeName ? rawRecruiter.split(' ')[0] : `${lead?.company} Team`;
  const recruiterDisplayName = rawRecruiter.split(',')[0] || '[Contact]';
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

  // Generate dynamic script based on alum match type (Gen Z Momentum Style)
  const generateAlumniScript = (alum) => {
    const isFireMatch = alum.isTopMatch;
    const userFirstName = user?.full_name?.split(' ')[0] || '[Your Name]';
    const alumFirstName = alum.name.split(' ')[0];
    
    if (isFireMatch) {
      // 🔥 Scenario A: Fire Match - Highly targeted team script
      return `Hi ${alumFirstName},

Go Gators! 🐊 I just saw your profile and noticed you're ${alum.title.startsWith('VP') || alum.title.startsWith('Director') || alum.title.startsWith('Head') ? 'leading' : 'working as'} ${alum.title} at ${lead?.company}. 

I'm a graduating senior at ${shortName}, and I actually just hit auto-apply for the open ${lead?.role} role on your exact team. I know you're incredibly busy, but I'd love to grab 5 minutes sometime this week to ask a quick question about how you ${alum.title.includes('Marketing') ? 'structured the team' : alum.title.includes('Engineering') ? 'approach technical challenges' : alum.title.includes('Sales') ? 'build relationships with clients' : 'structure your work'}. 

Any insight from a fellow Gator would be massive as I navigate the process. Either way, appreciate you!

Best,
${userFirstName}`;
    } else {
      // 💼 Scenario B: General Company Alum - Culture/school connection
      return `Hi ${alumFirstName},

Go Gators! 🐊 I came across your profile while looking into ${lead?.company}—awesome to see a fellow ${shortName} grad killing it there. 

I'm a senior at ${shortName} and just applied for a ${lead?.role} role on the ${lead?.industry || 'commercial'} team. I know you're in a different department, but I'd love to connect briefly to get your take on the overall company culture and what it's like transitioning from ${shortName === 'UF' ? 'Gainesville' : 'campus'} to the ${lead?.industry || 'tech'} world. 

Hope to cross paths soon!

Best,
${userFirstName}`;
    }
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
    setTailoringStep(0);
    
    // Step 1: Loading animation with progress text
    await new Promise(r => setTimeout(r, 1200));
    setTailoringStep(1);
    await new Promise(r => setTimeout(r, 1300));
    
    // Simulate AI tailoring — in production this calls a backend function
    const lastName = user?.full_name?.split(' ')[1] || user?.full_name?.split(' ')[0] || 'Resume';
    const fileName = `Resume_${lastName}_${lead?.company?.replace(/\s+/g, '')}.pdf`;
    const mockOptimizations = [
      `Highlighted "Outbound Lead Gen" in your ${shortName} Sales Club exp`,
      `Matched 4 core ATS keywords from ${lead?.company} description`,
      `Emphasized ${userMajor || 'relevant'} coursework alignment`,
    ];
    
    setTailoredResume({
      fileName,
      tailoredFor: lead?.company,
      tailoredForRole: lead?.role,
      tailoredAt: new Date().toISOString(),
      optimizations: mockOptimizations,
      previewUrl: null, // In production: actual PDF URL from backend
    });
    setTailoring(false);
    setTailoringStep(0);
    setShowPreviewModal(true);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { 
      if (e.key === 'Escape') { 
        onClose(); 
        setShowConfirmModal(false); 
        setShowPreviewModal(false);
      }; 
    };
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
      <style>{`
        @media (max-width: 768px) {
          .opportunity-drawer { width: 100% !important; left: 0 !important; }
        }
      `}</style>
      <div className="opportunity-drawer" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 460, maxWidth: '100vw',
        background: '#fff', zIndex: 40001, boxShadow: '-8px 0 48px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', animation: 'drawerSlideIn 0.28s cubic-bezier(0.22,1,0.36,1)',
        overflowY: 'auto',
      }}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#6b7280', minHeight: 'auto', minWidth: 'auto', zIndex: 10 }}
        >×</button>

        {/* Tailoring Progress Overlay */}
        {tailoring && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.95)',
            zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', animation: 'overlayFadeIn 0.2s ease',
          }}>
            <div style={{ fontSize: 48, marginBottom: 24, animation: 'bounce 1s infinite' }}>
              {tailoringStep === 0 ? '🤖' : '✂️'}
            </div>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
            <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 8px', textAlign: 'center' }}>
              {tailoringStep === 0 
                ? `🤖 Agent analyzing ${lead?.company} ${lead?.role} requirements...`
                : `✂️ Injecting optimized skill alignments...`
              }
            </p>
            <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTop: '4px solid #8b5cf6', borderRadius: '50%', animation: 'spinTailor 0.7s linear infinite', marginTop: 16 }} />
          </div>
        )}

        {/* ── Section 1: Header — Role + Company + Signals ── */}
        <div style={{ background: `linear-gradient(135deg, #0a0a0a 0%, #0d1a3a 60%, ${t.primary}22 100%)`, padding: '28px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {lead.logo}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: dm, fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 2px', lineHeight: 1.2 }}>{lead.role}</p>
              <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600, margin: 0 }}>{lead.company}</p>
            </div>
          </div>

          {/* Signal badges row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.35)', borderRadius: 100, padding: '4px 12px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#eab308', boxShadow: '0 0 6px rgba(234,179,8,0.8)' }} />
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#eab308', letterSpacing: '0.06em' }}>UNADVERTISED ROLE</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '4px 12px' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#22c55e', letterSpacing: '0.06em' }}>AGENT DETECTED</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

          {/* ── Section 1b: Job Description (anchors context first) ── */}
          {lead.jobDescriptionText && (
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px' }}>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>About the Role</p>
              <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 6, scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{lead.jobDescriptionText}</p>
              </div>
            </div>
          )}

          {/* ── Section 2: YOUR EDGE alert box ── */}
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 20px' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>⚡ Your Edge</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15 }}>🐊</span>
                <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ color: '#fff' }}>{lead.alumCount || 3} {shortName} grads</strong> work here — warm path exists
                </p>
              </div>
              {/* Fix #2: Clickable contact card with LinkedIn link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15 }}>🎯</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.5 }}>
                    Internal Contact: <strong style={{ color: '#fff' }}>{recruiterLooksLikeName ? rawRecruiter.split(',')[0] : `${lead?.alumCount || 3} ${shortName} Grads`}</strong>
                  </p>
                  {lead?.recruiterLinkedIn ? (
                    <a
                      href={lead.recruiterLinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: dm, fontSize: 11, color: '#60a5fa', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}
                    >
                      🔗 View LinkedIn Profile
                    </a>
                  ) : (
                    <a
                      href={`https://www.linkedin.com/company/${encodeURIComponent(lead?.company?.toLowerCase().replace(/\s+/g, '-'))}/people/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: dm, fontSize: 11, color: '#60a5fa', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}
                    >
                      🔗 View {lead?.company} Team on LinkedIn
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15 }}>📋</span>
                <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  Listing Status: <strong style={{ color: lead.posted === 'Not yet public' ? '#fbbf24' : '#34d399' }}>{lead.posted}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* ── Section 3: Execution Buttons ── */}
          <div style={{ background: '#f8f9fc', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px' }}>
            <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Execute</p>
            
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
              data-apply-button
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
              ) : `🚀 Route Profile to ${lead?.company} Insiders`}
            </button>
            {/* Fix #4: transparent subtext explaining where the profile goes */}
            {!applying && !applied && (
              <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', textAlign: 'center', margin: '6px 0 0', lineHeight: 1.5 }}>
                This drops your tailored resume directly into the referral inbox of our {lead?.alumCount || 3} registered {shortName} alumni at {lead?.company}.
              </p>
            )}
          </div>

          {/* ── Section 4: Network Outreach Tabs ── */}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                        {/* Fix #2: LinkedIn link per alum */}
                        <a
                          href={alum.linkedinUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(alum.name + ' ' + lead?.company)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          🔗 View Profile
                        </a>
                        <button
                          onClick={() => {
                            const script = generateAlumniScript(alum);
                            navigator.clipboard.writeText(script);
                            alert('Script copied! Ready to paste into LinkedIn.');
                          }}
                          style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: t.primary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', minHeight: 'auto' }}
                        >
                          📋 Copy Script
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Resume Preview Modal ── */}
      {showPreviewModal && tailoredResume && (
        <>
          <div
            onClick={() => setShowPreviewModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60000, animation: 'overlayFadeIn 0.25s ease', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100% - 48px)',
            maxWidth: 720,
            maxHeight: '85vh',
            background: '#fff',
            zIndex: 60001,
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            animation: 'modalSlideIn 0.3s cubic-bezier(0.22,1,0.36,1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, #1e293b, #334155)`, padding: '20px 28px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div>
                    <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Review Your Tailored Resume</p>
                    <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>{tailoredResume.fileName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', minHeight: 'auto' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
              {/* AI Optimizations Summary */}
              <div style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🤖</span>
                  <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#0c4a6e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Optimizations Made</p>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {tailoredResume.optimizations?.map((opt, idx) => (
                    <li key={idx} style={{ fontFamily: dm, fontSize: 13, color: '#164e63', marginBottom: 6, lineHeight: 1.6 }}>{opt}</li>
                  ))}
                </ul>
              </div>

              {/* PDF Preview Container */}
              <div style={{
                background: '#f8fafc',
                border: '2px solid #e2e8f0',
                borderRadius: 12,
                padding: 20,
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📎</div>
                <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#475569', margin: '0 0 4px' }}>PDF Preview</p>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#94a3b8', margin: 0 }}>In production: Embedded PDF viewer loads here</p>
                <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>
                  Showing: {tailoredResume.fileName}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  alert('Manual edit feature coming soon!');
                }}
                style={{
                  flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700,
                  color: '#475569', background: '#fff', border: '2px solid #e2e8f0',
                  borderRadius: 12, padding: '14px 0', cursor: 'pointer', minHeight: 'auto',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#1e293b'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
              >
                📝 Edit Text Manually
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  // Highlight the auto-apply button to prime user for final commit
                  setTimeout(() => {
                    const applyBtn = document.querySelector('[data-apply-button]');
                    if (applyBtn) applyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                style={{
                  flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700,
                  color: '#fff', background: `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`,
                  border: 'none', borderRadius: 12, padding: '14px 0',
                  cursor: 'pointer', minHeight: 'auto',
                  boxShadow: `0 4px 16px ${t.primary}44`,
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                👍 Looks Perfect, Save
              </button>
            </div>
          </div>
        </>
      )}

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