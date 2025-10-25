/**
 * Keyboard Navigation Tests
 *
 * Tests for standardized keyboard navigation across questionnaire components
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SelectInput } from '../questionnaire/components/SelectInput';
import { MultiSelectInput } from '../questionnaire/components/MultiSelectInput';
import { NumberInput } from '../questionnaire/components/NumberInput';

const mockQuestion = {
  id: 'test-question',
  text: 'Test Question',
  inputType: 'radio' as const,
  fieldName: 'test',
  required: true,
};

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Keyboard Navigation', () => {
  describe('SelectInput (Radio)', () => {
    it('navigates between options with arrow keys', () => {
      const onChange = jest.fn();
      render(
        <SelectInput
          question={mockQuestion}
          value=""
          options={mockOptions}
          onChange={onChange}
          variant="radio"
        />
      );

      const firstOption = screen.getByRole('radio', { name: 'Option 1' });
      firstOption.focus();

      // Test arrow down navigation
      fireEvent.keyDown(firstOption, { key: 'ArrowDown' });
      const secondOption = screen.getByRole('radio', { name: 'Option 2' });
      expect(secondOption).toHaveFocus();

      // Test arrow up navigation
      fireEvent.keyDown(secondOption, { key: 'ArrowUp' });
      expect(firstOption).toHaveFocus();
    });

    it('selects option with Enter key', () => {
      const onChange = jest.fn();
      render(
        <SelectInput
          question={mockQuestion}
          value=""
          options={mockOptions}
          onChange={onChange}
          variant="radio"
        />
      );

      const firstOption = screen.getByRole('radio', { name: 'Option 1' });
      firstOption.focus();

      fireEvent.keyDown(firstOption, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith('option1');
    });

    it('wraps navigation at boundaries', () => {
      const onChange = jest.fn();
      render(
        <SelectInput
          question={mockQuestion}
          value=""
          options={mockOptions}
          onChange={onChange}
          variant="radio"
        />
      );

      const firstOption = screen.getByRole('radio', { name: 'Option 1' });
      const lastOption = screen.getByRole('radio', { name: 'Option 3' });

      firstOption.focus();

      // Test wrap from first to last
      fireEvent.keyDown(firstOption, { key: 'ArrowUp' });
      expect(lastOption).toHaveFocus();

      // Test wrap from last to first
      fireEvent.keyDown(lastOption, { key: 'ArrowDown' });
      expect(firstOption).toHaveFocus();
    });

    it('jumps to first/last with Home/End keys', () => {
      const onChange = jest.fn();
      render(
        <SelectInput
          question={mockQuestion}
          value=""
          options={mockOptions}
          onChange={onChange}
          variant="radio"
        />
      );

      const firstOption = screen.getByRole('radio', { name: 'Option 1' });
      const lastOption = screen.getByRole('radio', { name: 'Option 3' });

      firstOption.focus();

      // Test End key
      fireEvent.keyDown(firstOption, { key: 'End' });
      expect(lastOption).toHaveFocus();

      // Test Home key
      fireEvent.keyDown(lastOption, { key: 'Home' });
      expect(firstOption).toHaveFocus();
    });
  });

  describe('MultiSelectInput (Checkbox)', () => {
    it('navigates between options with arrow keys', () => {
      const onChange = jest.fn();
      render(
        <MultiSelectInput
          question={mockQuestion}
          value={[]}
          options={mockOptions}
          onChange={onChange}
          variant="checkbox"
        />
      );

      const firstOption = screen.getByRole('checkbox', { name: 'Option 1' });
      firstOption.focus();

      // Test arrow down navigation
      fireEvent.keyDown(firstOption, { key: 'ArrowDown' });
      const secondOption = screen.getByRole('checkbox', { name: 'Option 2' });
      expect(secondOption).toHaveFocus();
    });

    it('toggles option with Enter key', () => {
      const onChange = jest.fn();
      render(
        <MultiSelectInput
          question={mockQuestion}
          value={[]}
          options={mockOptions}
          onChange={onChange}
          variant="checkbox"
        />
      );

      const firstOption = screen.getByRole('checkbox', { name: 'Option 1' });
      firstOption.focus();

      fireEvent.keyDown(firstOption, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(['option1']);
    });
  });

  describe('MultiSelectInput (Pills)', () => {
    it('navigates between pill buttons with arrow keys', () => {
      const onChange = jest.fn();
      render(
        <MultiSelectInput
          question={mockQuestion}
          value={[]}
          options={mockOptions}
          onChange={onChange}
          variant="pills"
        />
      );

      const firstPill = screen.getByRole('button', { name: 'Option 1' });
      firstPill.focus();

      // Test arrow down navigation
      fireEvent.keyDown(firstPill, { key: 'ArrowDown' });
      const secondPill = screen.getByRole('button', { name: 'Option 2' });
      expect(secondPill).toHaveFocus();
    });

    it('toggles pill with Enter key', () => {
      const onChange = jest.fn();
      render(
        <MultiSelectInput
          question={mockQuestion}
          value={[]}
          options={mockOptions}
          onChange={onChange}
          variant="pills"
        />
      );

      const firstPill = screen.getByRole('button', { name: 'Option 1' });
      firstPill.focus();

      fireEvent.keyDown(firstPill, { key: 'Enter' });
      expect(onChange).toHaveBeenCalledWith(['option1']);
    });
  });

  describe('NumberInput', () => {
    it('increments/decrements with arrow keys', () => {
      const onChange = jest.fn();
      render(
        <NumberInput
          question={mockQuestion}
          value={5}
          onChange={onChange}
          showSteppers
        />
      );

      const input = screen.getByRole('spinbutton');
      input.focus();

      // Test arrow up
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(onChange).toHaveBeenCalledWith(6);

      // Test arrow down
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(onChange).toHaveBeenCalledWith(4);
    });
  });
});
