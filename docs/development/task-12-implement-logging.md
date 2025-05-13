# Task #12: Implementar Logging e Rastreamento de Requisições

## Propósito e Escopo
O propósito desta tarefa foi implementar um sistema abrangente de logging e rastreamento de requisições para monitorar e depurar a API eficientemente. O sistema registra informações detalhadas sobre requisições recebidas, respostas enviadas e erros que ocorrem durante o processamento, facilitando a identificação e resolução de problemas em ambiente de desenvolvimento e produção.

## Arquitetura Técnica e Decisões de Design
A implementação do sistema de logging segue uma abordagem de múltiplas camadas que combina logging estruturado com rastreamento de requisições. As decisões de design incluem:

1. **Utilização do Winston**: Biblioteca escolhida por sua flexibilidade e suporte a múltiplos transportes de log
2. **Integração com Morgan**: Para logging específico de requisições HTTP com formato personalizado
3. **IDs de Requisição**: Implementação de identificadores únicos para cada requisição para facilitar o rastreamento através do fluxo de processamento
4. **Múltiplos Destinos de Log**: Configuração para registrar logs tanto no console quanto em arquivos, com níveis de severidade diferentes
5. **Formato Consistente**: Padronização do formato de logs com timestamps e níveis de severidade claros

## Detalhes de Implementação

### Estrutura de Código
A implementação de logging está organizada nos seguintes arquivos:
- `src/utils/logger.ts`: Configuração central do Winston para logging geral
- `src/middleware/requestLogger.ts`: Middleware para logging de requisições HTTP e gerenciamento de IDs de requisição

### Padrões Utilizados
1. **Middleware Pattern**: Utilizado para interceptar requisições e registrar informações relevantes
2. **Singleton Pattern**: Logger configurado como uma instância única compartilhada por toda a aplicação
3. **Decorator Pattern**: Estende a funcionalidade de requisições e respostas com informações de rastreamento

### Algoritmos e Lógica Principal
A lógica principal de logging inclui:
1. Geração de IDs únicos para cada requisição recebida
2. Formatação personalizada de logs com informações relevantes (método HTTP, URL, status, tempo de resposta)
3. Registro de corpo da requisição para facilitar a depuração
4. Propagação do ID da requisição para os cabeçalhos de resposta
5. Diferentes níveis de log baseados no ambiente (produção vs. desenvolvimento)

## Dependências

### Componentes Internos
- **Express Application**: Para registro de middleware de logging

### Sistemas Externos
- **winston**: Biblioteca principal de logging
- **morgan**: Middleware de logging HTTP para Express
- **Sistema de arquivos**: Para armazenamento de logs em arquivos

## Requisitos de Configuração

### Variáveis de Ambiente
- `NODE_ENV`: Define o nível de logging (produção = 'info', desenvolvimento = 'debug')

### Configuração de Aplicativo
Os logs são armazenados nos seguintes locais:
- `logs/combined.log`: Todos os logs
- `logs/error.log`: Apenas logs de erro
- Console: Todos os logs (útil para desenvolvimento)

## Limitações Conhecidas
1. Não há rotação automática de arquivos de log, o que pode causar arquivos muito grandes em produção
2. O corpo da requisição é registrado integralmente, o que pode expor dados sensíveis
3. Não há integração com serviços de monitoramento de logs externos
4. O armazenamento local de logs pode ser perdido em ambientes de containers efêmeros

## Melhorias Futuras Potenciais
1. Implementar rotação de logs baseada em tamanho ou tempo
2. Adicionar mascaramento de dados sensíveis nos logs (senhas, tokens, etc.)
3. Integrar com serviços de monitoramento como ELK Stack, Datadog ou New Relic
4. Adicionar métricas de performance para monitoramento em tempo real
5. Implementar logs estruturados em formato JSON para facilitar a análise

## Exemplos de Código e Padrões de Uso

### Configuração do Logger Winston
```typescript
import winston from 'winston';

// Definir formato do log
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

// Criar instância do logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Transporte para console em todos os ambientes
    new winston.transports.Console(),
    // Transporte para arquivo de erros
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Transporte para todos os logs
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});

export default logger;
```

### Middleware de Logging de Requisições
```typescript
import morgan from 'morgan';
import { Request, Response } from 'express';
import logger from '../utils/logger';

// Criar um token personalizado para o ID da requisição
morgan.token('request-id', (req: Request) => {
  // Gerar um ID único para a requisição se não estiver presente
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  return req.headers['x-request-id'] as string;
});

// Criar um token personalizado para o body da requisição
morgan.token('request-body', (req: Request) => {
  try {
    return JSON.stringify(req.body) || '-';
  } catch (error) {
    return 'Error parsing body';
  }
});

// Criar um formato personalizado que inclui o ID da requisição e o body
const logFormat = ':request-id :method :url :status :res[content-length] - :response-time ms - body: :request-body';

// Criar um objeto stream que escreve no nosso logger Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Exportar o middleware
export const requestLogger = morgan(logFormat, { stream });
```

### Uso do Logger na Aplicação
```typescript
import logger from '../utils/logger';

// Exemplo de uso em controladores ou serviços
try {
  // Alguma operação
  logger.info(`Operação realizada com sucesso: ${resultado}`);
} catch (error) {
  logger.error(`Erro ao realizar operação: ${error.message}`, { error });
  throw error;
}
```

## Guia de Solução de Problemas

### Problema 1: Arquivos de log não estão sendo criados
**Sintomas:**
- Logs aparecem no console mas não nos arquivos
- Erro ao iniciar a aplicação relacionado a permissões de arquivo

**Solução:**
1. Verifique se o diretório `logs/` existe e tem permissões de escrita
2. Crie o diretório manualmente se necessário: `mkdir logs`
3. Verifique as permissões do usuário que executa a aplicação

### Problema 2: IDs de requisição não estão sendo propagados
**Sintomas:**
- Logs não mostram o mesmo ID para diferentes partes do fluxo de uma requisição
- Cabeçalho `X-Request-ID` não aparece nas respostas

**Solução:**
1. Verifique se o middleware `addRequestId` está sendo registrado antes de outros middlewares
2. Confira se o middleware está sendo aplicado a todas as rotas necessárias
3. Verifique se não há outro middleware sobrescrevendo os cabeçalhos