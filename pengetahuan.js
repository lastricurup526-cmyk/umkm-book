import { supabase } from "./supabase.js";

const knowledgeMaterials = [

    {
        category: "akuntansi",
        
        title: "Pengertian Akuntansi",
        description: "Akuntansi merupakan proses mengidentifikasi, mencatat, menggolongkan, meringkas, dan menyajikan transaksi keuangan suatu usaha untuk mengetahui kondisi keuangan serta membantu pengambilan keputusan yang tepat.",
        content: `
            <h3>Tujuan Akuntansi</h3>
            <ul>
                Tujuan utama akuntansi adalah menghasilkan informasi
                keuangan yang dapat digunakan untuk menilai kondisi
                dan perkembangan suatu usaha.
            </ul>

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
             <h3>Kesimpulan</h3>
            <p>
               Akuntansi marupakan proses pengelolaan informasi keuangan yang membantu pelaku
               UMKM mencatat transaksi, mengontrol keuangan, mengetahui keuntungan, dan 
               mengembangkan usaha.
            </p>
        `
    }

    ,

    {
        category: "perpajakan",
        title: "Pengertian Perpajakan",
        description: "Menurut pasal 1 angka 1 UU KUP, Pajak merupakan kontribusi wajib kepada negara yang bersifat memaksa berdasarkan undang-undang, tanpa imbalan langsung, untuk keperluan negara dan kemakmuran rakyat.",
        content: `
            <h3> Perpajakan UMKM</h3>
            <ul>
                Perpajakan UMKM adalah kententuan pajak yang mengatur kewajiban pelaku usaha mikro, kecil, dan menengah dalam membayar pajak atas penghasilan usaha.
            </ul>

            <h3>Dasar-Dasar Hukum Perpajakan UMKM</h3>
            <p>
                 <li>UU No 7 tahun 2021 (UU HPP): Mengatur perubahan ketentuan perpajakan, termasuk pajak penghasilan.</li>
                 <li>PP No 55 Tahun 2022 : Mengatur penyesuaian ketentuan pajak penghasilan, termasuk PPH Final UMKM.</li>
                 <li>PP No 20 Tahun 2026 : Perubahan baru atas PP No 55 Tahun 2022 mengenai ketentuan PPH Final UMKM.</li>
            </p>

            <h3>Ketentuan Pajak UMKM</h3>
            <p>
                 <li>Tarif Pajak : PPH Final sebesar 0,5% bagi wajib pajak yang memenuhi persyaratan.</li>
                 <li>Batas Omzet : Maksimal 4,8 Miliar per tahun.</li>
                 <li>Bebas Pajak : Omzet sampai 500 juta pertama dalam satu tahun tidak dikenai PPH bagi pajak orang pribadi.</li>
                 <li>Penerimaan Fasilitas : Wajib pajak orang pribadi, perseroan perorangan, dan koperasi sesai ketentuan.</li>
                 <li>Jangka Waktu : Orang pribadi dan perseroan perorangan dapat menggunkan fasilitas selama memenuhi kriteria, sedangakan koperasi maksimal 4 tahun pajak.</li>
            </p>

            <h3>Contoh Perhitungan</h3>
            <p>
               Seorang pemilik UMKM memiliki omzet Rp 700 juta setahun
                 <li>Omzet Bebas Pajak : Rp 500 juta</li>
                 <li>Omzet Kena Pajak : Rp 200 juta</li>
                 <li>PPh Final : 0,5 % x Rp 200 juta = Rp 1 juta</li>
            </p>
            <h3>Kesimpulan</h3>
            <p>
               Pajak UMKM merupakan kewajiban perpajakan yang harus dipahami oleh setiap pelaku usaha. Dengan adanya tafit khusus 0,5% pemerintah memberikan kemudahan perpajakan bagi UMKM yang memenuhi persyaratan.
            </p>
        `
    }

    ,

    {
        category: "umkm",
        title: "Pengertian UMKM",
        description: "UMKM ( Usaha, Mikro, Kecil, dan Menengah) adalah kegiatan usaha yang dijalakan oleh perorangan atau badan usaha untuk menghasilkan barang atau jasa serta mendukung perekonomian masyarakat.",
        content: `
            <h3>Dasar Hukum</h3>
            <p>
                Berdasarkan UU No 20 Tahun 2008 tentang UMKM dan PP No 7 Tahun 2021 tentang kemudahan, pelindungan, pemberdayaan koperasi dam UMKM.
            </p>

            <h3>Kriteria UMKM</h3>
            <ul>
                Menurut PP No 7 Tahun 2021 Pasal 35 Kriteria UMKM dibagi menjadi :
                 <p>
                1. Bedasarkan Modal Usaha
                <li>Usaha Mikro : Modal maksimal Rp1 Miliar</li>
                <li>Usaha Kecil : Modal lebih dari Rp1 Miliae - Rp5 Miliar</li>
                <li>Usaha Menengah : Modal lebih dari Rp5 Miliar - Rp10 Miliar</li>
                "Modal tidak termasuk tanah dan bangunan tempat usaha."
                 </p>

                2. Berdasarkan Hasil Penjualan Tahunan (Omzet)
                <li>Usaha Mikro : Maksimal Rp2 Miliar per tahun</li>
                <li>Usaha Kecil : Lebih dari Rp2 Miliar - Rp15 Miliar per tahun</li>
                <li>Usaha Menengah : Lebih dari Rp15 Miliar - Rp50 Miliar per tahun</li>
            </ul>

            <h3>Pentingnya Pembukuan bagi UMKM</h3>
            <p>
                Pembukuan membantu pelaku UMKM mencatat pemasukan,
                pengeluaran, modal, persediaan, serta hasil usaha.
                Dengan pencatatan yang teratur, pemilik usaha
                dapat mengetahui kondisi keuangan dan merencanakan
                perkembangan bisnis.
            </p>

            <h3>Kesimpulan</h3>
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
            <h3>Pengertian Investasi</h3>
            <p>
                Investasi adalah kegiatan mengalokasikan uang,
                waktu, atau sumber daya ke dalam suatu aset
                atau kegiatan produktif untuk memperoleh
                manfaat ekonomi pada masa mendatang.
            </p>

            <h3>Tujuan Investasi</h3>
            <ul>
                <li>Mengembangkan nilai aset dalam jangka waktu tertentu.</li>
                <li>Mempersiapkan kebutuhan keuangan masa depan.</li>
                <li>Mendukung pertumbuhan dan pengembangan usaha.</li>
                <li>Meningkatkan kemampuan keuangan secara berkelanjutan.</li>
            </ul>

            <h3>Jenis-Jenis Investasi</h3>
            <ul>
                <li><strong>Investasi riil:</strong> Investasi pada aset nyata seperti tanah, bangunan, dan peralatan usaha.</li>
                <li><strong>Investasi keuangan:</strong> Investasi pada instrumen keuangan seperti deposito, obligasi, dan reksa dana.</li>
                <li><strong>Investasi pengembangan usaha:</strong> Penggunaan dana untuk meningkatkan kapasitas produksi, teknologi, atau kualitas layanan.</li>
            </ul>

            <h3>Contoh Investasi pada UMKM</h3>
            <p>
                Seorang pemilik usaha makanan membeli peralatan
                produksi baru untuk meningkatkan kapasitas
                pembuatan produk. Pembelian tersebut merupakan
                investasi karena diharapkan memberikan manfaat
                bagi kegiatan usaha dalam jangka panjang.
            </p>

            <h3>Hal yang Perlu Diperhatikan</h3>
            <ul>
                <li>Menyesuaikan investasi dengan kemampuan keuangan.</li>
                <li>Memahami potensi keuntungan dan risiko.</li>
                <li>Mempertimbangkan jangka waktu investasi.</li>
                <li>Melakukan perencanaan sebelum mengalokasikan dana.</li>
            </ul>

            <h3>Kesimpulan</h3>
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
