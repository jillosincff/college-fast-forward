import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const dm = "'DM Sans', system-ui, sans-serif";

/**
 * RealTimeAlertBanner - High-priority dashboard notification for pipeline status changes
 */
export default function RealTimeAlertBanner({ alertData, onDismiss, onViewDetails }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (alertData) {
      setIsVisible(true);
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          if (onDismiss) onDismiss();
        }, 300);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [alertData, onDismiss]);

  if (!alertData || !isVisible) return null;

  const isHighRisk = alertData.newRiskScore > 75;
  const isRejection = alertData.newStatus === 'rejected';
  const isInterview = alertData.newStatus === 'interviewing';

  const getCopy = () => {
    if (isRejection) {
      return {
        emoji: '❌',
        title: 'Application Status Update',
        message: `Our inbox engine detected a rejection from ${alertData.company}. Don't lose momentum — let's redirect your energy to warmer opportunities.`,
        action: 'View Next Best Matches',
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fca5a5',
      };
    }
    
    if (isHighRisk) {
      return {
        emoji: '👻',
        title: 'Ghost Risk Warning',
        message: `Our inbox engine synced a recent change. Your ghost risk for ${alertData.company} spiked to ${alertData.newRiskScore}%. We suggest applying but keeping your eyes open elsewhere.`,
        action: 'View Pipeline Details',
        color: '#ea580c',
        bgColor: '#fff7ed',
        borderColor: '#fdba74',
      };
    }
    
    if (isInterview) {
      return {
        emoji: '🎉',
        title: 'Interview Request Detected!',
        message: `Great news! ${alertData.company} just moved your application to interviewing. Check your inbox for their scheduling email.`,
        action: 'Prepare for Interview',
        color: '#16a34a',
        bgColor: '#f0fdf4',
        borderColor: '#86efac',
      };
    }

    // Generic status change
    return {
      emoji: '⚡',
      title: 'Application Status Shift Detected',
      message: `Our inbox engine synced a recent change for ${alertData.company}. Check your updated pipeline status.`,
      action: 'View Pipeline',
      color: '#2563eb',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
    };
  };

  const copy = getCopy();

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  return (
    <div
      style={{
        background: copy.bgColor,
        border: `2px solid ${copy.borderColor}`,
        borderBottom: '3px solid',
        borderBottomColor: copy.color,
        borderRadius: 12,
        padding: '14px 18px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        boxShadow: `0 4px 12px ${copy.color}22`,
        animation: isLeaving ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out',
        position: 'relative',
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: copy.color, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 16,
      }}>
        {copy.emoji}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: dm, fontSize: 12, fontWeight: 700,
          color: copy.color, margin: '0 0 4px', textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {copy.title}
        </p>
        <p style={{
          fontFamily: dm, fontSize: 12, color: '#475569',
          margin: '0 0 10px', lineHeight: 1.5,
        }}>
          {copy.message}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => onViewDetails?.(alertData.cardId)}
            style={{
              fontFamily: dm, fontSize: 11, fontWeight: 700,
              color: '#fff', background: copy.color, border: 'none',
              borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
              minHeight: 'auto', display: 'flex', alignItems: 'center',
              gap: 4,
            }}
          >
            {copy.action} <ArrowRight size={12} />
          </button>
          <button
            onClick={handleClose}
            style={{
              fontFamily: dm, fontSize: 11, color: '#64748b',
              background: 'transparent', border: 'none',
              cursor: 'pointer', minHeight: 'auto',
              textDecoration: 'underline',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute', top: 8, right: 8,
          width: 24, height: 24, borderRadius: '50%',
          background: 'transparent', border: 'none',
          color: '#94a3b8', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', minHeight: 'auto',
          fontSize: 14,
        }}
      >
        ✕
      </button>
    </div>
  );
}