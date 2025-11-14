import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MyMessagesWidget from './MyMessagesWidget';
import HelpOffersWidget from './HelpOffersWidget';
import { MessageSquare, Heart } from 'lucide-react';

export default function SocialCard() {
  return (
    <Card className="h-full">
      <Tabs defaultValue="messages" className="flex flex-col h-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 h-auto rounded-lg">
            <TabsTrigger value="messages" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="offers" className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
              <Heart className="w-4 h-4 mr-2" />
              Help Offers
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="flex-grow">
          <TabsContent value="messages" className="h-full">
            <MyMessagesWidget />
          </TabsContent>
          <TabsContent value="offers" className="h-full">
            <HelpOffersWidget />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}