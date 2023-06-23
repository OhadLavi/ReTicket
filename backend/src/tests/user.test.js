process.env.PAYPAL_MODE = 'sandbox';
process.env.PAYPAL_CLIENT_ID = 'your_client_id';
process.env.PAYPAL_SECRET = 'your_secret';

const request = require('supertest');
const express = require('express');
const router = require('../routers/user.router');
const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');


const app = express();
app.use(express.json());
app.use(router);

jest.mock('../models/user.model');

jest.mock('bcryptjs');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

describe('User Routes', () => {
  describe('POST /register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        name: 'Test Userr',
        email: 'test@test.com',
        password: 'test1234',
        confirmPassword: 'test1234'
      };
      
      const encryptedPassword = 'encryptedPassword';
      bcrypt.hash.mockResolvedValue(encryptedPassword);

      const createdUser = {
        ...mockUser,
        password: encryptedPassword,
        imageURL: './assets/user.png',
        id: '1234',
      };
      UserModel.create.mockResolvedValue(createdUser);
      
      const response = await request(app)
        .post('/register')
        .send(mockUser);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.name).toBe(mockUser.name);
      expect(response.body.id).toBe(createdUser.id);
      expect(response.body.token).toBeDefined();
    });

    it('should fail to register a user that already exists', async () => {
      const existingUser = {
          name: 'John Doe',
          password: 'password123',
          confirmPassword: 'password123',
          email: 'johndoe@gmail.com',
      };
  
      // Mock findOne to return a user, indicating that the user already exists.
      UserModel.findOne.mockResolvedValue(existingUser);
  
      // Then, try to register the same user again.
      const res = await request(app).post('/register').send(existingUser);
  
      // We expect a 400 status (Bad Request), as this user should already exist.
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toEqual('User already exists');
  });
  });

  describe('POST /login', () => {
    it('should login a user and return a token', async () => {
      const mockUser = {
        email: 'test@test.com',
        password: 'test1234',
      };

      const dbUser = {
        id: '1234',
        email: mockUser.email,
        name: 'Test User',
        password: 'encryptedPassword',
        isValidPassword: jest.fn().mockResolvedValue(true),
      };
      
      UserModel.findOne.mockResolvedValue(dbUser);

      const response = await request(app)
        .post('/login')
        .send(mockUser);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.id).toBe(dbUser.id);
      expect(response.body.token).toBeDefined();
    });

    it('should fail to log in with wrong password', async () => {
      const existingUser = {
          name: 'Jane Doe',
          password: 'password123',
          confirmPassword: 'password123',
          email: 'janedoe@gmail.com',
      };

      UserModel.findOne.mockResolvedValue(null);

      // First, register a user.
      await request(app).post('/register').send(existingUser);

      // Then, try to log in with the wrong password.
      const res = await request(app).post('/login').send({
          email: 'janedoe@gmail.com',
          password: 'wrongpassword',
      });

      // We expect a 401 status (Unauthorized), as the password is wrong.
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toEqual('Invalid login. Please check your email and password.');
  });

  });

  describe('PUT /update/:id', () => {
    it('should update a user and return updated details', async () => {
      const mockUser = {
        name: 'New Name',
        email: 'new@test.com',
      };

      const dbUser = {
        id: '1234',
        email: 'test@test.com',
        name: 'Test User',
        password: 'encryptedPassword',
        imageURL: './assets/user.png',
        save: jest.fn().mockResolvedValue(),
      };
      
      UserModel.findById.mockResolvedValue(dbUser);

      const response = await request(app)
        .put(`/update/${dbUser.id}`)
        .send(mockUser);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe(mockUser.name);
      expect(response.body.email).toBe(mockUser.email);
    });
  });

  describe('GET /seed', () => {
    it('should create seed data if no users exist', async () => {
      UserModel.countDocuments.mockResolvedValue(0);

      const response = await request(app).get('/seed');

      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('Seed data created');
    });

    it('should not create seed data if users already exist', async () => {
      UserModel.countDocuments.mockResolvedValue(5);

      const response = await request(app).get('/seed');

      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('Seed data already exists');
    });
  });
});
