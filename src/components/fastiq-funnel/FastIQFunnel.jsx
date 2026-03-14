import React from 'react';
import { FunnelProvider, useFunnel } from './FunnelContext';
import DualPathEntry from './DualPathEntry';
import ReadinessQuiz from './ReadinessQuiz';

function FunnelRouter() {
  const { phase } = useFunnel();

  switch (phase) {
    case 'entry':
      return <DualPathEntry />;
    case 'quiz':
      return <ReadinessQuiz />;
    default:
      return <DualPathEntry />;
  }
}

// Main funnel orchestrator
export default function FastIQFunnel({ onClose }) {
  return (
    <FunnelProvider onClose={onClose}>
      <div
        className="min-h-[60vh] relative"
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F172A 100%)' }}
      >
        <FunnelRouter />
      </div>
    </FunnelProvider>
  );
}