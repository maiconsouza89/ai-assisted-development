# Task #2: Implementar Modelo de Usuário

## Propósito e Escopo
O propósito desta tarefa foi criar o modelo de dados de Usuário com as propriedades necessárias (id, nome, email) e métodos para manipulação de dados em memória. Este modelo serve como a representação principal dos dados de usuário e fornece a interface para operações CRUD (Create, Read, Update, Delete) no armazenamento de dados.

## Arquitetura Técnica e Decisões de Design
A implementação do modelo de usuário segue uma estrutura de duas camadas: uma interface que define a estrutura dos dados e uma classe de armazenamento que gerencia a persistência e manipulação. Decisões importantes incluem:

1. **Interface para Tipagem**: Criação da interface `IUser` para definir a estrutura de dados e garantir consistência
2. **Classe de Implementação**: Implementação da classe `User` para instanciar objetos de usuário
3. **Armazenamento em Memória**: Uso da classe estática `UserStore` para gerenciar os dados em memória
4. **ID Autoincremental**: Sistema de geração automática de IDs para garantir unicidade
5. **Métodos Estáticos**: Implementação de métodos estáticos para facilitar o acesso às funções de armazenamento

### Diagrama de Arquitetura
```
+-------------+     +----------------+      +----------------+
|  Interface  |     |      Class     |      |   Data Store   |
|    IUser    |---->|      User      |<-----|   UserStore    |
| (Structure) |     | (Object Model) |      | (Data Methods) |
+-------------+     +----------------+      +----------------+
                                                    ^
                                                    |
                                             +------+------+
                                             | In-Memory    |
                                             | Array Storage|
                                             +-------------+
```

## Detalhes de Implementação

### Estrutura de Código
O modelo de usuário está organizado no arquivo:
- `src/models/User.ts`: Contém a interface `IUser`, a classe `User` e a classe `UserStore`

### Padrões Utilizados
1. **Repository Pattern**: `UserStore` implementa o padrão repositório para abstração do armazenamento
2. **Interface-based Programming**: Uso de interface para definir a estrutura e garantir implementação
3. **Static Utility Methods**: Métodos estáticos para operações CRUD no armazenamento

### Componentes Principais

#### Interface IUser
```typescript
export interface IUser {
  id: number;
  name: string;
  email: string;
}
```

#### Classe User
```typescript
export class User implements IUser {
  id: number;
  name: string;
  email: string;

  constructor(name: string, email: string, id?: number) {
    this.name = name;
    this.email = email;
    this.id = id || Date.now();
  }
}
```

#### Classe UserStore
```typescript
export class UserStore {
  private static users: IUser[] = [];
  private static lastId: number = 0;

  static getAll(): IUser[] {
    return this.users;
  }

  static getById(id: number): IUser | undefined {
    return this.users.find(user => user.id === id);
  }

  static create(userData: Omit<IUser, 'id'>): IUser {
    const id = ++this.lastId;
    const newUser = { id, ...userData };
    this.users.push(newUser);
    return newUser;
  }

  static update(id: number, userData: Partial<Omit<IUser, 'id'>>): IUser | undefined {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }

  static delete(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return initialLength !== this.users.length;
  }
}
```

## Dependências

### Componentes Internos
- **Setup do Projeto (Tarefa #1)**: Depende da estrutura básica do projeto e configuração do TypeScript

### Componentes que Dependem Deste
- **Controlador de Usuário (Tarefa #4)**: Usa o modelo para realizar operações CRUD
- **Testes do Modelo (Tarefa #8)**: Testa a funcionalidade do modelo
- **Testes de Integração (Tarefa #10)**: Usa o modelo como parte dos testes end-to-end

### Sistemas Externos
- **TypeScript**: Para tipagem e interfaces

## Requisitos de Configuração

### Variáveis de Ambiente
Não há variáveis de ambiente específicas para o modelo de usuário.

### Configuração de Aplicativo
Não é necessária configuração adicional para o modelo de usuário.

## Limitações Conhecidas
1. **Armazenamento Volátil**: Os dados são armazenados em memória e perdidos ao reiniciar o servidor
2. **Ausência de Validação**: A validação dos dados é tratada em camadas superiores (middleware), não no modelo
3. **Sem Indexação**: Busca por ID requer iteração linear (O(n)) por todos os usuários
4. **Sem Persistência**: Não há integração com banco de dados para persistência
5. **Thread Safety**: Não há mecanismos para garantir segurança em ambiente multi-thread

## Melhorias Futuras Potenciais
1. **Integração com Banco de Dados**: Substituir o armazenamento em memória por persistência em banco de dados
2. **Validação no Modelo**: Adicionar métodos de validação no nível do modelo
3. **Paginação e Filtragem**: Implementar métodos para busca paginada e filtrada
4. **Índices para Busca**: Adicionar estruturas de dados otimizadas para busca
5. **Campos Adicionais**: Expandir o modelo com campos extras (ex: data de criação, última atualização)

## Exemplos de Código e Padrões de Uso

### Criação de Usuário
```typescript
import { UserStore } from '../models/User';

// Criar um novo usuário
const newUser = UserStore.create({
  name: 'João Silva',
  email: 'joao@exemplo.com'
});

console.log(`Usuário criado com ID: ${newUser.id}`);
```

### Busca e Atualização
```typescript
import { UserStore } from '../models/User';

// Buscar um usuário por ID
const user = UserStore.getById(1);

if (user) {
  // Atualizar email
  const updatedUser = UserStore.update(user.id, { email: 'novo@exemplo.com' });
  console.log('Usuário atualizado:', updatedUser);
} else {
  console.log('Usuário não encontrado');
}
```

### Listagem e Remoção
```typescript
import { UserStore } from '../models/User';

// Listar todos os usuários
const allUsers = UserStore.getAll();
console.log(`Total de usuários: ${allUsers.length}`);

// Remover um usuário
const deleted = UserStore.delete(1);
console.log(`Usuário removido: ${deleted ? 'Sim' : 'Não'}`);
```

## Guia de Solução de Problemas

### Problema 1: Usuário não está sendo encontrado por ID
**Sintomas:**
- Método `getById` retorna `undefined` mesmo quando o usuário existe
- Aplicação apresenta erro 404 ao tentar acessar um usuário

**Solução:**
1. Verifique se o ID passado é do tipo correto (number) e não uma string
2. Confira se o usuário foi realmente criado e adicionado ao armazenamento
3. Verifique se não há conversão implícita de tipos durante a comparação

### Problema 2: Atualização de usuário não reflete todas as mudanças
**Sintomas:**
- Alguns campos não são atualizados após chamar o método `update`
- Dados parcialmente atualizados

**Solução:**
1. Certifique-se de passar todos os campos que deseja atualizar no objeto `userData`
2. Verifique se o objeto de atualização tem a estrutura correta
3. Confira se o operador spread (`...`) está funcionando como esperado para mesclar os objetos