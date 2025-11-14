
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FAQ() {
  const handleGoBack = () => {
    window.history.back();
  };

  const faqData = [
    {
      category: 'General',
      questions: [
        {
          q: 'What is College Fast Forward?',
          a: 'College Fast Forward is a platform connecting UF students, alumni, and parents for career networking, internship/job referrals, and housing support.'
        },
        {
          q: 'Who can use this service?',
          a: 'UF students, alumni, and parents can sign up using Google OAuth with a valid account. We may restrict sign-up to @ufl.edu domains to maintain the integrity of the UF community.'
        },
        {
          q: 'How do I sign up?',
          a: 'Click "Sign In with Google," choose your role (student, alumni, or parent), and complete the short onboarding questions to get started.'
        }
      ]
    },
    {
      category: 'Account & Profile',
      questions: [
        {
          q: 'How do I update my profile?',
          a: 'Go to "My Profile" from the user menu in the top-right corner. From there, you can edit your information and save the changes.'
        },
        {
          q: 'I can’t sign in with Google. What should I do?',
          a: 'Ensure you’re using a valid Google account. If problems persist, please contact our support team at support@collegefastforward.com.'
        }
      ]
    },
    {
      category: 'Listings & Requests',
      questions: [
        {
          q: 'How do I post a job or internship request?',
          a: 'On the Six Degrees page, click the "Post Your Request" button. Fill in the details about the role or connection you are seeking, and publish it to the network.'
        },
        {
          q: 'How do I search for connections?',
          a: 'Navigate to the Six Degrees page and use the search bar and filters to find alumni or parents who can help with your request.'
        }
      ]
    },
    {
      category: 'Roommate Hub',
      questions: [
        {
          q: 'How do I post a roommate listing?',
          a: 'Go to the Roommate Hub and click "Post Listing". You can specify whether you have a room available or are looking for a room, add details, and publish.'
        },
        {
          q: 'Can I favorite listings?',
          a: 'Yes, click the star icon on any listing to save it. You can view all your favorited listings by using the filter options.'
        }
      ]
    },
    {
      category: 'Messaging & Connections',
      questions: [
        {
          q: 'How do I send a message?',
          a: 'Click the "Message" or "Connect" button on a user\'s listing card. This will open a modal where you can compose and send your message directly.'
        },
        {
          q: 'Where do I find my messages?',
          a: 'Message notifications and history are planned for a future update. For now, communications will be managed via email notifications.'
        }
      ]
    },
    {
      category: 'Boost Promotions',
      questions: [
        {
          q: 'What is a Boost?',
          a: 'A Boost is a paid promotion that increases your listing’s visibility for a set duration, placing it at the top of relevant search results and feeds.'
        },
        {
          q: 'How do I purchase a Boost?',
          a: 'Navigate to the "Amplify Your Ask" (Boost) page from the main navigation, select a tier, and complete the payment process to apply it to your listing.'
        }
      ]
    },
    {
      category: 'Parents & Alumni',
      questions: [
        {
          q: 'How can parents help their students?',
          a: 'Parents can add their student profile, view their requests, and offer referrals, resume reviews, mock interviews, and mentorship.'
        },
        {
          q: 'What can alumni do?',
          a: 'Alumni can respond to student requests, share advice, host virtual coffees, and participate in career networking opportunities.'
        }
      ]
    },
    {
      category: 'Parent-to-Parent Community',
      questions: [
        {
          q: 'What is the Parent-to-Parent Community?',
          a: 'The Parent-to-Parent Community lets UF parents join small groups (or Parent Circles) based on their child’s major, graduation year, or interests to share tips, resources, and support one another.'
        },
        {
          q: 'How do I join a Parent Circle?',
          a: 'Visit the Parent Communities page and select a Parent Circle that matches your interests. You will receive an email invitation with next steps upon approval.'
        }
      ]
    },
    {
      category: 'Technical & Privacy',
      questions: [
        {
          q: 'How do I manage cookies?',
          a: 'Please see our Cookie Policy for detailed instructions on enabling or disabling cookies in your browser settings.'
        },
        {
          q: 'Where can I find the Privacy Policy?',
          a: 'Our Privacy Policy is accessible from the footer on every page of the site.'
        },
        {
          q: 'How do I report a bug?',
          a: 'Use the "Contact Support" link in the footer or email support@collegefastforward.com with details about the issue.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
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
              <div className="w-8 h-8 bg-[var(--uf-blue)] rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {faqData.map((category, index) => (
            <div key={index}>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b-2 border-[var(--uf-orange)]">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {category.questions.map((item, qIndex) => (
                  <AccordionItem key={qIndex} value={`item-${qIndex}`} className="bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-lg shadow-sm">
                    <AccordionTrigger className="text-left font-semibold text-slate-800 px-6 py-4 hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-slate-600">
                      {item.q === 'How do I join a Parent Circle?' ? (
                        <>
                          Visit the <a href="#ParentCommunities" className="text-[var(--uf-blue)] hover:underline">Parent Communities</a> page and select a Parent Circle that matches your interests. You will receive an email invitation with next steps upon approval.
                        </>
                      ) : (
                        item.a
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
