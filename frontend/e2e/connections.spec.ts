import { test, expect, type Page } from '@playwright/test';

const testEmail1 = `connect1${Date.now()}@example.com`;
const testEmail2 = `connect2${Date.now()}@example.com`;

test.describe('Connections Feature', () => {
  // Helper function to register and authenticate user
  async function registerUser(page: Page, email: string, firstName: string, lastName: string) {
    await page.goto('/register');
    
    await page.fill('[data-testid="firstName"]', firstName);
    await page.fill('[data-testid="lastName"]', lastName);
    await page.fill('[data-testid="email"]', email);
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="profession"]', 'Professional');
    await page.click('[data-testid="register-submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  }

  test('should navigate to connections page', async ({ page }) => {
    await registerUser(page, testEmail1, 'Connect', 'User1');
    
    await page.click('[data-testid="connections-nav"]');
    await expect(page).toHaveURL('/connections');
    await expect(page.locator('h1')).toContainText('Connections');
  });

  test('should display connection statistics', async ({ page }) => {
    await registerUser(page, testEmail1, 'Connect', 'User1');
    await page.goto('/connections');
    
    // Should show connection statistics
    await expect(page.locator('[data-testid="total-connections"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-requests"]')).toBeVisible();
    await expect(page.locator('[data-testid="mutual-connections"]')).toBeVisible();
  });

  test('should send connection request', async ({ browser }) => {
    // Create two users
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await registerUser(page1, testEmail1, 'Requester', 'User');
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await registerUser(page2, testEmail2, 'Recipient', 'User');
    
    // User 1 goes to search and finds user 2
    await page1.goto('/search');
    await page1.fill('[data-testid="search-users"]', 'Recipient User');
    await page1.click('[data-testid="search-button"]');
    
    // Should find user 2 in results
    await expect(page1.locator('[data-testid="user-result"]').first()).toContainText('Recipient User');
    
    // Send connection request
    await page1.locator('[data-testid="connect-button"]').first().click();
    
    // Add message to connection request
    await page1.fill('[data-testid="connection-message"]', 'Would love to connect!');
    await page1.click('[data-testid="send-request"]');
    
    // Should show success message
    await expect(page1.locator('[data-testid="success-toast"]')).toContainText('Connection request sent');
    
    // User 2 should receive the request
    await page2.goto('/connections');
    await page2.click('[data-testid="pending-tab"]');
    
    // Should see pending request from user 1
    await expect(page2.locator('[data-testid="connection-request"]').first()).toContainText('Requester User');
    await expect(page2.locator('[data-testid="connection-message"]').first()).toContainText('Would love to connect!');
    
    await context1.close();
    await context2.close();
  });

  test('should accept connection request', async ({ browser }) => {
    // Create two users and send connection request
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await registerUser(page1, testEmail1, 'Requester', 'User');
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await registerUser(page2, testEmail2, 'Recipient', 'User');
    
    // Send connection request (simplified for test)
    await page1.goto('/search');
    await page1.fill('[data-testid="search-users"]', 'Recipient User');
    await page1.click('[data-testid="search-button"]');
    await page1.locator('[data-testid="connect-button"]').first().click();
    await page1.fill('[data-testid="connection-message"]', 'Let\'s connect!');
    await page1.click('[data-testid="send-request"]');
    
    // User 2 accepts the request
    await page2.goto('/connections');
    await page2.click('[data-testid="pending-tab"]');
    
    // Accept the request
    await page2.locator('[data-testid="accept-button"]').first().click();
    
    // Should show success message
    await expect(page2.locator('[data-testid="success-toast"]')).toContainText('Connection accepted');
    
    // Should move to connections list
    await page2.click('[data-testid="connections-tab"]');
    await expect(page2.locator('[data-testid="connection-item"]').first()).toContainText('Requester User');
    
    // User 1 should also see the connection
    await page1.goto('/connections');
    await expect(page1.locator('[data-testid="connection-item"]').first()).toContainText('Recipient User');
    
    await context1.close();
    await context2.close();
  });

  test('should decline connection request', async ({ browser }) => {
    // Create two users and send connection request
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await registerUser(page1, testEmail1, 'Requester', 'User');
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await registerUser(page2, testEmail2, 'Recipient', 'User');
    
    // Send connection request
    await page1.goto('/search');
    await page1.fill('[data-testid="search-users"]', 'Recipient User');
    await page1.click('[data-testid="search-button"]');
    await page1.locator('[data-testid="connect-button"]').first().click();
    await page1.fill('[data-testid="connection-message"]', 'Let\'s connect!');
    await page1.click('[data-testid="send-request"]');
    
    // User 2 declines the request
    await page2.goto('/connections');
    await page2.click('[data-testid="pending-tab"]');
    
    // Decline the request
    await page2.locator('[data-testid="decline-button"]').first().click();
    await page2.click('[data-testid="confirm-decline"]');
    
    // Should show success message
    await expect(page2.locator('[data-testid="success-toast"]')).toContainText('Connection declined');
    
    // Request should be removed from pending list
    await expect(page2.locator('[data-testid="connection-request"]')).not.toBeVisible();
    
    await context1.close();
    await context2.close();
  });

  test('should remove existing connection', async ({ browser }) => {
    // Create two users, connect them, then remove connection
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await registerUser(page1, testEmail1, 'User', 'One');
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await registerUser(page2, testEmail2, 'User', 'Two');
    
    // Connect users (simplified flow)
    await page1.goto('/search');
    await page1.fill('[data-testid="search-users"]', 'User Two');
    await page1.click('[data-testid="search-button"]');
    await page1.locator('[data-testid="connect-button"]').first().click();
    await page1.click('[data-testid="send-request"]');
    
    // Accept connection
    await page2.goto('/connections');
    await page2.click('[data-testid="pending-tab"]');
    await page2.locator('[data-testid="accept-button"]').first().click();
    
    // Now remove connection
    await page2.click('[data-testid="connections-tab"]');
    await page2.locator('[data-testid="connection-menu"]').first().click();
    await page2.click('[data-testid="remove-connection"]');
    await page2.click('[data-testid="confirm-remove"]');
    
    // Should show success message
    await expect(page2.locator('[data-testid="success-toast"]')).toContainText('Connection removed');
    
    // Connection should be removed from list
    await expect(page2.locator('[data-testid="connection-item"]')).not.toBeVisible();
    
    await context1.close();
    await context2.close();
  });

  test('should show mutual connections', async ({ browser }) => {
    // Create three users: A, B, C
    // A connects to C, B connects to C
    // When A views B's profile, should show C as mutual connection
    
    const context1 = await browser.newContext();
    const page1 = await context1.newPage(); // User A
    await registerUser(page1, testEmail1, 'User', 'A');
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage(); // User B
    await registerUser(page2, testEmail2, 'User', 'B');
    
    const context3 = await browser.newContext();
    const page3 = await context3.newPage(); // User C
    const testEmail3 = `connect3${Date.now()}@example.com`;
    await registerUser(page3, testEmail3, 'User', 'C');
    
    // User A connects to User C
    await page1.goto('/search');
    await page1.fill('[data-testid="search-users"]', 'User C');
    await page1.click('[data-testid="search-button"]');
    await page1.locator('[data-testid="connect-button"]').first().click();
    await page1.click('[data-testid="send-request"]');
    
    // User C accepts A's request
    await page3.goto('/connections');
    await page3.click('[data-testid="pending-tab"]');
    await page3.locator('[data-testid="accept-button"]').first().click();
    
    // User B connects to User C
    await page2.goto('/search');
    await page2.fill('[data-testid="search-users"]', 'User C');
    await page2.click('[data-testid="search-button"]');
    await page2.locator('[data-testid="connect-button"]').first().click();
    await page2.click('[data-testid="send-request"]');
    
    // User C accepts B's request
    await page3.goto('/connections');
    await page3.click('[data-testid="pending-tab"]');
    await page3.locator('[data-testid="accept-button"]').first().click();
    
    // Now User A views User B's profile to see mutual connections
    await page1.goto('/search');
    await page1.fill('[data-testid="search-users"]', 'User B');
    await page1.click('[data-testid="search-button"]');
    await page1.locator('[data-testid="view-profile"]').first().click();
    
    // Should show mutual connections section
    await expect(page1.locator('[data-testid="mutual-connections"]')).toBeVisible();
    await expect(page1.locator('[data-testid="mutual-connection-item"]').first()).toContainText('User C');
    
    await context1.close();
    await context2.close();
    await context3.close();
  });

  test('should search and filter connections', async ({ page }) => {
    await registerUser(page, testEmail1, 'Search', 'User');
    await page.goto('/connections');
    
    // Should have search functionality
    await expect(page.locator('[data-testid="search-connections"]')).toBeVisible();
    
    // Should have filter options
    await expect(page.locator('[data-testid="filter-dropdown"]')).toBeVisible();
    
    // Test search functionality
    await page.fill('[data-testid="search-connections"]', 'John');
    await page.click('[data-testid="search-button"]');
    
    // Should show search results or no results message
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should handle connection request notifications', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await registerUser(page1, testEmail1, 'Sender', 'User');
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await registerUser(page2, testEmail2, 'Receiver', 'User');
    
    // Send connection request
    await page1.goto('/search');
    await page1.fill('[data-testid="search-users"]', 'Receiver User');
    await page1.click('[data-testid="search-button"]');
    await page1.locator('[data-testid="connect-button"]').first().click();
    await page1.click('[data-testid="send-request"]');
    
    // User 2 should see notification
    await page2.goto('/dashboard');
    
    // Check for notification badge
    await expect(page2.locator('[data-testid="notification-badge"]')).toBeVisible();
    await expect(page2.locator('[data-testid="notification-badge"]')).toContainText('1');
    
    // Click notifications to view
    await page2.click('[data-testid="notifications-button"]');
    await expect(page2.locator('[data-testid="notification-item"]').first()).toContainText('connection request');
    
    await context1.close();
    await context2.close();
  });
});
