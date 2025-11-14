import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    helps: 0,
    intros: 0,
    likes: 0,
    shares: 0,
    streak: 0,
    totalPoints: 0
  });
  const [preferences, setPreferences] = useState({
    industry: '',
    location: '',
    jobType: '',
    notifications: true
  });

  // Load user stats and preferences from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedStats = localStorage.getItem(`userStats_${user.id}`);
      const savedPrefs = localStorage.getItem(`userPrefs_${user.id}`);
      
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }
      
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      } else {
        // Set default preferences based on user profile
        setPreferences({
          industry: user.current_company ? 'tech' : '',
          location: user.location || '',
          jobType: user.persona === 'student' ? 'internship' : 'full_time',
          notifications: true
        });
      }
    }
  }, [user]);

  // Save to localStorage whenever stats change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`userStats_${user.id}`, JSON.stringify(userStats));
    }
  }, [userStats, user]);

  const updateUserStats = (type, increment = 1) => {
    setUserStats(prev => {
      const newStats = {
        ...prev,
        [type]: prev[type] + increment,
        totalPoints: prev.totalPoints + (increment * getPointsForAction(type))
      };
      
      return newStats;
    });
  };

  const getPointsForAction = (type) => {
    const pointsMap = {
      helps: 10,
      intros: 15,
      likes: 1,
      shares: 5
    };
    return pointsMap[type] || 0;
  };

  const updatePreferences = (newPrefs) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    
    if (user) {
      localStorage.setItem(`userPrefs_${user.id}`, JSON.stringify(updatedPrefs));
    }
  };

  const getUserLevel = () => {
    const { totalPoints } = userStats;
    if (totalPoints >= 500) return { level: 'Legend', color: 'from-yellow-400 to-orange-500' };
    if (totalPoints >= 200) return { level: 'Expert', color: 'from-purple-400 to-pink-500' };
    if (totalPoints >= 100) return { level: 'Helper', color: 'from-blue-400 to-indigo-500' };
    if (totalPoints >= 50) return { level: 'Rising Star', color: 'from-green-400 to-teal-500' };
    return { level: 'Newcomer', color: 'from-slate-400 to-slate-500' };
  };

  const getBadges = () => {
    const badges = [];
    const { helps, intros, likes, shares } = userStats;
    
    if (helps >= 20) badges.push({ type: 'crown', label: 'Help Master', color: 'text-yellow-500' });
    else if (helps >= 10) badges.push({ type: 'trophy', label: 'Super Helper', color: 'text-purple-500' });
    else if (helps >= 5) badges.push({ type: 'star', label: 'Helper', color: 'text-blue-500' });
    
    if (intros >= 10) badges.push({ type: 'handshake', label: 'Connector', color: 'text-green-500' });
    if (shares >= 20) badges.push({ type: 'megaphone', label: 'Amplifier', color: 'text-orange-500' });
    
    return badges;
  };

  const value = {
    userStats,
    preferences,
    updateUserStats,
    updatePreferences,
    getUserLevel,
    getBadges,
    getPointsForAction
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };