import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const SecurityTester = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Security Tester
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Scan for common vulnerabilities like XSS and CSRF.
        </p>
        <Button disabled>Run Security Scans</Button>
        <p className="text-xs text-slate-500 mt-2">This component is a placeholder. Full functionality coming soon.</p>
      </CardContent>
    </Card>
  );
};

export default SecurityTester;