import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

// Simple navigation function
const navigate = (page, params = {}) => {
  let hash = `#${page}`;
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    hash += `?${searchParams.toString()}`;
  }
  window.location.hash = hash;
};

export default function AskParentWidget() {
  const { user } = useAuth();

  // Only show if user has zero 2nd-degree offers sent this session
  // For now, we'll show it by default but this would be based on actual data
  const shouldShow = true; // Replace with actual logic: user?.second_degree_offers_sent === 0

  if (!shouldShow) {
    return null;
  }

  const handleClick = () => {
    navigate('Connections', { filter: 'parent' });
  };

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-white rounded-full shadow-md hidden sm:flex relative">
            <Heart className="w-8 h-8 text-[var(--uf-orange)]" />
            <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Not sure where to start?</h3>
            <p className="text-slate-600">Let a fellow Gator parent make an intro for you. Two clicks, endless possibilities!</p>
          </div>
        </div>
        <Button onClick={handleClick} className="bg-[var(--uf-orange)] hover:bg-[#E24B14] text-white font-semibold rounded-xl w-full md:w-auto flex-shrink-0 shadow-lg hover:shadow-xl transition-all">
          Ask a Parent
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}