/**
 * Storage.js - Gerenciamento de localStorage
 */

const STORAGE_KEY_HISTORY = 'efato_chat_history';
const STORAGE_KEY_MESSAGES = 'efato_messages_';
const MAX_HISTORY_ITEMS = 50;

/**
 * Salva o histórico de chats
 */
export function saveChatHistory(chatHistory) {
  try {
    const limitedHistory = chatHistory.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
  }
}

/**
 * Carrega o histórico de chats
 */
export function loadChatHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEY_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    return [];
  }
}

/**
 * Adiciona um chat ao histórico
 */
export function addChatToHistory(chatId, title, timestamp = Date.now()) {
  try {
    const history = loadChatHistory();
    
    // Verificar se já existe
    const existingIndex = history.findIndex(chat => chat.id === chatId);
    if (existingIndex !== -1) {
      history[existingIndex].timestamp = timestamp;
      history.unshift(history.splice(existingIndex, 1)[0]);
    } else {
      history.unshift({
        id: chatId,
        title: title || 'Nova conversa',
        timestamp: timestamp
      });
    }
    
    saveChatHistory(history);
    return history;
  } catch (error) {
    console.error('Erro ao adicionar chat ao histórico:', error);
    return [];
  }
}

/**
 * Remove um chat do histórico
 */
export function removeChatFromHistory(chatId) {
  try {
    const history = loadChatHistory();
    const filtered = history.filter(chat => chat.id !== chatId);
    saveChatHistory(filtered);
    
    // Remover mensagens associadas
    removeChatMessages(chatId);
    
    return filtered;
  } catch (error) {
    console.error('Erro ao remover chat:', error);
    return [];
  }
}

/**
 * Salva as mensagens de um chat
 */
export function saveChatMessages(chatId, messages) {
  try {
    const key = `${STORAGE_KEY_MESSAGES}${chatId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Erro ao salvar mensagens:', error);
  }
}

/**
 * Carrega as mensagens de um chat
 */
export function loadChatMessages(chatId) {
  try {
    const key = `${STORAGE_KEY_MESSAGES}${chatId}`;
    const messages = localStorage.getItem(key);
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error);
    return [];
  }
}

/**
 * Remove as mensagens de um chat
 */
export function removeChatMessages(chatId) {
  try {
    const key = `${STORAGE_KEY_MESSAGES}${chatId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erro ao remover mensagens:', error);
  }
}

/**
 * Limpa todo o armazenamento
 */
export function clearAllStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('efato_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Erro ao limpar armazenamento:', error);
  }
}

/**
 * Obtém o tamanho do armazenamento usado
 */
export function getStorageSize() {
  try {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('efato_')) {
        size += localStorage.getItem(key).length;
      }
    });
    return size;
  } catch (error) {
    console.error('Erro ao calcular tamanho:', error);
    return 0;
  }
}

/**
 * Exporta o histórico como JSON
 */
export function exportHistory() {
  try {
    const history = loadChatHistory();
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      chats: history.map(chat => ({
        ...chat,
        messages: loadChatMessages(chat.id)
      }))
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Erro ao exportar histórico:', error);
    return null;
  }
}

/**
 * Importa o histórico de JSON
 */
export function importHistory(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.chats || !Array.isArray(data.chats)) {
      throw new Error('Formato de importação inválido');
    }
    
    clearAllStorage();
    
    data.chats.forEach(chat => {
      const { messages, ...chatData } = chat;
      addChatToHistory(chatData.id, chatData.title, chatData.timestamp);
      if (messages) {
        saveChatMessages(chatData.id, messages);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao importar histórico:', error);
    return false;
  }
}

/**
 * Obtém estatísticas de armazenamento
 */
export function getStorageStats() {
  try {
    const history = loadChatHistory();
    let totalMessages = 0;
    
    history.forEach(chat => {
      const messages = loadChatMessages(chat.id);
      totalMessages += messages.length;
    });
    
    return {
      totalChats: history.length,
      totalMessages: totalMessages,
      storageSize: getStorageSize(),
      maxItems: MAX_HISTORY_ITEMS
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      totalChats: 0,
      totalMessages: 0,
      storageSize: 0,
      maxItems: MAX_HISTORY_ITEMS
    };
  }
}
