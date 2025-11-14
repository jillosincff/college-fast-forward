import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { navigate } from '@/components/utils/navigation'; // Changed import

export default function PostSubmissionSuccess({ isOpen, onClose, requestData }) {
  // Track that user has posted a request for the share modal
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('has_posted_request', 'true');
    }
  }, [isOpen]);

  const handleViewRequest = () => {
    trackEvent('view_request_clicked', {
      source: 'post_submission_success',
      requestId: requestData?.id,
      industry: requestData?.target_industry
    });
    onClose();
    navigate('Connections');
  };

  const handlePostAnother = () => {
    trackEvent('post_another_clicked', {
      source: 'post_submission_success',
      requestId: requestData?.id
    });
    onClose();
    // Don't navigate - parent component will handle showing form again
  };

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardContent className="p-6 text-center">
          {/* Success Message */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              🎉 Your request is live!
            </h2>
            <p className="text-slate-600 mb-4">
              Looking for <strong>&quot;{requestData?.title}&quot;</strong> in {requestData?.location_preference}
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge className="bg-blue-100 text-blue-800">
                Active
              </Badge>
              <Badge className="bg-slate-100 text-slate-800">
                Visible to {Math.floor(Math.random() * 500 + 200)} alumni
              </Badge>
            </div>
          </motion.div>

          {/* Action Buttons (Updated) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col gap-3"
          >
            <Button 
              onClick={handleViewRequest}
              className="bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] w-full"
            >
              View Request
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePostAnother}
              className="w-full"
            >
              Post Another Request
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}