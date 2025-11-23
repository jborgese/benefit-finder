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
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-rxdb': ['rxdb', 'dexie'],
          'vendor-ui': ['zustand', 'zod'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-logic': ['json-logic-js'],
          'vendor-crypto': ['crypto-js', 'nanoid'],
          // Feature-based chunks
          'rules': [
            './src/rules/index.ts',
            './src/rules/core/evaluator.ts',
            './src/rules/dynamic-loader.ts'
          ],
          'database': [
            './src/db/database.ts',
            './src/db/utils.ts',
            './src/db/schemas.ts'
          ],
          'components-results': [
            './src/components/results/index.ts',
            './src/components/results/ResultsSummary.tsx',
            './src/components/results/ProgramCard.tsx'
          ],
          'components-questionnaire': [
            './src/questionnaire/index.ts',
            './src/questionnaire/ui/EnhancedQuestionnaire.tsx',
            './src/questionnaire/flow-engine.ts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500, // Reduced from 1500 for better optimization awareness
    target: 'es2020', // Modern target for better optimization
    minify: 'esbuild', // Fast minification
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
