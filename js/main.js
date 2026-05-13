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
  apiEndpoint: 'http://localhost:3000/api/analyze'
};

/**
 * Inicializa a aplicação
 */
async function initializeApp() {
  try {
    console.log('🚀 Inicializando ÉFato...');

    // Inicializar tema
    initializeTheme();
    
    // Carregar histórico de chats
    appState.chatHistory = loadChatHistory();
    
    // Inicializar componentes
    initializeUI(appState);
    initializeChat(appState);
    initializeSidebar(appState);
    
    // Configurar event listeners globais
    setupEventListeners();
    
    // Gerar novo ID de chat
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
  // Tema
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', handleThemeToggle);
  }

  // Input
  const inputField = document.querySelector('.input-field');
  const sendBtn = document.querySelector('.btn-send');
  
  if (inputField) {
    inputField.addEventListener('keydown', handleInputKeydown);
    inputField.addEventListener('input', handleInputChange);
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }

  // Sidebar
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => toggleSidebar(appState));
  }
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => closeSidebar(appState));
  }

  // Botões de ação
  const clearChatBtn = document.querySelector('[data-action="clear-chat"]');
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', handleClearChat);
  }

  // Sugestões
  const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', handleSuggestionClick);
  });

  // Scroll automático
  window.addEventListener('resize', adjustLayout);
}

/**
 * Manipula o clique no botão de enviar
 */
async function handleSendMessage() {
  const inputField = document.querySelector('.input-field');
  const message = inputField.value.trim();
  
  if (!message) return;
  
  try {
    appState.isLoading = true;
    updateUIState(appState);
    
    // Enviar mensagem
    await sendMessage(message, appState);
    
    // Limpar input
    inputField.value = '';
    inputField.style.height = 'auto';
    
    // Salvar histórico
    saveChatHistory(appState.chatHistory);
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    showErrorNotification('Erro ao enviar mensagem');
  } finally {
    appState.isLoading = false;
    updateUIState(appState);
  }
}

/**
 * Manipula a tecla Enter no input
 */
function handleInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendMessage();
  }
}

/**
 * Manipula mudanças no input (auto-resize)
 */
function handleInputChange(event) {
  const inputField = event.target;
  inputField.style.height = 'auto';
  inputField.style.height = Math.min(inputField.scrollHeight, 120) + 'px';
}

/**
 * Manipula o clique em sugestões
 */
function handleSuggestionClick(event) {
  const suggestion = event.target.textContent;
  const inputField = document.querySelector('.input-field');
  inputField.value = suggestion;
  inputField.focus();
  inputField.style.height = 'auto';
}

/**
 * Manipula o clique no botão de limpar chat
 */
async function handleClearChat() {
  if (confirm('Tem certeza que deseja limpar o histórico desta conversa?')) {
    clearChat(appState);
    appState.currentChatId = generateChatId();
    appState.messages = [];
    saveChatHistory(appState.chatHistory);
    updateUIState(appState);
  }
}

/**
 * Manipula a mudança de tema
 */
function handleThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.classList.add('switching');
    setTimeout(() => {
      toggleTheme();
      themeToggle.classList.remove('switching');
    }, 200);
  }
}

/**
 * Ajusta o layout responsivo
 */
function adjustLayout() {
  const sidebar = document.querySelector('.sidebar');
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile && sidebar && sidebar.classList.contains('active')) {
    closeSidebar(appState);
  }
}

/**
 * Gera um ID único para o chat
 */
function generateChatId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mostra notificação de erro
 */
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

/**
 * Inicia a aplicação quando o DOM está pronto
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Exportar estado para debug
window.appState = appState;
