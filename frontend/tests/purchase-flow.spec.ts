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
  images: ['https://scene7.toyota.eu/is/image/toyotaeurope/camry-header_tcm-3044-2353685?wid=1920&hei=1080&fit=hfit,1']
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
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    // Mock auth endpoint
    await page.route('**/api/auth/me', async (route) => {
      if (await handleCors(route)) return;
      await route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'alan@gmail.com', name: 'Alan Test', role: 'BUYER' })
      });
    });

    // Mock car details endpoint
    await page.route(/.*\/api\/cars\/\d+$/, async (route) => {
      if (await handleCors(route)) return;
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CAR) });
      } else { await route.continue(); }
    });

    // Mock cars list endpoint
    await page.route(/.*\/api\/cars(\?|$)/, async (route) => {
      if (await handleCors(route)) return;
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_CAR]) });
      } else { await route.continue(); }
    });
  });

  test('should load cars listing page', async ({ page }) => {
    await page.goto('http://localhost:5173/cars');
    await expect(page.locator('body')).toContainText('Toyota'); 
    expect(page.url()).toContain('/cars');
  });

  test('should navigate to car details page', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('body')).toContainText('Toyota');
    expect(page.url()).toContain('/cars/1');
  });

  test('should display car information on details page', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    
    const body = page.locator('body');
    await expect(body).toContainText('Toyota');
    await expect(body).toContainText('Camry');
    await expect(body).toContainText('2023');
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('button').first()).toBeAttached();
    
    const hasBackButton = await page.getByRole('button', { name: /back|volver/i }).isVisible().catch(() => false);
    const hasNavigation = await page.locator('a, button').count().then(count => count > 0);
    expect(hasBackButton || hasNavigation).toBeTruthy();
  });

  test('should handle going back to cars list', async ({ page }) => {
    // Navigate to cars list
    await page.goto('http://localhost:5173/cars');
    await expect(page.locator('body')).toContainText('Toyota');

    // Navigate to car details
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('body')).toContainText('Toyota');
    await expect(page.locator('body')).toContainText('2023');

    // Click back button
    const backButton = page.getByRole('button', { name: /back|volver/i })
        .or(page.getByRole('link', { name: /back|volver/i }));
    
    if (await backButton.isVisible()) {
      await backButton.click();
      
      // Verify returned to cars list
      await expect(page).toHaveURL(/.*\/cars\/?(\?|$)/); 
      await expect(page.locator('body')).toContainText('Toyota');
    }
  });

  test('should maintain session across pages', async ({ page }) => {
    // Navigate to cars list
    await page.goto('http://localhost:5173/cars');
    await expect(page).toHaveURL(/.*\/cars/);
    
    // Navigate to car details
    await page.goto('http://localhost:5173/cars/1');
    await expect(page).toHaveURL(/.*\/cars\/1/);
    
    // Verify not redirected to login
    expect(page.url()).not.toContain('login');
  });

  test('should allow page refresh', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('body')).toContainText('Toyota');
    
    const urlBefore = page.url();
    
    // Reload page
    await page.reload();
    await expect(page.locator('body')).toContainText('Toyota');
    expect(page.url()).toBe(urlBefore);
  });

  test('complete user flow: browse -> view details', async ({ page }) => {
    // Navigate to cars list
    await page.goto('http://localhost:5173/cars');
    await expect(page.locator('body')).toContainText('Toyota');
    
    // View car details
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('body')).toContainText('Camry');
    expect(page.url()).toContain('/cars/1');
  });

  test('should handle multiple car views', async ({ page }) => {
    // Navigate to first car
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('body')).toContainText('Toyota');
    
    // Go back to list
    await page.goto('http://localhost:5173/cars');
    await expect(page).toHaveURL(/.*\/cars$/);
    
    // Navigate to car details again
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('body')).toContainText('Toyota');
    expect(page.url()).toContain('/cars/1');
  });

  test('should display car year and details', async ({ page }) => {
    await page.goto('http://localhost:5173/cars/1');
    
    // Verify car year
    await expect(page.locator('body')).toContainText('2023');
    
    // Verify specifications
    const pageText = await page.textContent('body');
    const hasSpecs = pageText?.includes('Hybrid') || pageText?.includes('Automatic');
    expect(hasSpecs).toBeTruthy();
  });

  test('should maintain auth token across navigations', async ({ page }) => {
    // Check token on first page
    await page.goto('http://localhost:5173/cars');
    await expect(page.locator('body')).toBeVisible();
    
    const token1 = await page.evaluate(() => localStorage.getItem('authorization_token'));
    expect(token1).toBe('mock-token-12345');
    
    // Check token still exists after navigation
    await page.goto('http://localhost:5173/cars/1');
    await expect(page.locator('body')).toContainText('Toyota');
    
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
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should have header with navigation', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Wait for header to appear
    await expect(page.locator('header')).toBeVisible();
    
    const hasNav = await page.locator('nav').isVisible().catch(() => false);
    expect(hasNav || await page.locator('a, button').count().then(count => count > 0)).toBeTruthy();
  });
});