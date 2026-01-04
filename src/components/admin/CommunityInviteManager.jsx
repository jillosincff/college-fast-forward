import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { 
  Users, 
  Plus, 
  Copy, 
  ExternalLink, 
  Clock,
  Loader2,
  BarChart3,
  Trash2
} from 'lucide-react';
import { InviteCode } from '@/entities/InviteCode';

export default function CommunityInviteManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [communityInvites, setCommunityInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  // Form state
  const [groupName, setGroupName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [targetRole, setTargetRole] = useState('parent');
  const [maxUses, setMaxUses] = useState(5000);
  const [expirationDays, setExpirationDays] = useState(30);

  useEffect(() => {
    loadCommunityInvites();
  }, []);

  const loadCommunityInvites = async () => {
    try {
      setLoadingInvites(true);
      const response = await base44.functions.invoke('getCommunityInvites', {});
      
      if (response.data.success) {
        setCommunityInvites(response.data.invites || []);
      }
    } catch (error) {
      console.error('Failed to load community invites:', error);
      toast({
        title: "Error Loading Invites",
        description: "Could not load community invites. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for this community invite",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await base44.functions.invoke('generateCommunityInvite', {
        group_name: groupName.trim(),
        target_role: targetRole,
        max_uses: parseInt(maxUses),
        expiration_days: parseInt(expirationDays),
        custom_code: customCode.trim() || null
      });

      if (result.data.success) {
        toast({
          title: "✅ Community Invite Created!",
          description: `Code: ${result.data.code} - Valid for ${expirationDays} days`,
        });

        // Reset form
        setGroupName('');
        setCustomCode('');
        setMaxUses(5000);
        setExpirationDays(30);

        // Reload invites
        loadCommunityInvites();
      } else {
        throw new Error(result.data.error || 'Failed to create invite');
      }
    } catch (error) {
      console.error('Failed to create community invite:', error);
      toast({
        title: "Error Creating Invite",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const getUsagePercentage = (invite) => {
    return Math.round((invite.current_uses / invite.max_uses) * 100);
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusColor = (invite) => {
    if (isExpired(invite.expires_at)) return 'text-red-600 bg-red-50';
    if (invite.current_uses >= invite.max_uses) return 'text-orange-600 bg-orange-50';
    if (getUsagePercentage(invite) > 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusText = (invite) => {
    if (isExpired(invite.expires_at)) return '⏰ Expired';
    if (invite.current_uses >= invite.max_uses) return '🔒 Full';
    return '✅ Active';
  };

  return (
    <div className="space-y-6">
      {/* Create New Community Invite */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Create Community Invite Code
          </CardTitle>
          <CardDescription>
            Generate invite codes for large groups, communities, or announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">
                  Group/Community Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., UF Parents Facebook Group"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCode">Custom Code (Optional)</Label>
                <Input
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g., UFPARENTS"
                  maxLength={12}
                />
                <p className="text-xs text-slate-500">
                  Leave blank to auto-generate (e.g., GATOR2024)
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent">Parents</SelectItem>
                    <SelectItem value="gator">Students</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  min="1"
                  max="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expirationDays">Expires In (Days)</Label>
                <Input
                  id="expirationDays"
                  type="number"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community Invite
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Community Invites */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Active Community Invites
            </CardTitle>
            <CardDescription>
              Track usage and performance of your community invite codes
            </CardDescription>
          </div>
          <Button
            onClick={loadCommunityInvites}
            disabled={loadingInvites}
            variant="outline"
            size="sm"
          >
            {loadingInvites ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingInvites ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-slate-600">Loading community invites...</p>
            </div>
          ) : communityInvites.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No community invites yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Create your first community invite code above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {communityInvites.map((invite) => {
                const usagePercent = getUsagePercentage(invite);
                const expired = isExpired(invite.expires_at);
                const shareUrl = `${window.location.origin}?invite=${invite.code}`;

                return (
                  <Card
                    key={invite.id}
                    className={`border-2 ${
                      expired ? 'border-red-200 bg-red-50/50' : 'border-slate-200'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left: Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 mb-1">
                                {invite.group_name}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                    invite
                                  )}`}
                                >
                                  {getStatusText(invite)}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Created {new Date(invite.created_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Code Display */}
                          <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs text-slate-600">Invite Code</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(invite.code)}
                                className="h-7 px-2"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="font-mono text-2xl font-bold text-blue-600 tracking-wider">
                              {invite.code}
                            </div>
                          </div>

                          {/* Share URL */}
                          <div className="space-y-2">
                            <Label className="text-xs text-slate-600">Share URL</Label>
                            <div className="flex gap-2">
                              <Input
                                value={shareUrl}
                                readOnly
                                className="font-mono text-xs"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(shareUrl)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(shareUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Right: Stats */}
                        <div className="lg:w-80 space-y-4">
                          {/* Usage Stats */}
                          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-slate-700">
                                Usage
                              </span>
                              <span className="text-2xl font-bold text-purple-600">
                                {invite.current_uses}/{invite.max_uses}
                              </span>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent > 80
                                    ? 'bg-red-500'
                                    : usagePercent > 50
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-600 mt-2">
                              {usagePercent}% of capacity used
                            </p>
                          </div>

                          {/* Expiration */}
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <div className="flex-1">
                              <p className="text-xs text-slate-600">
                                {expired ? 'Expired' : 'Expires'}
                              </p>
                              <p className={`font-semibold ${expired ? 'text-red-600' : 'text-slate-900'}`}>
                                {new Date(invite.expires_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Target Role */}
                          <div className="flex items-center gap-3 text-sm">
                            <Users className="w-4 h-4 text-slate-500" />
                            <div className="flex-1">
                              <p className="text-xs text-slate-600">Target Role</p>
                              <p className="font-semibold text-slate-900 capitalize">
                                {invite.invite_type?.includes('alumni') ? 'Alumni' : invite.invite_type?.includes('parent') ? 'Parents' : 'Students'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}