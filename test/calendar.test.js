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

describe('calendar component - advanced cases', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="calendarContainer"></div>';
    delete window.showRequestModal;
    delete window.state;
    _resetCalendarDate(new Date(2025, 9, 1));
  });

  it('renders multiple events in same day and shows +N more indicator', () => {
    const requests = [
      { id: 'a1', scheduledFor: '2025-10-15T08:00:00', title: 'Evt A1', status: 'pending' },
      { id: 'a2', scheduledFor: '2025-10-15T09:00:00', title: 'Evt A2', status: 'pending' },
      { id: 'a3', scheduledFor: '2025-10-15T10:00:00', title: 'Evt A3', status: 'pending' },
    ];

    const html = createCalendar(requests, {});
    // The calendar is set to October 2025 in the reset above
    expect(html).toContain('Outubro 2025');
    // should render event entries for at least first two
    expect(html).toContain('data-request="a1"');
    expect(html).toContain('data-request="a2"');
    // should show +1 more (3 events -> show 2 + "+1 mais")
    expect(html).toContain('+1 mais');
  });

  it('initializeCalendar binds click to event and uses injected requestsSource', () => {
    const requests = [
      { id: 'b1', scheduledFor: '2025-10-20T08:00:00', title: 'Evento B1', status: 'pending' },
    ];
    window.showRequestModal = vi.fn();
    initializeCalendar([], { name: 'User' }, { showRequestModal: window.showRequestModal, requestsSource: requests });

    // the calendar should render using the injected requestsSource
    const eventEl = document.querySelector('.calendar-event');
    expect(eventEl).toBeTruthy();
    expect(eventEl.dataset.request).toBe('b1');

    eventEl.click();
    expect(window.showRequestModal).toHaveBeenCalled();
  });
});
