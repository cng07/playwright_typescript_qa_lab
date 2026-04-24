import { test, expect } from '@playwright/test';

test('Users appear in UI', async ({ page }) => {
  await page.goto('/qa-lab');

  await expect(page.getByText('Spot the bugs challenge').nth(0)).toBeVisible();
});