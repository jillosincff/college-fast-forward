// Pages explicitly routed in App.jsx are excluded here to avoid duplicate routes.
// Only pages NOT already in App.jsx explicit routes belong here.
import AdminDashboard from './pages/AdminDashboard';
import AdminSetup from './pages/AdminSetup';
import CompanyProfile from './pages/CompanyProfile';
import CookiePolicy from './pages/CookiePolicy';
import FastIQ from './pages/FastIQ';
import GatorInviteCode from './pages/GatorInviteCode';
import GatorParentInvite from './pages/GatorParentInvite';
import InviteRequired from './pages/InviteRequired';
import MatchesReview from './pages/MatchesReview';
import MessageComposer from './pages/MessageComposer';
import MyApplications from './pages/MyApplications';
import MyMatches from './pages/MyMatches';
import MyMessages from './pages/MyMessages';
import MyRequests from './pages/MyRequests';
import Notifications from './pages/Notifications';
import FreeTierDashboard from './pages/FreeTierDashboard';
import ParentPledge from './pages/ParentPledge';
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
    "AdminDashboard": AdminDashboard,
    "AdminSetup": AdminSetup,
    "CompanyProfile": CompanyProfile,
    "CookiePolicy": CookiePolicy,
    "FastIQ": FastIQ,
    "GatorInviteCode": GatorInviteCode,
    "GatorParentInvite": GatorParentInvite,
    "InviteRequired": InviteRequired,
    "MatchesReview": MatchesReview,
    "MessageComposer": MessageComposer,
    "MyApplications": MyApplications,
    "MyMatches": MyMatches,
    "MyMessages": MyMessages,
    "MyRequests": MyRequests,
    "Notifications": Notifications,
    "ParentHome": FreeTierDashboard,
    "ParentPledge": ParentPledge,
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
    mainPage: "FreeTierDashboard",
    Pages: PAGES,
};