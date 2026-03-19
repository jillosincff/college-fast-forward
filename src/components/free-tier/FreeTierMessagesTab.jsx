import React from 'react';
import { Mail } from 'lucide-react';

export default function FreeTierMessagesTab({ user }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        MESSAGES
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 32 }}>
        Your Conversations
      </h1>

      {/* Empty State */}
      <div className="bg-white rounded-xl p-12 border border-[#E0E0E0] text-center">
        <Mail className="w-12 h-12 text-[#CCCCCC] mx-auto mb-4" />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 8 }}>
          No messages yet.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#999', maxWidth: 400, margin: '0 auto' }}>
          Once you connect with alumni or parents in the network, conversations will appear here.
        </p>
      </div>
    </div>
  );
}