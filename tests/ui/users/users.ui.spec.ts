import { test, expect } from '@playwright/test';

test.describe('UI - Users', () => {
  test('UI: User list page displays the QA lab heading @smoke @regression', async ({ page }) => {
    await page.goto('/qa-lab');

    await expect(page.getByText('Spot the bugs challenge').nth(0)).toBeVisible();
  });
});
