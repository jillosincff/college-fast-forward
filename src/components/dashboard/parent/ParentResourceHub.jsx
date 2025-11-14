import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen, Users, MessageCircle, Star } from 'lucide-react';

export default function ParentResourceHub() {
  const resources = [
    {
      title: 'Parent Networking Guide',
      description: 'Learn how to effectively help students through your network',
      icon: BookOpen,
      link: '#',
      type: 'guide'
    },
    {
      title: 'Join Parent Community',
      description: 'Connect with other UF parents who are helping students',
      icon: Users,
      link: '#ParentCommunities',
      type: 'community'
    },
    {
      title: 'Best Practices',
      description: 'Tips for making meaningful introductions',
      icon: Star,
      link: '#',
      type: 'tips'
    },
    {
      title: 'Success Stories',
      description: 'See how other parents have made an impact',
      icon: MessageCircle,
      link: '#SuccessStories',
      type: 'stories'
    }
  ];

  const getIconColor = (type) => {
    switch (type) {
      case 'guide': return 'text-blue-600 bg-blue-100';
      case 'community': return 'text-green-600 bg-green-100';
      case 'tips': return 'text-orange-600 bg-orange-100';
      case 'stories': return 'text-purple-600 bg-purple-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-lg">📚</span>
          Resource Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <div key={index} className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(resource.type)}`}>
                  <resource.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 text-sm">{resource.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{resource.description}</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700 text-xs"
                    onClick={() => {
                      if (resource.link.startsWith('#')) {
                        // Navigate to internal page
                        const page = resource.link.slice(1);
                        if (page) window.location.hash = page;
                      } else {
                        // External link
                        window.open(resource.link, '_blank');
                      }
                    }}
                  >
                    Learn More <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <p className="text-sm font-medium text-slate-800">💡 Pro Tip</p>
          <p className="text-xs text-slate-600 mt-1">
            The most impactful introductions happen when you personally know both people. Quality over quantity!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}