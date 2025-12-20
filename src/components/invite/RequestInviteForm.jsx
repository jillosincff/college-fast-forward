import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Mail, User, MessageSquare } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function RequestInviteForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.InviteRequest.create({
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        reason: formData.reason,
        status: 'pending'
      });

      setSubmitted(true);
      toast.success('Request submitted successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
        <p className="text-slate-600 mb-4">
          We'll review your request and send you an invite code via email within 24-48 hours.
        </p>
        <p className="text-sm text-slate-500">
          Check your inbox at <strong>{formData.email}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="John Smith"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          I am a... *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'alumni' })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.role === 'alumni'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-2xl mb-1">🎓</div>
            <div className="font-semibold text-slate-900">UF Alumni</div>
            <div className="text-xs text-slate-500">Graduate of UF</div>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'parent' })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.role === 'parent'
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="text-2xl mb-1">👨‍👩‍👧</div>
            <div className="font-semibold text-slate-900">UF Parent</div>
            <div className="text-xs text-slate-500">Parent of UF student</div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Why do you want to join? (optional)
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Textarea
            placeholder="Tell us a bit about yourself and why you'd like to join..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="pl-10 min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || !formData.role}
          className="flex-1 bg-[#FA4616] hover:bg-orange-600"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Request Invite'
          )}
        </Button>
      </div>

      <p className="text-xs text-slate-500 text-center">
        UF students with @ufl.edu email can join directly without an invite code.
      </p>
    </form>
  );
}