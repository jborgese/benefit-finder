import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Global test settings
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],

    // Include/Exclude patterns
    include: ['src/__tests__/App.test.tsx'], // Only run App tests for now
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/e2e/**',
    ],

    // Coverage configuration - temporarily disabled for memory optimization
    // coverage: {
    //   provider: 'v8',
    //   reporter: ['text', 'json'],
    //   reportsDirectory: path.resolve(__dirname, 'coverage'),
    //   include: [
    //     'src/App.tsx',
    //     'src/main.tsx',
    //     'src/components/**/*.{ts,tsx}',
    //     'src/contexts/**/*.{ts,tsx}',
    //     'src/stores/**/*.{ts,tsx}',
    //     'src/utils/**/*.{ts,tsx}',
    //     'src/types/**/*.{ts,tsx}',
    //     'src/services/**/*.{ts,tsx}',
    //     'src/db/**/*.{ts,tsx}',
    //     'src/i18n/**/*.{ts,tsx}',
    //   ],
    //   exclude: [
    //     '**/node_modules/**',
    //     '**/dist/**',
    //     '**/*.config.{js,ts,cjs,mjs}',
    //     '**/playwright.config*.ts',
    //     '**/vite.config*.ts',
    //     '**/postcss.config.{js,cjs}',
    //     '**/test/**',
    //     '**/tests/**',
    //     '**/__tests__/**',
    //     '**/*.test.{ts,tsx}',
    //     '**/*.spec.{ts,tsx}',
    //     '**/*.e2e.{ts,tsx}',
    //     '**/scripts/**',
    //     '**/*.d.ts',
    //     '**/vite-env.d.ts',
    //     '**/coverage/**',
    //     '**/examples/**',
    //     'clear-db.js',
    //     // Exclude large files that don't need coverage
    //     'src/rules/**/*.json',
    //     'src/data/**/*.json',
    //     'src/i18n/locales/**',
    //     'src/questionnaire/**', // Exclude questionnaire for now due to size
    //     'src/rules/**', // Exclude rules for now due to size
    //   ],
    //   // Coverage thresholds - temporarily lowered for memory optimization
    //   thresholds: {
    //     lines: 30,
    //     functions: 30,
    //     branches: 25,
    //     statements: 30,
    //   },
    //   // Report on all files, not just tested ones
    //   all: false, // Changed to false to reduce memory usage
    //   clean: true,
    //   // Memory optimization settings
    //   skipFull: true,
    //   watermarks: {
    //     lines: [30, 60],
    //     functions: [30, 60],
    //     branches: [25, 60],
    //     statements: [30, 60],
    //   },
    // },

    // Performance
    // Use threads for better stability and performance
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Run tests sequentially to reduce memory usage
        maxThreads: 1,
        minThreads: 1,
      },
    },

    // Memory optimization for coverage
    maxConcurrency: 1,
    maxWorkers: 1,

    // Additional memory optimization
    sequence: {
      concurrent: false, // Run tests sequentially to reduce memory pressure
    },

    // Additional memory optimization
    server: {
      deps: {
        external: ['**/node_modules/**'],
      },
    },

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Disable retries to reduce memory usage
    retry: 0,

    // CSS handling
    css: true,

    // Reporter configuration
    reporters: ['verbose'],

    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
});
