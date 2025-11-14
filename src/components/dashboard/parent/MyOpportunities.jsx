import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';

export default function MyOpportunities({ opportunities, loading }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900">
            <Briefcase className="w-6 h-6 text-blue-600" />
            My Posted Opportunities
          </div>
          <Button size="sm" onClick={() => navigate('PostOpportunity')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Post New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        ) : opportunities.length > 0 ? (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <motion.div
                key={opp.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <p className="font-semibold text-slate-800">{opp.title}</p>
                  <p className="text-sm text-slate-500">{opp.org_name}</p>
                </div>
                <Badge variant={opp.status === 'active' ? 'default' : 'outline'}>
                  {opp.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 mb-3">You haven't posted any opportunities yet.</p>
            <Button variant="outline" onClick={() => navigate('PostOpportunity')}>
              Post Your First Opportunity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}