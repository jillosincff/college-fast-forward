import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from './components/theme/ThemeContext';
import { Button as ShadButton } from '@/components/ui/button';
import { LayoutDashboard, Briefcase, Users, MessageSquare, LogOut, User as UserIcon, FileText, Menu, Bell, Bookmark, TestTube, Mail } from 'lucide-react';
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

const APP_VERSION = 'v1.1.7';

function handleCacheBusting() {
  try {
    const currentVersion = localStorage.getItem('cff_app_version');

    if (currentVersion && currentVersion !== APP_VERSION) {
      console.log('🔄 Updating app from version', currentVersion, 'to', APP_VERSION);

      const keysToRemove = [
        'cff_app_version',
        'cff:firstLogin',
        'cff:seenDashboardTour',
        'pending_verification_email'
      ];

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Could not remove localStorage key:', key);
        }
      });

      try {
        document.cookie = 'cff_new_user=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      } catch (e) {
        console.warn('Could not clear cookies');
      }

      localStorage.setItem('cff_app_version', APP_VERSION);
      window.location.reload(true);
      return true;
    } else if (!currentVersion) {
      localStorage.setItem('cff_app_version', APP_VERSION);
    }
  } catch (error) {
    console.warn('Cache busting unavailable:', error);
  }
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
const Connections = React.lazy(() => import('./pages/Connections'));
const Roommates = React.lazy(() => import('./pages/Roommates'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ProfileEdit = React.lazy(() => import('./pages/ProfileEdit'));
const WelcomeRole = React.lazy(() => import('./pages/WelcomeRole'));
const StudentOnboarding = React.lazy(() => import('./pages/StudentOnboarding'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const ShareExpertise = React.lazy(() => import('./pages/ShareExpertise'));
const Opportunities = React.lazy(() => import('./pages/Opportunities'));
const PostOpportunity = React.lazy(() => import('./pages/PostOpportunity'));
const PostRequest = React.lazy(() => import('./pages/PostRequest'));
const ParentDashboard = React.lazy(() => import('./pages/ParentDashboard'));
const GatorDirectory = React.lazy(() => import('./pages/GatorDirectory'));
const MyRequests = React.lazy(() => import('./pages/MyRequests'));
const MyImpact = React.lazy(() => import('./pages/MyImpact'));
const MyApplications = React.lazy(() => import('./pages/MyApplications'));
const MyMessages = React.lazy(() => import('./pages/MyMessages'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
import TestingDashboard from './pages/TestingDashboard';
const AdminSetup = React.lazy(() => import('./pages/AdminSetup'));
const Favorites = React.lazy(() => import('./pages/Favorites'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const ReferralAnalytics = React.lazy(() => import('./pages/ReferralAnalytics'));
const Terms = React.lazy(() => import('./pages/Terms'));
const CookiePolicy = React.lazy(() => import('./pages/CookiePolicy'));
const CompanyProfile = React.lazy(() => import('./pages/CompanyProfile'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const PublicProfile = React.lazy(() => import('./pages/PublicProfile'));
const UFAmbassador = React.lazy(() => import('./pages/UFAmbassador'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const GatorAuth = React.lazy(() => import('./pages/GatorAuth'));
const GatorRoleSelection = React.lazy(() => import('./pages/GatorRoleSelection'));
const GatorInviteCode = React.lazy(() => import('./pages/GatorInviteCode'));
const GatorWelcome = React.lazy(() => import('./pages/GatorWelcome'));
const GatorParentInvite = React.lazy(() => import('./pages/GatorParentInvite'));


function SimpleHeader({ currentPage, onNavigate, user, logout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentMessages, setRecentMessages] = useState([]);
  const [payItForwardNotifications, setPayItForwardNotifications] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const publicPages = ['LandingPage', 'AdminSetup', 'Privacy', 'Terms', 'CookiePolicy', 'InviteRequired', 'RequestInvite', 'Pricing', 'PublicProfile'];
    const adminPages = ['AdminDashboard', 'TestingDashboard', 'AdminSetup'];
    
    if (publicPages.includes(currentPage) || adminPages.includes(currentPage)) {
      console.log('Skipping message count fetch on public/admin page:', currentPage);
      setUnreadCount(0);
      return;
    }

    if (!user?.email) {
      console.log('Skipping message count fetch - user not authenticated');
      setUnreadCount(0);
      return;
    }

    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 1;

    const loadUnreadCount = async () => {
      if (!user?.email || hasError) {
        if (isMounted) setUnreadCount(0);
        return;
      }

      console.log(`Attempting to load unread count (retry ${retryCount + 1}/${MAX_RETRIES + 1})...`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.warn('Message count fetch timed out after 5 seconds.');
        }, 5000);

        let messages = [];
        try {
          messages = await Message.filter(
            { recipient_email: user.email, is_read: false },
            undefined,
            5,
            { signal: controller.signal }
          );
        } catch (fetchError) {
          console.log('Message fetch unavailable (network error suppressed):', fetchError.message);
          messages = [];
          
          if (isMounted) {
            setHasError(true);
            setUnreadCount(0);
          }
          clearTimeout(timeoutId);
          return;
        } finally {
          clearTimeout(timeoutId);
        }

        if (isMounted && messages !== undefined) {
          setUnreadCount(messages?.length || 0);
          if (hasError) setHasError(false);
          retryCount = 0;
          console.log(`Unread messages loaded successfully: ${messages?.length || 0}`);
        }
      } catch (error) {
        console.log('Error during message count load (suppressed):', error.message);
        if (isMounted) {
          setUnreadCount(0);
          setHasError(true);
        }
      }
    };

    const initialLoadTimeout = setTimeout(() => {
      if (isMounted && user?.email) {
        loadUnreadCount();
      }
    }, 1000);

    const interval = setInterval(() => {
      if (!hasError && user?.email && !publicPages.includes(currentPage) && !adminPages.includes(currentPage)) {
        console.log('Polling for unread messages...');
        loadUnreadCount();
      }
    }, 300000);

    return () => {
      isMounted = false;
      clearTimeout(initialLoadTimeout);
      clearInterval(interval);
      console.log('Cleanup for message count effect.');
    };
  }, [user?.email, hasError, currentPage]);

  const loadRecentMessages = async () => {
    const publicPages = ['LandingPage', 'AdminSetup', 'Privacy', 'Terms', 'CookiePolicy', 'InviteRequired', 'RequestInvite', 'Pricing', 'PublicProfile'];
    const adminPages = ['AdminDashboard', 'TestingDashboard', 'AdminSetup'];

    if (!user?.email || loadingMessages || publicPages.includes(currentPage) || adminPages.includes(currentPage)) {
      console.log('Skipping recent messages fetch (conditions not met).');
      return;
    }

    setLoadingMessages(true);
    console.log('Loading recent messages for dropdown...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('Recent messages fetch timed out after 5 seconds.');
      }, 5000);

      let messages = [];
      let pifNotifications = [];
      try {
        messages = await Message.filter(
          { recipient_email: user.email },
          '-created_date',
          5,
          { signal: controller.signal }
        );

        // Load Pay It Forward notifications for parents
        if (user.persona === 'parent' || user.roles?.includes('parent')) {
          pifNotifications = await PayItForwardNotification.filter(
            { recipient_parent_email: user.email, is_read: false },
            '-created_date',
            3
          );
        }
      } catch (fetchError) {
        console.log('Recent messages temporarily unavailable (network error suppressed).');
        messages = [];
        pifNotifications = [];
      } finally {
        clearTimeout(timeoutId);
      }

      setRecentMessages(messages || []);
      setPayItForwardNotifications(pifNotifications || []);
      console.log(`Recent messages loaded: ${messages?.length || 0}, PIF notifications: ${pifNotifications?.length || 0}`);
    } catch (error) {
      console.log('Error during recent message load (suppressed).');
      setRecentMessages([]);
      setPayItForwardNotifications([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleBellClick = () => {
    if (currentPage === 'MyMessages') {
      document.dispatchEvent(new CustomEvent('cff:refresh-messages'));
    } else {
      onNavigate('MyMessages');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await Message.update(messageId, { is_read: true });
      setRecentMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      logger.error('Failed to mark message as read from notification dropdown', { error: error.message, messageId, userEmail: user?.email });
    }
  };

  const markPIFAsRead = async (notifId) => {
    try {
      await PayItForwardNotification.update(notifId, { is_read: true });
      setPayItForwardNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (error) {
      console.error('Failed to mark Pay It Forward notification as read:', error);
    }
  };

  const allNavItems = useMemo(() => [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard, roles: ['gator', 'parent', 'admin'] },
    { name: 'Emerging Gators', page: 'Connections', icon: Briefcase, roles: ['gator', 'parent'] },
    { name: 'Talent Spotlight', page: 'TalentSpotlight', icon: Users, roles: ['gator', 'parent'] },
    { name: 'Gator Directory', page: 'GatorDirectory', icon: Users, roles: ['gator', 'parent'] },
    { name: 'Opportunities', page: 'Opportunities', icon: Briefcase, roles: ['gator', 'parent'] },
    { name: 'Roommates', page: 'Roommates', icon: Users, roles: ['gator', 'parent'] },
    { name: 'Pricing', page: 'Pricing', icon: Users, roles: ['gator', 'parent', 'admin'], isPublic: true },
  ], []);

  const filteredNavItems = useMemo(() => {
    if (!user) {
      console.log('🚫 No user - returning empty nav items');
      return [];
    }
    
    console.log('🔍 Filtering nav items for user:', { 
      email: user.email, 
      persona: user.persona, 
      roles: user.roles 
    });
    
    // Determine effective persona - @ufl.edu users are always gators
    const effectivePersona = user.email?.toLowerCase().endsWith('@ufl.edu') 
      ? 'gator' 
      : user.persona;
    
    const filtered = allNavItems.filter(item => {
      const hasRequiredRole = 
        (effectivePersona && item.roles.includes(effectivePersona)) || 
        (user.roles && user.roles.some(role => item.roles.includes(role)));
      
      return hasRequiredRole;
    });
    
    console.log('✅ Filtered nav items:', filtered.length, filtered.map(i => i.name));
    return filtered;
  }, [user, allNavItems]);

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center space-x-8">
              <div onClick={() => onNavigate('LandingPage')} className="flex items-center cursor-pointer">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                  alt="College Fast Forward"
                  className="h-20 md:h-24"
                />
              </div>
              <div className="hidden md:flex space-x-1">
                <ShadButton
                  variant="ghost"
                  onClick={() => onNavigate('Pricing')}
                  className={`font-medium transition-colors duration-200 text-sm ${
                    currentPage === 'Pricing'
                      ? 'text-blue-600 border-b-2 border-blue-600 rounded-none'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pricing
                </ShadButton>
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
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center space-x-4 md:space-x-8">
                <div onClick={() => onNavigate(user ? 'Dashboard' : 'LandingPage')} className="flex items-center cursor-pointer">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                      alt="College Fast Forward"
                      className="h-20 md:h-24"
                    />
                </div>
                {user && (
                    <div className="hidden md:flex space-x-1">
                        {filteredNavItems.map((item) => {
                           let targetPageForNav = item.page;
                            if (item.name === 'Dashboard') {
                                if (user.persona === 'parent') targetPageForNav = 'ParentDashboard';
                                else if (user.persona === 'admin' || user.roles?.includes('admin')) targetPageForNav = 'AdminDashboard';
                                else targetPageForNav = 'Dashboard';
                            }
                            const isActive = currentPage === targetPageForNav;
                            return (
                                <ShadButton
                                  key={item.name}
                                  variant="ghost"
                                  onClick={() => onNavigate(targetPageForNav)}
                                  className={`font-medium transition-colors duration-200 text-sm ${
                                    isActive
                                      ? 'text-blue-600 border-b-2 border-blue-600 rounded-none'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
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
                    <ShadButton variant="ghost" className="h-10 w-10 rounded-full">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </ShadButton>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-4 border-b">
                        <img
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
                          alt="College Fast Forward"
                          className="h-32"
                        />
                      </div>
                      <nav className="flex-grow flex flex-col p-4 space-y-1">
                        {filteredNavItems.map((item) => {
                          let targetPageForNav = item.page;
                          if (item.name === 'Dashboard') {
                            if (user.persona === 'parent') targetPageForNav = 'ParentDashboard';
                            else if (user.persona === 'admin' || user.roles?.includes('admin')) targetPageForNav = 'AdminDashboard';
                            else targetPageForNav = 'Dashboard';
                          }

                          const Icon = item.icon;
                          const isActive = currentPage === targetPageForNav;
                          return (
                            <ShadButton
                              key={item.name}
                              variant="ghost"
                              onClick={() => {
                                onNavigate(targetPageForNav);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`justify-start flex items-center gap-2 font-semibold transition-colors duration-200 ${
                                isActive
                                  ? 'bg-blue-100 text-gator-blue'
                                  : 'text-ink-60 hover:bg-slate-100 hover:text-gator-blue'
                              }`}
                            >
                              <Icon className={`h-5 w-5 transition-colors duration-200 ${
                                isActive
                                  ? 'text-gator-blue'
                                  : 'text-ink-40 group-hover:text-gator-blue'
                              }`} />
                              {item.name}
                            </ShadButton>
                          );
                        })}
                      </nav>
                      <div className="p-4 border-t flex flex-col space-y-1">
                        <ShadButton
                          variant="ghost"
                          onClick={() => {
                            onNavigate('Profile');
                            setIsMobileMenuOpen(false);
                          }}
                          className="justify-start flex items-center gap-2 font-semibold transition-colors duration-200 text-ink-60 hover:bg-slate-100 hover:text-gator-blue"
                        >
                            <UserIcon className="mr-2 h-5 w-5 text-ink-40 group-hover:text-gator-blue" />
                            Profile
                        </ShadButton>
                        <ShadButton
                          variant="ghost"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="justify-start flex items-center gap-2 font-semibold transition-colors duration-200 text-ink-60 hover:bg-slate-100 hover:text-gator-blue"
                        >
                          <LogOut className="mr-2 h-5 w-5 text-ink-40 group-hover:text-gator-blue" />
                          Logout
                        </ShadButton>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}

              {user && currentPage !== 'AdminDashboard' && currentPage !== 'TestingDashboard' && currentPage !== 'AdminSetup' && !hasError && (
                <Popover onOpenChange={(open) => { if (open) loadRecentMessages(); }}>
                  <PopoverTrigger asChild>
                    <ShadButton
                      variant="ghost"
                      className="h-9 w-9 rounded-full text-gray-600 hover:text-gray-900 hidden sm:inline-flex relative"
                    >
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
                      <p className="text-xs text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages'}
                      </p>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                                                {loadingMessages ? (
                                                  <div className="p-8 text-center text-gray-500">
                                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                    Loading...
                                                  </div>
                                                ) : (recentMessages.length > 0 || payItForwardNotifications.length > 0) ? (
                                                  <div className="divide-y">
                                                    {/* Pay It Forward Notifications */}
                                                    {payItForwardNotifications.map((notif) => (
                                                      <div
                                                        key={`pif-${notif.id}`}
                                                        className="p-4 hover:bg-orange-50 cursor-pointer transition-colors bg-gradient-to-r from-orange-50 to-pink-50 border-l-4 border-orange-400"
                                                        onClick={() => {
                                                          markPIFAsRead(notif.id);
                                                          onNavigate('Connections');
                                                        }}
                                                      >
                                                        <div className="flex items-start gap-3">
                                                          <div className="text-2xl">❤️</div>
                                                          <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-sm text-orange-800">
                                                              Good news! {notif.student_name || 'Your Gator'} was just helped
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                              {notif.helper_parent_name || 'A Gator Parent'} reached out to help. Pay it forward?
                                                            </p>
                                                            <p className="text-xs text-orange-600 font-medium mt-2">
                                                              🐊 Help another Gator →
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ))}
                                                    {/* Regular Messages */}
                                                    {recentMessages.map((msg) => (
                                                      <div
                                                        key={msg.id}
                                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                          !msg.is_read ? 'bg-blue-50' : ''
                                                        }`}
                                                        onClick={() => {
                                                          if (!msg.is_read) markAsRead(msg.id);
                                                          handleBellClick();
                                                        }}
                                                      >
                                                        <div className="flex items-start gap-3">
                                                          <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <p className="font-medium text-sm truncate">{msg.subject}</p>
                                                              {!msg.is_read && (
                                                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                                              )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 truncate">From: {msg.sender_email}</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                              {new Date(msg.created_date).toLocaleDateString()}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <div className="p-8 text-center text-gray-500">
                                                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm">No messages yet</p>
                                                  </div>
                                                )}
                                              </div>
                    {recentMessages.length > 0 && (
                      <div className="border-t p-3">
                        <ShadButton
                          variant="ghost"
                          className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={handleBellClick}
                        >
                          View All Messages
                        </ShadButton>
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
                    <ShadButton 
                      variant="outline" 
                      className="h-12 px-3 gap-2 rounded-full border-2 border-[#0021A5] hover:border-[#FA4616] hover:bg-slate-50 transition-all shadow-lg"
                    >
                      <UserAvatar
                        user={user}
                        className="h-9 w-9"
                        showFallback={true}
                      />
                      <span className="hidden sm:inline-flex text-sm font-semibold">Menu</span>
                    </ShadButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{user?.full_name || user?.email || 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('Profile')}><UserIcon className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('MyApplications')}><FileText className="mr-2 h-4 w-4" />My Applications</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('MyRequests')}><FileText className="mr-2 h-4 w-4" />My Requests</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('MyMessages')}><MessageSquare className="mr-2 h-4 w-4" />My Messages</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('Favorites')}><Bookmark className="mr-2 h-4 w-4" />My Favorites</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('AdminSetup')} className="text-orange-600 focus:bg-orange-50 focus:text-orange-700">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Admin Setup
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate('AdminDashboard')} className="text-purple-600 focus:bg-purple-50 focus:text-purple-700">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                    </DropdownMenuItem>
                    {user?.roles?.includes('admin') && (
                      <DropdownMenuItem onClick={() => onNavigate('TestingDashboard')} className="text-blue-600 focus:bg-blue-50 focus:text-blue-700">
                          <TestTube className="mr-2 h-4 w-4" />
                          Testing Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

const onboardingPages = ['StudentOnboarding', 'Onboarding', 'ShareExpertise'];
const newUserFlowPages = ['GatorAuth', 'GatorRoleSelection', 'GatorInviteCode', 'GatorWelcome', 'GatorParentInvite', 'WelcomeRole'];
const adminPages = ['TestingDashboard'];
const publicPages = ['LandingPage', 'WelcomeRole', 'AdminSetup', 'Privacy', 'Terms', 'CookiePolicy', 'InviteRequired', 'RequestInvite', 'Pricing', 'PublicProfile', 'UFAmbassador'];
const authOnlyPages = ['Opportunities', 'CompanyProfile', 'PublicProfile', 'PreAuth'];

const isUserVerified = (user) => {
  if (!user) return false;
  
  const email = user.email?.toLowerCase() || '';
  
  // @ufl.edu emails are always verified - instant access
  if (email.endsWith('@ufl.edu')) {
    return true;
  }
  
  // Admins are always verified
  if (user.roles?.includes('admin')) return true;
  
  // If user has a pending invite code in session, they're in the verification flow
  if (typeof window !== 'undefined') {
    const pendingInviteCode = sessionStorage.getItem('pending_invite_code');
    if (pendingInviteCode) {
      return true;
    }
  }
  
  // If user already has a persona/role set, they've been verified before
  // Once a user has selected a role, they're verified (they went through invite flow)
  if (user.persona === 'parent' || user.roles?.includes('parent')) {
    return true;
  }
  
  if (user.persona === 'gator' || user.roles?.includes('gator')) {
    return true;
  }
  
  // Legacy persona values
  if (user.persona === 'student' || user.persona === 'alumni') {
    return true;
  }
  
  // New users without any role need verification (unless @ufl.edu)
  return false;
};

const getPageComponent = (pageName) => {
  switch (pageName) {
    case 'Dashboard': return Dashboard;
    case 'ParentDashboard': return ParentDashboard;
    case 'AdminDashboard': return AdminDashboard;
    case 'Connections': return Connections;
    case 'TalentSpotlight': return React.lazy(() => import('./pages/TalentSpotlight'));
    case 'CompanyProfile': return CompanyProfile;
    case 'Opportunities': return Opportunities;
    case 'PostOpportunity': return PostOpportunity;
    case 'PostRequest': return PostRequest;
    case 'Roommates': return Roommates;
    case 'Profile': return Profile;
    case 'ProfileEdit': return ProfileEdit;
    case 'WelcomeRole': return WelcomeRole;
    case 'StudentOnboarding': return StudentOnboarding;
    case 'Onboarding': return Onboarding;
    case 'ShareExpertise': return ShareExpertise;
    case 'GatorDirectory': return GatorDirectory;
    case 'MyRequests': return MyRequests;
    case 'MyImpact': return MyImpact;
    case 'MyApplications': return MyApplications;
    case 'MyMessages': return MyMessages;
    case 'TestingDashboard': return TestingDashboard;
    case 'AdminSetup': return AdminSetup;
    case 'Favorites': return Favorites;
    case 'Privacy': return Privacy;
    case 'Terms': return Terms;
    case 'CookiePolicy': return CookiePolicy;
    case 'Pricing': return Pricing;
    case 'PublicProfile': return PublicProfile;
    case 'InviteRequired': return React.lazy(() => import('./pages/InviteRequired'));
    case 'RequestInvite': return React.lazy(() => import('./pages/RequestInvite'));
    case 'UFAmbassador': return UFAmbassador;
    case 'Notifications': return Notifications;
    case 'ReferralAnalytics': return ReferralAnalytics;
    case 'GatorAuth': return GatorAuth;
    case 'GatorRoleSelection': return GatorRoleSelection;
    case 'GatorInviteCode': return GatorInviteCode;
    case 'GatorWelcome': return GatorWelcome;
    case 'GatorParentInvite': return GatorParentInvite;
    default: return LandingPage;
  }
};

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(null);
  const [resolvedPage, setResolvedPage] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      // Simple hash detection
      let hash = window.location.hash.slice(1).split('?')[0] || 'LandingPage';
      if (hash.startsWith('/')) {
        hash = hash.slice(1);
      }
      
      console.log('📍 [Hash] Setting page:', hash);
      setCurrentPage(hash || 'LandingPage');
      setResolvedPage(null);
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isLoading || !currentPage) {
      console.log('⏳ [Layout Routing] Waiting... isLoading:', isLoading, 'currentPage:', currentPage);
      return;
    }

    console.log('🔍 [Layout Routing] Start - page:', currentPage, 'user:', user?.email, 'persona:', user?.persona, 'onboarding:', user?.onboarding_completed);
    
    // CRITICAL CHECK #1: Just completed OAuth - force role selection
    const justCompletedOAuth = sessionStorage.getItem('oauth_flow_active');
    if (user && justCompletedOAuth) {
      const hasNoRole = !user.persona && (!user.roles || user.roles.length === 0);
      
      if (hasNoRole && currentPage !== 'GatorRoleSelection') {
        console.log('🔄 [OAuth Complete] New user needs role selection -> GatorRoleSelection');
        sessionStorage.removeItem('oauth_flow_active');
        navigate('GatorRoleSelection');
        return;
      }
      
      // Clear flag once user has a role
      if (!hasNoRole) {
        sessionStorage.removeItem('oauth_flow_active');
      }
    }
    
    // CRITICAL CHECK #2: Parent invite flow
    const pendingRoleInitial = sessionStorage.getItem('pending_invite_role');
    const pendingCode = sessionStorage.getItem('pending_invite_code');
    
    if (user && pendingRoleInitial === 'parent' && pendingCode) {
      console.log('🎯 [Parent Flow] Detected! Code:', pendingCode);
      
      // If user doesn't have parent role yet, redirect to GatorWelcome
      if (user.persona !== 'parent' && !user.roles?.includes('parent')) {
        console.log('🔄 [Parent Flow] User needs parent setup -> GatorWelcome');
        if (currentPage !== 'GatorWelcome') {
          navigate('GatorWelcome?role=parent');
          return;
        }
      }
      
      // If user has parent role but hasn't completed onboarding
      if ((user.persona === 'parent' || user.roles?.includes('parent')) && !user.onboarding_completed) {
        console.log('🔄 [Parent Flow] Parent needs onboarding -> Onboarding');
        if (currentPage !== 'Onboarding' && currentPage !== 'GatorWelcome') {
          navigate('Onboarding');
          return;
        }
      }
    }
    
    // CRITICAL CHECK #3: Student flow with pending role
    const pendingRole = sessionStorage.getItem('pending_invite_role');
    if (user && pendingRole === 'gator') {
      console.log('🎯 [Student Flow] Detected pending gator role');
      
      // If user doesn't have role yet, force to GatorWelcome
      if (!user.persona && currentPage !== 'GatorWelcome' && currentPage !== 'GatorRoleSelection') {
        console.log('🔄 [Student Flow] Forcing to GatorWelcome');
        navigate('GatorWelcome');
        return;
      }
      
      // If user has gator role but needs onboarding
      if ((user.persona === 'gator' || user.roles?.includes('gator')) && !user.onboarding_completed) {
        console.log('🔄 [Student Flow] Gator needs onboarding -> StudentOnboarding');
        if (currentPage !== 'StudentOnboarding' && currentPage !== 'GatorWelcome') {
          navigate('StudentOnboarding');
          return;
        }
      }
    }

    // STEP 1: Admin pages ALWAYS bypass routing
    if (currentPage === 'AdminDashboard' || currentPage === 'TestingDashboard') {
      console.log('✅ [Admin] Direct access:', currentPage);
      setResolvedPage(currentPage);
      return;
    }

    // STEP 2: Public pages ALWAYS accessible
    const trulyPublicPages = ['Privacy', 'Terms', 'CookiePolicy', 'InviteRequired', 'RequestInvite', 'Pricing', 'PublicProfile', 'AdminSetup', 'LandingPage', 'UFAmbassador'];
    if (trulyPublicPages.includes(currentPage)) {
      console.log('✅ [Public] Page accessible:', currentPage);
      setResolvedPage(currentPage);
      return;
    }

    // STEP 3: New user flow pages ALWAYS bypass routing (GatorAuth, GatorWelcome, etc.)
    if (newUserFlowPages.includes(currentPage)) {
      console.log('✅ [NewUserFlow] Page:', currentPage);
      
      // CRITICAL: Set parent role when landing on GatorWelcome after OAuth
      if (currentPage === 'GatorWelcome' && user) {
        const pendingRole = sessionStorage.getItem('pending_invite_role');
        const pendingCode = sessionStorage.getItem('pending_invite_code');
        
        if (pendingRole === 'parent' && user.persona !== 'parent') {
          console.log('🔄 [GatorWelcome] Setting parent role for:', user.email);
          
          base44.auth.updateMe({ 
            persona: 'parent',
            roles: ['parent'],
            onboarding_completed: false,
            invite_code_used: pendingCode || 'direct'
          }).then(() => {
            console.log('✅ [GatorWelcome] Parent role set successfully');
            // Don't remove session items yet - GatorWelcome will handle that
          }).catch(err => {
            console.error('❌ [GatorWelcome] Failed to set parent role:', err);
            // Clear on error
            sessionStorage.removeItem('pending_invite_code');
            sessionStorage.removeItem('pending_invite_role');
          });
        }
      }
      
      setResolvedPage(currentPage);
      return;
    }

    // STEP 4: Onboarding pages ALWAYS accessible (users might refresh mid-flow)
    if (onboardingPages.includes(currentPage)) {
      console.log('✅ [Onboarding] Allowing access to:', currentPage);
      setResolvedPage(currentPage);
      return;
    }

    // STEP 5: No user = send to landing (except auth-only pages)
    if (!user) {
      if (authOnlyPages.includes(currentPage)) {
        console.log('✅ [NoAuth] Allowing auth-only page:', currentPage);
        setResolvedPage(currentPage);
        return;
      }
      console.log('🔄 [NoAuth] Redirecting to LandingPage');
      navigate('LandingPage');
      return;
    }

    // STEP 6: User is authenticated - determine correct destination
    const hasNoRole = !user.persona && (!user.roles || user.roles.length === 0);
    const needsOnboarding = user.onboarding_completed !== true;
    const isUFLStudent = user.email?.toLowerCase().endsWith('@ufl.edu');

    // CRITICAL: Check if user is in the middle of new user flow (has pending role in session)
    const pendingRole = typeof window !== 'undefined' ? sessionStorage.getItem('pending_invite_role') : null;
    const inNewUserFlow = pendingRole && hasNoRole;

    const verified = isUserVerified(user);

    console.log('📊 [User State]', { hasNoRole, needsOnboarding, isUFLStudent, verified, pendingRole, inNewUserFlow });

    // Landing/Dashboard navigation logic - ALWAYS check routing for authenticated users
    if (user && (currentPage === 'LandingPage' || currentPage === 'Dashboard' || currentPage === 'ParentDashboard')) {
      let destination = currentPage;

      console.log('🔄 [Routing Check] User on:', currentPage, '| hasNoRole:', hasNoRole, '| needsOnboarding:', needsOnboarding);

      // CRITICAL: If user is in new user flow (just came back from OAuth), send to GatorWelcome
      if (inNewUserFlow) {
        destination = 'GatorWelcome';
        console.log('➡️ [NewUserFlow] User just authenticated → GatorWelcome');
      }
      // Check role - even @ufl.edu students need to select a role
      else if (hasNoRole) {
        destination = 'GatorRoleSelection';
        console.log('➡️ [NoRole] → GatorRoleSelection');
      } else if (!verified && !isUFLStudent) {
        destination = 'InviteRequired';
        console.log('➡️ [NotVerified] → InviteRequired');
      } else if (needsOnboarding) {
        if (user.persona === 'parent' || user.roles?.includes('parent')) {
          destination = 'Onboarding';
          console.log('➡️ [NeedsOnboarding] Parent → Onboarding');
        } else {
          destination = 'StudentOnboarding';
          console.log('➡️ [NeedsOnboarding] Student → StudentOnboarding');
        }
      } else {
        // Fully onboarded - go to correct dashboard
        if (user.roles?.includes('admin')) {
          destination = 'AdminDashboard';
        } else if (user.persona === 'parent' || user.roles?.includes('parent')) {
          destination = 'ParentDashboard';
        } else {
          destination = 'Dashboard';
        }
        console.log('➡️ [Onboarded] → Dashboard:', destination);
      }

      if (destination !== currentPage) {
        navigate(destination);
        return;
      }
    }

    // Allow access to current page if fully set up
    if (!hasNoRole && (verified || isUFLStudent) && !needsOnboarding) {
      console.log('✅ [FullySetup] Allowing access to:', currentPage);
      setResolvedPage(currentPage);
      return;
    }

    // Redirect incomplete users
    if (inNewUserFlow) {
      console.log('🔄 [Incomplete] In new user flow → GatorWelcome');
      navigate('GatorWelcome');
    } else if (hasNoRole) {
      console.log('🔄 [Incomplete] No role → GatorRoleSelection');
      navigate('GatorRoleSelection');
    } else if (!verified && !isUFLStudent) {
      console.log('🔄 [Incomplete] Not verified → InviteRequired');
      navigate('InviteRequired');
    } else if (needsOnboarding) {
      const onboardingPage = (user.persona === 'parent' || user.roles?.includes('parent')) ? 'Onboarding' : 'StudentOnboarding';
      console.log('🔄 [Incomplete] Needs onboarding →', onboardingPage);
      navigate(onboardingPage);
    } else {
      console.log('✅ [FallThrough] Allowing access to:', currentPage);
      setResolvedPage(currentPage);
    }
  }, [user, isLoading, currentPage]);

  if (!resolvedPage) {
    return <PageLoader />;
  }

  const PageComponent = getPageComponent(resolvedPage);
  const showHeader = resolvedPage !== 'LandingPage' && 
                     resolvedPage !== 'AdminSetup' && 
                     !onboardingPages.includes(resolvedPage) && 
                     !newUserFlowPages.includes(resolvedPage) &&
                     !publicPages.includes(resolvedPage);

  return (
    <AppErrorBoundary name="MainApp">
      <div className="min-h-screen flex flex-col bg-surface-subtle text-ink">
        {showHeader && (
          <AppErrorBoundary name="Header">
            <SimpleHeader currentPage={resolvedPage} onNavigate={navigate} user={user} logout={logout} />
          </AppErrorBoundary>
        )}

        <main className="flex-grow">
          <AppErrorBoundary name={`Page-${resolvedPage}`}>
            <Suspense fallback={<PageLoader />}>
              <PageComponent />
            </Suspense>
          </AppErrorBoundary>
        </main>

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
      </div>
    </AppErrorBoundary>
  );
}

export default function Layout() {
  useEffect(() => {
    const isReloading = handleCacheBusting();
    if (isReloading) {
      return;
    }

    const isProduction = !window.location.hostname.includes('localhost') &&
                        !window.location.hostname.includes('preview');

    if (isProduction) {
      reportWebVitals();
    }

    // Suppress non-critical WebSocket errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorStr = args.join(' ');
      if (errorStr.includes('WebSocket closed without opened')) {
        // Suppress this specific non-critical error
        return;
      }
      originalError.apply(console, args);
    };

    console.log(`🚀 College Fast Forward ${APP_VERSION} initialized`);
    perfMonitor.start('app_init');
    perfMonitor.end('app_init');
    
    // Set favicon
    const setFavicon = () => {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
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
          {(window.location.hostname.includes('localhost') || 
            window.location.hostname.includes('preview')) && (
            <ErrorLogger />
          )}
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}