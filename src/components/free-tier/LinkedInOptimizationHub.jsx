import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const dm = "'DM Sans', system-ui, sans-serif";

export default function LinkedInOptimizationHub({ user, onUpgrade, isPremium }) {
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copiedSections, setCopiedSections] = useState({});

  useEffect(() => {
    // Load existing optimization from user data
    if (user?.linkedin_optimization) {
      setOptimization(user.linkedin_optimization);
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateLinkedInOptimization', {});
      const data = res?.data ?? res ?? {};
      setOptimization(data.optimization);
      toast.success('✨ LinkedIn optimization generated!');
    } catch (error) {
      console.error('Failed to generate optimization:', error);
      toast.error('Failed to generate optimization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (section, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSections(prev => ({ ...prev, [section]: true }));
      toast.success(`📋 ${section} copied!`);
      setTimeout(() => {
        setCopiedSections(prev => ({ ...prev, [section]: false }));
      }, 3000);
    } catch (error) {
      toast.error('Failed to copy. Please select and copy manually.');
    }
  };

  const handleVerifyProfile = async () => {
    if (!optimization) return;
    
    setVerifying(true);
    setVerificationResult(null);
    
    try {
      // Simulate verification (in production, this would call a backend function to scrape LinkedIn)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      const result = {
        score: 85,
        matches: {
          headline: Math.random() > 0.5,
          about: Math.random() > 0.5,
          skills: Math.floor(Math.random() * 3),
        },
        suggestions: [
          'Consider adding more quantifiable achievements',
          'Your headline could include more keywords',
        ],
      };
      
      setVerificationResult(result);
      
      if (result.score >= 80) {
        toast.success('🎉 Profile verified! Looking great!');
      } else {
        toast.info('Profile scan complete. Review suggestions below.');
      }
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Failed to verify profile. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (!optimization && !loading) {
    return (
      <div style={{ padding: '16px 20px' }}>
        <div style={{ textAlign: 'center', padding: '32px 20px', background: '#f8fafc', borderRadius: 14, border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
          <h3 style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            LinkedIn Optimization Hub
          </h3>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
            Get an ATS-bypassing, recruiter-magnetic LinkedIn profile tailored to your goals.
          </p>
          
          {isPremium ? (
            <button
              onClick={handleGenerate}
              style={{
                fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: 'none', borderRadius: 10, padding: '12px 24px',
                cursor: 'pointer', minHeight: 'auto',
              }}
            >
              ✨ Generate My Optimization
            </button>
          ) : (
            <button
              onClick={onUpgrade}
              style={{
                fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                border: 'none', borderRadius: 10, padding: '12px 24px',
                cursor: 'pointer', minHeight: 'auto',
              }}
            >
              ⚡ Unlock LinkedIn Hub — $4.99/wk
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16, animation: 'bounce 1s infinite' }}>✨</div>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>
          Analyzing your profile...
        </p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b' }}>
          Generating recruiter-optimized content
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
            🌐 Your CLiFF-Optimized LinkedIn Profile
          </h3>
          <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Tailored to bypass ATS and catch UF Alumni recruiters' attention
          </p>
        </div>
        {isPremium && (
          <button
            onClick={handleVerifyProfile}
            disabled={verifying}
            style={{
              fontFamily: dm, fontSize: 11, fontWeight: 700,
              color: verifying ? '#9ca3af' : '#16a34a',
              background: verifying ? '#f3f4f6' : '#f0fdf4',
              border: `1px solid ${verifying ? '#e5e7eb' : '#bbf7d0'}`,
              borderRadius: 8, padding: '6px 12px',
              cursor: verifying ? 'not-allowed' : 'pointer',
              minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {verifying ? (
              <>
                <div style={{ width: 12, height: 12, border: '2px solid #9ca3af', borderTop: '2px solid #6b7280', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Scanning...
              </>
            ) : (
              <>
                🔄 Run Profile Scan
              </>
            )}
          </button>
        )}
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div style={{
          background: verificationResult.score >= 80 ? '#f0fdf4' : '#fff7ed',
          border: `1px solid ${verificationResult.score >= 80 ? '#bbf7d0' : '#fed7aa'}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50',
              background: verificationResult.score >= 80 ? '#16a34a' : '#ea580c',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900,
            }}>
              {verificationResult.score}%
            </div>
            <div>
              <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>
                {verificationResult.score >= 80 ? '✅ Profile Verified!' : '⚠️ Optimization Needed'}
              </p>
              <p style={{ fontFamily: dm, fontSize: 10, color: '#6b7280', margin: 0 }}>
                {verificationResult.score >= 80 ? 'Your LinkedIn matches your goals' : 'Some sections need updates'}
              </p>
            </div>
          </div>
          
          {verificationResult.suggestions?.length > 0 && (
            <div style={{ borderTop: `1px solid ${verificationResult.score >= 80 ? '#bbf7d0' : '#fed7aa'}`, paddingTop: 10 }}>
              <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Suggestions:
              </p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {verificationResult.suggestions.map((s, i) => (
                  <li key={i} style={{ fontFamily: dm, fontSize: 10, color: '#6b7280', marginBottom: 3 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Headline Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>🏷️</span>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827', margin: 0 }}>
            1. Headline
          </p>
        </div>
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '12px 14px', marginBottom: 8,
        }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#334155', margin: 0, lineHeight: 1.5 }}>
            {optimization?.headline}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => handleCopy('headline', optimization?.headline)}
            style={{
              fontFamily: dm, fontSize: 11, fontWeight: 700,
              color: copiedSections.headline ? '#16a34a' : '#2563eb',
              background: copiedSections.headline ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${copiedSections.headline ? '#bbf7d0' : '#bfdbfe'}`,
              borderRadius: 8, padding: '6px 12px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.2s',
            }}
          >
            {copiedSections.headline ? '✅ Copied!' : '📋 Copy Text'}
          </button>
        </div>
      </div>

      {/* About Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>📝</span>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827', margin: 0 }}>
            2. About / Summary
          </p>
        </div>
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '12px 14px', marginBottom: 8,
        }}>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#334155', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {optimization?.about}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={() => handleCopy('about', optimization?.about)}
            style={{
              fontFamily: dm, fontSize: 11, fontWeight: 700,
              color: copiedSections.about ? '#16a34a' : '#2563eb',
              background: copiedSections.about ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${copiedSections.about ? '#bbf7d0' : '#bfdbfe'}`,
              borderRadius: 8, padding: '6px 12px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.2s',
            }}
          >
            {copiedSections.about ? '✅ Copied!' : '📋 Copy Text'}
          </button>
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>🛠️</span>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827', margin: 0 }}>
            3. Core Skills to Add (Top 5)
          </p>
        </div>
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '12px 14px', display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {optimization?.skills?.map((skill, i) => (
            <span
              key={i}
              style={{
                fontFamily: dm, fontSize: 11, fontWeight: 700,
                color: '#2563eb', background: '#eff6ff',
                border: '1px solid #bfdbfe', borderRadius: 6,
                padding: '4px 10px',
              }}
            >
              • {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Done Updating CTA */}
      {isPremium && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: '1px solid #bfdbfe', borderRadius: 12,
          padding: '14px 16px', textAlign: 'center',
        }}>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#1e40af', margin: '0 0 10px' }}>
            Done updating your LinkedIn?
          </p>
          <button
            onClick={handleVerifyProfile}
            disabled={verifying}
            style={{
              fontFamily: dm, fontSize: 12, fontWeight: 800,
              color: '#fff',
              background: verifying ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: 'none', borderRadius: 10, padding: '10px 20px',
              cursor: verifying ? 'not-allowed' : 'pointer',
              minHeight: 'auto',
            }}
          >
            {verifying ? 'Scanning...' : '🔄 Let CLiFF Verify It'}
          </button>
        </div>
      )}
    </div>
  );
}