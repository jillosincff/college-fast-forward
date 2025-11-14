import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, MapPin, Building, TrendingUp, Users, Briefcase } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function MyCareerGoals() {
  const [goals] = useState({
    role: 'Senior Marketing Role',
    location: 'Austin/Dallas area',
    industry: 'Tech or Healthcare',
    relevantAlumni: 3,
    jobLeads: 2
  });

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 text-orange-600 flex items-center justify-center rounded-lg">
              <Target className="w-5 h-5" />
            </span>
            My Career Goals
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-700">
            Update Goals
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Goals */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
              <span className="text-sm text-slate-700">{goals.role}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <span className="text-sm text-slate-700">{goals.location}</span>
            </div>
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-slate-400 mt-0.5" />
              <span className="text-sm text-slate-700">{goals.industry}</span>
            </div>
          </div>

          {/* Current Opportunities */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700">Relevant Alumni</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {goals.relevantAlumni}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">Job Leads This Week</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {goals.jobLeads}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => navigate('GatorDirectory')}
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
            >
              🔍 Find Alumni in My Field
            </Button>
            <Button 
              onClick={() => navigate('Opportunities')}
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
            >
              💼 Browse Job Opportunities
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}