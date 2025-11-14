import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User, AlertCircle, UploadCloud, Loader2, Trash2, ArrowLeft, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UploadFile } from '@/integrations/Core';
import { useToast } from "@/components/ui/use-toast";
import { Switch } from '@/components/ui/switch';

// Common majors and locations
const commonMajors = [
  'Business Administration', 'Computer Science', 'Engineering', 'Psychology', 'Biology',
  'Marketing', 'Finance', 'Mechanical Engineering', 'Journalism', 'Political Science'
];
const commonLocations = [
  'Gainesville, FL', 'Orlando, FL', 'Tampa, FL', 'Miami, FL', 'Jacksonville, FL',
  'Atlanta, GA', 'New York, NY', 'Remote', 'Undecided'
];

export default function StudentStep1Profile({ formData, onUpdate, onNext, onBack }) {
  const { toast } = useToast();
  const photoInputRef = useRef(null);

  const [localData, setLocalData] = useState({
    first_name: formData?.first_name || '',
    last_name: formData?.last_name || '',
    full_name: formData?.full_name || '',
    graduation_year: formData?.graduation_year || new Date().getFullYear() + 2,
    major: formData?.major || '',
    location: formData?.location || '',
    profile_image_url: formData?.profile_image_url || '',
    linkedin_url: formData?.linkedin_url || '',
    includeInDirectory: formData?.includeInDirectory !== false,
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState({});
  const [majorSuggestions, setMajorSuggestions] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showMajorSuggestions, setShowMajorSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Auto-update full_name when first/last name changes
  useEffect(() => {
    if (localData.first_name || localData.last_name) {
      const newFullName = `${localData.first_name || ''} ${localData.last_name || ''}`.trim();
      if (newFullName !== localData.full_name) {
        setLocalData(prev => ({ ...prev, full_name: newFullName }));
        onUpdate({ ...localData, full_name: newFullName });
      }
    } else if (localData.full_name !== '') {
      setLocalData(prev => ({ ...prev, full_name: '' }));
      onUpdate({ ...localData, full_name: '' });
    }
  }, [localData.first_name, localData.last_name, localData.full_name, onUpdate, localData]);

  const handleUpdateAndBubble = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(updatedData);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (file.size > maxSize) {
      toast({ variant: 'destructive', title: 'File Too Large', description: `The photo must be under 5MB.` });
      return;
    }
    if (!acceptedTypes.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Invalid File Type', description: `Please upload a JPG or PNG file.` });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleUpdateAndBubble('profile_image_url', file_url);
      toast({ title: `✅ Photo uploaded!`, description: 'Your file has been saved.' });
    } catch (error) {
      console.error(`Error uploading photo:`, error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: `There was an error uploading your photo. Please try again.` });
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onUpdate(updatedData);
    
    validateField(field, value);
    
    if (field === 'major' && value.length > 0) {
      const suggestions = commonMajors.filter(major => major.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
      setMajorSuggestions(suggestions);
      setShowMajorSuggestions(suggestions.length > 0);
    } else if (field === 'major') {
      setShowMajorSuggestions(false);
    }

    if (field === 'location' && value.length > 0) {
      const suggestions = commonLocations.filter(location => location.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(suggestions.length > 0);
    } else if (field === 'location') {
      setShowLocationSuggestions(false);
    }
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (!value || (typeof value === 'string' && !value.trim())) {
      if (field !== 'linkedin_url' && field !== 'profile_image_url' && field !== 'location') {
         newErrors[field] = 'This field is required';
      } else {
        delete newErrors[field];
      }
    } else {
      delete newErrors[field];
    }

    if (field === 'linkedin_url' && value && !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(value)) {
      newErrors[field] = 'Please enter a valid LinkedIn profile URL';
    }
    if ((field === 'first_name' || field === 'last_name') && value && value.includes('@')) {
      newErrors[field] = 'Please enter your name, not your email';
    } else if ((field === 'first_name' || field === 'last_name') && !value.includes('@')) {
      if (newErrors[field] === 'Please enter your name, not your email') {
        delete newErrors[field];
      }
    }
    setErrors(newErrors);
  };

  const handleNext = () => {
    const requiredFields = ['first_name', 'last_name', 'graduation_year', 'major'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!localData[field] || (typeof localData[field] === 'string' && !localData[field].trim())) {
        newErrors[field] = 'This field is required';
      }
    });

    if (localData.first_name && localData.first_name.includes('@')) {
      newErrors.first_name = 'Please enter your first name, not your email';
    }
    if (localData.last_name && localData.last_name.includes('@')) {
      newErrors.last_name = 'Please enter your last name, not your email';
    }

    if (localData.linkedin_url && !/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(localData.linkedin_url)) {
        newErrors.linkedin_url = 'Please enter a valid LinkedIn profile URL';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    onNext();
  };

  const canContinue = localData.first_name && localData.last_name && localData.graduation_year && localData.major && !errors.linkedin_url && !errors.first_name && !errors.last_name;

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 7 }, (_, i) => currentYear + i);

  const requiredFields = ['first_name', 'last_name', 'graduation_year', 'major'];
  const completedFields = requiredFields.filter(field => localData[field] && localData[field].toString().trim()).length;
  const progressPercent = (completedFields / requiredFields.length) * 100;

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    return 'U';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="text-center mb-8">
        <div className="text-sm text-slate-500 mb-4">Step 1 of 1</div>
        
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-[var(--uf-blue)] to-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
          <User className="w-8 h-8 text-[var(--uf-blue)]" />
          Tell Us About Yourself
        </h2>
        <p className="text-slate-600">Let's get your profile started so Gators can find and help you.</p>
      </div>

      <div className="space-y-6">

        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center gap-4 p-4 bg-slate-50/80 rounded-lg border">
          <h3 className="text-sm font-medium text-slate-700">Profile Photo (optional)</h3>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 text-3xl">
              <AvatarImage src={localData.profile_image_url} alt="Profile Photo" />
              <AvatarFallback className="bg-slate-200">{getInitials(localData.first_name, localData.last_name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                variant="outline"
                className="bg-white"
              >
                {isUploadingPhoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                {localData.profile_image_url ? 'Replace Photo' : 'Upload Photo'}
              </Button>
              {localData.profile_image_url && (
                <Button onClick={() => handleUpdateAndBubble('profile_image_url', '')} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              )}
            </div>
          </div>
          <Input ref={photoInputRef} type="file" className="hidden" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} />
        </div>

        {/* First Name and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">👤 First Name *</label>
            <Input 
              value={localData.first_name} 
              onChange={(e) => handleChange('first_name', e.target.value)} 
              placeholder="e.g., John" 
              className={`py-3 ${errors.first_name ? 'border-red-300' : ''}`} 
              data-error={!!errors.first_name} 
            />
            <AnimatePresence>
              {errors.first_name && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{errors.first_name}</motion.div>}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">👤 Last Name *</label>
            <Input 
              value={localData.last_name} 
              onChange={(e) => handleChange('last_name', e.target.value)} 
              placeholder="e.g., Smith" 
              className={`py-3 ${errors.last_name ? 'border-red-300' : ''}`} 
              data-error={!!errors.last_name} 
            />
            <AnimatePresence>
              {errors.last_name && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{errors.last_name}</motion.div>}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Graduation Year */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">🎓 Graduation Year *</label>
            <Select value={localData.graduation_year?.toString()} onValueChange={(value) => handleChange('graduation_year', parseInt(value))}>
              <SelectTrigger className={`py-3 h-auto ${errors.graduation_year ? 'border-red-300' : ''}`}><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>{graduationYears.map(year => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}</SelectContent>
            </Select>
            <AnimatePresence>
              {errors.graduation_year && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{errors.graduation_year}</motion.div>}
            </AnimatePresence>
          </div>

          {/* Major with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">📚 Major/Field of Study *</label>
            <Input value={localData.major} onChange={(e) => handleChange('major', e.target.value)} onFocus={() => localData.major && setShowMajorSuggestions(majorSuggestions.length > 0)} onBlur={() => setTimeout(() => setShowMajorSuggestions(false), 150)} placeholder="e.g., Computer Science" className={`py-3 ${errors.major ? 'border-red-300' : ''}`} data-error={!!errors.major} />
            <AnimatePresence>
              {showMajorSuggestions && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 mt-1">{majorSuggestions.map((suggestion, index) => <button key={index} className="w-full text-left px-4 py-2 hover:bg-slate-50" onMouseDown={() => handleChange('major', suggestion)}>{suggestion}</button>)}</motion.div>}
            </AnimatePresence>
            <AnimatePresence>
              {errors.major && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{errors.major}</motion.div>}
            </AnimatePresence>
          </div>
        </div>

        {/* Location with Autocomplete - OPTIONAL */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-2">📍 Where are you looking to work? (optional)</label>
          <Input value={localData.location} onChange={(e) => handleChange('location', e.target.value)} onFocus={() => localData.location && setShowLocationSuggestions(locationSuggestions.length > 0)} onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)} placeholder="e.g., Gainesville, FL or Remote" className="py-3" />
          <AnimatePresence>
            {showLocationSuggestions && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 mt-1">{locationSuggestions.map((suggestion, index) => <button key={index} className="w-full text-left px-4 py-2 hover:bg-slate-50" onMouseDown={() => handleChange('location', suggestion)}>{suggestion}</button>)}</motion.div>}
          </AnimatePresence>
        </div>
        
        {/* LinkedIn Profile */}
        <div>
          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
            <Linkedin className="w-4 h-4 mr-2 text-slate-500" />
            LinkedIn Profile (optional)
          </label>
          <Input 
            value={localData.linkedin_url} 
            onChange={(e) => handleChange('linkedin_url', e.target.value)} 
            placeholder="https://linkedin.com/in/your-profile" 
            className={`py-3 ${errors.linkedin_url ? 'border-red-300' : ''}`}
            data-error={!!errors.linkedin_url}
          />
          <AnimatePresence>
            {errors.linkedin_url && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mt-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />{errors.linkedin_url}</motion.div>}
          </AnimatePresence>
        </div>
        
        {/* Gator Directory Opt-in */}
        <div className="flex items-center justify-between p-4 bg-blue-50/80 rounded-lg border border-blue-200">
            <div>
              <label htmlFor="directory-switch" className="font-semibold text-slate-900">
                Join the Gator Directory
              </label>
              <p className="text-sm text-slate-600 mt-1">
                Let other Gators find you to connect and network.
              </p>
            </div>
            <Switch
              id="directory-switch"
              checked={localData.includeInDirectory}
              onCheckedChange={(checked) => handleChange('includeInDirectory', checked)}
            />
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-200">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 px-6 py-3"><ArrowLeft className="w-4 h-4" />Back</Button>
        <Button onClick={handleNext} disabled={!canContinue} className="bg-[var(--uf-blue)] hover:bg-blue-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2">Finish<ArrowRight className="w-4 h-4" /></Button>
      </div>
    </motion.div>
  );
}