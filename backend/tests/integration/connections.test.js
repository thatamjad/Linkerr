const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Connection = require('../../models/Connection');
const bcrypt = require('bcryptjs');

describe('Connections Integration Tests', () => {
  let server;
  let authToken;
  let userId;
  let otherUser;
  let thirdUser;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(async () => {
    // Create test users with unique emails
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 5);
    
    const testUser = await User.create({
      email: `connector-${timestamp}-${randomStr}@example.com`,
      password: 'Password123!', // Will be hashed by pre-save middleware
      profile: {
        firstName: 'Main',
        lastName: 'User'
      },
      isVerified: true
    });

    otherUser = await User.create({
      email: `connectee-${timestamp}-${randomStr}@example.com`,
      password: 'Password123!', // Will be hashed by pre-save middleware
      profile: {
        firstName: 'Other',
        lastName: 'User'
      },
      isVerified: true
    });

    thirdUser = await User.create({
      email: `third-${timestamp}-${randomStr}@example.com`,
      password: 'Password123!', // Will be hashed by pre-save middleware
      profile: {
        firstName: 'Third',
        lastName: 'User'
      },
      isVerified: true
    });

    userId = testUser._id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'Password123!'
      });

    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/connections/connect/:userId', () => {
    it('should send connection request successfully', async () => {
      const response = await request(app)
        .post(`/api/connections/connect/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Let\'s connect!' });

      if (response.status !== 201) {
        console.log('Connect test - Response status:', response.status);
        console.log('Connect test - Response body:', JSON.stringify(response.body, null, 2));
        throw new Error(`Expected status 201, got ${response.status}: ${JSON.stringify(response.body)}`);
      }

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Connection request sent successfully');

      // Verify connection request exists in database
      const connection = await Connection.findOne({
        requester: userId,
        recipient: otherUser._id,
        status: 'pending'
      });
      expect(connection).toBeTruthy();
      expect(connection.message).toBe('Let\'s connect!');
    });

    it('should not send request to self', async () => {
      const response = await request(app)
        .post(`/api/connections/connect/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not send duplicate request', async () => {
      // Send first request
      await request(app)
        .post(`/api/connections/connect/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'First request' })
        .expect(201);

      // Try to send duplicate
      const response = await request(app)
        .post(`/api/connections/connect/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Duplicate request' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should not send request if already connected', async () => {
      // Create existing connection
      await Connection.create({
        requester: userId,
        recipient: otherUser._id,
        status: 'accepted',
        connectedAt: new Date()
      });

      const response = await request(app)
        .post(`/api/connections/connect/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Already connected!' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/connections/connect/${otherUser._id}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/connections/connect/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/connections/accept|decline/:requestId', () => {
    let connectionId;

    beforeEach(async () => {
      // Create pending connection request
      const connection = await Connection.create({
        requester: otherUser._id,
        recipient: userId,
        status: 'pending',
        message: 'Test connection request'
      });
      connectionId = connection._id;
    });

    it('should accept connection request', async () => {
      const response = await request(app)
        .post(`/api/connections/accept/${connectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Connection request accepted successfully');

      // Verify connection is accepted
      const connection = await Connection.findById(connectionId);
      expect(connection.status).toBe('accepted');
      expect(connection.connectedAt).toBeTruthy();
    });

    it('should decline connection request', async () => {
      const response = await request(app)
        .post(`/api/connections/decline/${connectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Connection request declined successfully');

      // Verify connection is declined
      const connection = await Connection.findById(connectionId);
      expect(connection.status).toBe('declined');
    });

    it('should not respond to own request', async () => {
      // Create connection where user is requester
      const ownConnection = await Connection.create({
        requester: userId,
        recipient: thirdUser._id,
        status: 'pending'
      });

      const response = await request(app)
        .post(`/api/connections/accept/${ownConnection._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle invalid action endpoint', async () => {
      const response = await request(app)
        .post(`/api/connections/invalid/${connectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle non-existent connection', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/connections/accept/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/connections', () => {
    beforeEach(async () => {
      // Create various types of connections
      await Connection.create({
        requester: userId,
        recipient: otherUser._id,
        status: 'accepted',
        connectedAt: new Date()
      });

      await Connection.create({
        requester: thirdUser._id,
        recipient: userId,
        status: 'pending'
      });

      await Connection.create({
        requester: userId,
        recipient: thirdUser._id,
        status: 'declined'
      });
    });

    it('should get all connections by default', async () => {
      const response = await request(app)
        .get('/api/connections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('connections');
      expect(Array.isArray(response.body.data.connections)).toBe(true);
      expect(response.body.data.connections.length).toBe(3);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/connections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'accepted' })
        .expect(200);

      expect(response.body.data.connections).toHaveLength(1);
      expect(response.body.data.connections[0].status).toBe('accepted');
    });

    it('should filter pending requests received', async () => {
      const response = await request(app)
        .get('/api/connections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'pending', type: 'received' })
        .expect(200);

      expect(response.body.data.connections).toHaveLength(1);
      expect(response.body.data.connections[0].recipient).toBe(userId.toString());
    });

    it('should filter pending requests sent', async () => {
      const response = await request(app)
        .get('/api/connections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'pending', type: 'sent' })
        .expect(200);

      expect(response.body.data.connections).toHaveLength(0); // No sent pending in our setup
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/connections')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/connections/mutual/:userId', () => {
    beforeEach(async () => {
      // Create mutual connections scenario
      // User A (main user) connected to User C
      await Connection.create({
        requester: userId,
        recipient: thirdUser._id,
        status: 'accepted',
        connectedAt: new Date()
      });

      // User B (other user) also connected to User C
      await Connection.create({
        requester: otherUser._id,
        recipient: thirdUser._id,
        status: 'accepted',
        connectedAt: new Date()
      });
    });

    it('should find mutual connections', async () => {
      const response = await request(app)
        .get(`/api/connections/mutual/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('mutualConnections');
      expect(Array.isArray(response.body.data.mutualConnections)).toBe(true);
      expect(response.body.data.mutualConnections).toHaveLength(1);
      expect(response.body.data.mutualConnections[0]._id).toBe(thirdUser._id.toString());
    });

    it('should return empty array if no mutual connections', async () => {
      // Create a new user with no mutual connections
      const isolatedUser = await User.create({
        email: 'isolated@example.com',
        password: await bcrypt.hash('Password123!', 12),
        firstName: 'Isolated',
        lastName: 'User',
        profession: 'Professional',
        isVerified: true
      });

      const response = await request(app)
        .get(`/api/connections/mutual/${isolatedUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.mutualConnections).toHaveLength(0);
    });
  });

  describe('DELETE /api/connections/:connectionId', () => {
    let connectionId;

    beforeEach(async () => {
      const connection = await Connection.create({
        requester: userId,
        recipient: otherUser._id,
        status: 'accepted',
        connectedAt: new Date()
      });
      connectionId = connection._id;
    });

    it('should remove connection successfully', async () => {
      const response = await request(app)
        .delete(`/api/connections/${connectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Connection removed successfully');

      // Verify connection is deleted
      const connection = await Connection.findById(connectionId);
      expect(connection).toBeNull();
    });

    it('should not remove connection if not involved', async () => {
      // Create connection between other users
      const connection = await Connection.create({
        requester: otherUser._id,
        recipient: thirdUser._id,
        status: 'accepted',
        connectedAt: new Date()
      });

      const response = await request(app)
        .delete(`/api/connections/${connection._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle non-existent connection', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/connections/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
