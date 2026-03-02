import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Building2, Users, FileText, ArrowRight } from 'lucide-react';
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

  if (!hasProfile) {
    return (
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">FASTIQ™</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Stop cold applying. Start using FASTIQ.
          </h3>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-6">
            The intelligent networking engine that finds UF alumni at your target companies — even outside CFF — and helps you reach out.
          </p>
          <Button
            onClick={() => navigate('FastTrackPro')}
            className="bg-white text-[#0021A5] hover:bg-white/90 font-bold px-6 h-11 text-sm shadow-lg"
          >
            Activate FASTIQ → <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-100 shadow-lg overflow-hidden">
      <CardContent className="pt-5 pb-5 px-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">FASTIQ™</h3>
            <p className="text-xs text-slate-500">Intelligent networking engine</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <Building2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{profile.companies_researched || 0}</p>
            <p className="text-[10px] text-slate-500 leading-tight">Companies</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <Users className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{profile.alumni_discovered || 0}</p>
            <p className="text-[10px] text-slate-500 leading-tight">Alumni Found</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center">
            <FileText className="w-4 h-4 text-orange-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-900">{profile.messages_drafted || 0}</p>
            <p className="text-[10px] text-slate-500 leading-tight">Drafts</p>
          </div>
        </div>

        <Button
          onClick={() => navigate('FastTrackPro')}
          className="w-full bg-gradient-to-r from-[#0021A5] to-[#FA4616] hover:opacity-90 text-white font-semibold h-11"
        >
          Open FASTIQ <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}