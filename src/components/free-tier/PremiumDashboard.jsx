import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getThemeForSchool } from '@/lib/campusThemes';
import PremiumPipeline from './PremiumPipeline';
import PremiumSignalsFeed from './PremiumSignalsFeed';
import PremiumCareerAssetsCard from './PremiumCareerAssetsCard';
import PremiumParentNetworkWidget from './PremiumParentNetworkWidget';
import PremiumHiringChat from './PremiumHiringChat';

const dm = "'DM Sans', system-ui, sans-serif";

function PremiumNav({ user }) {
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  return (
    <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
            <span>College </span><span style={{ color: '#2563eb' }}>Fast Forward</span>
          </div>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 100, padding: '3px 12px', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}>Sprint Active</span>
        </div>
        <span style={{ fontFamily: dm, fontSize: 13, color: '#6b7280' }}>
          {user?.full_name || user?.email}
        </span>
      </div>
    </header>
  );
}

function StatPill({ emoji, label, value, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 18px', flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 900, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>
        <p style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.55)', margin: 0, whiteSpace: 'nowrap' }}>{label}</p>
      </div>
    </div>
  );
}

export default function PremiumDashboard({ user, parentCount, college, theme }) {
  const t = theme || getThemeForSchool(college || 'UF');
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const shortName = t.shortName || college || 'your university';
  const [selectedLead, setSelectedLead] = useState(null);

  const showParentStat = parentCount === null || parentCount >= 20;
  const stats = [
    { emoji: '🚀', label: '24/7 Active Crawlers', value: 'ON' },
    { emoji: '📄', label: 'Resume Match Target', value: '98%' },
    ...(showParentStat ? [{ emoji: '🤝', label: `${shortName} Parents Online`, value: parentCount === null ? '247' : `${parentCount}` }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <PremiumNav user={user} />

      {/* ── Premium Welcome Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, #0A0A0A 0%, #0d1a3a 50%, ${t.primary}33 100%)`,
        padding: '28px 24px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: `${t.primary}22`, filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.35)', borderRadius: 100, padding: '4px 14px', marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', boxShadow: '0 0 6px rgba(37,99,235,0.8)' }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CFF Sprint Active</span>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            Welcome to your Premium Sprint, {firstName} ⚡
          </h1>
          <p style={{ fontFamily: dm, fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: '0 0 24px', lineHeight: 1.7, maxWidth: 680 }}>
            Your agent is fully deployed. We've cleared your resume red flags, mapped your <strong style={{ color: 'rgba(255,255,255,0.85)' }}>{shortName}</strong> network, and are actively crawling hidden corporate subdomains for unadvertised roles.{' '}
            <strong style={{ color: '#E85D20' }}>Let's get you hired.</strong>
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <StatPill key={i} {...s} theme={t} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }} className="ftd-grid">

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <PremiumPipeline theme={t} onLeadSelect={setSelectedLead} user={user} college={college} parentCount={parentCount} />
            <PremiumSignalsFeed college={college} theme={t} />
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="ftd-sidebar">
            <PremiumCareerAssetsCard user={user} />

            {/* Alumni Outreach Generator — fully unlocked, auto-populates on card click */}
            <PremiumAlumniOutreach college={college} theme={t} user={user} selectedLead={selectedLead} />

            {/* Parent Network — unlocked if ≥20 parents */}
            {(parentCount === null || parentCount >= 20) && (
              <PremiumParentNetworkWidget parentCount={parentCount} college={college} theme={t} user={user} />
            )}

            <PremiumHiringChat user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline alumni outreach (unlocked version)
function PremiumAlumniOutreach({ college, theme, user, selectedLead }) {
  const t = theme || { primary: '#2563eb', bgTint: '#eff6ff' };
  const shortName = t.shortName || college || 'your university';
  const [target, setTarget] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-populate script when a pipeline lead is selected
  useEffect(() => {
    if (!selectedLead) return;
    const recruiterName = selectedLead.recruiter?.split(',')[0] || '[Name]';
    const autoScript = `Hi ${recruiterName},\n\nI came across the ${selectedLead.role} opportunity at ${selectedLead.company} through the College Fast Forward alumni network. I'm a ${shortName} student actively pursuing this exact type of role, and was thrilled to see that ${selectedLead.source}.\n\nI'd love to connect briefly to learn more about the opportunity and share how my background aligns.\n\nThank you for your time,\n${user?.full_name || '[Your Name]'}`;
    setTarget(selectedLead.company);
    setScript(autoScript);
    setCopied(false);
  }, [selectedLead]);

  const generate = async () => {
    if (!target.trim()) return;
    setLoading(true);
    setScript('');
    setCopied(false);
    await new Promise(r => setTimeout(r, 1200));
    const name = user?.full_name || 'a fellow alum';
    const generated = `Hi [Name],\n\nI noticed you graduated from ${shortName} and are currently working at ${target.trim()} — that connection immediately stood out to me.\n\nI'm a current ${shortName} student studying ${user?.major || 'business'}, and I'm actively exploring opportunities in your field. I'd be incredibly grateful for 15 minutes to hear about your path and any advice you might have.\n\nThank you so much for being part of the ${shortName} network.\n\nWarm regards,\n${user?.full_name || name}`;
    setScript(generated);
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch { alert(script); }
  };

  return (
    <div style={{ background: '#fff', border: `1px solid ${t.primary}33`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ background: `linear-gradient(135deg, ${t.bgTint}, rgba(255,255,255,0.8))`, padding: '16px 20px', borderBottom: `1px solid ${t.primary}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>✉️</span>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Alumni Outreach Generator</p>
          </div>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 100, padding: '3px 10px' }}>UNLOCKED</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: '0 0 10px', lineHeight: 1.5 }}>
          Enter a target company and we'll generate a warm, personalized outreach script:
        </p>
        <input
          value={target}
          onChange={e => setTarget(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="e.g. Goldman Sachs, Google, Deloitte..."
          style={{ width: '100%', fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: `1px solid ${t.primary}33`, borderRadius: 10, padding: '9px 12px', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
        />
        <button
          onClick={generate}
          disabled={!target.trim() || loading}
          style={{ width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: target.trim() && !loading ? `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})` : '#d1d5db', border: 'none', borderRadius: 10, padding: '10px 0', cursor: target.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading ? (
            <>
              <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spinOA 0.7s linear infinite' }} />
              <style>{`@keyframes spinOA{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              Writing your script...
            </>
          ) : '✉️ Generate Script →'}
        </button>

        {script && (
          <div style={{ marginTop: 14 }}>
            <pre style={{ fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{script}</pre>
            <button
              onClick={handleCopy}
              style={{ marginTop: 10, width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: copied ? '#6b7280' : `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`, border: 'none', borderRadius: 10, padding: '10px 0', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.2s' }}
            >
              {copied ? '✅ Copied! Paste directly into LinkedIn.' : '📋 Copy Script → Paste into LinkedIn'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}