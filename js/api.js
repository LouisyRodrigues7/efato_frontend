/**
 * API.js - Integração com o backend
 */

const DEFAULT_TIMEOUT = 30000;

/**
 * Classe para gerenciar requisições à API
 */
export class APIClient {
  constructor(endpoint = null) {
    this.endpoint = endpoint || this.getDefaultEndpoint();
    this.timeout = DEFAULT_TIMEOUT;
  }

  getDefaultEndpoint() {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      return 'http://localhost:3000/api/analyze';
    }

    return 'https://newbackteste.onrender.com/api/analyze';
  }

  async analyzeQuestion(question) {
    if (!question || typeof question !== 'string') {
      throw new Error('Pergunta inválida');
    }

    const payload = {
      question: question.trim()
    };

    return this.request(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async request(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(
          `Erro na requisição: ${response.status}`,
          response.status,
          response.statusText
        );
      }

      // FIX CRÍTICO: evita crash quando backend retorna HTML (deploy)
      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new APIError(
          'Resposta não é JSON válida',
          'PARSE_ERROR',
          text
        );
      }

      return this.validateResponse(data);

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) throw error;

      if (error.name === 'AbortError') {
        throw new APIError(
          'Requisição expirou',
          'TIMEOUT',
          'A requisição demorou muito'
        );
      }

      throw new APIError(
        'Erro ao conectar com o servidor',
        'NETWORK_ERROR',
        error.message
      );
    }
  }

  validateResponse(data) {
    if (!data || typeof data !== 'object') {
      throw new APIError(
        'Resposta inválida',
        'INVALID_RESPONSE',
        'Formato de resposta inválido'
      );
    }

    if (data.success === false) {
      throw new APIError(
        data.message || 'Erro na análise',
        'API_ERROR',
        data.details || ''
      );
    }

    return data;
  }

  setTimeout(ms) {
    this.timeout = ms;
  }

  getEndpoint() {
    return this.endpoint;
  }

  setEndpoint(endpoint) {
    this.endpoint = endpoint;
  }
}

/**
 * Classe de erro
 */
export class APIError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = '') {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Instância global
 */
export const apiClient = new APIClient();

export async function sendQuestion(question) {
  try {
    const response = await apiClient.analyzeQuestion(question);
    return parseAnalysisResponse(response);
  } catch (error) {
    console.error('Erro ao analisar pergunta:', error);
    throw error;
  }
}

export function parseAnalysisResponse(response) {
  try {
    if (!response.question) {
      throw new Error('Campo "question" ausente na resposta');
    }

    let answer = response.answer;

    if (typeof answer === 'string') {
      try {
        answer = JSON.parse(answer);
      } catch (e) {
        console.warn('Resposta JSON inválida:', e);
        answer = { text: answer };
      }
    }

    return {
      success: response.success !== false,
      question: response.question,
      intent: response.intent || {},
      expandedQuery: response.expandedQuery || {},
      stats: response.stats || {},
      topDocument: response.topDocument || {},
      contextPreview: response.contextPreview || [],
      answer,
      pipeline: response.pipeline || {},
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    throw new APIError(
      'Erro ao processar resposta da API',
      'PARSE_ERROR',
      error.message
    );
  }
}

export function formatAnalysisResponse(analysis) {
  const answer = analysis.answer || {};

  return {
    summary: answer.summary || answer.text || 'Sem resumo disponível',
    analysis: answer.analysis || answer.details || '',
    evidence: Array.isArray(answer.evidence) ? answer.evidence : [],
    confidence: answer.confidence || answer.confiabilidade || 0,
    divergences: answer.divergences || answer.divergências || [],
    sources: Array.isArray(answer.sources)
      ? answer.sources
      : extractSources(analysis),
    metadata: {
      timestamp: analysis.timestamp,
      intent: analysis.intent,
      stats: analysis.stats
    }
  };
}

function extractSources(analysis) {
  const sources = [];

  if (analysis.topDocument) {
    sources.push({
      title: analysis.topDocument.title || 'Documento Principal',
      excerpt: analysis.topDocument.excerpt || '',
      url: analysis.topDocument.url || '',
      official: analysis.topDocument.official === true
    });
  }

  if (Array.isArray(analysis.contextPreview)) {
    analysis.contextPreview.forEach((context, index) => {
      sources.push({
        title: context.title || `Fonte ${index + 1}`,
        excerpt: context.excerpt || context.text || '',
        url: context.url || '',
        official: context.official === true
      });
    });
  }

  return sources;
}

export async function checkAPIHealth() {
  try {
    const response = await fetch(apiClient.getEndpoint(), {
      method: 'OPTIONS'
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function setAPIEndpoint(endpoint) {
  apiClient.setEndpoint(endpoint);
}

export function getAPIEndpoint() {
  return apiClient.getEndpoint();
}