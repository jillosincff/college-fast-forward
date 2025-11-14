import { useEffect, useRef, useState } from "react";

export default function ComingSoonSuccessStoryModal({
  isOpen,
  onClose,
  onNotify,
  userEmail = null,
  interestedCount,
}) {
  const [email, setEmail] = useState(userEmail || "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(userEmail || "");
      setDone(false);
      setLoading(false);
      // Focus the close button when modal opens for accessibility
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 100);
    }
  }, [isOpen, userEmail]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validEmail = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNotify = async () => {
    if (!email.trim()) {
      setDone(true); // Allow skipping email
      return;
    }

    setLoading(true);
    try {
      if (onNotify) {
        await onNotify(email);
      } else {
        // Default behavior - could implement backend function later
        console.log('Waitlist signup:', email);
      }
      setDone(true);
    } catch (e) {
      alert("Sorry—something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-story-title"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 id="success-story-title" className="text-lg font-semibold">
            ✨ Share Your Success Story
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {!done ? (
          <>
            <p className="mt-2 text-sm text-gray-600">
              This feature is coming soon! You'll be able to inspire other Gators by
              sharing how you found internships, jobs, or mentorship through College Fast Forward.
            </p>

            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Get notified at launch (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={userEmail ? userEmail : "name@email.com"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FA4616] focus:border-[#FA4616] transition-colors"
              />
              {!validEmail && email && (
                <p className="text-xs text-red-600">Please enter a valid email.</p>
              )}
              {typeof interestedCount === "number" && (
                <p className="text-xs text-gray-500">
                  {interestedCount}+ Gators have asked to be notified.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                disabled={loading || (email !== "" && !validEmail)}
                onClick={handleNotify}
                className="rounded-xl bg-[#FA4616] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-all"
              >
                {loading ? "Saving…" : email ? "Notify Me" : "Skip for Now"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-gray-700">
              {email 
                ? "You're on the list! We'll email you as soon as Success Stories launch."
                : "Thanks! Success Stories are coming soon to College Fast Forward."
              }
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-xl bg-[#FA4616] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-all"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}