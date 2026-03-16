import React from 'react';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const INDUSTRIES_MAP = {
  tech: 'Tech', finance: 'Finance', consulting: 'Consulting', healthcare: 'Healthcare',
  marketing: 'Marketing', engineering: 'Engineering', law: 'Law', education: 'Education',
  real_estate: 'Real Estate', nonprofit: 'Nonprofit', government: 'Government',
  media: 'Media/Entertainment', startups: 'Startups', other: 'Other',
};

const HELP_MAP = {
  career_guidance: 'Career guidance', jobs_referrals: 'Jobs & referrals',
  resume_interviews: 'Resume & interviews', industry_insights: 'Industry insights',
  introductions: 'Introductions',
};

export default function AlumniStep7Ready({ formData, onUpdate, onFinish, onBack, loading }) {
  const isHelper = formData.intent === 'help_students';
  const isRecentGrad = formData.seniority === 'recent_grad';

  return (
    <div>
      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
        Almost there!
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginBottom: 28 }}>
        Just confirm your visibility settings.
      </p>

      {/* Karma explainer */}
      <div style={{
        background: '#eff6ff', borderRadius: 12, padding: '14px 18px', marginBottom: 20,
        border: '1px solid #dbeafe',
      }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#1e40af', lineHeight: 1.5, margin: 0 }}>
          {isRecentGrad
            ? <><strong>🎓 As a recent grad</strong>, you'll be routed to the student dashboard where you can access FASTIQ, networking tools, and connect with parents and alumni who can help you.</>
            : <><strong>💡 Your Karma:</strong> Points you earn from helping students boost visibility for your own career requests.</>
          }
        </p>
      </div>

      {/* Directory toggle */}
      <div style={{
        background: '#f8fafc', borderRadius: 14, padding: '20px', marginBottom: 16,
        border: '2px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>
              Show my profile in the directory
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
              Students can discover you and reach out for help
            </p>
          </div>
          <Switch
            checked={formData.visibleInDirectory}
            onCheckedChange={v => onUpdate({ visibleInDirectory: v })}
          />
        </div>
      </div>

      {/* Tip box */}
      <div style={{
        background: '#fefce8', borderRadius: 12, padding: '14px 18px', marginBottom: 24,
        border: '1px solid #fef08a',
      }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#854d0e', lineHeight: 1.5, margin: 0 }}>
          <strong>💡 Tip:</strong> Being visible in the directory means more students can find you based on your expertise. You can always change this later in your profile settings.
        </p>
      </div>

      {/* Profile summary */}
      <div style={{
        borderTop: '1px solid #e5e7eb', paddingTop: 20, marginBottom: 28,
      }}>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>
          Here's what you've shared:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {formData.industries.length > 0 && (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#555', margin: 0 }}>
              🏭 {formData.industries.map(i => INDUSTRIES_MAP[i] || i).join(', ')}
            </p>
          )}
          {formData.major && (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#555', margin: 0 }}>
              🎓 {formData.major}{formData.gradYear ? ` '${String(formData.gradYear).slice(-2)}` : ''}
            </p>
          )}
          {isHelper && formData.helpTypes.length > 0 && (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#555', margin: 0 }}>
              🤝 Ready to help with: {formData.helpTypes.map(h => HELP_MAP[h] || h).join(', ')}
            </p>
          )}
          {!isHelper && (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#555', margin: 0 }}>
              🔍 Looking for: career opportunities
            </p>
          )}
          {formData.company && (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#555', margin: 0 }}>
              🏢 {formData.company}{formData.jobTitle ? ` — ${formData.jobTitle}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, padding: '0 24px', height: 52,
          borderRadius: 12, border: '2px solid #e5e7eb', background: '#fff', color: '#555',
          cursor: 'pointer', minHeight: 'auto',
        }}>
          ← Back
        </button>
        <button
          onClick={onFinish}
          disabled={loading}
          style={{
            fontFamily: dmSans, fontSize: 16, fontWeight: 700, flex: 1, height: 52,
            borderRadius: 12, border: 'none', background: '#E85D20', color: '#fff',
            cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading ? (
            <>
              <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
              Setting up...
            </>
          ) : (
            'Complete Profile →'
          )}
        </button>
      </div>

      <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', textAlign: 'center', marginTop: 16 }}>
        No spam • You control who contacts you
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}