import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function ColdInroadScout({ company, role, onTargetConfirmed, onBack }) {
  const [phase, setPhase] = useState('scouting'); // 'scouting' -> 'recommendation'
  const [recommendedTarget, setRecommendedTarget] = useState(null);

  const handleAnalyze = () => {
    // Simulate AI analysis - in production this would call a backend function
    setTimeout(() => {
      const companyLower = company?.toLowerCase() || '';
      
      // Intelligent targeting logic
      let target;
      let strategy;
      let reasoning;
      
      if (companyLower.includes('labs') || companyLower.includes('ai') || companyLower.includes('startup')) {
        target = {
          name: 'Founder & CEO',
          title: role?.includes('Design') ? 'Head of Design' : 'Department Lead',
          confidence: 'high',
        };
        strategy = 'Founder Direct';
        reasoning = `Startups like ${company} have flat org structures. Founders review applications personally and value initiative.`;
      } else if (companyLower.includes('inc') || companyLower.includes('corp') || companyLower.includes('group')) {
        target = {
          name: role?.includes('Design') ? 'Design Director' : role?.includes('Engineering') ? 'Engineering Manager' : 'Hiring Manager',
          title: 'Decision Maker',
          confidence: 'high',
        };
        strategy = 'Hiring Manager';
        reasoning = `Large organizations filter through recruiters first. Target the department head who feels the pain of this open role.`;
      } else {
        target = {
          name: role?.includes('Design') ? 'Senior Design Lead' : role?.includes('Engineering') ? 'Senior Engineering Manager' : 'Department Head',
          title: 'Senior Team Member',
          confidence: 'medium',
        };
        strategy = 'Department Lead';
        reasoning = `For ${company}, reaching out to senior team members bypasses automated ATS filters and gets your message in front of decision-makers.`;
      }
      
      setRecommendedTarget({ target, strategy, reasoning });
      setPhase('recommendation');
    }, 2000);
  };

  // Phase 1: Scouting animation
  if (phase === 'scouting') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: dm, marginBottom: 32 }}
        >
          ← Back
        </button>

        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff', margin: '0 auto 24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            🔍
          </div>
          <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }`}</style>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
          CLiFF Scout is analyzing {company}...
        </h2>
        <p style={{ fontFamily: dm, fontSize: 14, color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
          Mapping company structure and identifying optimal contact points
        </p>

        {/* Scouting diagnostics */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: '20px',
          border: '1px solid #e5e7eb', textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>🏢</span>
            <div>
              <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '0 0 2px', textTransform: 'uppercase' }}>
                Company Detected
              </p>
              <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                {company}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '0 0 12px', textTransform: 'uppercase' }}>
              Analysis Progress
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Company size assessment', done: true },
                { label: 'Department structure mapping', done: true },
                { label: 'Decision-maker identification', done: false, active: true },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12 }}>
                    {step.done ? '✅' : step.active ? '🔄' : '⏳'}
                  </span>
                  <p style={{ fontFamily: dm, fontSize: 12, color: step.active ? '#111827' : '#9ca3af', margin: 0 }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          style={{
            marginTop: 24,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', borderRadius: 12,
            padding: '14px 32px', fontSize: 14, fontWeight: 700,
            color: '#fff', cursor: 'pointer', fontFamily: dm,
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            width: '100%',
          }}
        >
          Complete Analysis →
        </button>
      </div>
    );
  }

  // Phase 2: Recommendation
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
      <button
        onClick={onBack}
        style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: dm, marginBottom: 24 }}
      >
        ← Back
      </button>

      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b21a8', margin: '0 0 8px' }}>
        🎯 RECOMMENDED TARGET
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 28px' }}>
        Optimal Contact Identified
      </h1>

      {/* Target Card */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '24px',
        border: '2px solid #a78bfa', marginBottom: 20,
        boxShadow: '0 4px 16px rgba(124,58,237,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>
            {recommendedTarget?.target?.name?.charAt(0) || '🎯'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#1A1A1A', margin: '0 0 4px' }}>
              {recommendedTarget?.target?.name}
            </h3>
            <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: '#7c3aed', margin: '0 0 12px' }}>
              {recommendedTarget?.target?.title} at {company}
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: dm, fontSize: 10, fontWeight: 700,
                color: '#fff', background: '#7c3aed', borderRadius: 100,
                padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                🤖 AI-Recommended
              </span>
              <span style={{
                fontFamily: dm, fontSize: 10, fontWeight: 700,
                color: '#7c3aed', background: '#f3e8ff', borderRadius: 100,
                padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {recommendedTarget?.target?.confidence === 'high' ? 'High Response Probability' : 'Good Target'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Rationale */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '16px',
        border: '1px solid #e9d5ff', marginBottom: 16,
      }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b21a8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          💡 Why This Target
        </p>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
          {recommendedTarget?.reasoning}
        </p>
      </div>

      {/* Suggested Approach */}
      <div style={{
        background: '#fff7ed', borderRadius: 12, padding: '16px',
        border: '1px solid #ffedd5', marginBottom: 24,
      }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9a3412', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          📝 Suggested Approach
        </p>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#7c2d12', margin: 0, lineHeight: 1.6 }}>
          Mention specific company initiatives and connect your background directly to their current challenges. Keep it concise and value-focused.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => onTargetConfirmed(recommendedTarget?.target)}
          style={{
            flex: 1, minWidth: 200,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', borderRadius: 12,
            padding: '16px 28px', fontSize: 14, fontWeight: 700,
            color: '#fff', cursor: 'pointer', fontFamily: dm,
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}
        >
          ⚡ Craft My Personal Outreach Playbook
        </button>
        <a
          href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(company + ' ' + (recommendedTarget?.target?.name || ''))}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#fff', border: '2px solid #0077B5',
            borderRadius: 12, padding: '15px 24px',
            fontSize: 13, fontWeight: 700, color: '#0077B5',
            cursor: 'pointer', fontFamily: dm,
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          🔍 Search on LinkedIn →
        </a>
      </div>
    </div>
  );
}