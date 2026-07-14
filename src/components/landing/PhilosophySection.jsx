import Reveal from '@/components/landing/Reveal';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";

// Product philosophy: decisions, not information.
export default function PhilosophySection() {
  return (
    <div style={{ padding: 'clamp(48px, 10vw, 88px) clamp(20px, 5vw, 40px)', background: '#0f172a' }}>
      <Reveal>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: SF, fontSize: 'clamp(22px, 5.5vw, 38px)', fontWeight: 900, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.03em', margin: '0 0 18px' }}>
            The internet gives you thousands of jobs.{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block', marginTop: 6 }}>
              CLIFF tells you which ones are actually worth your time.
            </span>
          </h2>
          <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 4vw, 17px)', color: 'rgba(255,255,255,0.65)', margin: '0 auto', maxWidth: 520, lineHeight: 1.7 }}>
            Most students don't need more job listings. They need someone to cut through the noise, prioritize the right opportunities, prepare stronger applications, and keep them moving until they get hired.
          </p>
        </div>
      </Reveal>
    </div>
  );
}