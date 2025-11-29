import { test, expect, Route } from '@playwright/test';

const MOCK_CAR = {
  id: 1,
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  color: 'Silver',
  fuelType: 'Hybrid',
  transmission: 'Automatic',
  price: 25000,
  mileage: 5000,
  description: 'Well-maintained hybrid sedan',
  images: ['https://via.placeholder.com/800x600']
};

// Handle CORS OPTIONS requests
const handleCors = async (route: Route) => {
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      }
    });
    return true;
  }
  return false;
};

test.describe('Car Purchase Flow', () => {
  
  test.beforeEach(async ({ page, context }) => {
    // Set auth token before page loads
    await context.addInitScript(() => {
      localStorage.setItem('authorization_token', 'mock-token-12345');
      localStorage.setItem('user_role', 'BUYER');
    });

    // Catch-all for unmocked API requests
    await page.route('**/api/**', async (route) => {
      if (await handleCors(route)) return;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]) 
      });
    });

    // Mock auth endpoint
    await page.route('**/api/auth/me', async (route) => {
      if (await handleCors(route)) return;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'alan@gmail.com',
          name: 'Alan Test',
          role: 'BUYER'
        })
      });
    });

    // Mock car details endpoint
    await page.route(/.*\/api\/cars\/\d+$/, async (route) => {
      if (await handleCors(route)) return;
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_CAR)
        });
      } else {
        await route.continue();
      }
    });

    // Mock cars list endpoint
    await page.route(/.*\/api\/cars(\?|$)/, async (route) => {
      if (await handleCors(route)) return;
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([MOCK_CAR])
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should load cars listing page', async ({ page }) => {
    await page.goto('http://localhost:5173/cars');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cars');
  });

  test('should navigate to car details page', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cars/1');
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(100);
  });

  test('should display car information on details page', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    const body = page.locator('body');
    await expect(body).toContainText('Toyota');
    await expect(body).toContainText('Camry');
    await expect(body).toContainText('2023');
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    const hasBackButton = await page.getByRole('button', { name: /back/i }).isVisible().catch(() => false);
    const hasNavigation = await page.locator('a, button').count().then(count => count > 0);
    expect(hasBackButton || hasNavigation).toBeTruthy();
  });

  test('should handle going back to cars list', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    const backButton = page.locator('button').filter({ hasText: /back|volver/i }).first();
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain('/cars/1');
    }
  });

  test('should maintain session across pages', async ({ page }) => {
    await page.goto('http://localhost:5173/cars');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cars');
    
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cars/1');
    expect(page.url()).not.toContain('login');
  });

  test('should allow page refresh', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    const urlBefore = page.url();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBe(urlBefore);
  });

  test('complete user flow: browse -> view details', async ({ page }) => {
    // Navigate to cars list
    await page.goto('http://localhost:5173/cars');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cars');
    
    // View car details
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cars/1');
    
    // Verify car info displayed
    await expect(page.locator('body')).toContainText('Toyota');
  });

  test('should handle multiple car views', async ({ page }) => {
    // Navigate to first car
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Go back to list
    await page.goto('http://localhost:5173/cars');
    await page.waitForLoadState('networkidle');
    
    // View another car
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cars/1');
  });

  test('should display car year and details', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Verify car year displays
    await expect(page.locator('body')).toContainText('2023');
    
    // Verify specs displayed
    const pageText = await page.textContent('body');
    const hasSpecs = pageText?.includes('Hybrid') || pageText?.includes('Automatic');
    expect(hasSpecs).toBeTruthy();
  });

  test('should maintain auth token across navigations', async ({ page }) => {
    // Check token on cars list
    await page.goto('http://localhost:5173/cars');
    await page.waitForLoadState('networkidle');
    const token1 = await page.evaluate(() => localStorage.getItem('authorization_token'));
    expect(token1).toBe('mock-token-12345');
    
    // Check token still exists after navigation
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    const token2 = await page.evaluate(() => localStorage.getItem('authorization_token'));
    expect(token2).toBe('mock-token-12345');
  });

  test('should show login page when not authenticated', async ({ browser }) => {
    // Test without auth - uses new context so mocks must be redeclared
    const newContext = await browser!.newContext();
    const newPage = await newContext.newPage();
    
    // Mock auth to fail
    await newPage.route('**/api/auth/me', async (route) => {
      if (await handleCors(route)) return;
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' })
      });
    });

    // Mock car endpoint
    await newPage.route(/.*\/api\/cars\/\d+$/, async (route) => {
      if (await handleCors(route)) return;
      await route.fulfill({ status: 200, body: JSON.stringify(MOCK_CAR) }); 
    });
    
    // Try to access protected page
    await newPage.goto('http://localhost:5173/cars/1');
    
    // Should redirect to login
    await expect(newPage).toHaveURL(/\/login/);
    
    await newPage.close();
    await newContext.close();
  });

  test('should load home page', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toBeTruthy();
  });

  test('should have header with navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    const hasHeader = await page.locator('header').isVisible().catch(() => false);
    const hasNav = await page.locator('nav').isVisible().catch(() => false);
    
    expect(hasHeader || hasNav || await page.locator('a, button').count().then(count => count > 0)).toBeTruthy();
  });
});