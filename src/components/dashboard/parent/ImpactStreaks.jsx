import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';

export default function ImpactStreaks({ stats }) {
  if (!stats) return null;

  // Simple logic for streak, can be enhanced later
  const streakDays = Math.floor(stats.impactScore / 100);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Impact & Streaks</h3>
        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
          <Flame className="w-4 h-4 mr-1" />
          {streakDays}-day streak
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600">{stats.reachoutsMade || 0}</p>
          <p className="text-xs text-slate-500">Students Helped</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{stats.familyConnections || 0}</p>
          <p className="text-xs text-slate-500">Intros Sent</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-blue-600">{stats.opportunitiesPosted || 0}</p>
          <p className="text-xs text-slate-500">Opps Shared</p>
        </div>
      </div>
      <Button variant="link" size="sm" className="mt-auto mx-auto" onClick={() => navigate('MyImpact')}>
        View Impact Timeline →
      </Button>
    </div>
  );
}