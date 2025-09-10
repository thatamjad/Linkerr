const request = require('supertest');
const app = require('../app');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create duplicate user
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        email: 'incomplete@example.com',
        profile: {
          firstName: '',
          lastName: ''
        }
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'Password123!',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate password strength', async () => {
      const weakPasswordData = {
        email: 'weakpass@example.com',
        password: '123', // Too weak
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;
    
    beforeEach(async () => {
      // Create a test user for login tests with unique email
      const uniqueEmail = `login-${Date.now()}@example.com`;
      testUser = await User.create({
        email: uniqueEmail,
        password: 'Password123!', // Will be hashed by pre-save middleware
        profile: {
          firstName: 'Login',
          lastName: 'User'
        },
        isVerified: true
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject login for unverified user', async () => {
      // Use unique email for this test
      const uniqueEmail = `unverified-${Date.now()}@example.com`;
      
      // Create unverified user
      await User.create({
        email: uniqueEmail,
        password: 'Password123!', // Will be hashed by pre-save middleware
        profile: {
          firstName: 'Unverified',
          lastName: 'User'
        },
        isVerified: false
      });

      const loginData = {
        email: uniqueEmail,
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;
    let user;

    beforeEach(async () => {
      // Register and get refresh token
      const userData = {
        email: `refresh-${Date.now()}@example.com`, // Use unique email
        password: 'Password123!',
        profile: {
          firstName: 'Refresh',
          lastName: 'User'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      refreshToken = response.body.data.refreshToken;
      user = response.body.data.user;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let token;

    beforeEach(async () => {
      const uniqueEmail = `logout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
      const userData = {
        email: uniqueEmail, // Use unique email with timestamp and random string
        password: 'Password123!',
        profile: {
          firstName: 'Logout',
          lastName: 'User'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      token = response.body.data.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
