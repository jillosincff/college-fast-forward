import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugFamilyLink() {
  const { user } = useAuth();
  const [linkData, setLinkData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLink = async () => {
      try {
        const result = await base44.functions.invoke('checkFamilyLink', {
          studentEmail: 'lindseyosinoff@ufl.edu',
          parentEmail: 'losinoff@yahoo.com'
        });
        setLinkData(result.data);
      } catch (error) {
        console.error('Check failed:', error);
        setLinkData({ error: error.message });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) checkLink();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Family Link Debug</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Student: lindseyosinoff@ufl.edu</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(linkData?.student, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Parent: losinoff@yahoo.com</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(linkData?.parent, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Link Status</CardTitle>
        </CardHeader>
        <CardContent>
          {linkData?.student && linkData?.parent ? (
            <div className="space-y-2">
              <p><strong>Student family_group_id:</strong> {linkData.student.family_group_id || 'NOT SET'}</p>
              <p><strong>Parent family_group_id:</strong> {linkData.parent.family_group_id || 'NOT SET'}</p>
              <p><strong>Match:</strong> {linkData.student.family_group_id === linkData.parent.family_group_id && linkData.student.family_group_id ? '✅ YES' : '❌ NO'}</p>
            </div>
          ) : (
            <p className="text-red-600">Could not find one or both users</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}