/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleProgressUpdate } from '../src/handlers/progress.js';

describe('progress handler', () => {
  let helpers;
  beforeEach(() => {
    helpers = {
      safeTrim: (s) => (s ? String(s).trim() : ''),
      createTimelineEntry: (data) => ({ ...data, id: 'evt-2', timestamp: new Date().toISOString() }),
      saveState: vi.fn(),
      timelineItem: (e) => `<item>${e.title}</item>`,
      announce: vi.fn(),
      showInfoNotification: vi.fn(),
      renderApp: vi.fn(),
    };
  });

  it('adds checkpoint entry and notifies', () => {
    const request = { id: 'r-2', timeline: [] };
    const operator = { id: 'op-2', name: 'Op2' };
    const dialog = document.createElement('div');

    const form = document.createElement('form');
    form.innerHTML = '<input name="title" value="Checkpoint" /><textarea name="details">details</textarea><input name="next" value="next steps" />';
    const event = { preventDefault: () => {}, currentTarget: form };

    handleProgressUpdate(event, request, operator, dialog, helpers);

    expect(request.timeline.length).toBe(1);
    expect(helpers.saveState).toHaveBeenCalled();
    expect(helpers.showInfoNotification).toHaveBeenCalled();
  });
});
