import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          'reactflow-vendor': ['reactflow'],
          'argdown-vendor': ['@argdown/core'],
          'state-vendor': ['zustand', 'immer'],
          'utils-vendor': ['nanoid', 'zod', 'dexie', 'rxdb'],
          'export-vendor': ['html-to-image', 'dom-to-svg'],
          'radix-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          'backend-vendor': ['isomorphic-dompurify'],
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
});