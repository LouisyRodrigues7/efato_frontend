/**
 * UI.js
 * Gerenciamento da interface do usuário
 */

/**
 * Inicializa UI
 */
export function initializeUI(appState) {
  setupEmptyState();
  setupInputField(appState);
  setupSendButton();
  updateUIState(appState);
}

/**
 * Estado vazio inicial
 */
function setupEmptyState() {
  const chatMessages = document.querySelector(".chat-messages");

  if (!chatMessages) return;

  if (chatMessages.children.length === 0) {
    renderEmptyState();
  }
}

/**
 * Renderiza tela inicial
 */
function renderEmptyState() {
  const chatMessages =
    document.querySelector(".chat-messages");

  if (!chatMessages) return;

  chatMessages.innerHTML = "";

  const emptyState =
    document.createElement("div");

  emptyState.className =
    "empty-state animate-fade-in";

  emptyState.innerHTML = `
    <h1 class="empty-state-title">
      ÉFato
    </h1>

    <p class="empty-state-subtitle">
      IA que testa o que você confia.
    </p>

    <p class="empty-state-description">
      O ÉFato prioriza fontes oficiais e verificáveis
      para análise de informações políticas.
    </p>

    <p class="empty-state-warning">
      Faça perguntas sobre política, notícias,
      leis, impostos e informações públicas.
    </p>
  `;

  const suggestionsContainer =
    document.createElement("div");

  suggestionsContainer.className =
    "suggestions-container";

  const suggestions = [
    "O governo aumentou imposto sobre compras internacionais?",
    "Essa notícia é verdadeira?",
    "O que diz a Câmara sobre reforma tributária?",
    "Existe projeto de lei sobre taxação digital?",
    "O Senado aprovou mudanças no imposto de renda?"
  ];

  suggestions.forEach((suggestion) => {

    const btn =
      document.createElement("button");

    btn.type = "button";

    btn.className = "suggestion-btn";

    btn.textContent = suggestion;

    btn.addEventListener("click", () => {

      const inputField =
        document.querySelector(".input-field");

      if (!inputField) return;

      inputField.value = suggestion;

      inputField.focus();

      inputField.dispatchEvent(
        new Event("input")
      );
    });

    suggestionsContainer.appendChild(btn);
  });

  emptyState.appendChild(
    suggestionsContainer
  );

  chatMessages.appendChild(
    emptyState
  );
}

/**
 * Configura textarea
 */
function setupInputField(appState) {

  const inputField =
    document.querySelector(".input-field");

  if (!inputField) return;

  const placeholders = [
    "Faça uma pergunta sobre política...",
    "Verifique uma informação...",
    "Pergunte sobre leis e projetos..."
  ];

  const randomPlaceholder =
    placeholders[
      Math.floor(
        Math.random() * placeholders.length
      )
    ];

  inputField.placeholder =
    randomPlaceholder;

  /**
   * Auto resize + atualização botão
   */
  inputField.addEventListener(
    "input",
    () => {

      inputField.style.height = "auto";

      inputField.style.height =
        Math.min(
          inputField.scrollHeight,
          120
        ) + "px";

      updateSendButton(appState);
    }
  );
}

/**
 * Configura botão enviar
 */
function setupSendButton() {

  const sendBtn =
    document.querySelector(".btn-send");

  if (!sendBtn) return;

  sendBtn.type = "button";

  sendBtn.innerHTML = "➤";

  sendBtn.setAttribute(
    "aria-label",
    "Enviar mensagem"
  );

  sendBtn.style.pointerEvents = "auto";

  sendBtn.style.userSelect = "none";
}

/**
 * Atualiza UI
 */
export function updateUIState(appState) {

  updateSendButton(appState);

  updateInputField(appState);

  updateChatMessages(appState);
}

/**
 * Atualiza botão enviar
 */
function updateSendButton(appState) {

  const sendBtn =
    document.querySelector(".btn-send");

  const inputField =
    document.querySelector(".input-field");

  if (!sendBtn || !inputField) return;

  const hasText =
    inputField.value.trim().length > 0;

  const isDisabled =
    appState.isLoading || !hasText;

  sendBtn.disabled = isDisabled;

  /**
   * ESTILOS IMPORTANTES
   */

  sendBtn.style.opacity =
    isDisabled ? "0.5" : "1";

  sendBtn.style.cursor =
    isDisabled
      ? "not-allowed"
      : "pointer";

  sendBtn.style.pointerEvents =
    isDisabled
      ? "none"
      : "auto";
}

/**
 * Atualiza input
 */
function updateInputField(appState) {

  const inputField =
    document.querySelector(".input-field");

  if (!inputField) return;

  inputField.disabled =
    appState.isLoading;

  inputField.style.opacity =
    appState.isLoading
      ? "0.6"
      : "1";
}

/**
 * Atualiza mensagens
 */
function updateChatMessages(appState) {

  const chatMessages =
    document.querySelector(".chat-messages");

  if (!chatMessages) return;

  const emptyState =
    chatMessages.querySelector(
      ".empty-state"
    );

  if (
    appState.messages.length > 0 &&
    emptyState
  ) {
    emptyState.remove();
  }
}

/**
 * Toast
 */
export function showNotification(
  message,
  type = "info",
  duration = 3000
) {

  const notification =
    document.createElement("div");

  notification.className =
    `alert alert-${type}`;

  notification.style.position =
    "fixed";

  notification.style.top =
    "20px";

  notification.style.right =
    "20px";

  notification.style.zIndex =
    "9999";

  notification.style.maxWidth =
    "400px";

  notification.textContent =
    message;

  document.body.appendChild(
    notification
  );

  setTimeout(() => {

    notification.remove();

  }, duration);
}

/**
 * Modal confirmação
 */
export function showConfirmDialog(
  message,
  onConfirm,
  onCancel
) {

  const confirmed =
    confirm(message);

  if (confirmed) {
    onConfirm?.();
  } else {
    onCancel?.();
  }
}

/**
 * Spinner global
 */
export function showLoadingSpinner(
  message = "Carregando..."
) {

  const spinner =
    document.createElement("div");

  spinner.id = "global-spinner";

  spinner.style.position = "fixed";

  spinner.style.top = "50%";

  spinner.style.left = "50%";

  spinner.style.transform =
    "translate(-50%, -50%)";

  spinner.style.zIndex = "9999";

  spinner.style.textAlign = "center";

  spinner.innerHTML = `
    <div
      style="
        font-size:48px;
        margin-bottom:12px;
      "
    >
      ⚙️
    </div>

    <p>${message}</p>
  `;

  document.body.appendChild(
    spinner
  );

  return spinner;
}

/**
 * Remove spinner
 */
export function hideLoadingSpinner() {

  const spinner =
    document.getElementById(
      "global-spinner"
    );

  if (spinner) {
    spinner.remove();
  }
}

/**
 * Copiar texto
 */
export async function copyToClipboard(
  text
) {

  try {

    await navigator.clipboard.writeText(
      text
    );

    showNotification(
      "Texto copiado",
      "success",
      2000
    );

    return true;

  } catch (error) {

    console.error(
      "Erro ao copiar:",
      error
    );

    showNotification(
      "Erro ao copiar",
      "error",
      2000
    );

    return false;
  }
}

/**
 * Abrir link
 */
export function openLink(url) {

  if (!url) return;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

/**
 * Formata moeda
 */
export function formatCurrency(value) {

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  ).format(value);
}

/**
 * Formata data
 */
export function formatDate(date) {

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(new Date(date));
}

/**
 * Tempo relativo
 */
export function formatRelativeTime(
  date
) {

  const now = new Date();

  const diff =
    now - new Date(date);

  const seconds =
    Math.floor(diff / 1000);

  const minutes =
    Math.floor(seconds / 60);

  const hours =
    Math.floor(minutes / 60);

  const days =
    Math.floor(hours / 24);

  if (seconds < 60) {
    return "agora";
  }

  if (minutes < 60) {
    return `${minutes}m atrás`;
  }

  if (hours < 24) {
    return `${hours}h atrás`;
  }

  if (days < 7) {
    return `${days}d atrás`;
  }

  return formatDate(date);
}

/**
 * Trunca texto
 */
export function truncateText(
  text,
  maxLength = 100
) {

  if (
    text.length <= maxLength
  ) {
    return text;
  }

  return (
    text.substring(
      0,
      maxLength
    ) + "..."
  );
}

/**
 * Highlight termo
 */
export function highlightTerm(
  text,
  term
) {

  if (!term) return text;

  const regex =
    new RegExp(
      `(${term})`,
      "gi"
    );

  return text.replace(
    regex,
    "<mark>$1</mark>"
  );
}