import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function FoundingMemberBanner({ onUpgrade, onDismiss, show }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!show) return;

    const calculateTimeLeft = () => {
      const deadline = new Date('2026-04-15T23:59:59');
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1a0e06 0%, #2a1410 100%)',
        border: '1px solid rgba(232,93,32,0.3)',
        borderRadius: 12,
        padding: '20px 24px',
        position: 'relative',
        marginBottom: 20,
        boxShadow: '0 8px 24px rgba(232,93,32,0.15)',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'auto',
          minWidth: 'auto',
        }}
      >
        <X style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.4)' }} />
      </button>

      <div style={{ paddingRight: 28 }}>
        {/* Headline */}
        <h3 style={{
          fontFamily: playfair,
          fontSize: 'clamp(18px, 3vw, 24px)',
          fontWeight: 700,
          color: '#E85D20',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
        }}>
          Founding Member Pricing Ends April 15
        </h3>

        {/* Subtext */}
        <p style={{
          fontFamily: dmSans,
          fontSize: 14,
          color: 'rgba(255,255,255,0.75)',
          margin: '0 0 16px',
          lineHeight: 1.5,
        }}>
          Lock in 50% off FastIQ forever — $14.50/mo instead of $29. Only available to our first 1,000 members.
        </p>

        {/* Countdown or expired message */}
        {isExpired ? (
          <p style={{
            fontFamily: dmSans,
            fontSize: 13,
            color: '#c9a84c',
            margin: 0,
            fontWeight: 600,
          }}>
            Offer has ended
          </p>
        ) : timeLeft ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}>
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Min' },
              { value: timeLeft.seconds, label: 'Sec' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <p style={{
                  fontFamily: playfair,
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#E85D20',
                  margin: '0 0 4px',
                }}>
                  {String(item.value).padStart(2, '0')}
                </p>
                <p style={{
                  fontFamily: dmSans,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {/* CTA button */}
        {!isExpired && (
          <button
            onClick={onUpgrade}
            style={{
              background: '#E85D20',
              border: 'none',
              borderRadius: 8,
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              fontFamily: dmSans,
              minHeight: 'auto',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Claim Founding Price →
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          /* Mobile adjustments handled via clamp() */
        }
      `}</style>
    </div>
  );
}