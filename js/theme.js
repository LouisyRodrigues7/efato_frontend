/**
 * Theme.js - Gerenciamento de temas (claro/escuro)
 */

const THEME_KEY = 'efato_theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/**
 * Inicializa o sistema de temas
 */
export function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const theme = savedTheme || (prefersDark ? THEME_DARK : THEME_LIGHT);
  
  applyTheme(theme);
  setupThemeToggle();
  
  // Monitorar mudanças de preferência do sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
    }
  });
}

/**
 * Aplica um tema à aplicação
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeToggleIcon(theme);
}

/**
 * Alterna entre temas
 */
export function toggleTheme() {
  const currentTheme = localStorage.getItem(THEME_KEY) || document.documentElement.getAttribute('data-theme') || THEME_DARK;
  const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
  console.log(`Alternando tema: ${currentTheme} -> ${newTheme}`);
  applyTheme(newTheme);
}

/**
 * Obtém o tema atual
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || THEME_DARK;
}

/**
 * Configura o botão de alternância de tema
 */
function setupThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    updateThemeToggleIcon(getCurrentTheme());
  }
}

/**
 * Atualiza o ícone do botão de tema
 */
function updateThemeToggleIcon(theme) {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = theme === THEME_DARK ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', 
      theme === THEME_DARK ? 'Mudar para tema claro' : 'Mudar para tema escuro'
    );
  }
}

/**
 * Obtém uma cor do tema atual
 */
export function getThemeColor(colorName) {
  const theme = getCurrentTheme();
  const colors = {
    dark: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#06B6D4',
      text: '#FFFFFF',
      textSecondary: '#CBD5E1',
      border: '#334155'
    },
    light: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      accent: '#0284C7',
      text: '#0F172A',
      textSecondary: '#475569',
      border: '#E2E8F0'
    }
  };
  
  return colors[theme]?.[colorName] || null;
}

/**
 * Verifica se está em modo escuro
 */
export function isDarkMode() {
  return getCurrentTheme() === THEME_DARK;
}

/**
 * Verifica se está em modo claro
 */
export function isLightMode() {
  return getCurrentTheme() === THEME_LIGHT;
}
