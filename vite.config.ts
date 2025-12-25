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
        // Simplified manual chunking: force a single `vendor` chunk for all node_modules.
        // This avoids cross-chunk circular dependencies that can leave module exports
        // undefined during ESM initialization (e.g., `react_production_min`).
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        }
      }
    },
    chunkSizeWarningLimit: 500, // Reduced from 1500 for better optimization awareness
    target: 'es2020', // Modern target for better optimization
    // Switched to @swc/core for better performance and security (no vulnerable dependencies)
    minify: 'swc' as unknown as 'terser',
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
