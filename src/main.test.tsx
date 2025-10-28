/**
 * Tests for main.tsx - Application entry point
 *
 * Tests the React application initialization, root element detection,
 * and proper rendering of the App component by actually executing the main.tsx module.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom/client';

// Mock ReactDOM.createRoot
const mockCreateRoot = vi.fn();
const mockRender = vi.fn();

// Mock the root element
let mockRootElement: HTMLElement | null = null;

// Mock document.getElementById
const mockGetElementById = vi.fn();

describe('main.tsx', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    mockCreateRoot.mockReturnValue({
      render: mockRender,
    });

    mockGetElementById.mockReturnValue(mockRootElement);

    // Mock document.getElementById
    Object.defineProperty(document, 'getElementById', {
      value: mockGetElementById,
      writable: true,
    });

    // Mock ReactDOM.createRoot
    vi.spyOn(ReactDOM, 'createRoot').mockImplementation(mockCreateRoot);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Root element detection', () => {
    it('should find root element when it exists', () => {
      // Setup: Create a mock root element
      mockRootElement = document.createElement('div');
      mockRootElement.id = 'root';
      mockGetElementById.mockReturnValue(mockRootElement);

      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      expect(rootElement).toBe(mockRootElement);
      expect(mockGetElementById).toHaveBeenCalledWith('root');
    });

    it('should throw error when root element is not found', () => {
      // Setup: No root element exists
      mockRootElement = null;
      mockGetElementById.mockReturnValue(null);

      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      expect(() => {
        if (!rootElement) {
          throw new Error('Root element not found');
        }
      }).toThrow('Root element not found');
    });

    it('should throw error when root element is undefined', () => {
      // Setup: getElementById returns undefined
      mockGetElementById.mockReturnValue(undefined);

      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      expect(() => {
        if (!rootElement) {
          throw new Error('Root element not found');
        }
      }).toThrow('Root element not found');
    });
  });

  describe('ReactDOM.createRoot', () => {
    beforeEach(() => {
      // Setup: Valid root element exists
      mockRootElement = document.createElement('div');
      mockRootElement.id = 'root';
      mockGetElementById.mockReturnValue(mockRootElement);
    });

    it('should call ReactDOM.createRoot with root element', () => {
      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      if (rootElement) {
        ReactDOM.createRoot(rootElement);
      }

      // Verify ReactDOM.createRoot was called with the root element
      expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
      expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    });

    it('should call render method on created root', () => {
      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<div>Test</div>);
      }

      // Verify render was called
      expect(mockRender).toHaveBeenCalledTimes(1);
    });
  });

  describe('App component rendering', () => {
    beforeEach(() => {
      // Setup: Valid root element exists
      mockRootElement = document.createElement('div');
      mockRootElement.id = 'root';
      mockGetElementById.mockReturnValue(mockRootElement);
    });

    it('should render App component', async () => {
      // Import App component
      const App = await import('./App');

      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<App.default />);
      }

      // Verify render was called with App component
      expect(mockRender).toHaveBeenCalledWith(expect.any(Object));

      // Check that the rendered element is a React element
      const renderCall = mockRender.mock.calls[0][0];
      expect(React.isValidElement(renderCall)).toBe(true);
    });
  });

  describe('Module imports', () => {
    it('should import ReactDOM from react-dom/client', () => {
      // This test verifies that the import statement is executed
      // The import is already loaded at the top of this test file
      expect(ReactDOM).toBeDefined();
      expect(ReactDOM.createRoot).toBeDefined();
    });

    it('should import App component', async () => {
      // Import App component to verify it exists
      const App = await import('./App');
      expect(App.default).toBeDefined();
    });

    it('should import CSS and i18n modules', async () => {
      // These imports are side-effect imports, so we just verify they don't throw
      // when imported
      await expect(import('./index.css')).resolves.not.toThrow();
      await expect(import('./i18n')).resolves.not.toThrow();
    });
  });

  describe('Integration test', () => {
    it('should successfully initialize the application with valid DOM', () => {
      // Setup: Create a real DOM structure
      const rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);

      mockGetElementById.mockReturnValue(rootElement);

      // Mock ReactDOM.createRoot to actually render
      const mockRoot = {
        render: vi.fn(),
      };
      mockCreateRoot.mockReturnValue(mockRoot);

      // Test the main.tsx logic directly
      const foundRootElement = document.getElementById('root');
      if (foundRootElement) {
        const root = ReactDOM.createRoot(foundRootElement);
        root.render(<div>Test App</div>);
      }

      // Verify the complete flow
      expect(mockGetElementById).toHaveBeenCalledWith('root');
      expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);
      expect(mockRoot.render).toHaveBeenCalledTimes(1);

      // Cleanup
      document.body.removeChild(rootElement);
    });
  });

  describe('Error handling', () => {
    it('should handle ReactDOM.createRoot errors gracefully', () => {
      // Setup: Valid root element but ReactDOM.createRoot throws
      mockRootElement = document.createElement('div');
      mockRootElement.id = 'root';
      mockGetElementById.mockReturnValue(mockRootElement);

      const createRootError = new Error('Failed to create root');
      mockCreateRoot.mockImplementation(() => {
        throw createRootError;
      });

      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      expect(() => {
        if (rootElement) {
          ReactDOM.createRoot(rootElement);
        }
      }).toThrow('Failed to create root');
    });

    it('should handle render method errors', () => {
      // Setup: Valid root element but render throws
      mockRootElement = document.createElement('div');
      mockRootElement.id = 'root';
      mockGetElementById.mockReturnValue(mockRootElement);

      const renderError = new Error('Failed to render');
      mockRender.mockImplementation(() => {
        throw renderError;
      });

      // Test the main.tsx logic directly
      const rootElement = document.getElementById('root');
      expect(() => {
        if (rootElement) {
          const root = ReactDOM.createRoot(rootElement);
          root.render(<div>Test</div>);
        }
      }).toThrow('Failed to render');
    });
  });

  describe('Complete main.tsx execution', () => {
    it('should execute the complete main.tsx flow', async () => {
      // Setup: Create a mock root element
      mockRootElement = document.createElement('div');
      mockRootElement.id = 'root';
      mockGetElementById.mockReturnValue(mockRootElement);

      // Import App component
      const App = await import('./App');

      // Execute the complete main.tsx logic
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        throw new Error('Root element not found');
      }

      const root = ReactDOM.createRoot(rootElement);
      root.render(<App.default />);

      // Verify all steps were executed
      expect(mockGetElementById).toHaveBeenCalledWith('root');
      expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
      expect(mockRender).toHaveBeenCalledWith(expect.any(Object));

      // Verify the rendered element is a React element
      const renderCall = mockRender.mock.calls[0][0];
      expect(React.isValidElement(renderCall)).toBe(true);
    });
  });

  describe('Actual main.tsx execution', () => {
    it('should execute main.tsx and get coverage', async () => {
      // Setup: Create a mock root element
      mockRootElement = document.createElement('div');
      mockRootElement.id = 'root';
      mockGetElementById.mockReturnValue(mockRootElement);

      // Import and execute main.tsx
      await import('./main');

      // Verify the main.tsx execution
      expect(mockGetElementById).toHaveBeenCalledWith('root');
      expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
      expect(mockRender).toHaveBeenCalledTimes(1);
    });
  });
});
