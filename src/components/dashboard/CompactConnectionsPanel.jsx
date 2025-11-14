import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart, ArrowRight } from 'lucide-react';
import MyMessagesWidget from './MyMessagesWidget';
import HelpOffersWidget from './HelpOffersWidget';
import { navigate } from '@/components/utils/navigation';

export default function CompactConnectionsPanel() {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg">
            <Button
              variant={activeTab === 'messages' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-md"
              onClick={() => setActiveTab('messages')}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Messages
            </Button>
            <Button
              variant={activeTab === 'offers' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-md"
              onClick={() => setActiveTab('offers')}
            >
              <Heart className="w-4 h-4 mr-2" /> Offers
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => navigate('Messages')}
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {activeTab === 'messages' ? <MyMessagesWidget /> : <HelpOffersWidget />}
      </CardContent>
    </Card>
  );
}