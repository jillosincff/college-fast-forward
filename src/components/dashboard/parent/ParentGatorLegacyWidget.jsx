import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Heart, Star, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function ParentGatorLegacyWidget() {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-6 h-6 text-orange-600" />
          Your Gator Legacy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">5</div>
          <div className="text-sm text-gray-600">Students Helped</div>
        </div>
        
        <div className="space-y-2">
          <Badge className="w-full justify-center bg-blue-100 text-blue-800 py-2">
            <Star className="w-4 h-4 mr-2" />
            Community Helper
          </Badge>
          <Badge className="w-full justify-center bg-orange-100 text-orange-800 py-2">
            <Heart className="w-4 h-4 mr-2" />
            Mentor Status
          </Badge>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Recent Impact</h4>
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              • Connected Sarah M. to Google recruiter
            </div>
            <div className="text-xs text-gray-600">
              • Helped David L. with resume review
            </div>
            <div className="text-xs text-gray-600">
              • Provided career advice to Emily R.
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => navigate('MyImpact')}
        >
          View Full Impact <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}