import React, { useState } from 'react';
import { Calendar, Clock, Mail, Bell } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const QUICK_DATE_OPTIONS = [
  { label: '3 days', days: 3 },
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

export default function FollowUpReminderModal({ isOpen, onClose, application }) {
  const [reminderDate, setReminderDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default: 7 days from now
    return date.toISOString().split('T')[0];
  });
  const [reminderTime, setReminderTime] = useState('10:00');
  const [reminderNote, setReminderNote] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen || !application) return null;

  const handleQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setReminderDate(date.toISOString().split('T')[0]);
  };

  const handleSetReminder = () => {
    // In a real scenario, this would call a backend function to save the reminder
    console.log({
      application: application.id,
      company: application.company,
      jobTitle: application.jobTitle,
      reminderDate,
      reminderTime,
      reminderNote,
      notifyEmail,
      notifyInApp,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const formatDateDisplay = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          width: 'min(90vw, 500px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 201,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          padding: 32,
          fontFamily: dm,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <h2 style={{ fontFamily: pf, fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Set a Follow-up Reminder
        </h2>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>
          {application.company} – {application.jobTitle}
        </p>

        {saved && (
          <div style={{
            background: '#D1FAE5',
            border: '1px solid #6EE7B7',
            borderRadius: 10,
            padding: 12,
            marginBottom: 24,
            fontSize: 13,
            color: '#065F46',
            fontWeight: 500,
          }}>
            ✓ Reminder set! You'll be notified on {formatDateDisplay(reminderDate)}.
          </div>
        )}

        {/* Reminder Date */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.05em' }}>
            Reminder Date
          </p>

          {/* Quick Date Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
            {QUICK_DATE_OPTIONS.map(option => {
              const optionDate = new Date();
              optionDate.setDate(optionDate.getDate() + option.days);
              const optionDateStr = optionDate.toISOString().split('T')[0];
              const isSelected = reminderDate === optionDateStr;

              return (
                <button
                  key={option.days}
                  onClick={() => handleQuickDate(option.days)}
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    fontWeight: 600,
                    border: isSelected ? '2px solid #E85D20' : '1px solid #E0E0E0',
                    background: isSelected ? '#FFF5F0' : '#fff',
                    color: isSelected ? '#E85D20' : '#555',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: dm,
                    transition: 'all 0.2s',
                    minHeight: 'auto',
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="#888" />
            <input
              type="date"
              value={reminderDate}
              onChange={e => setReminderDate(e.target.value)}
              style={{
                flex: 1,
                fontSize: 14,
                border: '1px solid #E0E0E0',
                borderRadius: 8,
                padding: '10px 12px',
                outline: 'none',
                fontFamily: dm,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
            />
            <span style={{ fontSize: 13, color: '#666', minWidth: 100 }}>
              {formatDateDisplay(reminderDate)}
            </span>
          </div>
        </div>

        {/* Reminder Time */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.05em' }}>
            Time (optional)
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="#888" />
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              style={{
                fontSize: 14,
                border: '1px solid #E0E0E0',
                borderRadius: 8,
                padding: '10px 12px',
                outline: 'none',
                fontFamily: dm,
                width: 120,
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
            />
            <span style={{ fontSize: 12, color: '#666 ' }}>Default: 10:00 AM</span>
          </div>
        </div>

        {/* Reminder Note */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>
            Reminder Note (optional)
          </p>
          <textarea
            value={reminderNote}
            onChange={e => setReminderNote(e.target.value)}
            placeholder="Ask about next steps in the interview process"
            style={{
              width: '100%',
              minHeight: 80,
              fontSize: 13,
              border: '1px solid #E0E0E0',
              borderRadius: 8,
              padding: 12,
              outline: 'none',
              fontFamily: dm,
              resize: 'vertical',
              lineHeight: 1.5,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
          />
        </div>

        {/* Notification Methods */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.05em' }}>
            Notify me via
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {/* Email Notification */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, borderRadius: 8, background: notifyEmail ? '#FFF5F0' : '#F9F9F9', border: notifyEmail ? '1px solid #E85D20' : '1px solid #E5E5E5' }}>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={e => setNotifyEmail(e.target.checked)}
                style={{ cursor: 'pointer', minHeight: 'auto' }}
              />
              <Mail size={16} color={notifyEmail ? '#E85D20' : '#888'} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>
                  Email
                </p>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                  Recommended – Most reliable
                </p>
              </div>
            </label>

            {/* In-app Notification */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: 10, borderRadius: 8, background: notifyInApp ? '#F0F4FF' : '#F9F9F9', border: notifyInApp ? '1px solid #0021A5' : '1px solid #E5E5E5' }}>
              <input
                type="checkbox"
                checked={notifyInApp}
                onChange={e => setNotifyInApp(e.target.checked)}
                style={{ cursor: 'pointer', minHeight: 'auto' }}
              />
              <Bell size={16} color={notifyInApp ? '#0021A5' : '#888'} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>
                  In-app notification
                </p>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
                  When you next log in
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              background: '#F5F5F5',
              color: '#1A1A1A',
              border: '1px solid #E0E0E0',
              borderRadius: 8,
              padding: '12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: dm,
              minHeight: 'auto',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E8E8E8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F5F5F5')}
          >
            Cancel
          </button>
          <button
            onClick={handleSetReminder}
            style={{
              background: '#E85D20',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: dm,
              minHeight: 'auto',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#d44e14')}
            onMouseLeave={e => (e.currentTarget.style.background = '#E85D20')}
          >
            {saved ? '✓ Reminder Set' : 'Set Reminder'}
          </button>
        </div>
      </div>
    </>
  );
}