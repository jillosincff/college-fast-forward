import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Crown, ExternalLink, DollarSign, Users, TrendingUp, Copy, Plus, Loader2, CheckCircle } from 'lucide-react';
import { Referral } from '@/entities/Referral';
import { useToast } from '@/components/ui/use-toast';

export default function FoundingCircleLeaderWidget({ user }) {
  const { toast } = useToast();
  const [referralCodes, setReferralCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCodePrefix, setNewCodePrefix] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (user?.is_founding_circle_lead) {
      loadReferralCodes();
    }
  }, [user]);

  const loadReferralCodes = async () => {
    setLoading(true);
    try {
      const codes = await Referral.filter({ created_by: user.email });
      setReferralCodes(codes || []);
    } catch (error) {
      console.error('Failed to load referral codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!newCodePrefix.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter a code prefix (e.g., GATOR-JANE)",
        variant: "destructive"
      });
      return;
    }

    const code = newCodePrefix.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    setCreating(true);
    try {
      // Check if code already exists
      const existing = await Referral.filter({ referral_code: code });
      if (existing && existing.length > 0) {
        toast({
          title: "Code Already Exists",
          description: "Please choose a different code",
          variant: "destructive"
        });
        return;
      }

      // Create new referral code
      await Referral.create({
        name: user.full_name,
        email: user.email,
        referral_code: code,
        school: user.founding_circle_school || 'UF',
        role: 'lead',
        signups_count: 0,
        earnings_total: 0,
        status: 'active'
      });

      toast({
        title: "✅ Code Created!",
        description: `Your referral code ${code} is ready to share`,
      });

      setNewCodePrefix('');
      setShowCreateForm(false);
      loadReferralCodes();
    } catch (error) {
      console.error('Failed to create code:', error);
      toast({
        title: "Error",
        description: "Failed to create referral code",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Copied!",
      description: `${code} copied to clipboard`,
    });
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/#LandingPage?ref=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Share this link with potential signups",
    });
  };

  if (!user?.is_founding_circle_lead) {
    return null;
  }

  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Founding Circle Leader</h3>
              <Badge className="bg-orange-100 text-orange-800 mt-1">
                {user.founding_circle_school || 'UF'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-white rounded-lg border">
            <DollarSign className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <p className="text-lg font-bold text-slate-900">$5</p>
            <p className="text-xs text-slate-600">per signup</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <TrendingUp className="w-5 h-5 mx-auto text-blue-600 mb-1" />
            <p className="text-lg font-bold text-slate-900">25%</p>
            <p className="text-xs text-slate-600">commission</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Users className="w-5 h-5 mx-auto text-purple-600 mb-1" />
            <p className="text-lg font-bold text-slate-900">5%</p>
            <p className="text-xs text-slate-600">override</p>
          </div>
        </div>

        {/* Referral Codes Section */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-900">Your Referral Codes</h4>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Code
            </Button>
          </div>

          {showCreateForm && (
            <div className="flex gap-2 mb-4">
              <Input
                value={newCodePrefix}
                onChange={(e) => setNewCodePrefix(e.target.value.toUpperCase())}
                placeholder="e.g., GATOR-JANE"
                className="flex-1"
              />
              <Button onClick={generateCode} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
            </div>
          ) : referralCodes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No codes yet. Create your first referral code above!
            </p>
          ) : (
            <div className="space-y-2">
              {referralCodes.map((ref) => (
                <div 
                  key={ref.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-mono font-bold text-slate-900">{ref.referral_code}</p>
                    <p className="text-xs text-slate-500">
                      {ref.signups_count || 0} signups • ${ref.earnings_total || 0} earned
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(ref.referral_code)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === ref.referral_code ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(ref.referral_code)}
                      className="h-8 text-xs"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => {
              // TODO: Link to actual payment dashboard when ready
              window.open('https://dashboard.stripe.com', '_blank');
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Payment Dashboard
          </Button>
          
          <p className="text-xs text-center text-slate-500">
            Member since {user.founding_circle_approved_at 
              ? new Date(user.founding_circle_approved_at).toLocaleDateString() 
              : 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}