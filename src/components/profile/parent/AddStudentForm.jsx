import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const BORDER = '#2A2A2A';

const UNIVERSITIES = [
  'University of Florida', 'Florida State University', 'University of Central Florida',
  'University of Miami', 'University of South Florida', 'Florida Atlantic University',
  'Florida International University', 'University of North Florida', 'University of Georgia',
  'Georgia Tech', 'Emory University', 'University of Alabama', 'Auburn University',
  'LSU', 'University of Tennessee', 'Vanderbilt University', 'Clemson University',
  'University of South Carolina', 'University of Virginia', 'Virginia Tech',
  'NC State University', 'UNC Chapel Hill', 'Duke University', 'University of Michigan',
  'Ohio State University', 'Penn State', 'University of Texas at Austin',
  'Texas A&M University', 'UCLA', 'USC', 'Stanford University', 'UC Berkeley',
  'NYU', 'Columbia University', 'Boston University', 'Northeastern University',
  'University of Illinois', 'Purdue University', 'Indiana University', 'Arizona State University',
];

const inputStyle = {
  fontFamily: dmSans, fontSize: 14, color: '#fff',
  background: '#111', border: `1px solid ${BORDER}`, borderRadius: 8,
  padding: '10px 14px', width: '100%', boxSizing: 'border-box',
  outline: 'none',
};

export default function AddStudentForm({ parentUser, onAdded, onCancel }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [uniSearch, setUniSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = UNIVERSITIES.filter(u => u.toLowerCase().includes(uniSearch.toLowerCase())).slice(0, 8);

  const handleSubmit = async () => {
    setError('');
    if (!firstName.trim()) { setError('Please enter the student\'s first name.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }

    setSending(true);
    const parentFirst = parentUser?.full_name?.split(' ')[0] || 'Your parent';

    // Send invite email
    await base44.functions.invoke('sendStudentInviteEmail', {
      student_email: email.trim().toLowerCase(),
      student_name: firstName.trim(),
      parent_name: parentFirst,
    });

    // Add email to parent's student_emails list
    const currentEmails = parentUser?.student_emails || [];
    const newEmail = email.trim().toLowerCase();
    if (!currentEmails.includes(newEmail)) {
      await base44.auth.updateMe({ student_emails: [...currentEmails, newEmail] });
    }

    setSending(false);
    onAdded(newEmail, firstName.trim());
  };

  return (
    <div style={{ border: `1.5px dashed ${BORDER}`, borderRadius: 10, padding: 20, marginTop: 4 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>Student's first name</label>
          <input
            value={firstName} onChange={e => setFirstName(e.target.value)}
            placeholder="e.g. Jordan"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>Student's email</label>
          <input
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="jordan@email.com" type="email"
            style={inputStyle}
          />
        </div>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>Student's university</label>
          <input
            value={university || uniSearch}
            onChange={e => { setUniSearch(e.target.value); setUniversity(''); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search university…"
            style={inputStyle}
          />
          {showDropdown && filtered.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
              background: '#1A1A1A', border: `1px solid ${BORDER}`, borderRadius: 8,
              maxHeight: 200, overflowY: 'auto', marginTop: 4,
            }}>
              {filtered.map(u => (
                <button key={u} onClick={() => { setUniversity(u); setUniSearch(u); setShowDropdown(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                  fontFamily: dmSans, fontSize: 13, color: '#ccc', background: 'none', border: 'none',
                  cursor: 'pointer', minHeight: 'auto',
                }}>{u}</button>
              ))}
            </div>
          )}
        </div>

        {error && <p style={{ fontFamily: dmSans, fontSize: 12, color: '#e53935', margin: 0 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={sending} style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
          background: ORANGE, border: 'none', borderRadius: 100,
          padding: '12px 20px', cursor: 'pointer', width: '100%', minHeight: 'auto',
          opacity: sending ? 0.5 : 1, marginTop: 4,
        }}>{sending ? 'Sending…' : 'Send Invitation →'}</button>

        <button onClick={onCancel} style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#666',
          background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto',
          textAlign: 'center',
        }}>Cancel</button>
      </div>
    </div>
  );
}