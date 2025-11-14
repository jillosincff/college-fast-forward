import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { User, ArrowRight, CheckCircle2, Settings, Sparkles } from 'lucide-react';
import PreferenceWizard from '../PreferenceWizard';

export default function ProfileProgressWidget() {
  const { user } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fields = [
      { key: 'full_name', weight: 10 },
      { key: 'bio', weight: 15 },
      { key: 'major', weight: 10 },
      { key: 'graduation_year', weight: 10 },
      { key: 'location', weight: 10 },
      { key: 'linkedin_url', weight: 10 },
      { key: 'skills_showcase', weight: 15, isArray: true },
      { key: 'target_roles', weight: 10 },
      { key: 'target_industries', weight: 5 },
      { key: 'target_locations', weight: 5 }
    ];

    let score = 0;
    fields.forEach(field => {
      const value = user[field.key];
      if (field.isArray) {
        if (value && value.length > 0) score += field.weight;
      } else {
        if (value && (typeof value === 'string' ? value.trim() !== '' : true)) {
          score += field.weight;
        }
      }
    });

    setCompletionScore(Math.round(score));
  }, [user]);

  const hasPreferences = user?.target_roles || user?.target_industries || user?.target_locations;

  const incompleteItems = [];
  if (!user?.bio) incompleteItems.push({ label: 'Add bio', action: () => navigate('ProfileEdit') });
  if (!user?.linkedin_url) incompleteItems.push({ label: 'Add LinkedIn', action: () => navigate('ProfileEdit') });
  if (!user?.skills_showcase || user.skills_showcase.length === 0) {
    incompleteItems.push({ label: 'Add skills', action: () => navigate('ProfileEdit') });
  }
  if (!hasPreferences) {
    incompleteItems.push({ label: 'Set job preferences', action: () => setShowPreferences(true) });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-blue-600" />
            Profile Strength
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">
                {completionScore}% Complete
              </span>
              <Badge
                variant={completionScore >= 80 ? "default" : "secondary"}
                className={completionScore >= 80 ? "bg-green-600" : ""}
              >
                {completionScore >= 80 ? "Strong" : completionScore >= 50 ? "Good" : "Needs Work"}
              </Badge>
            </div>
            <Progress value={completionScore} className="h-3" />
          </div>

          {/* Action Items */}
          {incompleteItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Quick Actions
              </p>
              {incompleteItems.slice(0, 3).map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}

          {/* NEW: Job Preferences Section */}
          {!hasPreferences && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Get Personalized Job Matches
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Set your preferences to receive AI-powered recommendations tailored to your goals
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowPreferences(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Set Job Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}

          {hasPreferences && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Job preferences set
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferences(true)}
                  className="text-green-700 hover:text-green-900 hover:bg-green-100"
                >
                  Update
                </Button>
              </div>
            </div>
          )}

          {completionScore >= 80 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Great profile! You're all set.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PreferenceWizard
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </>
  );
}