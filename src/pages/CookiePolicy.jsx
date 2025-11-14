import { motion } from "framer-motion";
import { ArrowLeft, Cookie, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CookiePolicy() {
  const handleGoBack = () => {
    window.history.back();
  };

  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: (
        <p>
          College Fast Forward ("we," "us," "our") uses cookies and similar tracking technologies on{" "}
          <a href="https://www.collegefastforward.com" className="text-[var(--uf-blue)] hover:underline">collegefastforward.com</a>{" "}
          (the "Site"). This Cookie Policy explains what cookies are, how we use them, and how you can manage your preferences.
        </p>
      )
    },
    {
      id: "what-are-cookies",
      title: "2. What Are Cookies?",
      content: (
        <p className="text-slate-700">
          Cookies are small text files placed on your device (computer, tablet, or mobile) by websites you visit.
          They help the site recognize your device and remember information about your preferences or past activity.
        </p>
      )
    },
    {
      id: "types-of-cookies",
      title: "3. Types of Cookies We Use",
      content: (
        <ul className="list-disc list-inside space-y-3 text-slate-700">
          <li>
            <strong>Essential Cookies:</strong> Required for basic site functionality (e.g., authentication,
            session management). Without these, the Site may not function properly.
          </li>
          <li>
            <strong>Performance & Analytics Cookies:</strong> Collect anonymous data about page views,
            load times, and user interactions to help us improve site performance. We use Google Analytics.
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember your settings and choices (e.g., language,
            region, role selection) to enhance your experience.
          </li>
          <li>
            <strong>Advertising & Targeting Cookies:</strong> Track browsing habits to deliver
            relevant ads and measure campaign effectiveness. We do not share personal data with advertisers.
          </li>
        </ul>
      )
    },
    {
      id: "how-we-use",
      title: "4. How We Use Cookies",
      content: (
        <ul className="list-disc list-inside space-y-1 text-slate-700">
          <li>Authenticate and keep you signed in during your session.</li>
          <li>Remember your role selection (Student, Alumni, Parent) and onboarding progress.</li>
          <li>Analyze site usage to optimize features like Six Degrees, Roommate Hub, and Boost.</li>
          <li>Serve relevant content, guide testing, and improve marketing efforts.</li>
        </ul>
      )
    },
    {
      id: "third-party",
      title: "5. Third-Party Cookies",
      content: (
        <p className="text-slate-700">
          We allow certain third parties (e.g., Google Analytics) to set cookies when you visit our Site.
          These providers adhere to their own privacy policies. We do not control these cookies but
          require that they comply with relevant privacy laws.
        </p>
      )
    },
    {
      id: "managing-cookies",
      title: "6. Managing & Disabling Cookies",
      content: (
        <div className="space-y-4">
          <p className="text-slate-700">You can manage or disable cookies at any time via your browser settings:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options &gt; Privacy & Security &gt; Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
            <li><strong>Edge:</strong> Settings &gt; Site permissions &gt; Cookies and site data</li>
          </ul>
          <p className="text-slate-700">
            Disabling cookies may limit functionality—features like staying logged in,
            remembering your role, or personalized content may not work correctly.
          </p>
        </div>
      )
    },
    {
      id: "changes",
      title: "7. Changes to This Cookie Policy",
      content: (
        <p className="text-slate-700">
          We may update this policy periodically to reflect changes in technology or legal requirements.
          When we do, we will revise the "Effective Date" above. Your continued use of the Site after
          changes constitutes acceptance of the updated policy.
        </p>
      )
    },
    {
      id: "contact",
      title: "8. Contact Us",
      content: (
        <div className="space-y-3">
          <p className="text-slate-700">If you have any questions or concerns about this Cookie Policy, please contact us at:</p>
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-4 h-4 text-[var(--uf-blue)]" />
            <a href="mailto:privacy@collegefastforward.com" className="text-[var(--uf-blue)] hover:underline">
              privacy@collegefastforward.com
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
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Cookie Policy</h1>
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

        {/* Cookie Management Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white">
            <CardContent className="p-6 md:p-8 text-center">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-xl font-bold mb-2">Manage Your Cookie Preferences</h3>
              <p className="text-amber-100 mb-6">
                You can adjust your browser settings to control cookies and their behavior on our site.
              </p>
              <Button
                variant="secondary"
                className="bg-white text-amber-600 hover:bg-amber-50"
                onClick={() => alert("Please use your browser's settings to manage cookies. See section 6 above for specific instructions.")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Cookie Settings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}