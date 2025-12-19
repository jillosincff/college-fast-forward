import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Message } from '@/entities/Message';
import { HelpOffer } from '@/entities/HelpOffer';
import { Intro } from '@/entities/Intro';
import { Opportunity } from '@/entities/Opportunity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Mail, 
  Loader2,
  User as UserIcon,
  HelpCircle,
  Briefcase,
  ArrowRight,
  Crown,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import ParentActivityWidget from '@/components/dashboard/parent/MyActivityWidget';
import FoundingCircleLeaderWidget from '@/components/dashboard/FoundingCircleLeaderWidget';
import { trackEvent } from '@/components/utils/analytics';
import { errorReporter } from '@/components/utils/errorReporter';
import InviteGatorModal from '@/components/dashboard/InviteGatorModal';
import AddStudentModal from '@/components/dashboard/AddStudentModal';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ParentDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [myStudents, setMyStudents] = useState([]);
  const actionCardsRef = useRef([]);
  const headlineRef = useRef(null);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Basic data load - keeping it simple
      await Promise.allSettled([
        HelpOffer.filter({ offerer_email: user.email }),
        Intro.filter({ helper_user_id: user.id }),
        Message.filter({ recipient_email: user.email }),
        Opportunity.filter({ created_by: user.email })
      ]);
      
      // Load students in family
      if (user.family_group_id) {
        const familyMembers = await base44.entities.User.filter({
          family_group_id: user.family_group_id
        });
        const students = familyMembers.filter(m => m.persona === 'gator' || m.roles?.includes('gator'));
        setMyStudents(students);
      } else if (user.student_emails && user.student_emails.length > 0) {
        // Legacy support
        const students = await Promise.all(
          user.student_emails.map(email => 
            base44.entities.User.filter({ email }).then(r => r[0])
          )
        );
        setMyStudents(students.filter(Boolean));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      errorReporter.captureException(error, {
        context: 'ParentDashboard.loadDashboardData',
        userId: user?.id
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    await loadDashboardData(true);
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (user && user.has_seen_dashboard === false) {
      const markDashboardSeen = async () => {
        try {
          const { User } = await import('@/entities/User');
          await User.updateMyUserData({ 
            has_seen_dashboard: true,
            first_login: false 
          });
          await refreshUser();
        } catch (error) {
          console.error('Failed to update dashboard state:', error);
        }
      };
      markDashboardSeen();
    }
  }, [user, refreshUser]);

  useEffect(() => {
    if (user?.id) {
      trackEvent('parent_dashboard_viewed', { userId: user.id });
    }
  }, [user?.id]);

  // GSAP scroll animations
  useEffect(() => {
    if (!loading && headlineRef.current) {
      // Animate headline
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headlineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate action cards with stagger
      actionCardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 80, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: index * 0.15,
              ease: 'back.out(1.4)',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading]);

  const getCapitalizedFirstName = (fullName) => {
    if (!fullName?.trim()) return 'Gator Parent';
    const namePart = fullName.trim().split(' ')[0];
    if (!namePart) return 'Gator Parent';
    return namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
  };
  
  const firstName = getCapitalizedFirstName(user?.full_name);

  // Search for student
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await base44.functions.invoke('searchUserForDirectory', {
        query: searchQuery,
        persona: 'gator'
      });
      setSearchResults(results.data?.users || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkStudent = async (student) => {
    try {
      await base44.functions.invoke('linkStudentsToParent', {
        studentEmailsOrNames: [student.email]
      });
      
      setShowSearchModal(false);
      toast({
        title: "Student Linked! 🎉",
        description: `${student.full_name || student.email} is now connected to your account.`
      });
      
      await refreshUser();
    } catch (error) {
      console.error('Failed to link student:', error);
      toast({
        title: "Link Failed",
        description: "Could not link student. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsSending(true);
    try {
      console.log('📧 Sending invite to:', inviteEmail);
      const result = await base44.functions.invoke('sendGatorInvites', {
        emails: [inviteEmail],
        role: 'student',
        campus: 'UF',
        note: inviteName ? `${inviteName}, join College Fast Forward!` : `Join College Fast Forward to connect with the Gator community!`
      });
      console.log('📧 Invite result:', result);
      
      toast({
        title: "Invite Sent! 🐊",
        description: `We sent an invitation to ${inviteEmail}`
      });
      
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    } catch (error) {
      console.error('Failed to send invite:', error);
      toast({
        title: "Invite Failed",
        description: "Could not send invite. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* 1. Welcome Header */}
      <div className="bg-white border-b border-slate-200 py-5 mb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-slate-900">
                  Welcome, {firstName}! 🧡💙
                </h1>
                {user?.is_founding_member && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                    <Crown className="w-3 h-3" />
                    Founder
                  </span>
                )}
              </div>
              <p className="text-slate-600">
                Your network opens doors for Gators everywhere
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Founding Circle Leader Banner */}
        {user?.is_founding_circle_lead && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-black mb-2">🎉 You're a Founding Circle Leader!</h3>
                <p className="text-orange-100">
                  Earn 25% commission + team overrides. Track your earnings and team growth.
                </p>
              </div>
              <Button
                onClick={() => navigate('ReferralAnalytics')}
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-full px-8 py-3 shadow-lg"
              >
                View Earnings Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Connect With Your Gator Card */}
        <Card className="border-2 border-slate-200 shadow-lg">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-center mb-2" style={{ color: '#0021A5' }}>
              Connect With Your Gator
            </h3>
            <p className="text-center text-slate-600 mb-6">
              Is your student already on College Fast Forward?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowSearchModal(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-full px-8 py-3 shadow-lg"
              >
                Yes — Search & Link Them
              </Button>
              <Button
                onClick={() => setShowInviteModal(true)}
                className="font-bold rounded-full px-8 py-3 shadow-lg"
                style={{ backgroundColor: '#0021A5' }}
              >
                No — Send Them an Invite
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Cards */}

        {/* 3. Main Headline */}
        <div ref={headlineRef} className="text-center">
          <h2 
            className="text-3xl md:text-4xl font-black leading-tight mb-3"
            style={{ color: '#0021A5' }}
          >
            Help More Gators, Boost Your Own Higher ⚡
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Every action you take unlocks more opportunities for your student — parents & alumni see boosted profiles first.
          </p>
        </div>

        {/* 4. Three Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Complete Profile */}
          <div 
            ref={el => actionCardsRef.current[0] = el}
            className="bg-white rounded-xl p-6 sm:p-8 text-center hover:shadow-xl transition-shadow"
            style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
          >
            <div className="text-5xl mb-4">🐊</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#0021A5' }}>
              Complete Your Parent Profile
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Add your company, industry, and LinkedIn.<br />
              <span className="font-semibold">The stronger your profile → the more your kid's profile gets boosted</span>
            </p>
            <Button
              onClick={() => navigate('ProfileEdit')}
              className="rounded-full px-6 py-2 font-bold text-sm"
              style={{ backgroundColor: '#0021A5' }}
            >
              Update Your Profile →
            </Button>
          </div>

          {/* Card 2: Answer Questions */}
          <div 
            ref={el => actionCardsRef.current[1] = el}
            className="bg-white rounded-xl p-6 sm:p-8 text-center hover:shadow-xl transition-shadow"
            style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
          >
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#0021A5' }}>
              Answer Questions & Make Intros
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              A student asks "How do I break into consulting?"<br />
              You reply → <strong>your kid's profile gets boosted</strong>
            </p>
            <Button
              onClick={() => navigate('Connections')}
              className="rounded-full px-6 py-2 font-bold text-sm"
              style={{ backgroundColor: '#0021A5' }}
            >
              See Requests & Help →
            </Button>
          </div>

          {/* Card 3: Post Jobs */}
          <div 
            ref={el => actionCardsRef.current[2] = el}
            className="bg-white rounded-xl p-6 sm:p-8 text-center hover:shadow-xl transition-shadow"
            style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
          >
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#0021A5' }}>
              Post Jobs & Internships
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Have an opening or know someone hiring?<br />
              Post it → <strong>your kid's profile gets boosted</strong>
            </p>
            <Button
              onClick={() => navigate('PostOpportunity')}
              className="rounded-full px-6 py-2 font-bold text-sm"
              style={{ backgroundColor: '#0021A5' }}
            >
              Post an Opportunity →
            </Button>
          </div>
        </div>



        {/* 5. Messages & Activity - Full Width */}
        <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}>
          <ParentActivityWidget />
        </div>

        {/* 6. Recent Activity Feed */}
        <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: '#0021A5' }}>
            Your Recent Activity
          </h3>
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🌟</div>
            <p className="text-slate-600 mb-4">
              Your help offers to students will show here
            </p>
            <Button 
              onClick={() => navigate('Connections')} 
              className="rounded-full px-6"
              style={{ backgroundColor: '#FA4616' }}
            >
              Start by answering a student's help request →
            </Button>
          </div>
        </div>

        {/* 7. Ambassador CTA */}
        <div className="text-center py-6">
          <p className="text-lg text-slate-600 mb-4">
            Want to earn money while helping more Gators?
          </p>
          <Button
            onClick={() => navigate('UFAmbassador')}
            size="lg"
            className="h-14 px-10 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            style={{ backgroundColor: '#0021A5' }}
          >
            Yes – Make Me a Campus Ambassador
          </Button>
          {!user?.is_founding_circle_lead && (
            <p className="mt-4 text-slate-500">
              Founding Circle tier (25% + override)?{' '}
              <Button 
                variant="link"
                onClick={() => navigate('UFAmbassador')}
                className="text-[#FA4616] hover:underline font-medium p-0 h-auto"
              >
                Apply here →
              </Button>
            </p>
          )}
        </div>

      </div>

      {/* Search Modal */}
      <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#0021A5' }}>Search for Your Gator</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student's Email or Name</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="john.doe@ufl.edu or John Doe"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Results</Label>
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{student.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                    <Button size="sm" onClick={() => handleLinkStudent(student)}>
                      Link
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-4 text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p>No students found. Try a different search or send them an invite.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setShowSearchModal(false);
                    setShowInviteModal(true);
                  }}
                >
                  Send an Invite Instead
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#FA4616' }}>Invite My Child to Join</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Student's Name (optional)</Label>
              <Input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Student's Email *</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="john.doe@ufl.edu"
                type="email"
                className="mt-2"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                🐊 We'll send them a secure invite to join the Gator Network. 
                Once they sign up, your profiles link automatically and their profile gets boosted!
              </p>
            </div>

            <Button
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || isSending}
              className="w-full"
              style={{ backgroundColor: '#FA4616' }}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSuccess={async () => {
          await refreshUser();
          await loadDashboardData(true);
        }}
      />
    </div>
  );
}