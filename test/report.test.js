/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleReportSubmission } from '../src/handlers/report.js';

describe('report handler', () => {
  let helpers;
  beforeEach(() => {
    helpers = {
      safeTrim: (s) => (s ? String(s).trim() : ''),
      createTimelineEntry: (data) => ({ ...data, id: 'evt-3', timestamp: new Date().toISOString() }),
      saveState: vi.fn(),
      announce: vi.fn(),
      showSuccessNotification: vi.fn(),
    };
  });

  it('submits report, closes dialog and marks as completed', () => {
    const request = { id: 'r-3', timeline: [], status: 'in-progress', report: null };
    const operator = { id: 'op-3', name: 'Op3' };
    const dialog = { close: vi.fn() };

    const form = document.createElement('form');
    form.innerHTML = '<textarea name="summary">sum</textarea><textarea name="findings">find</textarea><textarea name="recommendations">rec</textarea>';
    const event = { preventDefault: () => {}, currentTarget: form };

    handleReportSubmission(event, request, operator, dialog, helpers);

    expect(request.report).toBeTruthy();
    expect(request.status).toBe('completed');
    expect(helpers.saveState).toHaveBeenCalled();
    expect(dialog.close).toHaveBeenCalled();
    expect(helpers.showSuccessNotification).toHaveBeenCalled();
  });
});
