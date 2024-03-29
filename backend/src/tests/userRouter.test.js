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
    
      expect(UserModel.create).toHaveBeenCalledWith({
        name: mockUser.name,
        email: mockUser.email.toLowerCase(),
        password: encryptedPassword,
        imageURL: './assets/user.png'
      });

      const promise = UserModel.create.mock.results[0].value;
      promise.then((data) => {
        const createdUserInDB = {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          imageURL: data.imageURL,
          id: data.id
        }
        expect(createdUserInDB.name).toBe(mockUser.name);
        expect(createdUserInDB.email).toBe(mockUser.email);
      });
    });

    it('should fail to register a user that already exists', async () => {
      const existingUser = {
          name: 'John Doe',
          password: 'password123',
          confirmPassword: 'password123',
          email: 'johndoe@gmail.com',
      };
  
      UserModel.findOne.mockResolvedValue(existingUser);
  
      const res = await request(app).post('/register').send(existingUser);
  
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

      await request(app).post('/register').send(existingUser);

      const res = await request(app).post('/login').send({
          email: 'janedoe@gmail.com',
          password: 'wrongpassword',
      });

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
});
