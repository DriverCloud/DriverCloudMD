import { test, expect } from '@playwright/test';

test.describe('Dashboard and Authentication Flow', () => {

    test('should redirect unauthenticated users to login', async ({ page }) => {
        // Attempt to go to dashboard
        await page.goto('/dashboard');

        // Should be redirected to login page because middleware blocks it
        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('h1')).toContainText(/Bienvenido de nuevo/i);
    });

});
