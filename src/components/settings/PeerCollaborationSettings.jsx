import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { StudentPeerProfile } from '@/entities/StudentPeerProfile';
import { Handshake, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const COLLABORATION_TYPES = [
  { value: 'resume_review', label: 'Swapping resume feedback' },
  { value: 'interview_prep', label: 'Sharing interview experiences' },
  { value: 'internship_search', label: 'Comparing internship search strategies' },
  { value: 'study_groups', label: 'Forming study groups' },
  { value: 'certifications', label: 'Studying for certifications together' },
  { value: 'career_development', label: 'Other career development topics' }
];

export default function PeerCollaborationSettings({ user }) {
  const { toast } = useToast();
  const [peerProfile, setPeerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [workingOn, setWorkingOn] = useState('');
  const [canShare, setCanShare] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchPeerProfile();
    }
  }, [user?.id]);

  const fetchPeerProfile = async () => {
    setLoading(true);
    try {
      const profiles = await StudentPeerProfile.filter({ student_id: user.id });
      const profile = profiles?.[0];
      
      if (profile) {
        setPeerProfile(profile);
        setIsOpen(profile.open_to_collaboration || false);
        setSelectedTypes(profile.can_collaborate_on || []);
        setWorkingOn(profile.what_im_working_on || '');
        setCanShare(profile.what_i_can_share || '');
      }
    } catch (err) {
      console.error('Error fetching peer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setError(null);
  };

  const handleTypeToggle = (value) => {
    setSelectedTypes(prev => 
      prev.includes(value)
        ? prev.filter(t => t !== value)
        : [...prev, value]
    );
    setError(null);
  };

  const handleSave = async () => {
    // Validate
    if (isOpen && selectedTypes.length === 0) {
      setError('Please select at least one collaboration type');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const profileData = {
        student_id: user.id,
        student_email: user.email,
        student_name: user.full_name,
        student_major: user.major || '',
        student_year: user.graduation_year ? `Class of ${user.graduation_year}` : '',
        open_to_collaboration: isOpen,
        can_collaborate_on: selectedTypes,
        what_im_working_on: workingOn,
        what_i_can_share: canShare
      };

      if (peerProfile?.id) {
        // Update existing
        await StudentPeerProfile.update(peerProfile.id, profileData);
      } else {
        // Create new
        const newProfile = await StudentPeerProfile.create(profileData);
        setPeerProfile(newProfile);
      }

      toast({
        title: "✅ Settings Saved",
        description: "Peer collaboration settings updated successfully!"
      });

    } catch (err) {
      console.error('Error saving peer profile:', err);
      setError('Failed to save settings. Please try again.');
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getTimeSince = (date) => {
    if (!date) return '';
    const now = new Date();
    const updated = new Date(date);
    const days = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading peer collaboration settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-teal-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <CardTitle>🤝 Peer Collaboration</CardTitle>
              <CardDescription>
                Connect with other Gators to share experiences and build your network
              </CardDescription>
            </div>
          </div>
          {peerProfile && (
            <Badge className={isOpen ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
              {isOpen ? '✅ Active - Visible to peers' : '⏸️ Paused - Not visible'}
            </Badge>
          )}
        </div>
        {peerProfile?.updated_date && (
          <p className="text-xs text-slate-500 mt-2 ml-13">
            Last updated {getTimeSince(peerProfile.updated_date)}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            ✗ {error}
          </div>
        )}

        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="space-y-0.5">
            <p className="font-medium text-slate-900">
              I'm open to collaborating with fellow Gators
            </p>
            <p className="text-sm text-slate-500">
              When enabled, students with similar career interests can connect with you
            </p>
          </div>
          <Switch
            checked={isOpen}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-teal-600"
          />
        </div>

        {/* Expanded Options */}
        {isOpen && (
          <div className="space-y-6 pl-4 border-l-4 border-teal-200">
            
            {/* Collaboration Types */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                What are you open to collaborating on? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COLLABORATION_TYPES.map(type => (
                  <label 
                    key={type.value} 
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTypes.includes(type.value)
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => handleTypeToggle(type.value)}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-700">{type.label}</span>
                  </label>
                ))}
              </div>
              {isOpen && selectedTypes.length === 0 && (
                <p className="mt-2 text-xs text-red-600">
                  Select at least one collaboration type
                </p>
              )}
            </div>

            {/* What I'm Working On */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What are you currently working on?
              </label>
              <Textarea
                value={workingOn}
                onChange={(e) => setWorkingOn(e.target.value.slice(0, 200))}
                placeholder="e.g., Applying for summer marketing internships, building my portfolio website, preparing for Google Analytics certification"
                rows={3}
                className="text-sm"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-slate-500">
                  Share what you're currently focused on so peers know how to connect with you
                </p>
                <span className={`text-xs ${workingOn.length > 180 ? 'text-red-600' : 'text-slate-500'}`}>
                  {workingOn.length}/200
                </span>
              </div>
            </div>

            {/* What I Can Share */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What experiences or resources can you share?
              </label>
              <Textarea
                value={canShare}
                onChange={(e) => setCanShare(e.target.value.slice(0, 200))}
                placeholder="e.g., Resume template that got me 3 interviews, tips for networking on LinkedIn, experience with startup internships"
                rows={3}
                className="text-sm"
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-slate-500">
                  Let peers know what you can offer to help them
                </p>
                <span className={`text-xs ${canShare.length > 180 ? 'text-red-600' : 'text-slate-500'}`}>
                  {canShare.length}/200
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={saving || (isOpen && selectedTypes.length === 0)}
            className="bg-[#FA4616] hover:bg-[#e63e13] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}