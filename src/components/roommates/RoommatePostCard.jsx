import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import PosterInfo from "../common/PosterInfo";
import ImageWithFallback from "../common/ImageWithFallback";
import { base44 } from "@/api/base44Client";

const PhotoModal = ({ images, selectedIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex || 0);

  if (typeof selectedIndex !== 'number' || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
            aria-label="Close modal"
          >
            <X className="w-8 h-8" />
          </button>

          <ImageWithFallback
            src={images[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const ImageCarousel = ({ images = [], onImageClick, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Home className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No photos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden group">
      <ImageWithFallback
        src={images[currentIndex]}
        alt={`${title} - Photo ${currentIndex + 1}`}
        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
        onClick={() => onImageClick(currentIndex)}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % images.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};


export default function RoommatePostCard({
  post,
  currentUserEmail,
  hasMessaged = false,
  onMessage,
  isFavorite = false,
  onToggleFavorite,
  onEdit,
  onDelete
}) {
  const [posterUser, setPosterUser] = useState(null);
  const [isLoadingPoster, setIsLoadingPoster] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchPoster = async () => {
      if (post.created_by) {
        setIsLoadingPoster(true);
        try {
          const response = await base44.functions.invoke('getPublicUserInfo', { email: post.created_by });
          if (response.data) {
            setPosterUser(response.data);
          }
        } catch (error) {
          console.error("Exception when fetching poster info:", error);
          setPosterUser({
            full_name: 'A Gator',
            email: post.created_by,
            headline: 'UF Community Member',
            persona: 'student',
          });
        } finally {
          setIsLoadingPoster(false);
        }
      } else {
        setIsLoadingPoster(false);
      }
    };
    fetchPoster();
  }, [post.created_by]);

  const getTypeBadge = () => {
    if (post.post_type === 'seeking_roommate') {
      return { text: 'Has a place', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else {
      return { text: 'Looking to team up', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const getDaysUntilExpiration = (createdDate) => {
    const expirationDate = addDays(new Date(createdDate), 30);
    const daysLeft = differenceInDays(expirationDate, new Date());
    return daysLeft;
  };

  const getExpirationBadge = (daysLeft) => {
    if (daysLeft < 0) return { text: 'Expired', className: 'bg-red-100 text-red-800 border-red-200' };
    if (daysLeft === 0) return { text: 'Expires today', className: 'bg-red-100 text-red-800 border-red-200' };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, className: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return null;
  };

  const badge = getTypeBadge();
  const isOwnPost = currentUserEmail && post.created_by === currentUserEmail;
  const daysLeft = getDaysUntilExpiration(post.created_date);
  const expirationBadge = getExpirationBadge(daysLeft);
  const isExpiringSoon = daysLeft <= 7;

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    setShowMenu(false);
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(post);
    }
  };

  return (
    <>
      <PhotoModal
        images={post.images || []}
        selectedIndex={selectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 ${isExpiringSoon && isOwnPost ? 'ring-2 ring-orange-200' : ''}`}
      >
        <Card className="h-full flex flex-col">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${badge.color} border text-xs font-medium px-2 py-1`}>
                  {badge.text}
                </Badge>
                {post.is_boosted && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs font-medium px-2 py-1">
                    ⚡ Boosted
                  </Badge>
                )}
                {expirationBadge && (
                  <Badge className={`${expirationBadge.className} border text-xs font-medium px-2 py-1`}>
                    {expirationBadge.text}
                  </Badge>
                )}
              </div>
            </div>

            {isExpiringSoon && isOwnPost && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-800 flex items-center">
                  <AlertCircle className="w-3 h-3 inline mr-1 flex-shrink-0" />
                  {daysLeft < 0 ? 'This post has expired.' : daysLeft === 0 ? 'Expires today.' : `Expires in ${daysLeft} days.`} Edit to renew.
                </p>
              </div>
            )}

            {post.images && post.images.length > 0 && (
              <div className="mb-4">
                <ImageCarousel
                  images={post.images}
                  onImageClick={setSelectedImageIndex}
                  title={post.title}
                />
              </div>
            )}

            <div className="flex-1 mb-4">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="space-y-2 mb-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0"/>
                <span className="truncate">{post.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400"/>
                  <span className="font-semibold text-slate-900">${post.rent_amount}/mo</span>
                </div>
                {(post.move_in_date || post.move_in_flexible) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400"/>
                    <span className="text-xs">
                      {post.move_in_flexible
                        ? 'Flexible'
                        : format(new Date(post.move_in_date), 'MMM d')
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            {post.amenities && post.amenities.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {post.amenities.slice(0, 3).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                      {amenity}
                    </Badge>
                  ))}
                  {post.amenities.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-slate-50 text-slate-600 border-slate-200 cursor-default"
                    >
                      +{post.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <PosterInfo
                user={posterUser}
                postDate={post.created_date}
                postedByParent={post.posted_by_parent}
              />
              <div className="flex items-center gap-2">
                {onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(post.id);
                    }}
                    className={`p-2 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-red-500'}`}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                )}

                {isOwnPost ? (
                  <Popover open={showMenu} onOpenChange={setShowMenu}>
                    <PopoverTrigger asChild>
                      <button
                        className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                        aria-label="More options"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1 z-50" align="end" sideOffset={4}>
                      <div className="space-y-1">
                        {onEdit && (
                          <button
                            onClick={handleEdit}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                            <span className="font-medium text-slate-800">
                              {isExpiringSoon ? 'Renew Listing' : 'Edit Listing'}
                            </span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              setShowDeleteDialog(true);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                            <span className="font-medium">Delete Listing</span>
                          </button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onMessage && posterUser) {
                        onMessage(post, posterUser);
                      }
                    }}
                    disabled={hasMessaged || isLoadingPoster || !posterUser}
                    className={`px-4 py-2 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasMessaged
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-[var(--uf-blue)] hover:bg-blue-700 text-white'
                    }`}
                    aria-label={hasMessaged ? "Message sent" : `Send message to ${posterUser?.full_name?.split(' ')[0] || 'Poster'}`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {isLoadingPoster ? (
                      <>
                        <MessageSquare className="w-4 h-4 animate-pulse" />
                        <span className="hidden sm:inline">Loading...</span>
                      </>
                    ) : hasMessaged ? (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Message Sent</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Message</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your listing will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}