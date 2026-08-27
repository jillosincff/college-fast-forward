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
import UnknownRouteRedirect from './lib/UnknownRouteRedirect';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import FreeTierDashboard from '@/pages/FreeTierDashboard';
import JoinPage from '@/pages/JoinPage';
import AlumniHome from '@/pages/AlumniHome';
import StudentOnboarding from '@/pages/StudentOnboarding';
import ResumeTailoring from '@/pages/ResumeTailoring';
import MockInterview from '@/pages/MockInterview';
import LinkedInReview from '@/pages/LinkedInReview';

import CareerAssessment from '@/pages/CareerAssessment';
import OutreachDrafts from '@/pages/OutreachDrafts';
import GatorAuth from '@/pages/GatorAuth';
import SetSearchGoals from '@/pages/SetSearchGoals';
import ApplicationTracker from '@/pages/ApplicationTracker';
import EmailConnectionSettings from '@/pages/EmailConnectionSettings';
import EmailCallbackPage from '@/pages/EmailCallback';
import ParentOnboarding from '@/pages/ParentOnboarding';
import ParentProfileEdit from '@/pages/ParentProfileEdit';
import ParentAllSet from '@/pages/ParentAllSet';
import ParentLandingPage from '@/pages/ParentLandingPage';
import StudentLandingPage from '@/pages/StudentLandingPage';
import RegistrationSuccess from '@/pages/RegistrationSuccess';
import VerifyEmail from '@/pages/VerifyEmail';
import OnboardingQuestions from '@/pages/OnboardingQuestions';
import MagicMoment from '@/pages/MagicMoment';
import ProActivated from '@/pages/ProActivated';

import Profile from '@/pages/Profile';
import ProfileEdit from '@/pages/ProfileEdit';

import ResetPassword from '@/pages/ResetPassword';
import Logout from '@/pages/Logout';
import AdminV2 from '@/pages/AdminV2';
import EngagementAgentDashboard from '@/pages/EngagementAgentDashboard';

import PaywallAnalyticsDashboard from '@/pages/PaywallAnalyticsDashboard';
import CliffScout from '@/pages/CliffScout';
import ActionPlanArchitect from '@/pages/ActionPlanArchitect';
import Unsubscribe from '@/pages/Unsubscribe';
import JillOsinoffDashboard from '@/pages/JillOsinoffDashboard';
import CompanyIntelDashboard from '@/pages/CompanyIntelDashboard';
import CliffChat from '@/pages/CliffChat';
import CliffJobWorkspace from '@/pages/CliffJobWorkspace';
import CliffMemory from '@/pages/CliffMemory';
import Stats from '@/pages/Stats';
import CliffWins from '@/pages/CliffWins';
import BlogAICareerTools from '@/pages/BlogAICareerTools';
import AiResumeBuilder from '@/pages/seo/AiResumeBuilder';
import AtsResumeChecker from '@/pages/seo/AtsResumeChecker';
import InterviewPrep from '@/pages/seo/InterviewPrep';
import JobApplicationTracker from '@/pages/seo/JobApplicationTracker';
import LinkedinReview from '@/pages/seo/LinkedinReview';
import Pricing from '@/pages/seo/Pricing';
import About from '@/pages/seo/About';
import Customers from '@/pages/seo/Customers';
import VsJobright from '@/pages/seo/VsJobright';
import VsSimplify from '@/pages/seo/VsSimplify';
import Changelog from '@/pages/Changelog';

const { Pages, Layout } = pagesConfig;

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

  // Preview bypass: let the owner account view guarded dashboards directly,
  // regardless of persona/onboarding state.
  if (user.email === 'josinoff@gmail.com' || user.email === 'losinoff@gmail.com') return children;

  const hasPersona = !!user.persona?.trim();
  const onboardingDone = user.onboarding_completed === true;

  if (hasPersona && onboardingDone) {
    // Force Magic Moment for students who haven't completed it yet.
    // Existing users who completed MM on this device are bypassed via localStorage.
    if (user.persona === 'student' || user.roles?.includes('student')) {
      let mmDone = user.magic_moment_completed === true;
      if (!mmDone) {
        try { mmDone = !!localStorage.getItem('cff_magic_moment_completed_at'); } catch {}
      }
      if (!mmDone) return <Navigate to="/MagicMoment" replace />;
    }
    return children;
  }

  if (hasPersona && !onboardingDone) {
    if (user.persona === 'parent' || user.roles?.includes('parent')) {
      return <Navigate to="/ParentOnboarding" replace />;
    }
    // Students who dropped off mid-funnel resume the single onboarding flow,
    // which GatorAuth restores at the screen they left.
    if (user.persona === 'student' || user.roles?.includes('student')) {
      return <Navigate to="/GatorAuth" replace />;
    }
    return <Navigate to="/GatorAuth" replace />;
  }

  if (!hasPersona) {
    // No persona = always needs onboarding, regardless of account age
    return <Navigate to="/GatorAuth" replace />;
  }

  return children;
}

// HashRouter only reads the URL hash, so a clean URL like /ai-resume-builder
// resolves to the "/" route and would render the homepage. The homepage route
// delegates to the matching SEO landing page when the real browser pathname is
// one of the public SEO pages — no redirect or reload needed.
function RootRoute() {
  const realPath = window.location.pathname;
  const seoPages = {
    '/ai-resume-builder': AiResumeBuilder,
    '/ats-resume-checker': AtsResumeChecker,
    '/interview-prep': InterviewPrep,
    '/job-application-tracker': JobApplicationTracker,
    '/linkedin-review': LinkedinReview,
    '/pricing': Pricing,
    '/about': About,
    '/customers': Customers,
    '/vs/jobright': VsJobright,
    '/vs/simplify': VsSimplify,
    '/changelog': Changelog,
  };
  const SeoPage = seoPages[realPath];
  if (SeoPage) return <SeoPage />;
  return <StudentLandingPage />;
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
  const noSpinnerPaths = ['', '/', 'gatorauth', 'getstarted', 'logout', 'resetpassword', 'forgot-password', 'studentlandingpage', 'parentlandingpage'];
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
      {/* Common auth URL aliases — these used to dead-end on UnknownRouteRedirect
          and bounce users back to the landing page (blank/white page bug). */}
      <Route path="/login" element={<GatorAuth />} />
      <Route path="/Login" element={<GatorAuth />} />
      <Route path="/signin" element={<GatorAuth />} />
      <Route path="/SignIn" element={<GatorAuth />} />
      <Route path="/signup" element={<GatorAuth />} />
      <Route path="/SignUp" element={<GatorAuth />} />
      <Route path="/sign-up" element={<GatorAuth />} />
      <Route path="/register" element={<GatorAuth />} />
      <Route path="/Register" element={<GatorAuth />} />
      <Route path="/MigrationSignIn" element={<Navigate to="/GatorAuth" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/GatorAuth" replace />} />
      <Route path="/Logout" element={<Logout />} />
      <Route path="/StudentLandingPage" element={<StudentLandingPage />} />
      <Route path="/ParentLandingPage" element={<ParentLandingPage />} />
      <Route path="/ResetPassword" element={<ResetPassword />} />
      <Route path="/Unsubscribe" element={<Unsubscribe />} />

      {/* Public SEO blog article — no guard, no app chrome */}
      <Route path="/blog/ai-career-tools-college-students" element={<BlogAICareerTools />} />

      {/* Public SEO product landing pages — indexable, no auth */}
      <Route path="/ai-resume-builder" element={<AiResumeBuilder />} />
      <Route path="/ats-resume-checker" element={<AtsResumeChecker />} />
      <Route path="/interview-prep" element={<InterviewPrep />} />
      <Route path="/job-application-tracker" element={<JobApplicationTracker />} />
      <Route path="/linkedin-review" element={<LinkedinReview />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/vs/jobright" element={<VsJobright />} />
      <Route path="/vs/simplify" element={<VsSimplify />} />
      <Route path="/changelog" element={<Changelog />} />

      {/* Onboarding routes — no guard */}
      <Route path="/StudentOnboarding" element={<LayoutWrapper currentPageName="StudentOnboarding"><StudentOnboarding /></LayoutWrapper>} />
      <Route path="/GatorWelcome" element={<Navigate to="/GatorAuth" replace />} />
      <Route path="/StudentWelcome" element={<Navigate to="/GatorAuth" replace />} />
      <Route path="/ParentWelcome" element={<Navigate to="/ParentAllSet" replace />} />
      <Route path="/ParentOnboarding" element={<LayoutWrapper currentPageName="ParentOnboarding"><ParentOnboarding /></LayoutWrapper>} />
      <Route path="/ParentUpsell" element={<Navigate to="/ParentAllSet" replace />} />
      <Route path="/ParentAllSet" element={<ParentAllSet />} />
      <Route path="/RegistrationSuccess" element={<RegistrationSuccess />} />
      {/* Destination of the signup verification email link. Without this route the
          link dead-ended on the platform's generic "Thank you for joining" screen. */}
      <Route path="/VerifyEmail" element={<VerifyEmail />} />
      <Route path="/OnboardingQuestions" element={<OnboardingQuestions />} />
      <Route path="/MagicMoment" element={<MagicMoment />} />
      <Route path="/ProActivated" element={<ProActivated />} />
      <Route path="/SetSearchGoals" element={<SetSearchGoals />} />

      {/* Guarded dashboard routes */}
      <Route path="/FreeTierDashboard" element={<OnboardingGuard><FreeTierDashboard /></OnboardingGuard>} />
      <Route path="/AlumniHome" element={<OnboardingGuard><FreeTierDashboard /></OnboardingGuard>} />

      {/* Redirect aliases */}
      <Route path="/AlumniAllSet" element={<Navigate to="/FreeTierDashboard" replace />} />
      <Route path="/AlumniOnboarding" element={<Navigate to="/FreeTierDashboard" replace />} />
      <Route path="/ParentHome" element={<Navigate to="/ParentAllSet" replace />} />
      <Route path="/Directory" element={<Navigate to="/FreeTierDashboard" replace />} />

      {/* Feature routes — ALL guarded (require auth + onboarding) */}
      <Route path="/FastIQAssessment" element={<Navigate to="/CareerAssessment" replace />} />
      <Route path="/ResumeTailoring" element={<OnboardingGuard><LayoutWrapper currentPageName="ResumeTailoring"><ResumeTailoring /></LayoutWrapper></OnboardingGuard>} />
      <Route path="/MockInterview" element={<OnboardingGuard><LayoutWrapper currentPageName="MockInterview"><MockInterview /></LayoutWrapper></OnboardingGuard>} />
      <Route path="/LinkedInReview" element={<OnboardingGuard><LayoutWrapper currentPageName="LinkedInReview"><LinkedInReview /></LayoutWrapper></OnboardingGuard>} />

      <Route path="/CareerAssessment" element={<OnboardingGuard><LayoutWrapper currentPageName="CareerAssessment"><CareerAssessment /></LayoutWrapper></OnboardingGuard>} />
      <Route path="/FastIQDashboard" element={<Navigate to="/FreeTierDashboard" replace />} />
      <Route path="/OutreachDrafts" element={<OnboardingGuard><LayoutWrapper currentPageName="OutreachDrafts"><OutreachDrafts /></LayoutWrapper></OnboardingGuard>} />
      <Route path="/ApplicationTracker" element={<OnboardingGuard><LayoutWrapper currentPageName="ApplicationTracker"><ApplicationTracker /></LayoutWrapper></OnboardingGuard>} />
      <Route path="/EmailConnectionSettings" element={<OnboardingGuard><LayoutWrapper currentPageName="EmailConnectionSettings"><EmailConnectionSettings /></LayoutWrapper></OnboardingGuard>} />
      <Route path="/email-callback" element={<EmailCallbackPage />} />
      <Route path="/Profile" element={<LayoutWrapper currentPageName="Profile"><Profile /></LayoutWrapper>} />
      <Route path="/ProfileEdit" element={<LayoutWrapper currentPageName="ProfileEdit"><ProfileEdit /></LayoutWrapper>} />
      <Route path="/ParentProfileEdit" element={<ParentProfileEdit />} />
      <Route path="/admin" element={<AdminV2 />} />
      <Route path="/engagement-agent" element={<EngagementAgentDashboard />} />
      <Route path="/paywall-analytics" element={<PaywallAnalyticsDashboard />} />
      <Route path="/cliff-scout" element={<CliffScout />} />
      <Route path="/action-plan-architect" element={<ActionPlanArchitect />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/jill-osinoff-dashboard" element={<JillOsinoffDashboard />} />
      <Route path="/company-intel" element={<OnboardingGuard><CompanyIntelDashboard /></OnboardingGuard>} />
      <Route path="/cliff-chat" element={<OnboardingGuard><CliffChat /></OnboardingGuard>} />
      <Route path="/CliffJobWorkspace" element={<OnboardingGuard><CliffJobWorkspace /></OnboardingGuard>} />
      <Route path="/CliffMemory" element={<OnboardingGuard><CliffMemory /></OnboardingGuard>} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/cliff-wins" element={<CliffWins />} />

      {/* Main routes */}
      <Route path="/" element={<RootRoute />} />
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
      <Route path="*" element={<UnknownRouteRedirect />} />
    </Routes>
  );
};


function App() {
  // Capture parent referral code (?pref=CODE) from student-shared links
  useEffect(() => {
    try {
      // Platform password-reset emails link to path-based URLs — forward them into hash routes
      if (window.location.pathname === '/reset-password') {
        window.location.replace(window.location.origin + '/#/ResetPassword' + window.location.search);
        return;
      }
      if (window.location.pathname === '/forgot-password') {
        window.location.replace(window.location.origin + '/#/GatorAuth');
        return;
      }
      const searchParams = new URLSearchParams(window.location.search);
      const hashQuery = window.location.hash.split('?')[1] || '';
      const hashParams = new URLSearchParams(hashQuery);
      const pref = searchParams.get('pref') || hashParams.get('pref');
      if (pref) localStorage.setItem('cff_parent_ref_code', pref.toUpperCase());
      // Student referral code from the referral blast (?ref__=CODE)
      const refCode = searchParams.get('ref__') || hashParams.get('ref__');
      if (refCode) localStorage.setItem('pendingReferralCode', refCode);
    } catch {}
  }, []);

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