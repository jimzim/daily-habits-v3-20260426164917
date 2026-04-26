import { test, expect } from '@playwright/test';

test('add a habit via the modal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('header-date')).toBeVisible();
  await expect(page.getByTestId('empty-state')).toBeVisible();

  await page.getByTestId('add-habit-fab').click();
  const input = page.getByTestId('add-habit-input');
  await expect(input).toBeVisible();
  await input.fill('Drink water');
  await page.getByTestId('add-habit-save').click();

  await expect(page.getByTestId('habit-row-0')).toBeVisible();
  await expect(page.getByText('Drink water')).toBeVisible();
});

test('save button is disabled with empty input', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('add-habit-fab').click();
  const save = page.getByTestId('add-habit-save');
  await expect(save).toBeVisible();
  await expect(save).toBeDisabled();
});
