import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MobileOptimizedModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'default',
  fullScreenOnMobile = true 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent background scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, isMobile]);

  const getModalClasses = () => {
    if (!isMobile || !fullScreenOnMobile) {
      return size === 'large' 
        ? 'sm:max-w-4xl' 
        : size === 'small' 
        ? 'sm:max-w-md' 
        : 'sm:max-w-lg';
    }
    
    // Full screen on mobile
    return 'w-full h-full max-w-none max-h-none m-0 rounded-none';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getModalClasses()} ${isMobile && fullScreenOnMobile ? 'flex flex-col' : ''}`}>
        {/* Mobile-optimized header */}
        <DialogHeader className={`${isMobile ? 'flex-shrink-0 pb-4 border-b' : ''}`}>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Scrollable content area */}
        <div className={`${isMobile && fullScreenOnMobile ? 'flex-1 overflow-y-auto py-4' : ''}`}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};