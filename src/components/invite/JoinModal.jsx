import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, UserPlus, GraduationCap, ArrowLeft } from "lucide-react";
import RequestInviteForm from './RequestInviteForm';
import EnterCodeForm from './EnterCodeForm';
import { navigate } from '@/components/utils/navigation';

export default function JoinModal({ open, onOpenChange }) {
  const [view, setView] = useState('options'); // 'options', 'code', 'request'

  const handleStudentClick = () => {
    // Students go directly to GatorAuth (will use @ufl.edu email)
    onOpenChange(false);
    navigate('GatorAuth');
  };

  const handleCodeSuccess = () => {
    onOpenChange(false);
    navigate('GatorAuth');
  };

  const handleRequestSuccess = () => {
    // Stay on success message, user will close modal
  };

  const renderContent = () => {
    switch (view) {
      case 'code':
        return (
          <>
            <DialogHeader>
              <button
                onClick={() => setView('options')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <DialogTitle className="text-xl font-bold">Enter Invite Code</DialogTitle>
            </DialogHeader>
            <EnterCodeForm onSuccess={handleCodeSuccess} />
          </>
        );

      case 'request':
        return (
          <>
            <DialogHeader>
              <button
                onClick={() => setView('options')}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <DialogTitle className="text-xl font-bold">Request an Invite</DialogTitle>
            </DialogHeader>
            <RequestInviteForm onSuccess={handleRequestSuccess} />
          </>
        );

      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Join College Fast Forward
              </DialogTitle>
              <p className="text-slate-600 text-center">
                How would you like to join?
              </p>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              {/* UF Student option */}
              <button
                onClick={handleStudentClick}
                className="w-full p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">I'm a UF Student</div>
                    <div className="text-sm text-slate-600">
                      Sign in with your @ufl.edu email — no code needed
                    </div>
                  </div>
                </div>
              </button>

              {/* Enter Code option */}
              <button
                onClick={() => setView('code')}
                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200">
                    <Key className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">I Have an Invite Code</div>
                    <div className="text-sm text-slate-600">
                      Enter your code to join
                    </div>
                  </div>
                </div>
              </button>

              {/* Request Invite option */}
              <button
                onClick={() => setView('request')}
                className="w-full p-4 rounded-xl border-2 border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Request an Invite</div>
                    <div className="text-sm text-slate-600">
                      Parents & Alumni — request access
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}