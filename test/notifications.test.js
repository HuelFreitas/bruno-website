/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  showNotification,
  hideNotification,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} from '../src/ui/notifications.js';

describe('notification utils', () => {
  let notificationContainer;

  beforeEach(() => {
    // Create notification container if needed
    notificationContainer = document.getElementById('notifications');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notifications';
      document.body.appendChild(notificationContainer);
    }
    notificationContainer.innerHTML = '';
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    if (notificationContainer && notificationContainer.parentElement) {
      notificationContainer.parentElement.removeChild(notificationContainer);
    }
  });

  describe('showNotification', () => {
    it('should return a notification', () => {
      const result = showNotification('Test message');
      expect(result).toBeDefined();
    });

    it('should handle empty message', () => {
      expect(() => showNotification('')).not.toThrow();
    });

    it('should handle null duration gracefully', () => {
      expect(() => showNotification('Test', 'success', null)).not.toThrow();
    });

    it('should handle zero duration', () => {
      expect(() => showNotification('Test', 'success', 0)).not.toThrow();
    });
  });

  describe('hideNotification', () => {
    it('should handle missing notification gracefully', () => {
      const fakeNotif = document.createElement('div');

      expect(() => hideNotification(fakeNotif)).not.toThrow();
    });

    it('should handle undefined notification', () => {
      expect(() => hideNotification(undefined)).not.toThrow();
    });

    it('should handle null notification', () => {
      expect(() => hideNotification(null)).not.toThrow();
    });
  });

  describe('showSuccessNotification', () => {
    it('should create notification without throwing', () => {
      expect(() => showSuccessNotification('Success')).not.toThrow();
    });

    it('should accept message and optional duration', () => {
      expect(() => showSuccessNotification('Success', 5000)).not.toThrow();
    });

    it('should return a value', () => {
      const result = showSuccessNotification('Success');
      expect(result).toBeDefined();
    });
  });

  describe('showErrorNotification', () => {
    it('should create error notification', () => {
      const result = showErrorNotification('Operation failed');

      expect(result).toBeDefined();
    });

    it('should accept message parameter', () => {
      expect(() => showErrorNotification('Error')).not.toThrow();
    });

    it('should accept optional duration parameter', () => {
      expect(() => showErrorNotification('Error', 7000)).not.toThrow();
    });
  });

  describe('showWarningNotification', () => {
    it('should create warning notification', () => {
      const result = showWarningNotification('Please confirm');

      expect(result).toBeDefined();
    });

    it('should accept message parameter', () => {
      expect(() => showWarningNotification('Warning')).not.toThrow();
    });

    it('should accept optional duration parameter', () => {
      expect(() => showWarningNotification('Warning', 4000)).not.toThrow();
    });
  });

  describe('showInfoNotification', () => {
    it('should create info notification', () => {
      const result = showInfoNotification('Please note');

      expect(result).toBeDefined();
    });

    it('should accept message parameter', () => {
      expect(() => showInfoNotification('Info')).not.toThrow();
    });

    it('should accept optional duration parameter', () => {
      expect(() => showInfoNotification('Info message', 6000)).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should create multiple notifications without errors', () => {
      expect(() => {
        showSuccessNotification('First');
        showWarningNotification('Second');
        showErrorNotification('Third');
        showInfoNotification('Fourth');
      }).not.toThrow();
    });

    it('should manage notification lifecycle without errors', () => {
      const notif = showSuccessNotification('Task started');
      expect(notif).toBeDefined();

      expect(() => hideNotification(notif)).not.toThrow();
    });

    it('should handle different types in sequence', () => {
      const success = showSuccessNotification('Success');
      const error = showErrorNotification('Error');
      const warning = showWarningNotification('Warning');

      expect(success).toBeDefined();
      expect(error).toBeDefined();
      expect(warning).toBeDefined();
    });
  });
});
