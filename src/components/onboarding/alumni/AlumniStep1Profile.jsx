import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, User as UserIcon, Loader2, Upload, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadFile } from '@/integrations/Core';
import UserAvatar from '@/components/common/UserAvatar';

const GRADUATION_YEARS = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i);

export default function AlumniStep1Profile({ formData, onUpdate, onNext, onBack }) {
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const canContinue = formData.first_name && 
                      formData.first_name.trim() && 
                      !formData.first_name.includes('@') &&
                      formData.last_name && 
                      formData.last_name.trim() && 
                      !formData.last_name.includes('@') &&
                      formData.graduation_year && 
                      formData.major &&
                      formData.major.trim();
  
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      if (file_url) {
        onUpdate({ profile_image_url: file_url });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    onUpdate({ [field]: value });
    
    // Auto-construct full_name from first and last name
    if (field === 'first_name' || field === 'last_name') {
      const firstName = field === 'first_name' ? value : formData.first_name;
      const lastName = field === 'last_name' ? value : formData.last_name;
      if (firstName && lastName) {
        onUpdate({ 
          [field]: value, 
          full_name: `${firstName.trim()} ${lastName.trim()}` 
        });
      }
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    const newErrors = {};
    
    if (!formData.first_name || !formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.includes('@')) {
      newErrors.first_name = 'Please enter your first name, not your email';
    }
    
    if (!formData.last_name || !formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.includes('@')) {
      newErrors.last_name = 'Please enter your last name, not your email';
    }
    
    if (!formData.graduation_year) {
      newErrors.graduation_year = 'Graduation year is required';
    }
    
    if (!formData.major || !formData.major.trim()) {
      newErrors.major = 'Major is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-8"
    >
      <div className="text-center mb-8">
        <div className="inline-block bg-blue-100 p-3 rounded-full mb-3">
          <UserIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your Profile</h2>
        <p className="text-slate-600">Let's start with the basics. This helps others get to know you.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg border">
          <UserAvatar 
            user={{ 
              profile_image_url: formData.profile_image_url, 
              first_name: formData.first_name,
              last_name: formData.last_name,
              full_name: formData.full_name 
            }}
            className="w-20 h-20 text-3xl flex-shrink-0" 
          />
          <div>
            <h3 className="font-semibold text-slate-800">Profile Photo</h3>
            <p className="text-sm text-slate-500 mb-3">
              Optional, but helps build trust.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/png, image/jpeg"
              className="hidden"
            />
            <Button 
              size="sm"
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input 
              id="first_name" 
              value={formData.first_name || ''} 
              onChange={(e) => handleFieldChange('first_name', e.target.value)} 
              placeholder="e.g., Jane" 
              className={`mt-1 ${errors.first_name ? 'border-red-300' : ''}`}
            />
            {errors.first_name && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.first_name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input 
              id="last_name" 
              value={formData.last_name || ''} 
              onChange={(e) => handleFieldChange('last_name', e.target.value)} 
              placeholder="e.g., Smith" 
              className={`mt-1 ${errors.last_name ? 'border-red-300' : ''}`}
            />
            {errors.last_name && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.last_name}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="graduation_year">Graduation Year *</Label>
            <Select value={formData.graduation_year?.toString()} onValueChange={(value) => handleFieldChange('graduation_year', parseInt(value))}>
              <SelectTrigger id="graduation_year" className={`mt-1 ${errors.graduation_year ? 'border-red-300' : ''}`}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {GRADUATION_YEARS.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.graduation_year && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.graduation_year}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="major">Major *</Label>
            <Input 
              id="major" 
              value={formData.major || ''} 
              onChange={(e) => handleFieldChange('major', e.target.value)} 
              placeholder="e.g., Computer Science" 
              className={`mt-1 ${errors.major ? 'border-red-300' : ''}`} 
            />
            {errors.major && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.major}
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current_company">Current Company</Label>
            <Input 
              id="current_company" 
              value={formData.current_company || ''} 
              onChange={(e) => handleFieldChange('current_company', e.target.value)} 
              placeholder="e.g., Google" 
              className="mt-1" 
            />
          </div>
          <div>
            <Label htmlFor="current_position">Current Position</Label>
            <Input 
              id="current_position" 
              value={formData.current_position || ''} 
              onChange={(e) => handleFieldChange('current_position', e.target.value)} 
              placeholder="e.g., Software Engineer" 
              className="mt-1" 
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="location">Location (City, State)</Label>
          <Input 
            id="location" 
            value={formData.location || ''} 
            onChange={(e) => handleFieldChange('location', e.target.value)} 
            placeholder="e.g., San Francisco, CA" 
            className="mt-1" 
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={!canContinue} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Next
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}