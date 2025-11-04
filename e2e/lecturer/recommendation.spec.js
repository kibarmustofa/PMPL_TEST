// @ts-check
import { test, expect } from '@playwright/test';

// Ganti dengan URL aplikasi Anda yang sebenarnya
const BASE_URL = 'http://127.0.0.1:8000'; 

// Data Dummy Dosen untuk Tes (Harus valid di database Anda)
const DOSEN_USERNAME = 'dosen_test_nim'; // Contoh: Ganti dengan NIM/Username Dosen yang valid
const DOSEN_PASSWORD = 'password';      // Ganti dengan password Dosen yang valid
const MAHASISWA_NIM_TEST = '1234567890'; // NIM Mahasiswa bimbingan yang datanya ada di tabel HasilRekomendasi (Ranking 1)

// Blok tes untuk fitur Rekomendasi Magang Dosen
test.describe('Fitur Rekomendasi Magang Dosen', () => {

    // Helper function untuk melakukan login Dosen
    test.beforeEach(async ({ page }) => {
        // --- 1. LOGIN SEBAGAI DOSEN ---
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="username"]', DOSEN_USERNAME);
        await page.fill('input[name="password"]', DOSEN_PASSWORD);
        
        await Promise.all([
            page.waitForURL(BASE_URL),
            page.click('button[type="submit"]'),
        ]);

        await expect(page).toHaveURL(BASE_URL); // Pastikan berhasil login ke homepage/dashboard
    });

    // TEST CASE 1: Memverifikasi tampilan halaman rekomendasi
    test('Dosen dapat melihat daftar rekomendasi mahasiswa bimbingan (Ranking 1)', async ({ page }) => {
        // --- 2. NAVIGASI KE HALAMAN REKOMENDASI ---
        // Asumsi: Halaman rekomendasi magang ada di '/dosen/rekomendasi'
        await page.goto(`${BASE_URL}/dosen/rekomendasi`);

        // --- 3. VERIFIKASI TAMPILAN HALAMAN ---
        
        // Pastikan ada judul atau elemen unik di halaman tersebut
        await expect(page.getByRole('heading', { name: 'Daftar Hasil Rekomendasi' })).toBeVisible();

        // Verifikasi bahwa ada data mahasiswa yang ditampilkan dalam tabel/list
        // Asumsi: data ditampilkan dalam baris tabel
        const tableRow = page.locator('table tbody tr');
        await expect(tableRow.first()).toBeVisible();

        // Verifikasi bahwa data mahasiswa bimbingan uji coba (TEST) ada
        await expect(page.getByText(MAHASISWA_NIM_TEST)).toBeVisible();

        // Verifikasi kolom status 'rekomendasi_dosen' default
        // Asumsi: ada kolom 'Status' di tabel
        await expect(page.locator('table tbody tr').filter({ hasText: MAHASISWA_NIM_TEST }).getByText('Direkomendasikan')).toBeVisible(); 
    });

    // TEST CASE 2: Menguji fitur rekomendasi mahasiswa (mengubah status rekomendasi_dosen dari 0 ke 1)
    test('Dosen berhasil memberikan rekomendasi resmi pada mahasiswa', async ({ page }) => {
        // --- 1. NAVIGASI KE HALAMAN REKOMENDASI ---
        await page.goto(`${BASE_URL}/dosen/rekomendasi`);

        // --- 2. TEMUKAN TOMBOL REKOMENDASI UNTUK MAHASISWA UJI COBA ---
        
        // Temukan baris tabel yang berisi NIM mahasiswa uji coba
        const mahasiswaRow = page.locator('table tbody tr').filter({ hasText: MAHASISWA_NIM_TEST });

        // Asumsi: Tombol 'Rekomendasikan' atau 'Setujui' ada di baris tersebut
        // Selector yang digunakan bisa berupa 'button:has-text("Rekomendasikan")'
        const recommendButton = mahasiswaRow.getByRole('button', { name: /Rekomendasikan|Setujui/i });

        // Jika tombol sudah tidak visible, berarti sudah direkomendasikan sebelumnya.
        // Untuk tujuan testing, kita asumsikan status awal adalah 0 agar tombol terlihat.
        if (await recommendButton.isVisible()) {
            
            // --- 3. KLIK TOMBOL REKOMENDASI ---
            // Karena ini adalah aksi AJAX (Controller recommendStudent), kita harus menunggu respons API dan pembaruan UI.
            
            // Catatan: Jika tombol memicu konfirmasi dialog (seperti SweetAlert), Anda perlu menangani dialog tersebut.
            /* page.on('dialog', async (dialog) => {
                expect(dialog.message()).toContain('Apakah Anda yakin?');
                await dialog.accept(); 
            });
            */

            await recommendButton.click();

            // --- 4. VERIFIKASI PEMBARUAN (API & UI) ---

            // Tunggu pesan sukses (asumsi pesan sukses muncul, misalnya menggunakan SweetAlert atau Toast)
            await expect(page.getByText('Mahasiswa berhasil direkomendasikan')).toBeVisible({ timeout: 10000 });
            
            // Tunggu sampai baris diperbarui di UI: Tombol 'Rekomendasikan' harus hilang/berubah, dan status harus berubah (jika ditampilkan)
            // Misalnya, tombol 'Rekomendasikan' hilang
            await expect(recommendButton).not.toBeVisible();
            
            // Atau, status berubah menjadi 'Diterima Dosen' atau sejenisnya
            // await expect(mahasiswaRow.getByText('Diterima Dosen')).toBeVisible();

        } else {
            console.log(`Mahasiswa ${MAHASISWA_NIM_TEST} sudah direkomendasikan. Melewati langkah klik tombol.`);
        }
    });

    // TEST CASE 3: Menguji navigasi ke detail profil mahasiswa
    test('Dosen dapat melihat detail profil mahasiswa bimbingan', async ({ page }) => {
        // --- 1. NAVIGASI KE HALAMAN REKOMENDASI ---
        await page.goto(`${BASE_URL}/dosen/rekomendasi`);

        // --- 2. KLIK TOMBOL/LINK DETAIL ---
        // Asumsi: Ada tombol atau link 'Lihat Profil' di baris mahasiswa
        
        const detailLink = page.locator('table tbody tr').filter({ hasText: MAHASISWA_NIM_TEST }).getByRole('link', { name: /Lihat Profil|Detail/i });
        
        // Tunggu navigasi ke halaman detail
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            detailLink.click(),
        ]);

        // --- 3. VERIFIKASI HALAMAN DETAIL ---
        
        // Pastikan URL mengarah ke halaman detail profil
        await expect(page).toHaveURL(new RegExp(`.*dosen/profile/${MAHASISWA_NIM_TEST}`));
        
        // Pastikan nama atau NIM mahasiswa yang dicari terlihat di halaman detail
        await expect(page.getByText(`Detail Profil Mahasiswa ${MAHASISWA_NIM_TEST}`)).toBeVisible();
        // Atau
        // await expect(page.getByRole('heading', { name: /Detail Profil/i })).toBeVisible();

    });

});
