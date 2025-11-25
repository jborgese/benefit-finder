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
    include: [
      'src/__tests__/**/*.test.{ts,tsx}',
      'src/**/__tests__/**/*.test.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/e2e/**',
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: path.resolve(__dirname, 'coverage'),
      include: [
        'src/App.tsx',
        'src/components/**/*.{ts,tsx}',
        'src/contexts/**/*.{ts,tsx}',
        'src/stores/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.{js,ts,cjs,mjs}',
        '**/playwright.config*.ts',
        '**/vite.config*.ts',
        '**/postcss.config.{js,cjs}',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.e2e.{ts,tsx}',
        '**/scripts/**',
        '**/*.d.ts',
        '**/vite-env.d.ts',
        '**/coverage/**',
        '**/examples/**',
        'clear-db.js',
        'src/rules/**',
        'src/data/**/*.json',
        'src/i18n/locales/**',
        'src/questionnaire/**',
        'src/db/migrations/**',
      ],
      thresholds: {
        lines: 30,
        functions: 30,
        branches: 25,
        statements: 30,
      },
      all: false,
      clean: true,
      skipFull: true,
      watermarks: {
        lines: [30, 60],
        functions: [30, 60],
        branches: [25, 60],
        statements: [30, 60],
      },
    },

    // Performance
    // Use threads for better stability and performance
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Run tests sequentially to reduce memory usage
        maxThreads: 1,
        minThreads: 1,
        // Ensure workers inherit NODE_OPTIONS for memory limits
        isolate: true,
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
    testTimeout: 20000, // 20 seconds per test
    hookTimeout: 20000, // 20 seconds for hooks
    teardownTimeout: 20000, // 20 seconds for teardown

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

    // Ensure React can be mocked (inline instead of externalized)
    deps: {
      optimizer: {
        web: {
          include: ['react'],
        },
      },
    },
  },
});
