import { safeTrim } from '../utils/string.js';
import { uid } from '../utils/misc.js';

export function renderLogin(app, { state, saveState, onLogin, feedback = null }) {
  if (!app) {
    console.error('[renderLogin] ERROR: app element not found!');
    return;
  }

  app.innerHTML = `
    <section class="section-grid">
      <article class="card">
        <header>
          <h1>Portal B&amp;B Educacão</h1>
          <p>Faça login ou crie um acesso para acompanhar operações de fiscalização marítima com suporte da nossa equipe K9 especializada.</p>
        </header>
        <form id="loginForm" novalidate>
          <div>
            <label for="loginEmail">E-mail corporativo*</label>
            <input id="loginEmail" name="email" type="email" autocomplete="email" required placeholder="nome@empresa.com" />
          </div>
          <div id="loginWelcomeBack" hidden>
            <p id="loginWelcomeMsg" class="feedback" data-type="success"></p>
          </div>
          <div id="loginNewUserFields">
            <div>
              <label for="loginName">Nome completo*</label>
              <input id="loginName" name="name" autocomplete="name" required placeholder="Ex.: Ana Costa" />
            </div>
            <div>
              <label for="loginRole">Perfil de acesso*</label>
              <select id="loginRole" name="role" required>
                <option value="" disabled selected>Selecione</option>
                <option value="client">Cliente - Solicitar inspeções</option>
                <option value="operator">Operador - Executar inspeções</option>
              </select>
            </div>
            <div id="companyField" class="conditional-field">
              <label for="loginCompany">Empresa / Órgão*</label>
              <input id="loginCompany" name="company" placeholder="Informe a empresa ou órgão" />
            </div>
            <div id="certificationField" class="conditional-field" hidden>
              <label for="loginCertification">Certificação K9*</label>
              <input id="loginCertification" name="certification" placeholder="Ex.: Condutor Nível II" />
            </div>
          </div>
          <p id="loginFeedback" role="status" aria-live="polite" class="feedback"></p>
          <button id="loginSubmitBtn" class="primary-button" type="submit">Entrar no sistema</button>
        </form>
      </article>
      <article class="card">
        <h2>Como funciona</h2>
        <ul class="list-clean">
          <li><strong>Clientes</strong> registram solicitações, acompanham inspeções e baixam relatórios.</li>
          <li><strong>Operadores</strong> recebem missões, atualizam checkpoints e emitem relatórios finais.</li>
          <li>Toda ação gera rastreabilidade automática para auditorias.</li>
        </ul>
        <br></br>
        <div class="tag-list" aria-label="Recursos principais">
          <span class="tag">Registro de inspeções</span>
          <span class="tag">Linha do tempo</span>
          <span class="tag">Relatórios inteligentes</span>
          <span class="tag">Mobile first</span>
        </div>
      </article>
    </section>
  `;

  const roleSelect = document.querySelector("#loginRole");
  const companyField = document.querySelector("#companyField");
  const certificationField = document.querySelector("#certificationField");
  const feedbackLabel = document.querySelector("#loginFeedback");
  const emailInput = document.querySelector("#loginEmail");
  const newUserFields = document.querySelector("#loginNewUserFields");
  const welcomeBack = document.querySelector("#loginWelcomeBack");
  const welcomeMsg = document.querySelector("#loginWelcomeMsg");
  const submitBtn = document.querySelector("#loginSubmitBtn");

  if (feedback) {
    feedbackLabel.textContent = feedback.message;
    feedbackLabel.dataset.type = feedback.type;
  }

  emailInput?.addEventListener("blur", () => {
    const email = emailInput.value.trim().toLowerCase();
    if (!email) return;
    const found = state.users.find((item) => item.email === email);
    if (found) {
      welcomeMsg.textContent = `Bem-vindo de volta, ${found.name}! Clique em Entrar para continuar.`;
      welcomeBack.hidden = false;
      newUserFields.hidden = true;
      submitBtn.textContent = "Entrar";
    } else {
      welcomeBack.hidden = true;
      newUserFields.hidden = false;
      submitBtn.textContent = "Entrar no sistema";
    }
  });

  roleSelect?.addEventListener("change", (event) => {
    const value = event.target.value;
    if (value === "client") {
      companyField.hidden = false;
      certificationField.hidden = true;
    } else if (value === "operator") {
      companyField.hidden = true;
      certificationField.hidden = false;
    } else {
      companyField.hidden = false;
      certificationField.hidden = true;
    }
  });

  document.querySelector("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = safeTrim(data.get("name"));
    const email = safeTrim(data.get("email")).toLowerCase();
    const role = data.get("role");
    const company = safeTrim(data.get("company"));
    const certification = safeTrim(data.get("certification"));

    if (!email) {
      feedbackLabel.textContent = "Preencha o e-mail.";
      feedbackLabel.dataset.type = "error";
      return;
    }

    let user = state.users.find((item) => item.email === email);

    if (!user && (!name || !role)) {
      feedbackLabel.textContent = "Preencha todas as informações obrigatórias.";
      feedbackLabel.dataset.type = "error";
      return;
    }

    if (user && role && user.role !== role) {
      feedbackLabel.textContent = "Este e-mail já está associado a um perfil diferente.";
      feedbackLabel.dataset.type = "error";
      return;
    }

    if (!user) {
      user = {
        id: uid(role === "client" ? "client" : "operator"),
        role,
        name,
        email,
      };

      if (role === "client") {
        user.company = company || "Organização não informada";
      } else {
        user.certification = certification || "Certificação pendente";
      }

      state.users.push(user);
      saveState();
    }

    onLogin(user.id);
  });
}
