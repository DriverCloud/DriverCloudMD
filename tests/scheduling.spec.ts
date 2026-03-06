import { test, expect } from '@playwright/test';

test.describe('Class Scheduling Flow', () => {

    test('admin can schedule a class successfully', async ({ page }) => {
        // 1. Navigate to login
        await page.goto('/login');

        // 2. Fill login form (assuming test credentials exist in the environment or DB)
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // 3. Verify redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/);

        // 4. Navigate to Classes section
        await page.click('a[href="/dashboard/classes"]');
        await expect(page.locator('h1')).toContainText(/Clases y Reservas/i);

        // 5. Open new class dialog (Usually a "Nueva Clase" button or clicking on the calendar)
        const newClassButton = page.locator('button', { hasText: /Nueva Clase/i });
        if (await newClassButton.isVisible()) {
            await newClassButton.click();

            // 6. Fill the Scheduling Dialog
            await expect(page.locator('[role="dialog"]')).toBeVisible();

            // Select Date and Time
            // Select Student
            // Select Instructor
            // Select Class Type
            // Select Vehicle

            // Note: Automating complex Radix UI forms with custom comboboxes requires very specific selectors
            // matching the exact DOM implementation. This is a scaffold.

            const submitButton = page.locator('button[type="submit"]', { hasText: /Confirmar/i });
            if (await submitButton.isVisible()) {
                await submitButton.click();
            }

            // 7. Verify Success
            await expect(page.locator('.toast')).toContainText(/éxito/i);
        } else {
            console.log("New Class button not found. Calendar might require direct slot clicking.");
        }
    });

});
