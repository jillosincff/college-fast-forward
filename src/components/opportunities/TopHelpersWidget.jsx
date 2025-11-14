import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Award } from 'lucide-react';

const topHelpers = [
  { name: 'Sarah Johnson', value: '5 Opps Posted', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
  { name: 'Mike Chen', value: '12 Intros Made', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { name: 'Jennifer L.', value: '8 Questions Answered', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
];

export default function TopHelpersWidget() {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Top Helpers This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {topHelpers.map((helper, index) => (
            <li key={index} className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={helper.avatar} alt={helper.name} />
                <AvatarFallback>{helper.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-slate-800">{helper.name}</p>
                <p className="text-xs text-slate-500">{helper.value}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}