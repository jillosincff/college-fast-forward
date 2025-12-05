import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, ExternalLink, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function FoundingCircleLeaderWidget({ user }) {
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