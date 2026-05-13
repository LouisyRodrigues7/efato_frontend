/**
 * Chat.js - Gerenciamento do chat e mensagens
 */

import { sendQuestion, formatAnalysisResponse } from './api.js';
import { saveChatMessages, loadChatMessages, addChatToHistory } from './storage.js';
import { renderMarkdown } from './markdown.js';

/**
 * Inicializa o sistema de chat
 */
export function initializeChat(appState) {
  if (appState.currentChatId) {
    appState.messages = loadChatMessages(appState.currentChatId);
  }
}

/**
 * Envia uma mensagem
 */
export async function sendMessage(userMessage, appState) {
  try {
    addMessageToChat(userMessage, 'user', appState);
    renderMessage(userMessage, 'user');

    showLoadingIndicator();

    const response = await sendQuestion(userMessage);

    removeLoadingIndicator();

    const formattedResponse = formatAnalysisResponse(response);

    renderAnalysisResponse(formattedResponse, response);

    addMessageToChat(
      JSON.stringify(formattedResponse),
      'assistant',
      appState,
      { analysis: response }
    );

    const title = userMessage.substring(0, 50);

    addChatToHistory(appState.currentChatId, title);

    scrollToBottom();

  } catch (error) {
    removeLoadingIndicator();
    handleChatError(error);
  }
}

/**
 * Adiciona mensagem
 */
function addMessageToChat(content, role, appState, metadata = {}) {
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    content,
    role,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  appState.messages.push(message);
  saveChatMessages(appState.currentChatId, appState.messages);

  return message;
}

/**
 * Render simples
 */
function renderMessage(content, role) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = content;

  chatMessages.appendChild(div);
}

/**
 * Render resposta IA
 */
function renderAnalysisResponse(formatted) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  const el = document.createElement('div');
  el.className = 'message assistant';

  el.innerHTML = `
    <div class="markdown-content">
      ${renderMarkdown(formatted.summary)}
    </div>
  `;

  chatMessages.appendChild(el);
}

/**
 * LIMPAR CHAT (EXPORT NECESSÁRIO PARA SIDEBAR)
 */
export function clearChat(appState) {
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) chatMessages.innerHTML = '';

  appState.messages = [];
}

/**
 * FUNÇÃO NECESSÁRIA PARA SIDEBAR (ANTES ESTAVA FALTANDO)
 */
export function loadPreviousChat(chatId, appState) {
  const messages = loadChatMessages(chatId);

  appState.messages = messages;

  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  chatMessages.innerHTML = '';

  messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = `message ${msg.role}`;
    div.textContent = msg.content;
    chatMessages.appendChild(div);
  });
}