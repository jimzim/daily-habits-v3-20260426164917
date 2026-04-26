import { test, expect } from '@playwright/test';

test('hover-delete with two-tap confirm', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('add-habit-fab').click();
  await page.getByTestId('add-habit-input').fill('Stretch');
  await page.getByTestId('add-habit-save').click();

  const row = page.getByTestId('habit-row-0');
  await expect(row).toBeVisible();
  await row.hover();

  const deleteBtn = page.getByTestId('habit-row-0-delete');
  await expect(deleteBtn).toBeVisible();

  // First click → confirming state, NOT yet deleted
  await deleteBtn.click({ force: true });
  await expect(row).toBeVisible();

  // Second click → actually delete
  await deleteBtn.click({ force: true });
  await expect(page.getByText('Stretch')).toBeHidden();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});
