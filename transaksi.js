import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

  // CEK SESSION
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    window.location.replace("index.html");
    return;
  }

  const user = data.session.user;

  // =====================================
  // DATA USAHA DAN DAFTAR PRODUK
  // =====================================

  let saleBusinessId = null;
  let saleProducts = [];

  const {
    data: activeBusiness,
    error: activeBusinessError
  } = await supabase
    .from("businesses")
    .select("id, business_name")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (activeBusinessError) {
    console.error("Gagal mengambil data usaha:", activeBusinessError);
  } else if (activeBusiness) {
    saleBusinessId = activeBusiness.id;
  }

  // =====================================
  // MEMUAT DAFTAR BARANG
  // =====================================

  async function loadSaleProducts() {
    if (!saleBusinessId) {
      console.error("ID usaha belum ditemukan.");
      saleProducts = [];
      return;
    }

    const { data: products, error: productsError } = await supabase
    .from("stock_products")
    .select("id, product_name, unit, selling_price, current_stock")
    .eq("owner_id", user.id)
    .eq("business_id", saleBusinessId)
    .eq("is_archived", false)
    .gt("current_stock", 0)
    .order("product_name", { ascending: true });
    if (productsError) {
      console.error("Gagal mengambil daftar barang:", productsError);
      saleProducts = [];
      return;
    }

    saleProducts = products || [];

    console.log("Produk siap digunakan:", saleProducts);
  }

  await loadSaleProducts();

  // ELEMEN HTML
  const form = document.getElementById("transactionForm");
  const dateInput = document.getElementById("transactionDate");
  const typeInput = document.getElementById("transactionType");
  const categoryInput = document.getElementById("transactionCategory");
  const amountInput = document.getElementById("transactionAmount");
  const descriptionInput = document.getElementById("transactionDescription");
  const saveButton = document.getElementById("saveTransaction");
  const cancelButton = document.getElementById("cancelEditTransaction");
  const message = document.getElementById("transactionMessage");
  const history = document.getElementById("transactionHistory");
  const searchInput = document.getElementById("searchTransaction");

  const incomeElement = document.getElementById("transactionIncome");
  const expensesElement = document.getElementById("transactionExpenses");
  const balanceElement = document.getElementById("transactionBalance");
  // REKOMENDASI KATEGORI TRANSAKSI
const categoryOptions = document.getElementById("transactionCategoryOptions");

const transactionCategories = {
  pemasukan: [
    "Penjualan Produk",
    "Penjualan Jasa",
    "Pendapatan Lainnya"
  ],

  pengeluaran: [
    "Gaji Karyawan",
    "Pembelian Bahan Baku",
    "Pembelian Barang Dagang",
    "Listrik dan Air",
    "Internet dan Telepon",
    "Sewa Tempat",
    "Transportasi dan BBM",
    "Perlengkapan Usaha",
    "Promosi dan Iklan",
    "Biaya Administrasi",
    "Perawatan dan Perbaikan",
    "Pengeluaran Lainnya"
  ]
};

function updateCategorySuggestions(type) {
  if (!categoryOptions) return;

  categoryOptions.innerHTML = "";

  const categories = transactionCategories[type] || [];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    categoryOptions.appendChild(option);
  });
}

// =====================================
// RINCIAN BARANG PENJUALAN
// =====================================

const saleItemsSection = document.getElementById("saleItemsSection");
const saleItemsContainer = document.getElementById("saleItemsContainer");
const addSaleItemButton = document.getElementById("addSaleItemButton");
const saleItemsTotal = document.getElementById("saleItemsTotal");

// CEK APAKAH TRANSAKSI PENJUALAN PRODUK
function isProductSale() {
    return (
        typeInput.value === "pemasukan" &&
        categoryInput.value.trim().toLowerCase() === "penjualan produk"
    );
}

// AMBIL SEMUA BARIS BARANG
function getSaleItemRows() {
    return [
        ...saleItemsContainer.querySelectorAll(".sale-item-row")
    ];
}

// HITUNG TOTAL PENJUALAN
function updateSaleItemsTotal() {
    let total = 0;

    getSaleItemRows().forEach(row => {
        const quantity = Number(
            row.querySelector(".sale-item-quantity").value
        );

        const price = Number(
            row.querySelector(".sale-item-price").value
        );

        const subtotal =
            Number.isFinite(quantity) &&
            Number.isFinite(price) &&
            quantity > 0 &&
            price >= 0
                ? quantity * price
                : 0;

        row.querySelector(".sale-item-subtotal").textContent =
            "Subtotal: " + formatRupiah(subtotal);

        total += subtotal;
    });

    saleItemsTotal.textContent = formatRupiah(total);

    if (isProductSale()) {
        amountInput.value = total;
    }
}

// TAMBAH BARIS BARANG
function addSaleItemRow() {
    const row = document.createElement("div");
    row.className = "sale-item-row";

    // PILIHAN BARANG
    const productField = document.createElement("div");
    productField.className = "sale-item-field";

    const productLabel = document.createElement("label");
    productLabel.textContent = "Nama Barang";

    const productSelect = document.createElement("select");
    productSelect.className = "sale-item-product";
    productSelect.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Pilih barang";
    productSelect.appendChild(defaultOption);

    saleProducts.forEach(product => {
        const option = document.createElement("option");

        option.value = product.id;
        option.textContent =
            `${product.product_name} — Stok: ${product.current_stock} ${product.unit || ""}`;

        option.disabled = Number(product.current_stock) <= 0;

        productSelect.appendChild(option);
    });

    productField.append(productLabel, productSelect);

    // JUMLAH BARANG
    const quantityField = document.createElement("div");
    quantityField.className = "sale-item-field";

    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "Jumlah Terjual";

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.className = "sale-item-quantity";
    quantityInput.min = "1";
    quantityInput.step = "1";
    quantityInput.value = "1";
    quantityInput.required = true;

    quantityField.append(quantityLabel, quantityInput);

    // HARGA JUAL
    const priceField = document.createElement("div");
    priceField.className = "sale-item-field";

    const priceLabel = document.createElement("label");
    priceLabel.textContent = "Harga Jual Satuan (Rp)";

    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.className = "sale-item-price";
    priceInput.min = "0";
    priceInput.step = "0.01";
    priceInput.placeholder = "Harga jual";
    priceInput.required = true;
    priceInput.readOnly = true;

    priceField.append(priceLabel, priceInput);

    // SUBTOTAL
    const subtotal = document.createElement("div");
    subtotal.className = "sale-item-subtotal";
    subtotal.textContent = "Subtotal: Rp0";

    priceField.appendChild(subtotal);

    // TOMBOL HAPUS BARIS
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-sale-item";
    removeButton.textContent = "Hapus";

    // KETIKA BARANG DIPILIH
    productSelect.addEventListener("change", () => {
        const selectedProduct = saleProducts.find(
            product => String(product.id) === productSelect.value
        );

        const duplicate = getSaleItemRows().some(existingRow => {
            return (
                existingRow !== row &&
                existingRow.querySelector(".sale-item-product").value ===
                    productSelect.value
            );
        });

        if (duplicate && productSelect.value) {
            alert("Barang tersebut sudah ada dalam daftar.");

            productSelect.value = "";
            priceInput.value = "";
            quantityInput.removeAttribute("max");

            updateSaleItemsTotal();
            return;
        }

        if (selectedProduct) {
            priceInput.value = selectedProduct.selling_price ?? 0;
            quantityInput.max = selectedProduct.current_stock;
        } else {
            priceInput.value = "";
            quantityInput.removeAttribute("max");
        }

        updateSaleItemsTotal();
    });

    quantityInput.addEventListener("input", updateSaleItemsTotal);
  
    removeButton.addEventListener("click", () => {
        row.remove();
        updateSaleItemsTotal();
    });

    row.append(
        productField,
        quantityField,
        priceField,
        removeButton
    );

    saleItemsContainer.appendChild(row);

    updateSaleItemsTotal();
}

// TAMPILKAN FORM BARANG JIKA PENJUALAN PRODUK
function updateSaleFormVisibility() {
    const active = isProductSale();
document.getElementById("transactionDescriptionField").hidden = active;
    saleItemsSection.hidden = !active;
    amountInput.readOnly = active;

    if (active) {
        if (getSaleItemRows().length === 0) {
            addSaleItemRow();
        }
    } else {
        saleItemsContainer.innerHTML = "";
        saleItemsTotal.textContent = formatRupiah(0);
    }
}

// TOMBOL TAMBAH BARANG
addSaleItemButton.addEventListener("click", addSaleItemRow);

// PERUBAHAN KATEGORI
categoryInput.addEventListener("input", updateSaleFormVisibility);
categoryInput.addEventListener("change", updateSaleFormVisibility);

// Perbarui rekomendasi ketika jenis transaksi berubah
typeInput.addEventListener("change", () => {
    updateCategorySuggestions(typeInput.value);
    updateSaleFormVisibility();
});
  let editingTransactionId = null;
  let transactionEntries = [];

  // FORMAT RUPIAH
  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // FORMAT TANGGAL
  function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // TANGGAL LOKAL
  function getLocalDate() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000)
      .toISOString()
      .split("T")[0];
  }

  dateInput.value = getLocalDate();
  dateInput.max = getLocalDate();

  // PESAN
  function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "#087653" : "#dc5555";
  }
// RESET FORM
function resetForm() {
    form.reset();

    updateCategorySuggestions("");
    dateInput.value = getLocalDate();
    dateInput.max = getLocalDate();

    editingTransactionId = null;

    saleItemsContainer.innerHTML = "";
    saleItemsTotal.textContent = formatRupiah(0);

    saveButton.textContent = "Simpan Transaksi";
    cancelButton.hidden = true;
    message.textContent = "";

    updateSaleFormVisibility();
}
  // RINGKASAN
  function updateSummary(entries) {
    const totalIncome = entries
      .filter(item => item.transaction_type === "pemasukan")
      .reduce((total, item) => total + Number(item.amount), 0);

    const totalExpenses = entries
      .filter(item => item.transaction_type === "pengeluaran")
      .reduce((total, item) => total + Number(item.amount), 0);

    incomeElement.textContent = formatRupiah(totalIncome);
    expensesElement.textContent = formatRupiah(totalExpenses);
    balanceElement.textContent = formatRupiah(totalIncome - totalExpenses);
  }
// TAMPILKAN RIWAYAT TRANSAKSI
function renderHistory(entries) {
  history.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "transaction-table-wrapper";

  const table = document.createElement("table");
  table.className = "transaction-table";

  // HEADER
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [
    "Transaksi",
    "Kategori",
    "Tanggal",
    "Jenis",
    "Jumlah",
    "Aksi"
  ].forEach(label => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);

  // ISI TABEL
  const tbody = document.createElement("tbody");

  if (entries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.className = "transaction-empty";
    cell.textContent = "Belum ada transaksi yang sesuai.";

    row.appendChild(cell);
    tbody.appendChild(row);
  } else {
    entries.forEach(item => {
      const row = document.createElement("tr");
      const isIncome = item.transaction_type === "pemasukan";

      // TRANSAKSI
      const nameCell = document.createElement("td");

      const name = document.createElement("strong");
      name.className = "table-transaction-name";
      name.textContent =
        item.description || item.category || "Transaksi";

      const code = document.createElement("small");
      code.className = "table-transaction-code";
      code.textContent = item.id.slice(0, 7).toUpperCase();

      nameCell.append(name, code);

      // KATEGORI
      const categoryCell = document.createElement("td");
      categoryCell.textContent = item.category || "-";

      // TANGGAL
      const dateCell = document.createElement("td");
      dateCell.textContent = formatDate(item.transaction_date);

      // JENIS
      const typeCell = document.createElement("td");
      const badge = document.createElement("span");

      badge.className = isIncome
        ? "transaction-type-badge income"
        : "transaction-type-badge expense";

      badge.textContent = isIncome ? "Pemasukan" : "Pengeluaran";
      typeCell.appendChild(badge);

      // NOMINAL
      const amountCell = document.createElement("td");
      const amount = document.createElement("strong");

      amount.className = isIncome
        ? "table-transaction-amount income"
        : "table-transaction-amount expense";

      amount.textContent =
        `${isIncome ? "+" : "-"}${formatRupiah(item.amount)}`;

      amountCell.appendChild(amount);

      // AKSI
      const actionCell = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "transaction-history-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => editTransaction(item));

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Hapus";
      deleteButton.addEventListener("click", () => deleteTransaction(item));

      actions.append(editButton, deleteButton);
      actionCell.appendChild(actions);

      row.append(
        nameCell,
        categoryCell,
        dateCell,
        typeCell,
        amountCell,
        actionCell
      );

      tbody.appendChild(row);
    });
  }

  table.append(thead, tbody);
  wrapper.appendChild(table);
  history.appendChild(wrapper);
}
  // AMBIL DATA TRANSAKSI
  async function loadTransactions() {
    history.textContent = "Memuat data transaksi...";

    const { data: entries, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("owner_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Gagal memuat transaksi:", error);
      history.textContent = "Gagal memuat data transaksi.";
      return;
    }

    transactionEntries = entries || [];

    // Ringkasan selalu memakai seluruh transaksi
    updateSummary(transactionEntries);

    // Pencarian hanya memengaruhi daftar riwayat
    const keyword = searchInput.value.trim().toLowerCase();

    const filteredEntries = transactionEntries.filter(item =>
      [
        item.category,
        item.description,
        item.transaction_type
      ].some(value => (value || "").toLowerCase().includes(keyword))
    );

    renderHistory(filteredEntries);
  }

  // EDIT TRANSAKSI
  async function editTransaction(item) {
    editingTransactionId = item.id;

    dateInput.value = item.transaction_date;
    typeInput.value = item.transaction_type;

    updateCategorySuggestions(item.transaction_type);
    categoryInput.value = item.category;

    amountInput.value = item.amount;
    descriptionInput.value = item.description || "";

    saveButton.textContent = "Simpan Perubahan";
    cancelButton.hidden = false;
    message.textContent = "";

    updateSaleFormVisibility();
  
    if (isProductSale()) {
      try {
       const { data: details, error } = await supabase
    .from("transaction_items")
    .select("product_id, quantity, unit_price, business_id")
    .eq("transaction_id", item.id)
    .eq("owner_id", user.id);

if (error) throw error;

console.log("PEMERIKSAAN DETAIL PENJUALAN:", {
    transactionId: item.id,
    saleBusinessId: saleBusinessId,
    details: details
});

        if (error) throw error;

        if (!details || details.length === 0) {
          throw new Error("Detail barang penjualan tidak ditemukan.");
        }

        saleItemsContainer.innerHTML = "";

        for (const detail of details) {
          addSaleItemRow();

          const row = getSaleItemRows().at(-1);

          const productSelect = row.querySelector(".sale-item-product");
          const quantityInput = row.querySelector(".sale-item-quantity");

          productSelect.value = detail.product_id;
          productSelect.dispatchEvent(new Event("change"));

          quantityInput.value = detail.quantity;

          const product = saleProducts.find(
            p => String(p.id) === String(detail.product_id)
          );

          if (product) {
            quantityInput.max =
              Number(product.current_stock) + Number(detail.quantity);
          }

          updateSaleItemsTotal();
        }

      } catch (error) {
        console.error("Gagal memuat detail penjualan:", error);
        showMessage(error.message || "Detail penjualan gagal dimuat.");
      }
    }

    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // HAPUS TRANSAKSI
  async function deleteTransaction(item) {
    const confirmed = confirm(
      `Hapus transaksi "${item.category}"?`
    );

    if (!confirmed) return;

    try {
      let result;

      if (
        item.transaction_type === "pemasukan" &&
        item.category.trim().toLowerCase() === "penjualan produk"
      ) {
        result = await supabase.rpc("delete_product_sale", {
          p_transaction_id: item.id
        });
      } else {
        result = await supabase
          .from("transactions")
          .delete()
          .eq("id", item.id)
          .eq("owner_id", user.id);
      }

      if (result.error) throw result.error;

      if (editingTransactionId === item.id) {
        resetForm();
      }

      await loadSaleProducts();
      await loadTransactions();

      alert("Transaksi berhasil dihapus.");

    } catch (error) {
    console.error("Detail error hapus transaksi:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
    });

    alert(error.message || "Transaksi gagal dihapus.");
}
  }

  // SIMPAN TRANSAKSI
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const transactionDate = dateInput.value;
    const transactionType = typeInput.value;
    const category = categoryInput.value.trim();
    const amount = Number(amountInput.value);
    const description = descriptionInput.value.trim();
    const productSale = isProductSale();

    if (!transactionDate || transactionDate > getLocalDate()) {
      showMessage("Tanggal transaksi tidak valid.");
      return;
    }

    if (!["pemasukan", "pengeluaran"].includes(transactionType)) {
      showMessage("Pilih jenis transaksi terlebih dahulu.");
      return;
    }

    if (!category) {
      showMessage("Kategori transaksi wajib diisi.");
      return;
    }

    let saleItems = [];

    if (productSale) {
      saleItems = getSaleItemRows().map(row => ({
        product_id: row.querySelector(".sale-item-product").value,
        quantity: Number(row.querySelector(".sale-item-quantity").value)
      }));

      if (
        saleItems.length === 0 ||
        saleItems.some(item =>
          !item.product_id ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0
        )
      ) {
        showMessage("Pilih barang dan isi jumlah yang valid.");
        return;
      }

         } else {
      if (!Number.isFinite(amount) || amount <= 0 || amount > 9999999999999.99) {
        showMessage("Nominal transaksi tidak valid.");
        return;
      }
    }

    const transactionData = {
      owner_id: user.id,
      transaction_date: transactionDate,
      transaction_type: transactionType,
      category,
      amount,
      description: description || null
    };

    saveButton.disabled = true;

    try {
      let result;

     if (productSale) {
      console.log("PEMERIKSAAN PENJUALAN:", {
    editingTransactionId,
    saleItems,
    availableProducts: saleProducts.map(product => ({
        id: product.id,
        name: product.product_name,
        stock: product.current_stock
    }))
});
    result = await supabase.rpc("save_product_sale", {
        p_transaction_date: transactionDate,
        p_description: description || null,
        p_items: saleItems,
        p_transaction_id: editingTransactionId || null
    });
    
      } else if (editingTransactionId) {
        result = await supabase
          .from("transactions")
          .update(transactionData)
          .eq("id", editingTransactionId)
          .eq("owner_id", user.id);

      } else {
        result = await supabase
          .from("transactions")
          .insert([transactionData]);
      }

      if (result.error) throw result.error;

      showMessage(
        editingTransactionId
          ? "Transaksi berhasil diperbarui."
          : "Transaksi berhasil disimpan.",
        true
      );

      resetForm();
      await loadSaleProducts();
      updateSaleFormVisibility();
      await loadTransactions();

    } catch (error) {
   console.error(
    "DETAIL ERROR SUPABASE:",
    JSON.stringify({
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
    }, null, 2)
);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = editingTransactionId
        ? "Simpan Perubahan"
        : "Simpan Transaksi";
    }
  });

  // BATAL EDIT
  cancelButton.addEventListener("click", resetForm);

  // PENCARIAN
  searchInput.addEventListener("input", loadTransactions);

  // MUAT DATA AWAL
  await loadTransactions();

  console.log("Halaman Transaksi berhasil dimuat.");

});
