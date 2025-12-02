import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Zap, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';

export default function CleanAuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', fullName: '', confirmPassword: '', referralCode: '' });
  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  const { loginWithPassword, registerWithPassword, sendMagicLinkEmail } = useAuth();

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await loginWithPassword(loginForm.email, loginForm.password);
      showMessage('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        onClose();
        window.location.hash = '#Dashboard';
      }, 1000);
    } catch (error) {
      showMessage(error.message, 'error');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
    
    if (signupForm.password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await registerWithPassword(signupForm.email, signupForm.password, signupForm.fullName, signupForm.referralCode);
      showMessage(result.message, 'success');
      setSignupForm({ email: '', password: '', fullName: '', confirmPassword: '', referralCode: '' });
    } catch (error) {
      showMessage(error.message, 'error');
    }
    
    setIsLoading(false);
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await sendMagicLinkEmail(magicLinkEmail);
      showMessage(result.message, 'success');
      setMagicLinkEmail('');
    } catch (error) {
      showMessage(error.message, 'error');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-white border-0 shadow-2xl">
        <div className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Welcome to GatorConnect
            </DialogTitle>
            <p className="text-center text-blue-100 mt-2">
              Your gateway to the Gator professional network
            </p>
          </DialogHeader>
        </div>

        <div className="p-6">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <Alert className={`${
                  messageType === 'error' ? 'border-red-200 bg-red-50' : 
                  messageType === 'success' ? 'border-green-200 bg-green-50' : 
                  'border-blue-200 bg-blue-50'
                }`}>
                  {messageType === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                   messageType === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                   <Mail className="h-4 w-4 text-blue-600" />}
                  <AlertDescription className={`${
                    messageType === 'error' ? 'text-red-800' : 
                    messageType === 'success' ? 'text-green-800' : 
                    'text-blue-800'
                  }`}>
                    {message}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login" className="text-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              <TabsTrigger value="magic" className="text-sm">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@ufl.edu"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[var(--uf-blue)] hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-name"
                      placeholder="Your Full Name"
                      value={signupForm.fullName}
                      onChange={(e) => setSignupForm({...signupForm, fullName: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@ufl.edu"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (6+ characters)"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-referral">Referral Code (optional)</Label>
                  <Input
                    id="signup-referral"
                    placeholder="e.g., GATOR-JOHN"
                    value={signupForm.referralCode}
                    onChange={(e) => setSignupForm({...signupForm, referralCode: e.target.value.toUpperCase()})}
                  />
                  <p className="text-xs text-slate-500">Got a code from a friend or ambassador? Enter it here!</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[var(--uf-orange)] hover:bg-orange-600" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="text-center mb-4">
                  <Zap className="h-8 w-8 text-[var(--uf-orange)] mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Enter your email and we'll send you a secure login link
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="your.email@ufl.edu"
                      value={magicLinkEmail}
                      onChange={(e) => setMagicLinkEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] hover:opacity-90" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Link...' : 'Send Magic Link'}
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}