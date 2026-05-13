/**
 * Sidebar.js - Gerenciamento da barra lateral
 */

import { loadChatHistory, removeChatFromHistory } from './storage.js';
import { loadPreviousChat, clearChat } from './chat.js';

/**
 * Inicializa a sidebar
 */
export function initializeSidebar(appState) {
  renderChatHistory(appState);
  setupSidebarEvents(appState);
}

/**
 * Renderiza o histórico de chats na sidebar
 */
function renderChatHistory(appState) {
  const chatHistory = document.querySelector('.chat-history');
  if (!chatHistory) return;

  chatHistory.innerHTML = '';

  const history = loadChatHistory();

  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.style.padding = 'var(--spacing-lg)';
    empty.style.textAlign = 'center';
    empty.style.color = 'var(--color-text-tertiary)';
    empty.style.fontSize = 'var(--font-size-sm)';
    empty.textContent = 'Nenhuma conversa ainda';
    chatHistory.appendChild(empty);
    return;
  }

  history.forEach(chat => {
    const item = document.createElement('button');
    item.className = 'chat-history-item';
    if (chat.id === appState.currentChatId) {
      item.classList.add('active');
    }

    const textEl = document.createElement('span');
    textEl.className = 'chat-history-item-text';
    textEl.textContent = chat.title || 'Conversa';
    textEl.title = chat.title || 'Conversa';
    item.appendChild(textEl);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'chat-history-item-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Deletar conversa';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteChat(chat.id, appState);
    });
    item.appendChild(deleteBtn);

    item.addEventListener('click', () => {
      handleLoadChat(chat.id, appState);
    });

    chatHistory.appendChild(item);
  });
}

/**
 * Configura os eventos da sidebar
 */
function setupSidebarEvents(appState) {
  const newChatBtn = document.querySelector('.new-chat-btn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => handleNewChat(appState));
  }
}

/**
 * Manipula o clique em um chat anterior
 */
function handleLoadChat(chatId, appState) {
  appState.currentChatId = chatId;
  loadPreviousChat(chatId, appState);
  updateSidebarActive(chatId);
  closeSidebar(appState);
}

/**
 * Manipula a criação de um novo chat
 */
function handleNewChat(appState) {
  appState.currentChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  appState.messages = [];
  
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }

  renderChatHistory(appState);
  updateSidebarActive(appState.currentChatId);
  closeSidebar(appState);

  const inputField = document.querySelector('.input-field');
  if (inputField) {
    inputField.focus();
  }
}

/**
 * Manipula a exclusão de um chat
 */
function handleDeleteChat(chatId, appState) {
  if (confirm('Tem certeza que deseja deletar esta conversa?')) {
    removeChatFromHistory(chatId);
    
    if (chatId === appState.currentChatId) {
      handleNewChat(appState);
    } else {
      renderChatHistory(appState);
    }
  }
}

/**
 * Atualiza o item ativo na sidebar
 */
function updateSidebarActive(chatId) {
  const items = document.querySelectorAll('.chat-history-item');
  items.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.chatId === chatId) {
      item.classList.add('active');
    }
  });
}

/**
 * Alterna a sidebar (mobile)
 */
export function toggleSidebar(appState) {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (!sidebar) return;

  const isActive = sidebar.classList.contains('active');

  if (isActive) {
    closeSidebar(appState);
  } else {
    openSidebar(appState);
  }
}

/**
 * Abre a sidebar
 */
function openSidebar(appState) {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (sidebar) {
    sidebar.classList.add('active');
  }

  if (overlay) {
    overlay.classList.add('active');
  }

  document.body.style.overflow = 'hidden';
}

/**
 * Fecha a sidebar
 */
export function closeSidebar(appState) {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (sidebar) {
    sidebar.classList.remove('active');
  }

  if (overlay) {
    overlay.classList.remove('active');
  }

  document.body.style.overflow = '';
}

/**
 * Atualiza a sidebar (chamado quando o histórico muda)
 */
export function updateSidebar(appState) {
  renderChatHistory(appState);
}
