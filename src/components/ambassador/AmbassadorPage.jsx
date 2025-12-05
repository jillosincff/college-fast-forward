import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Referral } from '@/entities/Referral';

export default function AmbassadorPage({ 
  school, 
  nickname, 
  prefix, 
  primaryColor = "#0021A5", 
  accentColor = "#FA4616",
  leadFormUrl = "https://forms.gle/YOUR_LINK"
}) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [finalCode, setFinalCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all fields');
      return;
    }
    setShowCodeBox(true);
    setError('');
  };

  const handleSaveCode = async () => {
    const input = customCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (input.length < 3) {
      setError('Code must be at least 3 characters');
      return;
    }

    const code = `${prefix}-${input}`;
    setIsSubmitting(true);
    setError('');

    try {
      // Check if code already exists
      const existing = await Referral.filter({ referral_code: code });
      if (existing && existing.length > 0) {
        setError('Code already taken — try another!');
        setIsSubmitting(false);
        return;
      }

      // Create the referral
      await Referral.create({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        referral_code: code,
        school: school,
        role: 'ambassador',
        status: 'active'
      });

      setFinalCode(code);
    } catch (err) {
      console.error('Error creating referral:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 
          className="text-center text-4xl md:text-5xl font-bold mb-4"
          style={{ color: primaryColor }}
        >
          Earn Real Money Referring {nickname}
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          Two ways to get paid — pick the one that fits you.
        </p>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Campus Ambassador Card */}
          <Card className="shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div 
              className="py-6 text-center"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #003399 100%)` }}
            >
              <h2 className="text-3xl font-bold text-white mb-1">
                Campus Ambassador
              </h2>
              <p className="text-lg font-semibold" style={{ color: accentColor }}>
                Free & Open to All
              </p>
            </div>
            
            <CardContent className="p-8">
              <ul className="text-lg space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <span>💰</span>
                  <span><strong>$5 one-time bonus per signup</strong> (max $100 lifetime, 20 referrals)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📈</span>
                  <span><strong>15% monthly commission</strong> on each paid family</span>
                </li>
              </ul>

              <p className="text-center text-sm text-gray-500 mb-6">
                $5 bonus only during Free Phase (first 1,000 UF users)
              </p>

              {!showCodeBox ? (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-12 border-gray-300"
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-12 border-gray-300"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 border-gray-300"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold text-white rounded-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Join Free — Get Your Code in 30 Seconds →
                  </Button>
                </form>
              ) : !finalCode ? (
                <div className="text-center space-y-4">
                  <p className="text-lg">Choose your code:</p>
                  <div className="flex items-center justify-center gap-2">
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      {prefix}-
                    </span>
                    <Input
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      placeholder="YOURNAME"
                      maxLength={12}
                      className="w-40 h-12 text-xl text-center font-bold"
                    />
                  </div>
                  <Button
                    onClick={handleSaveCode}
                    disabled={isSubmitting}
                    className="px-8 h-12 text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      'Lock It In'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                  <p 
                    className="text-4xl font-black"
                    style={{ color: primaryColor }}
                  >
                    {finalCode}
                  </p>
                  <p className="text-lg text-gray-600">
                    🎉 Start sharing your code and earn!
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-600 text-center mt-4 font-medium">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Founding Circle Card */}
          <Card className="shadow-xl overflow-hidden bg-gray-900">
            {/* Header Banner */}
            <div 
              className="py-6 text-center"
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)' }}
            >
              <h2 
                className="text-3xl font-bold mb-1"
                style={{ color: accentColor }}
              >
                Founding Circle (Lead)
              </h2>
              <p className="text-lg font-semibold" style={{ color: accentColor }}>
                Parents Only • Limited Spots • Apply Now
              </p>
            </div>
            
            <CardContent className="p-8">
              <ul className="text-lg space-y-3 mb-6 text-white">
                <li className="flex items-start gap-2">
                  <span>💰</span>
                  <span><strong>$5 one-time bonus per signup</strong> (max $200 lifetime, 40 referrals)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📈</span>
                  <span><strong>25% monthly commission</strong> on each paid family</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🔥</span>
                  <span><strong>5% override</strong> on your recruited ambassadors' earnings</span>
                </li>
              </ul>

              <p className="text-center text-sm text-gray-400 mb-6">
                $5 bonus only during Free Phase (first 1,000 UF users)
              </p>

              <a
                href={leadFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 text-center text-xl font-bold rounded-lg text-black"
                style={{ backgroundColor: accentColor }}
              >
                Apply to Lead →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}