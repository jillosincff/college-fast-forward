import React, { useState, useEffect } from 'react';
import { RoommatePost } from '@/entities/RoommatePost';
import { useAuth } from '@/components/auth/AuthContext';
import RoommatePostCard from '@/components/roommates/RoommatePostCard';
import RoommateFilters from '@/components/roommates/RoommateFilters';
import PostListingModal from '@/components/roommates/PostListingModal';
import MessageUserModal from '@/components/directory/MessageUserModal';
import { Loader2, Plus, Search, Home, Users, TrendingUp, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

export default function RoommatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState(null);

  const [stats, setStats] = useState({
    totalListings: 0,
    newThisWeek: 0,
    nearbyCount: 0
  });

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    let filtered = [...posts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query) ||
        post.location?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(post => post.post_type === typeFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(post =>
        post.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, typeFilter, locationFilter]);

  const loadPosts = async (retryCount = 0) => {
    const MAX_RETRIES = 2;

    try {
      setLoading(true);
      setError(null);

      console.log('🏠 Roommates: Loading posts (attempt', retryCount + 1, ')...');

      // Add timeout wrapper
      const fetchWithTimeout = (timeoutMs = 15000) => {
        return Promise.race([
          RoommatePost.filter({ status: 'active' }, '-created_date', 50),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
          )
        ]);
      };

      const fetchedPosts = await fetchWithTimeout();
      const validPosts = Array.isArray(fetchedPosts) ? fetchedPosts : [];

      console.log(`✅ Roommates: Loaded ${validPosts.length} posts`);
      setPosts(validPosts);

      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const newThisWeek = validPosts.filter(post =>
        new Date(post.created_date) > oneWeekAgo
      ).length;

      const nearbyCount = validPosts.filter(post =>
        post.location && (
          post.location.toLowerCase().includes('gainesville') ||
          post.location.toLowerCase().includes('florida') ||
          post.location.toLowerCase().includes('fl')
        )
      ).length;

      setStats({
        totalListings: validPosts.length,
        newThisWeek,
        nearbyCount
      });

    } catch (error) {
      console.error('❌ Roommates: Error loading posts:', error);

      // Retry on network error
      if (retryCount < MAX_RETRIES && (error.message?.includes('Network Error') || error.message?.includes('timeout'))) {
        console.log(`🔄 Roommates: Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => loadPosts(retryCount + 1), 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      setError(error.message || 'Failed to load roommate posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSuccess = () => {
    setShowPostModal(false);
    setEditingPost(null);
    loadPosts();
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowPostModal(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      await RoommatePost.delete(postId);
      toast({
        title: "✅ Listing Deleted",
        description: "Your roommate listing has been removed.",
      });
      loadPosts(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast({
        title: "❌ Error",
        description: "Could not delete the listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMessageUser = (post, poster) => {
    console.log('🔵 handleMessageUser called', { post, poster });
    if (!poster || !poster.email) {
      console.error("❌ Cannot message user: poster info is missing.");
      return;
    }
    console.log('✅ Setting message recipient and opening modal');
    setMessageRecipient(poster);
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    console.log('🔴 Closing message modal');
    setIsMessageModalOpen(false);
    setMessageRecipient(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Find Your Post-Graduation Roommate
          </h1>
          <p className="text-xl text-white opacity-90 mb-8 max-w-3xl mx-auto">
            Moving to a new city after graduation? Connect with fellow Gators for shared housing and trusted roommates.
          </p>

          {user && (
            <Button
              onClick={() => setShowPostModal(true)}
              size="lg"
              className="bg-white text-[#FA4616] hover:bg-white/90 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Post a Listing
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters Section */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 my-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by location, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="seeking_roommate">Has a Place</SelectItem>
                <SelectItem value="seeking_room">Looking to Team Up</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </section>

        {/* Listings Section */}
        <section id="listings-section" className="pb-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0021A5] mb-4" />
              <span className="text-slate-600">Finding roommates...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-900 mb-2">Unable to Load Listings</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button
                onClick={() => loadPosts()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <RoommatePostCard
                  key={post.id}
                  post={post}
                  onMessage={handleMessageUser}
                  currentUserEmail={user?.email}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                <Home className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">
                {searchQuery || typeFilter !== 'all' || locationFilter
                  ? 'No listings match your search'
                  : 'No listings available'
                }
              </h3>
              <p className="text-slate-600 mt-2 max-w-md mx-auto">
                {searchQuery || typeFilter !== 'all' || locationFilter
                  ? 'Try adjusting your search criteria or be the first to post a listing in your area.'
                  : 'Be the first to post a listing and help fellow Gators find great housing!'
                }
              </p>
              {user && (
                <button
                  onClick={() => setShowPostModal(true)}
                  className="mt-6 bg-[#0021A5] hover:bg-[#001a7a] text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Post the First Listing
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <PostListingModal
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setEditingPost(null);
        }}
        onSuccess={handlePostSuccess}
        existingPost={editingPost}
      />

      <MessageUserModal
        isOpen={isMessageModalOpen && !!messageRecipient}
        onClose={handleCloseMessageModal}
        recipientUser={messageRecipient}
      />
    </div>
  );
}