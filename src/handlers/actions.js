/**
 * Renderização de ações específicas por perfil de usuário
 */

import { escapeHtml } from '../utils/string.js';
import { getTimeInputValue } from '../utils/helpers.js';
import { getDateInputValue } from '../utils/misc.js';

/**
 * Renderiza seção de ações para operadores
 * (Status update, progress checkpoints, final report)
 * @param {Object} request - Dados da requisição
 * @param {Object} viewer - Usuário visualizando o modal
 * @returns {string} HTML com formulários de ação
 */
export function operatorActions(request, viewer) {
  const isAssignedToViewer = request.assignedOperatorId === viewer.id;
  return `
    <section aria-label="Ações do operador" class="grid-two">
      <div class="card" style="box-shadow:none; border:1px solid var(--border); background: var(--surface-alt);">
        <h4>Atualizar status</h4>
        <form id="statusForm">
          <div>
            <label for="statusSelect">Status</label>
            <select id="statusSelect" name="status" required>
              <option value="pending" ${request.status === "pending" ? "selected" : ""}>Pendente</option>
              <option value="in-progress" ${request.status === "in-progress" ? "selected" : ""}>Em andamento</option>
              <option value="completed" ${request.status === "completed" ? "selected" : ""}>Concluída</option>
            </select>
          </div>
          <div>
            <label for="statusNotes">Notas</label>
            <textarea id="statusNotes" name="notes" placeholder="Descreva a ação realizada"></textarea>
          </div>
          <button class="primary-button" type="submit">Salvar status</button>
        </form>
      </div>
      <div class="card" style="box-shadow:none; border:1px solid var(--border); background: var(--surface-alt);">
        <h4>Registrar checkpoint</h4>
        <form id="progressForm">
          <div>
            <label for="progressTitle">Título</label>
            <input id="progressTitle" name="title" required placeholder="Ex.: Varredura de porão" />
          </div>
          <div>
            <label for="progressDetails">Detalhes</label>
            <textarea id="progressDetails" name="details" required placeholder="Descrição das evidências ou alertas"></textarea>
          </div>
          <div>
            <label for="progressNext">Próximos passos</label>
            <input id="progressNext" name="next" placeholder="Ex.: Coletar amostras adicionais" />
          </div>
          <button class="secondary-button" type="submit">Registrar checkpoint</button>
        </form>
      </div>
    </section>
    <section class="card" style="box-shadow:none; border:1px solid var(--border); background: var(--surface-alt);" aria-label="Relatório final">
      <h4>Relatório de conclusão</h4>
      <form id="reportForm">
        <div>
          <label for="reportSummary">Resumo da operação</label>
          <textarea id="reportSummary" name="summary" required placeholder="Resumo das etapas executadas">${request.report?.summary || ""}</textarea>
        </div>
        <div>
          <label for="reportFindings">Achados / Ocorrências</label>
          <textarea id="reportFindings" name="findings" required placeholder="Descreva os sinais, apreensões ou alertas">${request.report?.findings || ""}</textarea>
        </div>
        <div>
          <label for="reportRecommendations">Recomendações</label>
          <textarea id="reportRecommendations" name="recommendations" required placeholder="Sugestões de continuidade, reforços ou monitoramento">${request.report?.recommendations || ""}</textarea>
        </div>
        <button class="primary-button" type="submit">${request.report ? "Atualizar relatório" : "Encerrar missão"}</button>
      </form>
    </section>
    ${!isAssignedToViewer ? `<p class="badge">Ao salvar atualizações você será automaticamente vinculado a esta missão.</p>` : ""}
  `;
}

/**
 * Renderiza seção de ações para clientes
 * (Add notes, edit request details, delete request)
 * @param {Object} request - Dados da requisição
 * @param {Object} viewer - Usuário visualizando o modal
 * @param {Object} options - Opções de configuração
 * @param {string[]} options.companyAvailability - Horários disponíveis da empresa
 * @returns {string} HTML com formulários de ação do cliente
 */
export function clientActions(request, viewer, { companyAvailability = [] } = {}) {
  const dateValue = escapeHtml(getDateInputValue(request.scheduledFor));
  const timeValue = escapeHtml(getTimeInputValue(request.scheduledFor));
  const safeTitle = escapeHtml(request.title);
  const safePort = escapeHtml(request.port);
  const safeVessel = escapeHtml(request.vessel);
  const cargoValue = request.cargo && request.cargo !== "Não informado" ? request.cargo : "";
  const safeCargo = escapeHtml(cargoValue);
  const safeTags = escapeHtml((request.tags || []).join(", "));
  const safeDescription = escapeHtml(request.description);

  return `
    <section aria-label="Observações do cliente" class="card" style="box-shadow:none; border:1px solid var(--border); background: var(--surface-alt);">
      <h4>Complementar informações</h4>
      <form id="clientNoteForm">
        <label for="clientNote">Mensagem para a equipe B&amp;B Educacão</label>
        <textarea id="clientNote" name="note" placeholder="Informe restrições, mudanças de agenda ou liberações."></textarea>
        <button class="secondary-button" type="submit">Enviar mensagem</button>
      </form>
    </section>
    <section aria-label="Gerenciar solicitação" class="card" style="box-shadow:none; border:1px solid var(--border); background: var(--surface-alt);">
      <h4>Gerenciar solicitação</h4>
      <p>Atualize detalhes importantes ou cancele a inspeção quando necessário.</p>
      <button class="secondary-button" type="button" data-toggle-edit>Editar solicitação</button>
      <form id="editRequestForm" class="grid-two" data-edit-form hidden>
        <div>
          <label for="editTitle">Título</label>
          <input id="editTitle" name="title" required value="${safeTitle}" />
        </div>
        <div>
          <label for="editPort">Porto / Terminal</label>
          <input id="editPort" name="port" required value="${safePort}" />
        </div>
        <div>
          <label for="editVessel">Embarcação</label>
          <input id="editVessel" name="vessel" required value="${safeVessel}" />
        </div>
        <div>
          <label for="editCargo">Tipo de carga</label>
          <input id="editCargo" name="cargo" value="${safeCargo}" />
        </div>
        <div>
          <label for="editDate">Data prevista</label>
          <input id="editDate" name="scheduledFor" type="date" required value="${dateValue}" min="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label for="editTime">Horário disponível</label>
          <select id="editTime" name="scheduledTime" required>
            <option value="">Selecione um horário</option>
            ${companyAvailability
              .map((slot) => {
                const optionValue = escapeHtml(slot.value);
                const isSelected = timeValue === optionValue ? "selected" : "";
                return `<option value="${optionValue}" ${isSelected}>${escapeHtml(slot.label)}</option>`;
              })
              .join("")}
          </select>
        </div>
        <div>
          <label for="editTags">Tags</label>
          <input id="editTags" name="tags" value="${safeTags}" />
        </div>
        <div class="full-row">
          <label for="editDescription">Descrição</label>
          <textarea id="editDescription" name="description" required>${safeDescription}</textarea>
        </div>
        <div class="full-row">
          <button class="primary-button" type="submit">Salvar alterações</button>
        </div>
      </form>
      <button class="ghost-button danger-button" type="button" data-delete-request>Excluir solicitação</button>
      <p class="help-text">Ao excluir, toda a linha do tempo será removida e a equipe B&amp;B será notificada.</p>
    </section>
  `;
}
