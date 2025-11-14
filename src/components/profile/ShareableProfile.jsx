import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Share2, Copy, Check, ExternalLink, Eye, Users, Lock, Globe 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { generateProfileSlug } from '@/functions/generateProfileSlug';
import { base44 } from '@/api/base44Client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ShareableProfile({ user, onProfileUpdated }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileUrl, setProfileUrl] = useState(
    user?.shareable_profile_slug 
      ? `${window.location.origin}#PublicProfile?slug=${user.shareable_profile_slug}`
      : null
  );
  const [visibility, setVisibility] = useState(user?.profile_visibility || 'gators_only');

  const handleGenerateLink = async () => {
    setGenerating(true);

    try {
      const { data } = await generateProfileSlug();

      if (data.success) {
        const url = `${window.location.origin}#PublicProfile?slug=${data.slug}`;
        setProfileUrl(url);
        
        toast({
          title: "✅ Profile Link Created!",
          description: "Your shareable profile link is ready"
        });

        if (onProfileUpdated) {
          onProfileUpdated({ shareable_profile_slug: data.slug });
        }
      } else {
        throw new Error(data.error || 'Failed to generate link');
      }

    } catch (error) {
      console.error('Link generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!profileUrl) return;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      
      toast({
        title: "✅ Link Copied!",
        description: "Profile link copied to clipboard"
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link",
        variant: "destructive"
      });
    }
  };

  const handleVisibilityChange = async (newVisibility) => {
    try {
      await base44.auth.updateMe({
        profile_visibility: newVisibility
      });

      setVisibility(newVisibility);
      
      toast({
        title: "✅ Visibility Updated",
        description: `Profile is now ${newVisibility.replace('_', ' ')}`
      });

      if (onProfileUpdated) {
        onProfileUpdated({ profile_visibility: newVisibility });
      }

    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone with the link can view',
      icon: Globe,
      color: 'text-green-600'
    },
    {
      value: 'gators_only',
      label: 'Gators Only',
      description: 'Only logged-in Gators can view',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Link is disabled',
      icon: Lock,
      color: 'text-slate-600'
    }
  ];

  const currentVisibility = visibilityOptions.find(opt => opt.value === visibility);
  const VisibilityIcon = currentVisibility?.icon || Globe;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          Shareable Profile
        </CardTitle>
        <CardDescription>
          Create a link to share your profile with recruiters and connections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visibility Settings */}
        <div className="space-y-2">
          <Label>Profile Visibility</Label>
          <Select value={visibility} onValueChange={handleVisibilityChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${option.color}`} />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-slate-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Generate/Display Link */}
        {profileUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Profile Link</Label>
              <div className="flex gap-2">
                <Input
                  value={profileUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(profileUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Profile Stats */}
            {user?.profile_views > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                <Eye className="w-4 h-4" />
                <span>
                  Your profile has been viewed <strong>{user.profile_views}</strong> times
                </span>
              </div>
            )}

            {/* Visibility Status */}
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${
              visibility === 'public' ? 'bg-green-50 border-green-200 text-green-800' :
              visibility === 'gators_only' ? 'bg-blue-50 border-blue-200 text-blue-800' :
              'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <VisibilityIcon className={`w-4 h-4 ${currentVisibility?.color}`} />
              <span>{currentVisibility?.description}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Share2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="font-semibold text-slate-700 mb-2">
                No Shareable Link Yet
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Generate a unique link to share your profile with recruiters, alumni, and connections
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={generating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {generating ? 'Generating...' : 'Generate Profile Link'}
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 text-sm">
            💡 Tips for Your Profile
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complete your profile to make a great impression</li>
            <li>• Upload your resume for easy sharing</li>
            <li>• Add your LinkedIn and relevant experience</li>
            <li>• Share your link in emails, LinkedIn, and applications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}