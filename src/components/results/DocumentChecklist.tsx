/**
 * Document Checklist Component
 *
 * Displays and manages required documents checklist
 */

import React from 'react';
import { RequiredDocument } from './types';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Accordion from '@radix-ui/react-accordion';

interface DocumentChecklistProps {
  documents: RequiredDocument[];
  onToggle?: (documentId: string, obtained: boolean) => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents,
  onToggle,
}) => {
  const requiredDocs = documents.filter(d => d.required);
  const optionalDocs = documents.filter(d => !d.required);

  const handleCheckboxChange = (documentId: string, checked: boolean): void => {
    if (onToggle) {
      onToggle(documentId, checked);
    }
  };

  const renderDocument = (doc: RequiredDocument): React.JSX.Element => (
    <div
      key={doc.id}
      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors print:break-inside-avoid"
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1 print:hidden">
          <Checkbox.Root
            id={doc.id}
            checked={doc.obtained ?? false}
            onCheckedChange={(checked) => handleCheckboxChange(doc.id, checked === true)}
            className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center bg-white hover:border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-colors"
          >
            <Checkbox.Indicator>
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </Checkbox.Indicator>
          </Checkbox.Root>
        </div>

        {/* Document Info */}
        <div className="flex-1">
          <label
            htmlFor={doc.id}
            className="block font-semibold text-gray-900 cursor-pointer"
          >
            {doc.name}
            {doc.required && (
              <span className="ml-2 text-xs font-normal text-red-600">
                *Required
              </span>
            )}
          </label>

          {doc.description && (
            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
          )}

          {/* Alternatives */}
          {doc.alternatives && doc.alternatives.length > 0 && (
            <Accordion.Root type="single" collapsible>
              <Accordion.Item value="alternatives">
                <Accordion.Header>
                  <Accordion.Trigger className="text-xs text-blue-600 hover:text-blue-800 mt-2 flex items-center">
                    <span>Show alternatives ({doc.alternatives.length})</span>
                    <span className="ml-1">▼</span>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="mt-2">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-700">Alternative documents:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      {doc.alternatives.map((alt, index) => (
                        <li key={index}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          )}

          {/* Where to obtain */}
          {doc.where && (
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="font-medium mr-1">Where to get it:</span>
              {doc.where}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-sm text-gray-600">
        <p>
          You&apos;ll need to provide the following documents when applying.
          Check off each item as you gather it.
        </p>
      </div>

      {/* Required Documents */}
      {requiredDocs.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="text-red-600 mr-2">*</span>
            Required Documents ({requiredDocs.length})
          </h4>
          <div className="space-y-3">
            {requiredDocs.map(renderDocument)}
          </div>
        </div>
      )}

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Optional Documents ({optionalDocs.length})
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            These documents may strengthen your application but are not required.
          </p>
          <div className="space-y-3">
            {optionalDocs.map(renderDocument)}
          </div>
        </div>
      )}

      {/* Print hint */}
      <div className="hidden print:block text-sm text-gray-600 border-t pt-3 mt-4">
        <p>Print this checklist and check off items as you gather them.</p>
      </div>
    </div>
  );
};

export default DocumentChecklist;

