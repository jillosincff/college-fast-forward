import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Loader2, RefreshCw, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
// fixMissingPersonas invoked via base44.functions below

export default function PersonaAuditTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('mismatched');
  const [updating, setUpdating] = useState(null);
  const [emailingGators, setEmailingGators] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await base44.entities.User.filter({}, '-created_date', 500);
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally { setLoading(false); }
  };

  const analyzeMislabeling = (user) => {
    const email = user.email?.toLowerCase() || '';
    const persona = user.persona;
    const issues = [];
    if (email.endsWith('@ufl.edu') && persona && persona !== 'gator' && persona !== 'student') issues.push(`@ufl.edu email but persona is "${persona}"`);
    if (!email.endsWith('@ufl.edu') && (persona === 'gator' || persona === 'student')) issues.push(`Non-UFL email but persona is "${persona}"`);
    if (persona === 'alumni' && user.graduation_year && user.graduation_year >= new Date().getFullYear()) issues.push(`Alumni with graduation year ${user.graduation_year}`);
    return issues;
  };

  const handleUpdatePersona = async (userId, newPersona) => {
    setUpdating(userId);
    try {
      const response = await base44.functions.invoke('fixUserAccount', {
        email: users.find(u => u.id === userId)?.email,
        updates: { persona: newPersona, roles: [newPersona] }
      });
      if (response.data?.error) throw new Error(response.data.error);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, persona: newPersona, roles: [newPersona] } : u));
      toast({ title: "Updated!", description: `Persona changed to ${newPersona}` });
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setUpdating(null); }
  };

  const filteredUsers = users.filter(user => {
    if (user.roles?.includes('admin')) return false;
    const issues = analyzeMislabeling(user);
    if (filter === 'mismatched') return issues.length > 0;
    if (filter === 'no-persona') return !user.persona;
    if (filter === 'all') return true;
    return user.persona === filter || (filter === 'gator' && user.persona === 'student');
  });

  const stats = {
    total: users.filter(u => !u.roles?.includes('admin')).length,
    potentialIssues: users.filter(u => analyzeMislabeling(u).length > 0).length,
    alumni: users.filter(u => u.persona === 'alumni').length,
    parent: users.filter(u => u.persona === 'parent').length,
    gator: users.filter(u => u.persona === 'gator' || u.persona === 'student').length,
    noPersona: users.filter(u => !u.persona && !u.roles?.includes('admin')).length,
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" /><p className="text-slate-600">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[{k:'all',v:stats.total,l:'Total',c:''},{k:'mismatched',v:stats.potentialIssues,l:'⚠️ Issues',c:stats.potentialIssues>0?'border-red-300 bg-red-50':''},{k:'alumni',v:stats.alumni,l:'Alumni',c:''},{k:'parent',v:stats.parent,l:'Parents',c:''},{k:'gator',v:stats.gator,l:'Gators',c:''},{k:'no-persona',v:stats.noPersona,l:'No Persona',c:''}].map(s=>
          <Card key={s.k} className={`cursor-pointer hover:shadow-md ${s.c} ${filter===s.k?'ring-2 ring-blue-400':''}`} onClick={()=>setFilter(s.k)}>
            <CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{s.v}</p><p className="text-xs text-slate-600">{s.l}</p></CardContent>
          </Card>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{filteredUsers.length} users</span>
        <Button onClick={loadUsers} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
      </div>
      <Card><CardContent className="p-4">
        {filteredUsers.length === 0 ? <div className="text-center py-8"><CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" /><p>No users match this filter</p></div> :
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredUsers.map(user => {
            const issues = analyzeMislabeling(user);
            return <div key={user.id} className={`p-3 rounded-lg border ${issues.length>0?'border-red-300 bg-red-50':'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{user.full_name||'No name'}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100">{user.persona||'none'}</span>
                  </div>
                  <p className="text-xs text-slate-600">{user.email}</p>
                  {issues.length>0&&<div className="mt-2 bg-red-100 rounded p-2 text-xs text-red-700">{issues.map((i,idx)=><div key={idx}>• {i}</div>)}</div>}
                </div>
                <div className="flex gap-1">
                  {['alumni','parent','gator'].map(p=><Button key={p} size="sm" variant={user.persona===p?'default':'outline'} onClick={()=>handleUpdatePersona(user.id,p)} disabled={updating===user.id}>{updating===user.id?<Loader2 className="w-3 h-3 animate-spin"/>:p}</Button>)}
                </div>
              </div>
            </div>;
          })}
        </div>}
      </CardContent></Card>
    </div>
  );
}