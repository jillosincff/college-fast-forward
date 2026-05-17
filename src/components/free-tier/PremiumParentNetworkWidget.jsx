import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

const SAMPLE_PARENTS = [
  { role: 'VP of Operations', company: 'Goldman Sachs', grad: "'26", initials: 'MK' },
  { role: 'Director of Engineering', company: 'Microsoft', grad: "'25", initials: 'JR' },
  { role: 'Senior Recruiter', company: 'Amazon', grad: "'27", initials: 'AL' },
];

function AvatarCluster({ theme }) {
  const colors = [theme.primary, theme.secondary || '#FA4616', '#16a34a'];
  const initials = ['J', 'M', 'R'];
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {colors.map((c, i) => (
        <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', zIndex: 3 - i, position: 'relative' }}>
          {initials[i]}
        </div>
      ))}
      <div style={{ marginLeft: 8, position: 'relative', width: 10, height: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', position: 'absolute', animation: 'pulse-p 1.8s ease-in-out infinite' }} />
        <style>{`@keyframes pulse-p { 0%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 70%{box-shadow:0 0 0 6px rgba(34,197,94,0)} 100%{box-shadow:0 0 0 0 rgba(34,197,94,0)} }`}</style>
      </div>
    </div>
  );
}

export default function PremiumParentNetworkWidget({ parentCount, college, theme, user }) {
  const t = theme || { primary: '#1E293B', secondary: '#475569', bgTint: 'rgba(30,41,59,0.03)' };
  const shortName = t.shortName || college || 'Campus';
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  const generateScript = async (parent) => {
    setSelectedParent(parent);
    setGenerating(true);
    setScript('');
    setCopied(false);
    await new Promise(r => setTimeout(r, 1200));
    const name = user?.full_name || 'a recent graduate';
    const school = shortName;
    const generated = `Hi ${parent.initials},\n\nI came across your profile while looking into ${parent.company} — I'm a ${school} student and noticed you're a parent of a fellow Gator ('${parent.grad.replace("'", '')}). That connection means a lot to me.\n\nI'm actively exploring opportunities in ${parent.role.includes('Engineer') ? 'software engineering' : 'business operations'} and would be incredibly grateful for even 15 minutes of your time to hear about your experience at ${parent.company}.\n\nThank you so much for your support of the ${school} community.\n\nWarm regards,\n${name}`;
    setScript(generated);
    setGenerating(false);
  };

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert(script);
    }
  };

  return (
    <div style={{ background: '#fff', border: `1px solid ${t.primary}33`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '3px 10px' }}>
            🤝 CAMPUS FAMILIES — UNLOCKED
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#22c55e' }}>LIVE</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>
            The <span style={{ color: 'rgba(255,255,255,0.8)' }}>{shortName}</span> Parent Network
          </p>
          <AvatarCluster theme={t} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#374151', lineHeight: 1.6, margin: '0 0 14px' }}>
          <strong style={{ color: t.primary }}>{parentCount || 247} Active {shortName} Parents</strong> are online this week — executives and directors who've <em>volunteered</em> to champion students from your school.
        </p>

        {/* Real parent rows — unlocked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active This Week</p>
          {SAMPLE_PARENTS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${t.primary}0a`, borderRadius: 10, padding: '10px 12px', border: `1px solid ${t.primary}22` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${t.primary}33, ${t.primary}55)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: dm, fontSize: 11, fontWeight: 700, color: t.primary }}>
                {p.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827', margin: 0 }}>{p.role} at <span style={{ color: t.primary }}>{p.company}</span></p>
                <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>Parent of {p.grad}</p>
              </div>
              <button
                onClick={() => generateScript(p)}
                style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: t.primary, background: `${t.primary}15`, border: `1px solid ${t.primary}33`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap' }}
              >
                ✉️ Intro
              </button>
            </div>
          ))}
        </div>

        {/* Generated script */}
        {(generating || script) && (
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            {generating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 16, border: '2px solid #e5e7eb', borderTop: `2px solid ${t.primary}`, borderRadius: '50%', animation: 'spinP 0.7s linear infinite', flexShrink: 0 }} />
                <style>{`@keyframes spinP{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0 }}>Drafting personalized introduction for {selectedParent?.company}...</p>
              </div>
            ) : (
              <>
                <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Introduction Script</p>
                <pre style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{script}</pre>
                <button
                  onClick={copyScript}
                  style={{ marginTop: 12, width: '100%', fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: copied ? '#6b7280' : `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`, border: 'none', borderRadius: 10, padding: '10px 0', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.2s' }}
                >
                  {copied ? '✅ Copied to Clipboard!' : '📋 Copy Script → Paste into LinkedIn'}
                </button>
              </>
            )}
          </div>
        )}

        {!generating && !script && (
          <button
            onClick={() => generateScript(SAMPLE_PARENTS[0])}
            style={{ width: '100%', fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg, ${t.primary}, ${t.secondary || t.primary})`, border: 'none', borderRadius: 12, padding: '12px 0', cursor: 'pointer', minHeight: 'auto' }}
          >
            ✉️ Generate Parent Introduction
          </button>
        )}
      </div>
    </div>
  );
}