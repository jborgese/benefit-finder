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
    minify: 'swc' as unknown as 'terser',
    sourcemap: false, // Disable for production

    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for better caching and smaller chunks
        manualChunks: (id) => {
          if (!id) return undefined;

          // Vendor splitting - more granular
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
            if (id.includes('react-dom')) return 'react-dom-vendor';

            // Radix UI splits
            if (id.includes('@radix-ui')) {
              if (id.includes('dialog') || id.includes('alert-dialog')) return 'radix-dialogs';
              if (id.includes('dropdown') || id.includes('select') || id.includes('popover')) return 'radix-menus';
              return 'radix-ui';
            }

            if (id.includes('rxdb/plugins')) return 'vendor-rxdb-plugins';
            if (id.includes('rxdb')) return 'vendor-rxdb-core';
            if (id.includes('dexie')) return 'vendor-dexie';
            if (id.includes('json-logic-js')) return 'vendor-logic';
            if (id.includes('zod')) return 'vendor-zod';
            if (id.includes('ajv')) return 'vendor-ajv';
            if (id.includes('crypto-js')) return 'vendor-crypto';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';
            if (id.includes('reactflow') || id.includes('elkjs')) return 'vendor-visualization';
            if (id.includes('nanoid') || id.includes('date-fns') || id.includes('lodash')) return 'vendor-utils';

            return 'vendor';
          }

          // Application splits - rules by state and feature
          if (id.includes('/src/rules/state/california/') || id.includes('/rules/state/california/')) return 'rules-california';
          if (id.includes('/src/rules/state/florida/') || id.includes('/rules/state/florida/')) return 'rules-florida';
          if (id.includes('/src/rules/state/georgia/') || id.includes('/rules/state/georgia/')) return 'rules-georgia';
          if (id.includes('/src/rules/federal/') || id.includes('/rules/federal/')) return 'rules-federal';

          // Large components
          if (id.includes('/src/components/results/ProgramCard') || id.includes('/components/results/ProgramCard')) return 'component-program-card';
          if (id.includes('/src/components/results/') || id.includes('/components/results/')) return 'components-results';
          if (id.includes('/src/components/questionnaire/') || id.includes('/components/questionnaire/')) return 'components-questionnaire';

          // DB related code
          if (id.includes('/src/db/') || id.includes('/db/')) return 'database';

          return undefined;
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

