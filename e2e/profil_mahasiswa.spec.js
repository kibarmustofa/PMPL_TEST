import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:8000'; // atau 'http://localhost:8000'

// --- Tes Login (dari kode Anda) ---
test('Mahasiswa berhasil login ke halaman utama', async ({ page }) => {

 await page.goto(`${BASE_URL}/login`);

 await page.fill('input[name="username"]', '2341720209');
 await page.fill('input[name="password"]', 'password');

 await page.click('button[type="submit"]');

 await expect(page).toHaveURL(BASE_URL);
}); 


test('Mahasiswa berhasil mengedit profil', async ({ page }) => {
  
  
// LANGKAH 1: LOGIN

await page.goto(`${BASE_URL}/login`);
await page.fill('input[name="username"]', '2341720209');
await page.fill('input[name="password"]', 'password');
await page.click('button[type="submit"]');

// Tunggu hingga login selesai dan kita berada di halaman utama
await expect(page).toHaveURL(BASE_URL);


// LANGKAH 2: NAVIGASI KE HALAMAN EDIT PROFIL

await page.goto(`${BASE_URL}/profile/edit/2341720209`);

// LANGKAH 3: VERIFIKASI HALAMAN
// Pastikan kita ada di halaman yang benar dengan mengecek judul

// 'getByRole' adalah selector Playwright yang kuat
await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();


// LANGKAH 4: ISI FORM DENGAN DATA BARU

  
  // Kita buat data unik agar bisa diverifikasi nanti
  const newDeskripsi = `Deskripsi baru diupdate oleh Playwright pada ${Date.now()}`;
  const newLokasi = 'Malang, Indonesia';
  const newNomorTelepon = '081234567890'; // Mengganti data 'abcds' yang tidak valid
  
  // Menggunakan 'getByLabel' adalah cara terbaik untuk mengisi form.
  // Ini akan mencari <label> dan mengisi <input> yang terhubung dengannya.
  await page.getByLabel('Deskripsi').fill(newDeskripsi);
  await page.getByLabel('Lokasi').fill(newLokasi);
  await page.getByLabel('Nomor Telepon').fill(newNomorTelepon);
  
  // Catatan: Field "Nama Lengkap" kedua yang berisi email mungkin perlu
  // selector khusus jika labelnya ambigu. (Lihat catatan di bawah)

  
// LANGKAH 5: SUBMIT FORM

await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle' }),
  page.getByRole('button', { name: 'Simpan' }).click(),
]);


// LANGKAH 6: VERIFIKASI PERUBAHAN


// Tunggu elemen #aboutDescription muncul
const aboutDescription = page.locator('#aboutDescription');
await expect(aboutDescription).toBeVisible();
await expect(aboutDescription).toHaveText(newDeskripsi);

// Pastikan tidak lagi di halaman edit
await expect(page).not.toHaveURL(`${BASE_URL}/profile/edit/2341720209`);
});