import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`Searching for: "${searchQuery}". This would normally search our help articles.`);
    }
  };

  const categories = [
    {
      icon: "🚀",
      title: "Getting Started",
      articles: [
        { title: "How do I sign up and choose my role?", href: "#getting-started-signup" },
        { title: "Completing your onboarding profile", href: "#getting-started-onboarding" },
        { title: "Navigating the dashboard", href: "#getting-started-navigation" }
      ]
    },
    {
      icon: "🖋",
      title: "Account & Profile",
      articles: [
        { title: "How do I update my profile information?", href: "#account-edit-profile" },
        { title: "Changing or verifying my email", href: "#account-change-email" },
        { title: "Troubleshooting Google login", href: "#account-passwordless" }
      ]
    },
    {
      icon: "📄",
      title: "Listings & Requests",
      articles: [
        { title: "How do I post a job or internship request?", href: "#listings-post-listing" },
        { title: "Editing or deleting a listing", href: "#listings-edit-listing" },
        { title: "Using search and filters", href: "#listings-search-filters" }
      ]
    },
    {
      icon: "✉️",
      title: "Messaging & Connections",
      articles: [
        { title: "How to send a message", href: "#messaging-send-message" },
        { title: "Viewing and managing conversations", href: "#messaging-view-conversation" },
        { title: "Notification settings", href: "#messaging-notifications" }
      ]
    },
    {
      icon: "💎",
      title: "Boost Promotions",
      articles: [
        { title: "Understanding Boost tiers", href: "#boost-plans" },
        { title: "How to purchase and apply a Boost", href: "#boost-purchase-boost" },
        { title: "Boost refunds and policies", href: "#boost-refunds" }
      ]
    },
    {
      icon: "🛠",
      title: "Technical & Security",
      articles: [
        { title: "Supported browsers & devices", href: "#technical-browser-support" },
        { title: "Managing cookies and privacy", href: "#technical-cookies" },
        { title: "How to report a bug or issue", href: "#technical-report-issue" }
      ]
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <main>
        {/* Main header section with gradient and search input */}
        <section className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-orange)] text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold">Help Center</h1>
            <p className="text-lg mt-2 opacity-90">How can we help you?</p>
            <div className="mt-8 max-w-lg mx-auto relative">
              <Input
                type="search"
                placeholder="Search for articles..."
                className="w-full h-12 pl-12 pr-4 rounded-full bg-white/20 placeholder-white/70 text-white border-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                aria-label="Search help articles"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            </div>
          </div>
        </section>

        {/* Categories Grid and Contact Support Sections */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            {/* Categories Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <span className="text-2xl" role="img" aria-hidden="true">{category.icon}</span>
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {category.articles.map((article, articleIndex) => (
                          <li key={articleIndex}>
                            <a
                              href={article.href}
                              onClick={(e) => {
                                e.preventDefault();
                                alert(`This would open: ${article.title}`);
                              }}
                              className="text-slate-600 hover:text-[var(--uf-blue)] transition-colors duration-200 text-sm flex items-center gap-2 group"
                            >
                              <span>{article.title}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">🤝 Still need help?</h2>
                  <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                    If you can't find an answer above, reach out to our support team. We're here to help!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="secondary"
                      className="bg-white text-green-600 hover:bg-green-50"
                      onClick={() => window.location.href = 'mailto:support@collegefastforward.com'}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                      onClick={() => alert("Contact form would open here")}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Form
                    </Button>
                  </div>
                  <div className="mt-6 text-sm text-green-100">
                    <p>📧 support@collegefastforward.com</p>
                    <p>⏱️ We typically respond within 24 hours</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}