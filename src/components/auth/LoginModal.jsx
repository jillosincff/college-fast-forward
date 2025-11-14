import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { sendMagicLinkEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicEmail, setMagicEmail] = useState('');
  const [error, setError] = useState('');

  const handleMagicLinkLogin = async (e) => {
    e.preventDefault();
    if (!magicEmail) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await sendMagicLinkEmail(magicEmail);
      setMagicLinkSent(true);
    } catch (err) {
      setError('Failed to send magic link. Please check your network or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after a short delay to allow for exit animation
    setTimeout(() => {
        setMagicLinkSent(false);
        setError('');
        setMagicEmail('');
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          <DialogHeader className="p-6 pb-4 text-center">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome to College Fast Forward
            </DialogTitle>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Connect with the Gator Nation to fast-forward your future.
            </p>
          </DialogHeader>

          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {magicLinkSent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Check Your Email!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    We've sent a secure login link to <strong className="text-slate-800 dark:text-slate-200">{magicEmail}</strong>.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    The link expires in 15 minutes and can only be used once.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setMagicLinkSent(false)}>
                    Use a different email
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="form">
                   <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      ⚡ We'll email you a secure, one-time login link. <strong>No password needed.</strong>
                    </div>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="magic-email">Email Address</Label>
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="you@email.com"
                        value={magicEmail}
                        onChange={(e) => setMagicEmail(e.target.value)}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold bg-[var(--uf-blue)] hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
                      Send Magic Link
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}