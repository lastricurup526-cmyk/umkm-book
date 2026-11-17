
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

  // =========================================
  // 1. ELEMEN HTML
  // =========================================

  const periodFilter = document.getElementById("periodFilter");
  const customDateFilter = document.getElementById("customDateFilter");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  const totalIncomeElement = document.getElementById("totalIncome");
  const totalExpenseElement = document.getElementById("totalExpense");
  const netProfitElement = document.getElementById("netProfit");
  const profitStatusElement = document.getElementById("profitStatus");

  const transactionHistory = document.getElementById("transactionHistory");
  const reportPeriodLabel = document.getElementById("reportPeriodLabel");
  const reportMessage = document.getElementById("reportMessage");

  const refreshButton = document.getElementById("refreshReport");
  const printButton = document.getElementById("printReport");
  const downloadButton = document.getElementById("downloadPdf");
  const applyDateButton = document.getElementById("applyDateFilter");

  const openingInventoryInput = document.getElementById("openingInventory");
  const closingInventoryInput = document.getElementById("closingInventory");
  const saveInventoryButton = document.getElementById("saveInventory");
  const inventoryMessage = document.getElementById("inventoryMessage");

  const categoryTransactionType = document.getElementById("categoryTransactionType");
  const categoryNameSelect = document.getElementById("categoryName");
  const reportClassSelect = document.getElementById("reportClass");
  const saveCategoryButton = document.getElementById("saveCategoryRule");
  const categoryRulesList = document.getElementById("categoryRulesList");
  const categoryMessage = document.getElementById("categoryMessage");

  const reportElements = [
  "grossSales",
  "reportTotalIncome",
  "openingInventoryValue",
  "grossPurchases",
  "goodsAvailable",
  "closingInventoryValue",
  "costOfGoodsSold",
  "grossProfit",
  "operatingExpenseDetails",
  "totalOperatingExpenses",
  "finalNetProfit"
];

  const elementsValid = reportElements.every(id =>
    document.getElementById(id)
  );

  if (
    !periodFilter ||
    !transactionHistory ||
    !totalIncomeElement ||
    !totalExpenseElement ||
    !netProfitElement ||
    !elementsValid
  ) {
    console.error("Elemen laporan tidak lengkap.");
    return;
  }

  // =========================================
  // 2. VARIABEL
  // =========================================

  let currentUser = null;
  let allTransactions = [];
  let categoryRules = [];
  let currentInventory = {
  opening: 0,
  closing: 0
};

let inventoryConfigured = false;
  const PAGE_SIZE = 1000;

  const REPORT_LABELS = {
    penjualan: "Penjualan",
    pendapatan_lain: "Pendapatan Lain",
    pembelian_barang: "Pembelian Barang Dagang",
    beban_operasional: "Beban Operasional",
    retur_penjualan: "Retur Penjualan",
    potongan_penjualan: "Potongan Penjualan",
    retur_pembelian: "Retur Pembelian",
    potongan_pembelian: "Potongan Pembelian"
  };

  // =========================================
  // 3. FORMAT RUPIAH
  // =========================================

  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }
// FORMAT NOMINAL PENGURANG
function formatRupiahPengurang(value) {
  return `(${formatRupiah(Math.abs(Number(value) || 0))})`;
}
  // =========================================
  // 4. FORMAT TANGGAL
  // =========================================

  function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  // =========================================
  // 5. KEAMANAN HTML
  // =========================================

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    });
  }

  // =========================================
  // 6. PESAN
  // =========================================

  function showMessage(message) {
    if (!reportMessage) return;

    reportMessage.textContent = message;
    reportMessage.hidden = false;
  }

  function hideMessage() {
    if (!reportMessage) return;

    reportMessage.textContent = "";
    reportMessage.hidden = true;
  }

  function showInventoryMessage(message, success = false) {
    if (!inventoryMessage) return;

    inventoryMessage.textContent = message;
    inventoryMessage.hidden = false;
    inventoryMessage.style.color = success ? "#087653" : "#c45b36";
  }

  function showCategoryMessage(message, success = false) {
    if (!categoryMessage) return;

    categoryMessage.textContent = message;
    categoryMessage.hidden = false;
    categoryMessage.style.color = success ? "#087653" : "#c45b36";
  }

  // =========================================
  // 7. CEK LOGIN
  // =========================================

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data?.session) {
      window.location.replace("index.html");
      return;
    }

    currentUser = data.session.user;

  } catch (error) {
    console.error("Pemeriksaan login gagal:", error);
    showMessage("Gagal memeriksa login. Silakan muat ulang halaman.");
    return;
  }

  // =========================================
  // 8. AMBIL TRANSAKSI
  // =========================================

  async function loadTransactions() {
    hideMessage();

    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = "Memuat...";
    }

    try {
      let collected = [];
      let offset = 0;

      while (true) {
        const { data, error } = await supabase
          .from("transactions")
          .select(`
            id,
            owner_id,
            transaction_date,
            transaction_type,
            category,
            amount,
            description,
            created_at
          `)
          .eq("owner_id", currentUser.id)
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;

        const batch = data || [];
        collected.push(...batch);

        if (batch.length < PAGE_SIZE) break;

        offset += PAGE_SIZE;
      }

      allTransactions = collected;

      await loadCategoryRules();
      populateCategorySelect();
      await loadInventory();
      renderReport();

    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
      showMessage("Laporan gagal dimuat. Periksa koneksi dan izin Supabase.");
    } finally {
      if (refreshButton) {
        refreshButton.disabled = false;
        refreshButton.textContent = "↻ Perbarui";
      }
    }
  }

  // =========================================
  // 9. PERIODE LAPORAN
  // =========================================

  function getDateRange() {
    const period = periodFilter.value;
    const today = new Date();
    const todayString = getLocalDateString(today);

    let start = null;
    let end = null;
    let label = "";

    if (period === "today") {
      start = todayString;
      end = todayString;
      label = "Hari Ini";

    } else if (period === "week") {
      const firstDay = new Date(today);
      const day = firstDay.getDay();
      const difference = day === 0 ? 6 : day - 1;

      firstDay.setDate(today.getDate() - difference);

      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);

      start = getLocalDateString(firstDay);
      end = getLocalDateString(lastDay);
      label = `Minggu ${formatDate(start)} - ${formatDate(end)}`;

    } else if (period === "month") {
      const firstDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      const lastDay = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

      start = getLocalDateString(firstDay);
      end = getLocalDateString(lastDay);

      label = today.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric"
      });

    } else if (period === "year") {
      start = `${today.getFullYear()}-01-01`;
      end = `${today.getFullYear()}-12-31`;
      label = `Tahun ${today.getFullYear()}`;

    } else if (period === "custom") {
      start = startDateInput.value;
      end = endDateInput.value;

      label = start && end
        ? `${formatDate(start)} - ${formatDate(end)}`
        : "Periode Khusus";

    } else if (period === "all") {
      label = "Semua Periode";
    }

    return { start, end, label };
  }

  function getInventoryPeriod() {
    const { start, end } = getDateRange();

    if (!start || !end) return null;

    return {
      period_start: start,
      period_end: end
    };
  }

  // =========================================
  // 10. MUAT PERSEDIAAN
  // =========================================

  async function loadInventory() {
    const period = getInventoryPeriod();

    if (!period) {
  currentInventory = {
    opening: 0,
    closing: 0
  };

  inventoryConfigured = false;

      if (openingInventoryInput) {
        openingInventoryInput.value = "";
        openingInventoryInput.disabled = true;
      }

      if (closingInventoryInput) {
        closingInventoryInput.value = "";
        closingInventoryInput.disabled = true;
      }

      if (saveInventoryButton) {
        saveInventoryButton.disabled = true;
      }

      showInventoryMessage(
        "Pilih periode tertentu untuk mengatur persediaan. Semua Periode tidak memiliki satu batas awal dan akhir."
      );

      return;
    }

    if (openingInventoryInput) {
      openingInventoryInput.disabled = false;
    }

    if (closingInventoryInput) {
      closingInventoryInput.disabled = false;
    }

    if (saveInventoryButton) {
      saveInventoryButton.disabled = false;
    }

    if (inventoryMessage) {
      inventoryMessage.hidden = true;
    }

    const { data, error } = await supabase
      .from("profit_loss_inventory")
      .select("*")
      .eq("owner_id", currentUser.id)
      .eq("period_start", period.period_start)
      .eq("period_end", period.period_end)
      .maybeSingle();

    if (error) throw error;
    inventoryConfigured = Boolean(data);
    currentInventory = {
      opening: Number(data?.opening_inventory) || 0,
      closing: Number(data?.closing_inventory) || 0
    };

    if (openingInventoryInput) {
      openingInventoryInput.value = data
        ? currentInventory.opening
        : "";
    }

    if (closingInventoryInput) {
      closingInventoryInput.value = data
        ? currentInventory.closing
        : "";
    }
  }

  // =========================================
  // 11. SIMPAN PERSEDIAAN
  // =========================================

  async function saveInventory() {
    const period = getInventoryPeriod();

    if (!period) {
      showInventoryMessage(
        "Pilih periode laporan terlebih dahulu."
      );
      return;
    }

    const opening = Number(openingInventoryInput.value);
    const closing = Number(closingInventoryInput.value);

    if (
      openingInventoryInput.value.trim() === "" ||
      closingInventoryInput.value.trim() === "" ||
      !Number.isFinite(opening) ||
      !Number.isFinite(closing) ||
      opening < 0 ||
      closing < 0
    ) {
      showInventoryMessage(
        "Masukkan nilai persediaan awal dan akhir dengan benar."
      );
      return;
    }

    saveInventoryButton.disabled = true;
    saveInventoryButton.textContent = "Menyimpan...";

    try {
      const { error } = await supabase
        .from("profit_loss_inventory")
        .upsert({
          owner_id: currentUser.id,
          period_start: period.period_start,
          period_end: period.period_end,
          opening_inventory: opening,
          closing_inventory: closing,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "owner_id,period_start,period_end"
        });

      if (error) throw error;

      currentInventory = {
        opening,
        closing
      };
      inventoryConfigured = true;
      renderReport();

      showInventoryMessage(
        "Persediaan berhasil disimpan.",
        true
      );

    } catch (error) {
      console.error("Gagal menyimpan persediaan:", error);

      showInventoryMessage(
        "Persediaan gagal disimpan. Periksa tabel dan izin Supabase."
      );

    } finally {
      saveInventoryButton.disabled = false;
      saveInventoryButton.textContent = "Simpan Persediaan";
    }
  }

  // =========================================
  // 12. ATUR KATEGORI TRANSAKSI
  // =========================================

  function normalizeCategory(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function getRuleKey(type, category) {
    return `${type}::${normalizeCategory(category)}`;
  }

  async function loadCategoryRules() {
    const { data, error } = await supabase
      .from("profit_loss_category_rules")
      .select("*")
      .eq("owner_id", currentUser.id);

    if (error) throw error;

    categoryRules = data || [];
  }

  function populateCategorySelect() {
    if (!categoryNameSelect || !categoryTransactionType) return;

    const selectedType = categoryTransactionType.value;
    const previousValue = categoryNameSelect.value;

    const categories = [
      ...new Set(
        allTransactions
          .filter(transaction =>
            transaction.transaction_type === selectedType
          )
          .map(transaction =>
            String(transaction.category || "").trim()
          )
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b, "id"));

    categoryNameSelect.innerHTML = `
      <option value="">Pilih kategori transaksi</option>
      ${categories.map(category => `
        <option value="${escapeHTML(category)}">
          ${escapeHTML(category)}
        </option>
      `).join("")}
    `;

    if (categories.includes(previousValue)) {
      categoryNameSelect.value = previousValue;
    }
  }

  function getReportClass(transaction) {
    const type = String(transaction.transaction_type || "")
      .trim()
      .toLowerCase();

    const category = transaction.category || "";

    const rule = categoryRules.find(item =>
      item.transaction_type === type &&
      normalizeCategory(item.category_name) === normalizeCategory(category)
    );

    if (rule) return rule.report_class;

    const normalized = normalizeCategory(category);

    // Pemetaan otomatis berdasarkan nama kategori.
    // Jenis transaksi tetap menjadi dasar klasifikasi.

    if (type === "pemasukan") {
      if (normalized.includes("pendapatan lain")) {
        return "pendapatan_lain";
      }

      if (normalized.includes("retur pembelian")) {
        return "retur_pembelian";
      }

      if (normalized.includes("potongan pembelian")) {
        return "potongan_pembelian";
      }

      if (normalized.includes("retur penjualan")) {
        return "retur_penjualan";
      }

      if (normalized.includes("potongan penjualan")) {
        return "potongan_penjualan";
      }

      return "penjualan";
    }

    if (type === "pengeluaran") {
      if (normalized.includes("pembelian barang")) {
        return "pembelian_barang";
      }

      if (normalized.includes("retur penjualan")) {
        return "retur_penjualan";
      }

      if (normalized.includes("potongan penjualan")) {
        return "potongan_penjualan";
      }

      if (normalized.includes("retur pembelian")) {
        return "retur_pembelian";
      }

      if (normalized.includes("potongan pembelian")) {
        return "potongan_pembelian";
      }

      return "beban_operasional";
    }

    return null;
  }

  // =========================================
  // 13. SIMPAN ATURAN KATEGORI
  // =========================================

  async function saveCategoryRule() {
    const type = categoryTransactionType.value;
    const category = categoryNameSelect.value;
    const reportClass = reportClassSelect.value;

    if (!category || !reportClass) {
      showCategoryMessage(
        "Silakan pilih kategori transaksi dan kelompok laporan."
      );
      return;
    }

    saveCategoryButton.disabled = true;
    saveCategoryButton.textContent = "Menyimpan...";

    try {
      const { error } = await supabase
        .from("profit_loss_category_rules")
        .upsert({
          owner_id: currentUser.id,
          transaction_type: type,
          category_name: category,
          report_class: reportClass
        }, {
          onConflict: "owner_id,transaction_type,category_name"
        });

      if (error) throw error;

      await loadCategoryRules();

      renderCategoryRules();
      renderReport();

      showCategoryMessage(
        "Pengaturan kategori berhasil disimpan.",
        true
      );

    } catch (error) {
      console.error("Gagal menyimpan kategori:", error);

      showCategoryMessage(
        "Kategori gagal disimpan. Periksa struktur tabel dan aturan unik Supabase."
      );

    } finally {
      saveCategoryButton.disabled = false;
      saveCategoryButton.textContent = "Simpan Kategori";
    }
  }

  // =========================================
  // 14. TAMPILKAN ATURAN KATEGORI
  // =========================================

  function renderCategoryRules() {
    if (!categoryRulesList) return;

    if (categoryRules.length === 0) {
      categoryRulesList.innerHTML = `
        <tr>
          <td colspan="4" class="empty-row">
            Belum ada kategori yang diatur.
          </td>
        </tr>
      `;
      return;
    }

    categoryRulesList.innerHTML = categoryRules.map(rule => `
      <tr>
        <td>${rule.transaction_type === "pemasukan"
          ? "Pemasukan"
          : "Pengeluaran"}</td>

        <td>${escapeHTML(rule.category_name)}</td>

        <td>${escapeHTML(
          REPORT_LABELS[rule.report_class] || rule.report_class
        )}</td>

        <td>
          <button
            type="button"
            class="profit-btn secondary delete-category-rule"
            data-id="${escapeHTML(rule.id)}"
          >
            Hapus
          </button>
        </td>
      </tr>
    `).join("");
  }

  async function deleteCategoryRule(id) {
    if (!confirm("Hapus pengaturan kategori ini?")) return;

    try {
      const { error } = await supabase
        .from("profit_loss_category_rules")
        .delete()
        .eq("id", id)
        .eq("owner_id", currentUser.id);

      if (error) throw error;

      await loadCategoryRules();

      renderCategoryRules();
      renderReport();

      showCategoryMessage(
        "Pengaturan kategori berhasil dihapus.",
        true
      );

    } catch (error) {
      console.error("Gagal menghapus kategori:", error);

      showCategoryMessage(
        "Pengaturan kategori gagal dihapus."
      );
    }
  }

  // =========================================
  // 15. FORMAT TOTAL
  // =========================================

  function calculateTotal(transactions) {
    return transactions.reduce((total, transaction) => {
      return total + (Number(transaction.amount) || 0);
    }, 0);
  }

  function groupByCategory(transactions) {
    const groups = {};

    transactions.forEach(transaction => {
      const category =
        String(transaction.category || "").trim() || "Tanpa Kategori";

      if (!groups[category]) {
        groups[category] = 0;
      }

      groups[category] += Number(transaction.amount) || 0;
    });

    return Object.entries(groups)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }

  function setValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = formatRupiah(value);
    }
  }
  function setReportRowVisibility(id, shouldShow) {
  const element = document.getElementById(id);
  const row = element?.closest("tr");

  if (row) {
    row.style.display = shouldShow ? "" : "none";
  }
}
  // =========================================
  // 16. RINCIAN BEBAN OPERASIONAL
  // =========================================

  function renderOperatingExpenses(transactions) {
    const element = document.getElementById("operatingExpenseDetails");

    const groups = groupByCategory(transactions);

    if (groups.length === 0) {
      element.innerHTML = `
        <tr>
          <td colspan="2" class="empty-row">
            Belum ada beban operasional.
          </td>
        </tr>
      `;
      return;
    }

    element.innerHTML = groups.map(group => `
      <tr>
        <td>${escapeHTML(group.category)}</td>
        <td>${formatRupiahPengurang(group.total)}</td>
      </tr>
    `).join("");
  }

  // =========================================
  // 17. PENDAPATAN LAIN
  function ensureOtherIncomeRow() {
  const grossSalesElement = document.getElementById("grossSales");

  if (!grossSalesElement) return;

  if (document.getElementById("otherIncome")) return;

  const grossSalesRow = grossSalesElement.closest("tr");

  grossSalesRow.insertAdjacentHTML("afterend", `
    <tr id="otherIncomeRow" style="display: none;">
      <td>Pendapatan Lain-lain</td>
      <td id="otherIncome">Rp0</td>
    </tr>
  `);
}

  // =========================================
  // 18. RIWAYAT TRANSAKSI
  // =========================================

  function renderTransactionHistory(transactions) {
    if (transactions.length === 0) {
      transactionHistory.innerHTML = `
        <tr>
          <td colspan="5" class="empty-row">
            Belum ada transaksi pada periode ini.
          </td>
        </tr>
      `;
      return;
    }

    transactionHistory.innerHTML = transactions.map(transaction => {
      const type = String(transaction.transaction_type || "")
        .trim()
        .toLowerCase();

      const typeLabel = type === "pemasukan"
        ? "Pemasukan"
        : type === "pengeluaran"
          ? "Pengeluaran"
          : "Tidak dikenali";

      const typeClass = type === "pemasukan"
        ? "income"
        : type === "pengeluaran"
          ? "expense"
          : "unknown";

      return `
        <tr>
          <td>${formatDate(transaction.transaction_date)}</td>

          <td>${escapeHTML(
            transaction.description || "-"
          )}</td>

          <td>${escapeHTML(
            transaction.category || "Tanpa Kategori"
          )}</td>

          <td>
            <span class="transaction-type ${typeClass}">
              ${typeLabel}
            </span>
          </td>

          <td>${formatRupiah(transaction.amount)}</td>
        </tr>
      `;
    }).join("");
  }

  // =========================================
  // 19. PERHITUNGAN LABA RUGI
  // =========================================

  function renderReport() {
    const { start, end, label } = getDateRange();

    if (
      periodFilter.value === "custom" &&
      (!start || !end)
    ) {
      showMessage("Silakan tentukan tanggal awal dan tanggal akhir.");
      return;
    }

    if (start && end && start > end) {
      showMessage("Tanggal awal tidak boleh melebihi tanggal akhir.");
      return;
    }

    hideMessage();

    const filteredTransactions = allTransactions.filter(transaction => {
      const date = transaction.transaction_date;

      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;

      return true;
    });

    // Kelompokkan berdasarkan aturan kategori.

    const classified = filteredTransactions.map(transaction => ({
      ...transaction,
      reportClass: getReportClass(transaction)
    }));

    const sumClass = reportClass => {
      return calculateTotal(
        classified.filter(item => item.reportClass === reportClass)
      );
    };

   // A. PENDAPATAN

const grossSales = sumClass("penjualan");
const otherIncome = sumClass("pendapatan_lain");

// Kompatibilitas dengan pemanggilan kode lama
const salesReturns = 0;
const salesDiscount = 0;
const netSales = grossSales;

// B. HARGA POKOK PENJUALAN

const grossPurchases = sumClass("pembelian_barang");

// Kompatibilitas dengan pemanggilan kode lama
const purchaseReturns = 0;
const purchaseDiscount = 0;
const netPurchases = grossPurchases;

const opening = currentInventory.opening;
const closing = currentInventory.closing;

const goodsAvailable = opening + grossPurchases;

const costOfGoodsSold = goodsAvailable - closing;
    // C. LABA KOTOR

    const grossProfit = netSales - costOfGoodsSold;

    // D. BEBAN OPERASIONAL

    const operatingTransactions = classified.filter(
      item => item.reportClass === "beban_operasional"
    );

    const totalOperatingExpenses =
      calculateTotal(operatingTransactions);

    // E. LABA BERSIH
   // PERHITUNGAN SEDERHANA TANPA PERSEDIAAN

const totalCashIncome = calculateTotal(
  filteredTransactions.filter(transaction =>
    String(transaction.transaction_type || "")
      .trim()
      .toLowerCase() === "pemasukan"
  )
);

const totalCashExpense = calculateTotal(
  filteredTransactions.filter(transaction =>
    String(transaction.transaction_type || "")
      .trim()
      .toLowerCase() === "pengeluaran"
  )
);

const simpleNetResult = totalCashIncome - totalCashExpense;

// HASIL AKHIR
const finalNetProfit = inventoryConfigured
  ? grossProfit + otherIncome - totalOperatingExpenses
  : simpleNetResult;
  ensureOtherIncomeRow();
    // CEK KETERSEDIAAN PENCATATAN
const hasReportClass = (reportClass) =>
  classified.some(item => item.reportClass === reportClass);

const hasSalesActivity =
  hasReportClass("penjualan") ||
  hasReportClass("retur_penjualan") ||
  hasReportClass("potongan_penjualan");

const hasPurchaseActivity =
  hasReportClass("pembelian_barang") ||
  hasReportClass("retur_pembelian") ||
  hasReportClass("potongan_pembelian");

// A. PENDAPATAN
setReportRowVisibility("grossSales", hasReportClass("penjualan"));
// PENDAPATAN LAIN
setReportRowVisibility(
  "otherIncome",
  hasReportClass("pendapatan_lain")
);
setReportRowVisibility("salesReturns", hasReportClass("retur_penjualan"));
setReportRowVisibility("salesDiscount", hasReportClass("potongan_penjualan"));
setReportRowVisibility("netSales", hasSalesActivity);

// B. HARGA POKOK PENJUALAN
setReportRowVisibility("openingInventoryValue", inventoryConfigured);
setReportRowVisibility("grossPurchases", hasReportClass("pembelian_barang"));
setReportRowVisibility("purchaseReturns", hasReportClass("retur_pembelian"));
setReportRowVisibility("purchaseDiscount", hasReportClass("potongan_pembelian"));
setReportRowVisibility("netPurchases", hasPurchaseActivity);

setReportRowVisibility("goodsAvailable", inventoryConfigured);
setReportRowVisibility("closingInventoryValue", inventoryConfigured);
setReportRowVisibility("costOfGoodsSold", inventoryConfigured);

// C. LABA KOTOR
setReportRowVisibility(
  "grossProfit",
  hasSalesActivity && inventoryConfigured
);

// D. BEBAN OPERASIONAL
setReportRowVisibility(
  "totalOperatingExpenses",
  operatingTransactions.length > 0
);
    // =====================================
    // TAMPILKAN NILAI LAPORAN
    // =====================================
    
    setValue("grossSales", grossSales);
    setValue("reportTotalIncome", netSales + otherIncome);
    setValue("salesReturns", salesReturns);
    setValue("salesDiscount", salesDiscount);
    setValue("netSales", netSales);

    setValue("openingInventoryValue", opening);
    setValue("grossPurchases", grossPurchases);
    setValue("purchaseReturns", purchaseReturns);
    setValue("purchaseDiscount", purchaseDiscount);
    setValue("netPurchases", netPurchases);
    setValue("goodsAvailable", goodsAvailable);
    const closingInventoryElement =
  document.getElementById("closingInventoryValue");

if (closingInventoryElement) {
  closingInventoryElement.textContent =
    formatRupiahPengurang(closing);
}

const hppElement =
  document.getElementById("costOfGoodsSold");

if (hppElement) {
  hppElement.textContent =
    formatRupiahPengurang(costOfGoodsSold);
}

    setValue("grossProfit", grossProfit);
    setValue("otherIncome", otherIncome);
    const operatingExpenseTotalElement =
  document.getElementById("totalOperatingExpenses");
  if (operatingExpenseTotalElement) {
  operatingExpenseTotalElement.textContent =
    formatRupiahPengurang(totalOperatingExpenses);
}
    if (finalNetProfit === null) {
    const profitElement = document.getElementById("finalNetProfit");

    if (profitElement) {
      profitElement.textContent = "Belum tersedia";
    }
  } else {
    setValue("finalNetProfit", finalNetProfit);
  }

    // =====================================
    // RINGKASAN
    // =====================================
   const totalIncome = netSales + otherIncome;

const totalExpense = calculateTotal(
  filteredTransactions.filter(transaction =>
    String(transaction.transaction_type || "")
      .trim()
      .toLowerCase() === "pengeluaran"
  )
);

    totalIncomeElement.textContent = formatRupiah(totalIncome);
    const reportTotalIncomeElement =
  document.getElementById("reportTotalIncome");

if (reportTotalIncomeElement) {
  reportTotalIncomeElement.textContent =
    formatRupiah(totalIncome);
}
    totalExpenseElement.textContent =
      totalExpense === null
        ? "Belum tersedia"
        : formatRupiah(totalExpense);
    netProfitElement.textContent =
    finalNetProfit === null
      ? "Belum tersedia"
      : formatRupiah(finalNetProfit);

  netProfitElement.style.color =
   finalNetProfit === null
    ? "#888888"
    : finalNetProfit < 0
      ? "#d56b48"
      : "#087653";

  if (profitStatusElement) {
  if (finalNetProfit === null) {
    profitStatusElement.textContent =
      "Lengkapi data persediaan untuk mengetahui laba/rugi bersih";
  } else if (finalNetProfit > 0) {
    profitStatusElement.textContent = "Usaha memperoleh laba";
  } else if (finalNetProfit < 0) {
    profitStatusElement.textContent = "Usaha mengalami kerugian";
  } else {
    profitStatusElement.textContent =
      "Pendapatan dan pengeluaran seimbang";
  }
}
// PEMBEDA WARNA LABA DAN RUGI

const resultClass = finalNetProfit > 0
  ? "result-positive"
  : finalNetProfit < 0
    ? "result-negative"
    : "result-neutral";

const finalProfitElement =
  document.getElementById("finalNetProfit");

const finalProfitRow =
  finalProfitElement?.closest("tr");

const resultElements = [
  netProfitElement,
  profitStatusElement,
  finalProfitElement,
  finalProfitRow
];

resultElements.filter(Boolean).forEach(element => {
  element.classList.remove(
    "result-positive",
    "result-negative",
    "result-neutral"
  );

  element.classList.add(resultClass);
});
    // =====================================
    // BEBAN DAN RIWAYAT
    // =====================================

    renderOperatingExpenses(operatingTransactions);

    renderTransactionHistory(filteredTransactions);

    if (reportPeriodLabel) {
      reportPeriodLabel.textContent = `Periode: ${label}`;
    }

    // =====================================
    // PERINGATAN KATEGORI
    // =====================================

    const unmapped = [];

    classified.forEach(transaction => {
      const type = String(transaction.transaction_type || "")
        .trim()
        .toLowerCase();

      const key = getRuleKey(type, transaction.category);

      const hasRule = categoryRules.some(rule =>
        getRuleKey(rule.transaction_type, rule.category_name) === key
      );

      const categoryName = transaction.category || "Tanpa Kategori";

      if (
        !hasRule &&
        !unmapped.some(item =>
          item.type === type && item.category === categoryName
        )
      ) {
        unmapped.push({
          type,
          category: categoryName
        });
      }
    });

    if (unmapped.length > 0) {
      const names = unmapped
        .slice(0, 4)
        .map(item => item.category)
        .join(", ");

      showMessage(
        `Perhatian: kategori berikut belum diatur: ${names}. Untuk sementara, pemasukan dihitung sebagai penjualan dan pengeluaran sebagai beban operasional. Silakan sesuaikan di Pengaturan Kategori Laporan.`
      );
    }

    if (costOfGoodsSold < 0) {
      showMessage(
        "Perhatian: persediaan akhir lebih besar daripada barang yang tersedia untuk dijual. Periksa kembali nilai persediaan dan pembelian."
      );
    }
  }

  // =========================================
  // 20. CETAK LAPORAN
  // =========================================

  function preparePrintStyle() {
    if (document.getElementById("profitPrintStyle")) return;

    const style = document.createElement("style");
    style.id = "profitPrintStyle";

    style.textContent = `
      @media print {
        body {
          background: #ffffff !important;
          color: #222222 !important;
        }

        .profit-page {
          width: 100% !important;
          max-width: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .profit-header.no-print {
          display: block !important;
        }

        .profit-header-actions,
        .profit-back,
        .profit-filter,
        .inventory-settings,
        .category-settings,
        #reportMessage,
        #inventoryMessage,
        #categoryMessage {
          display: none !important;
        }

        .profit-report-card,
        .profit-summary-card {
          box-shadow: none !important;
          break-inside: avoid;
        }

        .profit-table-wrapper {
          overflow: visible !important;
        }

        .profit-table {
          width: 100% !important;
          min-width: 0 !important;
        }

        .profit-footer {
          display: block !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  if (printButton) {
    printButton.addEventListener("click", () => {
      preparePrintStyle();
      window.print();
    });
  }

  // =========================================
  // 21. UNDUH PDF
  // =========================================

  async function downloadPDF() {
    if (typeof window.html2pdf !== "function") {
      showMessage(
        "Fitur PDF belum termuat. Periksa koneksi internet atau gunakan Cetak Laporan lalu pilih Simpan sebagai PDF."
      );
      return;
    }

    downloadButton.disabled = true;
    downloadButton.textContent = "Menyiapkan PDF...";

    try {
      const original = document.getElementById("reportContent");
      const clone = original.cloneNode(true);

      clone.removeAttribute("id");

      clone.querySelector(".profit-header")?.classList.remove("no-print");

      const removeSelectors = [
        ".profit-header-actions",
        ".profit-back",
        ".profit-filter",
        ".inventory-settings",
        ".category-settings",
        "#reportMessage",
        "#inventoryMessage",
        "#categoryMessage",
        ".profit-footer"
      ];

      removeSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(element => {
          element.remove();
        });
      });

      clone.querySelectorAll("[hidden]").forEach(element => {
        element.remove();
      });

      const wrapper = document.createElement("div");

      wrapper.style.background = "#ffffff";
      wrapper.style.color = "#222222";
      wrapper.style.width = "190mm";
      wrapper.style.padding = "8mm";
      wrapper.style.boxSizing = "border-box";

      clone.style.width = "100%";
      clone.style.maxWidth = "none";
      clone.style.padding = "0";
      clone.style.margin = "0";

      wrapper.appendChild(clone);

      const dateName = getLocalDateString(new Date());

      const options = {
        margin: [8, 8, 8, 8],
        filename: `Laporan-Laba-Rugi-${dateName}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff"
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait"
        },
        pagebreak: {
          mode: ["css", "legacy"]
        }
      };

      await window.html2pdf()
        .set(options)
        .from(wrapper)
        .save();

    } catch (error) {
      console.error("Gagal membuat PDF:", error);

      showMessage(
        "PDF gagal dibuat. Silakan coba kembali atau gunakan fitur Cetak Laporan."
      );

    } finally {
      downloadButton.disabled = false;
      downloadButton.textContent = "↓ Unduh PDF";
    }
  }

  if (downloadButton) {
    downloadButton.addEventListener("click", downloadPDF);
  }

  // =========================================
  // 22. EVENT PENGATURAN PERSEDIAAN
  // =========================================

  if (saveInventoryButton) {
    saveInventoryButton.addEventListener("click", saveInventory);
  }

  // =========================================
  // 23. EVENT KATEGORI
  // =========================================

  if (categoryTransactionType) {
    categoryTransactionType.addEventListener("change", () => {
      populateCategorySelect();
    });
  }

  if (saveCategoryButton) {
    saveCategoryButton.addEventListener("click", saveCategoryRule);
  }

  if (categoryRulesList) {
    categoryRulesList.addEventListener("click", event => {
      const button = event.target.closest(".delete-category-rule");

      if (!button) return;

      deleteCategoryRule(button.dataset.id);
    });
  }

  // =========================================
  // 24. EVENT FILTER
  // =========================================

  async function updatePeriod() {
    hideMessage();

    try {
      await loadInventory();
      renderReport();
    } catch (error) {
      console.error("Gagal memuat persediaan periode:", error);
      showMessage("Gagal memuat data persediaan periode ini.");
    }
  }

  periodFilter.addEventListener("change", async () => {
    const isCustom = periodFilter.value === "custom";

    if (customDateFilter) {
      customDateFilter.hidden = !isCustom;
    }

    if (!isCustom) {
      await updatePeriod();
    }
  });

  if (applyDateButton) {
    applyDateButton.addEventListener("click", updatePeriod);
  }

  // =========================================
  // 25. REFRESH
  // =========================================

  if (refreshButton) {
    refreshButton.addEventListener("click", loadTransactions);
  }

  // =========================================
  // 26. MUAT DATA PERTAMA KALI
  // =========================================

  await loadTransactions();

  renderCategoryRules();

});
