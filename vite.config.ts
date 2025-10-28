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
        // Optimized chunking strategy for better performance
        manualChunks: (id) => {
          // Core application code - keep minimal
          if (id.includes('src/App.tsx') || id.includes('src/main.tsx')) {
            return 'app-core';
          }

          // React vendor bundle
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'react-vendor';
          }

          // UI components - separate chunk for better caching
          if (id.includes('src/components/')) {
            return 'ui-components';
          }

          // Radix UI components
          if (id.includes('@radix-ui/')) {
            return 'radix-ui';
          }

          // Rules engine - core functionality
          if (id.includes('src/rules/core/')) {
            return 'rules-engine';
          }

          // Federal rules - load on demand
          if (id.includes('src/rules/federal/')) {
            return 'rules-federal';
          }

          // State rules - load on demand (will be split further by state)
          if (id.includes('src/rules/state/')) {
            // Extract state name from path for more granular splitting
            const stateMatch = id.match(/src\/rules\/state\/([^\/]+)/);
            if (stateMatch) {
              return `rules-state-${stateMatch[1]}`;
            }
            return 'rules-state';
          }

          // Database - separate chunk
          if (id.includes('src/db/') || id.includes('rxdb') || id.includes('dexie')) {
            return 'database';
          }

          // State management
          if (id.includes('zustand') || id.includes('immer')) {
            return 'state-management';
          }

          // Utilities
          if (id.includes('src/utils/') || id.includes('zod') || id.includes('nanoid') || id.includes('crypto-js')) {
            return 'utils';
          }

          // Rule evaluation engine
          if (id.includes('json-logic-js')) {
            return 'rule-evaluation';
          }

          // Visualization libraries - lazy load candidates
          if (id.includes('reactflow') || id.includes('elkjs')) {
            return 'visualization';
          }

          // Internationalization
          if (id.includes('i18next') || id.includes('src/i18n/')) {
            return 'i18n';
          }

          // Questionnaire system
          if (id.includes('src/questionnaire/')) {
            return 'questionnaire';
          }

          // Services
          if (id.includes('src/services/')) {
            return 'services';
          }

          // Default vendor chunk for other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500, // Reduced from 1500 for better optimization awareness
    target: 'es2020', // Modern target for better optimization
    minify: 'esbuild', // Fast minification
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'json-logic-js',
      'zustand',
      'zod',
      'nanoid',
      'crypto-js',
      'dexie',
      'rxdb'
    ]
  }
});
