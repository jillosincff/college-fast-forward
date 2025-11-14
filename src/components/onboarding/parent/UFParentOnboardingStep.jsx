import { useMemo, useState } from "react";

export default function UFParentOnboardingStep({
  onBack,
  onContinue,
  defaultStudentName = "",
  defaultBackground = "",
  maxBackgroundChars = 160,
  stepLabel = "Step 2 of 3",
}) {
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [background, setBackground] = useState(defaultBackground);
  
  const remaining = useMemo(
    () => Math.max(0, maxBackgroundChars - background.length),
    [background, maxBackgroundChars]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onContinue({
      relationship: "UF Parent",
      studentName: studentName.trim() || undefined,
      background: background.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top progress hint */}
      <div className="mx-auto max-w-3xl px-4 pt-8">
        <div className="mb-6">
          <div className="text-xs text-slate-500">{stepLabel}</div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: "66%" }}
              aria-hidden
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
          aria-labelledby="uf-parent-title"
        >
          <div className="mb-6">
            <h1
              id="uf-parent-title"
              className="text-2xl font-semibold text-slate-900"
            >
              Tell us about your Gator <span aria-hidden>🐊</span>
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              You're all set as a <strong>UF Parent</strong>. A couple optional
              details help us personalize your experience.
            </p>
          </div>

          {/* Student's Name (optional) */}
          <div className="mb-5">
            <label
              htmlFor="studentName"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Student's Name <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="studentName"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="e.g., Olivia Osinoff"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none ring-blue-600 focus:border-blue-600 focus:ring-2"
              aria-describedby="studentName-help"
            />
            <p id="studentName-help" className="mt-2 text-xs text-slate-500">
              Used only to better match your posts to your student.{" "}
              <strong>Never shown publicly.</strong>
            </p>
          </div>

          {/* Background / How you'd like to help (optional) */}
          <div className="mb-6">
            <label
              htmlFor="background"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              How you'd like to help{" "}
              <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="background"
              rows={4}
              maxLength={maxBackgroundChars}
              placeholder="Share a bit about your UF story or how you'd like to help. e.g., Marketing alum in Gainesville—happy to mentor or review resumes."
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="block w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 outline-none ring-blue-600 focus:border-blue-600 focus:ring-2"
              aria-describedby="background-help background-count"
            />
            <div className="mt-1 flex items-center justify-between">
              <p id="background-help" className="text-xs text-slate-500">
                Helps parents & alumni find ways to contribute. Optional and
                private by default.
              </p>
              <span
                id="background-count"
                className={`text-xs ${
                  remaining <= 20 ? "text-amber-600" : "text-slate-500"
                }`}
              >
                {remaining} left
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onContinue({
                    relationship: "UF Parent",
                    studentName: undefined,
                    background: undefined,
                  })
                }
                className="rounded-xl px-4 py-2 text-sm text-slate-600 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Skip
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                Continue →
              </button>
            </div>
          </div>
        </form>

        {/* Fine print / reassurance */}
        <p className="mx-auto mt-4 max-w-3xl px-2 text-center text-xs text-slate-500">
          You can edit these details anytime in Settings. We don't share your
          info publicly without your consent.
        </p>
      </div>
    </div>
  );
}