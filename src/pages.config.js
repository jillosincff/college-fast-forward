/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAdvisor from './pages/AIAdvisor';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmail from './pages/AdminEmail';
import AdminReferrals from './pages/AdminReferrals';
import AdminSetup from './pages/AdminSetup';
import AlumniDashboard from './pages/AlumniDashboard';
import AuthTest from './pages/AuthTest';
import CompanyProfile from './pages/CompanyProfile';
import Connections from './pages/Connections';
import CookiePolicy from './pages/CookiePolicy';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import GatorAuth from './pages/GatorAuth';
import GatorDirectory from './pages/GatorDirectory';
import GatorInviteCode from './pages/GatorInviteCode';
import GatorParentInvite from './pages/GatorParentInvite';
import GatorRoleSelection from './pages/GatorRoleSelection';
import GatorWelcome from './pages/GatorWelcome';
import Insights from './pages/Insights';
import InviteRequired from './pages/InviteRequired';
import LandingPage from './pages/LandingPage';
import MatchesReview from './pages/MatchesReview';
import MessageComposer from './pages/MessageComposer';
import MyApplications from './pages/MyApplications';
import MyImpact from './pages/MyImpact';
import MyMatches from './pages/MyMatches';
import MyMessages from './pages/MyMessages';
import MyRequests from './pages/MyRequests';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Opportunities from './pages/Opportunities';
import ParentDashboard from './pages/ParentDashboard';
import ParentOnboarding from './pages/ParentOnboarding';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import PostOpportunity from './pages/PostOpportunity';
import PostRequest from './pages/PostRequest';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import PublicProfile from './pages/PublicProfile';
import QuestionDetail from './pages/QuestionDetail';
import ReferralAnswer from './pages/ReferralAnswer';
import RequestInvite from './pages/RequestInvite';
import ShareExpertise from './pages/ShareExpertise';
import StudentOnboarding from './pages/StudentOnboarding';
import Terms from './pages/Terms';
import TestingDashboard from './pages/TestingDashboard';
import UnsubscribeReengagement from './pages/UnsubscribeReengagement';
import WelcomeRole from './pages/WelcomeRole';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAdvisor": AIAdvisor,
    "AdminDashboard": AdminDashboard,
    "AdminEmail": AdminEmail,
    "AdminReferrals": AdminReferrals,
    "AdminSetup": AdminSetup,
    "AlumniDashboard": AlumniDashboard,
    "AuthTest": AuthTest,
    "CompanyProfile": CompanyProfile,
    "Connections": Connections,
    "CookiePolicy": CookiePolicy,
    "Dashboard": Dashboard,
    "Favorites": Favorites,
    "GatorAuth": GatorAuth,
    "GatorDirectory": GatorDirectory,
    "GatorInviteCode": GatorInviteCode,
    "GatorParentInvite": GatorParentInvite,
    "GatorRoleSelection": GatorRoleSelection,
    "GatorWelcome": GatorWelcome,
    "Insights": Insights,
    "InviteRequired": InviteRequired,
    "LandingPage": LandingPage,
    "MatchesReview": MatchesReview,
    "MessageComposer": MessageComposer,
    "MyApplications": MyApplications,
    "MyImpact": MyImpact,
    "MyMatches": MyMatches,
    "MyMessages": MyMessages,
    "MyRequests": MyRequests,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "Opportunities": Opportunities,
    "ParentDashboard": ParentDashboard,
    "ParentOnboarding": ParentOnboarding,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PostOpportunity": PostOpportunity,
    "PostRequest": PostRequest,
    "Privacy": Privacy,
    "Profile": Profile,
    "ProfileEdit": ProfileEdit,
    "PublicProfile": PublicProfile,
    "QuestionDetail": QuestionDetail,
    "ReferralAnswer": ReferralAnswer,
    "RequestInvite": RequestInvite,
    "ShareExpertise": ShareExpertise,
    "StudentOnboarding": StudentOnboarding,
    "Terms": Terms,
    "TestingDashboard": TestingDashboard,
    "UnsubscribeReengagement": UnsubscribeReengagement,
    "WelcomeRole": WelcomeRole,
}

export const pagesConfig = {
    mainPage: "LandingPage",
    Pages: PAGES,
    Layout: __Layout,
};