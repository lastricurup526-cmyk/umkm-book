import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

  // CEK LOGIN
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    window.location.replace("index.html");
    return;
  }

  const user = data.session.user;

  // ELEMEN HTML
  const modalForm = document.getElementById("modalForm");
  const modalDate = document.getElementById("modalDate");
  const modalSource = document.getElementById("modalSource");
  const modalAmount = document.getElementById("modalAmount");
  const modalDescription = document.getElementById("modalDescription");
  const saveButton = document.getElementById("saveModal");
  const cancelEditButton = document.getElementById("cancelEditModal");
  let editingModalId = null;
  const modalMessage = document.getElementById("modalMessage");
  const totalModal = document.getElementById("totalModal");
  const modalHistory = document.getElementById("modalHistory");
  const resetModalFilter = document.getElementById("resetModalFilter");
  const detailOverlay = document.getElementById("modalDetailOverlay");
  const detailContent = document.getElementById("modalDetailContent");
  const closeDetailButton = document.getElementById("closeModalDetail");
  
  // TANGGAL HARI INI
  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  modalDate.value = localDate;
    
  // FORMAT RUPIAH
  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // MUAT RIWAYAT MODAL
  async function loadModalEntries() {

    const { data: entries, error } = await supabase
      .from("modal_entries")
      .select("*")
      .eq("owner_id", user.id)
      .order("modal_date", { ascending: false });

    if (error) {
      console.error("Gagal memuat riwayat modal:", error);
      modalHistory.textContent = "Gagal memuat riwayat modal.";
      return;
    }
// PENCARIAN BERDASARKAN SUMBER MODAL
const keyword = searchModal.value.trim().toLowerCase();

const filteredEntries = entries.filter(item => {
  return (item.source || "").toLowerCase().includes(keyword);
});

// HITUNG TOTAL SELURUH MODAL
const total = entries.reduce(
  (sum, item) => sum + Number(item.amount),
  0
);

    totalModal.textContent = formatRupiah(total);

    // KOSONGKAN RIWAYAT LAMA
    modalHistory.replaceChildren();

if (filteredEntries.length === 0) {
  const emptyMessage = document.createElement("p");

  emptyMessage.className = "modal-empty-message";
  emptyMessage.textContent =
    "Tidak ada data modal.";

  modalHistory.appendChild(emptyMessage);
  return;
}

    // TAMPILKAN RIWAYAT MODAL DALAM BENTUK TABEL

    const wrapper = document.createElement("div");
    wrapper.className = "transaction-table-wrapper";

    const table = document.createElement("table");
    table.className = "transaction-table";

    // HEADER TABEL
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Sumber Modal", "Tanggal", "Keterangan", "Jumlah Modal", "Aksi"]
      .forEach(label => {
        const th = document.createElement("th");
        th.textContent = label;
        headerRow.appendChild(th);
      });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    // DATA MODAL
    filteredEntries.forEach(item => {
      const row = document.createElement("tr");

      // SUMBER MODAL
      const sourceCell = document.createElement("td");
      const source = document.createElement("strong");

      source.className = "table-transaction-name";
      source.textContent = item.source || "-";
      sourceCell.appendChild(source);

      // TANGGAL
      const dateCell = document.createElement("td");

      dateCell.textContent = new Date(
        `${item.modal_date}T00:00:00`
      ).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      // KETERANGAN
      const descriptionCell = document.createElement("td");
      descriptionCell.className = "modal-table-description";
      descriptionCell.textContent =
        item.description || "Tidak ada keterangan";

      // JUMLAH MODAL
      const amountCell = document.createElement("td");
      const amount = document.createElement("strong");

      amount.className = "table-transaction-amount income";
      amount.textContent = formatRupiah(item.amount);

      amountCell.appendChild(amount);

      // TOMBOL AKSI
      const actionCell = document.createElement("td");
      const actions = document.createElement("div");

      actions.className = "modal-history-actions";

      // DETAIL
      const detailButton = document.createElement("button");
      detailButton.type = "button";
      detailButton.className = "modal-detail-button";
      detailButton.textContent = "Detail";

      detailButton.addEventListener("click", () => {
        detailContent.replaceChildren();

        const details = [
          ["Sumber Modal", item.source],
          ["Tanggal", new Date(
            `${item.modal_date}T00:00:00`
          ).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
          })],
          ["Jumlah Modal", formatRupiah(item.amount)],
          ["Keterangan", item.description || "Tidak ada keterangan"]
        ];

        details.forEach(([label, value]) => {
          const group = document.createElement("div");
          group.className = "modal-detail-item";

          const title = document.createElement("span");
          title.textContent = label;

          const content = document.createElement("strong");
          content.textContent = value;

          group.append(title, content);
          detailContent.appendChild(group);
        });

        detailOverlay.hidden = false;
      });

      // EDIT
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "modal-edit-button";
      editButton.textContent = "Edit";

      editButton.addEventListener("click", () => {
        editingModalId = item.id;

        modalDate.value = item.modal_date;
        modalSource.value = item.source;
        modalAmount.value = item.amount;
        modalDescription.value = item.description || "";

        saveButton.textContent = "Perbarui Modal";
        cancelEditButton.hidden = false;

        modalMessage.textContent = "Anda sedang mengedit data modal.";
        modalMessage.style.color = "#087653";

        modalForm.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      });

      // HAPUS
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "modal-delete-button";
      deleteButton.textContent = "Hapus";

      deleteButton.addEventListener("click", async () => {
        const confirmation = confirm(
          "Apakah Anda yakin ingin menghapus catatan modal ini?"
        );

        if (!confirmation) return;

        deleteButton.disabled = true;
        deleteButton.textContent = "Menghapus...";

        const { error: deleteError } = await supabase
          .from("modal_entries")
          .delete()
          .eq("id", item.id)
          .eq("owner_id", user.id);

        if (deleteError) {
          console.error("Gagal menghapus modal:", deleteError);
          alert("Gagal menghapus modal: " + deleteError.message);

          deleteButton.disabled = false;
          deleteButton.textContent = "Hapus";
          return;
        }

        if (editingModalId === item.id) {
          editingModalId = null;
          modalForm.reset();
          modalDate.value = localDate;
          saveButton.textContent = "Simpan Modal";
          cancelEditButton.hidden = true;
          modalMessage.textContent = "";
        }

        await loadModalEntries();
      });

      actions.append(detailButton, editButton, deleteButton);
      actionCell.appendChild(actions);

      row.append(
        sourceCell,
        dateCell,
        descriptionCell,
        amountCell,
        actionCell
      );

      tbody.appendChild(row);
    });

    table.append(thead, tbody);
    wrapper.appendChild(table);
    modalHistory.appendChild(wrapper);

  }

// BATAL EDIT MODAL
cancelEditButton.addEventListener("click", () => {

  editingModalId = null;

  modalForm.reset();
  modalDate.value = localDate;

  saveButton.textContent = "Simpan Modal";
  cancelEditButton.hidden = true;

  modalMessage.textContent = "";

});

// TUTUP DETAIL MODAL
closeDetailButton.addEventListener("click", () => {
  detailOverlay.hidden = true;
});

// TUTUP SAAT AREA LUAR DIKLIK
detailOverlay.addEventListener("click", (event) => {
  if (event.target === detailOverlay) {
    detailOverlay.hidden = true;
  }
});

// TUTUP DENGAN TOMBOL ESCAPE
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    detailOverlay.hidden = true;
  }
});

  // SIMPAN MODAL
  modalForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";
    modalMessage.textContent = "";

    try {

      const amount = Number(modalAmount.value);
const source = modalSource.value.trim();

if (!source) {
  throw new Error("Sumber modal wajib diisi.");
}
      if (!Number.isFinite(amount) || amount <= 0) {
  throw new Error("Jumlah modal harus lebih dari nol.");
}

if (amount > 9999999999999.99) {
  throw new Error("Jumlah modal melebihi batas penyimpanan.");
}
if (!modalDate.value) {
  throw new Error("Tanggal modal wajib diisi.");
}

if (modalDate.value > localDate) {
  throw new Error("Tanggal modal tidak boleh melebihi hari ini.");
}
      const modalData = {
        owner_id: user.id,
        modal_date: modalDate.value,
        source: source,
        amount: amount,
        description: modalDescription.value.trim()
      };

      const isEditing = Boolean(editingModalId);

let saveResult;

if (isEditing) {
  saveResult = await supabase
    .from("modal_entries")
    .update(modalData)
    .eq("id", editingModalId)
    .eq("owner_id", user.id);
} else {
  saveResult = await supabase
    .from("modal_entries")
    .insert(modalData);
}

if (saveResult.error) throw saveResult.error;

      modalMessage.textContent = isEditing
  ? "Modal berhasil diperbarui!"
  : "Modal berhasil disimpan!";

editingModalId = null;
      modalMessage.style.color = "#087653";

      modalForm.reset();
    modalDate.value = localDate;

saveButton.textContent = "Simpan Modal";
cancelEditButton.hidden = true;
await loadModalEntries();

    } catch (error) {

      console.error("Gagal menyimpan modal:", error);

      modalMessage.textContent =
        "Gagal menyimpan: " + error.message;

      modalMessage.style.color = "#dc2626";

 } finally {
  saveButton.disabled = false;

  saveButton.textContent = editingModalId
    ? "Perbarui Modal"
    : "Simpan Modal";
}
  });

// PENCARIAN OTOMATIS
searchModal.addEventListener("input", async () => {
  await loadModalEntries();
});

  // TAMPILKAN DATA SAAT HALAMAN DIBUKA
  await loadModalEntries();

  console.log("Modal terhubung dengan Supabase.");

});
