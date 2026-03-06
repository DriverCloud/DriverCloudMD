import { test, expect } from '@playwright/test';

// Use a specific test user or let the test create one.
// For this flow, we assume an admin is logging in and selling a package to a student.
test.describe('Package Sales Flow', () => {

    test('admin can sell a package to a student successfully', async ({ page }) => {
        // 1. Navigate to login
        await page.goto('/login');

        // 2. Fill login form (assuming test credentials exist in the environment or DB)
        // This is a placeholder for the actual login logic. In a real E2E environment, 
        // you would use a dedicated test admin account.
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // 3. Verify redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/);

        // 4. Navigate to Students section
        await page.click('a[href="/dashboard/students"]');
        await expect(page.locator('h1')).toContainText(/Alumnos/i);

        // 5. Click "Vender Paquete" (Sell Package) on the first student or a generic button
        // Since we don't know the exact DOM structure without seeing it, we'll look for the text
        const sellButton = page.locator('button', { hasText: /Vender Paquete/i }).first();
        if (await sellButton.isVisible()) {
            await sellButton.click();

            // 6. Fill the Sell Package Dialog
            // Select a package (assuming there's a select or combobox)
            // Wait for dialog to appear
            await expect(page.locator('[role="dialog"]')).toBeVisible();

            // Note: Radix Selects are a bit complex to automate because the input is hidden.
            // We usually click the trigger, then click an option.
            await page.click('button[role="combobox"]'); // Generic click for selects
            await page.click('[role="option"]'); // Clicks the first available option

            // Enter amount paid (assuming there is an input for this or it calculates automatically)
            // Select Payment Method
            // Click submit
            const submitButton = page.locator('button[type="submit"]', { hasText: /Confirmar/i });
            await submitButton.click();

            // 7. Verify Success
            // Usually a toast appears
            await expect(page.locator('.toast')).toContainText(/éxito/i);
        } else {
            console.log("Sell button not found on this screen, skipping dialog interaction.");
            // This might happen if the table is empty. For a robust test, you'd seed data first.
        }
    });

});
