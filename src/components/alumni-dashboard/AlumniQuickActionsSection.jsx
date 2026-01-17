import React from 'react';
import { navigate } from '@/components/utils/navigation';

export default function AlumniQuickActionsSection({ 
  user, 
  profilePercent, 
  activeJobCount, 
  onPostRequest 
}) {
  const profileComplete = profilePercent >= 100;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Profile Card */}
      <div 
        className={`rounded-3xl p-6 border transition ${
          profileComplete 
            ? 'bg-green-50 border-green-200' 
            : 'bg-white border-gray-200 hover:shadow-lg'
        }`}
      >
        {profileComplete ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <h3 className="font-bold text-green-800">Profile Complete</h3>
              <p className="text-green-600 text-sm">Students can see your expertise</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0, 33, 165, 0.15)' }}
              >
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Complete Profile</h3>
                <p className="text-gray-500 text-sm">{profilePercent}% done</p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div 
                className="h-2 rounded-full"
                style={{ 
                  width: `${profilePercent}%`,
                  background: 'linear-gradient(90deg, #0021A5 0%, #003DCE 100%)'
                }}
              />
            </div>
            <button 
              onClick={() => navigate('ProfileEdit')}
              className="w-full text-white font-semibold py-2.5 rounded-xl transition text-sm"
              style={{ backgroundColor: '#0021A5' }}
            >
              Complete Profile
            </button>
          </>
        )}
      </div>

      {/* Jobs Card */}
      <div 
        className={`rounded-3xl p-6 border transition ${
          activeJobCount > 0 
            ? '' 
            : 'bg-white border-gray-200 hover:shadow-lg'
        }`}
        style={activeJobCount > 0 ? {
          background: 'linear-gradient(135deg, #FFF5F2 0%, #FEF5EF 100%)',
          borderColor: 'rgba(250, 70, 22, 0.3)'
        } : {}}
      >
        {activeJobCount > 0 ? (
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)'
                }}
              >
                <span className="text-xl text-white">💼</span>
              </div>
              <div>
                <h3 className="font-bold" style={{ color: '#C23A12' }}>
                  {activeJobCount} Job{activeJobCount > 1 ? 's' : ''} Posted
                </h3>
                <p className="text-sm" style={{ color: '#E5633A' }}>
                  Helping students find roles
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('Opportunities')}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'rgba(250, 70, 22, 0.4)', color: '#FA4616' }}
            >
              Manage
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(250, 70, 22, 0.15)' }}
              >
                <span className="text-xl">💼</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Post a Job</h3>
                <p className="text-gray-500 text-sm">+15 karma</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('PostOpportunity')}
              className="w-full text-white font-semibold py-2.5 rounded-xl transition text-sm"
              style={{ backgroundColor: '#FA4616' }}
            >
              Share Opportunity
            </button>
          </>
        )}
      </div>

      {/* Need Help Card */}
      <div 
        className="rounded-3xl p-6 border bg-white border-gray-200 hover:shadow-lg transition cursor-pointer"
        onClick={onPostRequest}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, rgba(0, 33, 165, 0.2) 0%, rgba(250, 70, 22, 0.2) 100%)'
            }}
          >
            <span className="text-xl">🙋</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Need Help?</h3>
            <p className="text-gray-500 text-sm">Ask the network</p>
          </div>
        </div>
        <button 
          className="w-full font-semibold py-2.5 rounded-xl transition text-sm border-2"
          style={{ 
            borderColor: '#0021A5',
            color: '#0021A5'
          }}
        >
          Post a Request
        </button>
      </div>
      
    </section>
  );
}