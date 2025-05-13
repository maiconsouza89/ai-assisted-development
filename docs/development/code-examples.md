# Exemplos de Código e Padrões de Uso

Este documento apresenta exemplos detalhados de como usar a API de gerenciamento de usuários de diferentes maneiras, incluindo exemplos de código para consumir os endpoints, padrões comuns e boas práticas.

## Consumindo a API com Diferentes Ferramentas

### Usando Curl

#### Listar Todos os Usuários
```bash
curl -X GET http://localhost:3000/api/users
```

#### Buscar Usuário por ID
```bash
curl -X GET http://localhost:3000/api/users/1
```

#### Criar Novo Usuário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Maria Silva", "email": "maria@exemplo.com"}'
```

#### Atualizar Usuário
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Maria Silva Atualizada"}'
```

#### Excluir Usuário
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### Usando JavaScript/Fetch

```javascript
// Listar todos os usuários
async function getAllUsers() {
  try {
    const response = await fetch('http://localhost:3000/api/users');
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const users = await response.json();
    console.log('Usuários:', users);
    return users;
  } catch (error) {
    console.error('Falha ao buscar usuários:', error);
  }
}

// Buscar usuário por ID
async function getUserById(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${id}`);
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const user = await response.json();
    console.log('Usuário:', user);
    return user;
  } catch (error) {
    console.error(`Falha ao buscar usuário ${id}:`, error);
  }
}

// Criar novo usuário
async function createUser(userData) {
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const newUser = await response.json();
    console.log('Usuário criado:', newUser);
    return newUser;
  } catch (error) {
    console.error('Falha ao criar usuário:', error);
  }
}

// Atualizar usuário
async function updateUser(id, userData) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    const updatedUser = await response.json();
    console.log('Usuário atualizado:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error(`Falha ao atualizar usuário ${id}:`, error);
  }
}

// Excluir usuário
async function deleteUser(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Erro: ${response.status}`);
    console.log(`Usuário ${id} excluído com sucesso`);
    return true;
  } catch (error) {
    console.error(`Falha ao excluir usuário ${id}:`, error);
    return false;
  }
}
```

### Usando Axios (Node.js/JavaScript)

```javascript
const axios = require('axios');
// ou import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Listar todos os usuários
async function getAllUsers() {
  try {
    const response = await api.get('/users');
    console.log('Usuários:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error.response?.data || error.message);
    throw error;
  }
}

// Buscar usuário por ID
async function getUserById(id) {
  try {
    const response = await api.get(`/users/${id}`);
    console.log('Usuário:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error.response?.data || error.message);
    throw error;
  }
}

// Criar novo usuário
async function createUser(userData) {
  try {
    const response = await api.post('/users', userData);
    console.log('Usuário criado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error.response?.data || error.message);
    throw error;
  }
}

// Atualizar usuário
async function updateUser(id, userData) {
  try {
    const response = await api.put(`/users/${id}`, userData);
    console.log('Usuário atualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error.response?.data || error.message);
    throw error;
  }
}

// Excluir usuário
async function deleteUser(id) {
  try {
    await api.delete(`/users/${id}`);
    console.log(`Usuário ${id} excluído com sucesso`);
    return true;
  } catch (error) {
    console.error(`Erro ao excluir usuário ${id}:`, error.response?.data || error.message);
    throw error;
  }
}
```

### Usando Java com HttpClient (Java 11+)

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class UserApiClient {
    private final HttpClient httpClient;
    private final String baseUrl;

    public UserApiClient(String baseUrl) {
        this.baseUrl = baseUrl;
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_2)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    // Buscar todos os usuários
    public String getAllUsers() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .GET()
                .uri(URI.create(baseUrl + "/users"))
                .header("Accept", "application/json")
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to get users: " + response.statusCode());
        }

        return response.body();
    }

    // Criar um novo usuário
    public String createUser(String name, String email) throws Exception {
        String jsonBody = String.format("{\"name\":\"%s\",\"email\":\"%s\"}", name, email);

        HttpRequest request = HttpRequest.newBuilder()
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .uri(URI.create(baseUrl + "/users"))
                .header("Content-Type", "application/json")
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 201) {
            throw new RuntimeException("Failed to create user: " + response.statusCode());
        }

        return response.body();
    }

    // Exemplo de uso
    public static void main(String[] args) {
        try {
            UserApiClient client = new UserApiClient("http://localhost:3000/api");

            // Listar usuários
            String users = client.getAllUsers();
            System.out.println("Users: " + users);

            // Criar usuário
            String newUser = client.createUser("John Doe", "john@example.com");
            System.out.println("Created user: " + newUser);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## Tratamento de Erros e Boas Práticas

### Tratamento de Erros Adequado

```javascript
async function fetchUserWithErrorHandling(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/users/${id}`);

    // Verificar código de status
    if (response.status === 404) {
      console.warn(`Usuário com ID ${id} não encontrado`);
      return null;
    } else if (!response.ok) {
      // Ler o corpo do erro
      const errorData = await response.json();
      throw new Error(`Erro ${response.status}: ${errorData.message}`);
    }

    return await response.json();
  } catch (error) {
    // Lidar com erros de rede
    if (error.name === 'TypeError' && error.message.includes('network')) {
      console.error('Erro de conexão. Verifique se o servidor está em execução.');
    } else {
      console.error(`Erro ao buscar usuário: ${error.message}`);
    }

    // Retornar null ou reemitir o erro dependendo do caso de uso
    return null;
    // ou: throw error;
  }
}
```

### Validação no Cliente

```javascript
function validateUserData(userData) {
  const errors = [];

  // Validar nome
  if (!userData.name) {
    errors.push('Nome é obrigatório');
  } else if (userData.name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  // Validar email
  if (!userData.email) {
    errors.push('Email é obrigatório');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Formato de email inválido');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Uso da validação
async function createUserWithValidation(userData) {
  const validation = validateUserData(userData);

  if (!validation.isValid) {
    console.error('Dados inválidos:', validation.errors.join('; '));
    return null;
  }

  // Prosseguir com a criação se válido
  return await createUser(userData);
}
```

### Exemplo de CRUD Completo em React

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
  });

  // Carregar usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Falha ao carregar usuários. ' + (err.response?.data?.message || err.message));
    }
  };

  // Manipular mudanças no formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Atualizar usuário existente
        await api.put(`/users/${editingId}`, formData);
      } else {
        // Criar novo usuário
        await api.post('/users', formData);
      }

      // Limpar formulário e recarregar usuários
      setFormData({ name: '', email: '' });
      setEditingId(null);
      fetchUsers();
      setError('');
    } catch (err) {
      setError('Falha ao salvar. ' + (err.response?.data?.message || err.message));
    }
  };

  // Editar usuário
  const handleEdit = (user) => {
    setFormData({ name: user.name, email: user.email });
    setEditingId(user.id);
  };

  // Excluir usuário
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
        setError('');
      } catch (err) {
        setError('Falha ao excluir. ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <h1>Gerenciamento de Usuários</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nome:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">
          {editingId ? 'Atualizar' : 'Criar'} Usuário
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setFormData({ name: '', email: '' });
            setEditingId(null);
          }}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Lista de Usuários</h2>
      {users.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} ({user.email})
              <button onClick={() => handleEdit(user)}>Editar</button>
              <button onClick={() => handleDelete(user.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserManagement;
```

## Exemplos de Requisições com o Requests.HTTP

O arquivo `requests.http` pode ser usado com a extensão REST Client do VS Code para testar a API:

```http
### Listar todos os usuários
GET http://localhost:3000/api/users
Accept: application/json

### Buscar usuário específico por ID
GET http://localhost:3000/api/users/1
Accept: application/json

### Criar novo usuário
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com"
}

### Atualizar usuário existente
PUT http://localhost:3000/api/users/1
Content-Type: application/json

{
  "name": "João Silva Atualizado"
}

### Excluir usuário
DELETE http://localhost:3000/api/users/1
```

## Automação com Shell Script

```bash
#!/bin/bash
# script-demo-api.sh - Demonstração simples de uso da API

API_URL="http://localhost:3000/api/users"

echo "1. Criando usuários de teste..."
# Criar primeiro usuário
USER1_ID=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"name": "Usuário Teste 1", "email": "teste1@exemplo.com"}' \
  | grep -o '"id":[0-9]*' | cut -d":" -f2)
echo "Criado usuário com ID: $USER1_ID"

# Criar segundo usuário
USER2_ID=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{"name": "Usuário Teste 2", "email": "teste2@exemplo.com"}' \
  | grep -o '"id":[0-9]*' | cut -d":" -f2)
echo "Criado usuário com ID: $USER2_ID"

echo -e "\n2. Listando todos os usuários..."
curl -s -X GET $API_URL | json_pp

echo -e "\n3. Atualizando primeiro usuário..."
curl -s -X PUT "$API_URL/$USER1_ID" \
  -H "Content-Type: application/json" \
  -d '{"name": "Usuário Atualizado"}' \
  | json_pp

echo -e "\n4. Buscando usuário pelo ID..."
curl -s -X GET "$API_URL/$USER1_ID" | json_pp

echo -e "\n5. Excluindo segundo usuário..."
curl -s -X DELETE "$API_URL/$USER2_ID" -v

echo -e "\n6. Listagem final de usuários..."
curl -s -X GET $API_URL | json_pp

echo -e "\nDemonstração concluída!"
```