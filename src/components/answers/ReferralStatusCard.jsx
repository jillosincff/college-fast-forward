import React from 'react';
import { Handshake, CheckCircle2 } from 'lucide-react';

export default function ReferralStatusCard({ referrals }) {
  if (!referrals || referrals.length === 0) return null;

  const answeredCount = referrals.filter(r => r.status === 'answered').length;

  return (
    <div className="referral-status-card">
      <div className="status-content">
        <Handshake className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          {referrals.length === 1 ? (
            <p className="status-text">
              <span className="referrer-name">{referrals[0].referrer_name}</span> reached out to a contact who might be able to help.
            </p>
          ) : (
            <>
              <p className="status-text">
                {referrals.length} people reached out to contacts who might be able to help.
              </p>
              <ul className="referrer-list">
                {referrals.map((r, i) => (
                  <li key={i}>• {r.referrer_name}</li>
                ))}
              </ul>
            </>
          )}

          <p className="status-footer">
            {answeredCount > 0 ? (
              <span className="answered">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                {answeredCount} responded! See their answer{answeredCount > 1 ? 's' : ''} above.
              </span>
            ) : (
              "You'll be notified by email if they respond."
            )}
          </p>
        </div>
      </div>

      <style jsx>{`
        .referral-status-card {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .status-content {
          display: flex;
          gap: 12px;
        }

        .status-text {
          font-size: 14px;
          color: #1E3A5F;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .referrer-name {
          font-weight: 600;
        }

        .referrer-list {
          list-style: none;
          padding: 0;
          margin: 0 0 8px 0;
        }

        .referrer-list li {
          font-size: 13px;
          color: #4B5563;
          padding: 2px 0;
        }

        .status-footer {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
        }

        .answered {
          color: #059669;
          font-weight: 500;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}