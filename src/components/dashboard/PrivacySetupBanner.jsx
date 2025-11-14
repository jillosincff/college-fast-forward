import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';

// Simple navigation function
const navigate = (page) => {
  window.location.hash = `#${page}`;
};

export default function PrivacySetupBanner() {
  const handleClick = () => {
    trackEvent('privacy_banner_clicked', { from: 'dashboard' });
    navigate('ProfileEdit');
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-[var(--uf-blue)] flex-shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Set Your Profile Privacy</h3>
              <p className="text-slate-600 text-sm mt-1 max-w-lg">
                Choose whether students can see your full profile when browsing for help. Your details are always private when you offer help directly.
              </p>
            </div>
          </div>
          <Button
            onClick={handleClick}
            className="bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white w-full sm:w-auto flex-shrink-0"
          >
            Go to Settings <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}