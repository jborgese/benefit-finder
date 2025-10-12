/**
 * UI Store
 * 
 * Manages ephemeral UI state like modals, toasts, loading states.
 * This data is not persisted and resets on page reload.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // milliseconds, undefined = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  type: string;
  title?: string;
  data?: Record<string, unknown>;
  onClose?: () => void;
}

export interface UIState {
  // Loading States
  isLoading: boolean;
  loadingMessage: string | null;
  loadingProgress: number | null; // 0-100 or null for indeterminate
  
  // Modals
  modals: Modal[];
  
  // Toasts/Notifications
  toasts: Toast[];
  
  // Sidebar/Navigation
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Misc UI State
  focusTrapEnabled: boolean;
  
  // Actions - Loading
  setLoading: (
    isLoading: boolean,
    message?: string,
    progress?: number | null
  ) => void;
  
  // Actions - Modals
  openModal: (modal: Omit<Modal, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  updateModal: (id: string, data: Partial<Modal>) => void;
  
  // Actions - Toasts
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Actions - Navigation
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  
  // Actions - Misc
  setFocusTrap: (enabled: boolean) => void;
}

let toastIdCounter = 0;
let modalIdCounter = 0;

const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}-${Date.now()}`;
};

const generateModalId = (): string => {
  modalIdCounter += 1;
  return `modal-${modalIdCounter}-${Date.now()}`;
};

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial State
      isLoading: false,
      loadingMessage: null,
      loadingProgress: null,
      modals: [],
      toasts: [],
      sidebarOpen: true,
      mobileMenuOpen: false,
      focusTrapEnabled: false,
      
      // Loading Actions
      setLoading: (isLoading, message = null, progress = null) =>
        set({
          isLoading,
          loadingMessage: message,
          loadingProgress: progress,
        }),
      
      // Modal Actions
      openModal: (modal) => {
        const id = generateModalId();
        
        set((state) => ({
          modals: [...state.modals, { ...modal, id }],
          focusTrapEnabled: true,
        }));
        
        return id;
      },
      
      closeModal: (id) =>
        set((state) => {
          const modal = state.modals.find((m) => m.id === id);
          
          if (modal?.onClose) {
            modal.onClose();
          }
          
          const newModals = state.modals.filter((m) => m.id !== id);
          
          return {
            modals: newModals,
            focusTrapEnabled: newModals.length > 0,
          };
        }),
      
      closeAllModals: () =>
        set((state) => {
          state.modals.forEach((modal) => {
            if (modal.onClose) {
              modal.onClose();
            }
          });
          
          return {
            modals: [],
            focusTrapEnabled: false,
          };
        }),
      
      updateModal: (id, data) =>
        set((state) => ({
          modals: state.modals.map((modal) =>
            modal.id === id ? { ...modal, ...data } : modal
          ),
        })),
      
      // Toast Actions
      addToast: (toast) => {
        const id = generateToastId();
        
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        
        // Auto-remove toast after duration
        if (toast.duration !== undefined && toast.duration > 0) {
          setTimeout(() => {
            set((state) => ({
              toasts: state.toasts.filter((t) => t.id !== id),
            }));
          }, toast.duration);
        }
        
        return id;
      },
      
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      
      clearToasts: () => set({ toasts: [] }),
      
      // Navigation Actions
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      
      toggleMobileMenu: () =>
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      
      // Misc Actions
      setFocusTrap: (focusTrapEnabled) => set({ focusTrapEnabled }),
    }),
    { name: 'UIStore' }
  )
);

