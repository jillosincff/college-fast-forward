import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Building2, Users, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

export default function FastTrackProCard({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.FastTrackProProfile.filter({ user_email: user.email })
      .then(profiles => setProfile(profiles?.[0] || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (loading) return null;

  const hasProfile = profile?.assessment_complete;
  const companiesResearched = profile?.companies_researched || 0;
  const alumniDiscovered = profile?.alumni_discovered || 0;
  const messagesDrafted = profile?.messages_drafted || 0;

  return (
    <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-lg overflow-hidden">
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Fast Track Pro</h3>
              <p className="text-xs text-slate-500">AI Career Intelligence</p>
            </div>
          </div>
        </div>

        {hasProfile ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                <Building2 className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{companiesResearched}</p>
                <p className="text-[10px] text-slate-500 leading-tight">Companies</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                <Users className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{alumniDiscovered}</p>
                <p className="text-[10px] text-slate-500 leading-tight">Alumni Found</p>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                <FileText className="w-4 h-4 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">{messagesDrafted}</p>
                <p className="text-[10px] text-slate-500 leading-tight">Drafts</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('FastTrackPro')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
            >
              Open Fast Track Pro <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-4">
              Get AI-powered company intel, discover UF alumni at your target companies, and draft personalized outreach — all in one place.
            </p>
            <Button
              onClick={() => navigate('FastTrackPro')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}