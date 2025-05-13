# Referências Cruzadas e Mapa de Dependências

Este documento estabelece as relações e dependências entre as diferentes tarefas de desenvolvimento do projeto, permitindo uma visão holística de como os componentes se integram.

## Mapa de Dependências

O diagrama abaixo mostra as dependências principais entre as tarefas:

```
                     Tarefa #1
                  (Setup Projeto)
                      /   \
                     /     \
                    v       v
         Tarefa #2         Tarefa #3
       (Modelo User)     (Servidor Express)
             |                /   \
             v               /     \
        Tarefa #4 <---------+      \
     (Controller User)      |       \
             |              v        v
             v         Tarefa #6    Tarefa #7
        Tarefa #5    (Validação)  (Error Handler)
      (Rotas User)       /|\         /|\
                          |           |
                          |           |
                          v           v
                       Tarefa #10  Tarefa #12
                     (Testes Int.) (Logging)
                          |           |
                          v           v
                        Tarefa #11
                        (API Docs)
```

## Relações entre Componentes

### Camada de Infraestrutura
- **Tarefa #1: Setup Project Structure** → Base para todo o projeto
- **Tarefa #3: Setup Express Server** → Configuração do Express (depende de #1)
- **Tarefa #12: Logging** → Sistema de logging (depende de #3)

### Camada de Dados
- **Tarefa #2: User Model** → Modelo e armazenamento (depende de #1)
- **Tarefa #8: Unit Tests for User Model** → Testes unitários do modelo (depende de #2)

### Camada de Negócios
- **Tarefa #4: User Controller** → Lógica de negócios (depende de #2)
- **Tarefa #9: Unit Tests for User Controller** → Testes unitários do controlador (depende de #4)

### Camada de API
- **Tarefa #5: User Routes** → Endpoints da API (depende de #3 e #4)
- **Tarefa #6: Input Validation** → Validação de dados (depende de #3)
- **Tarefa #7: Error Handling** → Tratamento de erros (depende de #3)

### Testes e Documentação
- **Tarefa #10: Integration Tests** → Testes de integração (depende de #5, #6, #7)
- **Tarefa #11: API Documentation** → Documentação da API (depende de #5)

## Dependências Detalhadas por Tarefa

### Tarefa #1: Setup Project Structure
- **Não tem dependências**
- **Usada por**: Todas as outras tarefas

### Tarefa #2: Implementar User Model
- **Depende de**: #1 (Setup Project)
- **Usada por**: #4 (User Controller), #8 (Unit Tests User Model)
- **Arquivos principais**: `src/models/User.ts`
- **Funções principais**:
  - `UserStore.getAll()`: Lista todos os usuários
  - `UserStore.getById()`: Busca usuário por ID
  - `UserStore.create()`: Cria novo usuário
  - `UserStore.update()`: Atualiza usuário existente
  - `UserStore.delete()`: Remove usuário

### Tarefa #3: Setup Express Server
- **Depende de**: #1 (Setup Project)
- **Usada por**: #5 (User Routes), #6 (Validation), #7 (Error Handling), #12 (Logging)
- **Arquivos principais**: `src/app.ts`, `src/server.ts`
- **Funcionalidades principais**:
  - Configuração do Express
  - Registro de middleware
  - Configuração de rotas

### Tarefa #4: Implementar User Controller
- **Depende de**: #2 (User Model)
- **Usada por**: #5 (User Routes), #9 (Unit Tests User Controller)
- **Arquivos principais**: `src/controllers/UserController.ts`
- **Funções principais**:
  - `UserController.getAllUsers()`: Lista todos os usuários
  - `UserController.getUserById()`: Busca usuário por ID
  - `UserController.createUser()`: Cria novo usuário
  - `UserController.updateUser()`: Atualiza usuário existente
  - `UserController.deleteUser()`: Remove usuário

### Tarefa #5: Implementar User Routes
- **Depende de**: #3 (Express Server), #4 (User Controller)
- **Usada por**: #10 (Integration Tests), #11 (API Documentation)
- **Arquivos principais**: `src/routes/userRoutes.ts`
- **Endpoints**:
  - `GET /api/users`: Lista todos os usuários
  - `GET /api/users/:id`: Busca usuário por ID
  - `POST /api/users`: Cria novo usuário
  - `PUT /api/users/:id`: Atualiza usuário existente
  - `DELETE /api/users/:id`: Remove usuário

### Tarefa #6: Implementar Input Validation
- **Depende de**: #3 (Express Server)
- **Usada por**: #5 (User Routes), #10 (Integration Tests)
- **Arquivos principais**: `src/middleware/validation.ts`
- **Funções principais**:
  - `validateUserInput()`: Valida dados de entrada de usuário
  - `validateIdParam()`: Valida parâmetro ID na URL

### Tarefa #7: Implementar Error Handling
- **Depende de**: #3 (Express Server)
- **Usada por**: Todas as outras tarefas
- **Arquivos principais**: `src/middleware/errorHandler.ts`
- **Funções principais**:
  - `errorHandler()`: Middleware para tratamento global de erros
  - `notFoundHandler()`: Middleware para rotas não encontradas
  - `ApiError`: Classe para erros da API

### Tarefa #8: Implementar Unit Tests for User Model
- **Depende de**: #2 (User Model)
- **Arquivos principais**: `src/__tests__/models/User.test.ts`

### Tarefa #9: Implementar Unit Tests for User Controller
- **Depende de**: #4 (User Controller)
- **Arquivos principais**: `src/__tests__/controllers/UserController.test.ts`

### Tarefa #10: Implementar Integration Tests
- **Depende de**: #5 (User Routes), #6 (Validation), #7 (Error Handling)
- **Arquivos principais**:
  - `src/__tests__/integration/api.test.ts`
  - `src/__tests__/integration/validation.test.ts`
- **Ver**: [Documentação de Testes de Integração](task-10-implement-integration-tests.md)

### Tarefa #11: Implementar API Documentation
- **Depende de**: #5 (User Routes)
- **Arquivos principais**: `src/swagger.ts`, comentários JSDoc em arquivos de rotas e modelos
- **Ver**: [Documentação da API](task-11-implement-api-documentation.md)

### Tarefa #12: Implementar Logging e Tracking
- **Depende de**: #3 (Express Server)
- **Arquivos principais**:
  - `src/utils/logger.ts`
  - `src/middleware/requestLogger.ts`
- **Ver**: [Documentação de Logging](task-12-implement-logging.md)

## Guia de Solução de Problemas Integrado

### Problemas de Startup e Configuração

#### Servidor não inicia
**Possíveis causas**:
- Porta em uso
- Variáveis de ambiente faltando
- Erro de sintaxe ou import em arquivos principais

**Solução**:
1. Verifique o console para mensagens de erro específicas
2. Confira se não há outro processo usando a porta especificada
3. Tente alterar a porta: `PORT=4000 npm run dev`
4. Verifique se todas as dependências estão instaladas: `npm install`

#### Erro: "Cannot find module"
**Possíveis causas**:
- Módulo não instalado
- Erro de import/path
- TypeScript não compilado (em produção)

**Solução**:
1. Verifique se o módulo está no package.json e instale-o: `npm install`
2. Confira a sintaxe de importação e os caminhos nos arquivos
3. Em produção, execute `npm run build` antes de iniciar o servidor

### Problemas com a API

#### Erro 404 em todas as rotas
**Possíveis causas**:
- Servidor iniciando em uma porta diferente da esperada
- Path base incorreto (ex: `/api/users` vs `/users`)
- Middleware de rotas não registrado

**Solução**:
1. Verifique a porta e URL base usadas nas requisições
2. Confira a ordem dos middlewares em `app.ts`
3. Certifique-se de que o router de usuários está montado corretamente

#### Erro 400 Bad Request
**Possíveis causas**:
- Validação de dados falhando
- Parâmetro ID inválido
- Formato JSON incorreto no corpo da requisição

**Solução**:
1. Verifique a mensagem de erro específica no corpo da resposta
2. Confira se os dados enviados seguem o formato esperado
3. Para IDs, certifique-se de que são números inteiros válidos

#### Erro 500 Internal Server Error
**Possíveis causas**:
- Exceção não tratada no código
- Erro lógico em operações de dados
- Problema com middleware

**Solução**:
1. Verifique os logs do servidor para a stack trace completa
2. Utilize a informação de ID de requisição (`requestId`) para rastrear o problema nos logs
3. Adicione tratamento de erros mais granular em áreas problemáticas

### Problemas com Testes

#### Testes falham aleatoriamente
**Possíveis causas**:
- Estado compartilhado entre testes
- Condições de corrida em operações assíncronas
- Timeout em operações lentas

**Solução**:
1. Certifique-se de que o estado é limpo entre testes (usar `beforeEach`)
2. Aumente o timeout para testes lentos: `jest.setTimeout(10000)`
3. Use `async/await` corretamente em todos os testes assíncronos

#### Cobertura de testes baixa
**Possíveis causas**:
- Testes insuficientes
- Caminhos de erro não testados
- Funcionalidades não cobertas

**Solução**:
1. Execute `npm test -- --coverage` para identificar áreas não cobertas
2. Adicione testes para caminhos de erro (ex: validação, erros 404, etc.)
3. Cubra todos os endpoints e métodos do controlador

## Próximos Passos e Melhorias

Para melhorar a aplicação, considere as seguintes melhorias:

1. **Persistência de Dados**:
   - Integrar um banco de dados real (MongoDB, PostgreSQL, etc.)
   - Implementar migrações e modelos ORM

2. **Autenticação e Autorização**:
   - Adicionar autenticação JWT
   - Implementar controle de acesso baseado em funções (RBAC)

3. **Expansão de Recursos**:
   - Adicionar recursos além do CRUD básico
   - Implementar filtragem, ordenação e paginação

4. **Monitoramento e Performance**:
   - Adicionar métricas de performance
   - Implementar cache para operações frequentes

5. **CI/CD**:
   - Configurar pipeline de integração contínua
   - Automatizar testes e deployment

6. **Segurança**:
   - Implementar rate limiting
   - Adicionar validação mais rigorosa e sanitização de input
   - Configurar HTTPS

## Referências Adicionais

- [Documentação do Express](https://expressjs.com/)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/)
- [Swagger/OpenAPI](https://swagger.io/specification/)
- [Guia de Estilo de API RESTful](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md)
