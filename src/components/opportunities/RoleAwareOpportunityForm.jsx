import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Link, Edit3, Briefcase, GraduationCap, Building } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';

// Redefined opportunityTypes as an array for consistent mapping across selects
const opportunityTypes = [
  { value: 'student_gig', label: 'Student Gig', icon: <GraduationCap className="w-4 h-4 mr-2" /> },
  { value: 'internship', label: 'Internship', icon: <Briefcase className="w-4 h-4 mr-2" /> },
  { value: 'job', label: 'Job', icon: <Building className="w-4 h-4 mr-2" /> },
];

export default function RoleAwareOpportunityForm({ onSubmit, isSubmitting, userRole, existingData }) {
  const { user } = useAuth();

  const [postingMode, setPostingMode] = useState('quick_share');

  const [formData, setFormData] = useState({
    // Quick Share fields
    job_url: '',
    job_title: '',
    company_name: '', // Optional hiring company name
    location: '', // Optional location for quick share. This field is re-used for manual entry as well.
    gator_relevance: '', // This field is now an optional note
    quick_share_type: 'internship', // Opportunity type for quick share

    // Manual Entry fields
    opportunity_type: 'internship',
    title: '',
    description: '',
    org_name: '',
    // location field is shared, but its content and validation depend on postingMode
    location_type: 'onsite',
    contact_url: '',
    application_email: '', // Application email field
    poster_note: '', // NEW: Internal note field

    // Salary fields
    salary_min: '',
    salary_max: '',
    salary_period: 'yearly',
  });

  const [errors, setErrors] = useState({});

  // Load existing data when editing
  useEffect(() => {
    if (existingData) {
      const mode = existingData.posting_type === 'shared_link' ? 'quick_share' : 'manual_entry';
      setPostingMode(mode);

      if (mode === 'quick_share') {
        let reconstructedLocation = '';
        if (existingData.location_type === 'remote') {
            reconstructedLocation = 'Remote';
        } else if (existingData.location_type === 'hybrid') {
            reconstructedLocation = 'Hybrid';
        } else if (existingData.city && existingData.state) {
            reconstructedLocation = `${existingData.city}, ${existingData.state}`;
        } else if (existingData.city) {
            reconstructedLocation = existingData.city;
        } else if (existingData.state) {
            reconstructedLocation = existingData.state;
        }

        setFormData({
          // Quick Share fields
          job_url: existingData.contact_url || existingData.external_apply_url || '',
          job_title: existingData.title || '',
          company_name: existingData.org_name || '',
          location: reconstructedLocation,
          gator_relevance: existingData.description || '',
          quick_share_type: existingData.opportunity_type || 'internship',
          
          // Clear manual entry specific fields or set to defaults
          opportunity_type: 'internship',
          title: '',
          description: '',
          org_name: '',
          location_type: 'onsite',
          contact_url: '',
          application_email: '',
          poster_note: '', // Ensure cleared for quick_share
          salary_min: '',
          salary_max: '',
          salary_period: 'yearly',
        });
      } else { // manual_entry mode
        // Extract poster note if it exists in description (look for "**Note from poster:" marker)
        let description = existingData.description || '';
        let posterNote = '';
        const noteMarker = '\n\n**Note from poster:**\n';
        if (description.includes(noteMarker)) {
          const parts = description.split(noteMarker);
          description = parts[0];
          posterNote = parts[1] || '';
        }

        setFormData({
          // Clear quick share specific fields or set to defaults
          job_url: '',
          job_title: '',
          company_name: '',
          gator_relevance: '',
          quick_share_type: 'internship',
          
          // Manual Entry fields
          opportunity_type: existingData.opportunity_type || 'internship',
          title: existingData.title || '',
          description: description, // Use parsed description
          org_name: existingData.org_name || '',
          // existingData.location for manual entry is expected to be the full location string
          location: existingData.location || '',
          location_type: existingData.location_type || 'onsite',
          contact_url: existingData.contact_url || existingData.external_apply_url || '',
          application_email: existingData.application_email || '',
          poster_note: posterNote, // Use parsed poster note
          salary_min: existingData.salary_min !== null && existingData.salary_min !== undefined ? String(existingData.salary_min) : '',
          salary_max: existingData.salary_max !== null && existingData.salary_max !== undefined ? String(existingData.salary_max) : '',
          salary_period: existingData.salary_period || 'yearly',
        });
      }
    }
  }, [existingData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Special handling for application URL/email combined error
    if ((field === 'contact_url' || field === 'application_email') && (errors.contact_url || errors.application_email)) {
      if (value.trim() !== '') { // If one of them now has a value, clear the combined error
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.contact_url; // Clear contact_url error
          delete newErrors.application_email; // Clear application_email error
          return newErrors;
        });
      }
    }
  };

  const validateQuickShare = () => {
    const newErrors = {};

    if (!formData.job_url.trim()) {
      newErrors.job_url = 'Job posting URL is required';
    } else if (!formData.job_url.includes('http')) {
      newErrors.job_url = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateManualEntry = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.org_name.trim()) newErrors.org_name = 'Company name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required'; // This refers to the manual entry location field

    // Validate that either contact_url OR application_email is provided
    if (!formData.contact_url.trim() && !formData.application_email.trim()) {
      newErrors.contact_url = 'Please provide either an application URL or email address';
      newErrors.application_email = 'Please provide either an application URL or email address'; // Set error on both for visual feedback
    }

    // If email is provided, validate format
    if (formData.application_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.application_email.trim())) {
        newErrors.application_email = 'Please enter a valid email address';
      }
    }

    // Validate salary fields if any are filled
    if (formData.salary_min || formData.salary_max) {
      const min = parseFloat(formData.salary_min);
      const max = parseFloat(formData.salary_max);

      if (formData.salary_min && isNaN(min)) {
        newErrors.salary_min = 'Please enter a valid number';
      }
      if (formData.salary_max && isNaN(max)) {
        newErrors.salary_max = 'Please enter a valid number';
      }
      if (!isNaN(min) && !isNaN(max) && min > max) {
        newErrors.salary_max = 'Maximum salary must be greater than minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatSalaryDisplay = (min, max, period) => {
    if (!min && !max) return null;

    const formatNumber = (num) => {
      const n = parseFloat(num);
      if (isNaN(n)) return null;
      return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    };

    const periodMap = {
      hourly: '/hr',
      monthly: '/month',
      yearly: '/year'
    };

    const suffix = periodMap[period] || '/year';

    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)}${suffix}`;
    } else if (min) {
      return `${formatNumber(min)}+${suffix}`;
    } else if (max) {
      return `Up to ${formatNumber(max)}${suffix}`;
    }

    return null;
  };

  const parseLocation = (locationString) => {
    // Try to parse "City, State" format
    if (!locationString || !locationString.trim()) {
      return { city: '', state: '' };
    }

    const parts = locationString.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return { city: parts[0], state: parts[1] };
    }

    // If just one part, put it in city. Handle 'remote' specifically.
    const lowerCaseLocation = locationString.toLowerCase();
    if (lowerCaseLocation === 'remote' || lowerCaseLocation.includes('remote')) {
      return { city: '', state: '', location_type: 'remote' };
    }
    if (lowerCaseLocation === 'hybrid' || lowerCaseLocation.includes('hybrid')) {
        return { city: '', state: '', location_type: 'hybrid' };
    }
    if (parts[0].trim()) {
      return { city: parts[0], state: '' };
    }

    return { city: '', state: '' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = false;
    let opportunityData = {};

    if (postingMode === 'quick_share') {
      isValid = validateQuickShare();
      if (isValid) {
        const { city, state, location_type } = parseLocation(formData.location);
        const lowerCaseLocation = formData.location?.toLowerCase() || '';
        const detectedLocationType = location_type || (lowerCaseLocation.includes('remote') ? 'remote' : (lowerCaseLocation.includes('hybrid') ? 'hybrid' : 'onsite'));


        opportunityData = {
          posting_type: 'shared_link',
          opportunity_type: formData.quick_share_type, // Use selected type instead of hardcoded 'job'
          title: formData.job_title,
          description: formData.gator_relevance || `Check out this opportunity: ${formData.job_title}`,
          org_name: formData.company_name || 'External Job Posting',
          city: city,
          state: state,
          location: formData.location, // Store raw location string as well for consistency
          location_type: detectedLocationType,
          external_apply_url: formData.job_url,
          apply_method: 'external',
          contact_url: formData.job_url, // Retain contact_url for consistency if backend uses it
          status: 'active',
          visibility: 'public',
          created_by_role: userRole || 'parent', // Fallback to 'parent' for safety
        };

        if (existingData) {
            opportunityData.opportunity_id = existingData.opportunity_id;
        }
      }
    } else { // manual_entry mode
      isValid = validateManualEntry();
      if (isValid) {
        const salaryDisplay = formatSalaryDisplay(
          formData.salary_min,
          formData.salary_max,
          formData.salary_period
        );

        // Determine location_type for manual entry
        const lowerCaseLocation = formData.location?.toLowerCase() || '';
        let detectedLocationType = formData.location_type || 'onsite';
        
        // Override if location string contains remote/hybrid keywords
        if (lowerCaseLocation.includes('remote')) {
          detectedLocationType = 'remote';
        } else if (lowerCaseLocation.includes('hybrid')) {
          detectedLocationType = 'hybrid';
        }
        
        const { city, state } = parseLocation(formData.location); // Parse for city/state if applicable

        // Build description with optional poster note
        let fullDescription = formData.description;
        if (formData.poster_note && formData.poster_note.trim()) {
          fullDescription += `\n\n**Note from poster:**\n${formData.poster_note.trim()}`;
        }

        opportunityData = {
          opportunity_type: formData.opportunity_type,
          title: formData.title,
          description: fullDescription, // Use the combined description
          org_name: formData.org_name,
          location: formData.location, // This passes location as a string, as per existing manual entry logic
          salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
          salary_display: salaryDisplay,
          salary_period: formData.salary_period,
          created_by_role: userRole || 'parent', // Fallback to 'parent' for safety
          posting_type: 'manual_entry',
          contact_url: formData.contact_url || '',
          application_email: formData.application_email || '',
          apply_method: formData.application_email ? 'email' : (formData.contact_url ? 'external' : 'message'),
          external_apply_url: formData.contact_url || '',
          status: 'active',
          visibility: 'public',
          location_type: detectedLocationType,
          city: city,
          state: state,
        };

        if (existingData) {
            opportunityData.opportunity_id = existingData.opportunity_id;
        }
      }
    }

    if (isValid) {
      onSubmit(opportunityData);
    }
  };

  const handleCancel = () => {
    // Navigate to the appropriate dashboard based on user persona
    let dashboardPage = 'Dashboard'; // Default
    if (user?.persona === 'parent' || user?.persona === 'alumni' || user?.roles?.includes('parent') || user?.roles?.includes('alumni')) {
      dashboardPage = 'ParentDashboard';
    } else if (user?.persona === 'admin' || user?.roles?.includes('admin')) {
      dashboardPage = 'AdminDashboard';
    }

    navigate(dashboardPage);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Selection - Hide when editing existing data */}
      {!existingData && (
        <div className="flex gap-3 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setPostingMode('quick_share')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              postingMode === 'quick_share'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-4 h-4 inline mr-2" />
            Quick Share
          </button>
          <button
            type="button"
            onClick={() => setPostingMode('manual_entry')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              postingMode === 'manual_entry'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Manual Entry
          </button>
        </div>
      )}

      {postingMode === 'quick_share' ? (
        /* Quick Share Form */
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Link className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {existingData ? 'Edit Shared Opportunity' : 'Share an Opportunity'}
            </h3>
            <p className="text-gray-600 text-sm">
              {existingData ? 'Update the details for this shared opportunity.' : 'Found a great job posting? Share it with the Gator community!'}
            </p>
          </div>

          <div>
            <Label htmlFor="job_url">Job Posting URL *</Label>
            <Input
              id="job_url"
              type="url"
              value={formData.job_url}
              onChange={(e) => handleInputChange('job_url', e.target.value)}
              placeholder="https://linkedin.com/jobs/... or https://company.com/careers/..."
              className={`mt-1 ${errors.job_url ? 'border-red-500' : ''}`}
            />
            {errors.job_url && <p className="text-red-500 text-sm mt-1">{errors.job_url}</p>}
          </div>

          <div>
            <Label htmlFor="job_title">Job Title *</Label>
            <Input
              id="job_title"
              type="text"
              value={formData.job_title}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
              placeholder="e.g., Software Engineer Intern, Marketing Associate"
              className={`mt-1 ${errors.job_title ? 'border-red-500' : ''}`}
            />
            {errors.job_title && <p className="text-red-500 text-sm mt-1">{errors.job_title}</p>}
          </div>

          <div>
            <Label htmlFor="quick_share_type">Opportunity Type *</Label>
            <Select
              value={formData.quick_share_type}
              onValueChange={(value) => handleInputChange('quick_share_type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue>
                {
                    opportunityTypes.find(type => type.value === formData.quick_share_type) ?
                    (
                        <span className="flex items-center">
                        {opportunityTypes.find(type => type.value === formData.quick_share_type).icon}
                        {opportunityTypes.find(type => type.value === formData.quick_share_type).label}
                        </span>
                    ) : 'Select type'
                }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {opportunityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center">
                      {type.icon} {type.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="company_name">Hiring Company Name (Optional)</Label>
            <Input
              id="company_name"
              type="text"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="e.g., Google, Microsoft, Acme Corp"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              If you know which company is hiring, add it here. Otherwise we'll show "External Job Posting"
            </p>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Orlando, FL | Remote | New York, NY"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add the job location here. Use format: "City, State" or just "Remote"
            </p>
          </div>

          <div>
            <Label htmlFor="gator_relevance">Add a note (Optional)</Label>
            <Textarea
              id="gator_relevance"
              value={formData.gator_relevance}
              onChange={(e) => handleInputChange('gator_relevance', e.target.value)}
              placeholder="e.g., I used to work here and it's a great company"
              className="mt-1 h-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              Share why this opportunity is great for Gators
            </p>
          </div>
        </div>
      ) : (
        /* Manual Entry Form */
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Edit3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {existingData ? 'Edit Custom Posting' : 'Create Custom Posting'}
            </h3>
            <p className="text-gray-600 text-sm">
                {existingData ? 'Update the details for your custom opportunity.' : 'Post your own opportunity with custom details'}
            </p>
          </div>

          {/* Opportunity Type */}
          <div>
            <Label htmlFor="opportunity_type">Opportunity Type *</Label>
            <Select
              value={formData.opportunity_type}
              onValueChange={(value) => handleInputChange('opportunity_type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue>
                  {
                    opportunityTypes.find(type => type.value === formData.opportunity_type) ?
                    (
                      <span className="flex items-center">
                        {opportunityTypes.find(type => type.value === formData.opportunity_type).icon}
                        {opportunityTypes.find(type => type.value === formData.opportunity_type).label}
                      </span>
                    ) : 'Select type'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {opportunityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center">
                      {type.icon} {type.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Marketing Intern, Software Engineer, Campus Tour Guide"
              className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Company */}
          <div>
            <Label htmlFor="org_name">Company/Organization *</Label>
            <Input
              id="org_name"
              value={formData.org_name}
              onChange={(e) => handleInputChange('org_name', e.target.value)}
              placeholder="e.g., Disney, University of Florida, Local Startup"
              className={`mt-1 ${errors.org_name ? 'border-red-500' : ''}`}
            />
            {errors.org_name && <p className="text-red-500 text-sm mt-1">{errors.org_name}</p>}
          </div>

          {/* Work Mode */}
          <div>
            <Label htmlFor="location_type">Work Mode *</Label>
            <Select
              value={formData.location_type}
              onValueChange={(value) => handleInputChange('location_type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select work mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location} // This refers to the manual entry location field
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Orlando, FL | Remote | Hybrid"
              className={`mt-1 ${errors.location ? 'border-red-500' : ''}`}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, requirements, and what makes this opportunity special..."
              className={`mt-1 h-32 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* NEW: Internal Note Field */}
          <div>
            <Label htmlFor="poster_note">Your Note (Optional)</Label>
            <Textarea
              id="poster_note"
              value={formData.poster_note}
              onChange={(e) => handleInputChange('poster_note', e.target.value)}
              placeholder="e.g., 'The hiring manager is a friend of mine' or 'I worked here and can provide a referral'"
              className="mt-1 h-20"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add context about your connection to this opportunity (visible to students)
            </p>
          </div>

          {/* Salary Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💰 Salary Information (Optional)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salary_min">Minimum</Label>
                <Input
                  id="salary_min"
                  type="number"
                  step="1000"
                  value={formData.salary_min}
                  onChange={(e) => handleInputChange('salary_min', e.target.value)}
                  placeholder="e.g., 60000"
                  className={`mt-1 ${errors.salary_min ? 'border-red-500' : ''}`}
                />
                {errors.salary_min && <p className="text-red-500 text-sm mt-1">{errors.salary_min}</p>}
              </div>

              <div>
                <Label htmlFor="salary_max">Maximum</Label>
                <Input
                  id="salary_max"
                  type="number"
                  step="1000"
                  value={formData.salary_max}
                  onChange={(e) => handleInputChange('salary_max', e.target.value)}
                  placeholder="e.g., 80000"
                  className={`mt-1 ${errors.salary_max ? 'border-red-500' : ''}`}
                />
                {errors.salary_max && <p className="text-red-500 text-sm mt-1">{errors.salary_max}</p>}
              </div>

              <div>
                <Label htmlFor="salary_period">Period</Label>
                <Select
                  value={formData.salary_period}
                  onValueChange={(value) => handleInputChange('salary_period', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Per Hour</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                    <SelectItem value="yearly">Per Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary Preview */}
            {(formData.salary_min || formData.salary_max) && (
              <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                <span className="text-xs text-gray-600">Preview: </span>
                <span className="text-sm font-semibold text-green-700">
                  {formatSalaryDisplay(formData.salary_min, formData.salary_max, formData.salary_period) || 'Invalid salary'}
                </span>
              </div>
            )}
          </div>

          {/* Application Contact Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📧 How Should Students Apply?
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Provide at least one way for students to apply (URL or email)
            </p>

            <div className="space-y-4">
              {/* Application URL */}
              <div>
                <Label htmlFor="contact_url">Application URL</Label>
                <Input
                  id="contact_url"
                  type="url"
                  value={formData.contact_url}
                  onChange={(e) => handleInputChange('contact_url', e.target.value)}
                  placeholder="https://company.com/apply"
                  className={`mt-1 ${errors.contact_url && !formData.application_email ? 'border-red-500' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  External application portal or form
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span>OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Application Email */}
              <div>
                <Label htmlFor="application_email">Application Email</Label>
                <Input
                  id="application_email"
                  type="email"
                  value={formData.application_email}
                  onChange={(e) => handleInputChange('application_email', e.target.value)}
                  placeholder="hiring@company.com or your-email@example.com"
                  className={`mt-1 ${errors.application_email && !formData.contact_url ? 'border-red-500' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email where applications should be sent (great for posting on behalf of someone else)
                </p>
              </div>

              {(errors.contact_url && !formData.contact_url.trim() && !formData.application_email.trim()) ||
                (errors.application_email && formData.application_email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.application_email.trim())) ? (
                <p className="text-red-500 text-sm">
                  {(errors.contact_url && !formData.contact_url.trim() && !formData.application_email.trim()) ? errors.contact_url : errors.application_email}
                </p>
              ) : null}

            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {existingData ? 'Updating...' : (postingMode === 'quick_share' ? 'Sharing...' : 'Posting...')}
            </>
          ) : (
            existingData ? 'Update Opportunity' : (postingMode === 'quick_share' ? 'Share with Gators' : 'Post Opportunity')
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Why share opportunities?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Help fellow Gators find great career opportunities</li>
          <li>• Build your reputation as a connector in the community</li>
          <li>• {postingMode === 'quick_share' ? 'Quickly share links from job boards, company sites, or LinkedIn' : 'Create detailed custom postings for unique opportunities'}</li>
          <li>• Connect students with opportunities they might not find otherwise</li>
        </ul>
      </div>
    </form>
  );
}