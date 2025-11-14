import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

const MobileTestSuite = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          Mobile Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Check for responsive design, touch targets, and mobile performance.
        </p>
        <Button disabled>Run Mobile Tests</Button>
        <p className="text-xs text-slate-500 mt-2">This component is a placeholder. Full functionality coming soon.</p>
      </CardContent>
    </Card>
  );
};

export default MobileTestSuite;