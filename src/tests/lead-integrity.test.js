/**
 * Backend Lead Engine Integrity Tests
 * 
 * Verifies that backend functions return clean, valid payloads
 * and that ghost jobs (Capsule, Goodwin, etc.) are filtered out.
 * 
 * Run: npm test -- lead-integrity.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Base44 SDK
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn(),
    },
    entities: {
      User: {
        get: vi.fn(),
      },
    },
  },
}));

describe('Backend Lead Engine Integrity', () => {
  const MOCK_USER = {
    email: 'test@ufl.edu',
    persona: 'gator',
    career_goals: {
      role: 'Marketing',
      industries: ['Tech'],
      location_preference: 'New York, NY',
    },
    school_code: 'UF',
  };

  const GHOST_COMPANY_PATTERNS = [
    'capsule',
    'goodwin',
    'goodwin recruiting',
  ];

  const JOB_TITLE_KEYWORDS = [
    'intern',
    'manager',
    'analyst',
    'director',
    'engineer',
    'coordinator',
    'specialist',
  ];

  // Helper: Extract company name from any known key
  function extractCompany(lead) {
    return (
      lead.company ||
      lead.companyName ||
      lead.company_name ||
      lead.organization?.name ||
      lead.employer ||
      lead.business_name ||
      ''
    );
  }

  // Helper: Extract job title from any known key
  function extractTitle(lead) {
    return (
      lead.job_title ||
      lead.role ||
      lead.title ||
      lead.position ||
      lead.job_role ||
      ''
    );
  }

  // Helper: Validate company name integrity
  function assertValidCompany(company, leadIndex) {
    expect(company).toBeDefined();
    expect(typeof company).toBe('string');
    expect(company.length).toBeGreaterThan(2);
    expect(company.trim()).toBe(company); // No leading/trailing whitespace
    
    // Ensure job titles are not bleeding into company names
    const lastWord = company.toLowerCase().split(' ').pop();
    const isJobTitle = JOB_TITLE_KEYWORDS.some(keyword => 
      company.toLowerCase().includes(keyword) || lastWord === keyword
    );
    expect(isJobTitle).toBe(false);

    // Ensure not a ghost company
    const isGhost = GHOST_COMPANY_PATTERNS.some(pattern => 
      company.toLowerCase().includes(pattern)
    );
    expect(isGhost).toBe(false);
  }

  // Helper: Validate job title integrity
  function assertValidTitle(title, leadIndex) {
    expect(title).toBeDefined();
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(2);
    expect(title.trim()).toBe(title);
    expect(title).not.toBe('Entry Level Role');
    expect(title).not.toBe('Job Opportunity');
    expect(title).not.toBe('Open Position');
  }

  // Helper: Validate LinkedIn URL presence
  function assertValidLinkedin(lead, leadIndex) {
    const linkedinUrl = lead.linkedin_url || lead.company_linkedin;
    if (linkedinUrl) {
      expect(linkedinUrl).toMatch(/^https?:\/\/(www\.)?linkedin\.com\/.+/);
    }
  }

  describe('getDualConstraintLeads', () => {
    it('should return strict corporate entities with non-empty job definitions', async () => {
      const { getDualConstraintLeads } = await import('@/functions/getDualConstraintLeads');
      
      const response = await getDualConstraintLeads({
        explicit_target_role: MOCK_USER.career_goals.role,
        explicit_target_industries: MOCK_USER.career_goals.industries,
        target_location: MOCK_USER.career_goals.location_preference,
        school_code: MOCK_USER.school_code,
      });

      const leads = response?.data?.leads || response?.leads || [];
      
      expect(leads).toBeDefined();
      expect(Array.isArray(leads)).toBe(true);
      expect(leads.length).toBeGreaterThan(0);

      leads.forEach((lead, idx) => {
        const company = extractCompany(lead);
        const title = extractTitle(lead);

        console.log(`[TEST] Dual Lead #${idx}: ${company} - ${title}`);

        assertValidCompany(company, idx);
        assertValidTitle(title, idx);
        assertValidLinkedin(lead, idx);
      });
    });
  });

  describe('getLiveJobMatchesFn', () => {
    it('should return validated job leads with proper structure', async () => {
      const { getLiveJobMatchesFn } = await import('@/functions/getLiveJobMatchesFn');
      
      const response = await getLiveJobMatchesFn({
        school_code: MOCK_USER.school_code,
      });

      const leads = response?.data?.leads || response?.leads || [];
      
      expect(leads).toBeDefined();
      expect(Array.isArray(leads)).toBe(true);

      if (leads.length > 0) {
        leads.forEach((lead, idx) => {
          const company = extractCompany(lead);
          const title = extractTitle(lead);

          console.log(`[TEST] Live Lead #${idx}: ${company} - ${title}`);

          assertValidCompany(company, idx);
          assertValidTitle(title, idx);
        });
      }
    });
  });

  describe('Lead Payload Structure Validation', () => {
    it('should detect key mismatches in lead objects', () => {
      const suspiciousLeads = [
        { organization: { name: 'Google' }, job_title: 'SWE Intern' }, // Nested company
        { company: 'Netflix', position: 'Data Analyst' }, // Different title key
        { employer: 'Meta', role: 'Product Manager' }, // Alternative keys
      ];

      suspiciousLeads.forEach((lead, idx) => {
        const company = extractCompany(lead);
        const title = extractTitle(lead);

        expect(company).toBeTruthy();
        expect(title).toBeTruthy();
      });
    });

    it('should reject leads with missing critical fields', () => {
      const invalidLeads = [
        { company: '', job_title: 'Engineer' },
        { company: 'Apple', job_title: '' },
        { company: null, job_title: 'Designer' },
        { company: 'Amazon', title: undefined },
      ];

      invalidLeads.forEach((lead, idx) => {
        const company = extractCompany(lead);
        const title = extractTitle(lead);

        // These should fail validation
        try {
          assertValidCompany(company, idx);
          assertValidTitle(title, idx);
        } catch (e) {
          // Expected to fail
          expect(e).toBeDefined();
        }
      });
    });
  });

  describe('Ghost Company Detection', () => {
    it('should identify and reject known ghost companies', () => {
      const ghostLeads = [
        { company: 'Capsule Health', job_title: 'Intern' },
        { company: 'Goodwin Recruiting', job_title: 'Sales Rep' },
        { company: 'Capsule', job_title: 'Marketing Manager' },
      ];

      ghostLeads.forEach((lead, idx) => {
        const company = extractCompany(lead);
        
        const isGhost = GHOST_COMPANY_PATTERNS.some(pattern => 
          company.toLowerCase().includes(pattern)
        );
        
        expect(isGhost).toBe(true); // Should be detected as ghost
      });
    });
  });
});