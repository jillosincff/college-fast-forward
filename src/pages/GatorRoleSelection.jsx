import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { GraduationCap, Heart, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';

export default function GatorRoleSelection() {
  const { user, refreshUser, isLoading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('✅ [GatorRoleSelection] User authenticated:', user.email);
    } else if (!authLoading) {
      const timer = setTimeout(() => {
        console.log('⏱️ [GatorRoleSelection] Auth timeout - no user after 10s');
        setAuthTimeout(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading]);

  if (authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 px-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Error</h2>
            <p className="text-slate-600 mb-6">We couldn't complete your sign-in. Please try again.</p>
            <Button onClick={() => navigate('GatorAuth')} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContinue = async () => {
    if (!selectedRole) {
      console.log('⚠️ No role selected');
      return;
    }
    
    setIsLoading(true);
    console.log('👤 [GatorRoleSelection] Role selected:', selectedRole);
    trackEvent('role_selected', { role: selectedRole });

    try {
      if (selectedRole === 'gator') {
        console.log('🐊 [GatorRoleSelection] Student selected -> GatorStudentEmail');
        navigate('GatorStudentEmail');
      } else if (selectedRole === 'parent') {
        console.log('❤️ [GatorRoleSelection] Parent selected -> GatorParentInvite');
        sessionStorage.setItem('pending_invite_role', 'parent');
        navigate('GatorParentInvite');
      }
    } catch (error) {
      console.error('❌ [GatorRoleSelection] Error:', error);
      alert('Error. Please try again.');
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Completing sign-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Welcome to the Gator Network!
            </h1>
            <p className="text-slate-600 text-lg">Select your role to get started</p>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => setSelectedRole('gator')}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                selectedRole === 'gator'
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-7 h-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    I'm a Gator student
                  </h3>
                  <p className="text-sm text-slate-600">
                    Find Jobs, Internships & Post Grad roommates
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                  selectedRole === 'gator'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-300 bg-white'
                }`}>
                  {selectedRole === 'gator' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('parent')}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                selectedRole === 'parent'
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 mb-1">
                    I'm a Gator parent or alumni
                  </h3>
                  <p className="text-sm text-slate-600">
                    Help Gators get hired — open your network
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                  selectedRole === 'parent'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-slate-300 bg-white'
                }`}>
                  {selectedRole === 'parent' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className={`w-full h-14 text-base font-semibold ${
              !selectedRole ? 'bg-slate-300 hover:bg-slate-300 cursor-not-allowed' : ''
            }`}
            style={{ 
              backgroundColor: selectedRole ? (selectedRole === 'gator' ? '#0021A5' : '#FA4616') : undefined 
            }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-slate-500 mt-4">
            Select your role to continue
          </p>
        </CardContent>
      </Card>
    </div>
  );
}