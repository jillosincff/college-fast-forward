import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { GraduationCap, Heart, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { base44 } from '@/api/base44Client';

export default function GatorRoleSelection() {
  const { user, refreshUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('GatorAuth');
    }
  }, [user]);

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    trackEvent('role_selected', { role: selectedRole });

    try {
      // Check if user has @ufl.edu email
      const isUFLEmail = user?.email?.toLowerCase().endsWith('@ufl.edu');

      if (selectedRole === 'gator') {
        // Update user persona
        await base44.entities.User.updateMyUserData({
          persona: 'gator',
          roles: ['gator']
        });
        await refreshUser();

        // UFL students skip invite code
        if (isUFLEmail) {
          navigate('GatorWelcome', { role: 'gator' });
        } else {
          navigate('GatorInviteCode', { role: 'gator' });
        }
      } else if (selectedRole === 'parent') {
        // Update user persona
        await base44.entities.User.updateMyUserData({
          persona: 'parent',
          roles: ['parent']
        });
        await refreshUser();

        // Parents always need invite code
        navigate('GatorInviteCode', { role: 'parent' });
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardContent className="pt-12 pb-10 px-8">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <span className="text-4xl">🐊</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome to the Gator Network!
            </h1>
            <p className="text-slate-600">Select your role to get started</p>
          </div>

          <div className="space-y-4 mb-8">
            <button
              onClick={() => setSelectedRole('gator')}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                selectedRole === 'gator'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedRole === 'gator' ? 'bg-blue-500' : 'bg-slate-100'
                }`}>
                  <GraduationCap className={`w-6 h-6 ${
                    selectedRole === 'gator' ? 'text-white' : 'text-slate-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">
                    I'm a current UF student
                  </h3>
                  <p className="text-sm text-slate-600">
                    Find internships and job opportunities (@ufl.edu email)
                  </p>
                </div>
                {selectedRole === 'gator' && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('parent')}
              className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                selectedRole === 'parent'
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedRole === 'parent' ? 'bg-orange-500' : 'bg-slate-100'
                }`}>
                  <Heart className={`w-6 h-6 ${
                    selectedRole === 'parent' ? 'text-white' : 'text-slate-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">
                    I'm a Gator Parent or Alumni
                  </h3>
                  <p className="text-sm text-slate-600">
                    Help current students get hired — open your network
                  </p>
                </div>
                {selectedRole === 'parent' && (
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="w-full h-12 text-base font-semibold"
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

          {!selectedRole && (
            <p className="text-center text-sm text-slate-500 mt-4">
              Select your role to continue
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}