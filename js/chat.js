/**
 * chat.js
 * Gerenciamento simples do chat
 */

import { sendQuestion } from "./api.js";

import {
  saveChatMessages,
  loadChatMessages,
  addChatToHistory
} from "./storage.js";

import { renderMarkdown } from "./markdown.js";

export function initializeChat(appState) {

  if (!appState.currentChatId) return;

  appState.messages =
    loadChatMessages(appState.currentChatId) || [];

  renderStoredMessages(appState.messages);
}

export async function sendMessage(userMessage, appState) {

  if (!userMessage || !userMessage.trim()) {
    return;
  }

  try {

    addUserMessage(userMessage, appState);

    showLoading();

    const response = await sendQuestion(userMessage);

    removeLoading();

    addAssistantMessage(response, appState);

    const title =
      userMessage.substring(0, 40);

    addChatToHistory(
      appState.currentChatId,
      title
    );

    scrollBottom();

  } catch (error) {

    console.error("Erro no chat:", error);

    removeLoading();

    showError(error);
  }
}

function addUserMessage(content, appState) {

  const message = {
    role: "user",
    content,
    timestamp: new Date().toISOString()
  };

  appState.messages.push(message);

  saveChatMessages(
    appState.currentChatId,
    appState.messages
  );

  renderMessage(content, "user");
}

function addAssistantMessage(response, appState) {

  const content = response.summary;

  const message = {
    role: "assistant",
    content,
    analysis: response,
    timestamp: new Date().toISOString()
  };

  appState.messages.push(message);

  saveChatMessages(
    appState.currentChatId,
    appState.messages
  );

  renderMessage(content, "assistant");
}

function renderMessage(content, role) {

  const container =
    document.querySelector(".chat-messages");

  if (!container) return;

  const div = document.createElement("div");

  div.className = `message ${role}`;

  if (role === "assistant") {

    div.innerHTML = `
      <div class="markdown-content">
        ${renderMarkdown(content)}
      </div>
    `;

  } else {

    div.textContent = content;
  }

  container.appendChild(div);

  scrollBottom();
}

function renderStoredMessages(messages) {

  const container =
    document.querySelector(".chat-messages");

  if (!container) return;

  container.innerHTML = "";

  messages.forEach((msg) => {

    renderMessage(
      msg.content,
      msg.role
    );
  });
}

function showLoading() {

  const container =
    document.querySelector(".chat-messages");

  if (!container) return;

  const loading = document.createElement("div");

  loading.className =
    "message assistant loading";

  loading.id = "chat-loading";

  loading.textContent =
    "Analisando informações...";

  container.appendChild(loading);

  scrollBottom();
}

function removeLoading() {

  const loading =
    document.getElementById("chat-loading");

  if (loading) {
    loading.remove();
  }
}

function showError(error) {

  const container =
    document.querySelector(".chat-messages");

  if (!container) return;

  const div = document.createElement("div");

  div.className = "message error";

  let message =
    "Erro ao processar requisição.";

  if (error.code === "TIMEOUT") {

    message =
      "O servidor demorou muito para responder.";

  } else if (error.code === "NETWORK_ERROR") {

    message =
      "Falha de conexão com o servidor.";

  }

  div.textContent = message;

  container.appendChild(div);

  scrollBottom();
}

export function clearChat(appState) {

  appState.messages = [];

  const container =
    document.querySelector(".chat-messages");

  if (container) {
    container.innerHTML = "";
  }
}

export function loadPreviousChat(chatId, appState) {

  const messages =
    loadChatMessages(chatId) || [];

  appState.messages = messages;

  renderStoredMessages(messages);
}

function scrollBottom() {

  const container =
    document.querySelector(".chat-messages");

  if (!container) return;

  container.scrollTop =
    container.scrollHeight;
}