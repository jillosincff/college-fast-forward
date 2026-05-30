import { useState, useEffect } from 'react';

const TEMPLATES = {
  direct: (alumni, job, student) =>
    `Hi ${alumni?.name || 'there'},\n\nI saw your profile while looking into the ${job?.title || job?.role} opening at ${job?.company || job?.companyName}. I'm a senior at ${student?.school || 'UF'} wrapping up my ${student?.targetPosition || 'creative'} track, and your career path is exactly what I'm aiming for.\n\nI'm applying this week and want to make sure my portfolio hits the mark. If you have a free 60 seconds, what is the main thing your manager looks for on a designer's portfolio?\n\nI've attached my resume below purely for context. No pressure to reply, I know you're busy.\n\nBest,\n${student?.full_name || student?.name || 'Me'}`,

  craft: (alumni, job, student) =>
    `Hi ${alumni?.name || 'there'},\n\nI'm a senior finishing my design track at ${student?.school || 'UF'}. I came across the open ${job?.title || job?.role} role on your vertical at ${job?.company || job?.companyName} and wanted to reach out to a fellow alum on the team.\n\nBefore I drop my application into the portal, I'm trying to gauge the day-to-day balance of the role. Does the creative team collaborate heavily with product engineering, or is it more siloed around pure content strategy?\n\nDropping my background below just for context. Appreciate any quick insight if you have a minute.\n\nThanks,\n${student?.full_name || student?.name || 'Me'}`,

  short: (alumni, job, student) =>
    `Hi ${alumni?.name || 'there'},\n\nI'm a senior at ${student?.school || 'UF'} applying for the new ${job?.title || job?.role} vacancy at ${job?.company || job?.companyName}.\n\nI know your inbox is probably flooded, so I'll keep it brief. Since you're already doing this work at ${job?.company || job?.companyName}, what's one mistake entry-level candidates make when interviewing with this creative team?\n\nMy resume is attached below if you want a reference point. No response needed if you're slammed this week.\n\nBest,\n${student?.full_name || student?.name || 'Me'}`,
};

export default function OutreachSideDrawer({ isOpen, onClose, job, user }) {
  const [selectedTone, setSelectedTone] = useState('direct');
  const [messageText, setMessageText] = useState('');

  // Derive a placeholder alumni from lead data
  const alumni = {
    name: job?.networkData?.topAlumniName || job?.topAlumniName || 'Alumni',
    role: job?.networkData?.topAlumniRole || job?.topAlumniRole || (job?.role || job?.title),
    gradYear: job?.networkData?.gradYear || '22',
  };

  const student = {
    full_name: user?.full_name,
    school: user?.school_name || 'UF',
    targetPosition: user?.career_goals?.target_role || user?.target_role || 'creative',
    resumeName: user?.resume_filename || 'Master_Resume.pdf',
  };

  useEffect(() => {
    if (isOpen && job) {
      setMessageText(TEMPLATES[selectedTone](alumni, job, student));
    }
  }, [selectedTone, isOpen, job]);

  if (!isOpen) return null;

  const tones = [
    { key: 'direct', label: 'Direct' },
    { key: 'craft',  label: 'The Craft' },
    { key: 'short',  label: 'Micro-Ping' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[460px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Message an Alumni</h3>
            <p className="text-xs text-gray-500 mt-0.5">Bypassing the cold portal at {job?.company || job?.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-medium leading-none"
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Alumni card */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 flex items-center gap-3">
            <div className="text-2xl">🎓</div>
            <div>
              <h4 className="text-sm font-bold text-purple-900">{alumni.name}</h4>
              <p className="text-xs text-purple-700">{alumni.role} at {job?.company || job?.companyName}</p>
              <p className="text-[10px] text-purple-500 font-medium">{student.school} Class of '{alumni.gradYear}</p>
            </div>
          </div>

          {/* Tone picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select Message Tone</label>
            <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-xl">
              {tones.map(t => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTone(t.key)}
                  style={{ minHeight: 'auto' }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    selectedTone === t.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message editor */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">CLiFF Draft Editor</label>
              <span className="text-[10px] text-gray-400 font-medium">Editable</span>
            </div>
            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="w-full h-56 text-sm text-gray-800 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none leading-relaxed"
            />
          </div>

          {/* Resume badge */}
          <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-sm">📄</span>
              <span className="text-xs font-semibold text-gray-700 truncate max-w-[220px]">
                {student.resumeName}
              </span>
            </div>
            <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded border border-green-100">
              Attached
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col gap-2">
          <button
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition shadow-sm"
            style={{ minHeight: 'auto' }}
            onClick={() => {
              // Placeholder — wire real send logic here
              alert('Message dispatched! Moving card to Applied pipeline.');
              onClose();
            }}
          >
            Send Message via CLiFF
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            Dispatches message and automatically tracks this card in your <b>Applied</b> pipeline.
          </p>
        </div>
      </div>
    </>
  );
}