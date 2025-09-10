import { test, expect, type Page } from '@playwright/test';

const testEmail = `e2e${Date.now()}@example.com`;

test.describe('Posts Feature', () => {
  // Helper function to authenticate user
  async function authenticateUser(page: Page) {
    await page.goto('/register');
    
    await page.fill('[data-testid="firstName"]', 'Post');
    await page.fill('[data-testid="lastName"]', 'Creator');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="profession"]', 'Content Creator');
    await page.click('[data-testid="register-submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  }

  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
  });

  test('should display posts feed', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('[data-testid="posts-feed"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-post-button"]')).toBeVisible();
  });

  test('should create a text post successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click create post button
    await page.click('[data-testid="create-post-button"]');
    
    // Wait for modal to open
    await expect(page.locator('[data-testid="create-post-modal"]')).toBeVisible();
    
    // Fill post content
    await page.fill('[data-testid="post-content"]', 'This is my first professional post! #networking #career');
    
    // Add tags
    await page.fill('[data-testid="post-tags"]', 'networking, career, professional');
    
    // Submit post
    await page.click('[data-testid="submit-post"]');
    
    // Modal should close and post should appear in feed
    await expect(page.locator('[data-testid="create-post-modal"]')).not.toBeVisible();
    
    // Check if post appears in feed
    await expect(page.locator('[data-testid="post-item"]').first()).toContainText('This is my first professional post!');
    await expect(page.locator('[data-testid="post-tags"]').first()).toContainText('#networking');
  });

  test('should validate post content requirements', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('[data-testid="create-post-button"]');
    await expect(page.locator('[data-testid="create-post-modal"]')).toBeVisible();
    
    // Try to submit empty post
    await page.click('[data-testid="submit-post"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="content-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-error"]')).toContainText('required');
  });

  test('should like and unlike posts', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create a post first
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', 'Post to be liked!');
    await page.click('[data-testid="submit-post"]');
    
    // Wait for post to appear
    await expect(page.locator('[data-testid="post-item"]').first()).toBeVisible();
    
    // Like the post
    const likeButton = page.locator('[data-testid="like-button"]').first();
    await likeButton.click();
    
    // Check if like count increased
    await expect(page.locator('[data-testid="likes-count"]').first()).toContainText('1');
    
    // Unlike the post
    await likeButton.click();
    
    // Check if like count decreased
    await expect(page.locator('[data-testid="likes-count"]').first()).toContainText('0');
  });

  test('should add comments to posts', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create a post first
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', 'Post to comment on!');
    await page.click('[data-testid="submit-post"]');
    
    // Wait for post to appear
    await expect(page.locator('[data-testid="post-item"]').first()).toBeVisible();
    
    // Click comment button
    await page.locator('[data-testid="comment-button"]').first().click();
    
    // Add comment
    await page.fill('[data-testid="comment-input"]', 'Great post! Very insightful.');
    await page.click('[data-testid="submit-comment"]');
    
    // Check if comment appears
    await expect(page.locator('[data-testid="comment-item"]').first()).toContainText('Great post! Very insightful.');
    
    // Check if comment count updated
    await expect(page.locator('[data-testid="comments-count"]').first()).toContainText('1');
  });

  test('should display post engagement metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create a post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', 'Post with engagement metrics!');
    await page.click('[data-testid="submit-post"]');
    
    const postItem = page.locator('[data-testid="post-item"]').first();
    
    // Should show engagement metrics
    await expect(postItem.locator('[data-testid="likes-count"]')).toBeVisible();
    await expect(postItem.locator('[data-testid="comments-count"]')).toBeVisible();
    await expect(postItem.locator('[data-testid="shares-count"]')).toBeVisible();
    
    // Should show post timestamp
    await expect(postItem.locator('[data-testid="post-timestamp"]')).toBeVisible();
  });

  test('should delete own post', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create a post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', 'Post to be deleted!');
    await page.click('[data-testid="submit-post"]');
    
    const postItem = page.locator('[data-testid="post-item"]').first();
    await expect(postItem).toBeVisible();
    
    // Click post options menu
    await postItem.locator('[data-testid="post-menu"]').click();
    
    // Click delete option
    await page.click('[data-testid="delete-post"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');
    
    // Post should be removed from feed
    await expect(postItem).not.toBeVisible();
  });

  test('should share post', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create a post
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', 'Post to be shared!');
    await page.click('[data-testid="submit-post"]');
    
    const postItem = page.locator('[data-testid="post-item"]').first();
    
    // Click share button
    await postItem.locator('[data-testid="share-button"]').click();
    
    // Share modal should open
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    
    // Add comment to share
    await page.fill('[data-testid="share-comment"]', 'Sharing this great post!');
    await page.click('[data-testid="confirm-share"]');
    
    // Share modal should close
    await expect(page.locator('[data-testid="share-modal"]')).not.toBeVisible();
    
    // Share count should increase
    await expect(postItem.locator('[data-testid="shares-count"]')).toContainText('1');
  });

  test('should handle post with media attachments', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('[data-testid="create-post-button"]');
    
    // Upload image
    const fileInput = page.locator('[data-testid="media-upload"]');
    await fileInput.setInputFiles([{
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content')
    }]);
    
    // Add content
    await page.fill('[data-testid="post-content"]', 'Post with image attachment!');
    
    // Check if media preview appears
    await expect(page.locator('[data-testid="media-preview"]')).toBeVisible();
    
    await page.click('[data-testid="submit-post"]');
    
    // Post should appear with media
    const postItem = page.locator('[data-testid="post-item"]').first();
    await expect(postItem.locator('[data-testid="post-media"]')).toBeVisible();
  });

  test('should implement infinite scroll for posts feed', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create multiple posts first
    for (let i = 0; i < 15; i++) {
      await page.click('[data-testid="create-post-button"]');
      await page.fill('[data-testid="post-content"]', `Test post number ${i + 1}`);
      await page.click('[data-testid="submit-post"]');
      await page.waitForTimeout(500); // Small delay between posts
    }
    
    // Scroll to bottom to trigger loading more posts
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Should load more posts
    await expect(page.locator('[data-testid="loading-more-posts"]')).toBeVisible();
    
    // Should have more than initial load
    const postCount = await page.locator('[data-testid="post-item"]').count();
    expect(postCount).toBeGreaterThan(10);
  });

  test('should filter posts by tags', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Create posts with different tags
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', 'Post about JavaScript development');
    await page.fill('[data-testid="post-tags"]', 'javascript, development');
    await page.click('[data-testid="submit-post"]');
    
    await page.click('[data-testid="create-post-button"]');
    await page.fill('[data-testid="post-content"]', 'Post about career growth');
    await page.fill('[data-testid="post-tags"]', 'career, growth');
    await page.click('[data-testid="submit-post"]');
    
    // Filter by tag
    await page.click('[data-testid="filter-by-tag"]');
    await page.click('[data-testid="tag-javascript"]');
    
    // Should only show posts with JavaScript tag
    await expect(page.locator('[data-testid="post-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="post-item"]').first()).toContainText('JavaScript development');
  });
});
