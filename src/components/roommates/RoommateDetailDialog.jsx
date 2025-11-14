
import { useState, useEffect } from 'react';
import { RoommatePost } from '@/entities/RoommatePost';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, DollarSign, Heart, Mail, CheckCircle, Edit, MoreVertical, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function RoommateDetailDialog({ postId, onClose, onEdit, onDelete, onOpenMessageModal }) {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [postUser, setPostUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessageSent, setIsMessageSent] = useState(false);

  useEffect(() => {
    const loadPostDetails = async () => {
      setIsLoading(true);
      try {
        const postData = await RoommatePost.get(postId);
        if (postData) {
          setPost(postData);
          
          const userData = await User.filter({ email: postData.created_by });
          setPostUser(userData[0] || null);
        }
      } catch (error) {
        console.error("Error loading post details:", error);
      }
      setIsLoading(false);
    };

    if (postId) {
      loadPostDetails();
    }
  }, [postId]);

  const getTypeBadge = () => {
    if (!post) return { text: '', className: '' };
    const isSeekingRoom = post.post_type === 'seeking_room';
    return {
      text: isSeekingRoom ? 'Have Room' : 'Need Roommate',
      className: isSeekingRoom
        ? 'bg-blue-100 text-blue-800 border-blue-200'
        : 'bg-green-100 text-green-800 border-green-200'
    };
  };

  const isOwnPost = user && post && post.created_by === user.email;
  const userInitials = postUser?.full_name?.split(' ').map(n => n[0]).join('') || 'U';
  const badge = getTypeBadge();

  const getInitialsColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = (name || '').charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-800">Listing Not Found</h3>
        <p className="text-slate-600 mt-2">This listing may have been removed or doesn't exist.</p>
      </div>
    );
  }

  return (
    <>
      <DialogHeader className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`text-xs font-semibold px-2 py-1 rounded-full border ${badge.className}`}>
                {badge.text}
              </Badge>
              {post.posted_by_parent && (
                <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-xs px-2 py-1 rounded-full">
                  <Heart className="w-3 h-3 mr-1" />
                  Offered by Parent
                </Badge>
              )}
            </div>
            
            <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
              {post.title}
            </DialogTitle>
            
            {/* User Info */}
            <div className="flex items-center gap-3 mt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={postUser?.profile_image_url} alt={postUser?.full_name} />
                <AvatarFallback className={`${getInitialsColor(postUser?.full_name)} text-white text-xs font-semibold`}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-slate-700 text-sm">
                  {postUser?.full_name || 'Gator User'}
                  {isOwnPost && <span className="text-xs text-slate-500 ml-1">(You)</span>}
                </p>
                <p className="text-xs text-slate-500">
                  UF '{postUser?.graduation_year ? String(postUser.graduation_year).slice(-2) : 'XX'} • Posted {format(new Date(post.created_date), 'MMM d')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Top-right CTA & Close Button */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {isOwnPost ? (
              <>
                {onEdit && (
                  <Button variant="outline" onClick={() => { onEdit(post); onClose?.(); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => { onDelete(post.id); onClose?.(); }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Listing
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => { onOpenMessageModal?.(post, postUser); onClose?.(); }}
                disabled={isMessageSent}
                className={isMessageSent 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100 cursor-default border border-green-200'
                  : 'bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white'
                }
              >
                {isMessageSent ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Message Sent
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            )}
             <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                <X className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogHeader>
      
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.images.slice(0, 6).map((img, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                  <img 
                    src={img} 
                    alt={`Room photo ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className="font-medium text-slate-800">{post.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Move-in</p>
              <p className="font-medium text-slate-800">
                {post.move_in_flexible ? 'Flexible' : format(new Date(post.move_in_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Rent</p>
              <p className="font-medium text-slate-800">${post.rent_amount}/mo</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
          <div className="prose prose-slate max-w-none">
            {post.description?.split('\n').map((paragraph, index) => (
              <p key={index} className={`text-slate-700 leading-relaxed ${index > 0 ? 'mt-3' : ''}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {post.amenities && post.amenities.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {post.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer CTA */}
      <div className="border-t bg-slate-50 p-4 flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 truncate">{post.title}</h4>
          <p className="text-sm text-slate-600">{post.location} • ${post.rent_amount}/mo</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          {isOwnPost ? (
            onEdit && (
              <Button variant="outline" onClick={() => { onEdit(post); onClose?.(); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Listing
              </Button>
            )
          ) : (
            <Button 
              onClick={() => { onOpenMessageModal?.(post, postUser); onClose?.(); }}
              disabled={isMessageSent}
              className={isMessageSent 
                ? 'bg-green-100 text-green-800 hover:bg-green-100 cursor-default'
                : 'bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white'
              }
            >
              {isMessageSent ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Message Sent
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
