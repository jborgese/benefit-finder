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
          // Advanced chunking strategy for maximum optimization
          manualChunks: (id) => {
            // Check for state-specific rules first
            const stateChunk = getStateSpecificChunk(id);
            if (stateChunk) return stateChunk;

            // Check advanced source path mappings
            const srcChunk = getAdvancedChunkForSrcPath(id);
            if (srcChunk) return srcChunk;

            // Check advanced library mappings
            const libChunk = getAdvancedChunkForLibrary(id);
            if (libChunk) return libChunk;

            // Handle vendor libraries with advanced strategy
            if (id.includes('node_modules')) {
              return getAdvancedChunkForVendorLibrary(id);
            }

            return undefined;
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
