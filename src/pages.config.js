import AdminDashboard from './pages/AdminDashboard';
import AdminEmail from './pages/AdminEmail';
import AdminReferrals from './pages/AdminReferrals';
import AdminSetup from './pages/AdminSetup';
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
import InviteRequired from './pages/InviteRequired';
import LandingPage from './pages/LandingPage';
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
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import PostOpportunity from './pages/PostOpportunity';
import PostRequest from './pages/PostRequest';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import PublicProfile from './pages/PublicProfile';
import QuestionDetail from './pages/QuestionDetail';
import RequestInvite from './pages/RequestInvite';
import ShareExpertise from './pages/ShareExpertise';
import StudentOnboarding from './pages/StudentOnboarding';
import Terms from './pages/Terms';
import TestingDashboard from './pages/TestingDashboard';
import WelcomeRole from './pages/WelcomeRole';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminEmail": AdminEmail,
    "AdminReferrals": AdminReferrals,
    "AdminSetup": AdminSetup,
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
    "InviteRequired": InviteRequired,
    "LandingPage": LandingPage,
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
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PostOpportunity": PostOpportunity,
    "PostRequest": PostRequest,
    "Privacy": Privacy,
    "Profile": Profile,
    "ProfileEdit": ProfileEdit,
    "PublicProfile": PublicProfile,
    "QuestionDetail": QuestionDetail,
    "RequestInvite": RequestInvite,
    "ShareExpertise": ShareExpertise,
    "StudentOnboarding": StudentOnboarding,
    "Terms": Terms,
    "TestingDashboard": TestingDashboard,
    "WelcomeRole": WelcomeRole,
}

export const pagesConfig = {
    mainPage: "LandingPage",
    Pages: PAGES,
    Layout: __Layout,
};