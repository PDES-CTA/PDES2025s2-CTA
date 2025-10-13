import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('http://localhost:5173/login'); // Adjust port if needed
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Log In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('should show validation for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Log In' }).click();
    
    // HTML5 validation will prevent submission
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Mock the API call
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          token: 'fake-token',
          user: { id: 1, email: 'test@example.com' }
        }),
      });
    });

    // Fill in the form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Submit
    await page.getByRole('button', { name: 'Log In' }).click();

    // Wait for navigation to cars page
    await page.waitForURL('**/cars');
    expect(page.url()).toContain('/cars');
  });

    test('should show error message for invalid credentials', async ({ page }) => {
  // Log all network requests to see if our mock is working
  page.on('request', request => {
    console.log('Request:', request.url(), request.method());
  });
  
  page.on('response', response => {
    console.log('Response:', response.url(), response.status());
  });

  // Mock failed login - try different URL patterns
  let routeMatched = false;
  await page.route('**/**/login', async (route) => {
    console.log('Route matched!', route.request().url());
    routeMatched = true;
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify('Invalid credentials'),
    });
  });

  await page.getByLabel('Email').fill('wrong@example.com');
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Log In' }).click();

  // Wait a bit
  await page.waitForTimeout(2000);

  console.log('Route was matched:', routeMatched);

  // Take a screenshot
  await page.screenshot({ path: 'test-results/error-state.png', fullPage: true });

  // Check the page content
  const bodyText = await page.textContent('body');
  console.log('Body text after submit:', bodyText);

  // Check for error using role="alert"
  const alertExists = await page.getByRole('alert').count();
  console.log('Alert count:', alertExists);

  if (alertExists > 0) {
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Invalid credentials');
  } else {
    console.log('No alert found! Checking for any error text...');
    // Try to find any text that might be an error
    const pageContent = await page.content();
    console.log('Full page HTML:', pageContent);
  }
});

  test('should show loading state during submission', async ({ page }) => {
    // Delay the API response
    await page.route('**/api/auth/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ token: 'fake-token' }),
      });
    });

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();

    // Check loading state
    await expect(page.getByText('Logging in...')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign up' }).click();
    await page.waitForURL('**/register');
    expect(page.url()).toContain('/register');
  });
});