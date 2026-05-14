/**
 * chat.js
 * Gerenciamento do chat
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

    const response =
      await sendQuestion(userMessage);

    console.log(
      "[CHAT RESPONSE]",
      response
    );

    removeLoading();

    addAssistantMessage(
      response,
      appState
    );

    const title =
      userMessage.substring(0, 40);

    addChatToHistory(
      appState.currentChatId,
      title
    );

    scrollBottom();

  } catch (error) {

    console.error(
      "Erro no chat:",
      error
    );

    removeLoading();

    showError(error);
  }
}

function addUserMessage(content, appState) {

  const message = {

    role: "user",

    content,

    timestamp:
      new Date().toISOString()
  };

  appState.messages.push(message);

  saveChatMessages(
    appState.currentChatId,
    appState.messages
  );

  renderMessage(
    content,
    "user"
  );
}

function addAssistantMessage(response, appState) {

  console.log(
    "[ASSISTANT RAW RESPONSE]",
    response
  );

  //
  // Compatibilidade com backend antigo e novo
  //
  let parsedAnswer = null;

  try {

    if (
      typeof response.answer === "string"
    ) {

      parsedAnswer =
        JSON.parse(response.answer);

    } else {

      parsedAnswer =
        response.answer;
    }

  } catch (error) {

    console.error(
      "[JSON PARSE ERROR]",
      error
    );
  }

  //
  // Fallbacks seguros
  //
  const resumo =
    parsedAnswer?.resumo ||
    response?.summary ||
    response?.answer?.resumo ||
    "Sem resposta disponível.";

  const analise =
    parsedAnswer?.analise || "";

  const fontes =
    parsedAnswer?.fontes_utilizadas || [];

  const evidencias =
    parsedAnswer?.evidencias || [];

  const confiabilidade =
    parsedAnswer?.confiabilidade || null;

  //
  // Monta HTML bonito
  //
  let content = `
## Resumo

${resumo}
`;

  if (analise) {

    content += `

## Análise

${analise}
`;
  }

  if (evidencias.length > 0) {

    content += `

## Evidências
`;

    evidencias
      .slice(0, 3)
      .forEach((item) => {

        content += `

• ${item.trecho}

Fonte: ${item.fonte}
`;
      });
  }

  if (fontes.length > 0) {

    content += `

## Fontes utilizadas
`;

    fontes
      .slice(0, 5)
      .forEach((fonte) => {

        content += `

• <a href="${fonte.fonte}" target="_blank">
${fonte.titulo || fonte.fonte}
</a>
`;
      });
  }

  if (confiabilidade) {

    content += `

## Confiabilidade

Nível: ${confiabilidade.nivel}

${confiabilidade.motivo}
`;
  }

  const message = {

    role: "assistant",

    content,

    analysis: parsedAnswer,

    timestamp:
      new Date().toISOString()
  };

  appState.messages.push(message);

  saveChatMessages(
    appState.currentChatId,
    appState.messages
  );

  renderMessage(
    content,
    "assistant"
  );
}

function renderMessage(content, role) {

  const container =
    document.querySelector(
      ".chat-messages"
    );

  if (!container) return;

  const div =
    document.createElement("div");

  div.className =
    `message ${role}`;

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
    document.querySelector(
      ".chat-messages"
    );

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
    document.querySelector(
      ".chat-messages"
    );

  if (!container) return;

  const loading =
    document.createElement("div");

  loading.className =
    "message assistant loading";

  loading.id =
    "chat-loading";

  loading.innerHTML = `
    <div class="markdown-content">
      <p>Analisando informações...</p>
    </div>
  `;

  container.appendChild(loading);

  scrollBottom();
}

function removeLoading() {

  const loading =
    document.getElementById(
      "chat-loading"
    );

  if (loading) {
    loading.remove();
  }
}

function showError(error) {

  console.error(
    "[CHAT ERROR]",
    error
  );

  const container =
    document.querySelector(
      ".chat-messages"
    );

  if (!container) return;

  const div =
    document.createElement("div");

  div.className =
    "message error";

  let message =
    "Erro ao processar requisição.";

  if (error.code === "TIMEOUT") {

    message =
      "O servidor demorou muito para responder.";

  } else if (
    error.code === "NETWORK_ERROR"
  ) {

    message =
      "Falha de conexão com o servidor.";

  } else if (
    error.message
  ) {

    message =
      error.message;
  }

  div.innerHTML = `
    <div class="markdown-content">
      <strong>Erro</strong>
      <p>${message}</p>
    </div>
  `;

  container.appendChild(div);

  scrollBottom();
}

export function clearChat(appState) {

  appState.messages = [];

  const container =
    document.querySelector(
      ".chat-messages"
    );

  if (container) {
    container.innerHTML = "";
  }
}

export function loadPreviousChat(
  chatId,
  appState
) {

  const messages =
    loadChatMessages(chatId) || [];

  appState.messages =
    messages;

  renderStoredMessages(messages);
}

function scrollBottom() {

  const container =
    document.querySelector(
      ".chat-messages"
    );

  if (!container) return;

  container.scrollTop =
    container.scrollHeight;
}