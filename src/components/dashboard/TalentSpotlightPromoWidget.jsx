import { useState } from 'react';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import TalentSpotlightSetupModal from './TalentSpotlightSetupModal';

export default function TalentSpotlightPromoWidget() {
  const { user, refreshUser } = useAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);

  const handleSuccess = async () => {
    await refreshUser();
  };

  return (
    <>
      <div className="bg-gradient-to-br from-orange-50 via-purple-50 to-blue-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg relative">
        {/* Coming Soon Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1 text-xs shadow-md">
            Coming Soon
          </Badge>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 pr-20">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              ✨ Get Featured in Talent Spotlight
            </h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              Be discovered by 70,000+ alumni and parents actively looking to hire. 
              Showcase your projects, skills, and personality to stand out.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Direct outreach from employers</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>3x more interview requests</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Featured for 30 days</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>100% free</span>
              </div>
            </div>

            <Button
              onClick={() => setShowSetupModal(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Set Up My Spotlight
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-xs text-slate-500 mt-2">
              Be one of the first students featured when we launch!
            </p>
          </div>
        </div>
      </div>

      <TalentSpotlightSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        user={user}
        onSuccess={handleSuccess}
      />
    </>
  );
}