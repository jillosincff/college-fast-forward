import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

export default function ColdInroadScout({ company, role, onTargetConfirmed, onBack }) {
  const [phase, setPhase] = useState('analyzing');
  const [recommendedTarget, setRecommendedTarget] = useState(null);

  // Auto-trigger analysis on mount - no manual button needed
  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const res = await base44.functions.invoke('scoutCompanyTarget', { company, role });
        setRecommendedTarget(res.data);
        setPhase('recommendation');
      } catch (error) {
        console.error('Scout failed:', error);
        setPhase('error');
      }
    };
    runAnalysis();
  }, [company, role]);

  // Phase 1: Auto-analyzing (no manual button)
  if (phase === 'analyzing') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: dm, marginBottom: 32 }}>← Back</button>
        
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>CLiFF Scout is analyzing {company}...</h2>
        <p style={{ fontFamily: dm, fontSize: 14, color: '#888', margin: '0 0 32px' }}>Mapping company structure and identifying optimal contact points</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Phase 2: Recommendation
  if (phase === 'recommendation' && recommendedTarget) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: dm, marginBottom: 32 }}>← Back</button>
        
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', margin: '0 0 8px' }}>🎯 COLD INROAD STRATEGY</p>
        
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Recommended Cold Inroad Target Found</h1>
        <p style={{ fontFamily: dm, fontSize: 14, color: '#888', margin: '0 0 32px' }}>CLiFF analyzed {company}'s structure and identified the highest-probability contact.</p>

        {/* Target Card */}
        <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #faf5ff)', border: '2px solid #7c3aed', borderRadius: 16, padding: '24px 28px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', fontWeight: 700 }}>
              {recommendedTarget.recommendedTarget?.name?.charAt(0) || '🎯'}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: dm, fontSize: 18, fontWeight: 800, color: '#1A1A1A', margin: '0 0 4px' }}>{recommendedTarget.recommendedTarget?.name || 'Decision Maker'}</h3>
              <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 600, color: '#7c3aed', margin: '0 0 8px' }}>{recommendedTarget.recommendedTarget?.title} at {company}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#fff', background: '#7c3aed', borderRadius: 100, padding: '3px 10px', textTransform: 'uppercase' }}>🤖 AI-Recommended</span>
                <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', borderRadius: 100, padding: '3px 10px', textTransform: 'uppercase' }}>High Response Probability</span>
              </div>
            </div>
          </div>

          {/* Strategy Rationale */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', border: '1px solid #e9d5ff', marginBottom: 16 }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#6b21a8', margin: '0 0 8px', textTransform: 'uppercase' }}>💡 Why This Target</p>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>{recommendedTarget.reasoning}</p>
          </div>

          {/* Suggested Approach */}
          <div style={{ background: '#fff7ed', borderRadius: 12, padding: '16px', border: '1px solid #ffedd5' }}>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9a3412', margin: '0 0 8px', textTransform: 'uppercase' }}>📝 Suggested Approach</p>
            <p style={{ fontFamily: dm, fontSize: 13, color: '#7c2d12', margin: 0, lineHeight: 1.6 }}>{recommendedTarget.suggestedApproach}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => onTargetConfirmed(recommendedTarget)} style={{ flex: 1, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: 12, padding: '16px 28px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: dm, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>⚡ Craft My Personal Outreach Playbook</button>
          <a href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(recommendedTarget.recommendedTarget?.name || '')}%20${encodeURIComponent(company || '')}`} target="_blank" rel="noopener noreferrer" style={{ background: '#fff', border: '2px solid #0077B5', borderRadius: 12, padding: '15px 24px', fontSize: 13, fontWeight: 700, color: '#0077B5', cursor: 'pointer', fontFamily: dm, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>🔍 Search on LinkedIn →</a>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state - show manual retry button
  if (phase === 'error') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: dm, marginBottom: 32 }}>← Back</button>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#EF4444', margin: '0 auto 24px' }}>⚠️</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>Analysis Failed</h2>
        <p style={{ fontFamily: dm, fontSize: 14, color: '#888', margin: '0 0 32px' }}>Unable to analyze {company}. Please try again or enter details manually.</p>
        <button onClick={() => { setPhase('analyzing'); }} style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: 12, padding: '16px 32px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: dm, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>🔄 Retry Analysis</button>
      </div>
    );
  }

  return null;
}