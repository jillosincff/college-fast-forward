import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { navigate, useParams } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import ProfileCard from '@/components/profile/ProfileCard';
import DarkFooter from '@/components/common/DarkFooter';
import NotificationSettings from '@/components/notifications/NotificationSettings';
import ParentProfileNav from '@/components/profile/parent/ParentProfileNav';
import ParentProfileHeader from '@/components/profile/parent/ParentProfileHeader';
import ParentVisibilityCard from '@/components/profile/parent/ParentVisibilityCard';
import ParentIntroCard from '@/components/profile/parent/ParentIntroCard';
import ParentStudentCard from '@/components/profile/parent/ParentStudentCard';
import ParentNotificationCard from '@/components/profile/parent/ParentNotificationCard';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function Profile() {
  const { user: currentUser, isLoading: authIsLoading } = useAuth();
  const { id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Inject fonts
    if (!document.getElementById('profile-fonts')) {
      const link = document.createElement('link');
      link.id = 'profile-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      if (!id && currentUser) {
        setProfileUser(currentUser);
        setIsLoading(false);
        return;
      }

      const profileId = id || currentUser?.id;
      if (!profileId) {
        if (!authIsLoading) {
          setIsLoading(false);
          setError('No profile to display. Please log in.');
        }
        return;
      }

      try {
        const userToDisplay = await User.get(profileId);
        setProfileUser(userToDisplay);
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

    fetchProfile();
  }, [id, currentUser, authIsLoading]);

  const isParent = currentUser?.persona === 'parent' || currentUser?.roles?.includes('parent');

  if (authIsLoading || isLoading) {
    const bg = isParent ? '#0A0A0A' : '#f4f2ee';
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
        {isParent ? <ParentProfileNav user={currentUser} /> : <DashboardNav user={currentUser} currentPage="Profile" />}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid #E85D20', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    const bg = isParent ? '#0A0A0A' : '#f4f2ee';
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
        {isParent ? <ParentProfileNav user={currentUser} /> : <DashboardNav user={currentUser} currentPage="Profile" />}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, color: '#888' }}>{error || 'Please log in to see your profile.'}</p>
            <button onClick={() => navigate('Dashboard')} style={{
              marginTop: 16, fontFamily: dmSans, fontSize: 13, fontWeight: 500,
              color: '#fff', background: '#E85D20', border: 'none', borderRadius: 100,
              padding: '10px 24px', cursor: 'pointer', minHeight: 'auto',
            }}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const isMyProfile = currentUser && profileUser && currentUser.id === profileUser.id;
  const showParentProfile = isParent && isMyProfile && !id;

  // Parent-specific dark profile
  if (showParentProfile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
        <ParentProfileNav user={currentUser} currentPage="Profile" />
        <main style={{ flex: 1, maxWidth: 700, margin: '0 auto', width: '100%', padding: '32px 24px 80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ParentProfileHeader user={profileUser} />
            <ParentVisibilityCard user={profileUser} />
            <ParentIntroCard user={profileUser} />
            <ParentStudentCard user={profileUser} />
            <ParentNotificationCard user={profileUser} />
          </div>
        </main>
      </div>
    );
  }

  // Default profile (students, alumni, etc.)
  const showNotifSettings = isMyProfile && (
    profileUser.persona === 'alumni' || profileUser.roles?.includes('alumni')
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav user={currentUser} currentPage="Profile" />

      <main style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%', padding: '32px 24px 60px' }}>
        <ProfileCard user={profileUser} isMyProfile={isMyProfile} />

        {showNotifSettings && (
          <div style={{ marginTop: 24 }}>
            <NotificationSettings user={profileUser} />
          </div>
        )}
      </main>

      <DarkFooter />
    </div>
  );
}