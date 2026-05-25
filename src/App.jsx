// App.css removed — styles handled by globals.css
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import FreeTierDashboard from '@/pages/FreeTierDashboard';
import JoinPage from '@/pages/JoinPage';
import AlumniHome from '@/pages/AlumniHome';
import FastIQAssessment from '@/pages/FastIQAssessment';
import StudentOnboarding from '@/pages/StudentOnboarding';
import ResumeTailoring from '@/pages/ResumeTailoring';
import MockInterview from '@/pages/MockInterview';
import LinkedInReview from '@/pages/LinkedInReview';
import LinkedInActionPlan from '@/pages/LinkedInActionPlan';
import CareerAssessment from '@/pages/CareerAssessment';
import FastIQDashboard from '@/pages/FastIQDashboard';
import OutreachDrafts from '@/pages/OutreachDrafts';
import GatorAuth from '@/pages/GatorAuth';
import StudentWelcome from '@/pages/StudentWelcome';
import SetSearchGoals from '@/pages/SetSearchGoals';
import ApplicationTracker from '@/pages/ApplicationTracker';
import EmailConnectionSettings from '@/pages/EmailConnectionSettings';
import EmailCallbackPage from '@/pages/EmailCallback';
import MigrationSignIn from '@/pages/MigrationSignIn';
import ParentWelcome from '@/pages/ParentWelcome';
import ParentOnboarding from '@/pages/ParentOnboarding';
import ParentProfileEdit from '@/pages/ParentProfileEdit';
import ParentUpsell from '@/pages/ParentUpsell';
import ParentAllSet from '@/pages/ParentAllSet';
import ParentLandingPage from '@/pages/ParentLandingPage';
import StudentLandingPage from '@/pages/StudentLandingPage';
import RegistrationSuccess from '@/pages/RegistrationSuccess';
import OnboardingQuestions from '@/pages/OnboardingQuestions';

import PostJoinUpsell from '@/pages/PostJoinUpsell';
import Profile from '@/pages/Profile';
import ProfileEdit from '@/pages/ProfileEdit';

import ResetPassword from '@/pages/ResetPassword';
import Logout from '@/pages/Logout';
import AdminV2 from '@/pages/AdminV2';
import EngagementAgentDashboard from '@/pages/EngagementAgentDashboard';

import PaywallAnalyticsDashboard from '@/pages/PaywallAnalyticsDashboard';
import Unsubscribe from '@/pages/Unsubscribe';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : Pages[Object.keys(Pages)[0]];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Guard for pages that require completed onboarding.
function OnboardingGuard({ children }) {
  const { user, isLoadingAuth } = useAuth();
  const location = useLocation();

  // Normalize path to lowercase to prevent casing deadlocks
  const currentPath = location.pathname.toLowerCase();
  const bypassPaths = ['/logout', '/gatorauth', '/getstarted', '/studentlandingpage', '/parentlandingpage'];
  if (bypassPaths.includes(currentPath)) return children;

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/GatorAuth" replace />;
  }

  const hasPersona = !!user.persona?.trim();
  const onboardingDone = user.onboarding_completed === true;

  if (hasPersona && onboardingDone) return children;

  if (hasPersona && !onboardingDone) {
    if (user.persona === 'parent' || user.roles?.includes('parent')) {
      return <Navigate to="/ParentOnboarding" replace />;
    }
    return <Navigate to="/GatorAuth" replace />;
  }

  if (!hasPersona) {
    // No persona = always needs onboarding, regardless of account age
    return <Navigate to="/GatorAuth" replace />;
  }

  return children;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth) { setTimedOut(false); return; }
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [isLoadingAuth]);

  // Show loading spinner while checking auth — but never block public/auth pages, and give up after 3s
  const currentHash = window.location.hash.replace('#/', '').replace('#', '').split('?')[0].toLowerCase();
  const noSpinnerPaths = ['', '/', 'gatorauth', 'getstarted', 'logout', 'migrationsignin', 'resetpassword', 'studentlandingpage', 'parentlandingpage'];
  const isNoSpinnerPath = noSpinnerPaths.includes(currentHash);
  if (!isNoSpinnerPath && !timedOut && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Redirects */}
      <Route path="/Home" element={<Navigate to="/" replace />} />
      <Route path="/LandingPage" element={<Navigate to="/" replace />} />

      {/* Public/Auth routes — NO guard, rendered immediately */}
      <Route path="/GetStarted" element={<GatorAuth />} />
      <Route path="/GatorAuth" element={<GatorAuth />} />
      <Route path="/MigrationSignIn" element={<MigrationSignIn />} />
      <Route path="/Logout" element={<Logout />} />
      <Route path="/StudentLandingPage" element={<StudentLandingPage />} />
      <Route path="/ParentLandingPage" element={<ParentLandingPage />} />
      <Route path="/ResetPassword" element={<ResetPassword />} />
      <Route path="/Unsubscribe" element={<Unsubscribe />} />

      {/* Onboarding routes — no guard */}
      <Route path="/StudentOnboarding" element={<LayoutWrapper currentPageName="StudentOnboarding"><StudentOnboarding /></LayoutWrapper>} />
      <Route path="/GatorWelcome" element={<Navigate to="/StudentWelcome" replace />} />
      <Route path="/StudentWelcome" element={<StudentWelcome />} />
      <Route path="/ParentWelcome" element={<ParentWelcome />} />
      <Route path="/ParentOnboarding" element={<LayoutWrapper currentPageName="ParentOnboarding"><ParentOnboarding /></LayoutWrapper>} />
      <Route path="/ParentUpsell" element={<ParentUpsell />} />
      <Route path="/ParentAllSet" element={<ParentAllSet />} />
      <Route path="/RegistrationSuccess" element={<RegistrationSuccess />} />
      <Route path="/OnboardingQuestions" element={<OnboardingQuestions />} />
      <Route path="/SetSearchGoals" element={<SetSearchGoals />} />

      {/* Guarded dashboard routes */}
      <Route path="/FreeTierDashboard" element={<OnboardingGuard><FreeTierDashboard /></OnboardingGuard>} />
      <Route path="/AlumniHome" element={<OnboardingGuard><FreeTierDashboard /></OnboardingGuard>} />

      {/* Redirect aliases */}
      <Route path="/AlumniAllSet" element={<Navigate to="/FreeTierDashboard" replace />} />
      <Route path="/AlumniOnboarding" element={<Navigate to="/FreeTierDashboard" replace />} />
      <Route path="/ParentHome" element={<Navigate to="/FreeTierDashboard" replace />} />
      <Route path="/Directory" element={<Navigate to="/FreeTierDashboard" replace />} />

      {/* Feature routes */}
      <Route path="/FastIQAssessment" element={<LayoutWrapper currentPageName="FastIQAssessment"><FastIQAssessment /></LayoutWrapper>} />
      <Route path="/ResumeTailoring" element={<LayoutWrapper currentPageName="ResumeTailoring"><ResumeTailoring /></LayoutWrapper>} />
      <Route path="/MockInterview" element={<LayoutWrapper currentPageName="MockInterview"><MockInterview /></LayoutWrapper>} />
      <Route path="/LinkedInReview" element={<LayoutWrapper currentPageName="LinkedInReview"><LinkedInReview /></LayoutWrapper>} />
      <Route path="/LinkedInActionPlan" element={<LayoutWrapper currentPageName="LinkedInActionPlan"><LinkedInActionPlan /></LayoutWrapper>} />
      <Route path="/CareerAssessment" element={<LayoutWrapper currentPageName="CareerAssessment"><CareerAssessment /></LayoutWrapper>} />
      <Route path="/FastIQDashboard" element={<LayoutWrapper currentPageName="FastIQDashboard"><FastIQDashboard /></LayoutWrapper>} />
      <Route path="/OutreachDrafts" element={<LayoutWrapper currentPageName="OutreachDrafts"><OutreachDrafts /></LayoutWrapper>} />
      <Route path="/ApplicationTracker" element={<LayoutWrapper currentPageName="ApplicationTracker"><ApplicationTracker /></LayoutWrapper>} />
      <Route path="/EmailConnectionSettings" element={<LayoutWrapper currentPageName="EmailConnectionSettings"><EmailConnectionSettings /></LayoutWrapper>} />
      <Route path="/email-callback" element={<EmailCallbackPage />} />
      <Route path="/PostJoinUpsell" element={<LayoutWrapper currentPageName="PostJoinUpsell"><PostJoinUpsell /></LayoutWrapper>} />
      <Route path="/Profile" element={<LayoutWrapper currentPageName="Profile"><Profile /></LayoutWrapper>} />
      <Route path="/ProfileEdit" element={<LayoutWrapper currentPageName="ProfileEdit"><ProfileEdit /></LayoutWrapper>} />
      <Route path="/ParentProfileEdit" element={<ParentProfileEdit />} />
      <Route path="/admin" element={<AdminV2 />} />
      <Route path="/engagement-agent" element={<EngagementAgentDashboard />} />
      <Route path="/paywall-analytics" element={<PaywallAnalyticsDashboard />} />
      <Route path="/join" element={<JoinPage />} />

      {/* Main routes */}
      <Route path="/" element={<StudentLandingPage />} />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App