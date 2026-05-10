/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleClientNote } from '../src/handlers/client.js';

describe('client handlers', () => {
  let helpers;
  beforeEach(() => {
    helpers = {
      safeTrim: (s) => (s ? String(s).trim() : ''),
      createTimelineEntry: (data) => ({ ...data, id: 'evt-4', timestamp: new Date().toISOString() }),
      saveState: vi.fn(),
      timelineItem: (e) => `<item>${e.title}</item>`,
      announce: vi.fn(),
      renderApp: vi.fn(),
    };
  });

  it('adds client note to timeline and saves', () => {
    const request = { id: 'r-4', timeline: [] };
    const client = { id: 'c-1', name: 'Client' };
    const dialog = document.createElement('div');

    const form = document.createElement('form');
    form.innerHTML = '<textarea name="note">Hello</textarea>';
    const event = { preventDefault: () => {}, currentTarget: form };

    handleClientNote(event, request, client, dialog, helpers);

    expect(request.timeline.length).toBe(1);
    expect(helpers.saveState).toHaveBeenCalled();
    expect(helpers.announce).toHaveBeenCalled();
  });
});
