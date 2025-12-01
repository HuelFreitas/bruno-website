/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadState, saveState, loadSession, saveSession } from '../src/utils/storage.js';

describe('storage utils', () => {
  const STORAGE_KEY = "guardcan:data:v1";
  const SESSION_KEY = "guardcan:session";

  beforeEach(() => {
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
    vi.stubGlobal('sessionStorage', mockLS);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('loadState', () => {
    const defaultState = {
      users: [{ id: 'default-user', name: 'Default' }],
      requests: [{ id: 'default-req', title: 'Default' }],
    };

    it('should return default state when localStorage is empty', () => {
      const result = loadState(defaultState);
      expect(result.users).toEqual(defaultState.users);
      expect(result.requests).toEqual(defaultState.requests);
    });

    it('should load state from localStorage when available', () => {
      const savedState = {
        users: [{ id: 'user-1', name: 'Ana' }],
        requests: [{ id: 'req-1', title: 'Test' }],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const result = loadState(defaultState);
      expect(result.users).toEqual(savedState.users);
      expect(result.requests).toEqual(savedState.requests);
    });

    it('should return default state for invalid JSON in localStorage', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json{');

      const result = loadState(defaultState);
      expect(result).toEqual(defaultState);
    });

    it('should validate users array and use default if not array', () => {
      const invalidState = {
        users: 'not-an-array',
        requests: [{ id: 'req-1' }],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidState));

      const result = loadState(defaultState);
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.users).toEqual(defaultState.users);
    });

    it('should validate requests array and use default if not array', () => {
      const invalidState = {
        users: [{ id: 'user-1' }],
        requests: 'not-an-array',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidState));

      const result = loadState(defaultState);
      expect(Array.isArray(result.requests)).toBe(true);
      expect(result.requests).toEqual(defaultState.requests);
    });

    it('should make a deep copy of default state, not reference', () => {
      const result1 = loadState(defaultState);
      const result2 = loadState(defaultState);

      result1.users.push({ id: 'new-user' });
      expect(result2.users.length).toBe(defaultState.users.length);
      expect(defaultState.users.length).toBe(1);
    });

    it('should handle empty stored state gracefully', () => {
      localStorage.setItem(STORAGE_KEY, '{}');

      const result = loadState(defaultState);
      expect(Array.isArray(result.users)).toBe(true);
      expect(Array.isArray(result.requests)).toBe(true);
    });
  });

  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const state = {
        users: [{ id: 'user-1', name: 'Test' }],
        requests: [{ id: 'req-1' }],
      };

      saveState(state);

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(saved).toEqual(state);
    });

    it('should overwrite existing state in localStorage', () => {
      const state1 = { users: [{ id: 'old' }], requests: [] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state1));

      const state2 = { users: [{ id: 'new' }], requests: [{ id: 'req-1' }] };
      saveState(state2);

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(saved.users[0].id).toBe('new');
      expect(saved.requests.length).toBe(1);
    });

    it('should stringify state as JSON', () => {
      const state = { users: [], requests: [] };
      saveState(state);

      const item = localStorage.getItem(STORAGE_KEY);
      expect(() => JSON.parse(item)).not.toThrow();
    });

    it('should handle empty state object', () => {
      saveState({});
      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).toBe('{}');
    });

    it('should serialize complex nested objects', () => {
      const state = {
        users: [
          { id: 'u1', profile: { name: 'Ana', role: 'admin', preferences: { theme: 'dark' } } },
        ],
        requests: [
          { id: 'r1', evidence: [{ id: 'e1', data: 'base64...' }] },
        ],
      };

      saveState(state);
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(saved.users[0].profile.preferences.theme).toBe('dark');
      expect(saved.requests[0].evidence[0].data).toBe('base64...');
    });
  });

  describe('loadSession', () => {
    it('should return null when localStorage is empty', () => {
      const result = loadSession();
      expect(result).toBeNull();
    });

    it('should load session from localStorage when available', () => {
      const session = { currentUserId: 'user-123' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      const result = loadSession();
      expect(result).toEqual(session);
    });

    it('should return null for invalid JSON in localStorage', () => {
      localStorage.setItem(SESSION_KEY, 'invalid{json');

      const result = loadSession();
      expect(result).toBeNull();
    });

    it('should return parsed session object with correct properties', () => {
      const session = {
        currentUserId: 'op-456',
        loginTime: '2025-11-27T10:00:00',
        role: 'operator',
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      const result = loadSession();
      expect(result.currentUserId).toBe('op-456');
      expect(result.loginTime).toBe('2025-11-27T10:00:00');
      expect(result.role).toBe('operator');
    });

    it('should handle empty session object in storage', () => {
      localStorage.setItem(SESSION_KEY, '{}');

      const result = loadSession();
      expect(result).toEqual({});
    });
  });

  describe('saveSession', () => {
    it('should save session to localStorage when provided', () => {
      const session = { currentUserId: 'user-789' };

      saveSession(session);

      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      expect(saved).toEqual(session);
    });

    it('should remove session from localStorage when null is passed', () => {
      const session = { currentUserId: 'user-789' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      saveSession(null);

      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('should remove session from localStorage when undefined is passed', () => {
      const session = { currentUserId: 'user-789' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      saveSession(undefined);

      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('should overwrite existing session', () => {
      const oldSession = { currentUserId: 'old-user' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(oldSession));

      const newSession = { currentUserId: 'new-user' };
      saveSession(newSession);

      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      expect(saved.currentUserId).toBe('new-user');
    });

    it('should handle session with multiple properties', () => {
      const session = {
        currentUserId: 'user-999',
        loginTime: new Date().toISOString(),
        theme: 'dark',
        permissions: ['read', 'write'],
      };

      saveSession(session);

      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      expect(saved.permissions).toEqual(['read', 'write']);
      expect(saved.theme).toBe('dark');
    });

    it('should handle empty session object', () => {
      saveSession({});

      const saved = localStorage.getItem(SESSION_KEY);
      expect(saved).toBe('{}');
    });
  });

  describe('integration scenarios', () => {
    it('should save and load state correctly in full cycle', () => {
      const originalState = {
        users: [{ id: 'u1', name: 'Test User' }],
        requests: [{ id: 'r1', title: 'Test Request' }],
      };

      saveState(originalState);
      const defaultState = { users: [], requests: [] };
      const loadedState = loadState(defaultState);

      expect(loadedState).toEqual(originalState);
    });

    it('should save and load session correctly in full cycle', () => {
      const originalSession = { currentUserId: 'test-user', role: 'admin' };

      saveSession(originalSession);
      const loadedSession = loadSession();

      expect(loadedSession).toEqual(originalSession);
    });

    it('should handle state and session independently', () => {
      const state = { users: [{ id: 'u1' }], requests: [] };
      const session = { currentUserId: 'u1' };

      saveState(state);
      saveSession(session);

      const defaultState = { users: [], requests: [] };
      const loadedState = loadState(defaultState);
      const loadedSession = loadSession();

      expect(loadedState.users[0].id).toBe('u1');
      expect(loadedSession.currentUserId).toBe('u1');
    });
  });
});
