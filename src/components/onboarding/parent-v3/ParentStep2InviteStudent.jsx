import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import {
  OnboardingShell, ProgressDots, FieldLabel, FieldInput,
  HelperText, PrimaryButton, BackLink, dmSans, playfair, ORANGE,
} from './ParentOnboardingShell';
import useFoundingOffer from '@/components/founding-offer/useFoundingOffer';
import PostInviteConfirmation from './PostInviteConfirmation';
import { useAuth } from '@/components/auth/AuthContext';

const COMMON_UNIVERSITIES = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Miami', 'University of South Florida', 'Florida Atlantic University',
  'Florida International University', 'University of North Florida', 'Stetson University',
  'Rollins College', 'University of Tampa', 'Nova Southeastern University',
  'University of Alabama', 'Auburn University', 'University of Georgia', 'Georgia Tech',
  'Clemson University', 'University of South Carolina', 'University of Tennessee',
  'Vanderbilt University', 'University of Kentucky', 'University of Mississippi',
  'Louisiana State University', 'University of Arkansas', 'Texas A&M University',
  'University of Texas at Austin', 'Baylor University', 'Rice University', 'SMU',
  'TCU', 'Ohio State University', 'University of Michigan', 'Michigan State University',
  'Penn State University', 'University of Wisconsin', 'University of Minnesota',
  'University of Iowa', 'Indiana University', 'Purdue University', 'Northwestern University',
  'University of Illinois', 'University of Notre Dame', 'Wake Forest University',
  'Duke University', 'University of North Carolina', 'NC State University',
  'University of Virginia', 'Virginia Tech', 'James Madison University',
  'Boston College', 'Boston University', 'Northeastern University', 'Harvard University',
  'MIT', 'Yale University', 'Princeton University', 'Columbia University', 'NYU',
  'Cornell University', 'University of Pennsylvania', 'Brown University',
  'Dartmouth College', 'Georgetown University', 'American University',
  'George Washington University', 'Stanford University', 'UC Berkeley', 'UCLA', 'USC',
  'UC San Diego', 'UC Davis', 'UC Irvine', 'UC Santa Barbara',
  'University of Colorado Boulder', 'Arizona State University', 'University of Arizona',
  'University of Oregon', 'University of Washington', 'Colorado State University',
  'University of Denver', 'Emory University', 'Tulane University', 'Loyola University',
  'Marquette University', 'Villanova University', 'Fordham University', 'Syracuse University',
  'University of Connecticut', 'University of Maryland', 'Rutgers University',
  'University of Pittsburgh', 'Carnegie Mellon University', 'University of Rochester',
];

const MAX_STUDENTS = 4;

export default function ParentStep2InviteStudent({
  formData, onUpdate, onInvite, onSkip, onBack, isLoading,
  invitedStudents = [],
}) {
  const { user } = useAuth();
  const offer = useFoundingOffer(user);
  const [errors, setErrors] = useState({});
  const [universitySearch, setUniversitySearch] = useState(formData.studentUniversity || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const dropdownRef = useRef(null);

  const totalInvited = invitedStudents.length;
  const atMax = totalInvited >= MAX_STUDENTS;

  // When a new invite succeeds, reset form and go to confirmation view
  useEffect(() => {
    if (totalInvited > 0) {
      setUniversitySearch('');
      setErrors({});
      setShowInviteForm(false); // Return to confirmation view
    }
  }, [totalInvited]);

  useEffect(() => {
    if (universitySearch.length >= 2) {
      const q = universitySearch.toLowerCase();
      const matches = COMMON_UNIVERSITIES.filter(u => u.toLowerCase().includes(q)).slice(0, 8);
      setFilteredSchools(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setShowDropdown(false);
    }
  }, [universitySearch]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectUniversity = (name) => {
    setUniversitySearch(name);
    onUpdate({ studentUniversity: name });
    setShowDropdown(false);
    setErrors(p => ({ ...p, studentUniversity: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.studentFirstName?.trim()) e.studentFirstName = 'Student first name is required';
    if (!formData.studentEmail?.trim()) e.studentEmail = 'Student email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.studentEmail.trim())) e.studentEmail = 'Please enter a valid email';
    if (!universitySearch.trim()) e.studentUniversity = 'University is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInvite = () => {
    if (!validate()) return;
    if (!formData.studentUniversity) onUpdate({ studentUniversity: universitySearch.trim() });
    onInvite();
  };

  // Determine view: confirmation (post-invite) vs form
  const showConfirmation = totalInvited > 0 && !showInviteForm && !atMax;
  const showForm = !showConfirmation;

  // Max reached state
  if (atMax) {
    return (
      <OnboardingShell>
        <ProgressDots current={1} total={2} />
        <div style={{ marginBottom: 28 }}>
          {invitedStudents.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <span style={{ color: '#4CAF50', fontSize: 14 }}>✓</span>
              <span style={{ fontFamily: dmSans, fontSize: 14, color: '#fff' }}>
                Invitation sent to <strong>{s.name}</strong> at {s.university}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: 'rgba(244,240,232,0.5)', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
          {"You've invited"} {MAX_STUDENTS} {"students — that's the maximum per account."}
        </p>

        {/* Show founding offer on max state too */}
        {offer.active && (
          <>
            <div style={{ height: 1, background: ORANGE, opacity: 0.4, margin: '0 0 24px' }} />
            <PostInviteConfirmation
              invitedStudents={invitedStudents}
              offer={offer}
              onInviteAnother={() => {}}
              onSkip={onSkip}
            />
          </>
        )}
        {!offer.active && (
          <PrimaryButton onClick={onSkip}>
            Continue to your profile →
          </PrimaryButton>
        )}
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell>
      <ProgressDots current={1} total={2} />

      {/* Post-invite confirmation state with founding offer */}
      {showConfirmation && (
        <PostInviteConfirmation
          invitedStudents={invitedStudents}
          offer={offer}
          onInviteAnother={() => setShowInviteForm(true)}
          onSkip={onSkip}
        />
      )}

      {/* Invite form view */}
      {showForm && (
        <>
          {/* Header */}
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 26, color: '#f4f0e8', textAlign: 'center', lineHeight: 1.3, marginBottom: 8 }}>
            {totalInvited > 0 ? 'Invite another student.' : "Now let's get your student set up."}
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
            {totalInvited > 0
              ? `You can invite up to ${MAX_STUDENTS} students total.`
              : "Send them an invitation to join College Fast Forward. They'll create their own profile and get access to FastIQ."
            }
          </p>

          {/* Student First Name */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel required>{"Your student's first name"}</FieldLabel>
            <FieldInput
              value={formData.studentFirstName || ''}
              onChange={e => { onUpdate({ studentFirstName: e.target.value }); setErrors(p => ({ ...p, studentFirstName: null })); }}
              placeholder="First name only"
              error={errors.studentFirstName}
            />
            {errors.studentFirstName && <HelperText error>{errors.studentFirstName}</HelperText>}
          </div>

          {/* Student Email */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel required>Their email address</FieldLabel>
            <FieldInput
              value={formData.studentEmail || ''}
              onChange={e => { onUpdate({ studentEmail: e.target.value }); setErrors(p => ({ ...p, studentEmail: null })); }}
              placeholder="student@university.edu"
              type="email"
              error={errors.studentEmail}
            />
            {errors.studentEmail ? <HelperText error>{errors.studentEmail}</HelperText> : (
              <HelperText>{"We'll send them a personal invitation from you."}</HelperText>
            )}
          </div>

          {/* University */}
          <div style={{ marginBottom: 28, position: 'relative' }} ref={dropdownRef}>
            <FieldLabel required>Where do they go to school?</FieldLabel>
            <input
              className="po3-field"
              value={universitySearch}
              onChange={e => {
                setUniversitySearch(e.target.value);
                onUpdate({ studentUniversity: e.target.value });
                setErrors(p => ({ ...p, studentUniversity: null }));
              }}
              placeholder="Start typing their school..."
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: `0.5px solid ${errors.studentUniversity ? 'rgba(229,57,53,0.6)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, padding: '12px 16px',
                fontFamily: dmSans, fontSize: 14, fontWeight: 300,
                color: '#f4f0e8', boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
            />
            {errors.studentUniversity && <HelperText error>{errors.studentUniversity}</HelperText>}

            {showDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, marginTop: 4, maxHeight: 200, overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}>
                {filteredSchools.map(school => (
                  <button
                    key={school}
                    type="button"
                    onClick={() => selectUniversity(school)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 16px', background: 'none', border: 'none',
                      fontFamily: dmSans, fontSize: 13, fontWeight: 400,
                      color: '#f4f0e8', cursor: 'pointer', minHeight: 'auto',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    {school}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <PrimaryButton onClick={handleInvite} disabled={isLoading}>
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Invitation →'}
          </PrimaryButton>

          {/* Skip / back */}
          <button
            type="button"
            onClick={totalInvited > 0 ? () => setShowInviteForm(false) : onSkip}
            style={{
              display: 'block', width: '100%', marginTop: 14, textAlign: 'center',
              background: 'none', border: 'none',
              fontFamily: dmSans, fontSize: 13, fontWeight: 300,
              color: 'rgba(244,240,232,0.4)', cursor: 'pointer',
              transition: 'color 0.2s', minHeight: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(244,240,232,0.4)'; }}
          >
            {totalInvited > 0 ? '← Back to confirmation' : "I'll invite them later"}
          </button>

          {totalInvited === 0 && <BackLink onClick={onBack} />}
        </>
      )}
    </OnboardingShell>
  );
}