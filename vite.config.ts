import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import {
  getAdvancedChunkForSrcPath,
  getAdvancedChunkForLibrary,
  getAdvancedChunkForVendorLibrary,
  getStateSpecificChunk
} from './src/utils/advancedChunking';

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
          // Disable chunking entirely to avoid module loading issues
          // Let Vite handle chunking automatically
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
});
