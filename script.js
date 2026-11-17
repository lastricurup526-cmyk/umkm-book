
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("UMKM BOOK berhasil dimuat!");

  // Fungsi Lihat dan Sembunyikan Kata Sandi
  function setupPasswordToggle(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(buttonId);

    if (!passwordInput || !toggleButton) return;

    toggleButton.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";

      passwordInput.type = isPassword ? "text" : "password";
      toggleButton.textContent = isPassword ? "Sembunyikan" : "Lihat";
    });
  }

  setupPasswordToggle("password", "togglePassword");
  setupPasswordToggle("registerPassword", "toggleRegisterPassword");

  // Validasi dan pendaftaran akun
  const registerForm = document.getElementById("registerForm");
  const registerPassword = document.getElementById("registerPassword");
  const confirmPassword = document.getElementById("confirmPassword");

  if (registerForm && registerPassword && confirmPassword) {
    function validatePassword() {
      if (confirmPassword.value !== registerPassword.value) {
        confirmPassword.setCustomValidity(
          "Konfirmasi kata sandi tidak sama."
        );
      } else {
        confirmPassword.setCustomValidity("");
      }
    }

    registerPassword.addEventListener("input", validatePassword);
    confirmPassword.addEventListener("input", validatePassword);

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      validatePassword();

      if (!registerForm.reportValidity()) return;

      const fullName = document.getElementById("ownerName").value.trim();
      const businessName = document.getElementById("businessName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = registerPassword.value;

      const submitButton = registerForm.querySelector(
        'button[type="submit"]'
      );

      submitButton.disabled = true;
      submitButton.textContent = "Memproses...";

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "http://127.0.0.1:5500/index.html",
            data: {
              full_name: fullName,
              business_name: businessName
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          alert(
            "Pendaftaran berhasil dikirim! Silakan periksa email jika verifikasi email diminta."
          );

          registerForm.reset();
        }
      } catch (error) {
        console.error("Pendaftaran gagal:", error);
        alert("Pendaftaran gagal: " + error.message);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Daftar Sekarang <span>→</span>';
      }
      
    });
  }
  
  // LOGIN UMKM BOOK
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      const submitButton = loginForm.querySelector(
        'button[type="submit"]'
      );

      submitButton.disabled = true;
      submitButton.textContent = "Memproses...";

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          window.location.href = "dashboard.html";
        }
      } catch (error) {
        console.error("Login gagal:", error);
        alert("Login gagal: " + error.message);
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Masuk ke Akun <span>→</span>';
      }
    });
  }
});
