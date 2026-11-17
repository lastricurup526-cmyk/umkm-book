import { supabase } from "./supabase.js";

const knowledgeMaterials = [

    {
        category: "akuntansi",
        title: "Pengertian Akuntansi",
        description: "Akuntansi merupakan proses mengidentifikasi, mencatat, menggolongkan, meringkas, dan menyajikan transaksi keuangan suatu usaha untuk mengetahui kondisi keuangan serta membantu pengambilan keputusan yang tepat.",
        content: `
            <h3>Fungsi Akuntansi</h3>
            <ul>
                <li>Mencatat transaksi keuangan.</li>
                <li>Mengetahui kondisi keuangan usaha.</li>
                <li>Membantu menghitung keuntungan dan kerugian.</li>
                <li>Mendukung pengambilan keputusan usaha.</li>
            </ul>
        `
    },

    {
        category: "akuntansi",
        title: "Tujuan dan Manfaat Akuntansi",
        description: "Akuntansi bertujuan menyediakan informasi keuangan yang akurat dan terstruktur agar pemilik usaha dapat memahami kondisi usahanya serta menentukan keputusan yang tepat.",
        content: `
            <h3>Tujuan Akuntansi</h3>
            <p>
                Tujuan utama akuntansi adalah menghasilkan informasi
                keuangan yang dapat digunakan untuk menilai kondisi
                dan perkembangan suatu usaha.
            </p>

            <h3>Manfaat Akuntansi bagi UMKM</h3>
            <ul>
                <li>Mengetahui jumlah pemasukan dan pengeluaran usaha.</li>
                <li>Mengetahui keuntungan atau kerugian usaha.</li>
                <li>Mengontrol penggunaan modal.</li>
                <li>Membantu merencanakan kegiatan usaha.</li>
                <li>Menjadi dasar dalam mengambil keputusan bisnis.</li>
            </ul>

            <h3>Contoh Penerapan</h3>
            <p>
                Seorang pemilik toko mencatat seluruh penjualan,
                pembelian barang, dan biaya operasional setiap hari.
                Dari catatan tersebut, pemilik dapat mengetahui
                perkembangan keuangan tokonya.
            </p>
        `
    }

    ,

    {
        category: "perpajakan",
        title: "Pengertian Perpajakan",
        description: "Perpajakan merupakan segala hal yang berkaitan dengan pemungutan, pengelolaan, pembayaran, dan pelaporan pajak berdasarkan ketentuan peraturan perundang-undangan.",
        content: `
            <h3>1. Pengertian Pajak</h3>
            <p>
                Pajak adalah kontribusi wajib kepada negara yang
                terutang oleh orang pribadi atau badan, bersifat
                memaksa berdasarkan undang-undang, tanpa mendapatkan
                imbalan secara langsung, dan digunakan untuk
                keperluan negara bagi sebesar-besarnya kemakmuran rakyat.
            </p>

            <h3>2. Tujuan Perpajakan</h3>
            <ul>
                <li>Mendukung pembiayaan pembangunan negara.</li>
                <li>Membiayai pelayanan publik.</li>
                <li>Mendukung pemerataan pembangunan.</li>
                <li>Menjaga kestabilan perekonomian.</li>
            </ul>

            <h3>3. Hubungan Pajak dengan UMKM</h3>
            <p>
                UMKM merupakan salah satu bagian dari kegiatan
                perekonomian yang dapat memiliki kewajiban perpajakan.
                Kewajiban tersebut bergantung pada bentuk usaha,
                jenis penghasilan, serta ketentuan perpajakan
                yang berlaku.
            </p>

            <h3>4. Contoh Penerapan</h3>
            <p>
                Seorang pemilik usaha memiliki kegiatan penjualan
                barang secara rutin. Pemilik usaha perlu memahami
                ketentuan pajak yang berlaku agar dapat memenuhi
                kewajiban perpajakannya dengan benar.
            </p>

            <h3>5. Kesimpulan</h3>
            <p>
                Pemahaman perpajakan membantu pelaku UMKM mengenali
                kewajiban pajaknya, mengelola administrasi usaha,
                dan menjalankan kegiatan bisnis sesuai peraturan.
            </p>
        `
    }

    ,

    {
        category: "umkm",
        title: "Pengertian UMKM",
        description: "UMKM merupakan singkatan dari Usaha Mikro, Kecil, dan Menengah, yaitu kegiatan usaha produktif yang dijalankan oleh perorangan atau badan usaha dengan kriteria tertentu sesuai peraturan perundang-undangan.",
        content: `
            <h3>1. Pengertian UMKM</h3>
            <p>
                Usaha Mikro, Kecil, dan Menengah (UMKM) merupakan
                kegiatan ekonomi produktif yang memiliki peran
                penting dalam mendukung perekonomian masyarakat
                dan negara.
            </p>

            <h3>2. Peran UMKM dalam Perekonomian</h3>
            <ul>
                <li>Membuka lapangan pekerjaan.</li>
                <li>Meningkatkan pendapatan masyarakat.</li>
                <li>Mendorong pertumbuhan ekonomi daerah.</li>
                <li>Mengembangkan produk dan kreativitas lokal.</li>
                <li>Mendukung kegiatan ekonomi masyarakat.</li>
            </ul>

            <h3>3. Contoh Kegiatan UMKM</h3>
            <ul>
                <li>Usaha makanan dan minuman.</li>
                <li>Toko kelontong dan perdagangan.</li>
                <li>Usaha pakaian dan kerajinan.</li>
                <li>Jasa percetakan dan fotokopi.</li>
                <li>Usaha jasa dan layanan digital.</li>
            </ul>

            <h3>4. Pentingnya Pembukuan bagi UMKM</h3>
            <p>
                Pembukuan membantu pelaku UMKM mencatat pemasukan,
                pengeluaran, modal, persediaan, serta hasil usaha.
                Dengan pencatatan yang teratur, pemilik usaha
                dapat mengetahui kondisi keuangan dan merencanakan
                perkembangan bisnis.
            </p>

            <h3>5. Kesimpulan</h3>
            <p>
                UMKM memiliki peran penting dalam perekonomian.
                Pengelolaan usaha yang baik, termasuk pencatatan
                keuangan, dapat membantu usaha berjalan lebih
                terarah dan berkelanjutan.
            </p>
        `
    }

    ,

    {
        category: "panduan",
        title: "Pengertian Investasi",
        description: "Investasi merupakan kegiatan menanamkan sejumlah dana atau sumber daya dengan harapan memperoleh manfaat atau keuntungan pada masa mendatang.",
        content: `
            <h3>1. Pengertian Investasi</h3>
            <p>
                Investasi adalah kegiatan mengalokasikan uang,
                waktu, atau sumber daya ke dalam suatu aset
                atau kegiatan produktif untuk memperoleh
                manfaat ekonomi pada masa mendatang.
            </p>

            <h3>2. Tujuan Investasi</h3>
            <ul>
                <li>Mengembangkan nilai aset dalam jangka waktu tertentu.</li>
                <li>Mempersiapkan kebutuhan keuangan masa depan.</li>
                <li>Mendukung pertumbuhan dan pengembangan usaha.</li>
                <li>Meningkatkan kemampuan keuangan secara berkelanjutan.</li>
            </ul>

            <h3>3. Jenis-Jenis Investasi</h3>
            <ul>
                <li><strong>Investasi riil:</strong> Investasi pada aset nyata seperti tanah, bangunan, dan peralatan usaha.</li>
                <li><strong>Investasi keuangan:</strong> Investasi pada instrumen keuangan seperti deposito, obligasi, dan reksa dana.</li>
                <li><strong>Investasi pengembangan usaha:</strong> Penggunaan dana untuk meningkatkan kapasitas produksi, teknologi, atau kualitas layanan.</li>
            </ul>

            <h3>4. Contoh Investasi pada UMKM</h3>
            <p>
                Seorang pemilik usaha makanan membeli peralatan
                produksi baru untuk meningkatkan kapasitas
                pembuatan produk. Pembelian tersebut merupakan
                investasi karena diharapkan memberikan manfaat
                bagi kegiatan usaha dalam jangka panjang.
            </p>

            <h3>5. Hal yang Perlu Diperhatikan</h3>
            <ul>
                <li>Menyesuaikan investasi dengan kemampuan keuangan.</li>
                <li>Memahami potensi keuntungan dan risiko.</li>
                <li>Mempertimbangkan jangka waktu investasi.</li>
                <li>Melakukan perencanaan sebelum mengalokasikan dana.</li>
            </ul>

            <h3>6. Kesimpulan</h3>
            <p>
                Investasi merupakan salah satu cara untuk
                mengembangkan aset dan mendukung pertumbuhan usaha.
                Setiap keputusan investasi perlu didasarkan
                pada perencanaan dan pemahaman terhadap risiko.
            </p>
        `
    }

];

document.addEventListener("DOMContentLoaded", async () => {

    // ==================================================
    // 2. CEK LOGIN
    // ==================================================

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
        window.location.replace("index.html");
        return;
    }

    const user = data.session.user;

    // ==================================================
    // 3. SIDEBAR MOBILE
    // ==================================================

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
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 650) {
            closeMenu();
        }
    });

    // ==================================================
    // 4. LOGOUT
    // ==================================================

    const logoutButton = document.getElementById("logoutButton");

    logoutButton?.addEventListener("click", async event => {
        event.preventDefault();

        const confirmation = confirm(
            "Apakah Anda yakin ingin keluar dari akun UMKM BOOK?"
        );

        if (!confirmation) return;

        const { error } = await supabase.auth.signOut();

        if (error) {
            alert("Gagal keluar: " + error.message);
            return;
        }

        window.location.replace("index.html");
    });

    // ==================================================
    // 5. IDENTITAS USAHA
    // ==================================================

    const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("business_name, photo_url")
        .eq("owner_id", user.id)
        .maybeSingle();

    if (businessError) {
        console.error("Gagal memuat identitas usaha:", businessError);
    }

    const businessName = document.getElementById("businessName");
    const businessAvatar = document.getElementById("businessAvatar");

    if (business && businessName && business.business_name) {
        businessName.textContent = business.business_name;
    }

    if (businessAvatar) {
        businessAvatar.textContent = "U";

        if (business?.photo_url) {
            const image = document.createElement("img");

            image.src = business.photo_url;
            image.alt = "Foto usaha";
            image.style.width = "100%";
            image.style.height = "100%";
            image.style.objectFit = "cover";
            image.style.borderRadius = "inherit";

            image.onerror = () => {
                image.remove();
                businessAvatar.textContent = "U";
            };

            businessAvatar.textContent = "";
            businessAvatar.appendChild(image);
        }
    }

    // ==================================================
    // 6. ELEMEN HALAMAN PENGETAHUAN
    // ==================================================

    const categorySection = document.getElementById(
        "knowledgeCategorySection"
    );

    const articleView = document.getElementById(
        "knowledgeArticleView"
    );
    function showCategories() {
    categorySection.hidden = false;
    articleView.hidden = true;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
    // HEADER, BANNER, DAN FOOTER
    const pageHeader = document.getElementById("knowledgePageHeader");
    const knowledgeHero = document.getElementById("knowledgeHero");
    const knowledgeFooter = document.getElementById("knowledgeFooter");
    const articleCategory = document.getElementById(
        "articleCategory"
    );

    const articleTitle = document.getElementById(
        "articleTitle"
    );

    const articleDescription = document.getElementById(
        "articleDescription"
    );

    const articleContent = document.getElementById(
        "articleContent"
    );

    const backToCategories = document.getElementById(
        "backToCategoriesFromArticle"
    );

    // ==================================================
    // 7. DATA KATEGORI
    // ==================================================

    const categories = {
        akuntansi: {
            title: "Akuntansi",
            description: "Materi pencatatan transaksi dan laporan keuangan."
        },

        perpajakan: {
            title: "Perpajakan",
            description: "Materi mengenai ketentuan dan kewajiban pajak UMKM."
        },

        umkm: {
            title: "Pengetahuan UMKM",
            description: "Materi pengelolaan dan pengembangan usaha."
        },

        panduan: {
            title: "Investasi",
            description: "Materi investasi dan pengembangan usaha."
        }
    };

    function showCategories() {
    pageHeader.hidden = false;
    knowledgeHero.hidden = false;
    categorySection.hidden = false;
    articleView.hidden = true;
    knowledgeFooter.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

    function showCategoryContent(category) {
        const selectedCategory = categories[category];

        if (!selectedCategory) return;

        const filteredMaterials = knowledgeMaterials.filter(
            material => material.category === category
        );

        pageHeader.hidden = true;
        knowledgeHero.hidden = true;
        categorySection.hidden = true;
        articleView.hidden = false;
        knowledgeFooter.hidden = true;
        articleCategory.textContent = selectedCategory.title;

        articleContent.replaceChildren();

        // Jika hanya ada satu materi
        if (filteredMaterials.length === 1) {
            const material = filteredMaterials[0];

            articleTitle.textContent = material.title;
            articleDescription.textContent =
                material.description || "";

            articleContent.innerHTML = material.content || "";

        }

        // Jika ada beberapa materi dalam satu kategori
        else if (filteredMaterials.length > 1) {
            articleTitle.textContent = selectedCategory.title;
            articleDescription.textContent =
                selectedCategory.description;

            filteredMaterials.forEach((material, index) => {
                const section = document.createElement("section");
                section.className = "knowledge-topic-content";

                const heading = document.createElement("h3");
                heading.textContent =
                    `${index + 1}. ${material.title}`;

                const description = document.createElement("p");
                description.textContent =
                    material.description || "";

                const content = document.createElement("div");
                content.className = "knowledge-topic-body";
                content.innerHTML = material.content || "";

                section.append(
                    heading,
                    description,
                    content
                );

                articleContent.appendChild(section);
            });
        }

        // Jika kategori belum memiliki materi
        else {
            articleTitle.textContent = selectedCategory.title;
            articleDescription.textContent =
                selectedCategory.description;

            const emptyMessage = document.createElement("p");
            emptyMessage.className = "knowledge-empty";
            emptyMessage.textContent =
                "Materi untuk kategori ini belum tersedia.";

            articleContent.appendChild(emptyMessage);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // ==================================================
    // 10. TOMBOL KEMBALI KE KATEGORI
    // ==================================================

    backToCategories?.addEventListener("click", showCategories);

    // ==================================================
    // 11. KLIK KATEGORI
    // ==================================================

    document.querySelectorAll("[data-category]").forEach(card => {
        card.addEventListener("click", () => {
            const category = card.dataset.category;

            showCategoryContent(category);
        });
    });

    console.log("Pengetahuan UMKM BOOK berhasil dimuat.");

});
