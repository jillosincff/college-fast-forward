import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, TrendingUp, Award, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TalentSpotlightCard from '@/components/talent/TalentSpotlightCard';
import ReachOutModal from '@/components/talent/ReachOutModal';
import { trackEvent } from '@/components/utils/analytics';
import { HERO_BG_GRADIENT, HERO_TEXTURE_OVERLAY, HERO_GLOW_EFFECTS, HERO_HEADING_CLASSES, HERO_SUBHEADING_CLASSES } from '@/components/home/HeroStyles';

export default function TalentSpotlight() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showReachOutModal, setShowReachOutModal] = useState(false);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    graduationYear: 'all',
    major: 'all',
    lookingFor: 'all',
    skills: []
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('getTalentSpotlightStudents', {});
      
      if (response.data.success) {
        setStudents(response.data.students || []);
        setFilteredStudents(response.data.students || []);
      } else {
        throw new Error(response.data.error || 'Failed to load students');
      }
    } catch (error) {
      console.error('Failed to load talent spotlight students:', error);
      setError(error.message || 'Failed to load students');
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, students]);

  const applyFilters = () => {
    let filtered = [...students];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.full_name?.toLowerCase().includes(query) ||
        s.major?.toLowerCase().includes(query) ||
        s.bio?.toLowerCase().includes(query) ||
        s.skills_showcase?.some(skill => skill.toLowerCase().includes(query)) ||
        s.target_roles?.toLowerCase().includes(query)
      );
    }

    if (filters.graduationYear !== 'all') {
      filtered = filtered.filter(s => s.graduation_year?.toString() === filters.graduationYear);
    }

    if (filters.major !== 'all') {
      filtered = filtered.filter(s => s.major === filters.major);
    }

    if (filters.lookingFor !== 'all') {
      filtered = filtered.filter(s => s.looking_for?.includes(filters.lookingFor));
    }

    setFilteredStudents(filtered);
  };

  const handleReachOut = (student) => {
    trackEvent('talent_spotlight_reach_out_clicked', { studentId: student.id });
    setSelectedStudent(student);
    setShowReachOutModal(true);
  };

  const uniqueGradYears = [...new Set(students.map(s => s.graduation_year).filter(Boolean))].sort();
  const uniqueMajors = [...new Set(students.map(s => s.major).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-orange-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white py-16 px-4" style={HERO_BG_GRADIENT}>
        {HERO_TEXTURE_OVERLAY}
        {HERO_GLOW_EFFECTS}

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
            <h1 className={HERO_HEADING_CLASSES}>Talent Spotlight</h1>
          </div>
          <p className={`${HERO_SUBHEADING_CLASSES} max-w-3xl mb-6 mx-auto`}>
            Discover exceptional Gator talent ready for opportunities
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Badge className="bg-white/20 text-white border-white/40 px-4 py-2 hover:bg-white/30">
              <Star className="w-4 h-4 mr-2" />
              {students.length} Students Featured
            </Badge>
            <Badge className="bg-white/20 text-white border-white/40 px-4 py-2 hover:bg-white/30">
              <TrendingUp className="w-4 h-4 mr-2" />
              100% UF Verified
            </Badge>
            <Badge className="bg-white/20 text-white border-white/40 px-4 py-2 hover:bg-white/30">
              <Award className="w-4 h-4 mr-2" />
              Top-Rated Profiles
            </Badge>
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl shadow-xl p-8 text-center text-white border-4 border-white/20">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 animate-pulse" />
            <h2 className="text-3xl font-bold">Coming Soon!</h2>
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <p className="text-xl font-medium text-white/90">
            We're building something amazing to showcase Gator talent. Stay tuned! 🐊
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, skills, major, or career goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-2 focus:border-[#0021A5]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                className="px-4 py-3 border-2 rounded-lg focus:border-[#0021A5] focus:outline-none"
                value={filters.graduationYear}
                onChange={(e) => setFilters({...filters, graduationYear: e.target.value})}
              >
                <option value="all">All Graduation Years</option>
                {uniqueGradYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                className="px-4 py-3 border-2 rounded-lg focus:border-[#0021A5] focus:outline-none"
                value={filters.major}
                onChange={(e) => setFilters({...filters, major: e.target.value})}
              >
                <option value="all">All Majors</option>
                {uniqueMajors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>

              <select
                className="px-4 py-3 border-2 rounded-lg focus:border-[#0021A5] focus:outline-none"
                value={filters.lookingFor}
                onChange={(e) => setFilters({...filters, lookingFor: e.target.value})}
              >
                <option value="all">Looking For...</option>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
                <option value="Research">Research</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Projects">Projects</option>
              </select>

              <Button 
                variant="outline" 
                className="border-2"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ graduationYear: 'all', major: 'all', lookingFor: 'all', skills: [] });
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#0021A5] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Failed to Load Students</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={loadStudents} variant="outline" className="border-red-300">
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredStudents.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <AnimatePresence>
              {filteredStudents.map(student => (
                <TalentSpotlightCard
                  key={student.id}
                  student={student}
                  onReachOut={() => handleReachOut(student)}
                  currentUser={user}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && !error && filteredStudents.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600 mb-6">
              {students.length === 0 
                ? "No students have opted into Talent Spotlight yet. Check back soon!"
                : "Try adjusting your search or filters"}
            </p>
            {students.length > 0 && (
              <Button onClick={() => {
                setSearchQuery('');
                setFilters({ graduationYear: 'all', major: 'all', lookingFor: 'all', skills: [] });
              }}>
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {selectedStudent && (
        <ReachOutModal
          isOpen={showReachOutModal}
          onClose={() => {
            setShowReachOutModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          currentUser={user}
        />
      )}
    </div>
  );
}