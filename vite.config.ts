import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
// Removed unused imports for better linting

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
        // Generate deterministic file names with content hashes for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Manual chunking to optimize bundle sizes
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('rxdb') || id.includes('dexie')) {
              return 'vendor-rxdb';
            }
            if (id.includes('zustand') || id.includes('zod')) {
              return 'vendor-ui';
            }
            if (id.includes('i18next') || id.includes('react-i18next') || id.includes('i18next-browser-languagedetector')) {
              return 'vendor-i18n';
            }
            if (id.includes('json-logic-js')) {
              return 'vendor-logic';
            }
            if (id.includes('crypto-js') || id.includes('nanoid')) {
              return 'vendor-crypto';
            }
          }
          
          // Feature-based chunks - use dynamic detection to avoid circular dependencies
          if (id.includes('/src/rules/') && !id.includes('node_modules')) {
            return 'rules';
          }
          if (id.includes('/src/db/') && !id.includes('node_modules')) {
            return 'database';
          }
          if (id.includes('/src/components/results/') && !id.includes('node_modules')) {
            return 'components-results';
          }
          if (id.includes('/src/questionnaire/') && !id.includes('node_modules')) {
            return 'components-questionnaire';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500, // Reduced from 1500 for better optimization awareness
    target: 'es2020', // Modern target for better optimization
    // Switch to terser and keep names to reduce TDZ-related issues
    minify: 'terser',
    terserOptions: {
      keep_fnames: true,
      keep_classnames: true,
      compress: {
        unsafe_arrows: false,
        reduce_vars: false,
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    // Add build timestamp for cache busting (moved to top-level `define` below)
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
      'rxdb',
      'rxdb/plugins/storage-dexie',
      'rxdb/plugins/dev-mode',
      'rxdb/plugins/query-builder',
      'rxdb/plugins/update',
      'rxdb/plugins/migration-schema',
      'rxdb/plugins/validate-ajv',
      'rxdb/plugins/encryption-crypto-js',
      // i18n modules - ensure they're pre-bundled together
      'i18next',
      'react-i18next',
      'i18next-browser-languagedetector',
      // validation modules - ensure they're pre-bundled together
      'zod',
      'ajv'
    ]
  }
  ,
  // Top-level defines are applied by Vite globally
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.1.0'),
  }
});
