import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Link2, ArrowRight, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentLinkBanner({ 
  linkedStudents = [], 
  onLinkStudent, 
  onRemindLater 
}) {
  const [dismissed, setDismissed] = useState(false);
  const hasLinkedStudent = linkedStudents.length > 0;
  
  // Fix name parsing - get first name properly (handles "LastName, FirstName" format)
  const getStudentFirstName = (student) => {
    if (!student) return 'Your Student';
    
    const fullName = student.full_name;
    if (!fullName?.trim()) {
      return student.email?.split('@')[0] || 'Your Student';
    }
    
    // Handle "LastName, FirstName" format
    if (fullName.includes(',')) {
      const afterComma = fullName.split(',')[1]?.trim().split(/\s+/)[0];
      if (afterComma && afterComma.length > 1) {
        return afterComma.charAt(0).toUpperCase() + afterComma.slice(1).toLowerCase();
      }
    }
    
    // Standard "FirstName LastName" format
    const firstName = fullName.trim().split(/\s+/)[0];
    if (firstName && firstName.length > 1) {
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    
    return student.email?.split('@')[0] || 'Your Student';
  };
  
  const studentName = getStudentFirstName(linkedStudents[0]);

  // Check if "remind later" was clicked recently (within 24 hours)
  const remindLaterTime = localStorage.getItem('student_link_remind_later');
  const shouldShowRemindLater = remindLaterTime && (Date.now() - parseInt(remindLaterTime)) < 24 * 60 * 60 * 1000;

  if (dismissed || shouldShowRemindLater) {
    return null;
  }

  const handleRemindLater = () => {
    localStorage.setItem('student_link_remind_later', Date.now().toString());
    setDismissed(true);
    onRemindLater?.();
  };

  if (hasLinkedStudent) {
    // SUCCESS STATE - Green banner
    return (
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black mb-1 text-white">
              ✅ Family Karma Active — {studentName}'s requests boosted!
            </h2>
            <p className="text-white/90 text-sm md:text-base mb-3">
              Every time you help a student, {studentName}'s profile rises to the top for faster answers.
            </p>
            
            {/* Visual Example */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-lg p-3 max-w-md">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded font-bold text-[10px]">⚡ BOOSTED</span>
                  <span className="text-white/90">{studentName}'s request</span>
                  <span className="text-white/60">→ Top of feed</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Normal</span>
                  <span>Other requests</span>
                  <span className="text-white/40">→ Lower visibility</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl text-center shadow-lg animate-pulse">
            <div className="text-2xl font-black">⚡ ON</div>
            <div className="text-xs font-bold">BOOST<br/>ACTIVE</div>
          </div>
        </div>
      </div>
    );
  }

  // WARNING STATE - Red/Orange banner (no linked student)
  return (
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Animated pulse effect */}
      <div className="absolute inset-0 bg-white/10 animate-pulse" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black mb-2 text-white leading-tight">
              🔗 Link Your Student to Unlock Family Karma Boosts
            </h2>
            <p className="text-white/90 text-sm md:text-base mb-4">
              <strong>Help other students → your kid's requests get pinned to the top and answered faster.</strong>
              <br />
              <span className="text-white/80">No link = no boosts for your student.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onLinkStudent}
                size="lg"
                className="bg-white text-red-600 hover:bg-white/90 font-black text-base px-6 py-3 h-auto shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Link2 className="w-5 h-5 mr-2" />
                Link Student Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                onClick={handleRemindLater}
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
              >
                <Clock className="w-4 h-4 mr-2" />
                Remind me later
              </Button>
            </div>
            
            <p className="text-xs text-white/70 mt-3">
              ⏱️ Takes 30 seconds — invite them via email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}