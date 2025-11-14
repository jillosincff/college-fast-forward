import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  Accessibility
} from 'lucide-react';

// Component for testing user interactions
export const TestInteractionTracker = ({ onInteraction, testId }) => {
  const [interactions, setInteractions] = useState([]);

  const trackInteraction = (type, data) => {
    const interaction = {
      id: Date.now(),
      type,
      data,
      timestamp: new Date().toISOString(),
      testId
    };
    setInteractions(prev => [...prev, interaction]);
    if (onInteraction) onInteraction(interaction);
  };

  return (
    <div data-testid={`interaction-tracker-${testId}`}>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          onClick={() => trackInteraction('button_click', { button: 'primary' })}
          data-testid="test-button-primary"
        >
          Test Button
        </Button>
        <Button
          variant="outline"
          onClick={() => trackInteraction('message_send', { recipient: 'test@ufl.edu' })}
          data-testid="test-message-button"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </div>
      
      <div className="text-sm">
        <p className="font-medium">Interactions: {interactions.length}</p>
        {interactions.slice(-3).map(interaction => (
          <div key={interaction.id} className="text-xs text-slate-600">
            {interaction.type} at {new Date(interaction.timestamp).toLocaleTimeString()}
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for testing role-based visibility
export const RoleBasedTestComponent = ({ currentUser, testRoles = [] }) => {
  const [visibleContent, setVisibleContent] = useState({});

  useEffect(() => {
    const content = {};
    testRoles.forEach(role => {
      content[role] = currentUser?.persona === role;
    });
    setVisibleContent(content);
  }, [currentUser, testRoles]);

  return (
    <div data-testid="role-based-content">
      {testRoles.map(role => (
        <div key={role} data-testid={`content-${role}`}>
          {visibleContent[role] && (
            <Badge variant="outline" className="mr-2 mb-2">
              {role} content visible
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};

// Performance measurement component
export const PerformanceMonitor = ({ componentName, children }) => {
  const [renderTime, setRenderTime] = useState(null);
  const [rerenderCount, setRerenderCount] = useState(0);

  useEffect(() => {
    const start = performance.now();
    setRerenderCount(prev => prev + 1);
    
    // Measure render time
    const timer = setTimeout(() => {
      const end = performance.now();
      setRenderTime(end - start);
    }, 0);

    return () => clearTimeout(timer);
  });

  return (
    <div data-testid={`performance-monitor-${componentName}`}>
      {children}
      <div className="text-xs text-slate-500 mt-2">
        <div>Renders: {rerenderCount}</div>
        {renderTime && <div>Last render: {renderTime.toFixed(2)}ms</div>}
      </div>
    </div>
  );
};

// Accessibility testing helper component
export const AccessibilityChecker = ({ children, checkList = [] }) => {
  const [accessibilityStatus, setAccessibilityStatus] = useState({});

  useEffect(() => {
    // Simulate accessibility checks
    const checks = {};
    checkList.forEach(check => {
      switch (check) {
        case 'aria-labels':
          checks['aria-labels'] = document.querySelectorAll('[aria-label]').length > 0;
          break;
        case 'headings':
          checks['headings'] = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0;
          break;
        case 'alt-text':
          checks['alt-text'] = Array.from(document.querySelectorAll('img')).every(img => img.alt);
          break;
        case 'keyboard-navigation':
          checks['keyboard-navigation'] = document.querySelectorAll('[tabindex], button, input, select, textarea, a').length > 0;
          break;
        default:
          checks[check] = true;
      }
    });
    setAccessibilityStatus(checks);
  }, [checkList]);

  return (
    <div data-testid="accessibility-checker">
      {children}
      <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
        <div className="flex items-center gap-2 mb-2">
          <Accessibility className="w-4 h-4" />
          <span className="font-medium">Accessibility Status</span>
        </div>
        {Object.entries(accessibilityStatus).map(([check, passed]) => (
          <div key={check} className="flex items-center gap-2">
            {passed ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span>{check.replace('-', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Mock API response simulator
export const MockAPISimulator = ({ endpoint, delay = 1000, shouldFail = false }) => {
  const [status, setStatus] = useState('idle');
  const [response, setResponse] = useState(null);

  const simulateAPICall = async () => {
    setStatus('loading');
    setResponse(null);

    try {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (shouldFail) {
        throw new Error(`Simulated error for ${endpoint}`);
      }

      const mockResponse = {
        data: `Mock data from ${endpoint}`,
        timestamp: new Date().toISOString(),
        success: true
      };

      setResponse(mockResponse);
      setStatus('success');
    } catch (error) {
      setResponse({ error: error.message, success: false });
      setStatus('error');
    }
  };

  return (
    <Card className="max-w-sm" data-testid={`mock-api-${endpoint.replace('/', '-')}`}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TestTube className="w-4 h-4" />
          Mock API: {endpoint}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={simulateAPICall}
          disabled={status === 'loading'}
          data-testid="simulate-api-call"
          size="sm"
        >
          {status === 'loading' ? (
            <>
              <Clock className="w-3 h-3 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Simulate Call'
          )}
        </Button>
        
        {response && (
          <div className={`p-2 rounded text-xs ${
            status === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default {
  TestInteractionTracker,
  RoleBasedTestComponent,
  PerformanceMonitor,
  AccessibilityChecker,
  MockAPISimulator
};