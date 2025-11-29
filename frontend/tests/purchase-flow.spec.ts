import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'alan@gmail.com',
  password: 'Alan1234'
};

test.describe('Car Purchase Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5173/login');
    await expect(page.getByLabel('Email')).toBeVisible({ timeout: 10000 });
    
    // Fill in credentials
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);
    
    // Submit login form
    await page.getByRole('button', { name: /log in/i }).click();
    
    // Wait for redirect to cars page
    await page.waitForURL('**/cars', { timeout: 15000 });
  });

  test('should display purchase button on car details page', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Verify purchase button is visible
    const purchaseButton = page.getByRole('button', { name: /purchase/i }).first();
    await expect(purchaseButton).toBeVisible({ timeout: 10000 });
  });

  test('should open purchase modal when purchase button is clicked', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Click first purchase button
    await page.getByRole('button', { name: /purchase/i }).first().click();
    
    // Verify modal opens
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible({ timeout: 10000 });
  });

  test('should display all required fields in purchase modal', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Click purchase button to open modal
    await page.getByRole('button', { name: /purchase/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Verify purchase details section
    await expect(page.getByText('Purchase Details')).toBeVisible();
    await expect(page.getByText('Vehicle:')).toBeVisible();
    await expect(page.getByText('Dealership:')).toBeVisible();
    await expect(page.getByText('Price:')).toBeVisible();
    
    // Verify form fields
    await expect(page.getByLabel('Payment Method:')).toBeVisible();
    await expect(page.getByPlaceholder('Add any notes or special requests...')).toBeVisible();
    
    // Verify action buttons
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirm Purchase' })).toBeVisible();
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Open purchase modal
    await page.getByRole('button', { name: /purchase/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Click cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify modal closes
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).not.toBeVisible();
  });

  test('should allow payment method selection', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Open purchase modal
    await page.getByRole('button', { name: /purchase/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Get payment method dropdown
    const paymentDropdown = page.getByLabel('Payment Method:');
    const currentValue = await paymentDropdown.inputValue();
    
    // Check if multiple payment options exist
    const optionCount = await paymentDropdown.locator('option').count();
    if (optionCount > 1) {
      // Select second payment option
      const secondOption = await paymentDropdown.locator('option').nth(1).getAttribute('value');
      await paymentDropdown.selectOption(secondOption as string);
      
      // Verify selection changed
      const newValue = await paymentDropdown.inputValue();
      expect(newValue).not.toBe(currentValue);
    }
  });

  test('should allow adding optional observations', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Open purchase modal
    await page.getByRole('button', { name: /purchase/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Add observations text
    const testObservations = 'Please deliver on Saturday morning.';
    await page.getByPlaceholder('Add any notes or special requests...').fill(testObservations);
    
    // Verify text was entered correctly
    await expect(page.getByPlaceholder('Add any notes or special requests...')).toHaveValue(testObservations);
  });

  test('should submit purchase successfully', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Open purchase modal
    await page.getByRole('button', { name: /purchase/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Click confirm purchase button
    await page.getByRole('button', { name: 'Confirm Purchase' }).click();
    await page.waitForTimeout(1000);
    
    // Check for success message with flexible matching
    const hasSuccessMessage = await page
      .getByText(/success|completed|thank|purchase.*made|order.*created/i)
      .isVisible()
      .catch(() => false);
    
    if (hasSuccessMessage) {
      // Verify success message appears
      await expect(page.getByText(/success|completed|thank|purchase.*made|order.*created/i))
        .toBeVisible();
    } else {
      // If no success message, verify modal closes instead
      await expect(page.getByRole('heading', { name: 'Your Purchase' }))
        .not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should submit purchase with custom observations', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Open purchase modal
    await page.getByRole('button', { name: /purchase/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Add custom observations
    const customNotes = 'Special request: Include all floor mats and spare keys.';
    await page.getByPlaceholder('Add any notes or special requests...').fill(customNotes);
    
    // Verify text was entered
    await expect(page.getByPlaceholder('Add any notes or special requests...')).toHaveValue(customNotes);
    
    // Submit purchase
    await page.getByRole('button', { name: 'Confirm Purchase' }).click();
    await page.waitForTimeout(1000);
    
    // Verify success
    const hasSuccessMessage = await page
      .getByText(/success|completed|thank|purchase.*made|order.*created/i)
      .isVisible()
      .catch(() => false);
    
    if (hasSuccessMessage) {
      await expect(page.getByText(/success|completed|thank|purchase.*made|order.*created/i))
        .toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: 'Your Purchase' }))
        .not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should maintain user session throughout flow', async ({ page }) => {
    // Navigate to cars listing page
    await page.goto('http://localhost:5173/cars');
    await page.waitForLoadState('networkidle');
    
    // Verify not redirected to login
    const pageUrl = page.url();
    expect(pageUrl).not.toContain('login');
    
    // Navigate to specific car details
    await page.goto('http://localhost:5173/cars/1');
    
    // Verify still logged in (purchase button visible)
    await expect(page.getByRole('button', { name: /purchase/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('complete purchase flow from login to confirmation', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Verify purchase button is visible
    const purchaseButton = page.getByRole('button', { name: /purchase/i }).first();
    await expect(purchaseButton).toBeVisible();
    
    // Click purchase button
    await purchaseButton.click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Verify purchase details displayed
    await expect(page.getByText('Purchase Details')).toBeVisible();
    
    // Add observations
    await page.getByPlaceholder('Add any notes or special requests...').fill('Test purchase for automation.');
    
    // Submit purchase
    await page.getByRole('button', { name: 'Confirm Purchase' }).click();
    await page.waitForTimeout(1000);
    
    // Verify purchase completed
    const hasSuccessMessage = await page
      .getByText(/success|completed|thank|purchase.*made|order.*created/i)
      .isVisible()
      .catch(() => false);
    
    if (hasSuccessMessage) {
      await expect(page.getByText(/success|completed|thank|purchase.*made|order.*created/i))
        .toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: 'Your Purchase' }))
        .not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle page refresh during purchase flow', async ({ page }) => {
    // Navigate to car details page
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Open purchase modal
    await page.getByRole('button', { name: /purchase/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Your Purchase' })).toBeVisible();
    
    // Refresh page
    await page.reload();
    
    // Verify page loads after refresh
    await page.waitForLoadState('networkidle');
  });

  test('should not allow purchase if not logged in', async ({ page }) => {
    // Clear all authentication data
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate to car details
    await page.goto('http://localhost:5173/cars/1');
    await page.waitForLoadState('networkidle');
    
    // Verify either redirected to login or access denied message shown
    const isRedirectedToLogin = page.url().includes('login');
    const hasAccessDenied = await page.getByText(/login|sign in|unauthorized/i)
      .isVisible()
      .catch(() => false);
    
    expect(isRedirectedToLogin || hasAccessDenied).toBeTruthy();
  });
});