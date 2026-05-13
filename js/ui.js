/**
 * UI.js - Gerenciamento da interface do usuário
 */

/**
 * Inicializa a UI
 */
export function initializeUI(appState) {
  setupEmptyState();
  setupInputField();
  setupSendButton();
  updateUIState(appState);
}

/**
 * Configura o estado vazio (primeira vez)
 */
function setupEmptyState() {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  // Verificar se já há mensagens
  if (chatMessages.children.length === 0) {
    renderEmptyState();
  }
}

/**
 * Renderiza o estado vazio
 */
function renderEmptyState() {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  chatMessages.innerHTML = '';

  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state animate-fade-in';

  const title = document.createElement('h1');
  title.className = 'empty-state-title';
  title.textContent = 'ÉFato';
  emptyState.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'empty-state-subtitle';
  subtitle.textContent = 'IA que testa o que você confia.';
  emptyState.appendChild(subtitle);

  const description = document.createElement('p');
  description.className = 'empty-state-description';
  description.textContent = 'O ÉFato busca priorizar fontes oficiais e verificáveis para análise de informações políticas.';
  emptyState.appendChild(description);

  const warning = document.createElement('p');
  warning.className = 'empty-state-warning';
  warning.textContent = '💡 Dica: Você pode fazer perguntas sobre políticas, leis, notícias e informações públicas.';
  emptyState.appendChild(warning);

  // Sugestões
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'suggestions-container';

  const suggestions = [
    'O governo aumentou imposto sobre compras internacionais?',
    'Essa notícia é verdadeira?',
    'O que diz a Câmara sobre reforma tributária?',
    'Existe projeto de lei sobre taxação digital?',
    'O Senado aprovou mudanças no imposto de renda?'
  ];

  suggestions.forEach(suggestion => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = suggestion;
    btn.addEventListener('click', () => {
      const inputField = document.querySelector('.input-field');
      if (inputField) {
        inputField.value = suggestion;
        inputField.focus();
      }
    });
    suggestionsContainer.appendChild(btn);
  });

  emptyState.appendChild(suggestionsContainer);
  chatMessages.appendChild(emptyState);
}

/**
 * Configura o campo de input
 */
function setupInputField() {
  const inputField = document.querySelector('.input-field');
  if (!inputField) return;

  // Auto-resize
  inputField.addEventListener('input', () => {
    inputField.style.height = 'auto';
    inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
  });

  // Placeholder dinâmico
  const placeholders = [
    'Faça uma pergunta sobre política...',
    'Verifique uma informação...',
    'Pergunte sobre leis e projetos...'
  ];

  const randomPlaceholder = placeholders[Math.floor(Math.random() * placeholders.length)];
  inputField.placeholder = randomPlaceholder;
}

/**
 * Configura o botão de enviar
 */
function setupSendButton() {
  const sendBtn = document.querySelector('.btn-send');
  if (!sendBtn) return;

  sendBtn.textContent = '➤';
  sendBtn.setAttribute('aria-label', 'Enviar mensagem');
}

/**
 * Atualiza o estado da UI baseado no estado da app
 */
export function updateUIState(appState) {
  updateSendButton(appState);
  updateInputField(appState);
  updateChatMessages(appState);
}

/**
 * Atualiza o botão de enviar
 */
function updateSendButton(appState) {
  const sendBtn = document.querySelector('.btn-send');
  const inputField = document.querySelector('.input-field');

  if (!sendBtn || !inputField) return;

  const hasText = inputField.value.trim().length > 0;
  const isDisabled = appState.isLoading || !hasText;

  sendBtn.disabled = isDisabled;
  sendBtn.style.opacity = isDisabled ? '0.5' : '1';
  sendBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
}

/**
 * Atualiza o campo de input
 */
function updateInputField(appState) {
  const inputField = document.querySelector('.input-field');
  if (!inputField) return;

  inputField.disabled = appState.isLoading;
  inputField.style.opacity = appState.isLoading ? '0.6' : '1';
}

/**
 * Atualiza a área de mensagens
 */
function updateChatMessages(appState) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  // Remover estado vazio se houver mensagens
  const emptyState = chatMessages.querySelector('.empty-state');
  if (appState.messages.length > 0 && emptyState) {
    emptyState.remove();
  }
}

/**
 * Mostra um toast/notificação
 */
export function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} animate-slide-in-down`;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = 'var(--z-tooltip)';
  notification.style.maxWidth = '400px';
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Mostra um modal de confirmação
 */
export function showConfirmDialog(message, onConfirm, onCancel) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = 'var(--z-modal)';

  const content = document.createElement('div');
  content.className = 'card';
  content.style.maxWidth = '400px';
  content.style.padding = 'var(--spacing-2xl)';

  const title = document.createElement('h2');
  title.textContent = 'Confirmação';
  title.style.marginBottom = 'var(--spacing-lg)';
  content.appendChild(title);

  const text = document.createElement('p');
  text.textContent = message;
  text.style.marginBottom = 'var(--spacing-2xl)';
  content.appendChild(text);

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = 'var(--spacing-md)';
  actions.style.justifyContent = 'flex-end';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.addEventListener('click', () => {
    modal.remove();
    onCancel?.();
  });
  actions.appendChild(cancelBtn);

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn';
  confirmBtn.textContent = 'Confirmar';
  confirmBtn.addEventListener('click', () => {
    modal.remove();
    onConfirm?.();
  });
  actions.appendChild(confirmBtn);

  content.appendChild(actions);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

/**
 * Mostra um loading spinner
 */
export function showLoadingSpinner(message = 'Carregando...') {
  const spinner = document.createElement('div');
  spinner.id = 'global-spinner';
  spinner.style.position = 'fixed';
  spinner.style.top = '50%';
  spinner.style.left = '50%';
  spinner.style.transform = 'translate(-50%, -50%)';
  spinner.style.zIndex = 'var(--z-modal)';
  spinner.style.textAlign = 'center';

  const icon = document.createElement('div');
  icon.style.fontSize = '48px';
  icon.style.marginBottom = 'var(--spacing-md)';
  icon.className = 'animate-spin';
  icon.textContent = '⚙️';
  spinner.appendChild(icon);

  const text = document.createElement('p');
  text.textContent = message;
  text.style.color = 'var(--color-text-secondary)';
  spinner.appendChild(text);

  document.body.appendChild(spinner);
  return spinner;
}

/**
 * Remove o loading spinner
 */
export function hideLoadingSpinner() {
  const spinner = document.getElementById('global-spinner');
  if (spinner) {
    spinner.remove();
  }
}

/**
 * Copia texto para a área de transferência
 */
export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
    showNotification('Copiado para a área de transferência!', 'success', 2000);
    return true;
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    showNotification('Erro ao copiar', 'error', 2000);
    return false;
  });
}

/**
 * Abre um link em nova aba
 */
export function openLink(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Formata um número como moeda
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata uma data
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

/**
 * Formata tempo relativo
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'agora';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;

  return formatDate(date);
}

/**
 * Trunca um texto
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Destaca um termo em um texto
 */
export function highlightTerm(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
