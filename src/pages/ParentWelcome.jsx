import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';

export default function ParentWelcome() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>

        <div style={{
          fontSize: 64, marginBottom: 32,
          fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
        }}>
          💙
        </div>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          color: '#E85D20', margin: '0 0 20px',
        }}>
          YOU'RE IN THE NETWORK
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700, color: '#fff',
          margin: '0 0 40px', lineHeight: 1.2,
        }}>
          Thank you, {firstName}.
        </h1>

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(18px, 3vw, 22px)',
          color: '#fff', lineHeight: 1.7,
          margin: '0 0 28px', fontWeight: 500,
        }}>
          You just joined something that has never existed before.
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8, margin: '0 0 28px',
        }}>
          A community of parents who are now able to directly
          help their own kids — and each other's kids —
          land real opportunities.
        </p>

        <div style={{
          borderLeft: '3px solid #E85D20',
          paddingLeft: 24, marginBottom: 28,
          textAlign: 'left',
        }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: '#fff', lineHeight: 1.7,
            margin: 0, fontStyle: 'italic',
          }}>
            You're part of the first network where your lifetime
            of connections is combined with AI to create warm
            introductions and actual momentum for students.
          </p>
        </div>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8, margin: '0 0 28px',
        }}>
          One conversation really can change a career.
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8, margin: '0 0 28px',
        }}>
          Students are out there right now, overwhelmed
          and unsure where to start.
        </p>

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(18px, 3vw, 22px)',
          color: '#fff', lineHeight: 1.7,
          margin: '0 0 40px', fontWeight: 600,
        }}>
          You just became someone who can change that.
        </p>

        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          margin: '0 0 40px',
        }} />

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.8, margin: '0 0 40px',
        }}>
          When one of them reaches out,
          we'll let you know immediately.
        </p>

        <div style={{ marginBottom: 48 }}>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(18px, 3vw, 24px)',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6, margin: '0 0 8px',
            fontStyle: 'italic',
          }}>
            Until then, just know:
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(24px, 4vw, 32px)',
            color: '#fff', fontWeight: 700,
            lineHeight: 1.3, margin: '0 0 16px',
          }}>
            You being here is enough.
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            color: '#E85D20', margin: 0,
          }}>
            Welcome to College Fast Forward.
          </p>
        </div>

        <button
          onClick={() => navigate('ParentUpsell')}
          style={{
            background: '#E85D20', border: 'none',
            borderRadius: 10, padding: '16px',
            fontSize: 15, fontWeight: 600,
            color: '#fff', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            width: '100%', marginBottom: 16,
            minHeight: 'auto',
          }}
        >
          Continue →
        </button>

        <button
          onClick={() => navigate('ParentHome')}
          style={{
            background: 'none', border: 'none',
            fontSize: 13, color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            minHeight: 'auto',
          }}
        >
          Go to my profile →
        </button>

      </div>
    </div>
  );
}