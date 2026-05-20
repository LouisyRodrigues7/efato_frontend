/**
 * main.js
 * Arquivo principal do ÉFato
 */

import {
  initializeTheme
} from './theme.js';

import {
  initializeChat,
  sendMessage,
  clearChat
} from './chat.js';

import {
  initializeUI,
  updateUIState
} from './ui.js';

import {
  loadChatHistory,
  saveChatHistory
} from './storage.js';

import {
  initializeSidebar,
  toggleSidebar,
  closeSidebar
} from './sidebar.js';

/**
 * Estado global
 */
const appState = {
  isLoading: false,
  currentChatId: null,
  messages: [],
  chatHistory: [],
  theme: 'dark'
};

/**
 * Inicialização principal
 */
async function initializeApp() {

  try {

    console.log('🚀 Inicializando ÉFato');

    initializeTheme();

    appState.chatHistory =
      loadChatHistory() || [];

    appState.currentChatId =
      generateChatId();

    initializeUI(appState);

    initializeChat(appState);

    initializeSidebar(appState);

    setupEventListeners();

    console.log('✅ Aplicação pronta');

  } catch (error) {

    console.error(
      'Erro ao inicializar:',
      error
    );

    showErrorNotification(
      'Erro ao iniciar aplicação'
    );
  }
}

/**
 * Event listeners
 */
function setupEventListeners() {

  setupTheme();

  setupInput();

  setupSidebar();

  setupWindowEvents();
}

/**
 * Tema
 */
function setupTheme() {

  const themeToggle =
    document.querySelector('.theme-toggle');

  if (!themeToggle) return;

  themeToggle.addEventListener('click', () => {

    themeToggle.classList.add('switching');

    setTimeout(() => {
      themeToggle.classList.remove('switching');
    }, 400);
  });
}

/**
 * Input e envio
 */
function setupInput() {

  const inputField =
    document.querySelector('.input-field');

  const sendBtn =
    document.querySelector('.btn-send');

  if (inputField) {

    inputField.addEventListener(
      'keydown',
      handleInputKeydown
    );

    inputField.addEventListener(
      'input',
      handleInputResize
    );
  }

  if (sendBtn) {

    sendBtn.addEventListener(
      'click',
      async (event) => {

        event.preventDefault();

        await handleSendMessage();
      }
    );
  }
}

/**
 * Sidebar
 */
function setupSidebar() {

  const sidebarToggle =
    document.querySelector('.sidebar-toggle');

  const sidebarOverlay =
    document.querySelector('.sidebar-overlay');

  if (sidebarToggle) {

    sidebarToggle.addEventListener(
      'click',
      () => toggleSidebar(appState)
    );
  }

  if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
      'click',
      () => closeSidebar(appState)
    );
  }
}

/**
 * Eventos globais
 */
function setupWindowEvents() {

  window.addEventListener(
    'resize',
    adjustLayout
  );
}

/**
 * Envio principal
 */
async function handleSendMessage() {

  if (appState.isLoading) {
    return;
  }

  const inputField =
    document.querySelector('.input-field');

  if (!inputField) return;

  const message =
    inputField.value.trim();

  if (!message) return;

  try {

    appState.isLoading = true;

    updateUIState(appState);

    await sendMessage(
      message,
      appState
    );

    inputField.value = '';

    inputField.style.height = 'auto';

    saveChatHistory(
      appState.chatHistory
    );

  } catch (error) {

    console.error(
      'Erro ao enviar mensagem:',
      error
    );

    showErrorNotification(
      'Erro ao enviar mensagem'
    );

  } finally {

    appState.isLoading = false;

    updateUIState(appState);
  }
}

/**
 * Enter para envio
 */
function handleInputKeydown(event) {

  if (
    event.key === 'Enter' &&
    !event.shiftKey
  ) {

    event.preventDefault();

    handleSendMessage();
  }
}

/**
 * Resize textarea
 */
function handleInputResize(event) {

  const input =
    event.target;

  input.style.height = 'auto';

  input.style.height =
    Math.min(
      input.scrollHeight,
      120
    ) + 'px';
}

/**
 * Limpar chat
 */
async function handleClearChat() {

  const confirmed = confirm(
    'Deseja limpar esta conversa?'
  );

  if (!confirmed) return;

  clearChat(appState);

  appState.currentChatId =
    generateChatId();

  appState.messages = [];

  saveChatHistory(
    appState.chatHistory
  );

  updateUIState(appState);
}

/**
 * Ajuste layout responsivo
 */
function adjustLayout() {

  const sidebar =
    document.querySelector('.sidebar');

  const isMobile =
    window.innerWidth <= 768;

  if (
    isMobile &&
    sidebar &&
    sidebar.classList.contains('active')
  ) {

    closeSidebar(appState);
  }
}

/**
 * Gerador de ID
 */
function generateChatId() {

  return `chat_${
    Date.now()
  }_${
    Math.random()
      .toString(36)
      .substring(2, 10)
  }`;
}

/**
 * Notificação erro
 */
function showErrorNotification(message) {

  const notification =
    document.createElement('div');

  notification.className =
    'alert alert-error';

  notification.textContent =
    message;

  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '9999';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 4000);
}

/**
 * Boot
 */
if (
  document.readyState === 'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    initializeApp
  );

} else {

  initializeApp();
}

/**
 * Debug
 */
window.appState = appState;