import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', `test${Date.now()}@example.com`);
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="profession"]', 'Software Developer');
    
    // Submit form
    await page.click('[data-testid="register-submit"]');
    
    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });

  test('should show validation errors for invalid registration', async ({ page }) => {
    await page.goto('/register');
    
    // Submit empty form
    await page.click('[data-testid="register-submit"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="error-firstName"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-password"]')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="profession"]', 'Software Developer');
    
    await page.click('[data-testid="register-submit"]');
    
    await expect(page.locator('[data-testid="error-email"]')).toContainText('Invalid email');
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', '123'); // Weak password
    await page.fill('[data-testid="profession"]', 'Software Developer');
    
    await page.click('[data-testid="register-submit"]');
    
    await expect(page.locator('[data-testid="error-password"]')).toContainText('Password must be');
  });

  test('should login with valid credentials', async ({ page }) => {
    // First, create a test account
    await page.goto('/register');
    const testEmail = `login${Date.now()}@example.com`;
    
    await page.fill('[data-testid="firstName"]', 'Login');
    await page.fill('[data-testid="lastName"]', 'User');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="profession"]', 'Tester');
    await page.click('[data-testid="register-submit"]');
    
    // Wait for registration to complete
    await expect(page).toHaveURL('/dashboard');
    
    // Logout first
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Now test login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'nonexistent@example.com');
    await page.fill('[data-testid="password"]', 'WrongPassword');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid credentials');
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/login');
    
    await page.click('text=Forgot Password?');
    await expect(page).toHaveURL('/forgot-password');
    
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.click('[data-testid="forgot-password-submit"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reset link sent');
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/register');
    const testEmail = `logout${Date.now()}@example.com`;
    
    await page.fill('[data-testid="firstName"]', 'Logout');
    await page.fill('[data-testid="lastName"]', 'User');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="profession"]', 'Tester');
    await page.click('[data-testid="register-submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    
    // Now logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Sign In')).toBeVisible();
  });
});
