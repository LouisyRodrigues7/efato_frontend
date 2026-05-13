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
  // Carregar mensagens do chat atual se existir
  if (appState.currentChatId) {
    appState.messages = loadChatMessages(appState.currentChatId);
  }
}

/**
 * Envia uma mensagem
 */
export async function sendMessage(userMessage, appState) {
  try {
    // Adicionar mensagem do usuário
    addMessageToChat(userMessage, 'user', appState);
    
    // Renderizar mensagem do usuário
    renderMessage(userMessage, 'user');
    
    // Mostrar indicador de carregamento
    showLoadingIndicator();
    
    // Enviar para API
    const response = await sendQuestion(userMessage);
    
    // Remover indicador de carregamento
    removeLoadingIndicator();
    
    // Processar resposta
    const formattedResponse = formatAnalysisResponse(response);
    
    // Renderizar resposta
    renderAnalysisResponse(formattedResponse, response);
    
    // Adicionar mensagem da IA ao histórico
    addMessageToChat(
      JSON.stringify(formattedResponse),
      'assistant',
      appState,
      { analysis: response }
    );
    
    // Atualizar histórico de chats
    const title = userMessage.substring(0, 50);
    addChatToHistory(appState.currentChatId, title);
    appState.chatHistory = addChatToHistory(appState.currentChatId, title);
    
    // Scroll automático
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
    content: content,
    role: role,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  appState.messages.push(message);
  saveChatMessages(appState.currentChatId, appState.messages);
  
  return message;
}

/**
 * Renderiza uma mensagem simples
 */
function renderMessage(content, role) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
  const messageEl = createMessageElement(content, role);
  chatMessages.appendChild(messageEl);
}

/**
 * Renderiza a resposta de análise completa
 */
function renderAnalysisResponse(formatted, analysis) {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'message assistant animate-slide-in-up';
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  
  // Resumo
  const summaryEl = document.createElement('div');
  summaryEl.className = 'markdown-content';
  summaryEl.innerHTML = renderMarkdown(formatted.summary);
  contentEl.appendChild(summaryEl);
  
  // Análise
  if (formatted.analysis) {
    const analysisEl = document.createElement('div');
    analysisEl.className = 'markdown-content';
    analysisEl.style.marginTop = 'var(--spacing-md)';
    analysisEl.innerHTML = renderMarkdown(formatted.analysis);
    contentEl.appendChild(analysisEl);
  }
  
  // Evidências
  if (formatted.evidence && formatted.evidence.length > 0) {
    const evidenceEl = createEvidenceSection(formatted.evidence);
    contentEl.appendChild(evidenceEl);
  }
  
  // Confiabilidade
  if (formatted.confidence > 0) {
    const reliabilityEl = createReliabilityCard(formatted.confidence);
    contentEl.appendChild(reliabilityEl);
  }
  
  // Fontes
  if (formatted.sources && formatted.sources.length > 0) {
    const sourcesEl = createSourcesSection(formatted.sources);
    contentEl.appendChild(sourcesEl);
  }
  
  // Divergências
  if (formatted.divergences && formatted.divergences.length > 0) {
    const divergencesEl = createDivergencesSection(formatted.divergences);
    contentEl.appendChild(divergencesEl);
  }
  
  messageEl.appendChild(contentEl);
  
  // Ações da mensagem
  const actionsEl = createMessageActions();
  messageEl.appendChild(actionsEl);
  
  chatMessages.appendChild(messageEl);
}

/**
 * Cria um elemento de mensagem
 */
function createMessageElement(content, role) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role} animate-slide-in-up`;
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.textContent = content;
  
  messageEl.appendChild(contentEl);
  
  if (role === 'assistant') {
    const actionsEl = createMessageActions();
    messageEl.appendChild(actionsEl);
  }
  
  return messageEl;
}

/**
 * Cria a seção de evidências
 */
function createEvidenceSection(evidence) {
  const section = document.createElement('div');
  section.style.marginTop = 'var(--spacing-lg)';
  
  const title = document.createElement('h4');
  title.textContent = '📋 Evidências';
  title.style.marginBottom = 'var(--spacing-md)';
  section.appendChild(title);
  
  evidence.forEach(item => {
    const card = document.createElement('div');
    card.className = 'evidence-card';
    
    const itemTitle = document.createElement('h5');
    itemTitle.className = 'evidence-card-title';
    itemTitle.textContent = item.title || item.name || 'Evidência';
    card.appendChild(itemTitle);
    
    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'evidence-card-description';
      desc.textContent = item.description;
      card.appendChild(desc);
    }
    
    section.appendChild(card);
  });
  
  return section;
}

/**
 * Cria o card de confiabilidade
 */
function createReliabilityCard(confidence) {
  const card = document.createElement('div');
  card.className = 'reliability-card';
  card.style.marginTop = 'var(--spacing-lg)';
  
  const header = document.createElement('div');
  header.className = 'reliability-header';
  
  const title = document.createElement('h4');
  title.className = 'reliability-title';
  title.textContent = '🎯 Confiabilidade';
  header.appendChild(title);
  
  const badge = document.createElement('span');
  badge.className = 'reliability-badge';
  
  if (confidence >= 80) {
    badge.classList.add('high');
    badge.textContent = '✓ Alta';
  } else if (confidence >= 50) {
    badge.classList.add('medium');
    badge.textContent = '⚠ Média';
  } else {
    badge.classList.add('low');
    badge.textContent = '✗ Baixa';
  }
  
  header.appendChild(badge);
  card.appendChild(header);
  
  const bar = document.createElement('div');
  bar.className = 'reliability-bar';
  const fill = document.createElement('div');
  fill.className = 'reliability-bar-fill';
  fill.style.width = `${Math.min(confidence, 100)}%`;
  bar.appendChild(fill);
  card.appendChild(bar);
  
  const percentage = document.createElement('p');
  percentage.style.textAlign = 'center';
  percentage.style.margin = '0';
  percentage.textContent = `${Math.round(confidence)}% de confiabilidade`;
  card.appendChild(percentage);
  
  return card;
}

/**
 * Cria a seção de fontes
 */
function createSourcesSection(sources) {
  const section = document.createElement('div');
  section.style.marginTop = 'var(--spacing-lg)';
  
  const title = document.createElement('h4');
  title.textContent = '📚 Fontes';
  title.style.marginBottom = 'var(--spacing-md)';
  section.appendChild(title);
  
  sources.forEach(source => {
    const card = document.createElement('a');
    card.className = 'source-card';
    if (source.official) card.classList.add('official');
    card.href = source.url || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    
    const sourceTitle = document.createElement('div');
    sourceTitle.className = 'source-card-title';
    sourceTitle.textContent = source.title || 'Sem título';
    card.appendChild(sourceTitle);
    
    if (source.excerpt) {
      const excerpt = document.createElement('p');
      excerpt.className = 'source-card-excerpt';
      excerpt.textContent = source.excerpt;
      card.appendChild(excerpt);
    }
    
    if (source.url) {
      const link = document.createElement('div');
      link.className = 'source-card-link';
      link.textContent = source.url;
      card.appendChild(link);
    }
    
    section.appendChild(card);
  });
  
  return section;
}

/**
 * Cria a seção de divergências
 */
function createDivergencesSection(divergences) {
  const section = document.createElement('div');
  section.style.marginTop = 'var(--spacing-lg)';
  
  const title = document.createElement('h4');
  title.textContent = '⚠️ Divergências';
  title.style.marginBottom = 'var(--spacing-md)';
  section.appendChild(title);
  
  const alert = document.createElement('div');
  alert.className = 'alert warning';
  
  const list = document.createElement('ul');
  divergences.forEach(div => {
    const item = document.createElement('li');
    item.textContent = typeof div === 'string' ? div : div.description || div;
    list.appendChild(item);
  });
  
  alert.appendChild(list);
  section.appendChild(alert);
  
  return section;
}

/**
 * Cria as ações da mensagem
 */
function createMessageActions() {
  const actions = document.createElement('div');
  actions.className = 'message-actions';
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'message-action-btn';
  copyBtn.textContent = '📋';
  copyBtn.title = 'Copiar';
  copyBtn.addEventListener('click', (e) => copyMessageToClipboard(e));
  actions.appendChild(copyBtn);
  
  return actions;
}

/**
 * Copia a mensagem para a área de transferência
 */
function copyMessageToClipboard(event) {
  const messageContent = event.target.closest('.message')?.querySelector('.message-content');
  if (!messageContent) return;
  
  const text = messageContent.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

/**
 * Mostra o indicador de carregamento
 */
function showLoadingIndicator() {
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
  const loadingEl = document.createElement('div');
  loadingEl.className = 'message assistant loading';
  loadingEl.id = 'loading-indicator';
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-indicator-dot';
    typingEl.appendChild(dot);
  }
  
  const text = document.createElement('span');
  text.textContent = ' ÉFato está analisando...';
  text.style.marginLeft = 'var(--spacing-sm)';
  
  contentEl.appendChild(typingEl);
  contentEl.appendChild(text);
  loadingEl.appendChild(contentEl);
  
  chatMessages.appendChild(loadingEl);
  scrollToBottom();
}

/**
 * Remove o indicador de carregamento
 */
function removeLoadingIndicator() {
  const loadingEl = document.getElementById('loading-indicator');
  if (loadingEl) {
    loadingEl.remove();
  }
}

/**
 * Faz scroll automático para o final
 */
function scrollToBottom() {
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  }
}

/**
 * Manipula erros do chat
 */
function handleChatError(error) {
  console.error('Erro no chat:', error);
  
  const chatMessages = document.querySelector('.chat-messages');
  if (!chatMessages) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'message assistant error animate-slide-in-up';
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  
  let errorMessage = 'Desculpe, ocorreu um erro ao processar sua pergunta.';
  
  if (error instanceof APIError) {
    if (error.code === 'TIMEOUT') {
      errorMessage = 'A requisição demorou muito. Tente novamente.';
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    } else {
      errorMessage = error.message;
    }
  }
  
  contentEl.textContent = errorMessage;
  messageEl.appendChild(contentEl);
  chatMessages.appendChild(messageEl);
  
  scrollToBottom();
}

/**
 * Limpa o chat
 */
export function clearChat(appState) {
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
  }
  appState.messages = [];
}

/**
 * Carrega um chat anterior
 */
export function loadPreviousChat(chatId, appState) {
  appState.currentChatId = chatId;
  appState.messages = loadChatMessages(chatId);
  
  const chatMessages = document.querySelector('.chat-messages');
  if (chatMessages) {
    chatMessages.innerHTML = '';
    
    appState.messages.forEach(msg => {
      if (msg.role === 'user') {
        renderMessage(msg.content, 'user');
      } else if (msg.analysis) {
        renderAnalysisResponse(
          JSON.parse(msg.content),
          msg.analysis
        );
      } else {
        renderMessage(msg.content, 'assistant');
      }
    });
    
    scrollToBottom();
  }
}
