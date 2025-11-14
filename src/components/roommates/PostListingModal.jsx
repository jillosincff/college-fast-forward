import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { RoommatePost } from '@/entities/RoommatePost';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

const amenitiesOptions = [
  "Furnished", "Unfurnished", "In-unit laundry", "Shared laundry",
  "Parking available", "Street parking", "Private bathroom", "Shared bathroom",
  "Kitchen access", "Pet friendly", "No pets", "Utilities included",
  "A/C", "Heating", "Wi-Fi included", "Gym access", "Pool access"
];

export default function PostListingModal({ isOpen, onClose, onSuccess, existingPost }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState('seeking_roommate');
  const [location, setLocation] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [moveInDate, setMoveInDate] = useState(null);
  const [moveInFlexible, setMoveInFlexible] = useState(false);
  const [amenities, setAmenities] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title || '');
      setDescription(existingPost.description || '');
      setPostType(existingPost.post_type || 'seeking_roommate');
      setLocation(existingPost.location || '');
      setRentAmount(existingPost.rent_amount?.toString() || '');
      setMoveInDate(existingPost.move_in_date ? new Date(existingPost.move_in_date) : null);
      setMoveInFlexible(existingPost.move_in_flexible || false);
      setAmenities(existingPost.amenities || []);
      setImages(existingPost.images || []);
      setImageFiles([]);
    } else {
      resetForm();
    }
  }, [existingPost, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPostType('seeking_roommate');
    setLocation('');
    setRentAmount('');
    setMoveInDate(null);
    setMoveInFlexible(false);
    setAmenities([]);
    setImages([]);
    setImageFiles([]);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!rentAmount || isNaN(parseFloat(rentAmount)) || parseFloat(rentAmount) <= 0) {
      newErrors.rentAmount = "A valid rent amount is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the form for required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrls = [...images];
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(file => 
          base44.integrations.Core.UploadFile({ file })
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedImageUrls.push(...uploadResults.map(res => res.file_url));
      }

      const postData = {
        title,
        description,
        post_type: postType,
        location,
        rent_amount: parseFloat(rentAmount),
        move_in_date: moveInDate ? moveInDate.toISOString().split('T')[0] : null,
        move_in_flexible: moveInFlexible,
        amenities,
        images: uploadedImageUrls,
        status: 'active',
      };

      if (existingPost) {
        await RoommatePost.update(existingPost.id, postData);
        toast({ title: "✅ Listing Updated", description: "Your changes have been saved." });
      } else {
        await RoommatePost.create(postData);
        toast({ title: "🎉 Listing Posted!", description: "Your listing is now live." });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to post listing:", error);
      toast({
        title: "❌ Submission Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast({
        title: "Limit exceeded",
        description: "You can upload a maximum of 5 images.",
        variant: "destructive",
      });
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    setImages(prev => [...prev, ...files.map(URL.createObjectURL)]);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    // This is a simplification; a more robust solution would track files and URLs separately.
    // For now, we just clear file array if any image is removed to force re-upload.
    setImageFiles([]); 
  };

  const handleToggleAmenity = (amenity) => {
    setAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingPost ? 'Edit Your Listing' : 'Post a New Listing'}</DialogTitle>
          <DialogDescription>
            Share details about your housing situation to find the perfect Gator roommate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-6 py-4">
          
          <div>
            <label className="text-sm font-medium">What are you looking for?</label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger>
                <SelectValue placeholder="Select listing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seeking_roommate">I have a place and need a roommate</SelectItem>
                <SelectItem value="seeking_room">I'm looking for a place to live</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Room available in downtown apartment" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the space, your ideal roommate, lease terms, etc." rows={4} />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Gainesville, FL or Midtown, NYC" />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label htmlFor="rent" className="text-sm font-medium">Monthly Rent ($)</label>
              <Input id="rent" type="number" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="e.g., 850" />
              {errors.rentAmount && <p className="text-xs text-red-500 mt-1">{errors.rentAmount}</p>}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">Move-in Date</label>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`w-[240px] justify-start text-left font-normal ${!moveInDate && 'text-muted-foreground'}`} disabled={moveInFlexible}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {moveInDate ? format(moveInDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={moveInDate} onSelect={setMoveInDate} initialFocus />
                </PopoverContent>
              </Popover>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="flexibleDate" checked={moveInFlexible} onChange={(e) => setMoveInFlexible(e.target.checked)} />
                <label htmlFor="flexibleDate" className="text-sm font-medium">Flexible</label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Amenities</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenitiesOptions.map(amenity => (
                <Button 
                  key={amenity}
                  variant={amenities.includes(amenity) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleAmenity(amenity)}
                  className={`transition-colors duration-200 ${amenities.includes(amenity) ? 'bg-blue-600 text-white' : ''}`}
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Photos (up to 5)</label>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {images.map((imgSrc, index) => (
                <div key={index} className="relative group">
                  <img src={imgSrc} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                  <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-slate-50">
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto text-slate-400" />
                    <span className="text-xs text-slate-500">Upload</span>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : (existingPost ? 'Update Listing' : 'Post Listing')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}