import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { exportUsers } from '@/functions/exportUsers';

export default function ExportUsersSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('all');

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await exportUsers({ persona: selectedPersona });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${selectedPersona}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast({ title: "✅ Export Complete", description: "CSV file downloaded successfully" });
    } catch (error) {
      toast({ title: "Export Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><Download className="w-5 h-5 text-green-600" />Export User Data</CardTitle>
        <p className="text-sm text-slate-600 mt-2">Download a CSV file containing user names and email addresses.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Select User Type</label>
          <select value={selectedPersona} onChange={(e) => setSelectedPersona(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="all">Parents & Alumni (Both)</option>
            <option value="parent">Parents Only</option>
            <option value="alumni">Alumni Only</option>
            <option value="gator">Students/Gators Only</option>
          </select>
        </div>
        <Button onClick={handleExport} disabled={loading} className="w-full bg-green-600 hover:bg-green-700" size="lg">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exporting...</> : <><Download className="w-4 h-4 mr-2" />Download CSV</>}
        </Button>
      </CardContent>
    </Card>
  );
}