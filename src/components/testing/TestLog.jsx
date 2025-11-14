import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const TestLog = ({ history = [] }) => {
  const statusIcons = {
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    failed: <AlertTriangle className="w-4 h-4 text-red-500" />,
    running: <Clock className="w-4 h-4 text-blue-500 animate-spin" />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4" />
          Test Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          {history.length === 0 ? (
            <div className="text-center text-sm text-slate-500 py-8">
              No tests run yet.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((test) => (
                <div key={test.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {statusIcons[test.status] || <Clock className="w-4 h-4" />}
                    <div>
                      <p className="font-medium text-slate-700">{test.type}</p>
                      <p className="text-slate-500">{test.timestamp}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{test.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TestLog;