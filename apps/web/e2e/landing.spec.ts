import { test, expect } from '@playwright/test';

test('has title and start building CTA', async ({ page }) => {
  await page.goto('/');

  // Check the title roughly matches CraftSite AI
  await expect(page).toHaveTitle(/CraftSite AI/);

  // Check that there is a CTA to start building
  const startBuildingLink = page.getByRole('link', { name: /start building/i });
  await expect(startBuildingLink.first()).toBeVisible();
});
