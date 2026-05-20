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

    console.log(
      "[ANSWER TYPE]",
      typeof response?.answer
    );

    console.log(
      "[ANSWER VALUE]",
      response?.answer
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
      "[CHAT ERROR]",
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
  // Compatibilidade total
  //
  let parsedAnswer = null;

  try {

    //
    // Caso:
    // answer = string JSON
    //
    if (
      typeof response?.answer === "string"
    ) {

      parsedAnswer =
        JSON.parse(response.answer);

      console.log(
        "[PARSED FROM STRING]"
      );
    }

    //
    // Caso:
    // answer = objeto
    //
    else if (
      typeof response?.answer === "object"
    ) {

      parsedAnswer =
        response.answer;

      console.log(
        "[PARSED FROM OBJECT]"
      );
    }

    //
    // Caso:
    // backend retornou direto
    //
    else if (
      response?.resumo
    ) {

      parsedAnswer =
        response;

      console.log(
        "[PARSED FROM ROOT]"
      );
    }

  } catch (error) {

    console.error(
      "[JSON PARSE ERROR]",
      error
    );

    console.error(
      "[INVALID ANSWER]",
      response?.answer
    );
  }

  console.log(
    "[FINAL PARSED ANSWER]",
    parsedAnswer
  );

  //
  // FALLBACKS
  //
  const resumo =
    parsedAnswer?.resumo ||
    response?.summary ||
    response?.resumo ||
    "Sem resposta disponível.";

  const analise =
    parsedAnswer?.analise ||
    "";

  const fontes =
    Array.isArray(
      parsedAnswer?.fontes_utilizadas
    )
      ? parsedAnswer.fontes_utilizadas
      : [];

  const evidencias =
    Array.isArray(
      parsedAnswer?.evidencias
    )
      ? parsedAnswer.evidencias
      : [];

  const confiabilidade =
    parsedAnswer?.confiabilidade ||
    null;

  //
  // MELHORIAS:
  // evita HTML quebrado
  //
  const escapeHtml = (text = "") => {

    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  //
  // MELHORIA:
  // remove fontes duplicadas
  //
  const uniqueSources =
    fontes.filter((fonte, index, self) => {

      const current =
        fonte?.fonte || fonte?.titulo;

      return index === self.findIndex(item => {

        const compare =
          item?.fonte || item?.titulo;

        return compare === current;
      });
    });

  //
  // TEMPLATE
  //
  let content = `
## Resumo

${escapeHtml(resumo)}
`;

  if (analise) {

    content += `

## Análise

${escapeHtml(analise)}
`;
  }

  if (
    evidencias.length > 0
  ) {

    content += `

## Evidências
`;

    evidencias
      .slice(0, 3)
      .forEach((item) => {

        content += `

• ${escapeHtml(
          item?.trecho || ""
        )}

Fonte: ${escapeHtml(
          item?.fonte || ""
        )}
`;
      });
  }

  if (
    uniqueSources.length > 0
  ) {

    content += `

## Fontes utilizadas
`;

    uniqueSources
      .slice(0, 5)
      .forEach((fonte) => {

        const url =
          fonte?.fonte || "#";

        const titulo =
          fonte?.titulo ||
          fonte?.fonte ||
          "Fonte";

        content += `

• <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
${escapeHtml(titulo)}
</a>
`;
      });
  }

  if (confiabilidade) {

    content += `

## Confiabilidade

Nível: ${escapeHtml(
      confiabilidade?.nivel || "não informado"
    )}

${escapeHtml(
      confiabilidade?.motivo || ""
    )}
`;
  }

  //
  // MELHORIA:
  // debug da resposta final
  //
  console.log(
    "[FINAL CONTENT]",
    content
  );

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

  //
  // MELHORIA:
  // evita render null/undefined
  //
  const safeContent =
    content || "";

  if (role === "assistant") {

    div.innerHTML = `
      <div class="markdown-content">
        ${renderMarkdown(safeContent)}
      </div>
    `;

  } else {

    div.textContent = safeContent;
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

  //
  // evita múltiplos loadings
  //
  removeLoading();

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

  if (error?.code === "TIMEOUT") {

    message =
      "O servidor demorou muito para responder.";

  } else if (
    error?.code === "NETWORK_ERROR"
  ) {

    message =
      "Falha de conexão com o servidor.";

  } else if (
    error?.message
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