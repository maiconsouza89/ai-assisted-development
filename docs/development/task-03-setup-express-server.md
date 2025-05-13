# Task #3: Setup Express Server Configuration

## Propósito e Escopo
O propósito desta tarefa foi configurar o servidor Express com middleware básico e tratamento de erros. Esta tarefa estabelece a estrutura fundamental da aplicação web, configurando como as requisições HTTP são processadas, como os erros são tratados e como as diferentes partes da aplicação se comunicam.

## Arquitetura Técnica e Decisões de Design
A configuração do servidor Express segue uma arquitetura modular que facilita a manutenção e expansão. As decisões de design incluem:

1. **Separação entre App e Server**: Divisão entre configuração do Express (`app.ts`) e inicialização do servidor (`server.ts`) para facilitar testes
2. **Middleware de Processamento**: Configuração de middleware para processar requisições JSON e dados de formulário
3. **Middleware de Logging**: Implementação de logging para registrar requisições e respostas HTTP
4. **Tratamento Global de Erros**: Middleware centralizado para tratamento consistente de erros
5. **Documentação da API Integrada**: Configuração do Swagger/OpenAPI para documentação automática

### Diagrama de Arquitetura
```
                        +-------------------+
                        |     server.ts     |
                        | (HTTP Server)     |
                        +--------+----------+
                                 |
                                 v
+----------------+      +--------+----------+      +----------------+
|                |      |                   |      |                |
| requestLogger  +----->+      app.ts      +----->+  errorHandler  |
| (Middleware)   |      | (Express Config)  |      |  (Middleware)  |
|                |      |                   |      |                |
+----------------+      +---------+---------+      +----------------+
                                  |
                                  v
                        +---------+---------+
                        |                   |
                        |    userRoutes     |
                        |   (API Routes)    |
                        |                   |
                        +-------------------+
```

## Detalhes de Implementação

### Estrutura de Código
A configuração do servidor está organizada nos seguintes arquivos:
- `src/app.ts`: Configuração principal do Express, middleware e montagem de rotas
- `src/server.ts`: Inicialização do servidor HTTP e configuração de porta
- `src/middleware/errorHandler.ts`: Middleware para tratamento global de erros
- `src/middleware/requestLogger.ts`: Middleware para logging de requisições HTTP

### Padrões Utilizados
1. **Middleware Chain**: Encadeamento de funções middleware para processamento de requisições
2. **Error-First Callbacks**: Padrão para propagação e tratamento de erros em middleware
3. **Singleton Application**: Instância única da aplicação Express compartilhada entre componentes

### Componentes Principais

#### Configuração do Express (app.ts)
```typescript
import express, { Application, Request, Response, NextFunction } from 'express';
import userRoutes from './routes/userRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { requestLogger, addRequestId } from './middleware/requestLogger';
import logger from './utils/logger';

const app: Application = express();

// Middleware para adicionar ID de requisição e logging
app.use(addRequestId);
app.use(requestLogger);

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentação da API com Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota básica para teste
app.get('/', (req: Request, res: Response) => {
  logger.debug('Endpoint raiz acessado');
  res.json({ message: 'API de Gerenciamento de Usuários funcionando!' });
});

// Montando o router de usuários no caminho /api/users
logger.info('Registrando rotas de usuário em /api/users');
app.use('/api/users', userRoutes);

// Manipulador para rotas não encontradas (404)
app.use(notFoundHandler);

// Middleware para tratar erros
app.use(errorHandler);

export default app;
```

#### Inicialização do Servidor (server.ts)
```typescript
import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

export default server;
```

## Dependências

### Componentes Internos
- **Setup do Projeto (Tarefa #1)**: Depende da estrutura básica do projeto e configuração do TypeScript
- **Sistema de Logging (Tarefa #12)**: Utiliza o sistema de logging para registrar eventos do servidor

### Componentes que Dependem Deste
- **Rotas de Usuário (Tarefa #5)**: Depende da configuração Express para montar as rotas
- **Middleware de Validação (Tarefa #6)**: Integra-se ao pipeline de processamento de requisições
- **Middleware de Tratamento de Erros (Tarefa #7)**: Utiliza a infraestrutura de tratamento de erros configurada
- **Documentação da API (Tarefa #11)**: Utiliza a configuração do Swagger integrada ao Express

### Sistemas Externos
- **Express.js**: Framework web para Node.js
- **Node.js HTTP Server**: Servidor HTTP subjacente

## Requisitos de Configuração

### Variáveis de Ambiente
- `PORT`: Porta em que o servidor será executado (default: 3000)
- `NODE_ENV`: Ambiente de execução (development, production, test)

### Configuração de Aplicativo
A aplicação é configurada através dos arquivos:
- `app.ts`: Configuração do Express, middleware e rotas
- `server.ts`: Configuração do servidor HTTP e porta

Para iniciar o servidor:
```bash
# Em desenvolvimento
npm run dev

# Em produção
npm start
```

## Limitações Conhecidas
1. **Sem Load Balancing**: Não há configuração para balanceamento de carga ou múltiplas instâncias
2. **Tratamento Básico de Erros**: O tratamento de erros não inclui recuperação sofisticada ou fallbacks
3. **Sem HTTPS**: Configuração apenas para HTTP, sem suporte nativo a HTTPS
4. **Sem Rate Limiting**: Não há proteção contra excesso de requisições (rate limiting)
5. **Configuração Estática**: Configurações definidas no código, com pouca parametrização externa

## Melhorias Futuras Potenciais
1. **HTTPS Support**: Adicionar suporte a HTTPS para comunicação segura
2. **Rate Limiting**: Implementar limitação de requisições para proteção contra abusos
3. **Clustering**: Configurar suporte a múltiplas instâncias usando o módulo cluster do Node.js
4. **Health Checks**: Adicionar endpoints de verificação de saúde para monitoramento
5. **Graceful Shutdown**: Implementar encerramento gracioso do servidor para manutenção zero-downtime

## Exemplos de Código e Padrões de Uso

### Adicionando Novo Middleware
```typescript
import { Request, Response, NextFunction } from 'express';

// Criar um middleware personalizado
const customMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Realizar alguma operação na requisição
  req.headers['x-custom-header'] = 'valor';

  // Passar para o próximo middleware
  next();
};

// Adicionar ao Express
app.use(customMiddleware);
```

### Definindo uma Nova Rota
```typescript
import express, { Request, Response } from 'express';

const router = express.Router();

// Definir uma rota GET
router.get('/novo-recurso', (req: Request, res: Response) => {
  res.json({ mensagem: 'Novo recurso disponível!' });
});

// Montar no app principal
app.use('/api/recurso', router);
```

## Guia de Solução de Problemas

### Problema 1: Servidor não inicia ou falha ao iniciar
**Sintomas:**
- Mensagem de erro ao executar `npm run dev` ou `npm start`
- Erro indicando que a porta está em uso

**Solução:**
1. Verifique se não há outro processo usando a porta especificada
2. Tente alterar a porta através da variável de ambiente PORT: `PORT=4000 npm run dev`
3. Verifique os logs de erro para identificar a causa específica do problema

### Problema 2: Requisições resultam em erro 404 (Not Found)
**Sintomas:**
- API retorna erro 404 mesmo para rotas que deveriam existir
- Mensagem "Rota não encontrada" nos logs

**Solução:**
1. Verifique se as rotas estão corretamente definidas e montadas em `app.ts`
2. Confira o caminho base da rota (ex: `/api/users`) e o caminho específico no router
3. Verifique a ordem dos middlewares - o handler 404 deve estar após as definições de rotas