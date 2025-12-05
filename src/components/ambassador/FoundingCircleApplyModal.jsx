import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

    if (!formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the Founding Circle Leader Agreement to proceed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use user's email from auth
      const userEmail = user.email;

      // Check if already applied
      const existing = await FoundingCircleApplication.filter({ email: userEmail });
      if (existing && existing.length > 0) {
        setError('You have already applied. We will be in touch soon!');
        setIsSubmitting(false);
        return;
      }

      // Create application with user's authenticated email
      await FoundingCircleApplication.create({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: userEmail,
        phone_number: formData.phone_number,
        linkedin_url: formData.linkedin_url,
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
Email: ${userEmail}
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
    setAgreedToTerms(false);
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

            {/* Founding Circle Leader Agreement */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto text-xs text-gray-700">
              <p className="font-bold mb-2 text-sm">FOUNDING CIRCLE LEADER AGREEMENT (revocable license)</p>
              <p className="mb-2">By clicking "Submit Application" and/or accepting appointment as a Founding Circle Leader, you agree:</p>
              <ol className="list-decimal list-inside space-y-1 mb-2">
                <li>This is a revocable, performance-based license — not employment or partnership.</li>
                <li>College Fast Forward reserves the right to modify compensation rates, caps, or structure at any time with 14 days written notice.</li>
                <li>We may revoke your Founding Circle status (and revert you to regular Campus Ambassador rates) at our sole discretion for inactivity, low performance, policy violations, or any reason. No notice required for revocation due to fraud or violation.</li>
                <li>You have no vested right to future commissions beyond what has already been earned and paid.</li>
                <li>All decisions by College Fast Forward are final.</li>
              </ol>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agree-terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
                className="mt-0.5"
              />
              <Label htmlFor="agree-terms" className="text-sm text-gray-700 cursor-pointer leading-tight">
                I have read and agree to the above terms <span className="text-red-500">*</span>
              </Label>
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !agreedToTerms}
              className="w-full h-12 text-lg font-bold text-black disabled:opacity-50"
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