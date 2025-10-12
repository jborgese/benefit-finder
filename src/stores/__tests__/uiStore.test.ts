/**
 * UI Store Tests
 *
 * Example test suite for the uiStore.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset to initial state
    const state = useUIStore.getState();
    state.closeAllModals();
    state.clearToasts();
    state.setLoading(false);
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      const { setLoading } = useUIStore.getState();

      setLoading(true, 'Loading...');

      const { isLoading, loadingMessage } = useUIStore.getState();
      expect(isLoading).toBe(true);
      expect(loadingMessage).toBe('Loading...');
    });

    it('should set loading with progress', () => {
      const { setLoading } = useUIStore.getState();

      setLoading(true, 'Processing...', 50);

      const { isLoading, loadingProgress } = useUIStore.getState();
      expect(isLoading).toBe(true);
      expect(loadingProgress).toBe(50);
    });

    it('should clear loading state', () => {
      const { setLoading } = useUIStore.getState();

      setLoading(true, 'Loading...');
      setLoading(false);

      const { isLoading, loadingMessage } = useUIStore.getState();
      expect(isLoading).toBe(false);
      expect(loadingMessage).toBe(null);
    });
  });

  describe('Modal Management', () => {
    it('should open a modal', () => {
      const { openModal } = useUIStore.getState();

      const modalId = openModal({
        type: 'confirm',
        title: 'Confirm Action',
      });

      const { modals } = useUIStore.getState();
      expect(modals).toHaveLength(1);
      expect(modals[0].id).toBe(modalId);
      expect(modals[0].type).toBe('confirm');
      expect(modals[0].title).toBe('Confirm Action');
    });

    it('should close a modal', () => {
      const { openModal, closeModal } = useUIStore.getState();

      const modalId = openModal({ type: 'info' });
      closeModal(modalId);

      const { modals } = useUIStore.getState();
      expect(modals).toHaveLength(0);
    });

    it('should close all modals', () => {
      const { openModal, closeAllModals } = useUIStore.getState();

      openModal({ type: 'info' });
      openModal({ type: 'confirm' });
      openModal({ type: 'alert' });

      closeAllModals();

      const { modals } = useUIStore.getState();
      expect(modals).toHaveLength(0);
    });

    it('should call onClose when modal is closed', () => {
      const onClose = vi.fn();
      const { openModal, closeModal } = useUIStore.getState();

      const modalId = openModal({ type: 'info', onClose });
      closeModal(modalId);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('should update modal data', () => {
      const { openModal, updateModal } = useUIStore.getState();

      const modalId = openModal({ type: 'info', title: 'Old Title' });
      updateModal(modalId, { title: 'New Title' });

      const { modals } = useUIStore.getState();
      expect(modals[0].title).toBe('New Title');
    });
  });

  describe('Toast Management', () => {
    it('should add a toast', () => {
      const { addToast } = useUIStore.getState();

      const toastId = addToast({
        type: 'success',
        message: 'Success!',
      });

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].id).toBe(toastId);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Success!');
    });

    it('should remove a toast', () => {
      const { addToast, removeToast } = useUIStore.getState();

      const toastId = addToast({ type: 'info', message: 'Info' });
      removeToast(toastId);

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(0);
    });

    it('should auto-remove toast after duration', () => {
      vi.useFakeTimers();

      const { addToast } = useUIStore.getState();

      addToast({
        type: 'success',
        message: 'Auto-remove',
        duration: 1000,
      });

      expect(useUIStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(1000);

      expect(useUIStore.getState().toasts).toHaveLength(0);

      vi.useRealTimers();
    });

    it('should clear all toasts', () => {
      const { addToast, clearToasts } = useUIStore.getState();

      addToast({ type: 'success', message: 'Toast 1' });
      addToast({ type: 'error', message: 'Toast 2' });
      addToast({ type: 'warning', message: 'Toast 3' });

      clearToasts();

      const { toasts } = useUIStore.getState();
      expect(toasts).toHaveLength(0);
    });
  });

  describe('Navigation State', () => {
    it('should toggle sidebar', () => {
      const { toggleSidebar } = useUIStore.getState();

      const initialState = useUIStore.getState().sidebarOpen;

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(!initialState);

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(initialState);
    });

    it('should set mobile menu state', () => {
      const { setMobileMenuOpen } = useUIStore.getState();

      setMobileMenuOpen(true);
      expect(useUIStore.getState().mobileMenuOpen).toBe(true);

      setMobileMenuOpen(false);
      expect(useUIStore.getState().mobileMenuOpen).toBe(false);
    });
  });
});

