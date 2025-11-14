import { motion } from "framer-motion";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  const handleGoBack = () => {
    window.history.back();
  };

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: <p>By accessing or using College Fast Forward (“we,” “us,” “our,” or the “Service”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree, please do not use the Service.</p>
    },
    {
      id: "changes",
      title: "2. Changes to Terms",
      content: <p>We may update these Terms at any time. When we do, we will revise the “Effective Date” above. Your continued use after changes constitutes acceptance of the new Terms.</p>
    },
    {
      id: "description",
      title: "3. Description of Service",
      content: <p>College Fast Forward provides a platform enabling University of Florida students, alumni, and parents to connect for career networking, internship/job referrals, and housing support. Features include job and internship requests, roommate listings, messaging, and optional paid “Boost” promotions.</p>
    },
    {
      id: "eligibility",
      title: "4. Eligibility",
      content: <p>To use the Service, you must be at least 18 years old and register with a valid Google account. We may restrict access to users with a <code>@ufl.edu</code> email domain to maintain our community of UF affiliates.</p>
    },
    {
      id: "account",
      title: "5. Account Registration & Security",
      content: (
        <ul className="list-disc list-inside space-y-1 text-slate-700">
          <li>You must provide accurate information during signup and keep it updated.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You agree to notify us immediately of any unauthorized use of your account.</li>
        </ul>
      )
    },
    {
      id: "conduct",
      title: "6. User Conduct",
      content: (
        <>
          <p>When using the Service you agree not to:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 mt-2">
            <li>Post illegal, harassing, defamatory, or infringing content.</li>
            <li>Use the Service for spam, phishing, or other unauthorized outreach.</li>
            <li>Reverse-engineer, scrape, or copy any part of the Service except as permitted.</li>
          </ul>
        </>
      )
    },
    {
      id: "content-ownership",
      title: "7. Content Ownership & License",
      content: <p>You retain ownership of the content you submit (listings, messages, profile data). You grant us a worldwide, non-exclusive, royalty-free license to host, display, and distribute your content as needed to operate the Service.</p>
    },
    {
      id: "fees",
      title: "8. Fees & Payments",
      content: <p>Certain features (e.g., Boost promotions) may require payment. All fees are listed in USD and non-refundable except as required by law. We reserve the right to change pricing at any time with notice.</p>
    },
    {
      id: "ip",
      title: "9. Intellectual Property",
      content: <p>All rights, title, and interest in the Service (excluding user content) are owned by College Fast Forward and its licensors. The Service and its components are protected by copyright, trademark, and other laws.</p>
    },
    {
      id: "termination",
      title: "10. Termination",
      content: <p>We may suspend or terminate your account at any time for violations of these Terms or without cause with notice. Upon termination, your right to use the Service immediately ceases.</p>
    },
    {
      id: "disclaimer",
      title: "11. Disclaimer of Warranties",
      content: <p>The Service is provided “as-is” and “as-available” without warranty of any kind. We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</p>
    },
    {
      id: "liability",
      title: "12. Limitation of Liability",
      content: <p>To the fullest extent permitted by law, College Fast Forward and its affiliates will not be liable for any indirect, incidental, special, or consequential damages arising from or related to your use of the Service, even if advised of the possibility of such damages.</p>
    },
    {
      id: "indemnification",
      title: "13. Indemnification",
      content: <p>You agree to indemnify and hold harmless College Fast Forward and its officers, directors, employees, and agents from any claims, losses, liabilities, and expenses arising from your use of the Service or your violation of these Terms.</p>
    },
    {
      id: "governing-law",
      title: "14. Governing Law & Dispute Resolution",
      content: <p>These Terms are governed by the laws of the State of Florida, without regard to conflict-of-law provisions. Any dispute will be resolved in state or federal courts in Palm Beach County, Florida.</p>
    },
    {
      id: "contact",
      title: "15. Contact Information",
      content: (
        <div className="space-y-2">
          <p className="text-slate-700">If you have questions or concerns about these Terms, please contact us at:</p>
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-4 h-4 text-[var(--uf-blue)]" />
            <a href="mailto:legal@collegefastforward.com" className="text-[var(--uf-blue)] hover:underline">
              legal@collegefastforward.com
            </a>
          </div>
        </div>
      )
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
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
                <p className="text-sm text-slate-600">
                  <strong>Effective Date:</strong> June 10, 2025
                </p>
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
          className="space-y-8"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {section.title}
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}