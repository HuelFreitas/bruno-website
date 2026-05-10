export function buildRequestTable(requests, filter, viewer, helpers) {
  const { resolveUser, escapeHtml, formatDate, buildStatusChip, emptyState } = helpers;
  const filtered = filter === 'all' ? requests : requests.filter((request) => request.status === filter);
  if (!filtered.length) {
    return emptyState('Nenhuma solicitação com este filtro', 'Selecione outro status para visualizar.');
  }

  return `
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Título</th>
            <th scope="col">Data prevista</th>
            <th scope="col">Status</th>
            <th scope="col">Operador</th>
            <th scope="col"><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          ${filtered
            .map((request) => {
              const operatorName = request.assignedOperatorId ? resolveUser(request.assignedOperatorId)?.name : '-';
              const safeTitle = escapeHtml(request.title);
              const safePort = escapeHtml(request.port);
              const safeOperator = escapeHtml(operatorName || '-');
              const safeRequestId = escapeHtml(request.id);

              return `
                <tr>
                  <td>
                    <strong>${safeTitle}</strong>
                    <p>${safePort}</p>
                  </td>
                  <td>${formatDate(request.scheduledFor)}</td>
                  <td>${buildStatusChip(request.status)}</td>
                  <td>${safeOperator}</td>
                  <td>
                    <button class="secondary-button" type="button" data-request="${safeRequestId}">Detalhes</button>
                  </td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}
