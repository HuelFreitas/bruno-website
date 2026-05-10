/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleStatusUpdate } from '../src/handlers/status.js';

describe('status handler', () => {
  let helpers;
  beforeEach(() => {
    helpers = {
      saveState: vi.fn(),
      renderApp: vi.fn(),
    };
  });

  it('updates status, creates timeline entry and saves state', () => {
    const request = { id: 'r-1', timeline: [], status: 'pending' };
    const operator = { id: 'op-1', name: 'Op' };
    const dialog = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'modal__header';
    const chipHolder = document.createElement('span');
    chipHolder.className = 'status-chip';
    header.appendChild(chipHolder);
    dialog.appendChild(header);

    const form = document.createElement('form');
    form.innerHTML = '<select name="status" id="statusSelect"><option value="in-progress" selected>ok</option></select><textarea name="notes" id="statusNotes">note</textarea>';
    const event = { preventDefault: () => {}, currentTarget: form };

    handleStatusUpdate(event, request, operator, dialog, helpers);

    expect(request.status).toBe('in-progress');
    expect(request.timeline.length).toBe(1);
    expect(helpers.saveState).toHaveBeenCalled();
    expect(helpers.renderApp).toHaveBeenCalled();
  });
});
