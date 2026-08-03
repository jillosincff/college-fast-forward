import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileFooter from '@/components/profile/ProfileFooter';
import ProfileCard from '@/components/profile/ProfileCard';
import CareerGoalsSnapshot from '@/components/profile/CareerGoalsSnapshot';
import { base44 } from '@/api/base44Client';
import { buildCareerGoalsFromOnboarding } from '@/lib/onboardingGoals';

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
    const resumeUrl = localStorage.getItem('cff_resume_url') || '';
    return { seeking, frustration, blockers, industries, targetRoles, locationPref, locationCity, college, resumeUrl };
  } catch {
    return { seeking: '', frustration: null, blockers: [], industries: [], targetRoles: [], locationPref: '', locationCity: '', college: '', resumeUrl: '' };
  }
}

export default function Profile() {
  const { user: currentUser, isLoading: authIsLoading } = useAuth();
  const { id } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [parentInfo, setParentInfo] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);
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
      setParentInfo(null);
      setResumeInfo(null);
      setOnboardingData(readOnboardingData());

      if (!id && currentUser) {
        let userForDisplay = currentUser;
        // Self-heal: students who onboarded before career_goals was persisted
        // have their answers only in localStorage — sync them to the account
        // once so "My Search Preferences" matches the onboarding data above it.
        try {
          const goals = currentUser.career_goals || {};
          const hasGoals = (goals.target_industries?.length || goals.target_roles?.length || goals.location_preference);
          const ob = readOnboardingData();
          if (!hasGoals && (ob.industries.length || ob.targetRoles.length || ob.seeking || ob.locationCity || ob.locationPref)) {
            const location = ob.locationPref === 'remote' ? 'remote' : (ob.locationCity || '');
            await base44.auth.updateMe({
              career_goals: buildCareerGoalsFromOnboarding({ seeking: ob.seeking, industries: ob.industries, targetRoles: ob.targetRoles, location }),
              ...(location ? { location: location === 'remote' ? 'Remote' : location } : {}),
            });
            userForDisplay = await base44.auth.me();
          }
        } catch (e) { /* non-blocking */ }
        setProfileUser(userForDisplay);
        try {
          const records = await base44.entities.ParentNetworkProfile.filter({ created_by_id: currentUser.id });
          if (records?.length > 0) setParentInfo(records[0]);
        } catch (e) { /* non-blocking */ }
        try {
          const resumes = await base44.entities.Resume.filter({ student_email: currentUser.email });
          if (resumes?.length > 0) {
            const active = resumes.find(r => r.is_active) || resumes[0];
            setResumeInfo({ hasResume: true, resumeName: active.name || active.original_file_name || 'Resume on file' });
          } else {
            setResumeInfo({ hasResume: false, resumeName: '' });
          }
        } catch (e) { setResumeInfo({ hasResume: false, resumeName: '' }); }
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
        let userToDisplay;
        if (id) {
          const res = await base44.functions.invoke('getPublicUserInfo', { userId: profileId });
          userToDisplay = res?.data?.data || null;
          if (!userToDisplay) throw new Error('Profile not available');
        } else {
          userToDisplay = await base44.auth.me();
        }
        setProfileUser(userToDisplay);
        try {
          const records = await base44.entities.ParentNetworkProfile.filter({ created_by_id: profileId });
          if (records?.length > 0) setParentInfo(records[0]);
        } catch (e) { /* non-blocking */ }
        try {
          const userEmail = userToDisplay?.email || currentUser?.email;
          if (userEmail) {
            const resumes = await base44.entities.Resume.filter({ student_email: userEmail });
            if (resumes?.length > 0) {
              const active = resumes.find(r => r.is_active) || resumes[0];
              setResumeInfo({ hasResume: true, resumeName: active.name || active.original_file_name || 'Resume on file' });
            } else {
              setResumeInfo({ hasResume: false, resumeName: '' });
            }
          }
        } catch (e) { setResumeInfo({ hasResume: false, resumeName: '' }); }
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
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#475569' }}>{error || 'Please log in to see your profile.'}</p>
            <button onClick={() => navigate('FreeTierDashboard')} style={{
              marginTop: 16, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
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
      <ProfileHeader user={currentUser} isMyProfile={isMyProfile} />

      <main style={{ flex: 1, maxWidth: 640, margin: '0 auto', width: '100%', padding: '32px 20px 60px' }}>
        <ProfileCard
          user={profileUser}
          parentInfo={parentInfo}
          resumeInfo={resumeInfo}
          onboardingData={onboardingData}
          isMyProfile={isMyProfile}
        />
        {isMyProfile && <CareerGoalsSnapshot user={profileUser} />}
      </main>

      <ProfileFooter />
    </div>
  );
}