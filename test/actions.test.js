/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { operatorActions, clientActions } from '../src/handlers/actions.js';

describe('action handlers', () => {
  let container;

  const mockRequest = {
    id: 'r1',
    title: 'Test Request',
    status: 'pending',
    assignedOperatorId: 'op1',
    createdBy: 'cl1',
    scheduledFor: '2025-11-27T10:30:00',
  };

  const mockViewer = {
    id: 'op1',
    role: 'operator',
    name: 'Ana Silva',
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

  describe('operatorActions', () => {
    it('should render operator action menu', () => {
      const result = operatorActions(mockRequest, mockViewer);

      expect(result).toBeDefined();
    });

    it('should return string', () => {
      const result = operatorActions(mockRequest, mockViewer);

      expect(typeof result).toBe('string');
    });

    it('should handle valid request and viewer', () => {
      const request = {
        id: 'r2',
        title: 'Another Request',
        status: 'in-progress',
        assignedOperatorId: 'op2',
      };

      const viewer = { id: 'op2', role: 'operator', name: 'Bruno' };

      const result = operatorActions(request, viewer);

      expect(result).toBeDefined();
    });
  });

  describe('clientActions', () => {
    it('should be callable as a function', () => {
      expect(typeof clientActions).toBe('function');
    });
  });
});
