import { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const STORIES = [
  {
    quote: "I found a Disney alum from my school in 2 minutes. She actually responded.",
    name: "Jordan T.",
    school: "ODU · Junior · Marketing",
    initials: "J",
    avatar: "https://media.base44.com/images/public/684474c5723dc90efce23588/00aa78059_IMG_0018.jpg",
    tag: "Response received",
    tagIcon: "✉️"
  },
  {
    quote: "I literally had no clue how to start my job search. FastIQ gave me the perfect plan to execute.",
    name: "Marcus",
    school: "Penn State · Senior · Finance",
    initials: "M",
    avatar: "https://media.base44.com/images/public/684474c5723dc90efce23588/d319a92e5_IMG_0016.jpg",
    tag: "3 interviews booked",
    tagIcon: "📅"
  },
  {
    quote: "I applied to over 100 jobs and got zero responses. I reached out to one parent from my school and he got me an interview by the following Monday. Insane.",
    name: "Sarah K.",
    school: "University of Michigan · Junior · Engineering",
    initials: "S",
    avatar: "https://media.base44.com/images/public/684474c5723dc90efce23588/acbc74f17_IMG_0017.jpg",
    tag: "Got the role",
    tagIcon: "🎯"
  },
  {
    quote: "Honestly, my parents were literally tweaking. I sent my resume to a bunch of jobs but nothing worked. I used the Agent to fix my resume and find alumni at the companies I wanted — landed an internship in 3 weeks. Definitely relieved.",
    name: "Chris C.",
    school: "USC · '27 grad",
    initials: "CC",
    avatar: "https://media.base44.com/images/public/684474c5723dc90efce23588/1a1e252be_IMG_0020.jpg",
    tag: "Internship locked",
    tagIcon: "🎯"
  }
];

export default function SuccessStoriesCarousel() {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const total = STORIES.length;

  // Auto-scroll every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!dragging) setActive(a => (a + 1) % total);
    }, 6000);
    return () => clearInterval(interval);
  }, [dragging, total]);

  const goTo = (i) => setActive((i + total) % total);
  
  const onMouseDown = (e) => {
    setDragging(true);
    setStartX(e.clientX);
  };
  
  const onMouseMove = (e) => {
    if (dragging) setOffset(e.clientX - startX);
  };
  
  const onMouseUp = () => {
    if (Math.abs(offset) > 60) goTo(active + (offset < 0 ? 1 : -1));
    setDragging(false);
    setOffset(0);
  };
  
  const onTouchStart = (e) => {
    setDragging(true);
    setStartX(e.touches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    if (dragging) setOffset(e.touches[0].clientX - startX);
  };
  
  const onTouchEnd = () => {
    if (Math.abs(offset) > 50) goTo(active + (offset < 0 ? 1 : -1));
    setDragging(false);
    setOffset(0);
  };

  const story = STORIES[active];

  return (
    <div style={{ userSelect: 'none' }}>
      <div
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderLeft: '4px solid #E85D20',
          borderRadius: '0 20px 20px 0',
          padding: '36px 36px 32px',
          cursor: dragging ? 'grabbing' : 'grab',
          transform: `translateX(${offset * 0.08}px)`,
          transition: dragging ? 'none' : 'transform 0.3s ease',
          minHeight: 190,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Large faded quotation mark */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 20,
          fontFamily: playfair,
          fontSize: 100,
          lineHeight: 1,
          color: 'rgba(255,255,255,0.06)',
          fontWeight: 700,
          pointerEvents: 'none',
        }}>"</div>

        {/* Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(232,93,32,0.2)',
          border: '1px solid rgba(232,93,32,0.35)',
          borderRadius: 100,
          padding: '4px 12px',
          marginBottom: 18,
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{ fontSize: 12 }}>{story.tagIcon}</span>
          <span style={{
            fontFamily: dmSans,
            fontSize: 11,
            fontWeight: 700,
            color: '#E85D20',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            {story.tag}
          </span>
        </div>

        {/* Quote */}
        <p style={{
          fontFamily: dmSans,
          fontSize: 'clamp(18px, 2.5vw, 23px)',
          fontStyle: 'italic',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.55,
          margin: '0 0 24px',
          position: 'relative',
          zIndex: 1,
        }}>
          "{story.quote}"
        </p>

        {/* Author */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            flexShrink: 0,
            background: story.avatar ? 'none' : 'linear-gradient(135deg, #E85D20, #c9471a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: dmSans,
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 4px 12px rgba(232,93,32,0.4)',
            overflow: 'hidden',
          }}>
            {story.avatar ? (
              <img
                src={story.avatar}
                alt={story.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              story.initials
            )}
          </div>
          <div>
            <p style={{
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              margin: 0,
            }}>
              {story.name}
            </p>
            <p style={{
              fontFamily: dmSans,
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
            }}>
              {story.school}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
      }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STORIES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === active ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: i === active ? '#E85D20' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                minHeight: 'auto',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['←', '→'].map((arrow, i) => (
            <button
              key={i}
              onClick={() => goTo(active + (i === 0 ? -1 : 1))}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontFamily: dmSans,
                fontSize: 15,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                minHeight: 'auto',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(232,93,32,0.2)';
                e.currentTarget.style.borderColor = '#E85D20';
                e.currentTarget.style.color = '#E85D20';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#fff';
              }}
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>

      {/* Touch indicator */}
      <p style={{
        fontFamily: dmSans,
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        margin: '12px 0 0',
        letterSpacing: '0.04em',
      }}>
        swipe or drag · {active + 1} of {total}
      </p>
    </div>
  );
}