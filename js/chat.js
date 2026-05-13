/**
 * Chat.js - Gerenciamento do chat e mensagens
 */

import { sendQuestion, formatAnalysisResponse, APIError } from './api.js';
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

    // FIX: evita chamada duplicada
    const updatedHistory = addChatToHistory(appState.currentChatId, title);
    appState.chatHistory = updatedHistory;

    scrollToBottom();

  } catch (error) {
    removeLoadingIndicator();
    handleChatError(error);
  }
}

/**
 * Adiciona uma mensagem ao chat
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
 * Renderiza mensagem simples
 */
function renderMessage(content, role) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  const messageEl = createMessageElement(content, role);
  chatMessages.appendChild(messageEl);
}

/**
 * Renderiza resposta estruturada
 */
function renderAnalysisResponse(formatted, analysis) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;

  const messageEl = document.createElement('div');
  messageEl.className = 'message assistant animate-slide-in-up';

  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';

  const summaryEl = document.createElement('div');
  summaryEl.className = 'markdown-content';
  summaryEl.innerHTML = renderMarkdown(formatted.summary);
  contentEl.appendChild(summaryEl);

  if (formatted.analysis) {
    const analysisEl = document.createElement('div');
    analysisEl.className = 'markdown-content';
    analysisEl.style.marginTop = 'var(--spacing-md)';
    analysisEl.innerHTML = renderMarkdown(formatted.analysis);
    contentEl.appendChild(analysisEl);
  }

  if (formatted.evidence?.length) {
    contentEl.appendChild(createEvidenceSection(formatted.evidence));
  }

  if (formatted.confidence > 0) {
    contentEl.appendChild(createReliabilityCard(formatted.confidence));
  }

  if (formatted.sources?.length) {
    contentEl.appendChild(createSourcesSection(formatted.sources));
  }

  if (formatted.divergences?.length) {
    contentEl.appendChild(createDivergencesSection(formatted.divergences));
  }

  messageEl.appendChild(contentEl);
  messageEl.appendChild(createMessageActions());

  chatMessages.appendChild(messageEl);
}

/**
 * restante do arquivo permanece igual
 * (sem alterações estruturais)
 */