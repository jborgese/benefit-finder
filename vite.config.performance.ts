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
        manualChunks: {
          // React vendor bundle
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI components vendor
          'radix-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],

          // Database vendor
          'database': ['rxdb', 'dexie'],

          // State management
          'state': ['zustand', 'immer'],

          // Flow visualization (lazy load candidates)
          'visualization': ['reactflow', 'elkjs'],

          // Rule engine
          'rules': ['json-logic-js'],

          // Utilities
          'utils': ['zod', 'nanoid', 'crypto-js'],
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

