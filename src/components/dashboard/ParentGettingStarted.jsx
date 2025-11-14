
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Users, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { trackEvent } from '@/components/utils/analytics';
import InviteStudentModal from './InviteStudentModal';

function firstNameOf(fullName) {
  if (!fullName) return 'Parent';
  return fullName.trim().split(/\s+/)[0];
}

export default function ParentGettingStarted() {
  const { user } = useAuth();
  // Changed completedSteps to a Set based on outline
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);

  const firstName = firstNameOf(user?.full_name);

  // Helper to calculate profile completion, existing function
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    
    let score = 20; // Base score for having an account
    
    if (user.full_name) score += 15;
    if (user.bio) score += 20;
    if (user.current_company) score += 15;
    if (user.current_position) score += 15;
    if (user.linkedin_url) score += 15;
    
    return Math.min(100, score);
  };

  useEffect(() => {
    const initiallyCompleted = new Set();

    // Profile completion based on existing calculateProfileCompletion logic
    if (calculateProfileCompletion() >= 70) {
      initiallyCompleted.add('profile');
    }

    // Browsed requests based on new localStorage key from outline
    const hasViewedRequests = localStorage.getItem('cff_browsed_requests') === 'true';
    if (hasViewedRequests) {
      initiallyCompleted.add('browse');
    }

    // Invited student based on existing user properties
    const hasInvitedStudent = user?.student_email || user?.student_phone;
    if (hasInvitedStudent) {
      initiallyCompleted.add('invite');
    }

    setCompletedSteps(initiallyCompleted);
  }, [user]); // Re-run if user object changes

  const steps = [
    {
      id: 'profile', // Changed ID as per outline
      title: 'Complete Your Profile', // Changed title as per outline
      description: 'Add your background so students know how you can help', // Changed subtitle to description as per outline
      icon: User, // Kept Lucide icon, consistent with existing component
      isCompleted: completedSteps.has('profile'), // Check against the Set
      actionText: 'Review Your Profile', // Changed buttonText to actionText as per outline
      action: () => {
        trackEvent('getting_started_clicked', { step: 'Complete Your Profile', parentId: user?.id });
        navigate('Profile'); // Changed navigation target as per outline
      }
    },
    {
      id: 'browse', // Changed ID as per outline
      title: 'Browse Student Requests', // Changed title as per outline
      description: 'See what students are asking for and consider how you can help', // Changed subtitle to description as per outline
      icon: Users, // Kept Lucide icon, consistent with existing component
      isCompleted: completedSteps.has('browse'), // Check against the Set
      actionText: 'Browse Requests', // Changed buttonText to actionText as per outline
      action: () => {
        trackEvent('getting_started_clicked', { step: 'Browse Student Requests', parentId: user?.id });
        localStorage.setItem('cff_browsed_requests', 'true'); // New localStorage key as per outline
        setCompletedSteps(prev => new Set(prev).add('browse')); // Update state immediately
        navigate('Connections');
      }
    },
    {
      id: 'invite', // Changed ID as per outline
      title: 'Invite Your Student', // Changed title as per outline
      description: 'Send your Gator an invite so they can join the platform too', // Changed subtitle to description as per outline
      icon: UserPlus, // Kept Lucide icon, consistent with existing component
      isCompleted: completedSteps.has('invite'), // Check against the Set
      actionText: 'Send Invite', // Changed buttonText to actionText as per outline
      action: () => {
        trackEvent('getting_started_clicked', { step: 'Invite Your Student', parentId: user?.id });
        setShowInviteModal(true);
      }
    }
  ];

  const completedCount = completedSteps.size; // Use Set size for count
  const progressPercentage = (completedCount / steps.length) * 100;

  if (completedCount === steps.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center"
      >
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-green-900 mb-2">
          You're all set, {firstName}! 🎉
        </h3>
        <p className="text-green-700">
          Thanks for being part of the Gator village. Students are already benefiting from parents like you.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">
                Getting Started
              </CardTitle>
              <div className="text-sm text-slate-600 font-medium">
                {completedCount} of {steps.length} complete
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
              <motion.div
                className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      step.isCompleted // Changed from step.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <step.icon className={`w-6 h-6 ${step.isCompleted ? 'text-green-600' : 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold ${step.isCompleted ? 'text-green-900 line-through' : 'text-slate-900'}`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm mb-3 ${step.isCompleted ? 'text-green-700' : 'text-slate-600'}`}>
                        {step.description} {/* Changed from step.subtitle */}
                      </p>
                      {!step.isCompleted && (
                        <Button
                          onClick={step.action}
                          size="sm"
                          className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white"
                        >
                          {step.actionText} {/* Changed from step.buttonText */}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <InviteStudentModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        parentName={firstName}
        studentName={user?.student_name}
      />
    </>
  );
}
