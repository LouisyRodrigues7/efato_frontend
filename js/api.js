/**
 * api.js
 * Integração com backend Render
 */

const API_URL = "https://newbackteste.onrender.com/api/analyze";

const DEFAULT_TIMEOUT = 120000;

export class APIError extends Error {
  constructor(message, code = "UNKNOWN", details = "") {
    super(message);

    this.name = "APIError";
    this.code = code;
    this.details = details;
  }
}

class APIClient {

  constructor() {
    this.timeout = DEFAULT_TIMEOUT;
  }

  async analyzeQuestion(question) {

    if (!question || typeof question !== "string") {
      throw new APIError(
        "Pergunta inválida",
        "INVALID_QUESTION"
      );
    }

    return this.request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: question.trim()
      })
    });
  }

  async request(url, options = {}) {

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const text = await response.text();

      let data = null;

      try {
        data = JSON.parse(text);
      } catch {

        console.error("Resposta inválida:", text);

        throw new APIError(
          "Backend retornou resposta inválida",
          "INVALID_JSON",
          text
        );
      }

      if (!response.ok) {

        throw new APIError(
          data?.message || `Erro ${response.status}`,
          response.status,
          data
        );
      }

      return data;

    } catch (error) {

      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error.name === "AbortError") {

        throw new APIError(
          "Tempo de resposta excedido",
          "TIMEOUT"
        );
      }

      throw new APIError(
        "Falha de conexão com servidor",
        "NETWORK_ERROR",
        error.message
      );
    }
  }
}

export const apiClient = new APIClient();

export async function sendQuestion(question) {

  const response = await apiClient.analyzeQuestion(question);

  return normalizeResponse(response);
}

function normalizeResponse(data) {

  let answer = data.answer;

  if (typeof answer === "string") {

    try {
      answer = JSON.parse(answer);
    } catch {
      answer = {
        text: answer
      };
    }
  }

  return {
    success: data.success !== false,

    question: data.question || "",

    summary:
      answer?.summary ||
      answer?.text ||
      "Sem resposta disponível",

    analysis:
      answer?.analysis ||
      answer?.details ||
      "",

    confidence:
      answer?.confidence ||
      answer?.confiabilidade ||
      0,

    evidence:
      Array.isArray(answer?.evidence)
        ? answer.evidence
        : [],

    sources:
      Array.isArray(answer?.sources)
        ? answer.sources
        : [],

    raw: data
  };
}