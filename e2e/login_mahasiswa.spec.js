import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000'; // atau 'http://localhost:8000'

test('Mahasiswa berhasil login ke halaman utama', async ({ page }) => {
  
  await page.goto(`${BASE_URL}/login`);

  await page.fill('input[name="username"]', '2341720209');
  await page.fill('input[name="password"]', 'password');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(BASE_URL);
});
