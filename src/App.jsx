// App.css removed — styles handled by globals.css
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import FreeTierDashboard from '@/pages/FreeTierDashboard';
import JoinPage from '@/pages/JoinPage';
import AlumniOnboarding from '@/pages/AlumniOnboarding';
import AlumniAllSet from '@/pages/AlumniAllSet';
import AlumniHome from '@/pages/AlumniHome';
import Directory from '@/pages/Directory';
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
import GatorWelcome from '@/pages/GatorWelcome';
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
import ParentHome from '@/pages/ParentHome';
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

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth) { setTimedOut(false); return; }
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [isLoadingAuth]);

  // Show loading spinner while checking auth — but never block public/auth pages, and give up after 3s
  const currentHash = window.location.hash.replace('#/', '').replace('#', '').split('?')[0];
  const noSpinnerPaths = ['', '/', 'GatorAuth', 'GetStarted', 'Logout', 'MigrationSignIn', 'ResetPassword', 'StudentLandingPage', 'ParentLandingPage'];
  const isNoSpinnerPath = noSpinnerPaths.includes(currentHash);
  if (!isNoSpinnerPath && !timedOut && (isLoadingPublicSettings || isLoadingAuth)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
      return (
        <Routes>
          {/* Redirects */}
          <Route path="/Home" element={<Navigate to="/" replace />} />
          <Route path="/LandingPage" element={<Navigate to="/" replace />} />

          {/* Public/Auth routes - no layout wrapper */}
          <Route path="/GetStarted" element={<GatorAuth />} />
          <Route path="/MigrationSignIn" element={<MigrationSignIn />} />

          {/* Explicit routes first for higher priority */}
          <Route path="/FreeTierDashboard" element={<FreeTierDashboard />} />
          <Route path="/Directory" element={<LayoutWrapper currentPageName="Directory"><Directory /></LayoutWrapper>} />
          <Route path="/FastIQAssessment" element={<LayoutWrapper currentPageName="FastIQAssessment"><FastIQAssessment /></LayoutWrapper>} />
          <Route path="/StudentOnboarding" element={<LayoutWrapper currentPageName="StudentOnboarding"><StudentOnboarding /></LayoutWrapper>} />
          <Route path="/ResumeTailoring" element={<LayoutWrapper currentPageName="ResumeTailoring"><ResumeTailoring /></LayoutWrapper>} />
          <Route path="/MockInterview" element={<LayoutWrapper currentPageName="MockInterview"><MockInterview /></LayoutWrapper>} />
          <Route path="/LinkedInReview" element={<LayoutWrapper currentPageName="LinkedInReview"><LinkedInReview /></LayoutWrapper>} />
          <Route path="/LinkedInActionPlan" element={<LayoutWrapper currentPageName="LinkedInActionPlan"><LinkedInActionPlan /></LayoutWrapper>} />
          <Route path="/CareerAssessment" element={<LayoutWrapper currentPageName="CareerAssessment"><CareerAssessment /></LayoutWrapper>} />
          <Route path="/FastIQDashboard" element={<LayoutWrapper currentPageName="FastIQDashboard"><FastIQDashboard /></LayoutWrapper>} />
          <Route path="/OutreachDrafts" element={<LayoutWrapper currentPageName="OutreachDrafts"><OutreachDrafts /></LayoutWrapper>} />
          <Route path="/AlumniOnboarding" element={<AlumniOnboarding />} />
          <Route path="/AlumniAllSet" element={<AlumniAllSet />} />
          <Route path="/AlumniHome" element={<FreeTierDashboard />} />
          <Route path="/ParentWelcome" element={<ParentWelcome />} />
          <Route path="/ParentOnboarding" element={<LayoutWrapper currentPageName="ParentOnboarding"><ParentOnboarding /></LayoutWrapper>} />
          <Route path="/ParentUpsell" element={<ParentUpsell />} />
          <Route path="/ParentAllSet" element={<ParentAllSet />} />
          <Route path="/ParentProfileEdit" element={<ParentProfileEdit />} />
          <Route path="/ParentLandingPage" element={<ParentLandingPage />} />
          <Route path="/ParentHome" element={<ParentHome />} />
          <Route path="/ParentDashboard" element={<Navigate to="/ParentHome" replace />} />
          <Route path="/StudentLandingPage" element={<StudentLandingPage />} />
          <Route path="/RegistrationSuccess" element={<RegistrationSuccess />} />
          <Route path="/OnboardingQuestions" element={<OnboardingQuestions />} />
          <Route path="/GatorAuth" element={<GatorAuth />} />
          <Route path="/GatorWelcome" element={<StudentWelcome />} />
          <Route path="/StudentWelcome" element={<StudentWelcome />} />
          <Route path="/SetSearchGoals" element={<SetSearchGoals />} />
          <Route path="/ApplicationTracker" element={<LayoutWrapper currentPageName="ApplicationTracker"><ApplicationTracker /></LayoutWrapper>} />
          <Route path="/EmailConnectionSettings" element={<LayoutWrapper currentPageName="EmailConnectionSettings"><EmailConnectionSettings /></LayoutWrapper>} />
          <Route path="/email-callback" element={<EmailCallbackPage />} />

          <Route path="/PostJoinUpsell" element={<LayoutWrapper currentPageName="PostJoinUpsell"><PostJoinUpsell /></LayoutWrapper>} />

          <Route path="/Profile" element={<LayoutWrapper currentPageName="Profile"><Profile /></LayoutWrapper>} />
          <Route path="/ProfileEdit" element={<LayoutWrapper currentPageName="ProfileEdit"><ProfileEdit /></LayoutWrapper>} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route path="/Logout" element={<Logout />} />
          <Route path="/admin" element={<AdminV2 />} />
          <Route path="/engagement-agent" element={<EngagementAgentDashboard />} />
          <Route path="/paywall-analytics" element={<PaywallAnalyticsDashboard />} />
          <Route path="/Unsubscribe" element={<Unsubscribe />} />
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