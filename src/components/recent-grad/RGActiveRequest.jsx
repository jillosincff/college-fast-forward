import React from 'react';
import { FileText, Megaphone } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function formatDaysAgo(dateStr) {
  if (!dateStr) return '';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function getDisplayName(fullName) {
  if (!fullName) return 'Alumni';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]?.charAt(0)}.`;
}

export default function RGActiveRequest({ request, queuePosition, responseCount, onPostRequest, onEditRequest }) {
  // No active request — show CTA
  if (!request) {
    return (
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 24px',
        border: '1px solid #e5e7eb', textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', background: 'rgba(232,93,32,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Megaphone style={{ width: 24, height: 24, color: '#E85D20' }} />
        </div>
        <h3 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 8,
        }}>Post a Request to Get Matched</h3>
        <p style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#888',
          lineHeight: 1.6, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px',
        }}>
          Tell the network what you're looking for. Parents and alumni will reach out to help.
        </p>
        <button
          onClick={onPostRequest}
          style={{
            fontFamily: dmSans, fontSize: 15, fontWeight: 700, width: '100%',
            height: 48, borderRadius: 12, border: 'none', background: '#E85D20',
            color: '#fff', cursor: 'pointer',
          }}
        >
          Post Your First Request →
        </button>
      </div>
    );
  }

  const helpTypes = request.help_types || [];
  const positionNum = queuePosition || 0;

  return (
    <div id="active-request-section" style={{
      background: '#fff', borderRadius: 16, padding: '24px 20px',
      border: '1px solid #e5e7eb',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText style={{ width: 18, height: 18, color: '#1a1a1a' }} />
          <span style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
            Your Active Request
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888' }}>
            Visible to the network
          </span>
        </div>
      </div>

      {/* Request content */}
      <p style={{
        fontFamily: dmSans, fontSize: 15, fontStyle: 'italic', color: '#333',
        lineHeight: 1.6, marginBottom: 12,
      }}>
        "{request.description || request.role}"
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {helpTypes.slice(0, 3).map((t, i) => (
          <span key={i} style={{
            fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: '#E85D20',
            background: 'rgba(232,93,32,0.08)', borderRadius: 999, padding: '4px 10px',
          }}>{t.replace(/_/g, ' ')}</span>
        ))}
        <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#aaa' }}>
          Posted {formatDaysAgo(request.created_date)}
        </span>
      </div>

      {/* Queue position block */}
      {positionNum > 0 && (
        <div style={{
          background: '#fef7f0', borderRadius: 12, padding: '14px 16px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: playfair, fontWeight: 700, fontSize: 16, color: '#E85D20',
            }}>
              #{positionNum} in feed
            </span>
          </div>
          {positionNum > 5 ? (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', margin: 0 }}>
              Help other students to move up in the feed and get more responses.{' '}
              <span
                onClick={() => navigate('Connections')}
                style={{ color: '#E85D20', cursor: 'pointer', fontWeight: 600 }}
              >
                Answer a Question →
              </span>
            </p>
          ) : (
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#22c55e', fontWeight: 500, margin: 0 }}>
              You're near the top! Keep it up.
            </p>
          )}
        </div>
      )}

      {/* Response count */}
      <p style={{
        fontFamily: dmSans, fontSize: 13, fontWeight: 500,
        color: responseCount > 0 ? '#333' : '#aaa', marginBottom: 16,
      }}>
        {responseCount > 0 ? `${responseCount} responses so far` : 'No responses yet'}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid #f0f0f0', paddingTop: 14,
      }}>
        <span style={{ fontFamily: dmSans, fontSize: 12, color: '#aaa' }}>
          🔒 Visible to the network
        </span>
        <button
          onClick={() => onEditRequest?.(request)}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#E85D20',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            minHeight: 'auto', width: 'auto',
          }}
        >
          ✏️ Edit Request →
        </button>
      </div>
    </div>
  );
}