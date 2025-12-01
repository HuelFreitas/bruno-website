/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { getTimeInputValue, parseTags, translateStatus, resolveUser } from '../src/utils/helpers.js';

describe('helpers utils', () => {
  describe('getTimeInputValue', () => {
    it('should convert ISO timestamp to HH:MM format', () => {
      const result = getTimeInputValue('2025-11-27T14:30:00');
      expect(result).toBe('14:30');
    });

    it('should format single-digit hours with leading zero', () => {
      const result = getTimeInputValue('2025-11-27T08:45:00');
      expect(result).toBe('08:45');
    });

    it('should format single-digit minutes with leading zero', () => {
      const result = getTimeInputValue('2025-11-27T15:05:00');
      expect(result).toBe('15:05');
    });

    it('should return empty string for null input', () => {
      expect(getTimeInputValue(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(getTimeInputValue(undefined)).toBe('');
    });

    it('should return empty string for empty string input', () => {
      expect(getTimeInputValue('')).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(getTimeInputValue('invalid-date')).toBe('');
    });

    it('should handle date object with getTime method', () => {
      const date = new Date('2025-11-27T10:20:00');
      const result = getTimeInputValue(date);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle midnight correctly', () => {
      const result = getTimeInputValue('2025-11-27T00:00:00');
      expect(result).toBe('00:00');
    });

    it('should handle 23:59 correctly', () => {
      const result = getTimeInputValue('2025-11-27T23:59:00');
      expect(result).toBe('23:59');
    });
  });

  describe('parseTags', () => {
    it('should split comma-separated tags and trim whitespace', () => {
      const result = parseTags('auditoria, alto risco, urgent');
      expect(result).toEqual(['auditoria', 'alto risco', 'urgent']);
    });

    it('should trim whitespace from individual tags', () => {
      const result = parseTags('  tag1  ,  tag2  ,  tag3  ');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should filter out empty strings after trimming', () => {
      const result = parseTags('tag1, , tag2, , , tag3');
      expect(result).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should return empty array for null input', () => {
      expect(parseTags(null)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      expect(parseTags(undefined)).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(parseTags('')).toEqual([]);
    });

    it('should return array with single tag when no commas present', () => {
      expect(parseTags('only-one')).toEqual(['only-one']);
    });

    it('should handle tags with special characters', () => {
      const result = parseTags('c#, c++, node.js');
      expect(result).toEqual(['c#', 'c++', 'node.js']);
    });

    it('should handle tags with spaces within them', () => {
      const result = parseTags('machine learning, deep learning');
      expect(result).toEqual(['machine learning', 'deep learning']);
    });

    it('should handle single tag without comma', () => {
      const result = parseTags('single-tag');
      expect(result).toEqual(['single-tag']);
    });
  });

  describe('translateStatus', () => {
    it('should translate "pending" to "Pendente"', () => {
      expect(translateStatus('pending')).toBe('Pendente');
    });

    it('should translate "in-progress" to "Em andamento"', () => {
      expect(translateStatus('in-progress')).toBe('Em andamento');
    });

    it('should translate "completed" to "Concluída"', () => {
      expect(translateStatus('completed')).toBe('Concluída');
    });

    it('should return "Pendente" for unknown status', () => {
      expect(translateStatus('unknown-status')).toBe('Pendente');
    });

    it('should return "Pendente" for null input', () => {
      expect(translateStatus(null)).toBe('Pendente');
    });

    it('should return "Pendente" for undefined input', () => {
      expect(translateStatus(undefined)).toBe('Pendente');
    });

    it('should return "Pendente" for empty string', () => {
      expect(translateStatus('')).toBe('Pendente');
    });

    it('should be case-sensitive (not match uppercase)', () => {
      expect(translateStatus('PENDING')).toBe('Pendente');
      expect(translateStatus('Pending')).toBe('Pendente');
    });
  });

  describe('resolveUser', () => {
    const mockUsers = [
      { id: 'user-1', name: 'Ana Silva', role: 'client' },
      { id: 'user-2', name: 'Bruno Costa', role: 'operator' },
      { id: 'user-3', name: 'Carlos Santos', role: 'admin' },
    ];

    it('should find user by id in provided users array', () => {
      const result = resolveUser('user-2', mockUsers);
      expect(result.name).toBe('Bruno Costa');
      expect(result.role).toBe('operator');
    });

    it('should return default user object when id not found', () => {
      const result = resolveUser('non-existent', mockUsers);
      expect(result).toEqual({ name: 'Usuário' });
    });

    it('should return default user object for null id', () => {
      const result = resolveUser(null, mockUsers);
      expect(result).toEqual({ name: 'Usuário' });
    });

    it('should return default user object for undefined id', () => {
      const result = resolveUser(undefined, mockUsers);
      expect(result).toEqual({ name: 'Usuário' });
    });

    it('should return default user object when users array is empty', () => {
      const result = resolveUser('user-1', []);
      expect(result).toEqual({ name: 'Usuário' });
    });

    it('should work with default empty array parameter', () => {
      const result = resolveUser('user-1');
      expect(result).toEqual({ name: 'Usuário' });
    });

    it('should find first matching user (not later duplicates)', () => {
      const usersWithDuplicates = [
        { id: 'user-1', name: 'First', role: 'client' },
        { id: 'user-1', name: 'Second', role: 'operator' },
      ];
      const result = resolveUser('user-1', usersWithDuplicates);
      expect(result.name).toBe('First');
    });

    it('should preserve all user properties', () => {
      const result = resolveUser('user-3', mockUsers);
      expect(result).toEqual(mockUsers[2]);
      expect(result.id).toBe('user-3');
      expect(result.name).toBe('Carlos Santos');
      expect(result.role).toBe('admin');
    });
  });
});
