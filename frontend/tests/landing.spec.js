import { test, expect } from '@playwright/test';

test('public landing page provides staff and patient entry points', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('MediCure', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Staff Login' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Patient Portal' })).toBeVisible();
});
