
import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Trash2, Pause, Play, X, Save, AlertCircle, MoreVertical, Copy, Search } from 'lucide-react';
import { formatDistanceToNow, differenceInDays, addDays } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';

export default function MyPostsModal({ 
  isOpen, 
  onClose, 
  posts, 
  onUpdate, 
  onDelete,
  applicationsData = []
}) {
  const { toast } = useToast();
  const [editingPostId, setEditingPostId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts based on search
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title?.toLowerCase().includes(query) ||
      post.org_name?.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  const getOpportunityTypeLabel = (type) => {
    switch (type) {
      case 'student_gig':
        return 'Student Gig';
      case 'internship':
        return 'Internship';
      case 'job':
      case 'full_time':
        return 'Full-time';
      case 'part_time':
        return 'Part-time';
      default:
        return 'Opportunity';
    }
  };

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditFormData({
      title: post.title || '',
      description: post.description || '',
      org_name: post.org_name || '',
      location: `${post.city || ''}${post.city && post.state ? ', ' : ''}${post.state || ''}`.trim(),
      contact_url: post.contact_url || '',
      application_email: post.application_email || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (postId) => {
    setSavingId(postId);
    try {
      const locationParts = editFormData.location.split(',').map(s => s.trim());
      const updates = {
        title: editFormData.title,
        description: editFormData.description,
        org_name: editFormData.org_name,
        city: locationParts[0] || '',
        state: locationParts[1] || '',
        contact_url: editFormData.contact_url,
        application_email: editFormData.application_email,
      };
      
      await onUpdate(postId, updates);
      setEditingPostId(null);
      setEditFormData({});
      toast({
        title: "✅ Post updated",
        description: "Your changes have been saved."
      });
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast({
        title: "Failed to update",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleTogglePause = async (post) => {
    const newStatus = post.status === 'paused' ? 'active' : 'paused';
    const action = newStatus === 'paused' ? 'pause' : 'resume';
    
    if (!window.confirm(`Are you sure you want to ${action} "${post.title}"?`)) {
      return;
    }

    setSavingId(post.id);
    try {
      await onUpdate(post.id, { status: newStatus });
      toast({
        title: newStatus === 'paused' ? '⏸️ Post paused' : '▶️ Post resumed',
        description: newStatus === 'paused' ? 'Your post is now hidden from applicants.' : 'Your post is now visible to applicants.'
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Failed to update status",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (post) => {
    const applicationsCount = applicationsData.filter(app => app.opportunity_id === post.id).length;
    
    let confirmMessage = `Are you sure you want to delete "${post.title}"? This action cannot be undone.`;
    if (applicationsCount > 0) {
      confirmMessage = `"${post.title}" has received ${applicationsCount} ${applicationsCount === 1 ? 'application' : 'applications'}.\n\nConsider pausing instead of deleting.\n\nAre you sure you want to permanently delete this post?`;
    }
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSavingId(post.id);
    try {
      await onDelete(post.id);
      toast({
        title: "🗑️ Post deleted",
        description: "The opportunity has been removed."
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast({
        title: "Failed to delete",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDuplicate = async (post) => {
    // TODO: Implement duplicate functionality
    toast({
      title: "Coming soon",
      description: "Duplicate post feature will be available soon."
    });
  };

  // handleViewPublic function was removed as per the instructions.

  const handlePostNew = () => {
    onClose();
    navigate('PostOpportunity');
  };

  // Calculate days until expiration (30 days from created_date)
  const getDaysUntilExpiration = (createdDate) => {
    const expirationDate = addDays(new Date(createdDate), 30);
    const daysLeft = differenceInDays(expirationDate, new Date());
    return daysLeft;
  };

  const getExpirationStatus = (daysLeft) => {
    if (daysLeft < 0) return { text: 'Expired', color: 'bg-red-100 text-red-800', urgent: true };
    if (daysLeft === 0) return { text: 'Expires today', color: 'bg-red-100 text-red-800', urgent: true };
    if (daysLeft <= 3) return { text: `${daysLeft} days left`, color: 'bg-orange-100 text-orange-800', urgent: true };
    if (daysLeft <= 7) return { text: `${daysLeft} days left`, color: 'bg-yellow-100 text-yellow-800', urgent: false };
    return { text: `${daysLeft} days left`, color: 'bg-slate-100 text-slate-600', urgent: false };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <DialogTitle className="text-2xl font-bold text-slate-900">
                My Posted Opportunities
              </DialogTitle>
              <span className="text-base text-slate-500 font-medium">
                ({posts.length} {posts.length === 1 ? 'post' : 'active posts'})
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[200px] h-10"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Body - Posts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 px-8">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No posts found' : 'No Posts Yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'Try a different search term' : 'Share your first opportunity with the Gator network!'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={handlePostNew}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Post an Opportunity
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredPosts.map((post) => {
                const applicationsCount = applicationsData.filter(app => app.opportunity_id === post.id).length;
                const isEditing = editingPostId === post.id;
                const isSaving = savingId === post.id;
                const isPaused = post.status === 'paused';
                const viewsCount = post.views_count || 0;
                const daysLeft = getDaysUntilExpiration(post.created_date);
                const expirationStatus = getExpirationStatus(daysLeft);
                
                return (
                  <div 
                    key={post.id}
                    className={`px-8 py-6 hover:bg-slate-50 transition-colors ${isPaused ? 'opacity-70 bg-slate-50' : ''}`}
                  >
                    {isEditing ? (
                      /* EDIT MODE */
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${post.id}`} className="text-sm font-medium">Job Title</Label>
                            <Input
                              id={`title-${post.id}`}
                              value={editFormData.title}
                              onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                              placeholder="e.g. Marketing Intern"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`org-${post.id}`} className="text-sm font-medium">Company/Organization</Label>
                            <Input
                              id={`org-${post.id}`}
                              value={editFormData.org_name}
                              onChange={(e) => setEditFormData({...editFormData, org_name: e.target.value})}
                              placeholder="e.g. Acme Corp"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`desc-${post.id}`} className="text-sm font-medium">Description</Label>
                          <Textarea
                            id={`desc-${post.id}`}
                            value={editFormData.description}
                            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                            placeholder="Describe the opportunity..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`location-${post.id}`} className="text-sm font-medium">Location</Label>
                            <Input
                              id={`location-${post.id}`}
                              value={editFormData.location}
                              onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                              placeholder="e.g. Gainesville, FL"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`email-${post.id}`} className="text-sm font-medium">Application Email</Label>
                            <Input
                              id={`email-${post.id}`}
                              value={editFormData.application_email}
                              onChange={(e) => setEditFormData({...editFormData, application_email: e.target.value})}
                              placeholder="jobs@company.com"
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`url-${post.id}`} className="text-sm font-medium">Application Link</Label>
                          <Input
                            id={`url-${post.id}`}
                            value={editFormData.contact_url}
                            onChange={(e) => setEditFormData({...editFormData, contact_url: e.target.value})}
                            placeholder="https://..."
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleSaveEdit(post.id)}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isSaving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            disabled={isSaving}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* VIEW MODE */
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Post Info */}
                        <div className="flex-1 min-w-0">
                          {/* Title & Status */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
                            <Badge className={isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                              {isPaused ? 'Paused' : 'Live'}
                            </Badge>
                            <Badge className={expirationStatus.color}>
                              {expirationStatus.text}
                            </Badge>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <span className="font-semibold text-slate-700">{post.org_name}</span>
                            <span className="text-slate-300">•</span>
                            <span>{getOpportunityTypeLabel(post.opportunity_type)}</span>
                            <span className="text-slate-300">•</span>
                            <span>Posted {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}</span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                            {post.description}
                          </p>

                          {/* Expiration Warning */}
                          {expirationStatus.urgent && (
                            <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <p className="text-sm text-orange-800">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                <strong>Action needed:</strong> This post {daysLeft < 0 ? 'has expired' : daysLeft === 0 ? 'expires today' : `expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`}. Edit and save to renew for another 30 days.
                              </p>
                            </div>
                          )}

                          {/* Metrics */}
                          <div className="flex items-center gap-5">
                            <span className="flex items-baseline gap-1">
                              <span className="text-base font-bold text-slate-900">{viewsCount}</span>
                              <span className="text-xs text-slate-500">views</span>
                            </span>
                            <span className="flex items-baseline gap-1">
                              <span className="text-base font-bold text-slate-900">{applicationsCount}</span>
                              <span className="text-xs text-slate-500">applications</span>
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={() => handleStartEdit(post)}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {expirationStatus.urgent ? 'Renew' : 'Edit'}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={isSaving}
                                className="border-slate-300"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleTogglePause(post)}>
                                {isPaused ? (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume Post
                                  </>
                                ) : (
                                  <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause Post
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(post)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              {/* The "View Public" DropdownMenuItem was removed from here. */}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(post)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            onClick={handlePostNew}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Post New Opportunity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
