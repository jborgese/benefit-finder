/**
 * Export Utils Tests - Security & Sanitization
 * 
 * Tests ensuring all export paths are properly sanitized
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToPDF, exportEncrypted, importEncrypted } from '../exportUtils';
import type { EligibilityResults, ProgramEligibilityResult } from '../types';

/**
 * Helper to read blob as text with fallback for environments without .text() support
 */
async function readBlobAsText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') {
    return await blob.text();
  }
  // Fallback to FileReader for environments without Blob.text() support
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe('Export Utils - Security & Sanitization', () => {
  let mockResults: EligibilityResults;
  let mockContainer: HTMLDivElement;

  beforeEach(() => {
    // Create mock results with potential XSS vectors
    const mockProgram: ProgramEligibilityResult = {
      programId: 'test-program',
      programName: 'Test Program',
      programDescription: 'A test program description',
      jurisdiction: 'US-FEDERAL',
      status: 'qualified',
      confidence: 'high',
      confidenceScore: 90,
      explanation: {
        reason: 'You meet the requirements',
        details: ['Income below threshold'],
        rulesCited: ['test-rule-1'],
      },
      estimatedBenefit: {
        amount: 500,
        frequency: 'monthly',
      },
      requiredDocuments: [
        {
          id: 'doc-1',
          name: 'ID Card',
          description: 'Valid government ID',
          required: true,
          where: 'DMV',
          obtained: false,
        },
      ],
      nextSteps: [
        {
          step: 'Visit the office',
          url: 'https://benefits.gov',
        },
      ],
      evaluatedAt: new Date('2024-01-01'),
      rulesVersion: '1.0.0',
    };

    mockResults = {
      totalPrograms: 1,
      qualified: [mockProgram],
      likely: [],
      maybe: [],
      notQualified: [],
      evaluatedAt: new Date('2024-01-01'),
    };

    // Setup DOM mocks
    mockContainer = document.createElement('div');
    
    // Mock createElement to return our container
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'div') {
        return mockContainer;
      }
      return originalCreateElement(tagName);
    });
    
    // Mock appendChild
    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      // Don't actually append to avoid DOM errors
      return node;
    });
    
    // Mock removeChild
    vi.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => {
      // Don't actually remove to avoid DOM errors
      return node;
    });
    
    // Mock window.print
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('XSS Prevention in PDF Export', () => {
    it('should sanitize malicious program names', () => {
      mockResults.qualified[0].programName = '<script>alert("XSS")</script>SNAP';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('<script>');
      expect(html).toContain('SNAP');
    });

    it('should sanitize malicious program descriptions', () => {
      mockResults.qualified[0].programDescription = '<img src=x onerror="alert(1)">Food benefits';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('onerror');
      expect(html).toContain('Food benefits');
    });

    it('should sanitize malicious user names', () => {
      const options = {
        userInfo: {
          name: '<iframe src="evil.com"></iframe>John Doe',
          evaluationDate: new Date('2024-01-01'),
        },
      };
      
      exportToPDF(mockResults, options);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('<iframe>');
      expect(html).toContain('John Doe');
    });

    it('should sanitize malicious explanation reasons', () => {
      mockResults.qualified[0].explanation.reason = 
        'You qualify <script>steal()</script> for benefits';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('<script>');
      expect(html).toContain('You qualify');
      expect(html).toContain('for benefits');
    });

    it('should sanitize malicious document names', () => {
      mockResults.qualified[0].requiredDocuments[0].name = 
        '<img src=x onerror=alert(1)>Birth Certificate';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('onerror');
      expect(html).toContain('Birth Certificate');
    });

    it('should sanitize malicious next step URLs', () => {
      mockResults.qualified[0].nextSteps[0].url = 
        'javascript:alert("XSS")';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('javascript:');
    });

    it('should sanitize malicious next step text', () => {
      mockResults.qualified[0].nextSteps[0].step = 
        '<a href="javascript:alert(1)">Click here</a>';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('javascript:');
    });

    it('should handle jurisdiction with malicious content', () => {
      mockResults.qualified[0].jurisdiction = '<script>alert(1)</script>US-GA';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('<script>');
      expect(html).toContain('US-GA');
    });

    it('should sanitize detail items in explanations', () => {
      mockResults.qualified[0].explanation.details = [
        'Income below threshold',
        '<img src=x onerror=alert(1)>Household size qualifies',
      ];
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).not.toContain('onerror');
      expect(html).toContain('Household size qualifies');
    });

    it('should handle empty or null values safely', () => {
      mockResults.qualified[0].programName = '';
      mockResults.qualified[0].programDescription = '';
      
      expect(() => exportToPDF(mockResults)).not.toThrow();
    });
  });

  describe('Safe Content Preservation', () => {
    it('should preserve safe HTML formatting in descriptions', () => {
      mockResults.qualified[0].programDescription = 
        '<strong>Important:</strong> Federal food assistance program';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).toContain('<strong>');
      expect(html).toContain('Important:');
    });

    it('should preserve safe links with https', () => {
      mockResults.qualified[0].nextSteps[0].url = 'https://benefits.gov/apply';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).toContain('https://benefits.gov/apply');
    });

    it('should preserve currency formatting', () => {
      mockResults.qualified[0].estimatedBenefit = {
        amount: 1234.56,
        frequency: 'monthly',
      };
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).toContain('1,234');
    });

    it('should preserve date formatting', () => {
      const testDate = new Date('2024-06-15');
      mockResults.evaluatedAt = testDate;
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).toContain(testDate.toLocaleDateString());
    });
  });

  describe('Encrypted Export Security', () => {
    it('should not expose password in clear text', async () => {
      const password = 'SuperSecret123!';
      
      const blob = await exportEncrypted(mockResults, password);
      const text = await readBlobAsText(blob);
      
      expect(text).not.toContain(password);
    });

    it('should encrypt sensitive user data', async () => {
      const password = 'test123';
      const options = {
        profileSnapshot: {
          firstName: 'John',
          lastName: 'Doe',
          ssn: '123-45-6789',
          householdIncome: 50000,
        },
      };
      
      const blob = await exportEncrypted(mockResults, password, options);
      const text = await readBlobAsText(blob);
      
      // Sensitive data should not appear in plaintext
      expect(text).not.toContain('John');
      expect(text).not.toContain('Doe');
      expect(text).not.toContain('123-45-6789');
      expect(text).not.toContain('50000');
    });

    it('should include salt for key derivation', async () => {
      const password = 'test123';
      
      const blob = await exportEncrypted(mockResults, password);
      const text = await readBlobAsText(blob);
      const parsed = JSON.parse(text);
      
      expect(parsed).toHaveProperty('salt');
      expect(parsed).toHaveProperty('encrypted');
    });

    it('should handle special characters in metadata', async () => {
      const password = 'test123';
      const options = {
        metadata: {
          userName: '<script>alert("XSS")</script>John',
          notes: '<img src=x onerror=alert(1)>Important notes',
        },
      };
      
      const blob = await exportEncrypted(mockResults, password, options);
      
      // Should not throw error
      expect(blob).toBeDefined();
      
      // Decrypt and verify sanitization
      const decrypted = await importEncrypted(blob, password);
      expect(decrypted.metadata?.userName).not.toContain('<script>');
      expect(decrypted.metadata?.notes).not.toContain('onerror');
    });

    it('should validate encrypted data structure', async () => {
      const password = 'test123';
      
      const blob = await exportEncrypted(mockResults, password);
      const text = await readBlobAsText(blob);
      const parsed = JSON.parse(text);
      
      expect(parsed.salt).toBeDefined();
      expect(parsed.encrypted).toBeDefined();
      expect(typeof parsed.salt).toBe('string');
      expect(typeof parsed.encrypted).toBe('string');
    });
  });

  describe('Import Security', () => {
    it('should reject malformed encrypted files', async () => {
      const badBlob = new Blob([JSON.stringify({ invalid: 'data' })]);
      
      await expect(
        importEncrypted(badBlob, 'password')
      ).rejects.toThrow();
    });

    it('should reject files with wrong password', async () => {
      const password = 'correct';
      const blob = await exportEncrypted(mockResults, password);
      
      await expect(
        importEncrypted(blob, 'wrong-password')
      ).rejects.toThrow(/password|decryption/i);
    });

    it('should sanitize imported metadata', async () => {
      const password = 'test123';
      const options = {
        metadata: {
          userName: '<script>alert(1)</script>Jane',
          state: 'GA',
        },
      };
      
      const blob = await exportEncrypted(mockResults, password, options);
      const decrypted = await importEncrypted(blob, password);
      
      // Metadata should be present but sanitized
      expect(decrypted.metadata?.userName).toBeDefined();
      expect(decrypted.metadata?.userName).not.toContain('<script>');
    });

    it('should validate imported results structure', async () => {
      const password = 'test123';
      const blob = await exportEncrypted(mockResults, password);
      const decrypted = await importEncrypted(blob, password);
      
      expect(decrypted.results).toBeDefined();
      expect(decrypted.results.qualified).toBeInstanceOf(Array);
      expect(decrypted.results.evaluatedAt).toBeInstanceOf(Date);
    });

    it('should reject invalid version numbers', async () => {
      const password = 'test123';
      
      // Create a blob with invalid version
      const invalidData = {
        version: '0.0.1', // Invalid version
        exportedAt: new Date().toISOString(),
        results: mockResults,
      };
      
      // Manually encrypt with invalid version
      const { key, salt } = await (await import('../../../utils/encryption')).deriveKeyFromPassphrase(password);
      const encrypted = await (await import('../../../utils/encryption')).encryptToString(JSON.stringify(invalidData), key);
      
      const invalidBlob = new Blob([JSON.stringify({ salt, encrypted })]);
      
      // Should reject due to invalid version
      await expect(
        importEncrypted(invalidBlob, password)
      ).rejects.toThrow(/version/i);
    });

    it('should handle corrupted encrypted data', async () => {
      const corrupted = new Blob([JSON.stringify({
        salt: 'valid-salt',
        encrypted: 'corrupted-data!!!',
      })]);
      
      await expect(
        importEncrypted(corrupted, 'password')
      ).rejects.toThrow();
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should handle Unicode characters in program names', () => {
      mockResults.qualified[0].programName = 'Información de Beneficios';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).toContain('Información');
    });

    it('should handle HTML entities', () => {
      mockResults.qualified[0].programDescription = 'Price: &lt;$1000&gt;';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).toContain('&lt;');
    });

    it('should handle newlines and special formatting', () => {
      mockResults.qualified[0].explanation.reason = 
        'Line 1\nLine 2\nLine 3';
      
      exportToPDF(mockResults);
      
      const html = mockContainer.innerHTML;
      expect(html).toContain('Line 1');
      expect(html).toContain('Line 2');
    });

    it('should handle very long strings', () => {
      mockResults.qualified[0].programDescription = 'A'.repeat(5000);
      
      expect(() => exportToPDF(mockResults)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results', () => {
      const emptyResults: EligibilityResults = {
        totalPrograms: 0,
        qualified: [],
        likely: [],
        maybe: [],
        notQualified: [],
        evaluatedAt: new Date(),
      };
      
      expect(() => exportToPDF(emptyResults)).not.toThrow();
    });

    it('should handle missing optional fields', () => {
      mockResults.qualified[0].estimatedBenefit = undefined;
      mockResults.qualified[0].requiredDocuments = [];
      mockResults.qualified[0].nextSteps = [];
      
      expect(() => exportToPDF(mockResults)).not.toThrow();
    });

    it('should handle multiple programs', () => {
      mockResults.qualified = Array(10).fill(mockResults.qualified[0]);
      
      expect(() => exportToPDF(mockResults)).not.toThrow();
    });

    it('should handle invalid dates gracefully', () => {
      mockResults.evaluatedAt = new Date('invalid');
      
      // Should not throw, but may have fallback behavior
      expect(() => exportToPDF(mockResults)).not.toThrow();
    });
  });
});
