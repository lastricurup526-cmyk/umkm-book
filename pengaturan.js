
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

  // =====================================
  // AUTENTIKASI
  // =====================================

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    window.location.replace("index.html");
    return;
  }

  const user = data.session.user;

  // =====================================
  // NAVIGASI SIDEBAR
  // =====================================

  const sidebar = document.querySelector(".sidebar");
  const menuButton = document.getElementById("mobileMenuButton");
  const closeButton = document.getElementById("mobileMenuClose");

  function openMenu() {
    sidebar?.classList.add("mobile-open");
    menuButton?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    sidebar?.classList.remove("mobile-open");
    menuButton?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuButton?.addEventListener("click", openMenu);
  closeButton?.addEventListener("click", closeMenu);

  sidebar?.querySelectorAll(".menu-link").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 650) closeMenu();
  });

  // =====================================
  // LOGOUT
  // =====================================

  document.getElementById("logoutButton")?.addEventListener("click", async event => {
    event.preventDefault();

    if (!confirm("Apakah Anda yakin ingin keluar dari akun?")) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Gagal keluar: " + error.message);
      return;
    }

    window.location.replace("index.html");
  });

  // =====================================
  // IDENTITAS USAHA DI SIDEBAR
  // =====================================

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("business_name, photo_url")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    console.error("Gagal memuat identitas usaha:", businessError);
  } else if (business) {
    const name = document.getElementById("businessName");
    const avatar = document.getElementById("businessAvatar");

    if (name && business.business_name) {
      name.textContent = business.business_name;
    }

    if (avatar && business.photo_url) {
      const img = document.createElement("img");
      img.src = business.photo_url;
      img.alt = "Foto usaha";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.borderRadius = "inherit";

      img.onerror = () => {
        img.remove();
        avatar.textContent = "U";
      };

      avatar.textContent = "";
      avatar.appendChild(img);
    }
  }

  // =====================================
  // PANEL PENGATURAN
  // =====================================

  const settingsCards = document.querySelectorAll(".settings-action");

  settingsCards.forEach(button => {
    button.addEventListener("click", () => {
      const setting = button.dataset.setting;

      openSettingsPanel(setting);
    });
  });

  function openSettingsPanel(setting) {
    const titles = {
      account: "Pengaturan Akun",
      data: "Pengelolaan Data",
      security: "Keamanan Akun",
      about: "Tentang UMKM BOOK"
    };

    const contents = {
      account: `
        <div class="settings-panel-section">
          <h3>Informasi Akun</h3>
          <p class="settings-description">
            Alamat email yang digunakan untuk masuk ke UMKM BOOK.
          </p>

          <label>Email Akun</label>
          <input type="email" value="${escapeHTML(user.email || "")}" readonly>

          <div class="settings-divider"></div>

          <h3>Ganti Kata Sandi</h3>
          <p class="settings-description">
            Gunakan kata sandi baru yang kuat dan tidak mudah ditebak.
          </p>

          <form id="passwordForm">
            <label>Kata Sandi Baru</label>
            <input
              type="password"
              id="newPassword"
              minlength="8"
              required
              placeholder="Minimal 8 karakter"
            >

            <label>Konfirmasi Kata Sandi</label>
            <input
              type="password"
              id="confirmPassword"
              minlength="8"
              required
              placeholder="Ulangi kata sandi baru"
            >

            <button type="submit" class="settings-primary-button">
              Simpan Kata Sandi
            </button>
          </form>
          <p id="passwordMessage" class="settings-feedback"></p>
        </div>
      `,

      
      data: `
        <div class="settings-panel-section">
          <h3>Pengelolaan Data</h3>
          <p class="settings-description">
            Data usaha disimpan pada database akun Anda.
          </p>

          <div class="settings-info-row">
            <span>Status penyimpanan</span>
            <strong>Terhubung</strong>
          </div>

          <div class="settings-info-row">
            <span>Database</span>
            <strong>Supabase</strong>
          </div>

          <p class="settings-description">
            Fitur cadangan data akan dikembangkan setelah
            seluruh tabel aplikasi diverifikasi.
          </p>
        </div>
      `,

      security: `
        <div class="settings-panel-section">
          <h3>Keamanan Akun</h3>

          <div class="settings-info-row">
            <span>Status akun</span>
            <strong>Login aktif</strong>
          </div>

          <div class="settings-info-row">
            <span>Metode autentikasi</span>
            <strong>Supabase Auth</strong>
          </div>

          <div class="settings-info-row">
            <span>Email terverifikasi</span>
            <strong>${user.email_confirmed_at ? "Ya" : "Belum"}</strong>
          </div>

          <p class="settings-description">
            Jangan membagikan kata sandi atau informasi akses
            akun kepada orang lain.
          </p>
        </div>
      `,

      about: `
        <div class="settings-panel-section about-panel">
          <img
            src="public/assets/logo.jpeg"
            alt="Logo UMKM BOOK"
            class="about-logo-image"
          >
          <h3>UMKM BOOK</h3>
          <p>Business Management</p>

          <div class="settings-divider"></div>

          <div class="settings-info-row">
            <span>Nama aplikasi</span>
            <strong>UMKM BOOK</strong>
          </div>

          <div class="settings-info-row">
            <span>Versi</span>
            <strong>1.0</strong>
          </div>

          <div class="settings-info-row">
            <span>Platform</span>
            <strong>Web Application</strong>
          </div>

          <p class="settings-description">
            Aplikasi pencatatan dan pengelolaan keuangan
            untuk membantu pelaku UMKM mengelola usahanya.
          </p>
        </div>
      `
    };

    let panel = document.getElementById("settingsPanel");

    if (!panel) {
      panel = document.createElement("section");
      panel.id = "settingsPanel";
      panel.className = "settings-panel";
      document.querySelector(".settings-grid").after(panel);
    }

    panel.innerHTML = `
      <div class="settings-panel-header">
        <div>
          <span class="settings-category">PENGATURAN</span>
          <h2>${titles[setting]}</h2>
        </div>

        <button
          type="button"
          class="settings-close-button"
          id="closeSettingsPanel"
          aria-label="Tutup pengaturan"
        >&times;</button>
      </div>

      ${contents[setting] || ""}
    `;

    // Sembunyikan daftar menu ketika salah satu pengaturan dibuka
      document.querySelector(".settings-grid").style.display = "none";

      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });

      document.getElementById("closeSettingsPanel")
      ?.addEventListener("click", () => {
        panel.hidden = true;

        // Tampilkan kembali daftar menu pengaturan
        document.querySelector(".settings-grid").style.display = "";
      });

     if (setting === "account") {
      setupPasswordForm();
    }

  } // Penutup fungsi openSettingsPanel
  // =====================================
  // AMANKAN TEKS HTML
  // =====================================

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  // =====================================
  // GANTI KATA SANDI
  // =====================================

  function setupPasswordForm() {
    const form = document.getElementById("passwordForm");
    const message = document.getElementById("passwordMessage");

    form?.addEventListener("submit", async event => {
      event.preventDefault();

      const password = document.getElementById("newPassword").value;
      const confirmation = document.getElementById("confirmPassword").value;

      if (password.length < 8) {
        message.textContent = "Kata sandi minimal 8 karakter.";
        message.className = "settings-feedback error";
        return;
      }

      if (password !== confirmation) {
        message.textContent = "Konfirmasi kata sandi tidak cocok.";
        message.className = "settings-feedback error";
        return;
      }

      const submitButton = form.querySelector("button");
      submitButton.disabled = true;
      submitButton.textContent = "Menyimpan...";

      const { error } = await supabase.auth.updateUser({
        password
      });

      submitButton.disabled = false;
      submitButton.textContent = "Simpan Kata Sandi";

      if (error) {
        message.textContent = "Gagal mengubah kata sandi: " + error.message;
        message.className = "settings-feedback error";
        return;
      }

      form.reset();
      message.textContent = "Kata sandi berhasil diperbarui.";
      message.className = "settings-feedback success";
    });
  }

  console.log("Pengaturan UMKM BOOK berhasil diakses.");

});
