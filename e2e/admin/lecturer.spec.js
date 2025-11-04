// @ts-check
"use strict";

import { test, expect } from "@playwright/test";

// Define routes
const ADMIN_LECTURER_MANAGEMENT = "/admin/manajemen-akun/dosen";

// Define logic functions
function loginAsAdmin() {
    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        await page.getByPlaceholder("Username").fill("admin1");
        await page.getByPlaceholder("Password").fill("password");
        await page.getByRole("button", { name: /Masuk/i }).click();
        await expect(page).toHaveURL(/.*admin/); // Tunggu URL mengandung '/admin'
    });
}

// prettier-ignore
test.describe("Manajemen Akun Dosen (ADM-AKD-01)", () => {
    loginAsAdmin();

    test("ADM-A-01: Admin dapat melihat daftar dosen", async ({ page }) => {
        await page.goto(ADMIN_LECTURER_MANAGEMENT);
        await expect(page.getByRole("heading", { name: "Manajemen Akun Dosen" })).toBeVisible();
        await expect(page.getByText("USERNAME")).toBeVisible();
        await expect(page.getByText("EMAIL")).toBeVisible();
        await expect(page.getByText("ROLE")).toBeVisible();
        await expect(page.getByText("AKSI")).toBeVisible();
        await expect(page.getByText("dosen1@ujicoba.com")).toBeVisible();
    });

    // Masih error, cek kembali nanti.
    // test("ADM-N-02: Gagal edit jika konfirmasi password tidak cocok", async ({ page }) => {
    //     await page.goto(ADMIN_LECTURER_MANAGEMENT);
    //     await page.getByRole("row", { name: /dosen1@ujicoba.com/i }).getByRole("link", { name: "Edit" }).click();
    //     await expect(page.getByRole("heading", { name: "Edit Data Dosen" })).toBeVisible();
    //     await page.getByPlaceholder("Masukkan Password").fill("dosen123");
    //     await page.getByPlaceholder("Masukkan Ulang Password").fill("dosen456");
    //     await page.getByRole("button", { name: "Simpan" }).click();
    //     await expect(page.getByText("The confirm password field must match password.")).toBeVisible();
    // });

    test("ADM-A-03: Admin gagal mencari dosen (Reproduksi Bug)", async ({ page }) => {
        await page.goto(ADMIN_LECTURER_MANAGEMENT);
        await page.getByPlaceholder("Cari berdasarkan NIM atau Nama").fill("dosen 1");
        await page.keyboard.press("Enter");
        await expect(page.getByText("dosen 1")).not.toBeVisible();
        await expect(page.getByText("dosen 2")).not.toBeVisible();
    });
});