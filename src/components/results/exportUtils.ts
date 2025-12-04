/**
 * Export Utilities
 *
 * Functions for exporting results to PDF and encrypted formats
 */

import type { EligibilityResults, ProgramEligibilityResult } from './types';
import { encryptToString, decryptFromString, deriveKeyFromPassphrase } from '../../utils/encryption';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize text content for safe HTML injection
 * 
 * @param text - Text to sanitize
 * @returns Sanitized text safe for HTML injection
 */
function sanitizeText(text: string | undefined | null): string {
  if (!text) return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize URL for safe href attributes
 * 
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
function sanitizeUrl(url: string | undefined): string {
  if (!url) return '';
  const sanitized = DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });
  // Only allow http/https protocols
  if (sanitized.match(/^https?:\/\//)) {
    return sanitized;
  }
  return '';
}

/**
 * Generate PDF from results (using browser print API)
 */
export function exportToPDF(
  results: EligibilityResults,
  options?: {
    userInfo?: {
      name?: string;
      evaluationDate?: Date;
    };
  }
): void {
  const { userInfo } = options ?? {};

  // Create a temporary container for PDF content
  const container = document.createElement('div');
  container.className = 'print-view';
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  // Build HTML content
  const html = buildPrintHTML(results, userInfo);
  
  // SECURITY: Sanitize HTML before injection to prevent XSS
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'div', 'h1', 'h2', 'h3', 'h4', 'p', 'span', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br'
    ],
    ALLOWED_ATTR: ['style', 'href', 'class', 'aria-label'],
    ALLOWED_URI_REGEXP: /^https?:\/\//,
  });
  
  container.innerHTML = sanitizedHtml;

  document.body.appendChild(container);

  // Trigger browser print dialog
  // Note: This opens the native print dialog where user can save as PDF
  window.print();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(container);
  }, 100);
}

/**
 * Build HTML for printing/PDF
 */
function buildPrintHTML(
  results: EligibilityResults,
  userInfo?: { name?: string; evaluationDate?: Date }
): string {
  const evaluationDate = userInfo?.evaluationDate ?? results.evaluatedAt;
  const sanitizedUserName = sanitizeText(userInfo?.name);

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #1f2937; padding-bottom: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24pt;">Benefit Eligibility Results</h1>
        ${sanitizedUserName ? `<p style="margin: 5px 0;">Prepared for: ${sanitizedUserName}</p>` : ''}
        <p style="margin: 5px 0;">Date: ${evaluationDate.toLocaleDateString()}</p>
      </div>

      <!-- Summary -->
      <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h2 style="margin-top: 0;">Summary</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div><strong>Total Programs:</strong> ${results.totalPrograms}</div>
          <div style="color: #059669;"><strong>Qualified:</strong> ${results.qualified.length}</div>
          <div style="color: #2563eb;"><strong>Likely:</strong> ${results.likely.length}</div>
          <div style="color: #ca8a04;"><strong>Maybe:</strong> ${results.maybe.length}</div>
        </div>
      </div>

      <!-- Qualified Programs -->
      ${results.qualified.length > 0 ? `
        <div style="page-break-before: avoid;">
          <h2 style="color: #059669; border-bottom: 2px solid #059669;">✓ Programs You Qualify For</h2>
          ${results.qualified.map(p => buildProgramHTML(p)).join('')}
        </div>
      ` : ''}

      <!-- Likely Programs -->
      ${results.likely.length > 0 ? `
        <div style="page-break-before: auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb;">✓ Programs You Likely Qualify For</h2>
          ${results.likely.map(p => buildProgramHTML(p)).join('')}
        </div>
      ` : ''}

      <!-- Maybe Programs -->
      ${results.maybe.length > 0 ? `
        <div style="page-break-before: auto;">
          <h2 style="color: #ca8a04; border-bottom: 2px solid #ca8a04;">? Programs You May Qualify For</h2>
          ${results.maybe.map(p => buildProgramHTML(p)).join('')}
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="border-top: 1px solid #d1d5db; padding-top: 15px; margin-top: 30px; text-align: center; font-size: 9pt; color: #6b7280;">
        <p>This eligibility screening is for informational purposes only. Final eligibility determinations are made by program administrators.</p>
        <p style="margin-top: 10px;">Generated by BenefitFinder • All calculations performed locally on your device</p>
        <p>Printed on: ${new Date().toLocaleString()}</p>
      </div>

      <!-- Privacy Notice -->
      <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; margin-top: 15px; background: #f9fafb; font-size: 9pt;">
        <h4 style="margin-top: 0; font-size: 10pt;">Privacy Notice</h4>
        <p style="margin: 0;">All eligibility calculations were performed locally on your device. No personal information was sent to external servers. This document contains sensitive information - please keep it secure.</p>
      </div>
    </div>
  `;
}

/**
 * Build HTML for a single program
 */
function buildProgramHTML(program: ProgramEligibilityResult): string {
  // Sanitize all user-facing text fields
  const programName = sanitizeText(program.programName);
  const jurisdiction = sanitizeText(program.jurisdiction);
  const programDescription = sanitizeText(program.programDescription);
  const explanationReason = sanitizeText(program.explanation.reason);
  
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid;">
      <h3 style="margin-top: 0;">${programName}</h3>
      <p style="color: #6b7280; font-size: 10pt;">${jurisdiction}</p>
      <p>${programDescription}</p>

      ${program.estimatedBenefit ? `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 10px; margin: 10px 0;">
          <strong>Estimated Benefit:</strong> $${program.estimatedBenefit.amount.toLocaleString()}/${sanitizeText(program.estimatedBenefit.frequency)}
        </div>
      ` : ''}

      <div style="margin: 15px 0;">
        <strong>Why:</strong> ${explanationReason}
      </div>

      ${program.requiredDocuments.length > 0 ? `
        <div style="margin: 15px 0;">
          <strong>Required Documents:</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${program.requiredDocuments.filter(d => d.required).map(d => {
              const docName = sanitizeText(d.name);
              const docWhere = sanitizeText(d.where);
              return `<li>${docName}${docWhere ? ` <em style="color: #6b7280;">(${docWhere})</em>` : ''}</li>`;
            }).join('')}
          </ul>
        </div>
      ` : ''}

      ${program.nextSteps.length > 0 ? `
        <div style="margin: 15px 0;">
          <strong>Next Steps:</strong>
          <ol style="margin: 5px 0; padding-left: 20px;">
            ${program.nextSteps.map(s => {
              const stepText = sanitizeText(s.step);
              const stepUrl = sanitizeUrl(s.url);
              return `
              <li>
                ${stepText}
                ${stepUrl ? `<br><a href="${stepUrl}" style="color: #2563eb; font-size: 9pt;" aria-label="Visit website for ${stepText}">${stepUrl}</a>` : ''}
              </li>
            `;
            }).join('')}
          </ol>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Export results as encrypted file
 */
export async function exportEncrypted(
  results: EligibilityResults,
  password: string,
  options?: {
    profileSnapshot?: Record<string, unknown>;
    metadata?: {
      userName?: string;
      state?: string;
      notes?: string;
    };
  }
): Promise<Blob> {
  const { profileSnapshot, metadata } = options ?? {};

  // Sanitize metadata to prevent XSS
  const sanitizedMetadata = metadata ? {
    userName: sanitizeText(metadata.userName),
    state: sanitizeText(metadata.state),
    notes: sanitizeText(metadata.notes),
  } : undefined;

  // Prepare data for export
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    results,
    profileSnapshot,
    metadata: sanitizedMetadata,
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);

  // Derive encryption key from password
  const { key, salt } = await deriveKeyFromPassphrase(password);

  // Encrypt the data (returns a string)
  const encrypted = await encryptToString(jsonString, key);

  // Create export package with salt and encrypted data
  const exportPackage = {
    salt,
    encrypted,
  };

  // Create blob with custom file format
  return new Blob([JSON.stringify(exportPackage)], { type: 'application/octet-stream' });
}

/**
 * Import results from encrypted file
 */
export async function importEncrypted(
  file: File | Blob,
  password: string
): Promise<{
  results: EligibilityResults;
  profileSnapshot?: Record<string, unknown>;
  metadata?: {
    userName?: string;
    state?: string;
    notes?: string;
  };
  exportedAt: Date;
}> {
  try {
    // Read file as text with fallback for environments where .text() is not available
    let fileText: string;
    if (typeof file.text === 'function') {
      fileText = await file.text();
    } else {
      // Fallback to FileReader for environments without Blob.text() support
      fileText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    }

    // Parse export package
    const exportPackage = JSON.parse(fileText);
    if (!exportPackage.salt || !exportPackage.encrypted) {
      throw new Error('Invalid encrypted file format');
    }

    // Derive key from password using stored salt
    const { key } = await deriveKeyFromPassphrase(password, exportPackage.salt);

    // Decrypt the data (from string format)
    const decrypted = await decryptFromString(exportPackage.encrypted, key);

    // Parse JSON
    const data = JSON.parse(decrypted);

    // Validate version
    if (!data.version || data.version !== '1.0.0') {
      throw new Error('Unsupported file format version');
    }

    // Sanitize imported metadata to prevent XSS
    const sanitizedMetadata = data.metadata ? {
      userName: sanitizeText(data.metadata.userName),
      state: sanitizeText(data.metadata.state),
      notes: sanitizeText(data.metadata.notes),
    } : undefined;

    // Helper to reconstruct program result with Date objects
    interface SerializedProgramResult extends Omit<ProgramEligibilityResult, 'evaluatedAt' | 'applicationDeadline'> {
      evaluatedAt: string;
      applicationDeadline?: string;
    }

    const reconstructProgramResult = (p: SerializedProgramResult): ProgramEligibilityResult => ({
      ...p,
      evaluatedAt: new Date(p.evaluatedAt),
      applicationDeadline: p.applicationDeadline ? new Date(p.applicationDeadline) : undefined,
    });

    // Reconstruct results with Date objects
    const results: EligibilityResults = {
      ...data.results,
      evaluatedAt: new Date(data.results.evaluatedAt),
      qualified: (data.results.qualified as SerializedProgramResult[]).map(reconstructProgramResult),
      likely: (data.results.likely as SerializedProgramResult[]).map(reconstructProgramResult),
      maybe: (data.results.maybe as SerializedProgramResult[]).map(reconstructProgramResult),
      notQualified: (data.results.notQualified as SerializedProgramResult[]).map(reconstructProgramResult),
    };

    return {
      results,
      profileSnapshot: data.profileSnapshot,
      metadata: sanitizedMetadata,
      exportedAt: new Date(data.exportedAt),
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes('Decryption failed')) {
      throw new Error('Invalid password or corrupted file');
    }
    throw new Error(`Failed to import encrypted file: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename for export
 */
export function generateExportFilename(prefix: string = 'eligibility-results'): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}-${dateStr}-${timeStr}`;
}

