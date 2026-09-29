import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MagicMomentVisual from '@/components/landing/MagicMomentVisual';

// Public, mobile-first parent gift page. A parent (not logged in) gives a
// student the Fall semester of CLIFF Pro for $99, one time, through Dec 31.
// UTMs are captured from the URL (search + hash) and sessionStorage, and passed
// to checkout. Student name/email pre-fill from URL params (e.g. an Ask-a-parent
// email link). No Jill name or photo.

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];

function readParams() {
  const out = {};
  const sp = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.split('?')[1] || '';
  const hp = new URLSearchParams(hashQuery);
  for (const k of ['student_name', 'student_email', 'parent_name', 'parent_email', ...UTM_KEYS]) {
    out[k] = sp.get(k) || hp.get(k) || '';
  }
  return out;
}

function captureUtms(params) {
  // Persist UTMs on first landing so a later checkout still attributes correctly.
  try {
    const existing = sessionStorage.getItem('cff_forparents_utm');
    const incoming = UTM_KEYS.reduce((o, k) => (params[k] ? { ...o, [k]: params[k] } : o), {});
    if (existing) {
      const merged = { ...JSON.parse(existing), ...incoming };
      sessionStorage.setItem('cff_forparents_utm', JSON.stringify(merged));
      return merged;
    }
    if (Object.keys(incoming).length) {
      sessionStorage.setItem('cff_forparents_utm', JSON.stringify(incoming));
      return incoming;
    }
    return {};
  } catch { return {}; }
}

export default function ForParents() {
  const [form, setForm] = useState({ parentName: '', parentEmail: '', studentName: '', studentEmail: '' });
  const [utm, setUtm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const p = readParams();
    setForm({
      parentName: p.parent_name || '',
      parentEmail: p.parent_email || '',
      studentName: p.student_name || '',
      studentEmail: p.student_email || '',
    });
    setUtm(captureUtms(p));
    // Log a page view for the admin "Parent page opens" metric.
    try { base44?.analytics?.track?.({ eventName: 'for_parents_viewed', properties: { utm_source: p.utm_source || '' } })?.catch?.(() => {}); } catch {}
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.parentName || !form.parentEmail || !form.studentName || !form.studentEmail) {
      setError('Please fill in all four fields.');
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke('giftProCheckout', {
        plan: 'fall_semester_gift',
        parentName: form.parentName,
        parentEmail: form.parentEmail,
        studentName: form.studentName,
        studentEmail: form.studentEmail,
        utm_source: utm.utm_source || '',
        utm_medium: utm.utm_medium || '',
        utm_campaign: utm.utm_campaign || '',
        utm_content: utm.utm_content || '',
      });
      const data = res?.data || res;
      const url = data?.url;
      if (url) { window.location.href = url; return; }
      setError(data?.error || 'Could not start checkout. Try again.');
    } catch (e) {
      setError(e?.response?.data?.error || e?.data?.error || 'Could not start checkout. Try again.');
    }
    setBusy(false);
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[16px] text-slate-900 outline-none focus:border-violet-400 focus:bg-white';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm">C</div>
          <span className="font-extrabold text-slate-900">CLIFF</span>
          <span className="text-xs text-slate-400 ml-auto">College Fast Forward</span>
        </div>

        <h1 className="text-[26px] leading-tight font-extrabold text-slate-900 mb-3">
          A step-by-step job search coach for your college student.
        </h1>
        <p className="text-[15px] text-slate-600 leading-relaxed mb-5">
          CLIFF helps your student pick the internships and jobs worth applying to, tailor their resume for each one, and prep for interviews when they land one. Give them the Fall semester for $99.
        </p>

        <div className="mb-5">
          <MagicMomentVisual />
        </div>

        <button
          onClick={() => document.getElementById('gift-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="w-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-[16px] py-4 shadow-lg active:scale-[0.99] transition mb-6"
        >
          Give them a coach — $99
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
          <p className="text-[14px] text-slate-800 font-semibold mb-1">Sound familiar?</p>
          <p className="text-[14px] text-slate-600 leading-relaxed">
            They've applied to dozens of jobs and heard back from almost none. When you ask how it's going, you get "fine." It's usually not effort that's missing. It's a plan.
          </p>
        </div>

        <p className="text-[14px] font-semibold text-slate-900 mb-2">What your student gets through Dec 31:</p>
        <ul className="space-y-2 mb-5">
          {[
            'Best Moves — the openings worth their time',
            'A resume tailored to every job, with no limit',
            'One clear next step at a time: pick, tailor, apply, track',
            'Mock interview practice when they land an interview',
            'One tracker for every application',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[14px] text-slate-700">
              <span className="mt-0.5 text-violet-600">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
          <p className="text-[14px] font-semibold text-slate-900 mb-2">How the gift works</p>
          <ol className="space-y-1.5 text-[14px] text-slate-600 list-decimal pl-5">
            <li>You pay $99 once — not a subscription.</li>
            <li>Your student gets an email and signs up.</li>
            <li>Pro is on through December 31, then it simply ends.</li>
          </ol>
        </div>

        <p className="text-[13px] text-slate-500 mb-4">
          <span className="font-semibold text-slate-700">Who it's for:</span> College juniors, seniors, and recent grads looking for an internship or first full-time job.
        </p>

        <div id="gift-form" className="bg-white rounded-2xl border-2 border-violet-200 shadow-sm p-5 mb-4 scroll-mt-4">
          <div className="space-y-3">
            <input className={inputCls} placeholder="Your name (parent)" value={form.parentName} onChange={set('parentName')} autoComplete="name" />
            <input className={inputCls} type="email" placeholder="Your email" value={form.parentEmail} onChange={set('parentEmail')} autoComplete="email" />
            <input className={inputCls} placeholder="Student's name" value={form.studentName} onChange={set('studentName')} />
            <input className={inputCls} type="email" placeholder="Student's email" value={form.studentEmail} onChange={set('studentEmail')} />
          </div>

          {error && <div className="mt-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] px-3 py-2">{error}</div>}

          <button
            onClick={submit}
            disabled={busy}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-[16px] py-4 shadow-lg disabled:opacity-70 active:scale-[0.99] transition"
          >
            {busy ? 'Starting checkout…' : 'Give them a coach — $99'}
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-3">Full refund within 14 days if your student doesn't use it.</p>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          By continuing you agree to CLIFF's terms. One-time payment of $99. Pro access ends December 31, 2026.
        </p>
      </div>
    </div>
  );
}