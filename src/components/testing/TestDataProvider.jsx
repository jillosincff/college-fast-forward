import { createContext, useContext } from 'react';

// Test data context for consistent testing across components
const TestDataContext = createContext();

export const useTestData = () => {
  const context = useContext(TestDataContext);
  if (!context) {
    throw new Error('useTestData must be used within TestDataProvider');
  }
  return context;
};

// Mock users for testing different personas
export const mockUsers = {
  student: {
    id: 'test-student-1',
    email: 'student@test.ufl.edu',
    full_name: 'Test Student',
    persona: 'student',
    graduation_year: 2025,
    major: 'Computer Science',
    onboarding_completed: true,
    includeInDirectory: true
  },
  alumni: {
    id: 'test-alumni-1',
    email: 'alumni@test.ufl.edu',
    full_name: 'Test Alumni',
    persona: 'alumni',
    graduation_year: 2020,
    current_company: 'Tech Corp',
    industry: 'Technology',
    onboarding_completed: true,
    includeInDirectory: true,
    alumni_onboarding_completed: true
  },
  parent: {
    id: 'test-parent-1',
    email: 'parent@test.com',
    full_name: 'Test Parent',
    persona: 'parent',
    student_name: 'My Student',
    student_graduation_year: 2025,
    relationship_to_student: 'parent',
    onboarding_completed: true,
    includeInDirectory: true
  },
  privateAlumni: {
    id: 'test-alumni-2',
    email: 'private@test.ufl.edu',
    full_name: 'Private Alumni',
    persona: 'alumni',
    graduation_year: 2019,
    onboarding_completed: true,
    includeInDirectory: false // Privacy test case
  }
};

// Mock job requests for testing
export const mockJobRequests = [
  {
    id: 'test-job-1',
    role: 'Software Engineer Intern',
    description: 'Looking for summer internship in tech',
    job_type: 'internship',
    target_industry: 'Technology',
    location_city: 'Austin',
    location_state: 'TX',
    created_by: 'student@test.ufl.edu',
    created_date: '2024-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: 'test-job-2',
    role: 'Marketing Coordinator',
    description: 'Seeking entry-level marketing position',
    job_type: 'fulltime',
    target_industry: 'Marketing',
    location_city: 'Miami',
    location_state: 'FL',
    created_by: 'student@test.ufl.edu',
    created_date: '2024-01-10T14:30:00Z',
    status: 'active'
  }
];

// Mock opportunities for testing
export const mockOpportunities = [
  {
    id: 'test-opp-1',
    title: 'Frontend Developer Intern',
    company_name: 'TechStart Inc',
    opportunity_type: 'internship',
    location_type: 'remote',
    posted_by_persona: 'alumni',
    description: 'Join our dynamic team as a frontend intern',
    apply_method: 'external',
    apply_url: 'https://techstart.com/careers',
    created_date: '2024-01-12T09:00:00Z',
    view_count: 15,
    question_count: 3,
    apply_click_count: 8
  },
  {
    id: 'test-opp-2',
    title: 'Business Analyst Position',
    company_name: 'Corporate Solutions',
    opportunity_type: 'fulltime',
    location_type: 'hybrid',
    city: 'Tampa',
    state: 'FL',
    posted_by_persona: 'parent',
    description: 'Excellent opportunity for recent graduates',
    apply_method: 'email',
    apply_email: 'careers@corpsolutions.com',
    created_date: '2024-01-08T11:15:00Z',
    view_count: 22,
    question_count: 1,
    apply_click_count: 12
  }
];

export const TestDataProvider = ({ children, testData = {} }) => {
  const defaultTestData = {
    users: mockUsers,
    jobRequests: mockJobRequests,
    opportunities: mockOpportunities,
    ...testData
  };

  return (
    <TestDataContext.Provider value={defaultTestData}>
      {children}
    </TestDataContext.Provider>
  );
};

export default TestDataProvider;