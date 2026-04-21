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
// Pages explicitly routed in App.jsx are excluded here to avoid duplicate routes.
// Only pages NOT already in App.jsx explicit routes belong here.
import HomePage from './pages/HomePage';
import AIAdvisor from './pages/AIAdvisor';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmail from './pages/AdminEmail';
import AdminReferrals from './pages/AdminReferrals';
import AdminSetup from './pages/AdminSetup';
import AlumniDashboard from './pages/AlumniDashboard';
import AuthTest from './pages/AuthTest';
import CompanyProfile from './pages/CompanyProfile';
import CookiePolicy from './pages/CookiePolicy';
import Dashboard from './pages/Dashboard';
import FastIQ from './pages/FastIQ';
import FastIQOnboarding from './pages/FastIQOnboarding';
import Favorites from './pages/Favorites';
import GatorInviteCode from './pages/GatorInviteCode';
import GatorParentInvite from './pages/GatorParentInvite';
import GatorWelcome from './pages/GatorWelcome';
import Insights from './pages/Insights';
import InviteRequired from './pages/InviteRequired';
// LandingPage removed — redirected to "/" via App.jsx which serves StudentLandingPage
import MatchesReview from './pages/MatchesReview';
import MessageComposer from './pages/MessageComposer';
import MyApplications from './pages/MyApplications';
import MyMatches from './pages/MyMatches';
import MyMessages from './pages/MyMessages';
import MyRequests from './pages/MyRequests';
import Notifications from './pages/Notifications';
import Opportunities from './pages/Opportunities';
import ParentHome from './pages/ParentHome';
import ParentPledge from './pages/ParentPledge';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';
import PostOpportunity from './pages/PostOpportunity';
import PostRequest from './pages/PostRequest';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import RequestInvite from './pages/RequestInvite';
import SubmitFeedback from './pages/SubmitFeedback';
import Terms from './pages/Terms';
import TestingDashboard from './pages/TestingDashboard';
import UnsubscribeReengagement from './pages/UnsubscribeReengagement';

export const PAGES = {
    "AIAdvisor": AIAdvisor,
    "AdminDashboard": AdminDashboard,
    "AdminEmail": AdminEmail,
    "AdminReferrals": AdminReferrals,
    "AdminSetup": AdminSetup,
    "AlumniDashboard": AlumniDashboard,
    "AuthTest": AuthTest,
    "CompanyProfile": CompanyProfile,
    "CookiePolicy": CookiePolicy,
    "Dashboard": Dashboard,
    "FastIQ": FastIQ,
    "FastIQOnboarding": FastIQOnboarding,
    "Favorites": Favorites,
    "GatorInviteCode": GatorInviteCode,
    "GatorParentInvite": GatorParentInvite,
    "GatorWelcome": GatorWelcome,
    "Insights": Insights,
    "InviteRequired": InviteRequired,
    "MatchesReview": MatchesReview,
    "MessageComposer": MessageComposer,
    "MyApplications": MyApplications,
    "MyMatches": MyMatches,
    "MyMessages": MyMessages,
    "MyRequests": MyRequests,
    "Notifications": Notifications,
    "Opportunities": Opportunities,
    "ParentHome": ParentHome,
    "ParentPledge": ParentPledge,
    "PaymentCancel": PaymentCancel,
    "PaymentSuccess": PaymentSuccess,
    "PostOpportunity": PostOpportunity,
    "PostRequest": PostRequest,
    "Privacy": Privacy,
    "Profile": Profile,
    "PublicProfile": PublicProfile,
    "RequestInvite": RequestInvite,
    "SubmitFeedback": SubmitFeedback,
    "Terms": Terms,
    "TestingDashboard": TestingDashboard,
    "UnsubscribeReengagement": UnsubscribeReengagement,
}

export const pagesConfig = {
    mainPage: "HomePage",
    Pages: PAGES,
};