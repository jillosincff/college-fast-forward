import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, ArrowRight } from 'lucide-react';

export default function ParentCommunities() {

  const circles = [
    {
      title: "UF '25 STEM Parents",
      description: "Parents of students graduating in 2025 with STEM majors."
    },
    {
      title: "UF '26 Business & Marketing Parents",
      description: "Parents of students focused on business, marketing, and entrepreneurship."
    },
    {
      title: "Parent Mentorship Group",
      description: "All parents interested in sharing career advice and referrals."
    },
    {
      title: "UF Parents – Housing & Roommates",
      description: "Collaborate on tips for finding off-campus housing and roommate arrangements."
    }
  ];

  const howItWorksSteps = [
    "Review the list of Parent Circles below.",
    "Click 'Request to Join' on any Circle that matches your interests or child's cohort.",
    "Submit a brief introduction—why you'd like to join.",
    "Once approved by the moderator, you'll receive an email invitation with links to your Circle's private forum and events."
  ];

  const handleRequestToJoin = (circleTitle) => {
    alert(`This would open a form to request to join "${circleTitle}". This functionality is pending backend implementation.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Hero Section */}
      <section className="bg-white pt-12 pb-16 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block p-4 bg-[var(--uf-orange)]/10 rounded-2xl mb-4">
              <Users className="w-10 h-10 text-[var(--uf-orange)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Parent-to-Parent Community
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
              Connect with fellow UF parents in small, moderated Parent Circles. Share insights, resources, and support each other based on your child's major, graduation year or interests.
            </p>
          </motion.div>
        </div>
      </section>
      
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        {/* Available Circles Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-10">Available Parent Circles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {circles.map((circle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-xl text-[var(--uf-blue)]">{circle.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <p className="text-slate-600 flex-grow mb-6">{circle.description}</p>
                    <Button 
                      onClick={() => handleRequestToJoin(circle.title)}
                      className="w-full bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]"
                    >
                      Request to Join <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {howItWorksSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 mt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Support Section */}
        <section>
          <Card className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-blue-light)] text-white">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex items-center gap-4">
                  <Mail className="w-8 h-8 text-white/80 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold">Need Assistance?</h3>
                    <p className="text-blue-100">
                      If you have questions or issues joining a Circle, contact our support team.
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-[var(--uf-blue)] hover:bg-blue-50 flex-shrink-0"
                  onClick={() => window.location.href = 'mailto:support@collegefastforward.com'}
                >
                  Contact Support
                </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}