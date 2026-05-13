/**
 * API.js - Integração com o backend
 */

const DEFAULT_TIMEOUT = 30000;

/**
 * Classe para gerenciar requisições à API
 */
export class APIClient {
  constructor(endpoint = 'http://localhost:3000/api/analyze') {
    this.endpoint = endpoint;
    this.timeout = DEFAULT_TIMEOUT;
  }

  /**
   * Envia uma pergunta para análise
   */
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

  /**
   * Faz uma requisição HTTP
   */
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

      const data = await response.json();
      return this.validateResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new APIError('Requisição expirou', 'TIMEOUT', 'A requisição demorou muito');
      }

      if (error instanceof SyntaxError) {
        throw new APIError('Resposta inválida', 'PARSE_ERROR', error.message);
      }

      throw new APIError('Erro ao conectar com o servidor', 'NETWORK_ERROR', error.message);
    }
  }

  /**
   * Valida a resposta da API
   */
  validateResponse(data) {
    if (!data || typeof data !== 'object') {
      throw new APIError('Resposta inválida', 'INVALID_RESPONSE', 'Formato de resposta inválido');
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

  /**
   * Define o timeout para requisições
   */
  setTimeout(ms) {
    this.timeout = ms;
  }

  /**
   * Obtém o endpoint atual
   */
  getEndpoint() {
    return this.endpoint;
  }

  /**
   * Define um novo endpoint
   */
  setEndpoint(endpoint) {
    this.endpoint = endpoint;
  }
}

/**
 * Classe para erros de API
 */
export class APIError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = '') {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }

  toString() {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

/**
 * Instância global da API
 */
export const apiClient = new APIClient();

/**
 * Função auxiliar para enviar pergunta
 */
export async function sendQuestion(question) {
  try {
    const response = await apiClient.analyzeQuestion(question);
    return parseAnalysisResponse(response);
  } catch (error) {
    console.error('Erro ao analisar pergunta:', error);
    throw error;
  }
}

/**
 * Processa a resposta de análise da API
 */
export function parseAnalysisResponse(response) {
  try {
    // Validar campos obrigatórios
    if (!response.question) {
      throw new Error('Campo "question" ausente na resposta');
    }

    // Processar o campo "answer" que vem como string JSON
    let answer = response.answer;
    if (typeof answer === 'string') {
      try {
        answer = JSON.parse(answer);
      } catch (e) {
        console.warn('Não foi possível fazer parse do campo answer:', e);
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
      answer: answer,
      pipeline: response.pipeline || {},
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao processar resposta:', error);
    throw new APIError('Erro ao processar resposta da API', 'PARSE_ERROR', error.message);
  }
}

/**
 * Formata a resposta para exibição
 */
export function formatAnalysisResponse(analysis) {
  const answer = analysis.answer || {};
  
  return {
    summary: answer.summary || answer.text || 'Sem resumo disponível',
    analysis: answer.analysis || answer.details || '',
    evidence: Array.isArray(answer.evidence) ? answer.evidence : [],
    confidence: answer.confidence || answer.confiabilidade || 0,
    divergences: answer.divergences || answer.divergências || [],
    sources: Array.isArray(answer.sources) ? answer.sources : extractSources(analysis),
    metadata: {
      timestamp: analysis.timestamp,
      intent: analysis.intent,
      stats: analysis.stats
    }
  };
}

/**
 * Extrai fontes da resposta
 */
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

/**
 * Verifica a conectividade com a API
 */
export async function checkAPIHealth() {
  try {
    const response = await fetch(apiClient.getEndpoint(), {
      method: 'OPTIONS',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('API não está acessível:', error);
    return false;
  }
}

/**
 * Configura a URL da API
 */
export function setAPIEndpoint(endpoint) {
  apiClient.setEndpoint(endpoint);
}

/**
 * Obtém a URL da API atual
 */
export function getAPIEndpoint() {
  return apiClient.getEndpoint();
}
