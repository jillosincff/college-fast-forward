import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from './components/theme/ThemeContext';
import { Button as ShadButton } from '@/components/ui/button';
import { LayoutDashboard, Briefcase, Users, MessageSquare, LogOut, User as UserIcon, FileText, Menu, Bell, TestTube, Mail, ArrowLeft, Trash2, Zap } from 'lucide-react';
import UserAvatar from './components/common/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { navigate } from '@/components/utils/navigation';
import './globals.css';
import AppErrorBoundary from './components/common/AppErrorBoundary';
import { base44 } from '@/api/base44Client';
import logger from './components/utils/logger';
import { Message } from '@/entities/Message';
import { PayItForwardNotification } from '@/entities/PayItForwardNotification';
import NotificationBell from './components/notifications/NotificationBell';
import { perfMonitor, reportWebVitals } from './components/utils/performanceMonitor';
import { errorReporter } from './components/utils/errorReporter';
import ErrorLogger from './components/debug/ErrorLogger';
import MobileBottomNav from './components/navigation/MobileBottomNav';
import AccountDeletionModal from './components/profile/AccountDeletionModal';
import { AnimatePresence, motion } from 'framer-motion';
import PullToRefresh from './components/common/PullToRefresh';

const childPages = [
  'QuestionDetail', 'ProfileEdit', 'MessageComposer', 'PostRequest', 'PostOpportunity',
  'CompanyProfile', 'PublicProfile', 'SubmitFeedback', 'Notifications', 'MyMatches', 'FollowedCompanies', 'ActionPlanTracker', 'ResumeTailoring', 'MockInterview', 'LinkedInReview', 'ApplicationBoost'
];

const childPageTitles = {
  QuestionDetail: 'Question',
  ProfileEdit: 'Edit Profile',
  MessageComposer: 'New Message',
  PostRequest: 'Post Request',
  PostOpportunity: 'Post Opportunity',
  CompanyProfile: 'Company',
  PublicProfile: 'Profile',
  SubmitFeedback: 'Feedback',
  Notifications: 'Notifications',
  MyMatches: 'My Matches',
  FollowedCompanies: 'My Companies',
  ActionPlanTracker: 'Action Plan',
  ResumeTailoring: 'Resume Tailoring',
  MockInterview: 'Mock Interview',
  LinkedInReview: 'LinkedIn Review',
  ApplicationBoost: 'Application Boost',
};

const APP_VERSION = 'v1.3.0';

/**
 * SINGLE SOURCE OF TRUTH for dashboard routing.
 * Rules:
 *   admin → AdminDashboard
 *   gator/student + FastIQ active → FastIQ
 *   gator/student + no FastIQ → FreeTierDashboard
 *   parent → ParentHome
 *   alumni + graduation_year >= 2025 (recent_grad) → RecentGradDashboard
 *   alumni + graduation_year <= 2024 (established) → AlumniDashboard
 *   alumni fallback → AlumniDashboard
 */
function getDashboardForUser(user) {
  if (!user) return 'LandingPage';
  if (user.roles?.includes('admin')) return 'AdminDashboard';

  const persona = user.persona;
  
  // Students/Gators — always use FreeTierDashboard; FastIQ features unlock via isFastIQ flag
  if (persona === 'gator' || persona === 'student') {
    return 'FreeTierDashboard';
  }
  
  if (persona === 'parent') return 'ParentHome';
  if (persona === 'alumni') {
    if (user.alumni_seniority === 'recent_grad') return 'RecentGradDashboard';
    return 'AlumniDashboard';
  }
  
  // Fallback: check roles array
  if (user.roles?.includes('parent')) return 'ParentHome';
  if (user.roles?.includes('gator')) {
    return 'FreeTierDashboard';
  }
  if (user.roles?.includes('alumni')) return 'AlumniDashboard';
  return 'FreeTierDashboard';
}

function handleCacheBusting() {
  try {
    const currentVersion = localStorage.getItem('cff_app_version');
    if (currentVersion && currentVersion !== APP_VERSION) {
      console.log('🔄 Updating app from version', currentVersion, 'to', APP_VERSION);
      const keysToRemove = ['cff_app_version','cff:firstLogin','cff:seenDashboardTour','pending_verification_email'];
      keysToRemove.forEach(key => { try { localStorage.removeItem(key); } catch (e) {} });
      try { document.cookie = 'cff_new_user=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch (e) {}
      localStorage.setItem('cff_app_version', APP_VERSION);
      window.location.reload(true);
      return true;
    } else if (!currentVersion) {
      localStorage.setItem('cff_app_version', APP_VERSION);
    }
  } catch (error) { console.warn('Cache busting unavailable:', error); }
  return false;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin text-[#0033A0]"></div>
    </div>
  );
}

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
// Connections (Ask the Network) removed
const Profile = React.lazy(() => import('./pages/Profile'));
const ProfileEdit = React.lazy(() => import('./pages/ProfileEdit'));
const WelcomeRole = React.lazy(() => import('./pages/WelcomeRole'));
const StudentOnboarding = React.lazy(() => import('./pages/StudentOnboarding'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const AlumniOnboarding = React.lazy(() => import('./pages/AlumniOnboarding'));
const ParentOnboarding = React.lazy(() => import('./pages/ParentOnboarding'));
const ShareExpertise = React.lazy(() => import('./pages/ShareExpertise'));
const PostOpportunity = React.lazy(() => import('./pages/PostOpportunity'));
const PostRequest = React.lazy(() => import('./pages/PostRequest'));
// ParentDashboard removed — parents now go to ParentHome
const ParentHome = React.lazy(() => import('./pages/ParentHome'));
const AlumniDashboard = React.lazy(() => import('./pages/AlumniDashboard'));
const GatorDirectory = React.lazy(() => import('./pages/GatorDirectory'));
const MyRequests = React.lazy(() => import('./pages/MyRequests'));
// MyImpact removed
const MyApplications = React.lazy(() => import('./pages/MyApplications'));
const MyMessages = React.lazy(() => import('./pages/MyMessages'));
const MessageComposer = React.lazy(() => import('./pages/MessageComposer'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
import TestingDashboard from './pages/TestingDashboard';
const AdminSetup = React.lazy(() => import('./pages/AdminSetup'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const CookiePolicy = React.lazy(() => import('./pages/CookiePolicy'));
const CompanyProfile = React.lazy(() => import('./pages/CompanyProfile'));
const PublicProfile = React.lazy(() => import('./pages/PublicProfile'));
const QuestionDetail = React.lazy(() => import('./pages/QuestionDetail'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const MyMatches = React.lazy(() => import('./pages/MyMatches'));
const GatorAuth = React.lazy(() => import('./pages/GatorAuth'));
const GatorInviteCode = React.lazy(() => import('./pages/GatorInviteCode'));
const GatorWelcome = React.lazy(() => import('./pages/GatorWelcome'));
const GatorParentInvite = React.lazy(() => import('./pages/GatorParentInvite'));
const ReferralAnswer = React.lazy(() => import('./pages/ReferralAnswer'));
const MatchesReview = React.lazy(() => import('./pages/MatchesReview'));
const ParentPledge = React.lazy(() => import('./pages/ParentPledge'));
const SubmitFeedback = React.lazy(() => import('./pages/SubmitFeedback'));
const FastIQ = React.lazy(() => import('./pages/FastIQ'));
const FastIQOnboarding = React.lazy(() => import('./pages/FastIQOnboarding'));
const RecentGradDashboard = React.lazy(() => import('./pages/RecentGradDashboard'));
const FollowedCompanies = React.lazy(() => import('./pages/FollowedCompanies'));
const ActionPlanTracker = React.lazy(() => import('./pages/ActionPlanTracker'));
const ResumeTailoring = React.lazy(() => import('./pages/ResumeTailoring'));
const MockInterview = React.lazy(() => import('./pages/MockInterview'));
const LinkedInReview = React.lazy(() => import('./pages/LinkedInReview'));
const CareerAssessment = React.lazy(() => import('./pages/CareerAssessment'));
const ApplicationBoost = React.lazy(() => import('./pages/ApplicationBoost'));
const StudentInvitedOnboarding = React.lazy(() => import('./pages/StudentInvitedOnboarding'));
const FreeTierDashboard = React.lazy(() => import('./pages/FreeTierDashboard'));
const FastIQDashboard = React.lazy(() => import('./pages/FastIQDashboard'));


function SimpleHeader({ currentPage, onNavigate, user, logout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [payItForwardNotifications, setPayItForwardNotifications] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isChildPage = childPages.includes(currentPage);
  const childPageTitle = childPageTitles[currentPage] || '';

  useEffect(() => {
    const publicPages = ['LandingPage', 'AdminSetup', 'Privacy', 'Terms', 'CookiePolicy', 'InviteRequired', 'RequestInvite', 'Pricing', 'PublicProfile'];
    const adminPages = ['AdminDashboard', 'TestingDashboard', 'AdminSetup'];
    if (publicPages.includes(currentPage) || adminPages.includes(currentPage)) {
      setUnreadCount(0);
      return;
    }
    if (!user?.email) { setUnreadCount(0); return; }

    let isMounted = true;
    const loadUnreadCount = async () => {
      if (!user?.email || hasError) { if (isMounted) setUnreadCount(0); return; }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        let messages = [];
        try {
          messages = await Message.filter({ recipient_email: user.email, is_read: false }, undefined, 5, { signal: controller.signal });
        } catch (fetchError) {
          messages = [];
          if (isMounted) { setHasError(true); setUnreadCount(0); }
          clearTimeout(timeoutId);
          return;
        } finally { clearTimeout(timeoutId); }
        if (isMounted && messages !== undefined) {
          setUnreadCount(messages?.length || 0);
          if (hasError) setHasError(false);
        }
      } catch (error) {
        if (isMounted) { setUnreadCount(0); setHasError(true); }
      }
    };

    const initialLoadTimeout = setTimeout(() => { if (isMounted && user?.email) loadUnreadCount(); }, 1000);
    const interval = setInterval(() => {
      if (!hasError && user?.email && !['LandingPage','AdminSetup','Privacy','Terms','CookiePolicy','InviteRequired','RequestInvite','Pricing','PublicProfile','AdminDashboard','TestingDashboard'].includes(currentPage))
        loadUnreadCount();
    }, 300000);
    return () => { isMounted = false; clearTimeout(initialLoadTimeout); clearInterval(interval); };
  }, [user?.email, hasError, currentPage]);

  const loadRecentMessages = async () => {
    const skipPages = ['LandingPage','AdminSetup','Privacy','Terms','CookiePolicy','InviteRequired','RequestInvite','Pricing','PublicProfile','AdminDashboard','TestingDashboard'];
    if (!user?.email || loadingMessages || skipPages.includes(currentPage)) return;
    setLoadingMessages(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      let messages = [];
      let pifNotifications = [];
      try {
        messages = await Message.filter({ recipient_email: user.email }, '-created_date', 5, { signal: controller.signal });
        if (user.persona === 'parent' || user.roles?.includes('parent')) {
          pifNotifications = await PayItForwardNotification.filter({ recipient_parent_email: user.email, is_read: false }, '-created_date', 3);
        }
      } catch { messages = []; pifNotifications = []; } finally { clearTimeout(timeoutId); }
      setRecentMessages(messages || []);
      setPayItForwardNotifications(pifNotifications || []);
    } catch { setRecentMessages([]); setPayItForwardNotifications([]); } finally { setLoadingMessages(false); }
  };

  const handleBellClick = () => {
    if (currentPage === 'MyMessages') document.dispatchEvent(new CustomEvent('cff:refresh-messages'));
    else onNavigate('MyMessages');
  };

  const markAsRead = async (messageId) => {
    try {
      await Message.update(messageId, { is_read: true });
      setRecentMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) { console.error('Failed to mark message as read:', error); }
  };

  const markPIFAsRead = async (notifId) => {
    try {
      await PayItForwardNotification.update(notifId, { is_read: true });
      setPayItForwardNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (error) { console.error('Failed to mark PIF notification as read:', error); }
  };

  // Determine effective alumni sub-type for nav filtering
  const isEstablishedAlumni = user?.persona === 'alumni' && user?.alumni_seniority !== 'recent_grad';
  const isRecentGradAlumniNav = user?.persona === 'alumni' && user?.alumni_seniority === 'recent_grad';

  const allNavItems = useMemo(() => [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard, roles: ['gator', 'parent', 'alumni', 'admin'] },
    { name: 'Directory', page: 'GatorDirectory', icon: Users, roles: ['gator', 'parent', 'alumni'] },
    { name: 'Pipeline', page: 'MyApplications', icon: Briefcase, roles: ['gator'] },
    { name: 'Messages', page: 'MyMessages', icon: Mail, roles: ['gator', 'parent', 'alumni'] },
    { name: 'FASTIQ', page: 'FastIQ', icon: Zap, roles: ['gator'] },
  ], []);

  const filteredNavItems = useMemo(() => {
    if (!user) return [];
    const effectivePersona = user.email?.toLowerCase().endsWith('@ufl.edu') ? 'gator' : user.persona;
    
    // Build effective roles list including sub-types
    const effectiveRoles = new Set();
    if (effectivePersona) effectiveRoles.add(effectivePersona);
    if (user.roles) user.roles.forEach(r => effectiveRoles.add(r));
    // Add alumni sub-type roles for nav filtering
    if (isEstablishedAlumni) effectiveRoles.add('established_alumni');
    if (isRecentGradAlumniNav) effectiveRoles.add('recent_grad_alumni');
    
    return allNavItems.filter(item => {
      return item.roles.some(role => effectiveRoles.has(role));
    });
  }, [user, allNavItems, isEstablishedAlumni, isRecentGradAlumniNav]);

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center space-x-8">
              <div onClick={() => onNavigate('LandingPage')} className="flex items-center cursor-pointer">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg" alt="College Fast Forward" className="h-16 w-auto md:h-20 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 md:h-24 items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-8">
              {isChildPage ? (
                <button onClick={() => window.history.back()} className="flex md:hidden items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors" style={{ minHeight: 'auto', minWidth: 'auto' }}>
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-semibold truncate max-w-[150px]">{childPageTitle}</span>
                </button>
              ) : (
                <div onClick={() => onNavigate(user ? 'Dashboard' : 'LandingPage')} className="flex md:hidden items-center cursor-pointer">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                    alt="College Fast Forward"
                    className="h-12 w-auto object-contain"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <span style={{ display: 'none', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 15, fontWeight: 700, color: '#0d1117', letterSpacing: '-0.02em', alignItems: 'center' }}>
                    <span>C</span><span style={{ color: '#E85D20' }}>FF</span>
                  </span>
                </div>
              )}
              <div onClick={() => onNavigate(user ? 'Dashboard' : 'LandingPage')} className="hidden md:flex items-center cursor-pointer">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                  alt="College Fast Forward"
                  className="h-20 w-auto object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <span style={{ display: 'none', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 18, fontWeight: 700, color: '#0d1117', letterSpacing: '-0.02em', alignItems: 'center' }}>
                  <span>C</span><span style={{ color: '#E85D20' }}>FF</span>
                </span>
              </div>
              {user && (
                <div className="hidden md:flex space-x-1">
                  {filteredNavItems.map((item) => {
                    let targetPageForNav = item.page;
                    if (item.name === 'Dashboard') {
                      targetPageForNav = getDashboardForUser(user);
                    }
                    const isActive = currentPage === targetPageForNav;
                    return (
                      <ShadButton key={item.name} variant="ghost" onClick={() => onNavigate(targetPageForNav)}
                        className={`font-medium transition-colors duration-200 text-sm ${isActive ? 'text-blue-600 border-b-2 border-blue-600 rounded-none' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        {item.name}
                      </ShadButton>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              {user && (
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <ShadButton variant="outline" className="h-10 w-10 rounded-full p-0 border-2 border-slate-300">
                      <Menu className="h-5 w-5 text-slate-700" />
                    </ShadButton>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-4 border-b">
                        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg" alt="College Fast Forward" className="h-20 w-auto object-contain" />
                      </div>
                      <nav className="flex-grow flex flex-col p-4 space-y-1">
                        {filteredNavItems.map((item) => {
                          let targetPageForNav = item.page;
                          if (item.name === 'Dashboard') {
                            targetPageForNav = getDashboardForUser(user);
                          }
                          const Icon = item.icon;
                          const isActive = currentPage === targetPageForNav;
                          return (
                            <ShadButton key={item.name} variant="ghost" onClick={() => { onNavigate(targetPageForNav); setIsMobileMenuOpen(false); }}
                              className={`justify-start flex items-center gap-2 font-semibold transition-colors duration-200 ${isActive ? 'bg-blue-100 text-gator-blue' : 'text-ink-60 hover:bg-slate-100 hover:text-gator-blue'}`}
                            >
                              <Icon className={`h-5 w-5 transition-colors duration-200 ${isActive ? 'text-gator-blue' : 'text-ink-40 group-hover:text-gator-blue'}`} />
                              {item.name}
                            </ShadButton>
                          );
                        })}
                      </nav>
                      <div className="p-4 border-t flex flex-col space-y-1">
                        <ShadButton variant="ghost" onClick={() => { onNavigate('Profile'); setIsMobileMenuOpen(false); }} className="justify-start flex items-center gap-2 font-semibold transition-colors duration-200 text-ink-60 hover:bg-slate-100 hover:text-gator-blue">
                          <UserIcon className="mr-2 h-5 w-5 text-ink-40 group-hover:text-gator-blue" /> Profile
                        </ShadButton>
                        <ShadButton variant="ghost" onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="justify-start flex items-center gap-2 font-semibold transition-colors duration-200 text-ink-60 hover:bg-slate-100 hover:text-gator-blue">
                          <LogOut className="mr-2 h-5 w-5 text-ink-40 group-hover:text-gator-blue" /> Logout
                        </ShadButton>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {user && currentPage !== 'AdminDashboard' && currentPage !== 'TestingDashboard' && currentPage !== 'AdminSetup' && !hasError && (
                <Popover onOpenChange={(open) => { if (open) loadRecentMessages(); }}>
                  <PopoverTrigger asChild>
                    <ShadButton variant="ghost" className="h-9 w-9 rounded-full text-gray-600 hover:text-gray-900 hidden sm:inline-flex relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </ShadButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="border-b p-4">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      <p className="text-xs text-gray-500 mt-1">{unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages'}</p>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {loadingMessages ? (
                        <div className="p-8 text-center text-gray-500"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>Loading...</div>
                      ) : (recentMessages.length > 0 || payItForwardNotifications.length > 0) ? (
                        <div className="divide-y">
                          {payItForwardNotifications.map((notif) => (
                            <div key={`pif-${notif.id}`} className="p-4 hover:bg-orange-50 cursor-pointer transition-colors bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-orange-400" onClick={() => { markPIFAsRead(notif.id); onNavigate('MyMessages'); }}>
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">❤️</div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-orange-800">Good news! {notif.student_name || 'Your Gator'} was just helped</p>
                                  <p className="text-xs text-gray-600 mt-1">{notif.helper_parent_name || 'A Gator Parent'} reached out to help. Pay it forward?</p>
                                  <p className="text-xs text-orange-600 font-medium mt-2">🐊 Help another Gator →</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {recentMessages.map((msg) => (
                            <div key={msg.id} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!msg.is_read ? 'bg-blue-50' : ''}`} onClick={() => { if (!msg.is_read) markAsRead(msg.id); handleBellClick(); }}>
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm truncate">{msg.subject}</p>
                                    {!msg.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>}
                                  </div>
                                  <p className="text-xs text-gray-600 truncate">From: {msg.sender_email}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(msg.created_date).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500"><Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-sm">No messages yet</p></div>
                      )}
                    </div>
                    {recentMessages.length > 0 && (
                      <div className="border-t p-3">
                        <ShadButton variant="ghost" className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={handleBellClick}>View All Messages</ShadButton>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              )}

              {user && currentPage !== 'AdminDashboard' && currentPage !== 'TestingDashboard' && currentPage !== 'AdminSetup' && (
                <NotificationBell user={user} />
              )}

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ShadButton variant="outline" className="h-12 px-3 gap-2 rounded-full border-2 border-[#0021A5] hover:border-[#FA4616] hover:bg-slate-50 transition-all shadow-lg">
                      <UserAvatar user={user} className="h-9 w-9" showFallback={true} />
                      <span className="hidden sm:inline-flex text-sm font-semibold">Menu</span>
                    </ShadButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user?.full_name || user?.email || 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('Profile')}><UserIcon className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('MyApplications')}><FileText className="mr-2 h-4 w-4" />My Pipeline</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('MyRequests')}><FileText className="mr-2 h-4 w-4" />My Requests</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('MyMessages')}><MessageSquare className="mr-2 h-4 w-4" />My Messages</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('AdminSetup')} className="text-orange-600 focus:bg-orange-50 focus:text-orange-700"><UserIcon className="mr-2 h-4 w-4" />Admin Setup</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('AdminDashboard')} className="text-purple-600 focus:bg-purple-50 focus:text-purple-700"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Dashboard</DropdownMenuItem>
                    {user?.roles?.includes('admin') && (
                      <DropdownMenuItem onClick={() => onNavigate('TestingDashboard')} className="text-blue-600 focus:bg-blue-50 focus:text-blue-700"><TestTube className="mr-2 h-4 w-4" />Testing Dashboard</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700"><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="text-red-600 focus:bg-red-50 focus:text-red-700"><Trash2 className="mr-2 h-4 w-4" />Delete Account</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>
      {showDeleteModal && <AccountDeletionModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />}
    </>
  );
}

const onboardingPages = ['StudentOnboarding', 'StudentInvitedOnboarding', 'Onboarding', 'AlumniOnboarding', 'ParentOnboarding', 'ShareExpertise', 'ParentPledge'];
const newUserFlowPages = ['GatorAuth', 'GatorRoleSelection', 'GatorInviteCode', 'GatorWelcome', 'GatorParentInvite', 'WelcomeRole', 'RequestInvite', 'InviteRequired', 'MatchesReview', 'StudentInvitedOnboarding', 'StudentOnboarding'];
const hideFooterPages = ['GatorAuth', 'GatorRoleSelection', 'GatorInviteCode', 'GatorWelcome', 'GatorParentInvite', 'WelcomeRole', 'StudentOnboarding', 'StudentInvitedOnboarding', 'Onboarding', 'AlumniOnboarding', 'ParentOnboarding', 'ShareExpertise', 'ParentPledge', 'MockInterview', 'LinkedInReview', 'ApplicationBoost', 'RecentGradDashboard', 'AlumniDashboard', 'FastIQOnboarding', 'ParentHome', 'FreeTierDashboard'];
const bottomNavPages = ['Dashboard', 'Profile', 'ParentHome', 'AlumniDashboard', 'RecentGradDashboard', 'GatorDirectory', 'MyMessages', 'MyRequests', 'MyApplications', 'Profile', 'ProfileEdit', 'PostRequest', 'PostOpportunity', 'QuestionDetail', 'MessageComposer', 'CompanyProfile', 'PublicProfile', 'Notifications', 'MyMatches', 'FastIQ', 'FollowedCompanies', 'ActionPlanTracker', 'ResumeTailoring', 'MockInterview', 'LinkedInReview', 'ApplicationBoost'];
const publicPages = ['Privacy', 'Terms', 'CookiePolicy', 'PublicProfile'];
const authOnlyPages = ['CompanyProfile', 'PublicProfile', 'PreAuth', 'QuestionDetail', 'StudentInvitedOnboarding'];

const isUserVerified = (user) => {
  if (!user) return false;
  if (user.roles?.includes('admin')) return true;
  if (typeof window !== 'undefined' && sessionStorage.getItem('pending_invite_code')) return true;
  if (user.persona === 'parent' || user.roles?.includes('parent')) return true;
  if (user.persona === 'gator' || user.roles?.includes('gator')) return true;
  if (user.persona === 'student' || user.persona === 'alumni') return true;
  return false;
};

const getPageComponent = (pageName) => {
  switch (pageName) {
    case 'Dashboard': return Dashboard;
    case 'ParentDashboard': return ParentHome;
    case 'ParentHome': return ParentHome;
    case 'AlumniDashboard': return AlumniDashboard;
    case 'RecentGradDashboard': return RecentGradDashboard;
    case 'AdminDashboard': return AdminDashboard;
    case 'CompanyProfile': return CompanyProfile;
    case 'Opportunities': return MyApplications;
    case 'PostOpportunity': return PostOpportunity;
    case 'PostRequest': return PostRequest;
    case 'Profile': return Profile;
    case 'ProfileEdit': return ProfileEdit;
    case 'WelcomeRole': return WelcomeRole;
    case 'StudentOnboarding': return StudentOnboarding;
    case 'Onboarding': return Onboarding;
    case 'AlumniOnboarding': return AlumniOnboarding;
    case 'ParentOnboarding': return ParentOnboarding;
    case 'ShareExpertise': return ShareExpertise;
    case 'GatorDirectory': return GatorDirectory;
    case 'MyRequests': return MyRequests;
    case 'MyApplications': return MyApplications;
    case 'MyMessages': return MyMessages;
    case 'MessageComposer': return MessageComposer;
    case 'TestingDashboard': return TestingDashboard;
    case 'AdminSetup': return AdminSetup;
    case 'Privacy': return Privacy;
    case 'Terms': return Terms;
    case 'CookiePolicy': return CookiePolicy;
    case 'PublicProfile': return PublicProfile;
    case 'QuestionDetail': return QuestionDetail;
    case 'InviteRequired': return React.lazy(() => import('./pages/InviteRequired'));
    case 'RequestInvite': return React.lazy(() => import('./pages/RequestInvite'));
    case 'Notifications': return Notifications;
    case 'MyMatches': return MyMatches;
    case 'GatorAuth': return GatorAuth;
    case 'GatorInviteCode': return GatorInviteCode;
    case 'GatorWelcome': return GatorWelcome;
    case 'GatorParentInvite': return GatorParentInvite;
    case 'ReferralAnswer': return ReferralAnswer;
    case 'MatchesReview': return MatchesReview;
    case 'Insights': return Dashboard;
    case 'ParentPledge': return ParentPledge;
    case 'SubmitFeedback': return SubmitFeedback;
    case 'FastIQ': return FastIQ;
    case 'FastIQOnboarding': return FastIQOnboarding;
    case 'FollowedCompanies': return FollowedCompanies;
    case 'ActionPlanTracker': return ActionPlanTracker;
    case 'ResumeTailoring': return ResumeTailoring;
    case 'MockInterview': return MockInterview;
    case 'LinkedInReview': return LinkedInReview;
    case 'CareerAssessment': return CareerAssessment;
    case 'ApplicationBoost': return ApplicationBoost;
    case 'StudentInvitedOnboarding': return StudentInvitedOnboarding;
    case 'FreeTierDashboard': return FreeTierDashboard;
    case 'FastIQDashboard': return FastIQDashboard;
    case 'OutreachDrafts': return React.lazy(() => import('./pages/OutreachDrafts'));
    case 'ParentWelcome': return React.lazy(() => import('./pages/ParentWelcome'));
    default: return LandingPage;
  }
};

function trackEmailClickthrough(user) {
  try {
    if (!user?.email) return;
    const urlParams = new URLSearchParams(window.location.search);
    const hashPart = window.location.hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashPart);
    const utmSource = urlParams.get('utm_source') || hashParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign') || hashParams.get('utm_campaign');
    if (!utmSource) return;
    const emailSources = ['daily_digest', 'reengagement', 'answer_notification', 'weekly_digest', 'fastiq_unanswered_trigger'];
    if (!emailSources.includes(utmSource)) return;
    if (sessionStorage.getItem('email_click_tracked')) return;
    sessionStorage.setItem('email_click_tracked', 'true');
    import('@/functions/trackEmailClick').then(({ trackEmailClick }) => {
      trackEmailClick({ utm_source: utmSource, utm_campaign: utmCampaign || '', page: window.location.hash }).catch(() => {});
    }).catch(() => {});
  } catch {}
}

function captureUTMParams(user) {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hashPart = window.location.hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashPart);
    const utmSource = urlParams.get('utm_source') || hashParams.get('utm_source');
    if (utmSource !== 'newsletter') return;
    if (sessionStorage.getItem('utm_already_captured')) return;
    sessionStorage.setItem('utm_already_captured', 'true');
    const utmCampaign = urlParams.get('utm_campaign') || hashParams.get('utm_campaign') || '';
    const utmContent = urlParams.get('utm_content') || hashParams.get('utm_content') || '';
    const utmMedium = urlParams.get('utm_medium') || hashParams.get('utm_medium') || '';
    sessionStorage.setItem('utm_source', utmSource);
    if (utmCampaign) sessionStorage.setItem('utm_campaign', utmCampaign);
    if (utmContent) sessionStorage.setItem('utm_content', utmContent);
    if (utmMedium) sessionStorage.setItem('utm_medium', utmMedium);
    base44.entities.NewsletterClick.create({
      user_id: user?.id || null, user_email: user?.email || null,
      utm_source: utmSource, campaign: utmCampaign, content_clicked: utmContent,
      utm_medium: utmMedium, clicked_at: new Date().toISOString(),
    }).catch(() => {});
    const cleanHash = window.location.hash.split('?')[0] || '#LandingPage';
    window.history.replaceState(null, '', window.location.origin + '/' + cleanHash);
  } catch {}
}

const pageVariants = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
const pageTransition = { duration: 0.15, ease: 'easeInOut' };

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(null);
  const [resolvedPage, setResolvedPage] = useState(null);

  const utmCapturedRef = React.useRef(false);
  useEffect(() => { if (!utmCapturedRef.current) { utmCapturedRef.current = true; captureUTMParams(user); } }, []);

  const emailClickRef = React.useRef(false);
  useEffect(() => { if (user && !emailClickRef.current) { emailClickRef.current = true; trackEmailClickthrough(user); } }, [user]);

  useEffect(() => {
    const fullUrl = window.location.href;
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const isNewUser = urlParams.has('is_new_user');
    const stateToken = urlParams.get('state');
    const accessToken = urlParams.get('access_token');
    const hashParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : hash.replace('#', ''));
    const hashAccessToken = hashParams.get('access_token');

    if (isNewUser) {
      sessionStorage.setItem('oauth_callback_detected', 'true');
      window.history.replaceState(null, '', window.location.origin + '/#GatorAuth');
      return;
    }
    if (stateToken && stateToken.startsWith('oauth_') && accessToken) {
      sessionStorage.setItem('oauth_state_token', stateToken);
      sessionStorage.setItem('oauth_callback_detected', 'true');
      setTimeout(() => { window.location.href = window.location.origin + '/#GatorAuth'; }, 500);
      return;
    }
    if (hashAccessToken) {
      sessionStorage.setItem('oauth_callback_detected', 'true');
      return;
    }
  }, []);

  useEffect(() => {
    const handleHashChange = async () => {
      const hashFragment = window.location.hash.substring(1);
      let pageHash = hashFragment.split('?')[0] || 'LandingPage';
      if (pageHash.includes('access_token') || pageHash.includes('&')) pageHash = hashFragment.split('&')[0].split('?')[0] || 'LandingPage';
      if (pageHash.startsWith('/')) pageHash = pageHash.slice(1);
      // Aliases
      if (pageHash === 'GetStarted') pageHash = 'GatorAuth';
      if (pageHash === 'PreAuth') pageHash = 'StudentInvitedOnboarding';
      setCurrentPage(pageHash || 'LandingPage');
      setResolvedPage(null);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isLoading || !currentPage) return;

    if (sessionStorage.getItem('oauth_redirect_in_progress') === 'true') {
      const redirectStartTime = parseInt(sessionStorage.getItem('oauth_redirect_start') || '0');
      if (Date.now() - redirectStartTime < 30000) return;
      sessionStorage.removeItem('oauth_redirect_in_progress');
      sessionStorage.removeItem('oauth_redirect_start');
    }

    if (currentPage === 'GatorAuth') { setResolvedPage(currentPage); return; }

    // Admin users bypass all persona/onboarding checks
    if (user?.roles?.includes('admin')) { setResolvedPage(currentPage); return; }

    // Auth loop protection
    const oauthAttempts = parseInt(localStorage.getItem('oauth_attempt_count') || '0');
    const oauthStartTime = parseInt(localStorage.getItem('oauth_start_time') || '0');
    const timeSinceStart = Date.now() - oauthStartTime;
    if ((oauthStartTime && timeSinceStart > 30000) || oauthAttempts >= 3) {
      localStorage.removeItem('pending_invite_role'); localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_student_email'); localStorage.removeItem('pending_referral_code');
      localStorage.removeItem('oauth_attempt_count'); localStorage.removeItem('oauth_start_time');
      sessionStorage.removeItem('pending_invite_role'); sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('pending_student_email'); sessionStorage.removeItem('pending_referral_code');
      sessionStorage.removeItem('oauth_state_token'); sessionStorage.removeItem('oauth_callback_detected');
      if (oauthAttempts >= 3 && currentPage !== 'LandingPage') { navigate('LandingPage?auth_error=timeout'); return; }
    }

    if (user && !user.persona?.trim()) {
      if (newUserFlowPages.includes(currentPage) || onboardingPages.includes(currentPage)) { setResolvedPage(currentPage); return; }
      const pendingInviteRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');
      const pendingInviteCode = localStorage.getItem('pending_invite_code') || sessionStorage.getItem('pending_invite_code');
      if (pendingInviteRole && pendingInviteCode) { navigate('GatorWelcome'); return; }
      if (pendingInviteRole && !pendingInviteCode && (currentPage === 'GatorInviteCode' || currentPage === 'RequestInvite' || currentPage === 'InviteRequired')) { setResolvedPage(currentPage); return; }
      navigate('GatorAuth'); return;
    }

    if (user && user.onboarding_completed === false && user.persona) {
      if (newUserFlowPages.includes(currentPage) || onboardingPages.includes(currentPage)) { setResolvedPage(currentPage); return; }
      const onboardingDashPages = ['Dashboard', 'Profile', 'ParentHome', 'RecentGradDashboard', 'AlumniDashboard'];
      if (onboardingDashPages.includes(currentPage)) {
        const isParent = user.persona === 'parent' || user.roles?.includes('parent');
        const isAlumni = user.persona === 'alumni' || user.roles?.includes('alumni');
        if (isParent) { navigate('ParentOnboarding'); return; }
        else if (isAlumni) { navigate('AlumniOnboarding'); return; }
        else if (user.persona === 'gator' || user.roles?.includes('gator')) { navigate('StudentOnboarding'); return; }
      }
    }

    // Pledge page is part of onboarding flow only — never force returning users back to it
    // Parents who haven't taken the pledge will see a gentle nudge on their dashboard instead

    if (currentPage === 'AdminDashboard' || currentPage === 'TestingDashboard' || currentPage === 'FastIQDashboard') { setResolvedPage(currentPage); return; }

    const trulyPublicPages = ['Privacy', 'Terms', 'CookiePolicy', 'InviteRequired', 'RequestInvite', 'PublicProfile', 'AdminSetup', 'ReferralAnswer'];
    if (trulyPublicPages.includes(currentPage)) { setResolvedPage(currentPage); return; }

    if (currentPage === 'LandingPage') {
      if (user) {
        navigate(getDashboardForUser(user)); return;
      }
      setResolvedPage(currentPage); return;
    }

    if (newUserFlowPages.includes(currentPage)) {
      if (currentPage === 'GatorWelcome' && user) {
        const pendingRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');
        const pendingCode = localStorage.getItem('pending_invite_code') || sessionStorage.getItem('pending_invite_code');
        if (pendingRole === 'parent' && user.persona !== 'parent') {
          base44.auth.updateMe({ persona: 'parent', roles: ['parent'], onboarding_completed: false, invite_code_used: pendingCode || 'direct' }).catch((err) => {
            localStorage.removeItem('pending_invite_code'); localStorage.removeItem('pending_invite_role');
            sessionStorage.removeItem('pending_invite_code'); sessionStorage.removeItem('pending_invite_role');
          });
        }
      }
      setResolvedPage(currentPage); return;
    }

    if (onboardingPages.includes(currentPage)) { setResolvedPage(currentPage); return; }

    if (!user) {
      if (authOnlyPages.includes(currentPage)) { setResolvedPage(currentPage); return; }
      navigate('LandingPage'); return;
    }

    const hasNoRole = !user.persona && (!user.roles || user.roles.length === 0);
    const effectiveRole = user.persona || (user.roles?.length > 0 ? user.roles[0] : null);
    const needsOnboarding = user.onboarding_completed === false && !hasNoRole;
    const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');
    const pendingRole = localStorage.getItem('pending_invite_role') || sessionStorage.getItem('pending_invite_role');
    const inNewUserFlow = pendingRole && hasNoRole;

    const dashboardPages = ['Dashboard', 'Profile', 'ParentHome', 'RecentGradDashboard', 'AlumniDashboard', 'FreeTierDashboard', 'FastIQ'];
    if (user && dashboardPages.includes(currentPage)) {
      let destination = currentPage;

      if (inNewUserFlow) { destination = 'GatorWelcome'; }
      else if (pendingRole === 'gator' && isUFLStudent && hasNoRole) { destination = 'GatorWelcome'; }
      else if (hasNoRole && !pendingRole) { destination = 'GatorAuth'; }
      else if (needsOnboarding) {
        const isParentRole = effectiveRole === 'parent' || user.roles?.includes('parent');
        const isGatorRole = effectiveRole === 'gator' || user.roles?.includes('gator');
        if (isGatorRole && !isParentRole) destination = 'StudentOnboarding';
        else if (effectiveRole === 'parent' || user.roles?.includes('parent')) destination = 'ParentOnboarding';
        else if (effectiveRole === 'alumni' || user.roles?.includes('alumni')) destination = 'AlumniOnboarding';
        else destination = 'GatorAuth';
      } else {
        destination = getDashboardForUser(user);
      }

      if (destination !== currentPage) { navigate(destination); return; }
    }

    if (!hasNoRole && !needsOnboarding) { setResolvedPage(currentPage); return; }

    if (newUserFlowPages.includes(currentPage)) { setResolvedPage(currentPage); return; }

    if (inNewUserFlow || (hasNoRole && pendingRole === 'gator' && isUFLStudent)) { navigate('GatorWelcome'); }
    else if (hasNoRole && !pendingRole) { navigate('GatorAuth'); }
    else if (needsOnboarding && user.onboarding_completed === false) {
      const isParent = user.persona === 'parent' || user.roles?.includes('parent');
      const isAlumni = user.persona === 'alumni' || user.roles?.includes('alumni');
      let onboardingPage = 'StudentOnboarding';
      if (isParent) onboardingPage = 'ParentOnboarding';
      else if (isAlumni) onboardingPage = 'AlumniOnboarding';
      navigate(onboardingPage);
    } else {
      setResolvedPage(currentPage);
    }
  }, [user, isLoading, currentPage]);

  const handleGlobalRefresh = React.useCallback(async () => {
    document.dispatchEvent(new CustomEvent('cff:pull-refresh'));
    await new Promise(r => setTimeout(r, 600));
  }, []);

  if (!resolvedPage) return <PageLoader />;

  const PageComponent = getPageComponent(resolvedPage);

  // Pages where certain users have their own nav (hide the global header)
  // Pages where specific personas render their own nav bar — hide global header
  const studentOwnNavPages = ['Dashboard', 'Profile', 'MyApplications', 'MyRequests', 'MyMessages', 'FastIQ', 'RecentGradDashboard', 'FreeTierDashboard'];
  const parentOwnNavPages = ['Profile', 'ParentHome'];
  const isStudentUser = user?.persona === 'gator' || user?.email?.toLowerCase().endsWith('@ufl.edu');
  const isRecentGradAlumni = user?.persona === 'alumni' && user?.alumni_seniority === 'recent_grad';
  const isEstablishedAlumniUser = user?.persona === 'alumni' && user?.alumni_seniority !== 'recent_grad';
  const isParentUser = user?.persona === 'parent' || user?.roles?.includes('parent');
  const hasOwnNav =
    ((isStudentUser || isRecentGradAlumni) && studentOwnNavPages.includes(resolvedPage)) ||
    (isEstablishedAlumniUser && resolvedPage === 'AlumniDashboard') ||
    (isParentUser && parentOwnNavPages.includes(resolvedPage));

  const showHeader = user &&
    resolvedPage !== 'LandingPage' &&
    resolvedPage !== 'AdminSetup' &&
    !onboardingPages.includes(resolvedPage) &&
    !newUserFlowPages.includes(resolvedPage) &&
    !hasOwnNav;

  const showBottomNav = user && bottomNavPages.includes(resolvedPage);

  const pullRefreshPages = ['Dashboard', 'Profile', 'ParentHome', 'AlumniDashboard', 'RecentGradDashboard', 'GatorDirectory', 'MyMessages', 'MyRequests', 'MyApplications', 'Notifications'];
  const supportsPullRefresh = pullRefreshPages.includes(resolvedPage);

  return (
    <AppErrorBoundary name="MainApp">
      <div className="min-h-screen flex flex-col bg-surface-subtle text-ink">
        {showHeader && (
          <AppErrorBoundary name="Header">
            <SimpleHeader currentPage={resolvedPage} onNavigate={navigate} user={user} logout={logout} />
          </AppErrorBoundary>
        )}
        <main className={`flex-grow ${showBottomNav ? 'pb-16 md:pb-0' : ''}`}>
          {supportsPullRefresh ? (
            <PullToRefresh onRefresh={handleGlobalRefresh}>
              <AnimatePresence mode="wait">
                <motion.div key={resolvedPage} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                  <AppErrorBoundary name={`Page-${resolvedPage}`}>
                    <Suspense fallback={<PageLoader />}><PageComponent /></Suspense>
                  </AppErrorBoundary>
                </motion.div>
              </AnimatePresence>
            </PullToRefresh>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={resolvedPage} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
                <AppErrorBoundary name={`Page-${resolvedPage}`}>
                  <Suspense fallback={<PageLoader />}><PageComponent /></Suspense>
                </AppErrorBoundary>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
        {showBottomNav && <MobileBottomNav user={user} currentPage={resolvedPage} />}
        {resolvedPage !== 'LandingPage' && !hideFooterPages.includes(resolvedPage) && (
          <footer className="bg-slate-100 border-t border-slate-200 mt-12">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} College Fast Forward. All Rights Reserved.</p>
              <div className="flex justify-center gap-4 mt-2">
                <a href="#Terms" className="hover:underline">Terms of Service</a>
                <a href="#Privacy" className="hover:underline">Privacy Policy</a>
                <a href="#CookiePolicy" className="hover:underline">Cookie Policy</a>
              </div>
            </div>
          </footer>
        )}
      </div>
    </AppErrorBoundary>
  );
}

export default function Layout() {
  useEffect(() => {
    const isReloading = handleCacheBusting();
    if (isReloading) return;
    const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('preview');
    if (isProduction) reportWebVitals();
    console.log(`🚀 College Fast Forward ${APP_VERSION} initialized`);
    perfMonitor.start('app_init'); perfMonitor.end('app_init');
    const setFavicon = () => {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/x-icon'; link.rel = 'icon';
      link.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg';
      document.getElementsByTagName('head')[0].appendChild(link);
    };
    setFavicon();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--uf-orange', '#FA4616');
    document.documentElement.style.setProperty('--uf-blue', '#0021A5');
    document.documentElement.style.setProperty('--uf-secondary-orange', '#D32737');
    document.documentElement.style.setProperty('--uf-yellow', '#F2A900');
    document.documentElement.style.setProperty('--uf-dark-blue', '#002657');
    document.documentElement.style.setProperty('--uf-pink', '#6A2A60');
  }, []);

  return (
    <AppErrorBoundary name="App">
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
          {(window.location.hostname.includes('localhost') || window.location.hostname.includes('preview')) && <ErrorLogger />}
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}