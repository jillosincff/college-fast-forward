import React, { useState } from 'react';
import { Building2, Send, Copy, Check, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function StepResults({ plan, onGoToPlan, onEdit }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (plan.outreachMessage) {
      navigator.clipboard.writeText(plan.outreachMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: '0 24px', maxWidth: 520, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{
          fontFamily: dmSans, fontSize: 30, fontWeight: 700, color: '#fff',
          lineHeight: 1.2, marginBottom: 8, letterSpacing: '-0.02em',
        }}>
          Here's your plan
        </h1>
        <p style={{
          fontFamily: dmSans, fontSize: 16, fontWeight: 400,
          color: 'rgba(255,255,255,0.5)',
        }}>
          You're not guessing anymore.
        </p>
      </div>

      {/* Target Companies */}
      <div style={{
        background: '#15171C', borderRadius: 16, border: '1px solid #23252B',
        padding: '22px 24px', marginBottom: 14,
      }}>
        <h3 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          🎯 Target Companies
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {plan.companies.map((c, i) => (
            <span key={i} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2D35',
              borderRadius: 8, padding: '8px 14px',
              fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.75)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Building2 size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
              {c.name || c}{c.userTyped ? '*' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* People to Contact */}
      <div style={{
        background: '#15171C', borderRadius: 16, border: '1px solid #23252B',
        padding: '22px 24px', marginBottom: 14,
      }}>
        <h3 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>
          👥 People to Contact
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plan.contacts.map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.02)', border: '1px solid #1F2128',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#23252B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                flexShrink: 0,
              }}>
                {p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', display: 'block' }}>
                  {p.name}
                </span>
                <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>
                  {p.role} — {p.company}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outreach Message */}
      <div style={{
        background: '#15171C', borderRadius: 16, border: '1px solid #23252B',
        padding: '22px 24px', marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>
            ✉️ Your First Message
          </h3>
          <span style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 500,
            color: '#4CAF50', background: 'rgba(76,175,80,0.1)',
            border: '0.5px solid rgba(76,175,80,0.25)',
            borderRadius: 100, padding: '3px 10px',
          }}>
            Ready to send
          </span>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid #1F2128',
          borderRadius: 10, padding: '16px 18px', marginBottom: 14,
        }}>
          <pre style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
          }}>
            {plan.outreachMessage}
          </pre>
        </div>
        <button onClick={handleCopy} style={{
          background: copied ? 'rgba(76,175,80,0.12)' : 'rgba(79,140,255,0.1)',
          border: copied ? '1px solid rgba(76,175,80,0.25)' : '1px solid rgba(79,140,255,0.2)',
          borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 12, fontWeight: 500,
          color: copied ? '#4CAF50' : '#4F8CFF',
          display: 'flex', alignItems: 'center', gap: 5,
          minHeight: 'auto', width: 'auto', transition: 'all 0.2s',
        }}>
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy message</>}
        </button>
      </div>

      {/* CTAs */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onGoToPlan} style={{
          background: '#4F8CFF', border: 'none', borderRadius: 12,
          padding: '16px 44px', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          transition: 'all 0.2s', minHeight: 'auto',
          boxShadow: '0 4px 24px rgba(79,140,255,0.3)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Go to My Plan <ArrowRight size={16} />
        </button>
        <div style={{ marginTop: 14 }}>
          <button onClick={onEdit} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: dmSans, fontSize: 14, fontWeight: 400,
            color: 'rgba(255,255,255,0.35)', minHeight: 'auto',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
          >
            Edit my inputs
          </button>
        </div>
      </div>
    </div>
  );
}