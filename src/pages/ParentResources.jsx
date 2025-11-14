import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Heart, Download, HelpCircle, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ParentResources() {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleDownload = (fileName) => {
    alert(`This would start a download for: ${fileName}`);
  };

  const resourceSections = [
    {
      icon: BookOpen,
      title: "Onboarding Guide",
      description: "Learn how to get started and set up your parent profile.",
      links: [
        { text: "Step-by-Step Onboarding", href: "#HelpCenter" },
        { text: "Updating Your Parent Profile", href: "#HelpCenter" }
      ]
    },
    {
      icon: Heart,
      title: "How to Help Your Gator",
      description: "Practical ways you can support your student's career journey.",
      links: [
        { text: "Offering Job & Internship Referrals", href: "#HelpCenter" },
        { text: "Resume & LinkedIn Review Checklist", href: "#HelpCenter" },
        { text: "Conducting Mock Interviews", href: "#HelpCenter" },
        { text: "Making Networking Introductions", href: "#HelpCenter" }
      ]
    },
    {
      icon: Download,
      title: "Templates & Downloads",
      description: "Ready-to-use resources to make helping easier.",
      links: [
        { text: "Student Introduction Email Template", onClick: () => handleDownload('intro-email-template.docx'), download: true },
        { text: "Resume Feedback Guide (PDF)", onClick: () => handleDownload('resume-feedback-guide.pdf'), download: true },
        { text: "Mock Interview Question List", onClick: () => handleDownload('mock-interview-questions.docx'), download: true }
      ]
    },
    {
      icon: HelpCircle,
      title: "Parent FAQs",
      description: "Quick answers to common questions from parents.",
      links: [
        { text: "How can parents help their students?", href: "#FAQ" },
        { text: "What help options are available?", href: "#FAQ" },
        { text: "Updating my profile information", href: "#FAQ" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="p-2"
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--uf-orange)] rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Parent Resources</h1>
                <p className="text-slate-600">Tools and guides to help your Gator succeed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        >
          {resourceSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <section.icon className="w-5 h-5 text-[var(--uf-blue)]" />
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900">{section.title}</CardTitle>
                  </div>
                  <p className="text-sm text-slate-600">{section.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.text}>
                        <a
                          href={link.href || '#'}
                          onClick={link.onClick}
                          className="flex items-center gap-2 text-[var(--uf-blue)] hover:underline text-sm font-medium"
                        >
                          {link.download ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                          <span>{link.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-blue-light)] border-0 text-white">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                <p className="text-blue-100">
                  If you can't find an answer, our support team is here to assist you.
                </p>
              </div>
              <Button
                variant="secondary"
                className="bg-white text-[var(--uf-blue)] hover:bg-blue-50 flex-shrink-0"
                onClick={() => window.location.href = 'mailto:support@collegefastforward.com'}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}