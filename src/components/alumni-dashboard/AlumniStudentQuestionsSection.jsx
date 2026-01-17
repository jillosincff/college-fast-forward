import React from 'react';
import { navigate } from '@/components/utils/navigation';
import AlumniQuestionCard from './AlumniQuestionCard';

export default function AlumniStudentQuestionsSection({ 
  questions, 
  totalCount, 
  newToday, 
  alumni 
}) {
  const headerTitle = alumni.industry
    ? `Students Need Your ${alumni.industry} Expertise`
    : 'Students Are Asking for Help';

  return (
    <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div 
        className="px-6 py-5 border-b"
        style={{ 
          background: 'linear-gradient(90deg, #FFF5F2 0%, #FEF3E7 100%)',
          borderColor: 'rgba(250, 70, 22, 0.2)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #FA4616 0%, #FF6B3D 100%)',
                boxShadow: '0 8px 16px rgba(250, 70, 22, 0.3)'
              }}
            >
              <span className="text-white text-xl">🎓</span>
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">{headerTitle}</h2>
              <p className="text-gray-600 text-sm">
                {totalCount} questions • 
                <span 
                  className="font-semibold ml-1"
                  style={{ color: '#FA4616' }}
                >
                  {newToday} new today
                </span>
              </p>
            </div>
          </div>
          
          <div 
            className="hidden md:block font-semibold text-sm px-4 py-2 rounded-full"
            style={{ 
              backgroundColor: 'rgba(0, 33, 165, 0.1)',
              color: '#0021A5'
            }}
          >
            +10 karma per answer
          </div>
        </div>
      </div>

      {/* Question Cards */}
      <div className="p-4 space-y-3">
        {questions.length > 0 ? (
          questions.map((question) => (
            <AlumniQuestionCard 
              key={question.id}
              question={question}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No questions yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-5 bg-gray-50 border-t text-center">
        <button 
          onClick={() => navigate('Connections')}
          className="text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg transition hover:scale-105"
          style={{ 
            backgroundColor: '#0021A5',
            boxShadow: '0 8px 20px rgba(0, 33, 165, 0.3)'
          }}
        >
          See All Questions
        </button>
      </div>
      
    </section>
  );
}