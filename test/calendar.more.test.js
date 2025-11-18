/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCalendar, initializeCalendar, _resetCalendarDate } from '../src/components/calendar.js';

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
