import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

    // CEK LOGIN
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
        window.location.replace("index.html");
        return;
    }

const user = data.session.user;

// AMBIL DATA USAHA
const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, business_name")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

if (businessError) {
    console.error("Gagal mengambil data usaha:", businessError);
    alert("Gagal mengambil data usaha.");
    return;
}

if (!business) {
    alert("Data usaha belum ditemukan. Silakan lengkapi profil usaha.");
    return;
}

const businessId = business.id;


// =====================================
// FORMAT RUPIAH
// =====================================
function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount || 0);
}

// =====================================
// AMBIL DATA PRODUK
// =====================================
let stockProducts = [];

async function loadStockProducts() {
    const { data: products, error } = await supabase
        .from("stock_products")
        .select("*")
        .eq("owner_id", user.id)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Gagal mengambil data stok:", error);
        alert("Gagal memuat data stok barang.");
        return;
    }

    stockProducts = products || [];

    renderStockProducts();
}

// =====================================
// TAMPILKAN DATA DAN RINGKASAN
// =====================================
function renderStockProducts() {
    const tableBody = document.getElementById("stockTableBody");

    if (!tableBody) return;

    const searchValue =
        document.getElementById("searchProduct")?.value
            .toLowerCase().trim() || "";

    const filterValue =
        document.getElementById("stockFilter")?.value || "all";

    let totalStock = 0;
    let lowStockCount = 0;
    let availableStockCount = 0;

    stockProducts.forEach(product => {
        const stock = Number(product.current_stock);
        const minimum = Number(product.minimum_stock);

        totalStock += stock;

        if (stock > 0 && stock <= minimum) {
            lowStockCount++;
        }

        if (stock > minimum) {
            availableStockCount++;
        }
    });

    document.getElementById("totalProductTypes").textContent =
        stockProducts.length;

    document.getElementById("totalStock").textContent =
        totalStock.toLocaleString("id-ID");

    document.getElementById("lowStockCount").textContent =
        lowStockCount;

    document.getElementById("availableStockCount").textContent =
        availableStockCount;

    // FILTER DAN PENCARIAN
    const filteredProducts = stockProducts.filter(product => {
        const stock = Number(product.current_stock);
        const minimum = Number(product.minimum_stock);

        const matchesSearch =
            product.product_name.toLowerCase().includes(searchValue);

        let matchesFilter = true;

        if (filterValue === "available") {
            matchesFilter = stock > minimum;
        } else if (filterValue === "low") {
            matchesFilter = stock > 0 && stock <= minimum;
        } else if (filterValue === "empty") {
            matchesFilter = stock === 0;
        }

        return matchesSearch && matchesFilter;
    });

    // TAMPILKAN TABEL
    tableBody.replaceChildren();

    if (filteredProducts.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.textContent = stockProducts.length === 0
            ? "Belum ada barang. Silakan tambahkan barang."
            : "Barang tidak ditemukan.";

        cell.className = "stock-empty";
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

   
filteredProducts.forEach((product, index) => {
    const stock = Number(product.current_stock);
    const minimum = Number(product.minimum_stock);

    let status = "Tersedia";

    if (stock === 0) {
        status = "Habis";
    } else if (stock <= minimum) {
        status = "Stok Menipis";
    }

    const row = document.createElement("tr");

    const values = [
        index + 1,
        product.product_name,
        product.category || "-",
        formatCurrency(product.purchase_price),
        formatCurrency(product.selling_price),
        stock.toLocaleString("id-ID"),
        status
    ];

    values.forEach(value => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    });

    // KOLOM AKSI
    const actionCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "stock-edit-button";
    editButton.dataset.id = product.id;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Hapus";
    deleteButton.className = "stock-delete-button";
    deleteButton.dataset.id = product.id;

    actionCell.append(editButton, deleteButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
});

}

 // =====================================
 // FUNGSI HAPUS BARANG
 // =====================================

const stockTableBody = document.getElementById("stockTableBody");

stockTableBody?.addEventListener("click", async (event) => {

    const deleteButton = event.target.closest(".stock-delete-button");

    if (!deleteButton) return;

    const productId = deleteButton.dataset.id;

    const product = stockProducts.find(
        item => String(item.id) === String(productId)
    );

    if (!product) {
        alert("Data barang tidak ditemukan.");
        return;
    }

    const confirmation = confirm(
        `Yakin ingin menghapus barang "${product.product_name}"?`
    );

    if (!confirmation) return;

    deleteButton.disabled = true;
    deleteButton.textContent = "Menghapus...";

    try {
        // Periksa apakah barang memiliki riwayat stok
        const { data: movements, error: movementError } = await supabase
            .from("stock_movements")
            .select("id")
            .eq("product_id", productId)
            .eq("owner_id", user.id)
            .limit(1);

        if (movementError) {
            console.error(movementError);
            alert("Gagal memeriksa riwayat stok: " + movementError.message);
            return;
        }

        if (movements && movements.length > 0) {
            alert(
                "Barang tidak dapat dihapus karena sudah memiliki riwayat stok masuk atau keluar."
            );
            return;
        }

        // Hapus barang
        const { data: deletedProduct, error: deleteError } = await supabase
            .from("stock_products")
            .delete()
            .eq("id", productId)
            .eq("owner_id", user.id)
            .eq("business_id", businessId)
            .select("id");

        if (deleteError) {
            console.error(deleteError);
            alert("Barang gagal dihapus: " + deleteError.message);
            return;
        }

        if (!deletedProduct || deletedProduct.length === 0) {
            alert("Barang tidak berhasil dihapus. Periksa izin akses Supabase.");
            return;
        }

        alert("Barang berhasil dihapus!");

        await loadStockProducts();

    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat menghapus barang.");

    } finally {
        deleteButton.disabled = false;
        deleteButton.textContent = "Hapus";
    }
});

// =====================================
// PENCARIAN DAN FILTER
// =====================================
document.getElementById("searchProduct")
    ?.addEventListener("input", renderStockProducts);

document.getElementById("stockFilter")
    ?.addEventListener("change", renderStockProducts);

// =====================================
// MODAL TAMBAH BARANG
// =====================================
// ID barang yang sedang diedit
let editingProductId = null;
const productModal = document.getElementById("productModal");
const addProductButton = document.getElementById("addProductButton");
const closeProductModal = document.getElementById("closeProductModal");
const cancelProductButton = document.getElementById("cancelProductButton");
const productForm = document.getElementById("productForm");
const saveProductButton = document.getElementById("saveProductButton");

// BUKA POPUP
addProductButton?.addEventListener("click", () => {
    productForm.reset();
    productModal.hidden = false;
});

// TUTUP POPUP
function closeModal() {
    productModal.hidden = true;
    productForm.reset();

    editingProductId = null;

    document.getElementById("initialStock").disabled = false;
    saveProductButton.textContent = "Simpan Barang";
}

closeProductModal?.addEventListener("click", closeModal);
cancelProductButton?.addEventListener("click", closeModal);

// TUTUP JIKA KLIK AREA LUAR
productModal?.addEventListener("click", (event) => {
    if (event.target === productModal) {
        closeModal();
    }
});

// TUTUP DENGAN TOMBOL ESC
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !productModal.hidden) {
        closeModal();
    }
});
 // =====================================
// FUNGSI EDIT BARANG
// =====================================

document.getElementById("stockTableBody")
    ?.addEventListener("click", (event) => {

        const editButton = event.target.closest(".stock-edit-button");

        if (!editButton) return;

        const productId = editButton.dataset.id;

        const product = stockProducts.find(
            item => String(item.id) === String(productId)
        );

        if (!product) {
            alert("Data barang tidak ditemukan.");
            return;
        }
    
        editingProductId = product.id;

        // ISI FORM DENGAN DATA BARANG
        document.getElementById("productName").value =
            product.product_name || "";

        document.getElementById("productCategory").value =
            product.category || "";

        document.getElementById("productUnit").value =
            product.unit || "Pcs";

        document.getElementById("purchasePrice").value =
            product.purchase_price ?? 0;

        document.getElementById("sellingPrice").value =
            product.selling_price ?? 0;

        document.getElementById("initialStock").value =
            product.current_stock ?? 0;

        document.getElementById("minimumStock").value =
            product.minimum_stock ?? 0;

        // Stok dikelola melalui fitur stok masuk/keluar,
        // bukan melalui edit informasi barang.
        document.getElementById("initialStock").disabled = true;

        saveProductButton.textContent = "Simpan Perubahan";

        productModal.hidden = false;
    });

// =====================================
// SIMPAN BARANG KE SUPABASE
// =====================================

productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productName = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value.trim();
    const unit = document.getElementById("productUnit").value;

    const purchasePrice = Number(
        document.getElementById("purchasePrice").value
    );

    const sellingPrice = Number(
        document.getElementById("sellingPrice").value
    );

    const initialStock = Number(
        document.getElementById("initialStock").value
    );

    const minimumStock = Number(
        document.getElementById("minimumStock").value
    );

    // VALIDASI
    if (!productName) {
        alert("Nama barang wajib diisi.");
        return;
    }

    const numbers = [
        purchasePrice,
        sellingPrice,
        initialStock,
        minimumStock
    ];

    if (
        numbers.some(value => !Number.isFinite(value) || value < 0) ||
        !Number.isInteger(initialStock) ||
        !Number.isInteger(minimumStock)
    ) {
        alert("Periksa kembali harga dan jumlah stok barang.");
        return;
    }

    const isEditing = editingProductId !== null;

    saveProductButton.disabled = true;
    saveProductButton.textContent = "Menyimpan...";

    try {
        let result;

        if (isEditing) {
            // PERBARUI BARANG
            result = await supabase
                .from("stock_products")
                .update({
                    product_name: productName,
                    category: category || null,
                    unit: unit,
                    purchase_price: purchasePrice,
                    selling_price: sellingPrice,
                    minimum_stock: minimumStock,
                    updated_at: new Date().toISOString()
                })
                .eq("id", editingProductId)
                .eq("owner_id", user.id)
                .eq("business_id", businessId)
                .select("id");

        } else {
            // TAMBAH BARANG BARU
            result = await supabase
                .from("stock_products")
                .insert({
                    owner_id: user.id,
                    business_id: businessId,
                    product_name: productName,
                    category: category || null,
                    unit: unit,
                    purchase_price: purchasePrice,
                    selling_price: sellingPrice,
                    initial_stock: initialStock,
                    current_stock: initialStock,
                    minimum_stock: minimumStock
                })
                .select("id");
        }

        const { data: savedProduct, error } = result;

        if (error) {
            console.error("Gagal menyimpan barang:", error);
            alert("Barang gagal disimpan: " + error.message);
            return;
        }

        if (!savedProduct || savedProduct.length === 0) {
            alert("Data tidak berhasil disimpan. Periksa izin akses Supabase.");
            return;
        }

        alert(
            isEditing
                ? "Perubahan barang berhasil disimpan!"
                : "Barang berhasil ditambahkan!"
        );

        closeModal();
        await loadStockProducts();

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        alert("Terjadi kesalahan saat menyimpan barang.");

    } finally {
        saveProductButton.disabled = false;
        saveProductButton.textContent = "Simpan Barang";
    }
});

// =====================================
// JALANKAN DATA
// =====================================
await loadStockProducts();

console.log("Usaha aktif:", business.business_name);
console.log("Business ID:", businessId);

});