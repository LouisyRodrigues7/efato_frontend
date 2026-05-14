/**
 * api.js
 * Integração com backend Render
 */

const API_URL =
  "https://newbackteste.onrender.com/api/analyze";

const DEFAULT_TIMEOUT = 120000;

export class APIError extends Error {

  constructor(
    message,
    code = "UNKNOWN",
    details = ""
  ) {

    super(message);

    this.name = "APIError";
    this.code = code;
    this.details = details;
  }
}

class APIClient {

  constructor() {

    this.timeout =
      DEFAULT_TIMEOUT;
  }

  async analyzeQuestion(question) {

    if (
      !question ||
      typeof question !== "string"
    ) {

      throw new APIError(
        "Pergunta inválida",
        "INVALID_QUESTION"
      );
    }

    return this.request(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          question:
            question.trim()
        })
      }
    );
  }

  async request(
    url,
    options = {}
  ) {

    const controller =
      new AbortController();

    const timeoutId =
      setTimeout(() => {

        controller.abort();

      }, this.timeout);

    try {

      const response =
        await fetch(url, {

          ...options,

          signal:
            controller.signal
        });

      clearTimeout(timeoutId);

      const text =
        await response.text();

      let data = null;

      try {

        data =
          JSON.parse(text);

      } catch {

        console.error(
          "[INVALID JSON]",
          text
        );

        throw new APIError(
          "Backend retornou JSON inválido",
          "INVALID_JSON",
          text
        );
      }

      if (!response.ok) {

        throw new APIError(

          data?.message ||
          `Erro ${response.status}`,

          response.status,

          data
        );
      }

      return data;

    } catch (error) {

      clearTimeout(timeoutId);

      if (
        error instanceof APIError
      ) {

        throw error;
      }

      if (
        error.name === "AbortError"
      ) {

        throw new APIError(
          "Tempo de resposta excedido",
          "TIMEOUT"
        );
      }

      console.error(
        "[NETWORK ERROR]",
        error
      );

      throw new APIError(
        "Falha de conexão com servidor",
        "NETWORK_ERROR",
        error.message
      );
    }
  }
}

export const apiClient =
  new APIClient();

export async function sendQuestion(
  question
) {

  const response =
    await apiClient.analyzeQuestion(
      question
    );

  console.log(
    "[RAW API RESPONSE]",
    response
  );

  return normalizeResponse(
    response
  );
}

function normalizeResponse(data) {

  let answer =
    data?.answer || {};

  //
  // Compatibilidade:
  // answer pode vir string ou objeto
  //
  if (
    typeof answer === "string"
  ) {

    try {

      answer =
        JSON.parse(answer);

    } catch {

      answer = {
        resumo: answer
      };
    }
  }

  console.log(
    "[NORMALIZED ANSWER]",
    answer
  );

  return {

    success:
      data?.success !== false,

    question:
      data?.question || "",

    //
    // PADRÃO NOVO DO BACKEND
    //
    summary:
      answer?.resumo ||
      "Sem resposta disponível",

    analysis:
      answer?.analise || "",

    confidence:
      answer?.confiabilidade || null,

    evidence:
      Array.isArray(
        answer?.evidencias
      )
        ? answer.evidencias
        : [],

    sources:
      Array.isArray(
        answer?.fontes_utilizadas
      )
        ? answer.fontes_utilizadas
        : [],

    //
    // resposta completa
    //
    answer,

    raw: data
  };
}