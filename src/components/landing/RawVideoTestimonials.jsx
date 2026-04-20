const dm = "'DM Sans', system-ui, -apple-system, sans-serif";

const VIDEOS = [
  {
    name: 'Kayla M.',
    school: 'UF · Finance · Junior',
    quote: '"I sent 40 apps. Heard nothing. FastIQ found a Goldman alum and wrote my message. She replied in 2 days."',
    result: '☕ Coffee chat → offer',
    color: '#a8ff3e',
    photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=280&q=75&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&q=60&auto=format&fit=crop',
  },
  {
    name: 'Jake R.',
    school: 'OSU · Marketing · Senior',
    quote: '"The follow-up message it wrote got me a call booked in 20 minutes. I\'d been sitting on that reply for 3 days."',
    result: '📞 Call booked → internship',
    color: '#38d9ff',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=280&q=75&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=60&auto=format&fit=crop',
  },
  {
    name: 'Alyssa L.',
    school: 'USC · Tech · Junior',
    quote: '"I used the interview cheat sheet prompt the night before. They asked me about something on it literally word for word."',
    result: '🎉 Got the offer',
    color: '#fb923c',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=280&q=75&auto=format&fit=crop&crop=face',
    bg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=60&auto=format&fit=crop',
  },
];

function VideoCard({ v }) {
  return (
    <div style={{
      width: 220,
      flexShrink: 0,
      borderRadius: 22,
      overflow: 'hidden',
      position: 'relative',
      aspectRatio: '9/16',
      scrollSnapAlign: 'start',
      boxShadow: `0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06), 0 0 32px ${v.color}18`,
      border: `1.5px solid ${v.color}30`,
    }}>
      {/* Background photo — feels like an iPhone video frame */}
      <img
        src={v.bg}
        alt=""
        loading="lazy"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.28) saturate(0.6) blur(2px)',
          transform: 'scale(1.06)',
        }}
      />
      {/* Color top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${v.color}, ${v.color}55, transparent)`,
        boxShadow: `0 0 14px ${v.color}`,
      }} />
      {/* REC badge */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 100, padding: '4px 10px',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 8px #ff4444' }} />
        <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>REAL STUDENT</span>
      </div>
      {/* Play icon */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 48, height: 48, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
        border: '2px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: '#fff',
      }}>▶</div>
      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 14px 16px' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 50%, transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
            <img
              src={v.photo}
              alt={v.name}
              loading="lazy"
              style={{
                width: 32, height: 32, borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${v.color}`,
                boxShadow: `0 0 12px ${v.color}66`,
              }}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div>
              <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#fff', margin: 0 }}>{v.name}</p>
              <p style={{ fontFamily: dm, fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{v.school}</p>
            </div>
          </div>
          {/* Quote */}
          <p style={{
            fontFamily: dm, fontSize: 11.5, color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.55, margin: '0 0 10px', fontStyle: 'italic',
          }}>{v.quote}</p>
          {/* Win pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: `${v.color}18`, border: `1px solid ${v.color}55`,
            borderRadius: 100, padding: '5px 12px',
          }}>
            <span style={{ fontFamily: dm, fontSize: 10.5, fontWeight: 800, color: v.color }}>{v.result}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RawVideoTestimonials() {
  return (
    <div style={{ position: 'relative', zIndex: 2, padding: '0 0 60px', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(185,28,28,0.10)', border: '1.5px solid rgba(185,28,28,0.32)', borderRadius: 100, padding: '6px 16px', marginBottom: 12, boxShadow: '0 2px 10px rgba(185,28,28,0.10)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 8px #dc2626' }} />
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#991b1b', letterSpacing: '0.05em' }}>RAW. UNFILTERED. REAL.</span>
        </div>
        <h2 style={{
          fontFamily: dm, fontSize: 'clamp(22px, 5.5vw, 32px)', fontWeight: 900,
          color: '#0d0d0d', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 6px',
        }}>
          Don't take our word for it.
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13.5, color: 'rgba(0,0,0,0.38)', margin: 0, lineHeight: 1.6 }}>
          iPhone clips coming soon. These quotes are 100% real.
        </p>
      </div>

      {/* Horizontal scroll */}
      <div style={{
        display: 'flex', gap: 14,
        paddingLeft: 20, paddingRight: 20, paddingBottom: 6,
        overflowX: 'auto', scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        alignItems: 'stretch',
      }}>
        {VIDEOS.map((v, i) => <VideoCard key={i} v={v} />)}
        <div style={{ width: 6, flexShrink: 0 }} />
      </div>
    </div>
  );
}