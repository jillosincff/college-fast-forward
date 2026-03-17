import React, { useState } from 'react';
import { Copy, Check, Pencil } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function OutreachMessage({ message, recipientName }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!message) return null;

  return (
    <div style={{
      background: '#15171C', borderRadius: 16, border: '1px solid #23252B',
      padding: '28px 28px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            ✉️ Your outreach message
          </h2>
          {recipientName && (
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              To: {recipientName}
            </p>
          )}
        </div>
        <span style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 500,
          color: '#4CAF50', background: 'rgba(76,175,80,0.1)',
          border: '0.5px solid rgba(76,175,80,0.25)',
          borderRadius: 100, padding: '4px 12px',
        }}>
          Ready to send
        </span>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid #1F2128',
        borderRadius: 12, padding: '20px 22px',
        marginBottom: 18,
      }}>
        <pre style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
        }}>
          {message}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleCopy} style={{
          background: copied ? 'rgba(76,175,80,0.15)' : 'rgba(79,140,255,0.1)',
          border: copied ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(79,140,255,0.25)',
          borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 500,
          color: copied ? '#4CAF50' : '#4F8CFF',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
        }}>
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
        </button>
        <button style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid #2A2D35',
          borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.15s', minHeight: 'auto', width: 'auto',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >
          <Pencil size={14} /> Edit
        </button>
      </div>
    </div>
  );
}