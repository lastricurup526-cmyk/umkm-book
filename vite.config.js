
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/umkm-book/",

  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, "index.html"),
        welcome: resolve(import.meta.dirname, "welcome.html"),
        register: resolve(import.meta.dirname, "register.html"),
        dashboard: resolve(import.meta.dirname, "dashboard.html"),
        transaksi: resolve(import.meta.dirname, "transaksi.html"),
        "stok-barang": resolve(import.meta.dirname, "stok-barang.html"),
        laporan: resolve(import.meta.dirname, "laporan.html"),
        kalkulator: resolve(import.meta.dirname, "kalkulator.html"),
        pengaturan: resolve(import.meta.dirname, "pengaturan.html"),
        pengetahuan: resolve(import.meta.dirname, "pengetahuan.html"),
        "profil-usaha": resolve(import.meta.dirname, "profil-usaha.html"),
        modal: resolve(import.meta.dirname, "modal.html")
      }
    }
  }
});
