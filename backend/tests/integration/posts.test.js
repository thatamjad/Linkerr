const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Post = require('../../models/Post');
const bcrypt = require('bcryptjs');

describe('Posts Integration Tests', () => {
  let server;
  let authToken;
  let userId;
  let testUser;

  beforeAll(() => {
    server = app.listen(0);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(async () => {
    // Create and authenticate a test user with unique email
    const uniqueEmail = `poster-${Date.now()}-${Math.random().toString(36).substr(2, 5)}@example.com`;
    testUser = await User.create({
      email: uniqueEmail,
      password: 'Password123!', // Will be hashed by pre-save middleware
      profile: {
        firstName: 'Post',
        lastName: 'Creator'
      },
      isVerified: true
    });

    userId = testUser._id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'Password123!'
      });

    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/posts', () => {
    it('should create a new post successfully', async () => {
      const postData = {
        content: 'This is a test post about professional networking!',
        type: 'text',
        tags: ['networking', 'professional', 'career']
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      if (response.status !== 201) {
        console.log('Response status:', response.status);
        console.log('Response body:', JSON.stringify(response.body, null, 2));
        throw new Error(`Expected status 201, got ${response.status}: ${JSON.stringify(response.body)}`);
      }

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.post).toHaveProperty('_id');
      expect(response.body.data.post.content).toBe(postData.content);
      expect(response.body.data.post.author._id).toBe(userId.toString());
      expect(response.body.data.post.tags).toEqual(postData.tags);
    });

    it('should require authentication', async () => {
      const postData = {
        content: 'This post should fail without auth',
        type: 'text'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate required content field', async () => {
      const postData = {
        type: 'text'
        // Missing content
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should create post with mentions', async () => {
      // Create another user to mention
      const mentionedUser = await User.create({
        email: `mentioned-${Date.now()}-${Math.random().toString(36).substr(2, 5)}@example.com`,
        password: 'Password123!', // Will be hashed by pre-save middleware
        profile: {
          firstName: 'Mentioned',
          lastName: 'User'
        },
        isVerified: true
      });

      const postData = {
        content: `Great to connect with @${mentionedUser._id}!`,
        type: 'text',
        mentions: [mentionedUser._id]
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      if (response.status !== 201) {
        console.log('Mentions test - Response status:', response.status);
        console.log('Mentions test - Response body:', JSON.stringify(response.body, null, 2));
        throw new Error(`Expected status 201, got ${response.status}: ${JSON.stringify(response.body)}`);
      }

      expect(response.body.data.post.mentions).toHaveLength(1);
      expect(response.body.data.post.mentions[0]).toBe(mentionedUser._id.toString());
    });
  });

  describe('GET /api/posts/feed', () => {
    beforeEach(async () => {
      // Create some test posts
      await Post.create({
        author: userId,
        content: 'First test post',
        type: 'text'
      });

      await Post.create({
        author: userId,
        content: 'Second test post with image',
        type: 'image',
        mediaUrl: 'https://example.com/image.jpg'
      });

      // Create post from different user
      const otherUser = await User.create({
        email: `other-${Date.now()}-${Math.random().toString(36).substr(2, 5)}@example.com`,
        password: 'Password123!', // Will be hashed by pre-save middleware
        profile: {
          firstName: 'Other',
          lastName: 'User'
        },
        isVerified: true
      });

      await Post.create({
        author: otherUser._id,
        content: 'Post from another user',
        type: 'text'
      });
    });

    it('should fetch paginated feed', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('posts');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      expect(response.body.data.posts.length).toBeGreaterThan(0);
    });

    it('should require authentication for feed', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should populate author information', async () => {
      const response = await request(app)
        .get('/api/posts/feed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const post = response.body.data.posts[0];
      expect(post).toHaveProperty('author');
      expect(typeof post.author).toBe('object');
      expect(post.author).toHaveProperty('profile');
      expect(post.author.profile).toHaveProperty('firstName');
      expect(post.author.profile).toHaveProperty('lastName');
      expect(post.author).not.toHaveProperty('password');
    });
  });

  describe('POST /api/posts/:id/like', () => {
    let postId;

    beforeEach(async () => {
      const post = await Post.create({
        author: userId,
        content: 'Post to be liked',
        type: 'text'
      });
      postId = post._id;
    });

    it('should like a post successfully', async () => {
      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('likesCount');
      expect(response.body.data.likesCount).toBe(1);
      expect(response.body.data.isLiked).toBe(true);
    });

    it('should unlike a post if already liked', async () => {
      // First like the post
      await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Then unlike it
      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.likesCount).toBe(0);
      expect(response.body.data.isLiked).toBe(false);
    });

    it('should require authentication to like', async () => {
      const response = await request(app)
        .post(`/api/posts/${postId}/like`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/posts/${fakeId}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/posts/:id/comment', () => {
    let postId;

    beforeEach(async () => {
      const post = await Post.create({
        author: userId,
        content: 'Post to comment on',
        type: 'text'
      });
      postId = post._id;
    });

    it('should add comment successfully', async () => {
      const commentData = {
        content: 'This is a great post!'
      };

      const response = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('content', commentData.content);
      expect(response.body.data).toHaveProperty('author');
      expect(response.body.data.author).toHaveProperty('_id', userId.toString());
    });

    it('should require comment content', async () => {
      const response = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require authentication to comment', async () => {
      const commentData = {
        content: 'This comment should fail'
      };

      const response = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .send(commentData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/posts/:id', () => {
    let postId;

    beforeEach(async () => {
      const post = await Post.create({
        author: userId,
        content: 'Single post to fetch',
        type: 'text',
        tags: ['test', 'single']
      });
      postId = post._id;
    });

    it('should fetch single post with details', async () => {
      const response = await request(app)
        .get(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.post).toHaveProperty('_id', postId.toString());
      expect(response.body.data.post).toHaveProperty('content');
      expect(response.body.data.post).toHaveProperty('author');
      expect(response.body.data.post.tags).toEqual(['test', 'single']);
    });

    it('should handle non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/posts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/posts/${postId}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let postId;

    beforeEach(async () => {
      const post = await Post.create({
        author: userId,
        content: 'Post to be deleted',
        type: 'text'
      });
      postId = post._id;
    });

    it('should delete own post successfully', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Post deleted successfully');

      // Verify post is deleted
      const deletedPost = await Post.findById(postId);
      expect(deletedPost).toBeNull();
    });

    it('should not delete other user\'s post', async () => {
      // Create another user
      const otherUser = await User.create({
        email: `otherdelete-${Date.now()}-${Math.random().toString(36).substr(2, 5)}@example.com`,
        password: 'Password123!', // Will be hashed by pre-save middleware
        profile: {
          firstName: 'Other',
          lastName: 'User'
        },
        isVerified: true
      });

      // Create post by other user
      const otherPost = await Post.create({
        author: otherUser._id,
        content: 'Other user\'s post',
        type: 'text'
      });

      const response = await request(app)
        .delete(`/api/posts/${otherPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require authentication to delete', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});
