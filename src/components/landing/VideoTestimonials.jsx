import { useState } from 'react';

const dm = "'DM Sans', system-ui, -apple-system, sans-serif";

const VIDEOS = [
  {
    id: 0,
    name: 'Kayla M.',
    school: 'UF · Finance · Junior',
    quote: 'I sent 40 cold apps. Heard nothing. FastIQ wrote one message to a Goldman alum. She replied in 2 DAYS.',
    result: '☕ Reply in 48h → offer',
    accentColor: '#22d3ee',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=75&auto=format&fit=crop',
    duration: '0:28',
  },
  {
    id: 1,
    name: 'Jake R.',
    school: 'OSU · Marketing · Senior',
    quote: 'A parent literally forwarded my resume to their P&G contact. Zero connection before CFF. This is actually real.',
    result: '🚀 Referral → interview',
    accentColor: '#a8ff3e',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=75&auto=format&fit=crop',
    duration: '0:19',
  },
  {
    id: 2,
    name: 'Alyssa L.',
    school: 'USC · Tech · Junior',
    quote: '3 coffee chats booked my first week. My roommate still has zero interviews. I feel kinda guilty lol.',
    result: '🎉 3 chats in week 1',
    accentColor: '#fb923c',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=75&auto=format&fit=crop',
    duration: '0:24',
  },
];

function BigPlayButton({ size = 64, color = '#22d3ee', onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: hovered ? color : 'rgba(255,255,255,0.18)',
        border: `2.5px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: hovered
          ? `0 0 0 12px ${color}25, 0 12px 36px ${color}60`
          : `0 0 0 6px ${color}18, 0 8px 24px rgba(0,0,0,0.4)`,
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(8px)',
        minHeight: 'auto', minWidth: 'auto',
        padding: 0, flexShrink: 0,
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      <div style={{
        width: 0, height: 0,
        borderTop: `${size * 0.2}px solid transparent`,
        borderBottom: `${size * 0.2}px solid transparent`,
        borderLeft: `${size * 0.32}px solid ${hovered ? '#0f172a' : '#fff'}`,
        marginLeft: size * 0.07,
        transition: 'border-color 0.2s',
      }} />
    </button>
  );
}

function FeaturedVideo({ video, onStudentJoin }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div style={{
      width: '100%',
      borderRadius: 22,
      overflow: 'hidden',
      background: '#08090f',
      boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1.5px ${video.accentColor}35`,
      position: 'relative',
    }}>
      {/* Glowing top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 3,
        background: `linear-gradient(90deg, ${video.accentColor} 0%, ${video.accentColor}80 60%, transparent 100%)`,
        boxShadow: `0 0 20px ${video.accentColor}99`,
      }} />

      {/* Main video frame — 16:9 */}
      <div style={{ position: 'relative', aspectRatio: '16/9', cursor: 'pointer' }} onClick={() => setPlaying(p => !p)}>
        {/* BG photo */}
        <img
          src={video.bg}
          alt=""
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) saturate(0.65)', transform: 'scale(1.03)' }}
        />
        {/* Cinematic vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
        {/* Bottom gradient for caption */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)', pointerEvents: 'none' }} />

        {/* REC badge */}
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '5px 13px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff3333', boxShadow: '0 0 8px #ff3333', animation: 'glowPulse 1.5s ease infinite' }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.12em' }}>STUDENT VIDEO</span>
        </div>

        {/* Duration */}
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: '4px 9px' }}>
          <span style={{ fontFamily: dm, fontSize: 10.5, color: '#fff', fontWeight: 600 }}>{video.duration}</span>
        </div>

        {/* Center play button */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BigPlayButton size={72} color={video.accentColor} onClick={() => setPlaying(p => !p)} />
        </div>

        {/* Bottom — avatar + quote */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px', display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <img
            src={video.avatar}
            alt={video.name}
            loading="lazy"
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${video.accentColor}`, boxShadow: `0 0 16px ${video.accentColor}66`, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: dm, fontSize: 13.5, color: 'rgba(255,255,255,0.9)', margin: '0 0 5px', lineHeight: 1.45, fontStyle: 'italic', fontWeight: 500 }}>
              "{video.quote}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff' }}>{video.name}</span>
              <span style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>·</span>
              <span style={{ fontFamily: dm, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{video.school}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result + CTA bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', gap: 12 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${video.accentColor}15`, border: `1px solid ${video.accentColor}45`, borderRadius: 100, padding: '6px 14px' }}>
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: video.accentColor }}>{video.result}</span>
        </div>
        <button
          onClick={onStudentJoin}
          style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#0f172a', background: video.accentColor, border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap', boxShadow: `0 4px 16px ${video.accentColor}50` }}
        >
          Get results like this →
        </button>
      </div>
    </div>
  );
}

function ThumbVideo({ video, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      style={{
        width: 130, flexShrink: 0, borderRadius: 16, overflow: 'hidden',
        cursor: 'pointer', position: 'relative',
        border: isActive ? `2.5px solid ${video.accentColor}` : '2px solid rgba(255,255,255,0.09)',
        boxShadow: isActive
          ? `0 0 0 4px ${video.accentColor}20, 0 12px 32px rgba(0,0,0,0.5)`
          : '0 6px 20px rgba(0,0,0,0.35)',
        transition: 'all 0.22s ease',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '9/14' }}>
        <img
          src={video.bg}
          alt=""
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.28) saturate(0.55)' }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }} />

        {/* Active indicator */}
        {isActive && (
          <div style={{ position: 'absolute', top: 9, left: 9, width: 8, height: 8, borderRadius: '50%', background: video.accentColor, boxShadow: `0 0 10px ${video.accentColor}` }} />
        )}

        {/* Mini play */}
        <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: isActive ? video.accentColor : 'rgba(255,255,255,0.15)',
            border: `1.5px solid ${isActive ? video.accentColor : 'rgba(255,255,255,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `8px solid ${isActive ? '#0f172a' : '#fff'}`, marginLeft: 2 }} />
          </div>
        </div>

        {/* Name + avatar at bottom */}
        <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
          <img
            src={video.avatar}
            alt={video.name}
            loading="lazy"
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${video.accentColor}`, flexShrink: 0 }}
          />
          <div>
            <p style={{ fontFamily: dm, fontSize: 8.5, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>{video.name}</p>
            <p style={{ fontFamily: dm, fontSize: 7.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{video.school.split(' · ')[0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoTestimonials({ onStudentJoin }) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div style={{ position: 'relative', zIndex: 2, padding: '0 0 52px', maxWidth: 640, margin: '0 auto' }}>
      {/* Section header */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(34,211,238,0.10)', border: '1.5px solid rgba(34,211,238,0.38)', borderRadius: 100, padding: '6px 16px', marginBottom: 11, boxShadow: '0 2px 14px rgba(34,211,238,0.14)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee', animation: 'glowPulse 2s ease infinite' }} />
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#0891b2', letterSpacing: '0.06em' }}>STUDENTS GETTING RESULTS RIGHT NOW</span>
        </div>
        <h2 style={{ fontFamily: dm, fontSize: 'clamp(26px, 7vw, 38px)', fontWeight: 900, color: '#1f2937', letterSpacing: '-0.032em', lineHeight: 1.08, margin: '0 0 6px' }}>
          Real students.<br />
          <span style={{ color: '#0891b2' }}>Real proof.</span>
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13.5, color: '#334155', margin: 0, lineHeight: 1.6 }}>
          Not actors. Not fake screenshots. Just people your age, getting replies.
        </p>
      </div>

      {/* Featured large video */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <FeaturedVideo video={VIDEOS[activeIdx]} onStudentJoin={onStudentJoin} />
      </div>

      {/* Thumb switcher row */}
      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>More stories →</p>
        <div style={{
          display: 'flex', gap: 10,
          overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          paddingBottom: 4,
        }}>
          {VIDEOS.map((v, i) => (
            <ThumbVideo key={v.id} video={v} isActive={i === activeIdx} onClick={() => setActiveIdx(i)} />
          ))}
          {/* "More dropping" placeholder */}
          <div style={{
            width: 130, flexShrink: 0, borderRadius: 16, overflow: 'hidden',
            border: '2px dashed rgba(34,211,238,0.22)', background: 'rgba(34,211,238,0.04)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 7, padding: '0 10px', cursor: 'default', aspectRatio: '9/14',
          }}>
            <span style={{ fontSize: 24 }}>📱</span>
            <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.32)', textAlign: 'center', margin: 0, lineHeight: 1.45 }}>More dropping soon</p>
          </div>
        </div>
      </div>

      {/* Dot nav */}
      <div style={{ display: 'flex', gap: 7, justifyContent: 'center', padding: '0 20px' }}>
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              width: i === activeIdx ? 22 : 7, height: 7, borderRadius: 4,
              background: i === activeIdx ? '#22d3ee' : 'rgba(0,0,0,0.14)',
              border: 'none', padding: 0, cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.25s ease',
              boxShadow: i === activeIdx ? '0 2px 8px rgba(34,211,238,0.5)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}