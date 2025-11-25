import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function DraftRequestBanner({ user }) {
  const [draftRequest, setDraftRequest] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    
    const checkForDraftRequest = async () => {
      try {
        // Check if user has a draft request
        const requests = await base44.entities.JobRequest.filter({
          created_by: user.email,
          status: 'draft'
        });
        
        if (requests && requests.length > 0) {
          setDraftRequest(requests[0]);
        }
      } catch (error) {
        console.error('Failed to check for draft request:', error);
      } finally {
        setLoading(false);
      }
    };

    checkForDraftRequest();
  }, [user?.email]);

  const handleActivate = () => {
    // Navigate to PostRequest with the draft ID to edit/activate
    navigate(`PostRequest?edit=${draftRequest.id}`);
  };

  if (loading || !draftRequest || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 border-0 shadow-xl overflow-hidden relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-3 right-3 text-white/80 hover:text-white z-10"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          
          <CardContent className="pt-6 pb-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <h3 className="text-xl font-bold">
                    🚀 Your Career Request is Ready!
                  </h3>
                </div>
                <p className="text-white/90 mb-2">
                  We've created a draft career request based on your profile. Activate it to get discovered by parents and alumni who want to help you!
                </p>
                <p className="text-sm text-white/80">
                  Review and customize your request to make it stand out.
                </p>
              </div>
              <Button
                onClick={handleActivate}
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-6 shadow-lg flex items-center gap-2"
              >
                Activate My Request
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}