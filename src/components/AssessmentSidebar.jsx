import { ChevronLeft } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function AssessmentSidebar() {
  return (
    <div style={{
      width: 60,
      background: '#fff',
      borderRight: '1px solid #E5E5E5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 20,
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      <button
        onClick={() => navigate('FreeTierDashboard')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          borderRadius: 8,
          minHeight: 'auto',
          minWidth: 'auto'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="Back to Dashboard"
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  );
}