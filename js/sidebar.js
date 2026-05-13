import { loadChatHistory, removeChatFromHistory } from './storage.js';
import { loadPreviousChat, clearChat } from './chat.js';

export function initializeSidebar(appState) {
  renderChatHistory(appState);
  setupSidebarEvents(appState);
}

function renderChatHistory(appState) {
  const chatHistory = document.querySelector('.chat-history');
  if (!chatHistory) return;

  chatHistory.innerHTML = '';

  const history = loadChatHistory();

  if (!history.length) {
    chatHistory.innerHTML = '<div class="empty">Nenhuma conversa</div>';
    return;
  }

  history.forEach(chat => {
    const item = document.createElement('button');
    item.className = 'chat-history-item';
    item.dataset.chatId = chat.id;

    item.textContent = chat.title || 'Conversa';

    item.addEventListener('click', () => {
      handleLoadChat(chat.id, appState);
    });

    chatHistory.appendChild(item);
  });
}

function setupSidebarEvents(appState) {
  const newChatBtn = document.querySelector('.new-chat-btn');

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => handleNewChat(appState));
  }
}

function handleLoadChat(chatId, appState) {
  appState.currentChatId = chatId;
  loadPreviousChat(chatId, appState);
  closeSidebar();
}

function handleNewChat(appState) {
  appState.currentChatId = `chat_${Date.now()}`;
  appState.messages = [];

  clearChat(appState);

  renderChatHistory(appState);
  closeSidebar();
}

export function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('active');
  document.querySelector('.sidebar-overlay')?.classList.remove('active');
}

export function updateSidebar(appState) {
  renderChatHistory(appState);
}