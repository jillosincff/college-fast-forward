import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function NetworkGrowth({ onShowSuggestions }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border h-full flex flex-col justify-between">
      <div>
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-bold text-slate-900">Network Growth</h3>
        <p className="text-sm text-slate-500 mt-1">Connect with fellow parents and alumni to expand your reach.</p>
      </div>
      <Button onClick={onShowSuggestions} variant="outline" className="w-full mt-4">
        View Suggestions
      </Button>
    </div>
  );
}