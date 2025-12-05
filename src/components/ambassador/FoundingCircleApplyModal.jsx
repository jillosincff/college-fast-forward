import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, LogIn } from 'lucide-react';
import { FoundingCircleApplication } from '@/entities/FoundingCircleApplication';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';

export default function FoundingCircleApplyModal({ open, onClose, school = "UF", accentColor = "#FA4616" }) {
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    linkedin_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (user) {
      const nameParts = (user.full_name || '').split(' ');
      setFormData(prev => ({
        ...prev,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if already applied
      const existing = await FoundingCircleApplication.filter({ email: formData.email });
      if (existing && existing.length > 0) {
        setError('You have already applied. We will be in touch soon!');
        setIsSubmitting(false);
        return;
      }

      // Create application
      await FoundingCircleApplication.create({
        ...formData,
        school: school,
        status: 'pending'
      });

      // Send email notification to admin
      try {
        await base44.integrations.Core.SendEmail({
          to: 'admin@collegefastforward.com',
          subject: `New Founding Circle Lead Application - ${school}`,
          body: `
New Founding Circle Lead Application

Name: ${formData.first_name} ${formData.last_name}
Email: ${formData.email}
Phone: ${formData.phone_number || 'Not provided'}
LinkedIn: ${formData.linkedin_url || 'Not provided'}
School: ${school}

Please review this application in your Admin Dashboard.
          `.trim()
        });
      } catch (emailErr) {
        console.error('Failed to send notification email:', emailErr);
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ first_name: '', last_name: '', email: '', phone_number: '', linkedin_url: '' });
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center" style={{ color: accentColor }}>
            Apply to Lead - Founding Circle
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : !user ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-600">Sign in to apply for the Founding Circle Lead program.</p>
            <Button
              onClick={handleLogin}
              className="h-12 text-lg font-bold text-black"
              style={{ backgroundColor: accentColor }}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Apply
            </Button>
          </div>
        ) : success ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-xl font-bold text-gray-900">Application Submitted!</h3>
            <p className="text-gray-600">
              We'll review your application and get back to you soon.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg font-bold text-black"
              style={{ backgroundColor: accentColor }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                'Submit Application'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}