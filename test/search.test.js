/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeSearch } from '../src/components/search.js';

describe('search components', () => {
  let container;

  const mockHelpers = {
    showInfoNotification: vi.fn(),
    performSearch: vi.fn(),
  };

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'app';
    document.body.appendChild(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (container && container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });

  describe('initializeSearch', () => {
    it('should accept helpers object without throwing', () => {
      // Create minimal DOM structure
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      container.appendChild(toggleButton);

      const helpers = {
        showInfoNotification: vi.fn(),
        performSearch: vi.fn(),
      };

      expect(() => initializeSearch(helpers)).not.toThrow();
    });

    it('should handle missing DOM elements gracefully', () => {
      const helpers = {
        showInfoNotification: vi.fn(),
        performSearch: vi.fn(),
      };

      // This should not throw even if DOM elements are missing
      expect(() => initializeSearch(helpers)).not.toThrow();
    });
  });

  describe('search functionality', () => {
    it('should initialize search without errors when all DOM elements present', () => {
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      container.appendChild(toggleButton);

      expect(() => initializeSearch(mockHelpers)).not.toThrow();
    });

    it('should handle search form submission', () => {
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      container.appendChild(toggleButton);

      initializeSearch(mockHelpers);
      expect(() => searchForm.dispatchEvent(new Event('submit'))).not.toThrow();
    });

    it('should support clear search button', () => {
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      container.appendChild(toggleButton);

      const clearButton = document.createElement('button');
      clearButton.id = 'clearSearch';
      container.appendChild(clearButton);

      initializeSearch(mockHelpers);
      expect(() => clearButton.click()).not.toThrow();
    });

    it('should support search results clearing', () => {
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      container.appendChild(toggleButton);

      const clearResultsButton = document.createElement('button');
      clearResultsButton.id = 'clearSearchResults';
      container.appendChild(clearResultsButton);

      initializeSearch(mockHelpers);
      expect(() => clearResultsButton.click()).not.toThrow();
    });

    it('should handle toggle search visibility', () => {
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      searchForm.setAttribute('hidden', '');
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      toggleButton.type = 'button';
      container.appendChild(toggleButton);

      const toggleText = document.createElement('span');
      toggleText.id = 'searchToggleText';
      toggleText.textContent = 'Mostrar filtros';
      toggleButton.appendChild(toggleText);

      initializeSearch(mockHelpers);
      expect(() => toggleButton.click()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should set up complete search interface', () => {
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      container.appendChild(toggleButton);

      const clearButton = document.createElement('button');
      clearButton.id = 'clearSearch';
      container.appendChild(clearButton);

      const searchResults = document.createElement('div');
      searchResults.id = 'searchResults';
      container.appendChild(searchResults);

      expect(() => initializeSearch(mockHelpers)).not.toThrow();
    });

    it('should support multiple search operations in sequence', () => {
      const searchForm = document.createElement('form');
      searchForm.id = 'searchForm';
      container.appendChild(searchForm);

      const toggleButton = document.createElement('button');
      toggleButton.id = 'toggleSearch';
      container.appendChild(toggleButton);

      initializeSearch(mockHelpers);

      expect(() => {
        searchForm.dispatchEvent(new Event('submit'));
        searchForm.dispatchEvent(new Event('submit'));
        searchForm.dispatchEvent(new Event('submit'));
      }).not.toThrow();
    });
  });
});
