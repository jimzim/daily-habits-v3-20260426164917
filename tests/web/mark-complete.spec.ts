import { test, expect } from '@playwright/test';

test('mark a habit complete', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('add-habit-fab').click();
  await page.getByTestId('add-habit-input').fill('Read a book');
  await page.getByTestId('add-habit-save').click();

  const row = page.getByTestId('habit-row-0');
  await expect(row).toBeVisible();
  await row.click();

  const todayCell = page.getByTestId('habit-row-0-today-cell');
  await expect(todayCell).toBeVisible();
  await expect(todayCell).toHaveAttribute('aria-selected', 'true');
});
