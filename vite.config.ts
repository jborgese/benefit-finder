import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Helper functions to reduce cognitive complexity
const getChunkForSrcPath = (id: string): string | null => {
  const srcPathMappings = [
    { pattern: 'src/App.tsx', chunk: 'app-core' },
    { pattern: 'src/main.tsx', chunk: 'app-core' },
    { pattern: 'src/components/', chunk: 'ui-components' },
    { pattern: 'src/rules/core/', chunk: 'rules-engine' },
    { pattern: 'src/rules/federal/', chunk: 'rules-federal' },
    { pattern: 'src/rules/state/', chunk: 'rules-state' },
    { pattern: 'src/db/', chunk: 'database' },
    { pattern: 'src/utils/', chunk: 'utils' },
    { pattern: 'src/i18n/', chunk: 'i18n' },
    { pattern: 'src/questionnaire/', chunk: 'questionnaire' },
    { pattern: 'src/services/', chunk: 'services' }
  ];

  for (const mapping of srcPathMappings) {
    if (id.includes(mapping.pattern)) {
      return mapping.chunk;
    }
  }
  return null;
};

const getChunkForLibrary = (id: string): string | null => {
  const libraryMappings = [
    { patterns: ['react', 'react-dom', 'react-router-dom'], chunk: 'react-vendor' },
    { patterns: ['@radix-ui/'], chunk: 'radix-ui' },
    { patterns: ['rxdb', 'dexie'], chunk: 'database' },
    { patterns: ['zustand', 'immer'], chunk: 'state-management' },
    { patterns: ['zod', 'nanoid', 'crypto-js'], chunk: 'utils' },
    { patterns: ['json-logic-js'], chunk: 'rule-evaluation' },
    { patterns: ['reactflow', 'elkjs'], chunk: 'visualization' },
    { patterns: ['i18next'], chunk: 'i18n' }
  ];

  for (const mapping of libraryMappings) {
    if (mapping.patterns.some(pattern => id.includes(pattern))) {
      return mapping.chunk;
    }
  }
  return null;
};

const getChunkForVendorLibrary = (id: string): string | null => {
  const vendorMappings = [
    { patterns: ['reactflow', 'elkjs'], chunk: 'visualization' },
    { patterns: ['chart', 'd3', 'plotly'], chunk: 'charts' },
    { patterns: ['date-fns', 'moment', 'dayjs'], chunk: 'date-utils' },
    { patterns: ['yup', 'joi', 'ajv'], chunk: 'validation' },
    { patterns: ['sharp', 'canvas', 'jimp'], chunk: 'image-processing' }
  ];

  for (const mapping of vendorMappings) {
    if (mapping.patterns.some(pattern => id.includes(pattern))) {
      return mapping.chunk;
    }
  }
  return 'vendor';
};

const getStateSpecificChunk = (id: string): string | null => {
  if (id.includes('src/rules/state/')) {
    const stateMatch = id.match(/src\/rules\/state\/([^/]+)/);
    return stateMatch ? `rules-state-${stateMatch[1]}` : 'rules-state';
  }
  return null;
};

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
          // Check for state-specific rules first
          const stateChunk = getStateSpecificChunk(id);
          if (stateChunk) return stateChunk;

          // Check source path mappings
          const srcChunk = getChunkForSrcPath(id);
          if (srcChunk) return srcChunk;

          // Check library mappings
          const libChunk = getChunkForLibrary(id);
          if (libChunk) return libChunk;

          // Handle vendor libraries
          if (id.includes('node_modules')) {
            return getChunkForVendorLibrary(id);
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
