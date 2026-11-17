import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {
  // CEK LOGIN
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    window.location.replace("index.html");
    return;
  }

  const user = sessionData.session.user;

  // ELEMEN HTML
  const photoInput = document.getElementById("businessPhotoInput");
  const photoPreview = document.getElementById("businessPhoto");
  const photoPlaceholder = document.getElementById("photoPlaceholder");
  const saveButton = document.getElementById("saveBusinessProfile");
  const message = document.getElementById("profileMessage");

  const nameInput = document.getElementById("businessNameInput");
  const ownerNameInput = document.getElementById("ownerNameInput");
  const typeInput = document.getElementById("businessType");
  const descriptionInput = document.getElementById("businessDescription");
  const addressInput = document.getElementById("businessAddress");
  const phoneInput = document.getElementById("businessPhone");

  let selectedPhoto = null;
  let savedPhotoUrl = null;

  // TAMPILKAN FOTO
  function showPhoto(url) {
    if (url) {
      photoPreview.src = url;
      photoPreview.style.display = "block";
      photoPlaceholder.style.display = "none";
    } else {
      photoPreview.removeAttribute("src");
      photoPreview.style.display = "none";
      photoPlaceholder.style.display = "block";
    }
  }

  // AMBIL DATA PROFIL USAHA
  async function loadBusinessProfile() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Gagal mengambil profil:", error);
      message.textContent = "Gagal memuat profil usaha.";
      return;
    }

    if (!data) return;

    nameInput.value = data.business_name || "";
    ownerNameInput.value = data.owner_name || "";
    typeInput.value = data.business_type || "";
    descriptionInput.value = data.description || "";
    addressInput.value = data.address || "";
    phoneInput.value = data.phone || "";

    savedPhotoUrl = data.photo_url || null;
    showPhoto(savedPhotoUrl);
  }

  // PILIH FOTO
  photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar.");
      photoInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      photoInput.value = "";
      return;
    }

    selectedPhoto = file;

    const reader = new FileReader();

    reader.onload = (event) => {
      showPhoto(event.target.result);
    };

    reader.readAsDataURL(file);
  });

  // SIMPAN PROFIL USAHA
  saveButton.addEventListener("click", async () => {
    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";
    message.textContent = "";

    try {
      // CARI DATA USAHA MILIK AKUN
      const { data: existing, error: searchError } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (searchError) throw searchError;

      let photoUrl = savedPhotoUrl;

      // UPLOAD FOTO JIKA ADA FOTO BARU
      if (selectedPhoto) {
        const safeName = selectedPhoto.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const filePath =
          `${user.id}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("business-photos")
          .upload(filePath, selectedPhoto);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("business-photos")
          .getPublicUrl(filePath);

        photoUrl = publicData.publicUrl;
      }

      // DATA YANG AKAN DISIMPAN
      const businessData = {
      owner_id: user.id,
      owner_name: ownerNameInput.value.trim(),
      business_name: nameInput.value.trim(),
      business_type: typeInput.value.trim(),
      description: descriptionInput.value.trim(),
      address: addressInput.value.trim(),
      phone: phoneInput.value.trim(),
      photo_url: photoUrl
    };
      // UPDATE ATAU INSERT
      let saveResult;

      if (existing) {
        saveResult = await supabase
          .from("businesses")
          .update(businessData)
          .eq("id", existing.id);
      } else {
        saveResult = await supabase
          .from("businesses")
          .insert(businessData);
      }

      if (saveResult.error) throw saveResult.error;

      savedPhotoUrl = photoUrl;
      selectedPhoto = null;
      photoInput.value = "";

      message.textContent = "Profil usaha berhasil disimpan!";
      message.style.color = "#087653";

    } catch (error) {
      console.error("Gagal menyimpan profil:", error);

      message.textContent =
        "Gagal menyimpan: " + error.message;

      message.style.color = "#dc2626";

    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Simpan Profil";
    }
  });

  // MUAT PROFIL SAAT HALAMAN DIBUKA
  await loadBusinessProfile();

  console.log("Profil Usaha terhubung dengan Supabase.");
});
