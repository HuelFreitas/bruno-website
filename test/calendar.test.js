/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCalendar, initializeCalendar } from '../src/components/calendar.js';

const OCT_2025 = new Date(2025, 9, 1);

describe('calendar component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="calendarContainer"></div>';
    delete window.showRequestModal;
    delete window.state;
  });

  it('createCalendar returns markup with month and year and includes events', () => {
    const requests = [
      { id: 'r1', scheduledFor: '2025-10-15T08:00:00', title: 'Teste', status: 'pending' },
    ];

    const markup = createCalendar(requests, {}, { baseDate: OCT_2025 });
    expect(markup).toContain('Outubro 2025');
    expect(markup).toContain('Dom');
    expect(markup).toContain('data-request="r1"');
  });

  it('initializeCalendar renders and wires event clicks and navigation', () => {
    const request = { id: 'r1', scheduledFor: '2025-10-15T08:00:00', title: 'Teste evento', status: 'pending' };
    const requests = [request];

    window.state = { requests };
    window.showRequestModal = vi.fn();

    initializeCalendar(requests, { name: 'User' }, { baseDate: OCT_2025 });

    const eventEl = document.querySelector('.calendar-event');
    expect(eventEl).toBeTruthy();
    expect(eventEl.dataset.request).toBe('r1');

    eventEl.click();
    expect(window.showRequestModal).toHaveBeenCalledWith(request, { name: 'User' });

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
  });

  it('renders multiple events in same day and shows +N more indicator', () => {
    const requests = [
      { id: 'a1', scheduledFor: '2025-10-15T08:00:00', title: 'Evt A1', status: 'pending' },
      { id: 'a2', scheduledFor: '2025-10-15T09:00:00', title: 'Evt A2', status: 'pending' },
      { id: 'a3', scheduledFor: '2025-10-15T10:00:00', title: 'Evt A3', status: 'pending' },
    ];

    const html = createCalendar(requests, {}, { baseDate: OCT_2025 });
    expect(html).toContain('Outubro 2025');
    expect(html).toContain('data-request="a1"');
    expect(html).toContain('data-request="a2"');
    expect(html).toContain('+1 mais');
  });

  it('initializeCalendar binds click to event and uses injected requestsSource', () => {
    const requests = [
      { id: 'b1', scheduledFor: '2025-10-20T08:00:00', title: 'Evento B1', status: 'pending' },
    ];
    window.showRequestModal = vi.fn();
    initializeCalendar([], { name: 'User' }, { showRequestModal: window.showRequestModal, requestsSource: requests, baseDate: OCT_2025 });

    const eventEl = document.querySelector('.calendar-event');
    expect(eventEl).toBeTruthy();
    expect(eventEl.dataset.request).toBe('b1');

    eventEl.click();
    expect(window.showRequestModal).toHaveBeenCalled();
  });
});
