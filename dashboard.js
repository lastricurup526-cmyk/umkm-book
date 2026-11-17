import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", async () => {

  // CEK LOGIN
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    window.location.replace("index.html");
    return;
  }

  const user = data.session.user;

  // FORMAT RUPIAH
  function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // =====================================
  // MENU NAVIGASI
  // =====================================

  const sidebar = document.querySelector(".sidebar");
  const menuButton = document.getElementById("mobileMenuButton");
  const closeButton = document.getElementById("mobileMenuClose");

  function openMenu() {
    sidebar.classList.add("mobile-open");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    sidebar.classList.remove("mobile-open");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (sidebar && menuButton && closeButton) {
    menuButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", closeMenu);

    sidebar.querySelectorAll(".menu-link").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 650) closeMenu();
    });
  }

  // =====================================
  // LOGOUT
  // =====================================

  const logoutButton = document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", async event => {
      event.preventDefault();

      const konfirmasi = confirm(
        "Apakah Anda yakin ingin keluar dari akun?"
      );

      if (!konfirmasi) return;

      const { error } = await supabase.auth.signOut();

      if (error) {
        alert("Gagal keluar dari akun: " + error.message);
        return;
      }

      window.location.replace("index.html");
    });
  }

  // =====================================
  // TOTAL MODAL
  // =====================================

  const { data: modalEntries, error: modalError } = await supabase
    .from("modal_entries")
    .select("amount")
    .eq("owner_id", user.id);

  if (modalError) {
    console.error("Gagal mengambil total modal:", modalError);
  } else {
    const totalCapital = (modalEntries || []).reduce(
      (total, item) => total + Number(item.amount),
      0
    );

    document.getElementById("totalCapital").textContent =
      formatCurrency(totalCapital);
  }

  // =====================================
  // PEMASUKAN DAN PENGELUARAN
  // =====================================
  const { data: transactions, error: transactionError } = await supabase
  .from("transactions")
  .select("id, transaction_type, amount, transaction_date, category, description")
  .eq("owner_id", user.id)
  .order("transaction_date", { ascending: false });
   if (transactionError) {
    console.error("Gagal mengambil data transaksi:", transactionError);
  } else {
    const entries = transactions || [];

    const totalIncome = entries
      .filter(item => item.transaction_type === "pemasukan")
      .reduce((total, item) => total + Number(item.amount), 0);

    const totalExpenses = entries
      .filter(item => item.transaction_type === "pengeluaran")
      .reduce((total, item) => total + Number(item.amount), 0);

    const totalProfit = totalIncome - totalExpenses;

    document.getElementById("totalIncome").textContent =
      formatCurrency(totalIncome);

    document.getElementById("totalExpenses").textContent =
      formatCurrency(totalExpenses);

    document.getElementById("totalProfit").textContent =
      formatCurrency(totalProfit);
  }

  // =====================================
  // AKTIVITAS TERBARU
  // =====================================

function renderRecentTransactions(entries) {
  const container = document.getElementById("recentTransactions");

  if (!container) return;

  container.innerHTML = "";

  const recentEntries = [...(entries || [])]
    .sort((a, b) => {
      return new Date(b.transaction_date) - new Date(a.transaction_date);
    })
    .slice(0, 5);

  if (recentEntries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.className = "transaction-empty";
    cell.textContent = "Belum ada transaksi.";

    row.appendChild(cell);
    container.appendChild(row);
    return;
  }

  recentEntries.forEach(item => {
    const row = document.createElement("tr");

    // NAMA TRANSAKSI
    const nameCell = document.createElement("td");

    const name = document.createElement("strong");
    name.className = "table-transaction-name";
    name.textContent = item.description || item.category || "Transaksi";

    const code = document.createElement("small");
    code.className = "table-transaction-code";
    code.textContent = item.id.slice(0, 7).toUpperCase();

    nameCell.append(name, code);

    // KATEGORI
    const categoryCell = document.createElement("td");
    categoryCell.textContent = item.category || "-";

    // TANGGAL
    const dateCell = document.createElement("td");
    dateCell.textContent = new Date(
      item.transaction_date + "T00:00:00"
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    // JENIS TRANSAKSI
    const typeCell = document.createElement("td");
    const typeBadge = document.createElement("span");

    const isIncome = item.transaction_type === "pemasukan";

    typeBadge.className = isIncome
      ? "transaction-type-badge income"
      : "transaction-type-badge expense";

    typeBadge.textContent = isIncome
      ? "Pemasukan"
      : "Pengeluaran";

    typeCell.appendChild(typeBadge);

    // JUMLAH
    const amountCell = document.createElement("td");
    const amount = document.createElement("strong");

    amount.className = isIncome
      ? "table-transaction-amount income"
      : "table-transaction-amount expense";

    amount.textContent =
      `${isIncome ? "+" : "-"}${formatCurrency(item.amount)}`;

    amountCell.appendChild(amount);

    row.append(
      nameCell,
      categoryCell,
      dateCell,
      typeCell,
      amountCell
    );

    container.appendChild(row);
  });
}

  renderRecentTransactions(transactions || []);

// =====================================
// GRAFIK ARUS KEUANGAN 7 HARI
// =====================================

function renderFinanceChart(entries, period = "month") {
  const chartContainer = document.getElementById("financeChartBars");

  if (!chartContainer) return;
  // ATUR LEBAR GRAFIK SESUAI PERIODE
  const chartWrapper = chartContainer.parentElement;

  chartWrapper.style.overflowX = "auto";
  chartWrapper.style.overflowY = "hidden";

  if (period === "month") {
    chartContainer.style.minWidth = "1900px";
  } else if (period === "year") {
    chartContainer.style.minWidth = "900px";
  } else {
    chartContainer.style.minWidth = "100%";
  }
  const today = new Date();
  const dailyData = [];

  // MINGGU INI: Senin sampai Minggu
 if (period === "week") {
  const monday = new Date(today);
  const dayOfWeek = monday.getDay();
  const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  monday.setDate(monday.getDate() + difference);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");

    dailyData.push({
      date: dateKey,
      label: date.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric"
      }).replace(".", ""),
      income: 0,
      expense: 0
    });
  }
}

// BULAN INI: Tanggal 1 sampai akhir bulan
else if (period === "month") {
  
    const year = today.getFullYear();
    const month = today.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= totalDays; i++) {
      const dateKey = [
        year,
        String(month + 1).padStart(2, "0"),
        String(i).padStart(2, "0")
      ].join("-");

      dailyData.push({
        date: dateKey,
        label: `${i} ${today.toLocaleDateString("id-ID", {
        month: "short"
      })}`,
        income: 0,
        expense: 0
      });
    }
  }

  // TAHUN INI: Januari sampai Desember
  else if (period === "year") {
    for (let i = 0; i < 12; i++) {
      dailyData.push({
        date: `${today.getFullYear()}-${String(i + 1).padStart(2, "0")}`,
        label: new Date(today.getFullYear(), i, 1)
          .toLocaleDateString("id-ID", { month: "short" }),
        income: 0,
        expense: 0
      });
    }
  }

  // KELOMPOKKAN TRANSAKSI
  entries.forEach(item => {
    const transactionDate = item.transaction_date;

    const target = dailyData.find(data => {
      if (period === "year") {
        return data.date === transactionDate.slice(0, 7);
      }

      return data.date === transactionDate;
    });

    if (!target) return;

    if (item.transaction_type === "pemasukan") {
      target.income += Number(item.amount);
    } else if (item.transaction_type === "pengeluaran") {
      target.expense += Number(item.amount);
    }
  });

  const maxAmount = Math.max(
    ...dailyData.map(day => Math.max(day.income, day.expense)),
    1
  );

  chartContainer.innerHTML = "";

  dailyData.forEach(day => {
    const dayElement = document.createElement("div");
    dayElement.className = "chart-day";

    const columns = document.createElement("div");
    columns.className = "chart-columns";

    const incomeBar = document.createElement("div");
    incomeBar.className = "chart-bar income";
   // BATANG PEMASUKAN
incomeBar.style.height = day.income > 0
  ? `${Math.max((day.income / maxAmount) * 100, 3)}%`
  : "0%";

incomeBar.style.display = day.income > 0 ? "block" : "none";
incomeBar.title = `Pemasukan: ${formatCurrency(day.income)}`;

// BATANG PENGELUARAN
const expenseBar = document.createElement("div");
expenseBar.className = "chart-bar expense";

expenseBar.style.height = day.expense > 0
  ? `${Math.max((day.expense / maxAmount) * 100, 3)}%`
  : "0%";

expenseBar.style.display = day.expense > 0 ? "block" : "none";
expenseBar.title = `Pengeluaran: ${formatCurrency(day.expense)}`;

    columns.append(incomeBar, expenseBar);

    const label = document.createElement("span");
    label.className = "chart-day-label";
    label.textContent = day.label;

    dayElement.append(columns, label);
    chartContainer.appendChild(dayElement);
  });
}
// TAMPILKAN GRAFIK AWAL
const chartPeriod = document.getElementById("chartPeriod");

renderFinanceChart(transactions || [], chartPeriod?.value || "month");

// UBAH GRAFIK SESUAI PILIHAN PERIODE
chartPeriod?.addEventListener("change", () => {
  renderFinanceChart(transactions || [], chartPeriod.value);
});
  // =====================================
  // PROFIL USAHA
  // =====================================

  const businessNameElement = document.getElementById("businessName");
  const businessAvatar = document.getElementById("businessAvatar");
  const topbarAvatar = document.getElementById("topbarAvatar");
  function getOwnerInitials(name) {
  if (!name || !name.trim()) return "U";

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("business_name, owner_name, photo_url")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    console.error("Gagal memuat profil usaha:", businessError);
  } else if (business) {

    if (business.business_name) {
      businessNameElement.textContent = business.business_name;
    }
    const ownerInitials = getOwnerInitials(business.owner_name);

    businessAvatar.textContent = ownerInitials;
    topbarAvatar.textContent = ownerInitials;

    if (business.photo_url) {
      const img = document.createElement("img");

      img.src = business.photo_url;
      img.alt = "Foto Profil Usaha";

      img.onerror = () => {
        img.remove();
        businessAvatar.textContent = "U";
      };

      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.borderRadius = "inherit";
      img.style.display = "block";

      businessAvatar.textContent = "";
      businessAvatar.appendChild(img);
      if (topbarAvatar) {
  const topbarImg = document.createElement("img");

  topbarImg.src = business.photo_url;
  topbarImg.alt = "Foto Profil Pemilik Usaha";

  topbarImg.onerror = () => {
    topbarImg.remove();
    topbarAvatar.textContent = ownerInitials;
  };

  topbarImg.style.width = "100%";
  topbarImg.style.height = "100%";
  topbarImg.style.objectFit = "cover";
  topbarImg.style.borderRadius = "inherit";
  topbarImg.style.display = "block";

  topbarAvatar.textContent = "";
  topbarAvatar.appendChild(topbarImg);
}
    }
  }

  console.log("Dashboard UMKM BOOK berhasil diakses.");

});
