import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, Lock } from 'lucide-react';
import { submitSalaryReport } from '@/functions/submitSalaryReport';
import { INDUSTRIES } from '@/components/onboarding/onboardingOptions';

const OFFER_TYPES = [
  { value: 'full_time', label: 'Full-Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'co_op', label: 'Co-op' },
];

const HOW_THEY_GOT_IT = [
  { value: 'online_application', label: 'Online Application' },
  { value: 'referral', label: 'Referral' },
  { value: 'career_fair', label: 'Career Fair' },
  { value: 'recruiter', label: 'Recruiter Outreach' },
  { value: 'networking', label: 'Networking' },
  { value: 'other', label: 'Other' },
];

export default function ShareOfferDataModal({ isOpen, onClose, user }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [offerType, setOfferType] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [signingBonus, setSigningBonus] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [housingStipend, setHousingStipend] = useState('');
  const [howTheyGotIt, setHowTheyGotIt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isInternship = offerType === 'internship' || offerType === 'part_time' || offerType === 'co_op';

  const handleSubmit = async () => {
    if (!company.trim() || !role.trim() || !offerType) return;
    setSubmitting(true);
    try {
      await submitSalaryReport({
        company: company.trim(),
        role: role.trim(),
        industry,
        location: location.trim(),
        offer_type: offerType,
        base_salary: baseSalary ? Number(baseSalary) : null,
        signing_bonus: signingBonus ? Number(signingBonus) : null,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        housing_stipend: housingStipend ? Number(housingStipend) : null,
        how_they_got_it: howTheyGotIt,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit salary report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCompany('');
    setRole('');
    setIndustry('');
    setLocation('');
    setOfferType('');
    setBaseSalary('');
    setSigningBonus('');
    setHourlyRate('');
    setHousingStipend('');
    setHowTheyGotIt('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Data Submitted! +25 karma 🎉</h3>
            <p className="text-sm text-slate-600 mb-1">
              Thanks for helping fellow Gators negotiate better offers.
            </p>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-6">
              <Lock className="w-3 h-3" /> Your identity has been fully removed from this report.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Share Offer Data</DialogTitle>
              <DialogDescription className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> 100% anonymous — no name or email is stored.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Company & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Company *</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Role *</Label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., SWE Intern"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Offer Type & Industry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Offer Type *</Label>
                  <Select value={offerType} onValueChange={setOfferType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {OFFER_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind.id} value={ind.id}>
                          {ind.emoji} {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, Remote"
                  className="mt-1"
                />
              </div>

              {/* Compensation Fields */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-slate-700 mb-3">Compensation</p>
                <div className="grid grid-cols-2 gap-3">
                  {!isInternship && (
                    <div>
                      <Label className="text-xs text-slate-500">Base Salary ($/yr)</Label>
                      <Input
                        type="number"
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(e.target.value)}
                        placeholder="85000"
                        className="mt-1"
                      />
                    </div>
                  )}
                  {isInternship && (
                    <div>
                      <Label className="text-xs text-slate-500">Hourly Rate ($)</Label>
                      <Input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="35"
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-slate-500">Signing Bonus ($)</Label>
                    <Input
                      type="number"
                      value={signingBonus}
                      onChange={(e) => setSigningBonus(e.target.value)}
                      placeholder="5000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Housing Stipend ($)</Label>
                    <Input
                      type="number"
                      value={housingStipend}
                      onChange={(e) => setHousingStipend(e.target.value)}
                      placeholder="3000"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* How they got it */}
              <div>
                <Label className="text-sm font-medium">How'd you get this offer?</Label>
                <Select value={howTheyGotIt} onValueChange={setHowTheyGotIt}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOW_THEY_GOT_IT.map(h => (
                      <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!company.trim() || !role.trim() || !offerType || submitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Submitting...</>
                ) : (
                  'Submit Anonymously'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}