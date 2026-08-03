import LiveWorkFeed from './LiveWorkFeed';
import { FONT, TEXT, TEXT2 } from './onboardingShared';

// Post-upload processing — the work is shown, never hidden behind a spinner.
export default function ResumeProcessing({ college, seeking, industries }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
        Sit tight. I'm working on it.
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, lineHeight: 1.7, margin: '0 auto 26px', maxWidth: 420 }}>
        This is everything happening right now — no guesswork, no waiting on you.
      </p>
      <LiveWorkFeed college={college} seeking={seeking} industries={industries} />
    </div>
  );
}