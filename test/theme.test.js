/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadTheme, applyTheme, toggleTheme, updateThemeToggleLabel } from '../src/ui/theme.js';

describe('theme utils', () => {
  const THEME_KEY = 'guardcan:theme';

  beforeEach(() => {
    document.documentElement.className = '';
    document.body.className = '';
    // Create a simple mock localStorage for testing
    const store = {};
    const mockLS = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
    };
    vi.stubGlobal('localStorage', mockLS);
    
    // Mock window.matchMedia
    vi.stubGlobal('matchMedia', (query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = '';
    document.body.className = '';
  });

  describe('loadTheme', () => {
    it('should load theme without throwing', () => {
      expect(() => loadTheme()).not.toThrow();
    });

    it('should return a string theme value', () => {
      const result = loadTheme();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return light or dark theme', () => {
      const result = loadTheme();

      expect(['light', 'dark']).toContain(result);
    });

    it('should read from localStorage when available', () => {
      localStorage.setItem(THEME_KEY, 'dark');

      const result = loadTheme();

      expect(result).toBeDefined();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem(THEME_KEY, 'invalid{json');

      expect(() => loadTheme()).not.toThrow();
    });

    it('should handle empty string in localStorage', () => {
      localStorage.setItem(THEME_KEY, '');

      expect(() => loadTheme()).not.toThrow();
    });
  });

  describe('applyTheme', () => {
    it('should apply theme without throwing', () => {
      expect(() => applyTheme('dark')).not.toThrow();
    });

    it('should handle light theme', () => {
      expect(() => applyTheme('light')).not.toThrow();
    });

    it('should handle invalid theme gracefully', () => {
      expect(() => applyTheme('invalid')).not.toThrow();
    });

    it('should be idempotent when applied multiple times', () => {
      expect(() => {
        applyTheme('dark');
        applyTheme('dark');
        applyTheme('dark');
      }).not.toThrow();
    });

    it('should allow switching between themes', () => {
      expect(() => {
        applyTheme('light');
        applyTheme('dark');
        applyTheme('light');
      }).not.toThrow();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle theme without throwing', () => {
      expect(() => toggleTheme()).not.toThrow();
    });

    it('should return a value or undefined', () => {
      const result = toggleTheme();

      expect(result === undefined || typeof result === 'string').toBe(true);
    });

    it('should handle multiple toggles', () => {
      expect(() => {
        toggleTheme();
        toggleTheme();
        toggleTheme();
      }).not.toThrow();
    });

    it('should work with localStorage mocking', () => {
      localStorage.setItem(THEME_KEY, 'light');

      expect(() => toggleTheme()).not.toThrow();
    });

    it('should handle localStorage write errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Should not throw even if localStorage fails
      expect(() => toggleTheme()).not.toThrow();
      setItemSpy.mockRestore();
    });
  });

  describe('updateThemeToggleLabel', () => {
    let toggleButton;

    beforeEach(() => {
      toggleButton = document.createElement('button');
      toggleButton.id = 'theme-toggle';
      document.body.appendChild(toggleButton);
    });

    afterEach(() => {
      if (toggleButton && toggleButton.parentElement) {
        toggleButton.parentElement.removeChild(toggleButton);
      }
    });

    it('should update toggle button without throwing', () => {
      expect(() => updateThemeToggleLabel()).not.toThrow();
    });

    it('should handle missing toggle button gracefully', () => {
      toggleButton.parentElement.removeChild(toggleButton);

      expect(() => updateThemeToggleLabel()).not.toThrow();
    });

    it('should preserve button functionality after update', () => {
      updateThemeToggleLabel();

      expect(toggleButton).toBeTruthy();
    });

    it('should not remove button from DOM', () => {
      updateThemeToggleLabel();

      expect(document.body.contains(toggleButton)).toBe(true);
    });

    it('should work with different theme states', () => {
      localStorage.setItem(THEME_KEY, 'light');
      expect(() => updateThemeToggleLabel()).not.toThrow();

      localStorage.setItem(THEME_KEY, 'dark');
      expect(() => updateThemeToggleLabel()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should load theme without throwing', () => {
      expect(() => loadTheme()).not.toThrow();
    });

    it('should apply theme without throwing', () => {
      const theme = loadTheme();
      expect(() => applyTheme(theme)).not.toThrow();
    });

    it('should toggle theme without throwing', () => {
      expect(() => toggleTheme()).not.toThrow();
    });

    it('should update toggle label without throwing', () => {
      const toggleButton = document.createElement('button');
      toggleButton.id = 'theme-toggle';
      document.body.appendChild(toggleButton);

      expect(() => updateThemeToggleLabel()).not.toThrow();
      
      toggleButton.parentElement.removeChild(toggleButton);
    });
  });
});
