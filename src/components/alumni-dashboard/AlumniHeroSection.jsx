import React from 'react';

const KARMA_BADGES = {
  bronze: { emoji: '🥉', label: 'Bronze' },
  silver: { emoji: '🥈', label: 'Silver' },
  gold: { emoji: '🥇', label: 'Gold' },
  platinum: { emoji: '💎', label: 'Platinum' }
};

export default function AlumniHeroSection({ 
  user, 
  karma, 
  karmaLevel, 
  studentsHelped, 
  alumniHelped, 
  myRequests,
  matchesCount = 0,
  onPostRequest,
  mode = 'give_and_get' // 'give_only', 'give_and_get', or 'seeking'
}) {
  const hasActiveRequest = myRequests.length > 0;
  const topRequest = myRequests[0];
  const isSeekerMode = mode === 'seeking';
  const responseCount = topRequest?.answer_count || 0;

  const getNudgeMessage = () => {
    if (isSeekerMode) {
      if (hasActiveRequest) {
        return `Your request is live — alumni and parents are reviewing it`;
      }
      return `Post a help request so alumni and parents can reach out to you`;
    }
    if (hasActiveRequest && topRequest) {
      const position = topRequest.priority_score || 10;
      if (position > 5) {
        return `Answer 2 more questions to move your request into the top 5`;
      } else if (position > 1) {
        return `You're almost at #1! Keep helping to boost your visibility`;
      }
      return `🏆 Your request is #1 — alumni are seeing it first`;
    }
    if (studentsHelped === 0) {
      return `Answer your first question to start building karma`;
    }
    return `You've helped ${studentsHelped} students — your network is growing`;
  };

  // Seeker mode shows 3 cards: Karma, Active Request + responses, Matches Available
  // Helper modes show 3-4 cards: Karma, Students Helped, Alumni Helped, (optional request)
  const renderSeekerStats = () => (
    <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
      {/* Karma */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 text-center border border-white/20 hover:bg-white/15 transition">
        <div className="relative inline-block mb-2">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse"
            style={{ backgroundColor: '#FA4616' }}
          />
          <span className="relative text-4xl font-black text-white">
            {karma}
          </span>
        </div>
        <p className="text-sm font-medium text-white/70">Karma</p>
        <p className="text-xs mt-1 text-white/50">Higher karma = more visibility</p>
      </div>

      {/* Active Request + Responses */}
      <div 
        className="backdrop-blur-xl rounded-3xl p-5 text-center border transition"
        style={hasActiveRequest ? {
          background: 'linear-gradient(135deg, rgba(250, 70, 22, 0.3) 0%, rgba(250, 70, 22, 0.15) 100%)',
          borderColor: 'rgba(250, 70, 22, 0.5)'
        } : {
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderColor: 'rgba(255,255,255,0.2)'
        }}
      >
        {hasActiveRequest ? (
          <>
            <div className="text-4xl font-black text-white mb-2">
              {responseCount}
            </div>
            <p className="text-sm font-medium" style={{ color: '#FFA07A' }}>
              Response{responseCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs mt-1 text-white/50">1 active request</p>
          </>
        ) : (
          <>
            <div className="text-3xl mb-2">🙋</div>
            <p className="text-sm font-medium text-white/70">No Request Yet</p>
            <p className="text-xs mt-1 text-white/50">Post one to get help</p>
          </>
        )}
      </div>

      {/* Matches Available */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 text-center border border-white/20 hover:bg-white/15 transition">
        <div className="text-4xl font-black text-white mb-2">
          {matchesCount}
        </div>
        <p className="text-sm font-medium text-white/70">Matches</p>
        <p className="text-xs mt-1 text-white/50">professionals who can help</p>
      </div>
    </div>
  );

  const renderHelperStats = () => {
    const showFourthCard = mode === 'give_and_get';
    return (
      <div className={`grid gap-4 max-w-3xl mx-auto ${showFourthCard ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {/* Karma */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 text-center border border-white/20 hover:bg-white/15 transition">
          <div className="relative inline-block mb-2">
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse"
              style={{ backgroundColor: '#FA4616' }}
            />
            <span className="relative text-4xl font-black text-white">
              {karma}
            </span>
          </div>
          <p className="text-sm font-medium text-white/70">Karma</p>
          <p className="text-xs mt-1 text-white/50">Higher karma = more visibility</p>
        </div>

        {/* Students Helped */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 text-center border border-white/20 hover:bg-white/15 transition">
          <div className="text-4xl font-black text-white mb-2">
            {studentsHelped}
          </div>
          <p className="text-sm font-medium text-white/70">Students Helped</p>
          <p className="text-xs mt-1 text-white/50">lifetime</p>
        </div>

        {/* Alumni Helped */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 text-center border border-white/20 hover:bg-white/15 transition">
          <div className="text-4xl font-black text-white mb-2">
            {alumniHelped}
          </div>
          <p className="text-sm font-medium text-white/70">Alumni Helped</p>
          <p className="text-xs mt-1 text-white/50">lifetime</p>
        </div>

        {/* Your Request - Only in give_and_get mode */}
        {showFourthCard && (
          <div 
            className="backdrop-blur-xl rounded-3xl p-5 text-center border transition cursor-pointer hover:scale-105"
            style={hasActiveRequest ? {
              background: 'linear-gradient(135deg, rgba(250, 70, 22, 0.3) 0%, rgba(250, 70, 22, 0.15) 100%)',
              borderColor: 'rgba(250, 70, 22, 0.5)'
            } : {
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.1)'
            }}
            onClick={hasActiveRequest ? undefined : onPostRequest}
          >
            {hasActiveRequest ? (
              <>
                <div className="text-4xl font-black text-white mb-2">
                  {responseCount}
                </div>
                <p className="text-sm font-medium" style={{ color: '#FFA07A' }}>
                  Response{responseCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs mt-1 text-white/50">1 active request</p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">🙋</div>
                <p className="text-sm font-medium text-white/70">Need Help?</p>
                <p className="text-xs mt-1 text-white/50">Post a request</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div 
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, var(--uf-blue, #0021A5) 0%, #001878 50%, var(--uf-blue, #0021A5) 100%)' }}
      >
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(250, 70, 22, 0.15)' }}
        />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Title */}
          <div className="text-center text-white mb-10">
            <p 
              className="text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ color: 'var(--uf-orange, #FA4616)' }}
            >
              {isSeekerMode ? 'Your Career Network' : 'Give Back. Get Ahead.'}
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-3 text-white">
              Your UF Network
            </h1>
            <p className="text-xl opacity-90 max-w-lg mx-auto text-white/80">
              {isSeekerMode
                ? 'Connect with alumni and parents who can help you land your next opportunity.'
                : mode === 'give_only' 
                  ? 'Help students and alumni. Build your karma. Strengthen the network.'
                  : 'Help students and alumni. When you need support, they\'ve got your back.'
              }
            </p>
          </div>

          {/* Stats Cards — different layout for seekers vs helpers */}
          {isSeekerMode ? renderSeekerStats() : renderHelperStats()}

          {/* Motivational nudge */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-full px-5 py-3 text-white border border-white/20">
              <span style={{ color: 'var(--uf-orange, #FA4616)' }}>✨</span>
              <span className="text-sm">{getNudgeMessage()}</span>
              <span className="text-white/50">→</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}