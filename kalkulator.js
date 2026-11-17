
/* =========================================
   UMKM BOOK — SISTEM KALKULATOR
   Uang | Diskon | Belanja | Keuntungan
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  // ELEMENT UTAMA
  const calculatorHome = document.getElementById("calculatorHome");
  const calculatorWorkspace = document.getElementById("calculatorWorkspace");
  const calculatorTitle = document.getElementById("calculatorTitle");
  const calculatorDescription = document.getElementById("calculatorDescription");
  const calculatorFormArea = document.getElementById("calculatorFormArea");
  const backCalculator = document.getElementById("backCalculator");
  const calculatorCards = document.querySelectorAll(".calculator-card");

  // FORMAT RUPIAH
  function formatRupiah(value) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  // AMBIL NILAI ANGKA
  function getNumber(id) {
    const element = document.getElementById(id);
    return element ? Number(element.value) || 0 : 0;
  }

  // TAMPILKAN HASIL
  function showResult(id, content) {
    const result = document.getElementById(id);
    if (result) {
      result.innerHTML = content;
      result.hidden = false;
    }
  }

  // KEMBALI KE MENU UTAMA
  function showHome() {
    calculatorWorkspace.hidden = true;
    calculatorHome.hidden = false;
    calculatorFormArea.innerHTML = "";
  }

  // BUKA KALKULATOR
  function openCalculator(type) {

    const calculators = {
      uang: {
        title: "Kalkulator Uang",
        description: "Lakukan perhitungan uang dengan mudah.",
        render: renderUang
      },
      diskon: {
        title: "Kalkulator Diskon",
        description: "Hitung potongan harga dan harga setelah diskon.",
        render: renderDiskon
      },
      belanja: {
        title: "Kalkulator Belanja",
        description: "Hitung total belanja dari daftar barang.",
        render: renderBelanja
      },
      keuntungan: {
        title: "Kalkulator Keuntungan",
        description: "Hitung modal, pendapatan, laba, dan margin.",
        render: renderKeuntungan
      }
    };

    const selected = calculators[type];

    if (!selected) return;

    calculatorHome.hidden = true;
    calculatorWorkspace.hidden = false;

    calculatorTitle.textContent = selected.title;
    calculatorDescription.textContent = selected.description;

    selected.render();
  }

  // EVENT MENU KALKULATOR
  calculatorCards.forEach(card => {
    card.addEventListener("click", () => {
      openCalculator(card.dataset.calculator);
    });
  });

  // EVENT KEMBALI
  backCalculator.addEventListener("click", showHome);

/* =========================================
   1. KALKULATOR UANG — DIGITAL CALCULATOR
========================================= */
function renderUang() {

  calculatorFormArea.innerHTML = `
    <div class="calculator-feature money-calculator">

      <div class="calculator-feature-header">
        <h2>Kalkulator Uang</h2>
        <p>Kalkulator digital untuk perhitungan sehari-hari.</p>
      </div>

      <div class="money-calculator-body">

        <div class="money-display">
          <div class="money-history" id="moneyHistory"></div>
          <div class="money-screen" id="moneyScreen">0</div>
        </div>

        <div class="money-keypad">

          <button type="button" class="money-key utility" data-key="AC">AC</button>
          <button type="button" class="money-key utility" data-key="sign">±</button>
          <button type="button" class="money-key utility" data-key="%">%</button>
          <button type="button" class="money-key operator" data-key="/">÷</button>

          <button type="button" class="money-key" data-key="7">7</button>
          <button type="button" class="money-key" data-key="8">8</button>
          <button type="button" class="money-key" data-key="9">9</button>
          <button type="button" class="money-key operator" data-key="*">×</button>

          <button type="button" class="money-key" data-key="4">4</button>
          <button type="button" class="money-key" data-key="5">5</button>
          <button type="button" class="money-key" data-key="6">6</button>
          <button type="button" class="money-key operator" data-key="-">−</button>

          <button type="button" class="money-key" data-key="1">1</button>
          <button type="button" class="money-key" data-key="2">2</button>
          <button type="button" class="money-key" data-key="3">3</button>
          <button type="button" class="money-key operator" data-key="+">+</button>

          <button type="button" class="money-key utility" data-key="backspace">⌫</button>
          <button type="button" class="money-key" data-key="0">0</button>
          <button type="button" class="money-key" data-key=".">.</button>
          <button type="button" class="money-key equals" data-key="=">=</button>

        </div>

      </div>
    </div>
  `;

  initializeMoneyCalculator();
}

/* =========================================
   LOGIKA KALKULATOR UANG
========================================= */

function initializeMoneyCalculator() {

  const screen = document.getElementById("moneyScreen");
  const history = document.getElementById("moneyHistory");
  const keypad = document.querySelector(".money-keypad");

  let currentValue = "0";
  let previousValue = null;
  let currentOperator = null;
  let waitingForOperand = false;
  let finishedCalculation = false;

  function formatDisplay(value) {

    const parts = String(value).split(".");
    const integerPart = Number(parts[0]).toLocaleString("id-ID");

    return parts.length > 1
      ? integerPart + "," + parts[1]
      : integerPart;
  }

  function updateDisplay() {
    screen.textContent = formatDisplay(currentValue);
  }

  function clearAll() {
    currentValue = "0";
    previousValue = null;
    currentOperator = null;
    waitingForOperand = false;
    finishedCalculation = false;
    history.textContent = "";
    updateDisplay();
  }

  function inputNumber(number) {

    if (finishedCalculation) {
      currentValue = number;
      finishedCalculation = false;
    } else if (waitingForOperand) {
      currentValue = number;
      waitingForOperand = false;
    } else {
      currentValue = currentValue === "0"
        ? number
        : currentValue + number;
    }

    updateDisplay();
  }

  function inputDecimal() {

    if (finishedCalculation) {
      currentValue = "0.";
      finishedCalculation = false;
    } else if (waitingForOperand) {
      currentValue = "0.";
      waitingForOperand = false;
    } else if (!currentValue.includes(".")) {
      currentValue += ".";
    }

    updateDisplay();
  }

  function calculate(first, second, operator) {

    switch (operator) {
      case "+":
        return first + second;

      case "-":
        return first - second;

      case "*":
        return first * second;

      case "/":
        if (second === 0) return null;
        return first / second;

      default:
        return second;
    }
  }

  function formatResult(value) {

    if (!Number.isFinite(value)) return "Error";

    return String(Number(value.toPrecision(12)));
  }

  function chooseOperator(operator) {

    const inputValue = Number(currentValue);

    if (currentOperator && !waitingForOperand) {

      const result = calculate(
        previousValue,
        inputValue,
        currentOperator
      );

      if (result === null || !Number.isFinite(result)) {
        currentValue = "Error";
        updateDisplay();
        previousValue = null;
        currentOperator = null;
        waitingForOperand = true;
        return;
      }

      currentValue = formatResult(result);
      previousValue = result;

    } else {
      previousValue = inputValue;
    }

    currentOperator = operator;
    waitingForOperand = true;
    finishedCalculation = false;

    history.textContent =
      formatDisplay(previousValue) + " " + operator;

    updateDisplay();
  }

  function performCalculation() {

    if (currentOperator === null || waitingForOperand) return;

    const first = previousValue;
    const second = Number(currentValue);
    const operator = currentOperator;

    const result = calculate(first, second, operator);

    if (result === null || !Number.isFinite(result)) {
      currentValue = "Error";
      history.textContent = "Tidak dapat membagi dengan nol";
      previousValue = null;
      currentOperator = null;
      waitingForOperand = true;
      updateDisplay();
      return;
    }

    history.textContent =
      formatDisplay(first) + " " +
      operator + " " +
      formatDisplay(second) + " =";

    currentValue = formatResult(result);
    previousValue = null;
    currentOperator = null;
    waitingForOperand = true;
    finishedCalculation = true;

    updateDisplay();
  }

  function deleteLast() {

    if (finishedCalculation || waitingForOperand) {
      return;
    }

    currentValue = currentValue.length > 1
      ? currentValue.slice(0, -1)
      : "0";

    if (currentValue === "-") currentValue = "0";

    updateDisplay();
  }

  function changeSign() {

    if (currentValue === "0" || currentValue === "Error") return;

    currentValue = currentValue.startsWith("-")
      ? currentValue.slice(1)
      : "-" + currentValue;

    finishedCalculation = false;
    updateDisplay();
  }

  function calculatePercentage() {

    if (currentValue === "Error") return;

    const value = Number(currentValue) / 100;

    currentValue = formatResult(value);
    finishedCalculation = false;

    updateDisplay();
  }

  function handleKey(key) {

    if (currentValue === "Error" && key !== "AC") {
      clearAll();
      return;
    }

    if (/^[0-9]$/.test(key)) {
      inputNumber(key);
      return;
    }

    switch (key) {

      case ".":
        inputDecimal();
        break;

      case "AC":
        clearAll();
        break;

      case "backspace":
        deleteLast();
        break;

      case "sign":
        changeSign();
        break;

      case "%":
        calculatePercentage();
        break;

      case "+":
      case "-":
      case "*":
      case "/":
        chooseOperator(key);
        break;

      case "=":
        performCalculation();
        break;
    }
  }

  keypad.addEventListener("click", event => {

    const button = event.target.closest("[data-key]");

    if (!button) return;

    handleKey(button.dataset.key);
  });

  // DUKUNGAN KEYBOARD KOMPUTER
  function handleKeyboard(event) {

    const key = event.key;

    if (/^[0-9]$/.test(key)) {
      handleKey(key);
    } else if (key === ".") {
      handleKey(".");
    } else if (key === "Enter" || key === "=") {
      event.preventDefault();
      handleKey("=");
    } else if (key === "Backspace") {
      handleKey("backspace");
    } else if (key === "Escape") {
      handleKey("AC");
    } else if (["+", "-", "*", "/"].includes(key)) {
      handleKey(key);
    } else if (key === "%") {
      handleKey("%");
    }
  }

  document.addEventListener("keydown", handleKeyboard);

  // Bersihkan event keyboard saat kalkulator ditutup
  const observer = new MutationObserver(() => {
    if (!document.getElementById("moneyScreen")) {
      document.removeEventListener("keydown", handleKeyboard);
      observer.disconnect();
    }
  });

  observer.observe(calculatorFormArea, {
    childList: true,
    subtree: true
  });

  updateDisplay();
}

  /* =========================================
     2. KALKULATOR DISKON
  ========================================= */

  function renderDiskon() {

    calculatorFormArea.innerHTML = `
      <div class="calculator-feature">

        <div class="calculator-feature-header">
          <h2>Hitung Diskon</h2>
          <p>Ketahui jumlah potongan dan harga akhir produk.</p>
        </div>

        <div class="calculator-form">

          <div class="form-group">
            <label for="hargaDiskon">Harga Awal (Rp)</label>
            <input type="number" id="hargaDiskon"
              placeholder="Masukkan harga awal" min="0" step="any">
          </div>

          <div class="form-group">
            <label for="persenDiskon">Diskon (%)</label>
            <input type="number" id="persenDiskon"
              placeholder="Contoh: 20" min="0" max="100" step="any">
          </div>

          <button type="button" class="calculator-submit"
            id="hitungDiskon">
            Hitung Diskon
          </button>

          <div class="calculator-result" id="hasilDiskon" hidden></div>

        </div>
      </div>
    `;
  }

  function calculateDiskon() {

    const priceInput = document.getElementById("hargaDiskon");
    const discountInput = document.getElementById("persenDiskon");

    const price = getNumber("hargaDiskon");
    const discount = getNumber("persenDiskon");

    if (priceInput.value === "" || discountInput.value === "") {
      alert("Silakan lengkapi harga awal dan persentase diskon.");
      return;
    }

    if (price < 0 || discount < 0 || discount > 100) {
      alert("Harga tidak boleh negatif dan diskon harus 0–100%.");
      return;
    }

    const discountAmount = price * discount / 100;
    const finalPrice = price - discountAmount;

    showResult("hasilDiskon", `
      <span class="result-label">Hasil Perhitungan Diskon</span>

      <div class="result-detail">
        <span>Harga awal</span>
        <strong>${formatRupiah(price)}</strong>
      </div>

      <div class="result-detail">
        <span>Potongan (${discount}%)</span>
        <strong>${formatRupiah(discountAmount)}</strong>
      </div>

      <div class="result-total">
        <span>Harga setelah diskon</span>
        <h2>${formatRupiah(finalPrice)}</h2>
      </div>
    `);
  }


  /* =========================================
     3. KALKULATOR BELANJA
  ========================================= */

  function renderBelanja() {

    calculatorFormArea.innerHTML = `
      <div class="calculator-feature">

        <div class="calculator-feature-header">
          <h2>Daftar Belanja</h2>
          <p>Tambahkan barang untuk menghitung total belanja.</p>
        </div>

        <div class="calculator-form">

          <div id="daftarBarang"></div>

          <button type="button" class="calculator-add"
            id="tambahBarang">
            + Tambah Barang
          </button>

          <div class="shopping-summary">
            <div class="result-detail">
              <span>Total jenis barang</span>
              <strong id="jumlahJenis">1</strong>
            </div>

            <div class="result-detail">
              <span>Total item</span>
              <strong id="jumlahItem">0</strong>
            </div>

            <div class="result-total">
              <span>Total Belanja</span>
              <h2 id="totalBelanja">${formatRupiah(0)}</h2>
            </div>
          </div>

        </div>
      </div>
    `;

    addShoppingItem();
    calculateBelanja();
  }

  let shoppingItemCount = 0;

  function addShoppingItem() {

    const list = document.getElementById("daftarBarang");

    if (!list) return;

    shoppingItemCount++;

    const row = document.createElement("div");
    row.className = "shopping-item";

    row.innerHTML = `
      <div class="shopping-item-header">
        <strong>Barang ${shoppingItemCount}</strong>
        <button type="button" class="remove-item"
          data-action="remove-item">
          Hapus
        </button>
      </div>

      <div class="form-group">
        <label>Nama Barang</label>
        <input type="text" class="item-name"
          placeholder="Masukkan nama barang">
      </div>

      <div class="shopping-item-fields">
        <div class="form-group">
          <label>Harga Satuan (Rp)</label>
          <input type="number" class="item-price"
            placeholder="Harga" min="0" step="any">
        </div>

        <div class="form-group">
          <label>Jumlah</label>
          <input type="number" class="item-quantity"
            placeholder="Jumlah" min="0" step="1" value="1">
        </div>
      </div>

      <div class="item-subtotal">
        Subtotal: <strong>${formatRupiah(0)}</strong>
      </div>
    `;

    list.appendChild(row);
    calculateBelanja();
  }

  function calculateBelanja() {

    const rows = document.querySelectorAll(".shopping-item");

    let total = 0;
    let totalItems = 0;

    rows.forEach(row => {

      const price = Number(row.querySelector(".item-price").value) || 0;
      const quantity = Number(row.querySelector(".item-quantity").value) || 0;

      const subtotal = price * quantity;

      total += subtotal;
      totalItems += quantity;

      row.querySelector(".item-subtotal strong").textContent =
        formatRupiah(subtotal);
    });

    const totalBelanja = document.getElementById("totalBelanja");
    const jumlahJenis = document.getElementById("jumlahJenis");
    const jumlahItem = document.getElementById("jumlahItem");

    if (totalBelanja) totalBelanja.textContent = formatRupiah(total);
    if (jumlahJenis) jumlahJenis.textContent = rows.length;
    if (jumlahItem) jumlahItem.textContent = totalItems;
  }


  /* =========================================
     4. KALKULATOR KEUNTUNGAN
  ========================================= */

  function renderKeuntungan() {

    calculatorFormArea.innerHTML = `
      <div class="calculator-feature">

        <div class="calculator-feature-header">
          <h2>Hitung Keuntungan Usaha</h2>
          <p>Ketahui laba berdasarkan modal dan harga jual produk.</p>
        </div>

        <div class="calculator-form">

          <div class="form-group">
            <label for="modalProduk">Modal per Produk (Rp)</label>
            <input type="number" id="modalProduk"
              placeholder="Masukkan modal" min="0" step="any">
          </div>

          <div class="form-group">
            <label for="hargaJual">Harga Jual per Produk (Rp)</label>
            <input type="number" id="hargaJual"
              placeholder="Masukkan harga jual" min="0" step="any">
          </div>

          <div class="form-group">
            <label for="jumlahProduk">Jumlah Produk Terjual</label>
            <input type="number" id="jumlahProduk"
              placeholder="Masukkan jumlah produk" min="1" step="1">
          </div>

          <button type="button" class="calculator-submit"
            id="hitungKeuntungan">
            Hitung Keuntungan
          </button>

          <div class="calculator-result"
            id="hasilKeuntungan" hidden></div>

        </div>
      </div>
    `;
  }

  function calculateKeuntungan() {

    const modalInput = document.getElementById("modalProduk");
    const saleInput = document.getElementById("hargaJual");
    const quantityInput = document.getElementById("jumlahProduk");

    const modal = getNumber("modalProduk");
    const salePrice = getNumber("hargaJual");
    const quantity = getNumber("jumlahProduk");

    if (
      modalInput.value === "" ||
      saleInput.value === "" ||
      quantityInput.value === ""
    ) {
      alert("Silakan lengkapi semua data terlebih dahulu.");
      return;
    }

    if (modal < 0 || salePrice < 0 || quantity <= 0 ||
        !Number.isInteger(quantity)) {
      alert("Periksa kembali modal, harga jual, dan jumlah produk.");
      return;
    }

    const totalModal = modal * quantity;
    const totalRevenue = salePrice * quantity;
    const profit = totalRevenue - totalModal;

    const margin = totalRevenue > 0
      ? (profit / totalRevenue) * 100
      : 0;

    const status = profit > 0
      ? "Mengalami Keuntungan"
      : profit < 0
        ? "Mengalami Kerugian"
        : "Berada pada Titik Impas";

    showResult("hasilKeuntungan", `
      <span class="result-label">Hasil Perhitungan</span>

      <div class="result-detail">
        <span>Total Modal</span>
        <strong>${formatRupiah(totalModal)}</strong>
      </div>

      <div class="result-detail">
        <span>Total Pendapatan</span>
        <strong>${formatRupiah(totalRevenue)}</strong>
      </div>

      <div class="result-total">
        <span>${status}</span>
        <h2>${formatRupiah(profit)}</h2>
      </div>

      <div class="result-detail">
        <span>Margin Keuntungan</span>
        <strong>${margin.toFixed(2)}%</strong>
      </div>
    `);
  }


  /* =========================================
     EVENT PERHITUNGAN
  ========================================= */

  calculatorFormArea.addEventListener("click", event => {

    const target = event.target.closest("button");

    if (!target) return;

    switch (target.id) {
      case "hitungUang":
        calculateUang();
        break;

      case "hitungDiskon":
        calculateDiskon();
        break;

      case "hitungKeuntungan":
        calculateKeuntungan();
        break;

      case "tambahBarang":
        addShoppingItem();
        break;
    }

    if (target.dataset.action === "remove-item") {
      const rows = document.querySelectorAll(".shopping-item");

      if (rows.length > 1) {
        target.closest(".shopping-item").remove();
        calculateBelanja();
      } else {
        alert("Minimal harus ada satu barang.");
      }
    }
  });


  // PERBARUI TOTAL BELANJA OTOMATIS
  calculatorFormArea.addEventListener("input", event => {

    if (
      event.target.matches(".item-price") ||
      event.target.matches(".item-quantity")
    ) {
      calculateBelanja();
    }
  });

});
