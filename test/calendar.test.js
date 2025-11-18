/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCalendar, initializeCalendar, _resetCalendarDate } from '../src/components/calendar.js';

describe('calendar component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="calendarContainer"></div>';
    // ensure globals are clean for each test
    delete window.showRequestModal;
    delete window.state;
    // Use numeric constructor to avoid timezone shifts when running tests
    _resetCalendarDate(new Date(2025, 9, 1));
  });

  it('createCalendar returns markup with month and year and includes events', () => {
    const requests = [
      { id: 'r1', scheduledFor: '2025-10-15T08:00:00', title: 'Teste', status: 'pending' },
    ];

    const markup = createCalendar(requests, {});
    expect(markup).toContain('Outubro 2025');
    expect(markup).toContain('Dom');
    expect(markup).toContain('data-request="r1"');
  });

  it('initializeCalendar renders and wires event clicks and navigation', () => {
    const request = { id: 'r1', scheduledFor: '2025-10-15T08:00:00', title: 'Teste evento', status: 'pending' };
    const requests = [request];

    // calendar module looks up requests via `window.state.requests`
    window.state = { requests };
    window.showRequestModal = vi.fn();

    initializeCalendar(requests, { name: 'User' });

    const eventEl = document.querySelector('.calendar-event');
    expect(eventEl).toBeTruthy();
    expect(eventEl.dataset.request).toBe('r1');

    // clicking event should call the global showRequestModal with the request
    eventEl.click();
    expect(window.showRequestModal).toHaveBeenCalledWith(request, { name: 'User' });

    // navigation buttons should change the displayed month
    const titleEl = document.querySelector('.calendar-title');
    expect(titleEl.textContent).toContain('Outubro 2025');

    const prevBtn = document.getElementById('prevMonth');
    expect(prevBtn).toBeTruthy();
    prevBtn.click();

    const newTitle = document.querySelector('.calendar-title').textContent;
    expect(newTitle).toContain('Setembro 2025');
  });
});
