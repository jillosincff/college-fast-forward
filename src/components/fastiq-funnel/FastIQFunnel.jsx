import React from 'react';
import { FunnelProvider, useFunnel } from './FunnelContext';
import DualPathEntry from './DualPathEntry';
import KnownTargetsQuiz from './KnownTargetsQuiz';
import ExplorerQuiz from './ExplorerQuiz';
import TeaserReveal from './TeaserReveal';
import MatchScoreDashboard from './MatchScoreDashboard';
import PaywallScreen from './PaywallScreen';

function FunnelRouter() {
  const { phase, path } = useFunnel();

  switch (phase) {
    case 'entry':
      return <DualPathEntry />;
    case 'quiz':
      return path === 'known' ? <KnownTargetsQuiz /> : <ExplorerQuiz />;
    case 'teaser':
      return <TeaserReveal />;
    case 'score':
      return <MatchScoreDashboard />;
    case 'paywall':
      return <PaywallScreen />;
    default:
      return <DualPathEntry />;
  }
}

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