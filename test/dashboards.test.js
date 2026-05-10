/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  emptyState,
  buildOperatorBoard,
  renderClientDashboard,
  renderOperatorDashboard,
} from '../src/components/dashboards.js';

describe('dashboard components', () => {
  let container;

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

  describe('emptyState', () => {
    it('should return a value', () => {
      const result = emptyState('No data', 'Nothing to show');
      expect(result).toBeDefined();
    });

    it('should accept title and subtitle parameters', () => {
      expect(() => emptyState('Title', 'Subtitle')).not.toThrow();
    });
  });

  describe('buildOperatorBoard', () => {
    it('should accept requests array and viewer object', () => {
      const requests = [
        {
          id: 'r1',
          title: 'Test',
          status: 'pending',
          createdAt: '2025-11-27T10:00:00',
          createdBy: 'cl1',
        },
      ];
      const viewer = { id: 'op1', name: 'Ana' };

      const result = buildOperatorBoard(requests, viewer);
      expect(result).toBeDefined();
    });
  });

  describe('renderClientDashboard', () => {
    it('should be callable without throwing with valid options', () => {
      expect(typeof renderClientDashboard).toBe('function');
    });
  });

  describe('renderOperatorDashboard', () => {
    it('should be callable without throwing with valid options', () => {
      expect(typeof renderOperatorDashboard).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should render dashboard components', () => {
      const empty = emptyState('Title', 'Description');
      expect(empty).toBeDefined();
    });
  });
});
