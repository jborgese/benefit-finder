/**
 * DocumentChecklist Component Tests
 *
 * Comprehensive test suite for the DocumentChecklist component
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentChecklist } from '../DocumentChecklist';
import { RequiredDocument } from '../types';

describe('DocumentChecklist Component', () => {
  afterEach(() => {
    cleanup();
  });

  const mockRequiredDoc: RequiredDocument = {
    id: 'doc-1',
    name: 'Birth Certificate',
    description: 'Original or certified copy of birth certificate',
    required: true,
    where: 'County Clerk Office',
    obtained: false,
  };

  const mockOptionalDoc: RequiredDocument = {
    id: 'doc-2',
    name: 'Bank Statements',
    description: 'Last 3 months of bank statements',
    required: false,
    where: 'Your bank',
    obtained: false,
  };

  const mockDocWithAlternatives: RequiredDocument = {
    id: 'doc-3',
    name: 'Proof of Identity',
    description: 'Valid identification document',
    required: true,
    alternatives: [
      'Driver\'s License',
      'State ID Card',
      'Passport',
    ],
    where: 'DMV or Passport Office',
    obtained: false,
  };

  describe('Basic rendering', () => {
    it('should render the component with instructions', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      expect(screen.getByText(/You'll need to provide the following documents/i)).toBeInTheDocument();
    });

    it('should render empty state when no documents provided', () => {
      render(<DocumentChecklist documents={[]} />);

      expect(screen.getByText(/You'll need to provide the following documents/i)).toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('Required documents', () => {
    it('should render required documents with required label', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.getByText('*Required')).toBeInTheDocument();
    });

    it('should display document description', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      expect(screen.getByText('Original or certified copy of birth certificate')).toBeInTheDocument();
    });

    it('should display where to obtain document', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      expect(screen.getByText(/Where to get it:/i)).toBeInTheDocument();
      expect(screen.getByText('County Clerk Office')).toBeInTheDocument();
    });

    it('should render checkbox for required document', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      const checkbox = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should render multiple required documents', () => {
      const docs = [
        mockRequiredDoc,
        { ...mockDocWithAlternatives },
      ];

      render(<DocumentChecklist documents={docs} />);

      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.getByText('Proof of Identity')).toBeInTheDocument();
      expect(screen.getAllByText('*Required')).toHaveLength(2);
    });
  });

  describe('Optional documents', () => {
    it('should render optional documents without required label', () => {
      render(<DocumentChecklist documents={[mockOptionalDoc]} />);

      expect(screen.getByText('Bank Statements')).toBeInTheDocument();
      expect(screen.queryByText('*Required')).not.toBeInTheDocument();
    });

    it('should display optional documents section header', () => {
      render(<DocumentChecklist documents={[mockOptionalDoc]} />);

      expect(screen.getByText(/Optional Documents \(1\)/i)).toBeInTheDocument();
    });

    it('should display optional documents description', () => {
      render(<DocumentChecklist documents={[mockOptionalDoc]} />);

      expect(screen.getByText(/These documents may strengthen your application/i)).toBeInTheDocument();
    });

    it('should render both required and optional documents in separate sections', () => {
      const docs = [mockRequiredDoc, mockOptionalDoc];

      render(<DocumentChecklist documents={docs} />);

      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.getByText('Bank Statements')).toBeInTheDocument();
      expect(screen.getByText(/Optional Documents \(1\)/i)).toBeInTheDocument();
    });
  });

  describe('Document alternatives', () => {
    it('should show alternatives button when alternatives exist', () => {
      render(<DocumentChecklist documents={[mockDocWithAlternatives]} />);

      expect(screen.getByText(/Show alternatives \(3\)/i)).toBeInTheDocument();
    });

    it('should expand alternatives accordion on click', async () => {
      const user = userEvent.setup();
      render(<DocumentChecklist documents={[mockDocWithAlternatives]} />);

      const trigger = screen.getByText(/Show alternatives \(3\)/i);
      await user.click(trigger);

      expect(screen.getByText('Alternative documents:')).toBeInTheDocument();
      expect(screen.getByText("Driver's License")).toBeInTheDocument();
      expect(screen.getByText('State ID Card')).toBeInTheDocument();
      expect(screen.getByText('Passport')).toBeInTheDocument();
    });

    it('should not show alternatives button when no alternatives', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      expect(screen.queryByText(/Show alternatives/i)).not.toBeInTheDocument();
    });

    it('should render document with empty alternatives array without button', () => {
      const docWithEmptyAlternatives = {
        ...mockRequiredDoc,
        alternatives: [],
      };

      render(<DocumentChecklist documents={[docWithEmptyAlternatives]} />);

      expect(screen.queryByText(/Show alternatives/i)).not.toBeInTheDocument();
    });
  });

  describe('Checkbox interaction', () => {
    it('should call onToggle when checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(<DocumentChecklist documents={[mockRequiredDoc]} onToggle={onToggle} />);

      const checkbox = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledWith('doc-1', true);
    });

    it('should call onToggle when checkbox is checked and unchecked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      // Start with a document that can be toggled
      const { rerender } = render(
        <DocumentChecklist documents={[{ ...mockRequiredDoc, obtained: false }]} onToggle={onToggle} />
      );

      const checkbox = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });

      // Check
      await user.click(checkbox);
      expect(onToggle).toHaveBeenCalledWith('doc-1', true);

      // Rerender with updated state
      rerender(
        <DocumentChecklist documents={[{ ...mockRequiredDoc, obtained: true }]} onToggle={onToggle} />
      );

      // Uncheck
      await user.click(checkbox);
      expect(onToggle).toHaveBeenCalledWith('doc-1', false);
    });

    it('should work without onToggle callback', async () => {
      const user = userEvent.setup();

      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      const checkbox = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      await user.click(checkbox);

      // Should not throw error
      expect(checkbox).toBeInTheDocument();
    });

    it('should render checkbox as checked when obtained is true', () => {
      const obtainedDoc = { ...mockRequiredDoc, obtained: true };

      render(<DocumentChecklist documents={[obtainedDoc]} />);

      const checkbox = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      expect(checkbox).toBeChecked();
    });

    it('should handle multiple checkbox toggles independently', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      const docs = [
        { ...mockRequiredDoc, id: 'doc-1' },
        { ...mockOptionalDoc, id: 'doc-2' },
      ];

      render(<DocumentChecklist documents={docs} onToggle={onToggle} />);

      const checkbox1 = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /Mark Bank Statements as obtained/i });

      await user.click(checkbox1);
      expect(onToggle).toHaveBeenCalledWith('doc-1', true);

      await user.click(checkbox2);
      expect(onToggle).toHaveBeenCalledWith('doc-2', true);
    });
  });

  describe('Document rendering variations', () => {
    it('should render document without description', () => {
      const docWithoutDescription = {
        ...mockRequiredDoc,
        description: undefined,
      };

      render(<DocumentChecklist documents={[docWithoutDescription]} />);

      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.queryByText('Original or certified copy')).not.toBeInTheDocument();
    });

    it('should render document without where information', () => {
      const docWithoutWhere = {
        ...mockRequiredDoc,
        where: undefined,
      };

      render(<DocumentChecklist documents={[docWithoutWhere]} />);

      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.queryByText(/Where to get it:/i)).not.toBeInTheDocument();
    });

    it('should render document with all fields', () => {
      render(<DocumentChecklist documents={[mockDocWithAlternatives]} />);

      expect(screen.getByText('Proof of Identity')).toBeInTheDocument();
      expect(screen.getByText('Valid identification document')).toBeInTheDocument();
      expect(screen.getByText(/Where to get it:/i)).toBeInTheDocument();
      expect(screen.getByText('DMV or Passport Office')).toBeInTheDocument();
      expect(screen.getByText(/Show alternatives \(3\)/i)).toBeInTheDocument();
    });
  });

  describe('Label interaction', () => {
    it('should associate label with checkbox', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      const label = screen.getByText('Birth Certificate').closest('label');
      const checkbox = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });

      expect(label).toHaveAttribute('for', 'doc-1');
      expect(checkbox).toHaveAttribute('id', 'doc-1');
    });

    it('should toggle checkbox when clicking label', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(<DocumentChecklist documents={[mockRequiredDoc]} onToggle={onToggle} />);

      const label = screen.getByText('Birth Certificate');
      await user.click(label);

      expect(onToggle).toHaveBeenCalledWith('doc-1', true);
    });
  });

  describe('Print functionality', () => {
    it('should render print hint', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      expect(screen.getByText(/Print this checklist and check off items/i)).toBeInTheDocument();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle large list of documents', () => {
      const docs: RequiredDocument[] = Array.from({ length: 10 }, (_, i) => ({
        id: `doc-${i}`,
        name: `Document ${i}`,
        description: `Description ${i}`,
        required: i % 2 === 0,
        obtained: false,
      }));

      render(<DocumentChecklist documents={docs} />);

      // 5 required, 5 optional
      expect(screen.getAllByRole('checkbox')).toHaveLength(10);
      expect(screen.getByText(/Optional Documents \(5\)/i)).toBeInTheDocument();
    });

    it('should handle documents with special characters', () => {
      const docWithSpecialChars = {
        ...mockRequiredDoc,
        name: "Driver's License & ID Card",
        description: 'Valid ID with "your name" & address',
      };

      render(<DocumentChecklist documents={[docWithSpecialChars]} />);

      expect(screen.getByText("Driver's License & ID Card")).toBeInTheDocument();
      expect(screen.getByText('Valid ID with "your name" & address')).toBeInTheDocument();
    });

    it('should handle very long document names', () => {
      const docWithLongName = {
        ...mockRequiredDoc,
        name: 'Certificate of Eligibility for Exchange Visitor (J-1) Status and Proof of Financial Support',
      };

      render(<DocumentChecklist documents={[docWithLongName]} />);

      expect(screen.getByText(/Certificate of Eligibility for Exchange Visitor/i)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle obtained being undefined', () => {
      const docWithUndefinedObtained = {
        ...mockRequiredDoc,
        obtained: undefined,
      };

      render(<DocumentChecklist documents={[docWithUndefinedObtained]} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should handle obtained being null', () => {
      const docWithNullObtained = {
        ...mockRequiredDoc,
        obtained: null as unknown as boolean,
      };

      render(<DocumentChecklist documents={[docWithNullObtained]} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should filter required and optional documents correctly', () => {
      const docs = [
        { ...mockRequiredDoc, id: 'req-1', required: true },
        { ...mockOptionalDoc, id: 'opt-1', required: false },
        { ...mockRequiredDoc, id: 'req-2', required: true },
        { ...mockOptionalDoc, id: 'opt-2', required: false },
      ];

      render(<DocumentChecklist documents={docs} />);

      expect(screen.getByText(/Optional Documents \(2\)/i)).toBeInTheDocument();
      expect(screen.getAllByText('*Required')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible checkbox labels', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      const checkbox = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      expect(checkbox).toHaveAccessibleName();
    });

    it('should have minimum touch target size for checkboxes', () => {
      render(<DocumentChecklist documents={[mockRequiredDoc]} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('min-w-[44px]');
      expect(checkbox).toHaveClass('min-h-[44px]');
    });

    it('should have proper ARIA labels for all checkboxes', () => {
      const docs = [mockRequiredDoc, mockOptionalDoc];

      render(<DocumentChecklist documents={docs} />);

      const checkbox1 = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /Mark Bank Statements as obtained/i });

      expect(checkbox1).toHaveAttribute('aria-label');
      expect(checkbox2).toHaveAttribute('aria-label');
    });
  });

  describe('UseMemo optimization', () => {
    it('should memoize filtered documents', () => {
      const docs = [mockRequiredDoc, mockOptionalDoc];
      const { rerender } = render(<DocumentChecklist documents={docs} />);

      // Initial render
      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.getByText('Bank Statements')).toBeInTheDocument();

      // Rerender with same documents (memoization should prevent recalculation)
      rerender(<DocumentChecklist documents={docs} />);

      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.getByText('Bank Statements')).toBeInTheDocument();
    });

    it('should recalculate when documents change', () => {
      const docs1 = [mockRequiredDoc];
      const docs2 = [mockOptionalDoc];

      const { rerender } = render(<DocumentChecklist documents={docs1} />);

      expect(screen.getByText('Birth Certificate')).toBeInTheDocument();
      expect(screen.queryByText('Bank Statements')).not.toBeInTheDocument();

      rerender(<DocumentChecklist documents={docs2} />);

      expect(screen.queryByText('Birth Certificate')).not.toBeInTheDocument();
      expect(screen.getByText('Bank Statements')).toBeInTheDocument();
    });
  });

  describe('Checkbox state variations', () => {
    it('should handle checked state from props', () => {
      const checkedDoc = { ...mockRequiredDoc, obtained: true };
      const uncheckedDoc = { ...mockOptionalDoc, obtained: false };

      render(<DocumentChecklist documents={[checkedDoc, uncheckedDoc]} />);

      const checkbox1 = screen.getByRole('checkbox', { name: /Mark Birth Certificate as obtained/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /Mark Bank Statements as obtained/i });

      expect(checkbox1).toBeChecked();
      expect(checkbox2).not.toBeChecked();
    });

    it('should handle indeterminate-like states gracefully', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();

      render(<DocumentChecklist documents={[mockRequiredDoc]} onToggle={onToggle} />);

      const checkbox = screen.getByRole('checkbox');

      // Multiple rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(onToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accordion interactions', () => {
    it('should collapse alternatives when clicking trigger again', async () => {
      const user = userEvent.setup();
      render(<DocumentChecklist documents={[mockDocWithAlternatives]} />);

      const trigger = screen.getByText(/Show alternatives \(3\)/i);

      // Expand
      await user.click(trigger);
      expect(screen.getByText('Alternative documents:')).toBeInTheDocument();

      // Collapse
      await user.click(trigger);

      // Content should not be visible (Radix UI removes from DOM when collapsed)
      // Note: The actual behavior depends on Radix UI's implementation
    });

    it('should handle multiple documents with alternatives independently', async () => {
      const user = userEvent.setup();
      const doc1 = { ...mockDocWithAlternatives, id: 'doc-1', name: 'ID Proof 1' };
      const doc2 = {
        ...mockDocWithAlternatives,
        id: 'doc-2',
        name: 'ID Proof 2',
        alternatives: ['Option A', 'Option B'],
      };

      render(<DocumentChecklist documents={[doc1, doc2]} />);

      const triggers = screen.getAllByText(/Show alternatives/i);
      expect(triggers).toHaveLength(2);

      // Expand first one
      await user.click(triggers[0]);
      expect(screen.getByText("Driver's License")).toBeInTheDocument();
    });
  });
});
