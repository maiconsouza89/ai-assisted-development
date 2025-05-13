import request from 'supertest';
import app from '../../app';
import { UserStore } from '../../models/User';

describe('User API Integration Tests', () => {
  // Clear users before each test
  beforeEach(() => {
    // Access the private users array for testing purposes
    (UserStore as any).users = [];
    (UserStore as any).lastId = 0;
  });

  describe('GET /api/users', () => {
    it('should return an empty array when no users exist', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all users', async () => {
      // Create test users
      const user1 = UserStore.create({ name: 'John Smith', email: 'john@example.com' });
      const user2 = UserStore.create({ name: 'Mary Johnson', email: 'mary@example.com' });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: user1.id }),
        expect.objectContaining({ id: user2.id })
      ]));
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user when a valid ID is provided', async () => {
      const user = UserStore.create({ name: 'John Smith', email: 'john@example.com' });

      const response = await request(app).get(`/api/users/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: user.id,
        name: user.name,
        email: user.email
      }));
    });

    it('should return 404 when the user is not found', async () => {
      const response = await request(app).get('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User not found');
    });

    it('should return 400 when the ID is invalid', async () => {
      const response = await request(app).get('/api/users/invalidid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid ID format');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = { name: 'New User', email: 'new@example.com' };

      const response = await request(app)
        .post('/api/users')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        id: expect.any(Number),
        name: userData.name,
        email: userData.email
      }));

      // Verify that the user was added to the storage
      const users = UserStore.getAll();
      expect(users.length).toBe(1);
      expect(users[0].name).toBe(userData.name);
      expect(users[0].email).toBe(userData.email);
    });

    it('should return 400 when the name is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ email: 'new@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Name is required');
    });

    it('should return 400 when the email is missing', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'New User' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Email is required');
    });

    it('should return 400 when the email format is invalid', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'New User', email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid email format');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update an existing user with valid data', async () => {
      // Create a user for testing
      const user = UserStore.create({ name: 'Original User', email: 'original@example.com' });

      // Data for update
      const updateData = { name: 'Updated User', email: 'updated@example.com' };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: user.id,
        name: updateData.name,
        email: updateData.email
      }));

      // Verify that the user was updated in storage
      const updatedUser = UserStore.getById(user.id);
      expect(updatedUser?.name).toBe(updateData.name);
      expect(updatedUser?.email).toBe(updateData.email);
    });

    it('should allow partial update (name only)', async () => {
      const user = UserStore.create({ name: 'Original User', email: 'original@example.com' });
      const updateData = { name: 'Updated User' };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: user.id,
        name: updateData.name,
        email: user.email // email should remain the same
      }));
    });

    it('should allow partial update (email only)', async () => {
      const user = UserStore.create({ name: 'Original User', email: 'original@example.com' });
      const updateData = { email: 'new@example.com' };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining({
        id: user.id,
        name: user.name, // name should remain the same
        email: updateData.email
      }));
    });

    it('should return 400 when no fields are provided for update', async () => {
      const user = UserStore.create({ name: 'Original User', email: 'original@example.com' });

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('At least one field');
    });

    it('should return 404 when the user does not exist', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .send({ name: 'Updated User' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('User not found');
    });

    it('should return 400 when the ID is invalid', async () => {
      const response = await request(app)
        .put('/api/users/invalidid')
        .send({ name: 'Updated User' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid ID format');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete an existing user', async () => {
      const user = UserStore.create({ name: 'User to Delete', email: 'delete@example.com' });

      const response = await request(app)
        .delete(`/api/users/${user.id}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});

      // Verify that the user was removed from storage
      const userExists = UserStore.getById(user.id);
      expect(userExists).toBeUndefined();
    });

    it('should return 404 when trying to delete a user that does not exist', async () => {
      const response = await request(app)
        .delete('/api/users/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('User not found');
    });

    it('should return 400 when the ID is invalid', async () => {
      const response = await request(app)
        .delete('/api/users/invalidid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid ID format');
    });
  });
});