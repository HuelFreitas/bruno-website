import { escapeHtml as defaultEscape } from '../utils/string.js';

let currentCalendarDate = new Date();

function _resetCalendarDate(d) {
  currentCalendarDate = d ? new Date(d) : new Date();
}

function createCalendar(requests = [], user = {}, { escapeHtml = defaultEscape } = {}) {
  const today = new Date();
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const days = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayRequests = (requests || []).filter((request) => {
      const requestDate = new Date(request.scheduledFor);
      return requestDate.toDateString() === currentDate.toDateString();
    });

    days.push({
      date: new Date(currentDate),
      requests: dayRequests,
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.toDateString() === today.toDateString(),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return `
    <div class="calendar-container">
      <div class="calendar-header">
        <h3 class="calendar-title">${monthNames[month]} ${year}</h3>
        <div class="calendar-nav">
          <button class="calendar-nav-button" id="prevMonth" type="button" aria-label="Mês anterior">‹</button>
          <button class="calendar-nav-button" id="nextMonth" type="button" aria-label="Próximo mês">›</button>
        </div>
      </div>

      <div class="calendar-grid">
        ${dayNames.map((day) => `<div class="calendar-day-header">${day}</div>`).join('')}

        ${days.map((day) => {
          const dayNumber = day.date.getDate();
          const isOtherMonth = !day.isCurrentMonth;
          const isToday = day.isToday;
          const events = day.requests.slice(0, 2);
          const hasMore = day.requests.length > 2;
          const moreCount = day.requests.length - 2;

          return `
            <div class=\"calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}\" 
                 data-date=\"${day.date.toISOString().split('T')[0]}\">
              <div class=\"calendar-day-number\">${dayNumber}</div>
              <div class=\"calendar-events\">
                ${events.map((request) => `
                  <div class=\"calendar-event ${request.status}\" 
                       data-request=\"${request.id}\" 
                       title=\"${escapeHtml(request.title)}\">
                    ${escapeHtml(request.title.length > 15 ? request.title.substring(0, 15) + '...' : request.title)}
                  </div>
                `).join('')}
                ${hasMore ? `<div class=\"calendar-event-more\">+${moreCount} mais</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function initializeCalendar(requests = [], user = {}, { document = window.document, showRequestModal = null, requestsSource = null } = {}) {
  const calendarContainer = document.getElementById ? document.getElementById('calendarContainer') : null;
  if (!calendarContainer) return;

  const renderRequests = requestsSource || requests;
  calendarContainer.innerHTML = createCalendar(renderRequests, user, { escapeHtml: defaultEscape });

  const prev = document.getElementById('prevMonth');
  const next = document.getElementById('nextMonth');

  prev?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    calendarContainer.innerHTML = createCalendar(renderRequests, user, { escapeHtml: defaultEscape });
    initializeCalendar(renderRequests, user, { document, showRequestModal, requestsSource });
  });

  next?.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    calendarContainer.innerHTML = createCalendar(renderRequests, user, { escapeHtml: defaultEscape });
    initializeCalendar(renderRequests, user, { document, showRequestModal, requestsSource });
  });

  calendarContainer.querySelectorAll('.calendar-event').forEach((eventElement) => {
    eventElement.addEventListener('click', () => {
      const requestId = eventElement.dataset.request;
      const source = requestsSource || window.state?.requests || requests || [];
      const found = Array.isArray(source) ? source.find((r) => r.id === requestId) : undefined;

      const modalFn = showRequestModal || window.showRequestModal;
      if (found && typeof modalFn === 'function') {
        modalFn(found, user);
      }
    });
  });
}

export { createCalendar, initializeCalendar, _resetCalendarDate };
