import { Award, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const badges = [
    { name: "First Intro", icon: Star, color: "text-yellow-500" },
    { name: "5 Students Helped", icon: Trophy, color: "text-blue-500" },
    { name: "Community Builder", icon: Award, color: "text-purple-500" },
];

export default function RecognitionBadges() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Recognition</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        {badges.map((badge, i) => (
          <div key={i} className="p-3 bg-slate-100 rounded-lg flex flex-col items-center">
            <badge.icon className={`w-8 h-8 mb-2 ${badge.color}`} />
            <p className="text-xs font-semibold">{badge.name}</p>
          </div>
        ))}
      </div>
      <Button variant="secondary" className="w-full mt-4">Download Badge</Button>
    </div>
  );
}