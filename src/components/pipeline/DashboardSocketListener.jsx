import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * DashboardSocketListener - Real-time pipeline status change detector
 * Listens for APPLICATION_SIGNAL_SHIFT events from backend email scanner
 */
export default function DashboardSocketListener({ onAlert, onCardPulse }) {
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Subscribe to pipeline status changes
    const setupSubscription = async () => {
      try {
        // Subscribe to ApplicationPipeline entity changes
        subscriptionRef.current = base44.entities.OpportunityApplication.subscribe((event) => {
          // Only trigger on updates (status changes)
          if (event.type !== 'update') return;
          
          const data = event.data;
          const oldData = event.old_data;
          
          // Detect status shifts that warrant alerts
          const statusChanged = data.status !== oldData?.status;
          const riskSpiked = data.ghost_risk_score > 75 && (oldData?.ghost_risk_score || 0) <= 75;
          
          if (statusChanged || riskSpiked) {
            const alertData = {
              cardId: data.opportunity_id,
              company: data.opportunity_company,
              newStatus: data.status,
              newRiskScore: data.ghost_risk_score || 0,
              previousStatus: oldData?.status,
            };
            
            // Trigger dashboard banner
            if (onAlert) {
              onAlert(alertData);
            }
            
            // Trigger card pulse animation
            if (onCardPulse) {
              onCardPulse(alertData.cardId);
            }
          }
        });
      } catch (error) {
        console.error('Failed to setup pipeline subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, [onAlert, onCardPulse]);

  return null; // This is a headless component - no UI
}