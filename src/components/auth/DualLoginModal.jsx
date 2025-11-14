import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Lock, Zap, CheckCircle, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DualLoginModal({ isOpen, onClose, initialMode = 'login' }) {
  const { sendMagicLinkEmail, loginWithPassword, registerWithPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('password');
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [error, setError] = useState('');

  const handlePasswordAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (mode === 'signup' && !fullName) {
      setError('Please enter your full name.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        await registerWithPassword(email, password, fullName);
      } else {
        await loginWithPassword(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      setError('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMagicLinkSent(false);
      setError('');
      setEmail('');
      setPassword('');
      setFullName('');
      setMagicEmail('');
      setMode('login');
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
              {mode === 'signup' ? 'Join' : 'Welcome to'} College Fast Forward
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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Email & Password
                      </TabsTrigger>
                      <TabsTrigger value="magic" className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Magic Link
                      </TabsTrigger>
                    </TabsList>
                    
                    {error && (
                      <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700 dark:text-red-400">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <TabsContent value="password" className="mt-0">
                      <Card className="border-0 shadow-none">
                        <CardContent className="px-0">
                          <div className="flex justify-center mb-4">
                            <Button
                              variant="ghost"
                              className="text-sm"
                              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            >
                              {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                            </Button>
                          </div>
                          
                          <form onSubmit={handlePasswordAuth} className="space-y-4">
                            {mode === 'signup' && (
                              <div>
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                  id="fullName"
                                  type="text"
                                  placeholder="John Doe"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  required
                                  className="mt-1"
                                />
                              </div>
                            )}
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="password">Password</Label>
                              <div className="relative mt-1">
                                <Input
                                  id="password"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  className="pr-10"
                                />
                                <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </div>
                              {mode === 'signup' && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Must be 8+ characters with uppercase, lowercase, and number
                                </p>
                              )}
                            </div>
                            <Button 
                              type="submit" 
                              className="w-full bg-[var(--uf-blue)] hover:bg-blue-700"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                                </>
                              ) : (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                                </>
                              )}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="magic" className="mt-0">
                      <Card className="border-0 shadow-none">
                        <CardContent className="px-0">
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mb-4 text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            ⚡ We'll email you a secure, one-time login link. <strong>No password needed.</strong>
                          </CardDescription>
                          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                            <div>
                              <Label htmlFor="magic-email">Email Address</Label>
                              <Input
                                id="magic-email"
                                type="email"
                                placeholder="you@example.com"
                                value={magicEmail}
                                onChange={(e) => setMagicEmail(e.target.value)}
                                required
                                className="mt-1"
                              />
                            </div>
                            <Button 
                              type="submit" 
                              className="w-full bg-[var(--uf-orange)] hover:bg-orange-600"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending Magic Link...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Send Magic Link
                                </>
                              )}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}