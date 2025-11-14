import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, MessageSquare, Award } from 'lucide-react';

export default function ParentQuickStats() {
  const [stats, setStats] = useState({
    connections_made: 0,
    students_helped: 0,
    messages_sent: 0,
    impact_score: 0
  });

  // Load stats (placeholder for now)
  useEffect(() => {
    // TODO: Replace with actual stats loading
    setStats({
      connections_made: 2,
      students_helped: 5,
      messages_sent: 8,
      impact_score: 85
    });
  }, []);

  const statItems = [
    {
      label: 'Connections Made',
      value: stats.connections_made,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Students Helped',
      value: stats.students_helped,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Messages Sent',
      value: stats.messages_sent,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Impact Score',
      value: stats.impact_score,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">📊</span>
          Your Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((stat, index) => (
            <div key={index} className="text-center p-3 rounded-lg bg-slate-50">
              <div className={`w-8 h-8 ${stat.bgColor} ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
        {stats.impact_score > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Community Rank</span>
              <Badge className="bg-orange-100 text-orange-700">Top Helper</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">You're making a real difference!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}