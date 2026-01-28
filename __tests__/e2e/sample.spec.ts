import { test, expect } from '@playwright/test';

test.describe('KWI Bagel Thursdays', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Check page title contains expected text (KWI logo is separate from h1)
    await expect(page.locator('h1')).toContainText('Bagel Thursdays');
    // Check KWI logo is present
    await expect(page.getByAltText('KWI')).toBeVisible();
  });

  test('should display countdown timer', async ({ page }) => {
    await page.goto('/');

    // Check for countdown labels (use exact match)
    await expect(page.getByText('Days', { exact: true })).toBeVisible();
    await expect(page.getByText('Hours', { exact: true })).toBeVisible();
    await expect(page.getByText('Minutes', { exact: true })).toBeVisible();
    await expect(page.getByText('Seconds', { exact: true })).toBeVisible();
  });

  test('should display bagel facts carousel', async ({ page }) => {
    await page.goto('/');

    // Check for bagel facts region
    await expect(page.getByRole('region', { name: /bagel facts/i })).toBeVisible();
  });

  test('should display bagel selector with all types', async ({ page }) => {
    await page.goto('/');

    // Check for bagel selector section heading
    await expect(page.getByRole('heading', { name: 'Select Your Bagel' })).toBeVisible();

    // Check for some bagel types (use exact match)
    await expect(page.getByText('Plain', { exact: true })).toBeVisible();
    await expect(page.getByText('Everything', { exact: true })).toBeVisible();
    await expect(page.getByText('Sesame', { exact: true })).toBeVisible();
  });

  test('should allow selecting a bagel', async ({ page }) => {
    await page.goto('/');

    // Click on Plain bagel
    await page.getByRole('button', { name: /select plain bagel/i }).click();

    // Check it's selected
    await expect(page.getByRole('button', { name: /select plain bagel/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('should enable submit button when name entered and bagel selected', async ({ page }) => {
    await page.goto('/');

    // Submit button should be disabled initially
    const submitButton = page.getByRole('button', { name: /submit order/i });
    await expect(submitButton).toBeDisabled();

    // Enter name
    await page.getByPlaceholder(/first name last initial/i).fill('Test U');

    // Still disabled without bagel selection
    await expect(submitButton).toBeDisabled();

    // Select a bagel
    await page.getByRole('button', { name: /select plain bagel/i }).click();

    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show custom input when Other is selected', async ({ page }) => {
    await page.goto('/');

    // Select Other
    await page.getByRole('button', { name: /select other bagel/i }).click();

    // Custom input should appear
    await expect(page.getByPlaceholder(/enter your bagel preference/i)).toBeVisible();
  });

  test('should show confirmation after submission', async ({ page }) => {
    await page.goto('/');

    // Enter name
    await page.getByPlaceholder(/first name last initial/i).fill('Test U');

    // Select a bagel
    await page.getByRole('button', { name: /select sesame bagel/i }).click();

    // Submit
    await page.getByRole('button', { name: /submit order/i }).click();

    // Check for confirmation
    await expect(page.getByText('Order Submitted!')).toBeVisible();
    await expect(page.getByText(/your bagel preference has been recorded/i)).toBeVisible();
  });

  test('should disable selector after submission', async ({ page }) => {
    await page.goto('/');

    // Enter name and select bagel
    await page.getByPlaceholder(/first name last initial/i).fill('Test U');
    await page.getByRole('button', { name: /select plain bagel/i }).click();
    await page.getByRole('button', { name: /submit order/i }).click();

    // Wait for submission to complete
    await expect(page.getByText('Order Submitted!')).toBeVisible();

    // Bagel cards should be disabled
    await expect(page.getByRole('button', { name: /select plain bagel/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /select sesame bagel/i })).toBeDisabled();
  });

  test('should have correct footer text', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Orders close Wednesday at 12:00 PM EST')).toBeVisible();
  });
});
