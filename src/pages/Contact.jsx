
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Mail, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ContactSubmission } from '@/entities/ContactSubmission';
import { SendEmail } from '@/integrations/Core';
import { trackEvent } from '@/components/utils/analytics';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  const handleGoBack = () => {
    window.history.back();
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({ type: 'error', message: 'Please fill out all fields.' });
      return;
    }
    
    setIsSending(true);
    setFormStatus({ type: '', message: '' });

    try {
      // 1. Save submission to the database
      await ContactSubmission.create(formData);
      
      // 2. Send email notification
      await SendEmail({
        to: 'jill@uffastforward.com',
        subject: `New Contact Form Submission from ${formData.name}`,
        body: `
          <p>You have a new message from the College Fast Forward contact form:</p>
          <ul>
            <li><strong>Name:</strong> ${formData.name}</li>
            <li><strong>Email:</strong> ${formData.email}</li>
          </ul>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${formData.message.replace(/\n/g, '<br>')}</p>
        `
      });

      trackEvent('Form Submitted', { form: 'contact' });
      setFormStatus({ type: 'success', message: 'Thank you! Your message has been sent.' });
      setFormData({ name: '', email: '', message: '' });

    } catch (error) {
      console.error("Contact form submission failed:", error);
      setFormStatus({ type: 'error', message: 'Something went wrong. Please try again or email us directly.' });
    } finally {
      setIsSending(false);
    }
  };

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
              <div className="w-8 h-8 bg-[var(--uf-orange)] rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Contact Us</h1>
                <p className="text-slate-600">Questions or feedback? We’d love to hear from you.</p>
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
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Get in Touch</h2>
                  <p className="text-slate-600">
                    For direct inquiries, please email us. We typically respond within one business day.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <Mail className="w-5 h-5 text-[var(--uf-blue)]" />
                  <div>
                    <p className="font-semibold text-slate-800">General Inquiries</p>
                    <a href="mailto:jill@uffastforward.com" className="text-[var(--uf-blue)] hover:underline">
                      jill@uffastforward.com
                    </a>
                  </div>
                </div>
              </div>
              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={formData.message} onChange={handleChange} rows={5} placeholder="How can we help?" required />
                </div>
                <Button type="submit" disabled={isSending} className="w-full bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]">
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit
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
      </main>
    </div>
  );
}
