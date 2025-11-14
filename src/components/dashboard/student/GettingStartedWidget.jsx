import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Users, HelpCircle, ArrowRight, User } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function GettingStartedWidget({ user }) {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Let's Get Started!</CardTitle>
        <CardDescription>Your career journey starts now. Here are a few things you can do to jump right in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionItem
            icon={Building2}
            title="Explore Opportunities"
            description="Find your first internship or job posted by the Gator network."
            buttonText="Browse Opportunities"
            onClick={() => navigate('Opportunities')}
            className="bg-orange-50 text-orange-800"
            buttonClassName="bg-orange-500 hover:bg-orange-600"
          />
          <ActionItem
            icon={HelpCircle}
            title="Request Help or Advice"
            description="Need a resume review or career advice? Post a request."
            buttonText="Post a Request"
            onClick={() => navigate('PostRequest')}
            className="bg-blue-50 text-blue-800"
            buttonClassName="bg-blue-500 hover:bg-blue-600"
          />
          <ActionItem
            icon={Users}
            title="Find Gator Roommates"
            description="Connect with fellow UF students and alumni for housing."
            buttonText="Find Roommates"
            onClick={() => navigate('Roommates')}
            className="bg-green-50 text-green-800"
            buttonClassName="bg-green-500 hover:bg-green-600"
          />
          <ActionItem
            icon={User}
            title="Complete Your Profile"
            description="A complete profile gets more views from alumni and parents."
            buttonText="Go to Profile"
            onClick={() => navigate('ProfileEdit')}
            className="bg-purple-50 text-purple-800"
            buttonClassName="bg-purple-500 hover:bg-purple-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}

const ActionItem = ({ icon: Icon, title, description, buttonText, onClick, className, buttonClassName }) => (
  <div className={`p-6 rounded-xl flex flex-col ${className}`}>
    <div className="flex items-center gap-4 mb-3">
      <Icon className="w-8 h-8" />
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
    <p className="text-sm mb-4 flex-grow">{description}</p>
    <Button onClick={onClick} className={`w-full ${buttonClassName}`}>
      {buttonText} <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </div>
);