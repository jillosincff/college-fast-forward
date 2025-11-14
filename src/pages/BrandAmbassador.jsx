
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Users, Target, Gift, Send, Loader2, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AmbassadorApplication } from '@/entities/AmbassadorApplication';
import { SendEmail } from '@/integrations/Core';
import { trackEvent } from '@/components/utils/analytics';

export default function BrandAmbassador() {
  const [formData, setFormData] = useState({ name: '', email: '', role: '', why: '' });
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  const handleGoBack = () => {
    window.history.back();
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.why) {
      setFormStatus({ type: 'error', message: 'Please fill out all fields.' });
      return;
    }
    
    setIsSending(true);
    setFormStatus({ type: '', message: '' });

    try {
      // 1. Save application to the database
      await AmbassadorApplication.create(formData);
      
      // 2. Send email notification
      await SendEmail({
        to: 'jill@uffastforward.com',
        subject: `New Brand Ambassador Application from ${formData.name}`,
        body: `
          <p>You have a new Brand Ambassador application from College Fast Forward:</p>
          <ul>
            <li><strong>Name:</strong> ${formData.name}</li>
            <li><strong>Email:</strong> ${formData.email}</li>
            <li><strong>Role:</strong> ${formData.role}</li>
          </ul>
          <hr>
          <p><strong>Why they want to be an Ambassador:</strong></p>
          <p>${formData.why.replace(/\n/g, '<br>')}</p>
        `
      });

      trackEvent('Form Submitted', { form: 'ambassador', role: formData.role });
      setFormStatus({ type: 'success', message: 'Thank you! Your application has been submitted. We\'ll be in touch soon.' });
      setFormData({ name: '', email: '', role: '', why: '' });

    } catch (error) {
      console.error("Ambassador application failed:", error);
      setFormStatus({ type: 'error', message: 'Something went wrong. Please try again or email us directly.' });
    } finally {
      setIsSending(false);
    }
  };

  const sections = [
    {
      icon: Target,
      title: "Why Ambassador?",
      content: "As a Brand Ambassador, you'll be the face of College Fast Forward at the University of Florida and other campuses. Share the platform with peers, organize meetups, and help grow our community of students, alumni, and parents."
    },
    {
      icon: Users,
      title: "Who We're Looking For",
      content: [
        { title: "UF Students", description: "Enthusiastic leaders who know campus life inside and out." },
        { title: "Alumni & Recent Grads", description: "Passionate professionals eager to give back and mentor." },
        { title: "Parents & Guardians", description: "Engaged families ready to share opportunities and advice." }
      ]
    },
    {
      icon: Star,
      title: "Ambassador Responsibilities",
      content: [
        "Host information sessions or tabling events on campus.",
        "Share our platform on social media and campus groups.",
        "Gather feedback and suggestions from the UF community.",
        "Coordinate with our team on promotional campaigns and materials."
      ]
    },
    {
      icon: Gift,
      title: "Benefits & Perks",
      content: [
        "Official College Fast Forward Ambassador swag (t-shirts, stickers).",
        "Early access to new features and beta programs.",
        "Networking opportunities with alumni and hiring partners.",
        "Letter of recommendation and ambassador certificate upon successful term.",
        "Stipend or gift cards based on event participation (if applicable)."
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
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Become a Brand Ambassador</h1>
                <p className="text-slate-600">Represent College Fast Forward on campus and beyond</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Card className="bg-gradient-to-r from-[var(--uf-blue)] to-[var(--uf-blue-light)] border-0 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Join Our Ambassador Team!</h2>
              <p className="text-blue-100 text-lg max-w-3xl mx-auto">
                If you're a UF student, alum, or parent passionate about connecting Gators, we want you! 
                Help us grow our community and make a difference in fellow Gators' lives.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full bg-white/60 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <section.icon className="w-5 h-5 text-[var(--uf-blue)]" />
                    </div>
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {typeof section.content === 'string' ? (
                    <p className="text-slate-700">{section.content}</p>
                  ) : Array.isArray(section.content) && typeof section.content[0] === 'string' ? (
                    <ul className="space-y-2">
                      {section.content.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <div className="w-1.5 h-1.5 bg-[var(--uf-orange)] rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-4">
                      {section.content.map((item, i) => (
                        <div key={i}>
                          <h4 className="font-semibold text-slate-800">{item.title}:</h4>
                          <p className="text-slate-600 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Send className="w-6 h-6 text-[var(--uf-blue)]" />
                How to Apply
              </CardTitle>
              <p className="text-slate-600">Fill out our quick application form, and we'll be in touch:</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Your Name" 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="you@domain.com" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">UF Student</SelectItem>
                      <SelectItem value="alumni">Alumni / Recent Grad</SelectItem>
                      <SelectItem value="parent">Parent / Guardian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="why">Why do you want to be an Ambassador?</Label>
                  <Textarea 
                    id="why" 
                    value={formData.why} 
                    onChange={handleChange} 
                    rows={4} 
                    placeholder="Tell us what excites you about this role" 
                    required 
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSending} 
                  className="w-full bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
                {formStatus.message && (
                  <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${formStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {formStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {formStatus.message}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Questions?</h3>
              <p className="text-green-100 mb-4">
                Contact our team with any questions about the Brand Ambassador program.
              </p>
              <Button
                variant="secondary"
                className="bg-white text-green-600 hover:bg-green-50"
                onClick={() => window.location.href = 'mailto:jill@uffastforward.com'}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
