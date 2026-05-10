/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleClientNote } from '../src/handlers/client.js';

describe('client handlers', () => {
  let helpers;
  beforeEach(() => {
    helpers = {
      saveState: vi.fn(),
      renderApp: vi.fn(),
    };
  });

  it('adds client note to timeline and saves state', () => {
    const request = { id: 'r-4', timeline: [] };
    const client = { id: 'c-1', name: 'Client' };
    const dialog = document.createElement('div');

    const form = document.createElement('form');
    form.innerHTML = '<textarea name="note">Hello</textarea>';
    const event = { preventDefault: () => {}, currentTarget: form };

    handleClientNote(event, request, client, dialog, helpers);

    expect(request.timeline.length).toBe(1);
    expect(request.timeline[0].description).toBe('Hello');
    expect(helpers.saveState).toHaveBeenCalled();
    expect(helpers.renderApp).toHaveBeenCalled();
  });
});
