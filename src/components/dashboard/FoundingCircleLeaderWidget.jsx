import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Crown, ExternalLink, DollarSign, Users, TrendingUp, Copy, Plus, Loader2, CheckCircle, BarChart3 } from 'lucide-react';
import { Referral } from '@/entities/Referral';
import { useToast } from '@/components/ui/use-toast';
import AmbassadorPaymentDashboard from './AmbassadorPaymentDashboard';

export default function FoundingCircleLeaderWidget({ user }) {
  const { toast } = useToast();
  const [referralCodes, setReferralCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCodePrefix, setNewCodePrefix] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showPaymentDashboard, setShowPaymentDashboard] = useState(false);

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
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Founding Circle Leader</h3>
            </div>
          </div>
          <Badge className="bg-orange-100 text-orange-800 text-xs">
            {user.founding_circle_school || 'UF'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-white rounded-lg border">
            <DollarSign className="w-4 h-4 mx-auto text-green-600 mb-0.5" />
            <p className="text-sm font-bold text-slate-900">$5</p>
            <p className="text-xs text-slate-600">per signup</p>
          </div>
          <div className="text-center p-2 bg-white rounded-lg border">
            <TrendingUp className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
            <p className="text-sm font-bold text-slate-900">25%</p>
            <p className="text-xs text-slate-600">commission</p>
          </div>
          <div className="text-center p-2 bg-white rounded-lg border">
            <Users className="w-4 h-4 mx-auto text-purple-600 mb-0.5" />
            <p className="text-sm font-bold text-slate-900">5%</p>
            <p className="text-xs text-slate-600">override</p>
          </div>
        </div>

        {/* Referral Codes Section */}
        <div className="bg-white rounded-lg border p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-slate-900">Your Referral Codes</h4>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Code
            </Button>
          </div>

          {showCreateForm && (
            <div className="flex gap-2 mb-3">
              <Input
                value={newCodePrefix}
                onChange={(e) => setNewCodePrefix(e.target.value.toUpperCase())}
                placeholder="e.g., GATOR-JANE"
                className="flex-1 h-8 text-sm"
              />
              <Button onClick={generateCode} disabled={creating} size="sm" className="h-8">
                {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-3">
              <Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-400" />
            </div>
          ) : referralCodes.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-3">
              No codes yet. Create your first referral code above!
            </p>
          ) : (
            <div className="space-y-1.5">
              {referralCodes.map((ref) => (
                <div 
                  key={ref.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-mono font-semibold text-sm text-slate-900">{ref.referral_code}</p>
                    <p className="text-xs text-slate-500">
                      {ref.signups_count || 0} signups • ${ref.earnings_total || 0} earned
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCode(ref.referral_code)}
                      className="h-7 w-7 p-0"
                    >
                      {copiedCode === ref.referral_code ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLink(ref.referral_code)}
                      className="h-7 text-xs px-2"
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold h-9 shadow-md"
          onClick={() => setShowPaymentDashboard(true)}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Earnings Dashboard
        </Button>
        
        <p className="text-xs text-center text-slate-500 mt-2">
          Member since {user.founding_circle_approved_at 
            ? new Date(user.founding_circle_approved_at).toLocaleDateString() 
            : 'N/A'}
        </p>

        <AmbassadorPaymentDashboard
          open={showPaymentDashboard}
          onOpenChange={setShowPaymentDashboard}
          user={user}
        />
      </CardContent>
    </Card>
  );
}