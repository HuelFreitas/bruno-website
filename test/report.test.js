/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleReportSubmission } from '../src/handlers/report.js';

describe('report handler', () => {
  let helpers;
  beforeEach(() => {
    helpers = {
      saveState: vi.fn(),
    };
  });

  it('submits report, closes dialog and marks request as completed', () => {
    const request = { id: 'r-3', timeline: [], status: 'in-progress', report: null };
    const operator = { id: 'op-3', name: 'Op3' };
    const dialog = { close: vi.fn() };

    const form = document.createElement('form');
    form.innerHTML = '<textarea name="summary">sum</textarea><textarea name="findings">find</textarea><textarea name="recommendations">rec</textarea>';
    const event = { preventDefault: () => {}, currentTarget: form };

    handleReportSubmission(event, request, operator, dialog, helpers);

    expect(request.report).toBeTruthy();
    expect(request.report.summary).toBe('sum');
    expect(request.status).toBe('completed');
    expect(request.timeline.length).toBe(1);
    expect(helpers.saveState).toHaveBeenCalled();
    expect(dialog.close).toHaveBeenCalled();
  });
});
