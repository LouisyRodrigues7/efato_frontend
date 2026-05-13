/**
 * Main.js - Arquivo principal da aplicação ÉFato
 * Gerencia a inicialização e coordenação dos módulos
 */

import { initializeTheme, toggleTheme } from './theme.js';
import { initializeChat, sendMessage, clearChat } from './chat.js';
import { initializeUI, updateUIState } from './ui.js';
import { loadChatHistory, saveChatHistory } from './storage.js';
import { initializeSidebar, toggleSidebar, closeSidebar } from './sidebar.js';

/**
 * Estado global da aplicação
 */
const appState = {
  isLoading: false,
  currentChatId: null,
  messages: [],
  chatHistory: [],
  theme: 'dark',

  // FIX: antes estava localhost fixo (isso quebra no deploy)
  apiEndpoint: getApiEndpoint()
};

/**
 * Define automaticamente endpoint correto
 */
function getApiEndpoint() {
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:3000/api/analyze';
  }

  return 'https://newbackteste.onrender.com/api/analyze';
}

/**
 * Inicializa a aplicação
 */
async function initializeApp() {
  try {
    console.log('🚀 Inicializando ÉFato...');

    initializeTheme();

    appState.chatHistory = loadChatHistory();

    initializeUI(appState);
    initializeChat(appState);
    initializeSidebar(appState);

    setupEventListeners();

    appState.currentChatId = generateChatId();

    console.log('✅ ÉFato inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar ÉFato:', error);
    showErrorNotification('Erro ao inicializar a aplicação');
  }
}

/**
 * Configura os event listeners globais
 */
function setupEventListeners() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      themeToggle.classList.add('switching');
      setTimeout(() => {
        themeToggle.classList.remove('switching');
      }, 400);
    });
  }

  const inputField = document.querySelector('.input-field');
  const sendBtn = document.querySelector('.btn-send');

  if (inputField) {
    inputField.addEventListener('keydown', handleInputKeydown);
    inputField.addEventListener('input', handleInputChange);
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }

  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => toggleSidebar(appState));
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => closeSidebar(appState));
  }

  const clearChatBtn = document.querySelector('[data-action="clear-chat"]');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', handleClearChat);
  }

  const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', handleSuggestionClick);
  });

  window.addEventListener('resize', adjustLayout);
}

/**
 * Envio de mensagem
 */
async function handleSendMessage() {
  const inputField = document.querySelector('.input-field');
  const message = inputField.value.trim();

  if (!message) return;

  try {
    appState.isLoading = true;
    updateUIState(appState);

    await sendMessage(message, appState);

    inputField.value = '';
    inputField.style.height = 'auto';

    saveChatHistory(appState.chatHistory);

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    showErrorNotification('Erro ao enviar mensagem');
  } finally {
    appState.isLoading = false;
    updateUIState(appState);
  }
}

function handleInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
}

function handleInputChange(event) {
  const inputField = event.target;
  inputField.style.height = 'auto';
  inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
}

function handleSuggestionClick(event) {
  const suggestion = event.target.textContent;
  const inputField = document.querySelector('.input-field');

  inputField.value = suggestion;
  inputField.focus();
  inputField.style.height = 'auto';
}

async function handleClearChat() {
  if (confirm('Tem certeza que deseja limpar o histórico desta conversa?')) {
    clearChat(appState);
    appState.currentChatId = generateChatId();
    appState.messages = [];
    saveChatHistory(appState.chatHistory);
    updateUIState(appState);
  }
}

function adjustLayout() {
  const sidebar = document.querySelector('.sidebar');
  const isMobile = window.innerWidth <= 768;

  if (isMobile && sidebar && sidebar.classList.contains('active')) {
    closeSidebar(appState);
  }
}

function generateChatId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function showErrorNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'alert alert.error';
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = 'var(--z-tooltip)';
  notification.style.maxWidth = '400px';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

window.appState = appState;