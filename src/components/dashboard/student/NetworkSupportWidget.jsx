import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

export default function NetworkSupportWidget() {
  const supportCards = [
    {
      icon: '👨‍💼',
      label: 'Parents',
      activity: '2 opportunities shared from professional networks this week',
      borderColor: 'border-l-orange-500',
      action: () => navigate('Opportunities', { posted_by: 'parent' }),
      cta: 'Browse Parent Opportunities'
    },
    {
      icon: '🎓',
      label: 'Alumni',
      activity: '5 alumni in your field active and ready to help',
      borderColor: 'border-l-blue-700',
      action: () => navigate('GatorDirectory', { persona: 'alumni' }),
      cta: 'Connect with Alumni'
    },
    {
      icon: '👥',
      label: 'Fellow Gators',
      activity: 'Students like you landed 12 interviews this month',
      borderColor: 'border-l-green-500',
      action: () => navigate('Connections'),
      cta: 'Join Student Community'
    }
  ];

  return (
    <div className="network-support-section">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Your Three Networks in Action</h3>
      <div className="support-cards grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportCards.map(card => (
          <div key={card.label} className={`support-card bg-white rounded-xl p-6 shadow-sm border-l-4 ${card.borderColor}`}>
            <div className="support-header flex items-center gap-3 mb-3">
              <span className="network-icon text-2xl">{card.icon}</span>
              <span className="network-label text-lg font-semibold text-slate-800">{card.label}</span>
            </div>
            <p className="support-activity text-sm text-slate-600 mb-4 min-h-[40px]">{card.activity}</p>
            <Button
              variant="outline"
              onClick={card.action}
              className="connect-btn w-full transition-colors hover:bg-slate-50"
            >
              {card.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}