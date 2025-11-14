
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Save, X, AlertCircle, Edit, Pause, Play, Briefcase, GraduationCap, Building } from 'lucide-react';

const opportunityTypes = [
  { value: 'student_gig', label: 'Student Gig', icon: GraduationCap },
  { value: 'internship', label: 'Internship', icon: Briefcase },
  { value: 'full_time', label: 'Full-time Job', icon: Building },
  { value: 'part_time', label: 'Part-time Job', icon: Building },
];

export default function ManageOpportunityModal({
  isOpen,
  onClose,
  opportunity,
  onDelete,
  onUpdate,
  applicationsCount = 0
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: opportunity.title || '',
    description: opportunity.description || '',
    org_name: opportunity.org_name || '',
    location: `${opportunity.city || ''}${opportunity.city && opportunity.state ? ', ' : ''}${opportunity.state || ''}`.trim(),
    contact_url: opportunity.contact_url || '',
    application_email: opportunity.application_email || '',
    status: opportunity.status || 'active',
    opportunity_type: opportunity.opportunity_type || 'internship',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const locationParts = formData.location.split(',').map(s => s.trim());
      const updates = {
        ...formData,
        city: locationParts[0] || '',
        state: locationParts[1] || '',
      };
      delete updates.location;
      
      await onUpdate(opportunity.id, updates);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePause = async () => {
    const newStatus = opportunity.status === 'paused' ? 'active' : 'paused';
    setIsSaving(true);
    try {
      await onUpdate(opportunity.id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await onDelete(opportunity.id);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: opportunity.title || '',
      description: opportunity.description || '',
      org_name: opportunity.org_name || '',
      location: `${opportunity.city || ''}${opportunity.city && opportunity.state ? ', ' : ''}${opportunity.state || ''}`.trim(),
      contact_url: opportunity.contact_url || '',
      application_email: opportunity.application_email || '',
      status: opportunity.status || 'active',
      opportunity_type: opportunity.opportunity_type || 'internship',
    });
  };

  const isPaused = opportunity.status === 'paused';

  // Find the current type info for display
  const currentTypeInfo = opportunityTypes.find(t => t.value === (isEditing ? formData.opportunity_type : opportunity.opportunity_type)) || opportunityTypes[1];
  const TypeIcon = currentTypeInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Manage Your Post</span>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stats Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Applications Received</p>
                <p className="text-2xl font-bold text-slate-900">{applicationsCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  opportunity.status === 'active' ? 'bg-green-100 text-green-800' :
                  opportunity.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {opportunity.status === 'active' ? 'Active' :
                   opportunity.status === 'paused' ? 'Paused' :
                   'Closed'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Marketing Intern"
                />
              </div>

              <div>
                <Label htmlFor="opportunity_type">Opportunity Type</Label>
                <Select
                  value={formData.opportunity_type}
                  onValueChange={(value) => handleInputChange('opportunity_type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {opportunityTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="org_name">Company/Organization</Label>
                <Input
                  id="org_name"
                  value={formData.org_name}
                  onChange={(e) => handleInputChange('org_name', e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the opportunity..."
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g. Gainesville, FL"
                />
              </div>

              <div>
                <Label htmlFor="contact_url">Application Link (optional)</Label>
                <Input
                  id="contact_url"
                  value={formData.contact_url}
                  onChange={(e) => handleInputChange('contact_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="application_email">Application Email (optional)</Label>
                <Input
                  id="application_email"
                  value={formData.application_email}
                  onChange={(e) => handleInputChange('application_email', e.target.value)}
                  placeholder="jobs@company.com"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">{opportunity.title}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <TypeIcon className="w-4 h-4" />
                  <span>{currentTypeInfo.label}</span>
                  <span>•</span>
                  <span>{opportunity.org_name}</span>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{opportunity.description}</p>
              </div>

              {opportunity.city && opportunity.state && (
                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-slate-700">{opportunity.city}, {opportunity.state}</p>
                </div>
              )}

              {opportunity.contact_url && (
                <div>
                  <Label>Application Link</Label>
                  <a 
                    href={opportunity.contact_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block"
                  >
                    {opportunity.contact_url}
                  </a>
                </div>
              )}

              {opportunity.application_email && (
                <div>
                  <Label>Application Email</Label>
                  <p className="text-sm text-slate-700">{opportunity.application_email}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={handleTogglePause}
                  disabled={isSaving}
                  variant="outline"
                  className={isPaused ? "border-green-600 text-green-600 hover:bg-green-50" : "border-yellow-600 text-yellow-600 hover:bg-yellow-50"}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : isPaused ? (
                    <Play className="w-4 h-4 mr-2" />
                  ) : (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  {isPaused ? 'Resume Post' : 'Pause Post'}
                </Button>

                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                >
                  Close
                </Button>
              </>
            )}
          </div>

          {/* Warning if has applications */}
          {applicationsCount > 0 && !isEditing && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-900">
                  <strong>Note:</strong> This post has received {applicationsCount} {applicationsCount === 1 ? 'application' : 'applications'}. 
                  {!isPaused && ' Consider pausing instead of deleting so applicants can still view it.'}
                  {isPaused && ' This post is paused - new applicants cannot see it, but existing applicants can still view it.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
