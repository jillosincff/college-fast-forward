import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import logger from '@/components/utils/logger';

import DirectoryHero from '../components/directory/DirectoryHero';
import DirectorySearchBar from '../components/directory/DirectorySearchBar';
import DirectoryMemberCard from '../components/directory/DirectoryMemberCard';
import DirectoryEmptyState from '../components/directory/DirectoryEmptyState';
import DirectoryLoadMore from '../components/directory/DirectoryLoadMore';
import MessageUserModal from '../components/directory/MessageUserModal';
import ProfileModal from '../components/directory/ProfileModal';

const PAGE_SIZE = 24;
const dmSans = "'DM Sans', system-ui, sans-serif";

export default function GatorDirectory() {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ members: 0, parents: 0, alumni: 0, students: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ persona: 'all', industry: 'all', helpType: 'all' });
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('directory-fonts')) {
      const link = document.createElement('link');
      link.id = 'directory-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const loadDirectoryData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rawResponse = await base44.functions.invoke('getDirectoryUsers', {});

      let usersArray = null;
      if (rawResponse?.data?.data && Array.isArray(rawResponse.data.data)) {
        usersArray = rawResponse.data.data;
      } else if (rawResponse?.data && Array.isArray(rawResponse.data)) {
        usersArray = rawResponse.data;
      } else if (Array.isArray(rawResponse)) {
        usersArray = rawResponse;
      } else if (rawResponse?.success && rawResponse?.data && Array.isArray(rawResponse.data)) {
        usersArray = rawResponse.data;
      }

      if (!usersArray || !Array.isArray(usersArray)) {
        throw new Error('Invalid data from server.');
      }

      const validUsers = usersArray.filter(u => u && u.full_name);
      setAllUsers(validUsers);

      const studentCount = validUsers.filter(u =>
        u.persona === 'student' || u.persona === 'gator' ||
        (u.roles && (u.roles.includes('student') || u.roles.includes('gator')))
      ).length;
      const alumniCount = validUsers.filter(u => u.persona === 'alumni' || (u.roles && u.roles.includes('alumni'))).length;
      const parentCount = validUsers.filter(u => u.persona === 'parent' || (u.roles && u.roles.includes('parent'))).length;

      setStats({ members: validUsers.length, students: studentCount, alumni: alumniCount, parents: parentCount });
      logger.info(`[Directory] Loaded ${validUsers.length} users.`);
    } catch (err) {
      console.error('[Directory] Failed to load users:', err);
      setError(err.message || 'Please try again in a few minutes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDirectoryData(); }, [loadDirectoryData]);

  // Listen for pull-to-refresh
  useEffect(() => {
    const handler = () => loadDirectoryData();
    document.addEventListener('cff:pull-refresh', handler);
    return () => document.removeEventListener('cff:pull-refresh', handler);
  }, [loadDirectoryData]);

  // Derive industries from data
  const industries = useMemo(() => {
    const unique = [...new Set(allUsers.map(u => u.industry).filter(Boolean))];
    return unique.sort();
  }, [allUsers]);

  // Normalize help tag for matching
  const normalizeHelpTag = (help) => {
    const h = (help || '').toLowerCase().replace(/_/g, ' ');
    if (h.includes('introduction') || h.includes('intro') || h.includes('networking')) return 'Intros';
    if (h.includes('resume') || h.includes('linkedin')) return 'Resume Review';
    if (h.includes('career') || h.includes('advice')) return 'Career Advice';
    if (h.includes('interview') || h.includes('mock')) return 'Interview Prep';
    if (h.includes('job') && (h.includes('lead') || h.includes('referral'))) return 'Job Referrals';
    if (h.includes('industry') || h.includes('insight')) return 'Industry Insights';
    return null;
  };

  // Filtered & sorted users
  const filteredUsers = useMemo(() => {
    let users = [...allUsers];

    // Sort: premium/founding first, then parents, then rest
    users.sort((a, b) => {
      const aP = a.is_founding_member || a.subscription_status === 'active' || a.persona === 'parent';
      const bP = b.is_founding_member || b.subscription_status === 'active' || b.persona === 'parent';
      if (aP && !bP) return -1;
      if (!aP && bP) return 1;
      if (a.is_founding_member && !b.is_founding_member) return -1;
      if (!a.is_founding_member && b.is_founding_member) return 1;
      return 0;
    });

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(u =>
        u.full_name?.toLowerCase().includes(term) ||
        u.company?.toLowerCase().includes(term) ||
        u.job_title?.toLowerCase().includes(term) ||
        u.industry?.toLowerCase().includes(term) ||
        u.major?.toLowerCase().includes(term) ||
        u.expertise_areas?.some(e => e.toLowerCase().includes(term))
      );
    }

    // Role filter
    if (filters.persona !== 'all') {
      users = users.filter(u => {
        if (filters.persona === 'student') return u.persona === 'student' || u.persona === 'gator';
        return u.persona === filters.persona;
      });
    }

    // Industry filter
    if (filters.industry !== 'all') {
      users = users.filter(u => u.industry === filters.industry);
    }

    // Help type filter
    if (filters.helpType !== 'all') {
      users = users.filter(u => {
        const allHelps = [...(u.ways_to_help || []), ...(u.primary_goal || [])];
        if (u.can_provide_referrals) allHelps.push('job_referral');
        return allHelps.some(h => normalizeHelpTag(h) === filters.helpType);
      });
    }

    return users;
  }, [allUsers, searchTerm, filters]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm, filters]);

  const visibleUsers = filteredUsers.slice(0, visibleCount);

  const handleMessage = (u) => { setSelectedUser(u); setMessageModalOpen(true); };
  const handleViewProfile = (userId) => { setSelectedProfileId(userId); setProfileModalOpen(true); };
  const resetFilters = () => { setSearchTerm(''); setFilters({ persona: 'all', industry: 'all', helpType: 'all' }); };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32, border: '3px solid #E85D20',
          borderTop: '3px solid transparent', borderRadius: '50%',
          animation: 'dirSpin 0.8s linear infinite',
        }} />
        <style>{`@keyframes dirSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <p style={{ fontFamily: dmSans, fontSize: 16, color: '#333', textAlign: 'center' }}>
          Something went wrong loading the directory.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', textAlign: 'center' }}>{error}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={loadDirectoryData} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
            background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 24px',
            cursor: 'pointer', minHeight: 'auto',
          }}>Try Again</button>
          <button onClick={() => navigate('Dashboard')} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#333',
            background: '#fff', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8,
            padding: '10px 24px', cursor: 'pointer', minHeight: 'auto',
          }}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <DirectoryHero stats={stats} loading={loading} />

      {/* Sticky search + filters */}
      <DirectorySearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        industries={industries}
        resultCount={filteredUsers.length}
      />

      {/* Cards */}
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '24px 24px 60px' }}>
        {filteredUsers.length === 0 ? (
          <DirectoryEmptyState onClearFilters={resetFilters} />
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
            className="directory-grid"
          >
            {visibleUsers.map(u => (
              <DirectoryMemberCard
                key={u.id}
                user={u}
                onMessage={handleMessage}
                onViewProfile={handleViewProfile}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
            {visibleUsers.map(u => (
              <DirectoryMemberCard
                key={u.id}
                user={u}
                onMessage={handleMessage}
                onViewProfile={handleViewProfile}
                viewMode="list"
              />
            ))}
          </div>
        )}

        {filteredUsers.length > 0 && (
          <DirectoryLoadMore
            visibleCount={visibleCount}
            totalCount={filteredUsers.length}
            onLoadMore={() => setVisibleCount(prev => prev + PAGE_SIZE)}
          />
        )}
      </div>

      {/* Footer handled by layout — no duplicate here */}

      {/* Responsive grid styles */}
      <style>{`
        .directory-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 768px) {
          .directory-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .directory-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Modals */}
      {selectedUser && (
        <MessageUserModal
          isOpen={isMessageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          recipientUser={selectedUser}
        />
      )}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={selectedProfileId}
        onMessage={handleMessage}
      />
    </div>
  );
}