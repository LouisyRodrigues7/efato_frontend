# ÉFato - Frontend

Frontend moderno e responsivo para a plataforma **ÉFato**: IA que testa o que você confia.


## 📁 Estrutura do Projeto

```
frontend/
├── index.html                 # Arquivo HTML principal
├── README.md                  # Este arquivo
│
├── css/                       # Estilos CSS
│   ├── reset.css             # Reset e normalização
│   ├── variables.css         # Variáveis de cores e espaçamento
│   ├── global.css            # Estilos globais
│   ├── layout.css            # Layout principal
│   ├── sidebar.css           # Estilos da sidebar
│   ├── chat.css              # Estilos do chat
│   ├── input.css             # Estilos de input
│   ├── cards.css             # Estilos de cards
│   ├── animations.css        # Animações
│   ├── themes.css            # Temas (claro/escuro)
│   ├── markdown.css          # Renderização de markdown
│   └── responsive.css        # Media queries
│
├── js/                        # Scripts JavaScript
│   ├── main.js               # Arquivo principal
│   ├── api.js                # Integração com API
│   ├── chat.js               # Gerenciamento do chat
│   ├── ui.js                 # Gerenciamento da UI
│   ├── theme.js              # Gerenciamento de temas
│   ├── storage.js            # localStorage
│   ├── sidebar.js            # Gerenciamento da sidebar
│   ├── markdown.js           # Renderização de markdown
│   └── notifications.js      # Sistema de notificações
│
├── components/               # Componentes HTML reutilizáveis
│   ├── sidebar.html          # Componente sidebar
│   ├── chat.html             # Componente chat
│   ├── input.html            # Componente input
│   ├── loader.html           # Componente loader
│   └── modal.html            # Componente modal

## 🔧 Configuração

### Alterar URL da API

Por padrão, o frontend tenta conectar em `http://localhost:3000/api/analyze`.

Para alterar, edite em `js/api.js`:

```javascript
export const apiClient = new APIClient('http://seu-servidor:porta/api/analyze');
```

Ou use a função:

```javascript
import { setAPIEndpoint } from './js/api.js';
setAPIEndpoint('http://seu-servidor:porta/api/analyze');
```

## 🎨 Paleta de Cores

### Modo Escuro (Padrão)

- Primário: `#0F172A` (azul muito escuro)
- Secundário: `#1E293B` (azul escuro)
- Destaque: `#06B6D4` (ciano)
- Texto: `#FFFFFF` (branco)

### Modo Claro

- Primário: `#FFFFFF` (branco)
- Secundário: `#F8FAFC` (cinza claro)
- Destaque: `#0284C7` (azul)
- Texto: `#0F172A` (azul muito escuro)

## 🔌 Integração com Backend

### Formato de Requisição

```javascript
POST /api/analyze

{
  "question": "O governo aumentou imposto sobre compras internacionais?"
}
```

### Formato de Resposta Esperado

```json
{
  "success": true,
  "question": "O governo aumentou imposto sobre compras internacionais?",
  "intent": {},
  "expandedQuery": {},
  "stats": {},
  "topDocument": {},
  "contextPreview": [],
  "answer": "{\"summary\": \"...\", \"analysis\": \"...\", \"evidence\": [], \"confidence\": 85, \"sources\": []}"
}
```

**Importante:** O campo `answer` deve ser uma string JSON válida.

## 💾 Armazenamento Local

O frontend usa localStorage para:

- **Histórico de chats**: `efato_chat_history`
- **Mensagens por chat**: `efato_messages_{chatId}`
- **Tema preferido**: `efato_theme`

Limite: ~50 chats no histórico (configurável em `storage.js`)

## 🎯 Funcionalidades Principais

### Chat Conversacional

- Enviar mensagens com Enter
- Quebra de linha com Shift+Enter
- Auto-resize do input
- Scroll automático

### Análise de Informações

- Resumo da análise
- Análise detalhada
- Evidências
- Nível de confiabilidade
- Fontes com links
- Divergências identificadas

### Histórico

- Salva automaticamente
- Carrega chats anteriores
- Deleta chats individuais
- Exporta/importa histórico

### Temas

- Alternância claro/escuro
- Preferência salva
- Respeita preferência do sistema
- Transições suaves

## 🐛 Troubleshooting

### "Erro de conexão com a API"

1. Verifique se o backend está rodando
2. Verifique a URL da API em `js/api.js`
3. Verifique CORS no backend
4. Abra o console (F12) para ver erros detalhados

### "Histórico não está salvando"

1. Verifique se localStorage está habilitado
2. Verifique espaço disponível (máx ~5-10MB)
3. Abra DevTools > Application > Storage > Local Storage

### "Tema não muda"

1. Limpe o cache do navegador
2. Abra DevTools > Application > Storage > Local Storage
3. Delete `efato_theme` e recarregue

## 📚 Documentação de Módulos

### main.js

Arquivo principal que coordena todos os módulos e gerencia o estado global.

### api.js

Gerencia requisições HTTP e integração com o backend.

```javascript
import { sendQuestion } from './api.js';
const response = await sendQuestion('Sua pergunta aqui');
```

### chat.js

Gerencia mensagens, renderização e histórico do chat.

### ui.js

Gerencia estado da interface, notificações e diálogos.

### theme.js

Gerencia temas claro/escuro e preferências.

### storage.js

Gerencia localStorage e persistência de dados.

### sidebar.js

Gerencia sidebar, histórico de chats e navegação.

### markdown.js

Renderiza markdown para HTML de forma segura.

## 🚀 Deploy

### Opção 1: Hospedagem Estática

Copie a pasta `frontend` para:

- **Netlify**: Arraste a pasta
- **Vercel**: Conecte o repositório
- **GitHub Pages**: Push para `gh-pages`
- **AWS S3**: Upload dos arquivos
- **Cloudflare Pages**: Conecte o repositório

### Opção 2: Servidor Web

```bash
# Nginx
cp -r frontend /var/www/efato

# Apache
cp -r frontend /var/www/html/efato
```

### Opção 3: Docker

```dockerfile
FROM nginx:alpine
COPY frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📝 Licença

Este projeto é parte da plataforma ÉFato.

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:

1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue ou entre em contato através do site oficial.

---

**ÉFato** - IA que testa o que você confia. 🔍✨
