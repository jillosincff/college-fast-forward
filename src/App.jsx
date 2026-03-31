// App.css removed — styles handled by globals.css
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import FreeTierDashboard from '@/pages/FreeTierDashboard';
import FastIQAssessment from '@/pages/FastIQAssessment';
import StudentOnboarding from '@/pages/StudentOnboarding';
import ResumeTailoring from '@/pages/ResumeTailoring';
import MockInterview from '@/pages/MockInterview';
import LinkedInReview from '@/pages/LinkedInReview';
import GatorAuth from '@/pages/GatorAuth';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : Pages[Object.keys(Pages)[0]];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app
      return (
        <Routes>
          {/* Public/Auth routes - no layout wrapper */}
          <Route path="/GetStarted" element={<GatorAuth />} />

          {/* Explicit routes first for higher priority */}
          <Route path="/FreeTierDashboard" element={<LayoutWrapper currentPageName="FreeTierDashboard"><FreeTierDashboard /></LayoutWrapper>} />
          <Route path="/FastIQAssessment" element={<LayoutWrapper currentPageName="FastIQAssessment"><FastIQAssessment /></LayoutWrapper>} />
          <Route path="/StudentOnboarding" element={<LayoutWrapper currentPageName="StudentOnboarding"><StudentOnboarding /></LayoutWrapper>} />
          <Route path="/ResumeTailoring" element={<LayoutWrapper currentPageName="ResumeTailoring"><ResumeTailoring /></LayoutWrapper>} />
          <Route path="/MockInterview" element={<LayoutWrapper currentPageName="MockInterview"><MockInterview /></LayoutWrapper>} />
          <Route path="/LinkedInReview" element={<LayoutWrapper currentPageName="LinkedInReview"><LinkedInReview /></LayoutWrapper>} />

          {/* Main routes */}
          <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
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