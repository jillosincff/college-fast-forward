import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, ArrowRight } from 'lucide-react';
import { User } from '@/entities/User';

export default function InviteAuthPrompt({ inviteToken, requestId, studentName }) {
  const handleLogin = () => {
    // Store invite info in localStorage to restore after auth
    localStorage.setItem('pending_invite', JSON.stringify({
      token: inviteToken,
      requestId: requestId,
      timestamp: Date.now()
    }));
    
    User.login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-[var(--uf-blue)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-[var(--uf-blue)]" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              You've Been Invited!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-slate-600 leading-relaxed">
              To connect with <strong>{studentName || 'this student'}</strong>, please join College Fast Forward—it only takes 2 minutes.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="w-full bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Join & Help Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                onClick={handleLogin}
                variant="outline" 
                size="lg" 
                className="w-full border-2 border-[var(--uf-blue)] text-[var(--uf-blue)] hover:bg-[var(--uf-blue)] hover:text-white font-semibold py-3 rounded-xl transition-all"
              >
                Already have an account? Log In
              </Button>
            </div>
            
            <p className="text-xs text-slate-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}