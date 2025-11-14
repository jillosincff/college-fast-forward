import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { HelpOffer } from '@/entities/HelpOffer';
import UserAvatar from '@/components/common/UserAvatar';

export default function HelpOffersWidget({ offers: propOffers, loading: propLoading }) {
  const { user } = useAuth();
  const [offers, setOffers] = useState(propOffers || []);
  const [isLoading, setIsLoading] = useState(propLoading !== undefined ? propLoading : true);
  const [error, setError] = useState(null);

  const loadOffers = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userOffers = await HelpOffer.filter({ request_creator_email: user.email }, '-created_date', 5);
      setOffers(Array.isArray(userOffers) ? userOffers : []);
    } catch (error) {
      console.warn('Could not load help offers:', error.message);
      setError('Unable to load offers');
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (propOffers === undefined && user?.email) {
      loadOffers();
    } else if (propOffers) {
      setOffers(propOffers);
      setIsLoading(false);
    }
  }, [user, propOffers, loadOffers]);

  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-500 text-sm mb-3">{error}</p>
        <Button variant="ghost" size="sm" onClick={loadOffers} className="gap-2 text-xs">
          <RefreshCw className="w-3 h-3" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {offers.length > 0 ? (
        <div className="space-y-3">
          {offers.slice(0, 3).map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => navigate('Connections')}
            >
              <div className="flex items-center justify-between gap-3">
                 <UserAvatar userName={offer.offerer_name} className="w-8 h-8 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {offer.offerer_name} offered help
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-1 capitalize">
                    {offer.help_type.replace(/_/g, ' ')}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('Connections')}
            className="w-full mt-3 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            View All Offers
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">No new help offers.</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('PostRequest')}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Post a Request
          </Button>
        </div>
      )}
    </div>
  );
}