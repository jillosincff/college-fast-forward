import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, ArrowRight, Shield, Zap } from 'lucide-react';
import { User } from '@/entities/User';

export default function AuthLanding({ onClose }) {
  const handleLogin = () => {
    User.login();
  };

  const benefits = [
    {
      icon: GraduationCap,
      title: "Connect with Alumni",
      description: "Get mentorship and job referrals from UF graduates"
    },
    {
      icon: Users,
      title: "Find Roommates",
      description: "Connect with fellow Gators for housing"
    },
    {
      icon: Zap,
      title: "Boost Your Requests",
      description: "Get priority visibility for your posts"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] text-white rounded-t-2xl">
            <div className="flex justify-center mb-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1fb8da0b6_collegefastforwardlogo.png" 
                alt="College Fast Forward"
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-xl font-bold">
              Join the Gator Network
            </CardTitle>
            <p className="text-blue-100 text-sm">
              Connect with 70,000+ UF students, alumni, and parents
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-4 mb-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-[var(--uf-blue)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{benefit.title}</h3>
                    <p className="text-slate-600 text-xs">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg mb-6">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-700">
                Secure login powered by Google. We never store your password.
              </span>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleLogin}
                className="w-full bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white font-semibold py-3 rounded-xl"
              >
                Continue with Google
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <button 
                onClick={onClose}
                className="w-full text-slate-500 text-sm hover:text-slate-700 py-2"
              >
                Maybe later
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}