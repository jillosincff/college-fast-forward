import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { navigate, useParams } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import ProfileCard from '@/components/profile/ProfileCard';
import DarkFooter from '@/components/common/DarkFooter';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";

function readOnboardingData() {
  try {
    const seeking = localStorage.getItem('cff_seeking') || '';
    const frustration = parseInt(localStorage.getItem('cff_frustration') || '0', 10) || null;
    const blockers = JSON.parse(localStorage.getItem('cff_blockers') || '[]');
    const industries = JSON.parse(localStorage.getItem('cff_industries') || '[]');
    const targetRoles = JSON.parse(localStorage.getItem('cff_target_roles') || '[]');
    const locationPref = localStorage.getItem('cff_location_pref') || '';
    const locationCity = localStorage.getItem('cff_location_city') || '';
    const college = localStorage.getItem('cff_college') || '';
    return { seeking, frustration, blockers, industries, targetRoles, locationPref, locationCity, college };
  } catch {
    return { seeking: '', frustration: null, blockers: [], industries: [], targetRoles: [], locationPref: '', locationCity: '', college: '' };
  }
}

export default function Profile() {
  const { user: currentUser, isLoading: authIsLoading } = useAuth();
  const { id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [parentCompany, setParentCompany] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!document.getElementById('profile-fonts')) {
      const link = document.createElement('link');
      link.id = 'profile-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      setParentCompany(null);
      setOnboardingData(readOnboardingData());

      if (!id && currentUser) {
        setProfileUser(currentUser);
        try {
          const records = await base44.entities.ParentNetworkProfile.filter({ created_by_id: currentUser.id });
          if (records?.length > 0) setParentCompany(records[0].company_name);
        } catch (e) { /* non-blocking */ }
        setIsLoading(false);
        return;
      }

      const profileId = id || currentUser?.id;
      if (!profileId) {
        if (authIsLoading) return;
        setIsLoading(false);
        return;
      }

      try {
        const userToDisplay = await User.get(profileId);
        setProfileUser(userToDisplay);
        try {
          const records = await base44.entities.ParentNetworkProfile.filter({ created_by_id: profileId });
          if (records?.length > 0) setParentCompany(records[0].company_name);
        } catch (e) { /* non-blocking */ }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (currentUser && currentUser.id === profileId) {
          setProfileUser(currentUser);
        } else {
          setError('Could not load profile.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!authIsLoading) fetchProfile();
  }, [id, currentUser?.id, authIsLoading]);

  if ((authIsLoading && !currentUser) || isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav user={currentUser} currentPage="Profile" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #6d28d9', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav user={currentUser} currentPage="Profile" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, color: '#475569' }}>{error || 'Please log in to see your profile.'}</p>
            <button onClick={() => navigate('Dashboard')} style={{
              marginTop: 16, fontFamily: dmSans, fontSize: 13, fontWeight: 600,
              color: '#fff', background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)', border: 'none', borderRadius: 8,
              padding: '10px 24px', cursor: 'pointer', minHeight: 'auto',
            }}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const isMyProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav user={currentUser} currentPage="Profile" />

      <main style={{ flex: 1, maxWidth: 640, margin: '0 auto', width: '100%', padding: '32px 20px 60px' }}>
        <ProfileCard
          user={profileUser}
          parentCompany={parentCompany}
          onboardingData={onboardingData}
          isMyProfile={isMyProfile}
        />
      </main>

      <DarkFooter />
    </div>
  );
}