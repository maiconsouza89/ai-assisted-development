import { User, UserStore, IUser } from '../../models/User';

describe('User Model', () => {
  test('should create a User instance with correct properties', () => {
    const user = new User('João Silva', 'joao@example.com');

    expect(user).toHaveProperty('id');
    expect(user.name).toBe('João Silva');
    expect(user.email).toBe('joao@example.com');
  });

  test('should create a User instance with a provided ID', () => {
    const userId = 123;
    const user = new User('Ana Silva', 'ana@example.com', userId);

    expect(user.id).toBe(userId);
    expect(user.name).toBe('Ana Silva');
    expect(user.email).toBe('ana@example.com');
  });
});

describe('UserStore', () => {
  // Limpar o armazenamento antes de cada teste
  beforeEach(() => {
    // Redefinir o array de usuários usando uma técnica de acesso a propriedade privada
    // Isso é necessário para isolar os testes
    (UserStore as any).users = [];
    (UserStore as any).lastId = 0;
  });

  test('should create a user and return it with an ID', () => {
    const userData = { name: 'Carlos Souza', email: 'carlos@example.com' };
    const newUser = UserStore.create(userData);

    expect(newUser).toHaveProperty('id');
    expect(newUser.id).toBe(1);
    expect(newUser.name).toBe(userData.name);
    expect(newUser.email).toBe(userData.email);
  });

  test('should get all users', () => {
    // Adicionar alguns usuários
    const user1 = UserStore.create({ name: 'Maria Silva', email: 'maria@example.com' });
    const user2 = UserStore.create({ name: 'José Santos', email: 'jose@example.com' });

    const allUsers = UserStore.getAll();

    expect(allUsers).toHaveLength(2);
    expect(allUsers).toContainEqual(user1);
    expect(allUsers).toContainEqual(user2);
  });

  test('should get a user by ID', () => {
    const userData = { name: 'Pedro Costa', email: 'pedro@example.com' };
    const newUser = UserStore.create(userData);

    const foundUser = UserStore.getById(newUser.id);

    expect(foundUser).toEqual(newUser);
  });

  test('should return undefined when getting non-existent user', () => {
    const foundUser = UserStore.getById(999);

    expect(foundUser).toBeUndefined();
  });

  test('should update a user', () => {
    const user = UserStore.create({ name: 'Paula Lima', email: 'paula@example.com' });
    const updatedData = { name: 'Paula Lima Silva' };

    const updatedUser = UserStore.update(user.id, updatedData);

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.name).toBe(updatedData.name);
    expect(updatedUser?.email).toBe(user.email); // Email permanece inalterado
  });

  test('should return undefined when updating non-existent user', () => {
    const updatedUser = UserStore.update(999, { name: 'Inexistente' });

    expect(updatedUser).toBeUndefined();
  });

  test('should delete a user', () => {
    const user = UserStore.create({ name: 'Roberto Alves', email: 'roberto@example.com' });

    const result = UserStore.delete(user.id);
    const allUsers = UserStore.getAll();

    expect(result).toBe(true);
    expect(allUsers).toHaveLength(0);
  });

  test('should return false when deleting non-existent user', () => {
    const result = UserStore.delete(999);

    expect(result).toBe(false);
  });
});