/**
 * Vite Performance Configuration
 *
 * Optimized build configuration for production with bundle analysis
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),

    // Bundle analyzer - generates stats.html
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // or 'sunburst', 'network'
    }),
  ],

  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false, // Disable for production

    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Vendor splitting
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            
            // Radix UI components - split by usage
            if (id.includes('@radix-ui')) {
              // Split frequently used components
              if (id.includes('dialog') || id.includes('alert-dialog')) {
                return 'radix-dialogs';
              }
              if (id.includes('dropdown') || id.includes('select') || id.includes('popover')) {
                return 'radix-menus';
              }
              return 'radix-ui';
            }
            
            // Database - split RxDB and Dexie separately
            if (id.includes('rxdb')) {
              return 'database-rxdb';
            }
            if (id.includes('dexie')) {
              return 'database-dexie';
            }
            
            // State management
            if (id.includes('zustand') || id.includes('immer')) {
              return 'state';
            }
            
            // Visualization (lazy load candidates)
            if (id.includes('reactflow') || id.includes('elkjs')) {
              return 'visualization';
            }
            
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n';
            }
            
            // Rule engine
            if (id.includes('json-logic-js')) {
              return 'rules-engine';
            }
            
            // Validation
            if (id.includes('zod')) {
              return 'validation';
            }
            
            // Crypto utilities
            if (id.includes('crypto-js')) {
              return 'crypto';
            }
            
            // Other utilities
            if (id.includes('nanoid') || id.includes('date-fns') || id.includes('lodash')) {
              return 'utils';
            }
            
            // Default vendor chunk for other dependencies
            return 'vendor';
          }
          
          // Application code splitting
          // Split rule definitions by state
          if (id.includes('/rules/state/california/')) {
            return 'rules-california';
          }
          if (id.includes('/rules/state/florida/')) {
            return 'rules-florida';
          }
          if (id.includes('/rules/state/georgia/')) {
            return 'rules-georgia';
          }
          if (id.includes('/rules/federal/')) {
            return 'rules-federal';
          }
          
          // Split large components
          if (id.includes('/components/results/ProgramCard')) {
            return 'component-program-card';
          }
          if (id.includes('/components/onboarding/')) {
            return 'component-onboarding';
          }
        },
      },
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500 KB warning threshold

    // Compression
    reportCompressedSize: true,
  },

  // Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'json-logic-js',
      'zustand',
    ],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // Performance hints
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
});

