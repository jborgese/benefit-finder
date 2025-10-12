import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/db': path.resolve(__dirname, './src/db'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/test': path.resolve(__dirname, './src/test'),
    },
  },
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunks will be configured when features are integrated into the app
        // For now, let Vite handle automatic code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
});
