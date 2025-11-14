import { useEffect, useState } from 'react';
import { useRouter } from '@/components/router/SimpleRouter';

export default function RouterDebugger() {
  const { currentPage, params, routes } = useRouter();
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-20), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    const originalHashChange = window.onhashchange;
    
    window.onhashchange = (e) => {
      addLog(`Hash changed from ${e.oldURL} to ${e.newURL}`);
      if (originalHashChange) originalHashChange(e);
    };

    const interval = setInterval(() => {
      addLog(`Current: page=${currentPage}, hash=${window.location.hash}`);
    }, 2000);

    return () => {
      window.onhashchange = originalHashChange;
      clearInterval(interval);
    };
  }, [currentPage]);

  if (window.location.hostname !== 'localhost') return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: 'black',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      fontFamily: 'monospace',
      overflowY: 'auto',
      zIndex: 9999,
      border: '2px solid red'
    }}>
      <div><strong>Router Debug</strong></div>
      <div>Current Page: {currentPage}</div>
      <div>Hash: {window.location.hash}</div>
      <div>Available Routes: {Object.keys(routes || {}).length}</div>
      <div>Routes: {Object.keys(routes || {}).join(', ')}</div>
      <hr />
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
}