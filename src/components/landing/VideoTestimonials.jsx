import { useState, useRef } from 'react';

const dm = "'DM Sans', system-ui, -apple-system, sans-serif";

const VIDEOS = [
  {
    id: 0,
    name: 'Kayla M.',
    school: 'UF · Finance · Junior',
    quote: 'The AI draft got me a reply in 48 hours. Game changer.',
    result: '☕ Coffee chat → offer',
    accentColor: '#22d3ee',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=70&auto=format&fit=crop',
  },
  {
    id: 1,
    name: 'Jake R.',
    school: 'OSU · Marketing · Senior',
    quote: 'A parent literally forwarded my resume to their friend at P&G. Zero connection before this.',
    result: '🚀 Referral → interview',
    accentColor: '#a8ff3e',
    thumbnail: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=70&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Alyssa L.',
    school: 'USC · Tech · Junior',
    quote: '3 coffee chats booked in my first week. My roommate still has zero interviews.',
    result: '🎉 3 chats in week 1',
    accentColor: '#fb923c',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=70&auto=format&fit=crop',
  },
];

function PlayButton({ size = 56, color = '#22d3ee' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 0 8px ${color}30, 0 8px 24px ${color}60`,
      flexShrink: 0,
    }}>
      <div style={{
        width: 0, height: 0,
        borderTop: `${size * 0.22}px solid transparent`,
        borderBottom: `${size * 0.22}px solid transparent`,
        borderLeft: `${size * 0.34}px solid #0f172a`,
        marginLeft: size * 0.06,
      }} />
    </div>
  );
}

function FeaturedVideoCard({ video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{ width: '100%', borderRadius: 20, overflow: 'hidden', position: 'relative', background: '#0a0a12', boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1.5px ${video.accentColor}40` }}>
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${video.accentColor}, ${video.accentColor}55, transparent)`, zIndex: 3, boxShadow: `0 0 16px ${video.accentColor}` }} />

      {/* Video / thumbnail area */}
      <div
        onClick={() => setPlaying(p => !p)}
        style={{ position: 'relative', aspectRatio: '16/9', cursor: 'pointer', overflow: 'hidden' }}
      >
        {/* Background photo */}
        <img
          src={video.bg}
          alt=""
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.35) saturate(0.7)', transform: 'scale(1.04)' }}
        />

        {/* Student face */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: '42%', display: 'flex', alignItems: 'flex-end', padding: '0 0 20px 20px' }}>
          <img
            src={video.thumbnail}
            alt={video.name}
            loading="lazy"
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${video.accentColor}`, boxShadow: `0 0 24px ${video.accentColor}66` }}
          />
        </div>

        {/* Center play */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}>
          <div style={{ transform: playing ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.2s' }}>
            <PlayButton size={64} color={video.accentColor} />
          </div>
        </div>

        {/* REC badge */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 12px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 8px #ff4444', animation: 'glowPulse 1.5s ease infinite' }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>REAL STUDENT</span>
        </div>

        {/* Duration pill */}
        <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '3px 8px' }}>
          <span style={{ fontFamily: dm, fontSize: 10, color: '#fff', fontWeight: 600 }}>0:24</span>
        </div>

        {/* Bottom gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)', pointerEvents: 'none' }} />

        {/* Quote overlay at bottom */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, right: 60 }}>
          <p style={{ fontFamily: dm, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.45, fontStyle: 'italic' }}>
            "{video.quote}"
          </p>
        </div>
      </div>

      {/* Caption bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>{video.name}</p>
          <p style={{ fontFamily: dm, fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{video.school}</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: `${video.accentColor}18`, border: `1px solid ${video.accentColor}50`, borderRadius: 100, padding: '5px 12px' }}>
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: video.accentColor }}>{video.result}</span>
        </div>
      </div>
    </div>
  );
}

function ThumbCard({ video, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 140, flexShrink: 0, borderRadius: 14, overflow: 'hidden',
        cursor: 'pointer', position: 'relative',
        border: isActive ? `2px solid ${video.accentColor}` : '2px solid rgba(255,255,255,0.08)',
        boxShadow: isActive ? `0 0 20px ${video.accentColor}55` : '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'all 0.2s ease',
        transform: isActive ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '9/14' }}>
        <img src={video.bg} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.32) saturate(0.6)' }} />
        <img src={video.thumbnail} alt={video.name} loading="lazy" style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${video.accentColor}` }} />
        <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <PlayButton size={28} color={video.accentColor} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 50, left: 8, right: 8 }}>
          <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#fff', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>{video.name}</p>
          <p style={{ fontFamily: dm, fontSize: 8, color: 'rgba(255,255,255,0.45)', margin: '1px 0 0', textAlign: 'center' }}>{video.school.split(' · ')[0]}</p>
        </div>
      </div>
    </div>
  );
}

export default function VideoTestimonials({ onStudentJoin }) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div style={{ position: 'relative', zIndex: 2, padding: '0 0 60px', maxWidth: 640, margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(34,211,238,0.10)', border: '1.5px solid rgba(34,211,238,0.35)', borderRadius: 100, padding: '6px 16px', marginBottom: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', animation: 'glowPulse 2s ease infinite' }} />
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#0e7490', letterSpacing: '0.05em' }}>STUDENTS GETTING REPLIES RIGHT NOW</span>
        </div>
        <h2 style={{ fontFamily: dm, fontSize: 'clamp(24px, 6vw, 34px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 6px' }}>
          Real students.<br />
          <span style={{ color: '#0891b2' }}>Real results.</span>
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13.5, color: '#334155', margin: 0, lineHeight: 1.6 }}>
          Don't take our word for it — hear it from them.
        </p>
      </div>

      {/* Featured video */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <FeaturedVideoCard video={VIDEOS[activeIdx]} />
      </div>

      {/* Thumbnail row */}
      <div style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 18 }}>
        <p style={{ fontFamily: dm, fontSize: 10.5, color: 'rgba(0,0,0,0.35)', margin: '0 0 10px', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>Watch more →</p>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 4 }}>
          {VIDEOS.map((v, i) => (
            <ThumbCard key={v.id} video={v} isActive={i === activeIdx} onClick={() => setActiveIdx(i)} />
          ))}
          {/* "More coming" placeholder */}
          <div style={{ width: 140, flexShrink: 0, borderRadius: 14, overflow: 'hidden', border: '2px dashed rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, aspectRatio: '9/14', cursor: 'default' }}>
            <span style={{ fontSize: 22 }}>📱</span>
            <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.35)', textAlign: 'center', margin: 0, lineHeight: 1.4, padding: '0 8px' }}>More dropping soon</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px', textAlign: 'center' }}>
        <button
          onClick={onStudentJoin}
          style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', background: '#22d3ee', border: 'none', borderRadius: 13, padding: '14px 30px', cursor: 'pointer', minHeight: 'auto', fontFamily: dm, boxShadow: '0 10px 15px -3px rgba(34,211,238,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#67e8f9'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#22d3ee'; }}
        >
          I want results like this → Try free 7 days
        </button>
      </div>
    </div>
  );
}