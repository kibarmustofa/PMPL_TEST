// @ts-check
import { test, expect } from '@playwright/test';

// Ganti dengan URL aplikasi Anda yang sebenarnya
const BASE_URL = 'http://127.0.0.1:8000'; 

// Data Dummy Dosen untuk Tes (Harus valid di database Anda)
const DOSEN_USERNAME = 'dosen_test_nim'; // Ganti dengan NIM/Username Dosen yang valid
const DOSEN_PASSWORD = 'password';      // Ganti dengan password Dosen yang valid
const MAHASISWA_NIM_TEST = '2141720209'; // NIM mahasiswa bimbingan yang PASTI ada di daftar
const MAHASISWA_NAME_TEST = 'Budi Santoso'; // Nama mahasiswa tersebut

// Blok tes untuk fitur Daftar Mahasiswa Bimbingan Dosen
test.describe('Fitur Daftar Mahasiswa Bimbingan Dosen', () => {

    // Helper function untuk melakukan login Dosen sebelum setiap tes
    test.beforeEach(async ({ page }) => {
        // --- 1. LOGIN SEBAGAI DOSEN ---
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="username"]', DOSEN_USERNAME);
        await page.fill('input[name="password"]', DOSEN_PASSWORD);
        
        await Promise.all([
            page.waitForURL(BASE_URL),
            page.click('button[type="submit"]'),
        ]);

        await expect(page).toHaveURL(BASE_URL); // Pastikan berhasil login
    });

    // TEST CASE 1: Memverifikasi tampilan halaman daftar mahasiswa bimbingan
    test('Dosen dapat melihat daftar lengkap mahasiswa bimbingan', async ({ page }) => {
        // --- 2. NAVIGASI KE HALAMAN DAFTAR MAHASISWA ---
        // Asumsi: Halaman daftar mahasiswa bimbingan ada di '/dosen/mahasiswa/profile'
        await page.goto(`${BASE_URL}/dosen/mahasiswa/profile`);

        // --- 3. VERIFIKASI TAMPILAN HALAMAN ---
        
        // Pastikan ada judul atau elemen unik di halaman tersebut
        await expect(page.getByRole('heading', { name: 'Daftar Mahasiswa Bimbingan' })).toBeVisible();

        // Verifikasi bahwa ada setidaknya satu baris data di tabel/list
        const tableRow = page.locator('table tbody tr');
        await expect(tableRow.first()).toBeVisible();
    });

    // TEST CASE 2: Memverifikasi keberadaan mahasiswa spesifik di daftar
    test('Mahasiswa bimbingan yang spesifik harus muncul di daftar', async ({ page }) => {
        // --- 1. NAVIGASI KE HALAMAN DAFTAR MAHASISWA ---
        await page.goto(`${BASE_URL}/dosen/mahasiswa/profile`);
        
        // --- 2. VERIFIKASI KEBERADAAN MAHASISWA UJI COBA ---
        
        // Cari baris tabel yang mengandung NIM mahasiswa uji coba
        const mahasiswaRow = page.locator('table tbody tr').filter({ hasText: MAHASISWA_NIM_TEST });

        // Verifikasi bahwa baris tersebut terlihat
        await expect(mahasiswaRow).toBeVisible();

        // Verifikasi bahwa nama mahasiswa tersebut juga ada di baris yang sama
        await expect(mahasiswaRow.getByText(MAHASISWA_NAME_TEST)).toBeVisible();
    });

    // TEST CASE 3: Menguji navigasi ke detail profil dari daftar
    test('Dosen dapat menavigasi ke detail profil mahasiswa dari daftar', async ({ page }) => {
        // --- 1. NAVIGASI KE HALAMAN DAFTAR MAHASISWA ---
        await page.goto(`${BASE_URL}/dosen/mahasiswa/profile`);

        // --- 2. KLIK TOMBOL/LINK DETAIL/PROFILE ---
        
        // Temukan baris mahasiswa uji coba
        const mahasiswaRow = page.locator('table tbody tr').filter({ hasText: MAHASISWA_NIM_TEST });
        
        // Asumsi: Ada tombol/link yang mengarah ke detail profil (mungkin menggunakan NIM sebagai ID)
        const profileLink = mahasiswaRow.getByRole('link', { name: /Lihat Profil|Detail/i });
        
        // Tunggu navigasi ke halaman detail
        await Promise.all([
            page.waitForURL(new RegExp(`.*profile/${MAHASISWA_NIM_TEST}`)), // Harapkan URL berakhir dengan NIM
            profileLink.click(),
        ]);

        // --- 3. VERIFIKASI HALAMAN DETAIL ---
        
        // Pastikan URL sudah benar
        await expect(page).toHaveURL(new RegExp(`.*profile/${MAHASISWA_NIM_TEST}`));
        
        // Pastikan nama mahasiswa uji coba terlihat di halaman detail profil
        await expect(page.getByText(MAHASISWA_NAME_TEST)).toBeVisible();
    });
});
