import React, { useState, useEffect } from 'react';
import { useTranslationFeedback, createTranslationFeedback, createTranslationIssue } from '../i18n/feedback';
import { useI18n } from '../i18n/hooks';
import { Button } from './Button';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { Cross1Icon, ChatBubbleIcon, DownloadIcon } from '@radix-ui/react-icons';

interface TranslationFeedbackProps {
  translationKey: string;
  currentText: string;
  context?: string;
}

/**
 * Component for providing feedback on translations
 */
export const TranslationFeedback: React.FC<TranslationFeedbackProps> = ({
  translationKey,
  currentText,
  context,
}) => {
  const { currentLanguage } = useI18n();
  const { submitFeedback, reportIssue, exportFeedback, getStatistics } = useTranslationFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'issue'>('suggestion');
  const [suggestedText, setSuggestedText] = useState('');
  const [reason, setReason] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statistics, setStatistics] = useState<{
    totalFeedback: number;
    totalIssues: number;
    recentActivity: number;
  } | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      const stats = await getStatistics();
      setStatistics(stats);
    };
    loadStatistics();
  }, [getStatistics]);

  const handleSubmitFeedback = async () => {
    if (!suggestedText.trim() || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      const feedback = createTranslationFeedback(
        currentLanguage,
        translationKey,
        currentText,
        suggestedText,
        reason,
        context
      );
      await submitFeedback(feedback);
      setIsOpen(false);
      setSuggestedText('');
      setReason('');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const issue = createTranslationIssue(
        currentLanguage,
        translationKey,
        issueDescription,
        severity,
        context
      );
      await reportIssue(issue);
      setIsOpen(false);
      setIssueDescription('');
    } catch (error) {
      console.error('Failed to report issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportFeedback = async () => {
    try {
      const feedbackData = await exportFeedback();
      const blob = new Blob([feedbackData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation-feedback-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export feedback:', error);
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <button
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Provide translation feedback"
            title="Provide translation feedback"
          >
            <ChatBubbleIcon className="w-3 h-3" />
            <span>Feedback</span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Translation Feedback
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Feedback Type</label>
                <Select.Root value={feedbackType} onValueChange={(value: 'suggestion' | 'issue') => setFeedbackType(value)}>
                  <Select.Trigger className="w-full p-2 border border-gray-300 rounded-md">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg">
                      <Select.Viewport className="p-1">
                        <Select.Item value="suggestion" className="p-2 hover:bg-gray-100 cursor-pointer">
                          <Select.ItemText>Suggestion</Select.ItemText>
                        </Select.Item>
                        <Select.Item value="issue" className="p-2 hover:bg-gray-100 cursor-pointer">
                          <Select.ItemText>Issue Report</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Translation Key</label>
                <code className="block p-2 bg-gray-100 rounded text-sm">{translationKey}</code>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Text</label>
                <div className="p-2 bg-gray-100 rounded text-sm">{currentText}</div>
              </div>

              {feedbackType === 'suggestion' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Suggested Translation</label>
                    <textarea
                      value={suggestedText}
                      onChange={(e) => setSuggestedText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Enter your suggested translation..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason</label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={2}
                      placeholder="Explain why this translation would be better..."
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Issue Description</label>
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Describe the issue with this translation..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Severity</label>
                    <Select.Root value={severity} onValueChange={(value: 'low' | 'medium' | 'high') => setSeverity(value)}>
                      <Select.Trigger className="w-full p-2 border border-gray-300 rounded-md">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg">
                          <Select.Viewport className="p-1">
                            <Select.Item value="low" className="p-2 hover:bg-gray-100 cursor-pointer">
                              <Select.ItemText>Low</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="medium" className="p-2 hover:bg-gray-100 cursor-pointer">
                              <Select.ItemText>Medium</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="high" className="p-2 hover:bg-gray-100 cursor-pointer">
                              <Select.ItemText>High</Select.ItemText>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </>
              )}

              {statistics && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Community feedback: {statistics.totalFeedback} suggestions, {statistics.totalIssues} issues
                  {statistics.recentActivity > 0 && ` (${statistics.recentActivity} this week)`}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={handleExportFeedback}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <DownloadIcon className="w-4 h-4" />
                Export
              </button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={feedbackType === 'suggestion' ? handleSubmitFeedback : handleReportIssue}
                  disabled={isSubmitting || (feedbackType === 'suggestion' ? !suggestedText.trim() || !reason.trim() : !issueDescription.trim())}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close"
              >
                <Cross1Icon className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default TranslationFeedback;
