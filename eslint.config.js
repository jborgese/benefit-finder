/**
 * ESLint Configuration
 *
 * Comprehensive linting rules with focus on:
 * - Security (no external API calls, data privacy)
 * - Code quality (TypeScript strict mode)
 * - React best practices
 * - Accessibility
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '*.config.js',
      '*.config.cjs',
      // Ignore TypeScript config files and tooling configs that are not part
      // of the main tsconfig project to avoid parser project lookup errors.
      '*.config.ts',
      'vite.config.*.ts',
      'vite.config.performance.ts',
      'playwright.config.*.ts',
      'playwright.config.lowend.ts',
      'tailwind.config.ts',
      'vitest.config.ts',
      'tests/e2e/**',
      'tests/**',
      'scripts/**',
      'clear-db.js',
      '*.d.ts',
      '*.log',
      '.vscode/**',
      '.idea/**',
      '.cache/**',
      '.eslintcache',
    ]
  },
  // Ensure parserOptions.project isn't applied globally to files outside the
  // TypeScript project. Specific overrides below (and the main TS config)
  // will set `project` when needed.
  {
    files: ['**/*'],
    languageOptions: {
      parserOptions: {
        project: null,
      }
    }
  },
  js.configs.recommended,

  // Browser JavaScript files (like clear-db.js) - must come before TypeScript configs
  {
    files: ['*.js', '!*.config.js', '!*.config.cjs', '!scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
      }
    },
    rules: {
      'no-console': 'off', // Allow console usage for utility scripts
    }
  },

  // Relax some noisy rules for the full src tree to reduce large numbers
  // of warnings while we progressively triage and introduce a proper
  // logging abstraction and nullish-coalescing fixes.
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      // Many files use console.* for debug/operational logging. We'll
      // progressively migrate to a logger wrapper; for now disable this
      // rule across the source tree to clear lint noise.
      'no-console': 'off',
      // The prefer-nullish-coalescing rule can be noisy; disable here and
      // apply codemods incrementally where semantics are preserved.
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    }
  },
  // Scripts JavaScript files - must come before TypeScript configs
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      }
    },
    rules: {
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off',
    }
  },

  // Config files use node TypeScript config (must come before main config)
  {
    files: [
      '*.config.ts',
      'vite.config.*.ts',
      'playwright.config.*.ts',
      'playwright.config.lowend.ts',
      'tailwind.config.ts',
      'vitest.config.ts',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: null, // Disable type-aware linting
      },
      globals: {
        ...globals.node,
      }
    },
    rules: {
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    }
  },

  // Scripts files use node TypeScript config (must come before main config)
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: null, // Disable type-aware linting
      },
      globals: {
        ...globals.node,
      }
    },
    rules: {
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off',
    }
  },

  // E2E test files use separate TypeScript config (must come before main config)
  {
    files: ['tests/e2e/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: null, // Disable type-aware linting
      },
      globals: {
        ...globals.node,
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off',
    }
  },

  // Dev / debug files. Allow console statements in development/debug-only
  // locations so engineers can leave debug logging in non-production code.
  {
    files: [
      '**/dev/**',
      '**/debug/**',
      'src/test/**',
      'src/__tests__/**',
      'scripts/**',
      'run/**',
    ],
    rules: {
      'no-console': 'off',
    }
  },

  // Main config for source files (comes after specific configs)
  {
    files: [
      // Scope type-aware linting to project source files only. This avoids
      // trying to apply parserOptions.project to config, test, and root files
      // which aren't included in tsconfig.json.
      'src/**/*.{ts,tsx}',
      '!*.config.ts',
      '!vite.config.*.ts',
      '!playwright.config.*.ts',
      '!playwright.config.lowend.ts',
      '!tailwind.config.ts',
      '!vitest.config.ts',
      '!scripts/**/*.ts',
      '!scripts/**/*.js',
      '!tests/**/*.ts',
      '!clear-db.js',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
        // Vite build-time variables
        __APP_VERSION__: 'readonly',
        __BUILD_TIME__: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'security': security,
      'sonarjs': sonarjs,
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // Base rules
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...security.configs.recommended.rules,

      // ===== SECURITY RULES =====

      // Prevent potential security vulnerabilities
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-possible-timing-attacks': 'warn',
      'security/detect-pseudoRandomBytes': 'error',

      // SonarJS rules for code quality and security
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/no-collapsible-if': 'warn',
      'sonarjs/no-collection-size-mischeck': 'error',
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-ignored-return': 'warn',
      'sonarjs/no-inverted-boolean-check': 'warn',
      'sonarjs/no-redundant-boolean': 'warn',
      'sonarjs/no-redundant-jump': 'warn',
      'sonarjs/no-same-line-conditional': 'error',
      'sonarjs/no-unused-collection': 'warn',
      'sonarjs/no-use-of-empty-return-value': 'error',
      'sonarjs/prefer-immediate-return': 'warn',
      'sonarjs/prefer-object-literal': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',

      // ===== TYPESCRIPT RULES =====

      // Strict type checking
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off', // Too strict for practical use

      // Prevent common TypeScript mistakes
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-constraint': 'warn',

      // ===== REACT RULES =====

      // React best practices
      'react/prop-types': 'off', // Using TypeScript
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-no-target-blank': ['error', {
        allowReferrer: false,
        enforceDynamicLinks: 'always',
      }],
      'react/no-danger': 'error', // Prevent dangerouslySetInnerHTML
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
      'react/jsx-fragments': ['warn', 'syntax'],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh (for Vite HMR)
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true,
      }],

      // ===== PRIVACY & SECURITY SPECIFIC =====

      // Prevent console.log in production (can leak sensitive data)
      'no-console': ['warn', {
        allow: ['warn', 'error'],
      }],

      // Prevent eval and similar dangerous functions
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // Prevent debugger statements in production
      'no-debugger': 'error',

      // Require use of === and !==
      'eqeqeq': ['error', 'always'],

      // Prevent use of alert, confirm, prompt (better UX)
      'no-alert': 'warn',

      // ===== CODE QUALITY =====

      // Enforce consistent coding style
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'prefer-destructuring': ['warn', {
        array: false,
        object: true,
      }],

      // Error prevention
      'no-param-reassign': ['error', {
        props: true,
        ignorePropertyModificationsFor: ['state', 'draft'], // Allow for Immer
      }],
      'no-return-await': 'warn',
      'require-await': 'warn',

      // Best practices
      'no-lonely-if': 'warn',
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'warn',
      'prefer-exponentiation-operator': 'warn',
      'yoda': 'warn',
      'curly': ['warn', 'all'], // Require braces for all control statements

      // ===== ACCESSIBILITY =====

      // Note: Consider adding eslint-plugin-jsx-a11y for more comprehensive a11y checks
      // For now, rely on Playwright accessibility tests

      // ===== IMPORT/EXPORT RULES =====

      // Enforce consistent import/export patterns
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'warn',
    }
  },

  // Local override to suppress noisy console/nullish warnings in the
  // main `src/` tree. This is intentionally placed after the main
  // source configuration so it takes precedence and clears the large
  // number of warnings while we perform a gradual migration.
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    }
  },

  // Unit test files have relaxed rules
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'src/test/**'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        // Jest globals (for compatibility)
        jest: 'readonly',
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
      'sonarjs/no-duplicate-string': 'off',
      // Prevent accidental test.only() or describe.only() in commits
      'no-restricted-syntax': ['error', {
        selector: 'MemberExpression[object.name="test"][property.name="only"]',
        message: 'test.only() should not be committed. Remove .only() before committing.',
      }, {
        selector: 'MemberExpression[object.name="describe"][property.name="only"]',
        message: 'describe.only() should not be committed. Remove .only() before committing.',
      }, {
        selector: 'MemberExpression[object.name="it"][property.name="only"]',
        message: 'it.only() should not be committed. Remove .only() before committing.',
      }],
    }
  }
];
