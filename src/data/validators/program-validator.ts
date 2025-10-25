/**
 * Program Data Validator
 *
 * Runtime validation for benefit program data structures.
 */

import type { BenefitProgram } from '../../db/schemas';
import type { ProgramValidationResult } from '../types/programs';

/**
 * Validate benefit program data
 */
export function validateBenefitProgram(program: any): ProgramValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!program) {
    errors.push('Program data is required');
    return { isValid: false, program: program as BenefitProgram, errors, warnings };
  }

  // Required fields
  if (!program.id || typeof program.id !== 'string') {
    errors.push('Program ID is required and must be a string');
  }

  if (!program.name || typeof program.name !== 'string') {
    errors.push('Program name is required and must be a string');
  }

  if (!program.category || typeof program.category !== 'string') {
    errors.push('Program category is required and must be a string');
  }

  if (!program.jurisdiction || typeof program.jurisdiction !== 'string') {
    errors.push('Program jurisdiction is required and must be a string');
  }

  if (!program.jurisdictionLevel || typeof program.jurisdictionLevel !== 'string') {
    errors.push('Program jurisdiction level is required and must be a string');
  }

  // Validate jurisdiction level
  const validJurisdictionLevels = ['federal', 'state', 'city', 'county'];
  if (program.jurisdictionLevel && !validJurisdictionLevels.includes(program.jurisdictionLevel)) {
    errors.push(`Invalid jurisdiction level: ${program.jurisdictionLevel}. Must be one of: ${validJurisdictionLevels.join(', ')}`);
  }

  // Validate timestamps
  if (typeof program.createdAt !== 'number' || program.createdAt <= 0) {
    errors.push('Created timestamp is required and must be a positive number');
  }

  if (typeof program.lastUpdated !== 'number' || program.lastUpdated <= 0) {
    errors.push('Last updated timestamp is required and must be a positive number');
  }

  if (typeof program.sourceDate !== 'number' || program.sourceDate <= 0) {
    errors.push('Source date timestamp is required and must be a positive number');
  }

  // Validate boolean fields
  if (typeof program.active !== 'boolean') {
    errors.push('Active field must be a boolean');
  }

  if (typeof program.applicationOpen !== 'boolean') {
    errors.push('Application open field must be a boolean');
  }

  // Validate arrays
  if (!Array.isArray(program.tags)) {
    errors.push('Tags must be an array');
  }

  // Contact information warnings
  if (!program.website) {
    warnings.push('Program website is missing');
  } else if (!isValidUrl(program.website)) {
    warnings.push('Program website appears to be invalid');
  }

  if (!program.phoneNumber) {
    warnings.push('Program phone number is missing');
  } else if (!isValidPhoneNumber(program.phoneNumber)) {
    warnings.push('Program phone number appears to be invalid');
  }

  if (!program.applicationUrl) {
    warnings.push('Program application URL is missing');
  } else if (!isValidUrl(program.applicationUrl)) {
    warnings.push('Program application URL appears to be invalid');
  }

  if (!program.officeAddress) {
    warnings.push('Program office address is missing');
  }

  return {
    isValid: errors.length === 0,
    program: program as BenefitProgram,
    errors,
    warnings
  };
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number format
 */
function isValidPhoneNumber(phone: string): boolean {
  // Basic phone number validation (allows various formats)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return phoneRegex.test(cleanPhone);
}
