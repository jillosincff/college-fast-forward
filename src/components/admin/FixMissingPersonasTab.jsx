import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { fixMissingPersonas } from '@/functions/fixMissingPersonas';

export default function FixMissingPersonasSection({ usersWithoutPersona, onComplete }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const students = usersWithoutPersona.filter(u => u.email?.toLowerCase().endsWith('@ufl.edu'));
  const parents = usersWithoutPersona.filter(u => !u.email?.toLowerCase().endsWith('@ufl.edu'));

  const handleUpdateSingle = async (user, newPersona) => {
    setUpdating(user.id);
    try {
      await base44.entities.User.update(user.id, { persona: newPersona, roles: [newPersona], onboarding_completed: false });
      toast({ title: "Updated!", description: `${user.email} is now a ${newPersona}` });
      onComplete?.();
    } catch (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setUpdating(null); }
  };

  const handleUpdateAll = async () => {
    if (!confirm(`Assign personas to ${usersWithoutPersona.length} users?`)) return;
    setLoading(true);
    try {
      const response = await fixMissingPersonas({ dryRun: false });
      if (response.data?.success) { toast({ title: "Done!", description: `Updated ${response.data.summary.students + response.data.summary.parents} users` }); onComplete?.(); }
      else throw new Error(response.data?.error);
    } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-100 rounded-lg p-3"><p className="text-2xl font-bold">{usersWithoutPersona.length}</p><p className="text-xs text-slate-600">Total</p></div>
        <div className="bg-purple-100 rounded-lg p-3"><p className="text-2xl font-bold text-purple-700">{students.length}</p><p className="text-xs text-purple-600">Students</p></div>
        <div className="bg-orange-100 rounded-lg p-3"><p className="text-2xl font-bold text-orange-700">{parents.length}</p><p className="text-xs text-orange-600">Parents</p></div>
      </div>
      <Button onClick={handleUpdateAll} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : <><CheckCircle className="w-4 h-4 mr-2" />Update All {usersWithoutPersona.length}</>}
      </Button>
    </div>
  );
}