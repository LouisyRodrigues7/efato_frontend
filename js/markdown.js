/**
 * Markdown.js - Renderização básica de markdown
 */

/**
 * Renderiza markdown simples para HTML
 */
export function renderMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let html = text;

  // Escape HTML
  html = escapeHtml(html);

  // Headings
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Code inline
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Lists (unordered)
  html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
  
  // Wrap list items
  html = html.replace(/(<li>.*?<\/li>)/s, (match) => {
    if (!match.includes('<ul>')) {
      return '<ul>' + match + '</ul>';
    }
    return match;
  });

  // Lists (ordered)
  html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6])/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul|<ol|<blockquote|<pre)/g, '$1');
  html = html.replace(/(<\/ul>|<\/ol>|<\/blockquote>|<\/pre>)<\/p>/g, '$1');

  return html;
}

/**
 * Escapa caracteres HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Renderiza markdown com suporte a mais recursos
 */
export function renderMarkdownAdvanced(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let html = renderMarkdown(text);

  // Adicionar classes CSS
  html = html.replace(/<h1>/g, '<h1 class="markdown-h1">');
  html = html.replace(/<h2>/g, '<h2 class="markdown-h2">');
  html = html.replace(/<h3>/g, '<h3 class="markdown-h3">');
  html = html.replace(/<code>/g, '<code class="markdown-code">');
  html = html.replace(/<pre>/g, '<pre class="markdown-pre">');
  html = html.replace(/<blockquote>/g, '<blockquote class="markdown-blockquote">');
  html = html.replace(/<ul>/g, '<ul class="markdown-ul">');
  html = html.replace(/<ol>/g, '<ol class="markdown-ol">');

  return html;
}

/**
 * Extrai texto plano de markdown
 */
export function extractPlainText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let plain = text;

  // Remove markdown formatting
  plain = plain.replace(/\*\*(.*?)\*\*/g, '$1');
  plain = plain.replace(/__(.+?)__/g, '$1');
  plain = plain.replace(/\*(.*?)\*/g, '$1');
  plain = plain.replace(/_(.+?)_/g, '$1');
  plain = plain.replace(/`([^`]+)`/g, '$1');
  plain = plain.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  plain = plain.replace(/^#+\s/gm, '');
  plain = plain.replace(/^[\*\-]\s/gm, '');
  plain = plain.replace(/^>\s/gm, '');
  plain = plain.replace(/```[\s\S]*?```/g, '');

  return plain.trim();
}

/**
 * Conta palavras em um texto markdown
 */
export function countWords(text) {
  const plain = extractPlainText(text);
  return plain.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Gera um resumo do texto
 */
export function generateSummary(text, maxWords = 50) {
  const plain = extractPlainText(text);
  const words = plain.split(/\s+/);
  
  if (words.length <= maxWords) {
    return plain;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Valida se o texto é markdown válido
 */
export function isValidMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Verificar padrões básicos de markdown
  const patterns = [
    /^#+\s/m,           // Headings
    /\*\*.*?\*\*/,      // Bold
    /\[.*?\]\(.*?\)/,   // Links
    /^[\*\-]\s/m,       // Lists
    /^>\s/m,            // Blockquotes
    /```[\s\S]*?```/    // Code blocks
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Converte HTML para markdown (básico)
 */
export function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  let markdown = html;

  // Remove tags HTML
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '* $1\n');
  markdown = markdown.replace(/<br[^>]*>/gi, '\n');
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  markdown = markdown.replace(/<[^>]+>/g, '');

  return markdown.trim();
}

/**
 * Sanitiza markdown para evitar XSS
 */
export function sanitizeMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text;

  // Remove scripts
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');

  return sanitized;
}
