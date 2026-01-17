import React from 'react';
import { navigate } from '@/components/utils/navigation';
import AlumniRequestCard from './AlumniRequestCard';

export default function AlumniRequestsSection({ requests, total, newToday }) {
  if (requests.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div 
        className="px-6 py-5 border-b"
        style={{ 
          background: 'linear-gradient(90deg, #F0F4FF 0%, #E8EEFF 100%)',
          borderColor: 'rgba(0, 33, 165, 0.15)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)',
                boxShadow: '0 8px 16px rgba(0, 33, 165, 0.3)'
              }}
            >
              <span className="text-white text-xl">🤝</span>
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">Help Fellow Alumni</h2>
              <p className="text-gray-600 text-sm">
                {total} alumni requests • 
                <span 
                  className="font-semibold ml-1"
                  style={{ color: '#0021A5' }}
                >
                  {newToday} new today
                </span>
              </p>
            </div>
          </div>
          
          <div 
            className="hidden md:flex items-center gap-2 font-semibold text-sm px-4 py-2 rounded-full"
            style={{ 
              backgroundColor: 'rgba(250, 70, 22, 0.15)',
              color: '#FA4616'
            }}
          >
            <span>🔒</span> Alumni only
          </div>
        </div>
      </div>

      {/* Request Cards */}
      <div className="p-4 space-y-3">
        {requests.map((request) => (
          <AlumniRequestCard 
            key={request.id}
            request={request}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 bg-gray-50 border-t text-center">
        <button 
          onClick={() => navigate('Connections', { filter: 'alumni' })}
          className="font-bold px-8 py-3 rounded-xl text-lg transition hover:scale-105 border-2"
          style={{ 
            borderColor: '#0021A5',
            color: '#0021A5'
          }}
        >
          See All Alumni Requests
        </button>
      </div>
      
    </section>
  );
}