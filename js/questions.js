/**
 * BPMP Farm Quest: Bank Soal Multi-Paket & Multi-Jenjang
 * Mendukung:
 * 1. SMP Kelas VII: KKA (Poster Kampanye Digital) - 40 Soal
 * 2. SMA Kelas X: Informatika & IoT Arduino Wokwi - 30 Soal
 * 3. Bahasa Inggris: Reading, Writing, & Listening (Audio Text-to-Speech Interaktif)
 */

// ============================================================================
// PAKET 1: SMP KELAS VII - KKA (POSTER KAMPANYE DIGITAL) - 40 SOAL LENGKAP
// ============================================================================
const SMP_KKA_QUESTIONS = [
  {
    id: 1,
    category: "Unsur Poster Kampanye",
    question: "Poster kampanye “Stop Perundungan Siber” bertuliskan “Berpikir Sebelum Mengetik” di bagian atas, gambar dua siswa memegang ponsel di tengah, dan paragraf ajakan di bagian bawah. Bagian judul poster adalah …",
    options: [
      { key: "A", text: "gambar dua siswa memegang ponsel" },
      { key: "B", text: "ikon pada layar ponsel" },
      { key: "C", text: "teks “Berpikir Sebelum Mengetik”" },
      { key: "D", text: "paragraf ajakan di bagian bawah" }
    ],
    answer: "C",
    explanation: "Judul adalah teks utama yang paling menonjol. Paragraf adalah isi, sedangkan gambar siswa adalah unsur gambar."
  },
  {
    id: 2,
    category: "Prinsip Tata Letak",
    question: "Fungsi tata letak pada poster kampanye adalah …",
    options: [
      { key: "A", text: "mengarahkan alur baca pembaca dari judul ke isi hingga ajakan" },
      { key: "B", text: "menggantikan isi pesan" },
      { key: "C", text: "menambah jumlah warna pada poster" },
      { key: "D", text: "memperkecil ukuran berkas" }
    ],
    answer: "A",
    explanation: "Tata letak yang jelas membuat mata pembaca bergerak berurutan sehingga pesan tersampaikan."
  },
  {
    id: 3,
    category: "Proporsi Warna & Kontras",
    question: "Agar poster kampanye tidak ramai, jumlah warna utama yang dianjurkan dan syarat teks terhadap latar adalah …",
    options: [
      { key: "A", text: "satu warna untuk teks dan latar yang sama" },
      { key: "B", text: "enam warna, teks senada dengan latar" },
      { key: "C", text: "lima warna, kontras rendah" },
      { key: "D", text: "maksimal tiga warna, kontras teks dan latar cukup" }
    ],
    answer: "D",
    explanation: "Daftar periksa: warna tidak lebih dari tiga dan kontras cukup agar teks terbaca."
  },
  {
    id: 4,
    category: "Proporsi Warna & Kontras",
    question: "Sebuah poster memuat teks panjang yang saling menumpuk dan warna merah menyala bertabrakan dengan hijau. Mengapa keterbacaan pesannya turun?",
    options: [
      { key: "A", text: "judulnya terlalu pendek" },
      { key: "B", text: "teks menumpuk menutupi huruf dan warna bertabrakan melelahkan mata sehingga fokus pembaca terpecah" },
      { key: "C", text: "ukuran berkasnya terlalu besar" },
      { key: "D", text: "gambarnya terlalu sedikit" }
    ],
    answer: "B",
    explanation: "Teks menumpuk sulit dibedakan, sedangkan warna bertabrakan mengganggu fokus pembaca."
  },
  {
    id: 5,
    category: "Proporsi Warna & Kontras",
    question: "Tiga kombinasi warna teks dan latar: (1) kuning di latar putih, (2) putih di latar biru tua, (3) abu-abu muda di latar abu-abu. Kombinasi yang paling mudah dibaca dari jarak jauh adalah …",
    options: [
      { key: "A", text: "kombinasi (2)" },
      { key: "B", text: "ketiganya sama mudahnya" },
      { key: "C", text: "kombinasi (3)" },
      { key: "D", text: "kombinasi (1)" }
    ],
    answer: "A",
    explanation: "Putih di atas biru tua memiliki kontras terkuat, sedangkan dua lainnya berkontras rendah."
  },
  {
    id: 6,
    category: "Proporsi Warna & Kontras",
    question: "Poster kampanye memakai biru, merah, kuning, hijau, dan ungu sebagai warna utama. Agar sesuai prinsip proporsi warna, yang perlu dilakukan adalah …",
    options: [
      { key: "A", text: "memperkecil seluruh teks" },
      { key: "B", text: "menambah satu warna lagi" },
      { key: "C", text: "mengganti semuanya dengan warna neon" },
      { key: "D", text: "mengurangi menjadi maksimal tiga warna utama" }
    ],
    answer: "D",
    explanation: "Warna utama dibatasi tidak lebih dari tiga agar tampilan serasi."
  },
  {
    id: 7,
    category: "Evaluasi & Perbaikan Desain",
    question: "Poster memiliki teks menumpuk dan warna bertabrakan. Berdasarkan daftar periksa (tata letak jelas, warna tidak lebih dari tiga, kontras cukup), perbaikan yang tepat adalah …",
    options: [
      { key: "A", text: "menambahkan bayangan pada semua teks" },
      { key: "B", text: "memberi jarak antarbagian, mengurangi warna menjadi tiga, dan memperkuat kontras teks" },
      { key: "C", text: "menambah warna latar" },
      { key: "D", text: "memperbesar semua gambar" }
    ],
    answer: "B",
    explanation: "Perbaikan harus menjawab ketiga butir daftar periksa."
  },
  {
    id: 8,
    category: "Evaluasi & Perbaikan Desain",
    question: "Dua poster berisi sama. Poster X: judul besar, isi berupa poin pendek, dua warna. Poster Y: teks rapat, banyak ukuran huruf, enam warna. Mengapa Poster Y lebih sulit dipahami?",
    options: [
      { key: "A", text: "isinya lebih sedikit" },
      { key: "B", text: "judulnya terlalu besar" },
      { key: "C", text: "tata letaknya tidak terarah dan warnanya terlalu banyak sehingga mata sulit menentukan fokus" },
      { key: "D", text: "hanya memakai dua warna" }
    ],
    answer: "C",
    explanation: "Tata letak berantakan dan warna berlebihan mengaburkan pesan utama."
  },
  {
    id: 9,
    category: "Evaluasi & Perbaikan Desain",
    question: "Hasil penilaian tiga poster: A terpenuhi 3 dari 3 butir daftar periksa (skor 90), B terpenuhi 2 butir (skor 75), C terpenuhi 1 butir (skor 50). Poster yang paling layak menjadi acuan desain adalah …",
    options: [
      { key: "A", text: "Poster B dan C sama layaknya" },
      { key: "B", text: "Poster B, karena berada di tengah" },
      { key: "C", text: "Poster C, karena paling unik" },
      { key: "D", text: "Poster A, karena memenuhi semua butir dan skornya tertinggi" }
    ],
    answer: "D",
    explanation: "Acuan desain dipilih dari poster dengan butir terpenuhi dan skor keterbacaan tertinggi."
  },
  {
    id: 10,
    category: "Evaluasi & Perbaikan Desain",
    question: "Dua poster berisi sama: P1 rapi (alur baca jelas, dua warna, kontras tinggi) dan P2 berantakan. Perbedaan keterbacaan keduanya dianalisis berdasarkan …",
    options: [
      { key: "A", text: "merek perangkat pembuat" },
      { key: "B", text: "tata letak, proporsi warna, dan kontras" },
      { key: "C", text: "ukuran berkas dan nama berkas" },
      { key: "D", text: "jumlah halaman" }
    ],
    answer: "B",
    explanation: "Ketiga aspek itulah yang menentukan mudah-tidaknya poster dibaca."
  },
  {
    id: 11,
    category: "Apresiasi & Kritik Desain",
    question: "Poster kelompok lain memiliki judul jelas dan gambar relevan, tetapi teks isi berwarna abu-abu muda di latar putih. Penilaian yang tepat adalah …",
    options: [
      { key: "A", text: "tidak ada kekurangan sama sekali" },
      { key: "B", text: "kelebihan: kontras teks kuat; kekurangan: judul tidak jelas" },
      { key: "C", text: "kelebihan: judul dan gambar jelas; kekurangan: kontras teks isi lemah" },
      { key: "D", text: "seluruh desain buruk" }
    ],
    answer: "C",
    explanation: "Menilai berarti menyebut kelebihan dan kekurangan berdasarkan tata letak, warna, dan kontras."
  },
  {
    id: 12,
    category: "Rancangan Poster Kampanye",
    question: "Untuk kampanye melawan hoaks, usulan desain poster yang paling efektif adalah …",
    options: [
      { key: "A", text: "judul besar di atas, poin pendek, palet 2–3 warna, teks gelap di latar terang" },
      { key: "B", text: "teks berwarna sama dengan latar" },
      { key: "C", text: "semua huruf dikecilkan agar muat" },
      { key: "D", text: "enam warna dengan teks panjang" }
    ],
    answer: "A",
    explanation: "Usulan efektif memuat tata letak jelas, palet 2–3 warna, dan kontras cukup."
  },
  {
    id: 13,
    category: "Hierarki Visual & Pengelompokan Data",
    question: "Data hasil investigasi sangat panjang. Agar mudah dipahami dan data terpenting menonjol, caranya adalah …",
    options: [
      { key: "A", text: "seluruh huruf diperkecil" },
      { key: "B", text: "dikelompokkan menjadi poin pendek atau kotak terpisah, dan data terpenting dibuat paling menonjol (hierarki visual)" },
      { key: "C", text: "semua angka dihapus" },
      { key: "D", text: "semua data ditulis dalam satu paragraf" }
    ],
    answer: "B",
    explanation: "Pengelompokan dan hierarki visual mengarahkan perhatian pada data terpenting."
  },
  {
    id: 14,
    category: "Fungsi Elemen Visual",
    question: "Fungsi diagram, foto dokumentasi, dan ikon secara berurutan adalah …",
    options: [
      { key: "A", text: "ketiganya hanya hiasan" },
      { key: "B", text: "menjadi bukti kejadian, menunjukkan perbandingan angka, dan menjadi judul" },
      { key: "C", text: "menunjukkan perbandingan angka, menjadi bukti kejadian, dan menandai kategori secara ringkas" },
      { key: "D", text: "menggantikan judul, menjadi sumber lisensi, dan mengekspor berkas" }
    ],
    answer: "C",
    explanation: "Setiap jenis visual punya fungsi berbeda sesuai jenis datanya."
  },
  {
    id: 15,
    category: "Etika Digital",
    question: "Unsur pesan etika digital yang perlu ada pada poster kampanye adalah …",
    options: [
      { key: "A", text: "pentingnya norma, dampak jika diabaikan, contoh perilaku sesuai dan tidak sesuai, serta rekomendasi perilaku" },
      { key: "B", text: "tanggal, harga, dan alamat" },
      { key: "C", text: "warna, huruf, dan ukuran" },
      { key: "D", text: "merek, logo, dan slogan" }
    ],
    answer: "A",
    explanation: "Keempat unsur itu membuat pesan etika digital utuh dan mudah diterapkan."
  },
  {
    id: 16,
    category: "Penyajian Data Infografis",
    question: "Data hasil investigasi (contoh): (1) 7 dari 10 siswa pernah melihat perundungan siber di kelas, (2) survei dilakukan Senin pagi, (3) formulir dibuat dengan aplikasi tertentu. Data yang paling menonjol di infografis adalah …",
    options: [
      { key: "A", text: "ketiganya sama menonjol" },
      { key: "B", text: "data (2)" },
      { key: "C", text: "data (3)" },
      { key: "D", text: "data (1)" }
    ],
    answer: "D",
    explanation: "Data yang paling penting bagi pesan (temuan utama) ditampilkan paling menonjol."
  },
  {
    id: 17,
    category: "Fungsi Elemen Visual",
    question: "Data investigasi: angka perbandingan korban per kelas, bukti kejadian berupa tangkapan layar komentar, dan kategori masalah (ejekan, ancaman, penyebaran data pribadi). Jenis visual yang tepat berturut-turut adalah …",
    options: [
      { key: "A", text: "foto dokumentasi, ikon, dan diagram" },
      { key: "B", text: "ikon, diagram, dan foto dokumentasi" },
      { key: "C", text: "diagram sederhana, foto dokumentasi, dan ikon" },
      { key: "D", text: "diagram, ikon, dan foto dokumentasi" }
    ],
    answer: "C",
    explanation: "Angka cocok dengan diagram, bukti dengan foto dokumentasi, dan kategori dengan ikon."
  },
  {
    id: 18,
    category: "Alur Baca & Layout",
    question: "Pada templat desain kosong, hasil kerja lintas mata pelajaran ditata paling rapi dan runtut dengan cara …",
    options: [
      { key: "A", text: "judul isu di atas, lalu poin isu, pengalaman murid, dan daftar kata atau ungkapan yang berpotensi menyinggung pada bagian masing-masing" },
      { key: "B", text: "semua dimasukkan ke satu kotak kecil" },
      { key: "C", text: "daftar kata menyinggung dijadikan judul utama" },
      { key: "D", text: "pengalaman murid dihapus" }
    ],
    answer: "A",
    explanation: "Setiap jenis isi ditempatkan pada bagian yang sesuai agar alur baca runtut."
  },
  {
    id: 19,
    category: "Validitas Data & Cek Fakta",
    question: "Tiga calon konten: (1) klaim “gawai merusak otak semua remaja” yang pernah dibantah situs cek fakta, (2) data survei kelas dengan jumlah responden jelas, (3) statistik lembaga resmi lengkap dengan sumber. Data yang perlu direvisi adalah …",
    options: [
      { key: "A", text: "tidak ada yang perlu direvisi" },
      { key: "B", text: "data (2)" },
      { key: "C", text: "data (3)" },
      { key: "D", text: "klaim (1)" }
    ],
    answer: "D",
    explanation: "Klaim yang pernah dibantah situs cek fakta tidak layak dipakai tanpa revisi."
  },
  {
    id: 20,
    category: "Hierarki Visual",
    question: "Dua infografis berisi sama. I-1: judul besar, angka kunci tebal, sub-poin kecil. I-2: semua teks berukuran sama. Infografis dengan hierarki visual lebih baik adalah …",
    options: [
      { key: "A", text: "keduanya sama baiknya" },
      { key: "B", text: "I-1, karena ukuran dan ketebalan menunjukkan informasi terpenting" },
      { key: "C", text: "I-2, karena seragam" },
      { key: "D", text: "tidak ada yang baik" }
    ],
    answer: "B",
    explanation: "Hierarki visual dibangun lewat perbedaan ukuran, ketebalan, dan posisi."
  },
  {
    id: 21,
    category: "Kesesuaian Konteks Gambar",
    question: "Sebuah poster menampilkan statistik “70% siswa kecanduan gim” bersama foto kerumunan suporter sepak bola. Ketidaksesuaian yang terjadi adalah …",
    options: [
      { key: "A", text: "konteks gambar tidak sesuai dengan konteks statistik sehingga menyesatkan" },
      { key: "B", text: "fotonya terlalu ramai" },
      { key: "C", text: "fotonya kurang berwarna" },
      { key: "D", text: "statistiknya terlalu besar" }
    ],
    answer: "A",
    explanation: "Gambar dan data harus sekonteks agar tidak menimbulkan salah paham."
  },
  {
    id: 22,
    category: "Validitas Data & Cek Fakta",
    question: "Calon konten: (1) statistik yang pernah dibantah situs cek fakta; (2) data bersumber jelas, foto sesuai konteks, penyampaian seimbang; (3) foto kejadian lain dengan penyampaian menyudutkan satu pihak. Yang lolos penyaringan akhir adalah …",
    options: [
      { key: "A", text: "konten (1) dan (3)" },
      { key: "B", text: "konten (1)" },
      { key: "C", text: "konten (3)" },
      { key: "D", text: "konten (2)" }
    ],
    answer: "D",
    explanation: "Lolos bila tidak pernah dibantah, konteks sesuai, dan penyampaian tidak berat sebelah."
  },
  {
    id: 23,
    category: "Evaluasi Infografis",
    question: "Infografis perundungan siber memuat diagram batang dengan 12 kategori, 8 warna, dan label sangat kecil. Penilaian dan saran yang tepat adalah …",
    options: [
      { key: "A", text: "sudah baik, tidak perlu diubah" },
      { key: "B", text: "kurang membantu pemahaman; ringkas kategori, kurangi warna, perbesar label" },
      { key: "C", text: "tambahkan lebih banyak warna" },
      { key: "D", text: "ganti seluruhnya dengan paragraf" }
    ],
    answer: "B",
    explanation: "Diagram yang padat dan berlabel kecil menurunkan keterbacaan."
  },
  {
    id: 24,
    category: "Rancangan Infografis",
    question: "Data perundungan siber: 40% ejekan, 35% penyebaran foto tanpa izin, 25% ancaman. Rancangan penyajian terbaik pada satu infografis adalah …",
    options: [
      { key: "A", text: "tiga foto korban tanpa izin" },
      { key: "B", text: "paragraf panjang tanpa visual" },
      { key: "C", text: "satu diagram sederhana untuk persentase, ikon untuk tiap kategori, dan angka terbesar dibuat menonjol" },
      { key: "D", text: "tabel dengan sepuluh kolom berhuruf kecil" }
    ],
    answer: "C",
    explanation: "Pilih jenis visual sesuai data, kelompokkan, dan beri hierarki visual."
  },
  {
    id: 25,
    category: "Aplikasi Desain Grafis",
    question: "Fitur dasar aplikasi desain grafis untuk produksi kampanye adalah …",
    options: [
      { key: "A", text: "mengunduh gim dan membuat akun bank" },
      { key: "B", text: "mengganti kartu SIM" },
      { key: "C", text: "mencetak tanpa pratinjau" },
      { key: "D", text: "menambah teks, mengganti warna latar, menyisipkan gambar atau ikon, mengatur posisi elemen, dan mengekspor berkas" }
    ],
    answer: "D",
    explanation: "Itulah fitur dasar yang dibutuhkan untuk menyusun dan menyelesaikan poster."
  },
  {
    id: 26,
    category: "Lisensi & Hak Cipta",
    question: "Sumber aset visual yang aman dipakai karena berlisensi bebas pakai adalah …",
    options: [
      { key: "A", text: "tangkapan layar situs berita" },
      { key: "B", text: "situs aset visual berlisensi bebas pakai seperti Pixabay, Unsplash, atau Pexels" },
      { key: "C", text: "gambar pertama hasil pencarian" },
      { key: "D", text: "foto yang disimpan dari media sosial orang lain" }
    ],
    answer: "B",
    explanation: "Pilih situs aset yang jelas lisensinya, dan tetap baca ketentuannya."
  },
  {
    id: 27,
    category: "Lisensi & Hak Cipta",
    question: "Informasi atribusi yang perlu dicatat dari gambar unduhan adalah …",
    options: [
      { key: "A", text: "tanggal lahir dan alamat pembuat" },
      { key: "B", text: "ukuran layar dan merek laptop" },
      { key: "C", text: "nama berkas, sumber situs, nama pembuat, dan tautan asli" },
      { key: "D", text: "warna dominan dan jumlah piksel" }
    ],
    answer: "C",
    explanation: "Atribusi memuat asal gambar sehingga pembuatnya dihargai dan sumber dapat ditelusuri."
  },
  {
    id: 28,
    category: "Lisensi & Hak Cipta",
    question: "Alasan tidak semua gambar di internet boleh dipakai bebas adalah …",
    options: [
      { key: "A", text: "banyak gambar dilindungi hak cipta dan hanya boleh dipakai sesuai izin atau lisensi pembuatnya" },
      { key: "B", text: "gambar internet tidak muat di poster" },
      { key: "C", text: "semua gambar internet selalu gratis" },
      { key: "D", text: "ukuran gambar selalu terlalu besar" }
    ],
    answer: "A",
    explanation: "Hak cipta melindungi karya pembuat sehingga penggunaan harus sesuai izin."
  },
  {
    id: 29,
    category: "Lisensi & Hak Cipta",
    question: "Keterangan lisensi sebuah ikon: “Gratis dipakai, wajib mencantumkan nama pembuat.” Artinya …",
    options: [
      { key: "A", text: "boleh dipakai tanpa mencantumkan apa pun" },
      { key: "B", text: "boleh dipakai gratis asalkan nama pembuat dicantumkan (atribusi)" },
      { key: "C", text: "tidak boleh dipakai pada poster" },
      { key: "D", text: "hanya boleh dijual" }
    ],
    answer: "B",
    explanation: "Lisensi gratis dengan atribusi tetap menuntut pencantuman pembuat."
  },
  {
    id: 30,
    category: "Aplikasi Desain Grafis",
    question: "Kebutuhan penyuntingan: mengganti warna latar poster dan memindahkan elemen. Fitur yang tepat adalah …",
    options: [
      { key: "A", text: "penambahan halaman kosong" },
      { key: "B", text: "penyisipan ikon saja" },
      { key: "C", text: "pengaturan warna latar dan pengaturan posisi elemen" },
      { key: "D", text: "ekspor berkas" }
    ],
    answer: "C",
    explanation: "Mengganti latar dan memindahkan elemen memakai fitur warna latar dan posisi."
  },
  {
    id: 31,
    category: "Format Berkas",
    question: "Murid akan membagikan laporan investigasi kepada guru. Fungsi ekspor ke format PDF adalah …",
    options: [
      { key: "A", text: "menyimpan laporan dengan tampilan tetap sehingga mudah dibagikan dan dibuka" },
      { key: "B", text: "menghapus semua gambar" },
      { key: "C", text: "mengubah isi laporan otomatis" },
      { key: "D", text: "menambah warna laporan" }
    ],
    answer: "A",
    explanation: "PDF menjaga tampilan agar sama di perangkat mana pun."
  },
  {
    id: 32,
    category: "Lisensi & Atribusi",
    question: "Catatan atribusi gambar: “tangan.png, sumber: situs contoh.id”. Informasi yang belum tercantum adalah …",
    options: [
      { key: "A", text: "sumber situs" },
      { key: "B", text: "tidak ada, sudah lengkap" },
      { key: "C", text: "nama berkas" },
      { key: "D", text: "nama pembuat dan tautan asli" }
    ],
    answer: "D",
    explanation: "Atribusi lengkap memuat nama berkas, sumber, nama pembuat, dan tautan asli."
  },
  {
    id: 33,
    category: "Lisensi & Atribusi",
    question: "Murid memakai gambar dari situs aset yang berlisensi bebas pakai dengan syarat atribusi pada poster kampanye. Keputusan yang tepat adalah …",
    options: [
      { key: "A", text: "boleh jika posternya dijual" },
      { key: "B", text: "boleh tanpa mencantumkan apa pun" },
      { key: "C", text: "boleh, asalkan mencantumkan atribusi (nama pembuat, sumber, tautan asli)" },
      { key: "D", text: "tidak boleh sama sekali" }
    ],
    answer: "C",
    explanation: "Lisensi mengizinkan pemakaian dengan syarat atribusi dipenuhi."
  },
  {
    id: 34,
    category: "Kecerdasan Artifisial (KA)",
    question: "Risiko membuat konten dengan KA generatif adalah …",
    options: [
      { key: "A", text: "data bisa tidak akurat dan ada persoalan hak cipta" },
      { key: "B", text: "hasilnya selalu benar" },
      { key: "C", text: "tidak perlu dicek ulang" },
      { key: "D", text: "tidak pernah berkaitan dengan hak cipta" }
    ],
    answer: "A",
    explanation: "KA dapat keliru atau mengarang data, dan hasilnya bisa bersinggungan dengan hak cipta."
  },
  {
    id: 35,
    category: "Kecerdasan Artifisial (KA)",
    question: "Poster buatan KA memuat statistik “85% remaja pernah …” tanpa sumber. Risiko akurasinya adalah …",
    options: [
      { key: "A", text: "hanya ukuran hurufnya yang berisiko" },
      { key: "B", text: "aman karena dibuat KA" },
      { key: "C", text: "hanya warnanya yang berisiko" },
      { key: "D", text: "angka bisa keliru atau dikarang dan tidak dapat diverifikasi, sehingga perlu dicek ke sumber tepercaya" }
    ],
    answer: "D",
    explanation: "Statistik tanpa sumber tidak dapat dipastikan kebenarannya."
  },
  {
    id: 36,
    category: "Panduan Gaya Desain",
    question: "Panduan gaya: warna utama biru dan putih, huruf sans-serif, ikon bergaya garis. Draf poster memakai judul merah muda, huruf hias, dan ikon kartun berwarna. Ketidaksesuaian terdapat pada …",
    options: [
      { key: "A", text: "hanya ukuran poster" },
      { key: "B", text: "warna, huruf, dan gaya ikon" },
      { key: "C", text: "hanya nama berkas" },
      { key: "D", text: "tidak ada ketidaksesuaian" }
    ],
    answer: "B",
    explanation: "Ketiga unsur draf berbeda dari panduan gaya."
  },
  {
    id: 37,
    category: "Kecerdasan Artifisial (KA)",
    question: "Poster buatan KA generatif memuat statistik tanpa sumber, gambar yang menyerupai karya seniman tertentu, dan klaim “KA tidak pernah salah”. Penilaian yang tepat adalah …",
    options: [
      { key: "A", text: "perlu diperbaiki: verifikasi data, pastikan hak cipta gambar, dan cantumkan bahwa KA dipakai beserta batasannya" },
      { key: "B", text: "layak karena dibuat cepat" },
      { key: "C", text: "layak karena tampilannya menarik" },
      { key: "D", text: "tidak perlu dicek" }
    ],
    answer: "A",
    explanation: "Penggunaan KA harus memperhatikan akurasi data, hak cipta, dan batasan etis."
  },
  {
    id: 38,
    category: "Lisensi & Atribusi",
    question: "Murid memakai gambar dari internet tanpa mencantumkan sumber. Penilaian dan saran yang tepat adalah …",
    options: [
      { key: "A", text: "cukup menghapus teks poster" },
      { key: "B", text: "tidak masalah karena gambar ada di internet" },
      { key: "C", text: "sudah benar" },
      { key: "D", text: "kurang tepat; cantumkan atribusi lengkap atau ganti dengan aset berlisensi bebas pakai" }
    ],
    answer: "D",
    explanation: "Tanpa sumber, pembuat tidak dihargai dan izin penggunaan tidak jelas."
  },
  {
    id: 39,
    category: "Panduan Gaya Desain",
    question: "Kampanye hemat air untuk remaja. Panduan gaya yang konsisten adalah …",
    options: [
      { key: "A", text: "tujuh warna, lima jenis huruf, dan ikon bebas" },
      { key: "B", text: "2–3 warna utama, 1–2 jenis huruf, dan satu gaya ikon yang sama" },
      { key: "C", text: "tanpa aturan apa pun" },
      { key: "D", text: "satu warna untuk semua unsur" }
    ],
    answer: "B",
    explanation: "Panduan gaya membatasi warna, huruf, dan gaya ikon agar tampilan konsisten."
  },
  {
    id: 40,
    category: "Sistem Data & AI",
    question: "Masalah sampah di kantin sekolah akan ditangani dengan sistem data berbantuan Teachable Machine. Usulan yang tepat adalah …",
    options: [
      { key: "A", text: "menghapus data tiap pekan" },
      { key: "B", text: "mengacak data setiap hari" },
      { key: "C", text: "mengumpulkan foto jenis sampah untuk melatih model pengenal, menyimpan catatan di tabel, dan menyajikan jumlah per jenis dalam grafik" },
      { key: "D", text: "meminta siswa menebak jenis sampah saja" }
    ],
    answer: "C",
    explanation: "Sistem data mencakup pengumpulan, penyimpanan, dan penyajian (grafik), dengan KA sederhana membantu mengenali jenis sampah."
  }
];

// ============================================================================
// PAKET 2: SMA KELAS X - INFORMATIKA & IOT ARDUINO WOKWI - 30 SOAL
// ============================================================================
const SMA_IOT_QUESTIONS = [
  {
    id: 1,
    category: "Konsep Variabel & Penyimpanan Data",
    question: "Sensor HC-SR04 di Wokwi menghasilkan nilai jarak yang berubah setiap 0,5 detik. Program perlu menyimpan nilai terbaru itu sementara untuk dibandingkan dengan batas. Konsep pemrograman yang paling sesuai adalah...",
    options: [
      { key: "A", text: "Konstanta, karena nilainya harus tetap" },
      { key: "B", text: "Variabel, karena nilainya berubah-ubah dan disimpan sementara di memori" },
      { key: "C", text: "Komentar, karena hanya catatan untuk pembaca" },
      { key: "D", text: "Library, karena menyimpan perintah bawaan" }
    ],
    answer: "B",
    explanation: "Nilai jarak berubah dan harus diingat/disimpan sementara, itulah karakteristik utama variabel di memori mikroprosesor."
  },
  {
    id: 2,
    category: "Konsep Variabel & Penyimpanan Data",
    question: "Fitur tambahan akan menghitung berapa kali objek melanggar batas. Nilai awalnya 0 dan bertambah 1 setiap ada pelanggaran. Deklarasi yang paling tepat adalah...",
    options: [
      { key: "A", text: "const int pelanggar = 0;" },
      { key: "B", text: "bool pelanggar = false;" },
      { key: "C", text: "int pelanggar = 0;" },
      { key: "D", text: "String pelanggar = \"0\";" }
    ],
    answer: "C",
    explanation: "Penghitung butuh bilangan bulat (integer) yang nilainya dapat dimodifikasi. 'const' tidak dapat diubah, 'bool' hanya dua keadaan, dan 'String' adalah tipe teks."
  },
  {
    id: 3,
    category: "Konsep Variabel & Penyimpanan Data",
    question: "Agar nilai 'pelanggar' tetap diingat antar putaran dan bisa dipakai di loop(), deklarasi 'int pelanggar = 0;' sebaiknya ditaruh...",
    options: [
      { key: "A", text: "di dalam loop()" },
      { key: "B", text: "di dalam setup()" },
      { key: "C", text: "di dalam blok if" },
      { key: "D", text: "di luar setup() dan loop() (sebagai variabel global)" }
    ],
    answer: "D",
    explanation: "Variabel global (dideklarasikan di luar semua fungsi) bertahan di memori antar siklus eksekusi loop(). Jika di dalam loop(), nilainya akan di-reset setiap putaran."
  },
  {
    id: 4,
    category: "Konsep Variabel & Penyimpanan Data",
    question: "Skema Wokwi menyambungkan kaki anoda LED ke pin 8. Program berisi:\nconst int LED_PIN = 7;\nLED tidak pernah menyala. Penyebab utama adalah...",
    options: [
      { key: "A", text: "nomor LED_PIN di kode (7) tidak sama dengan pin tempat kabel LED dipasang (8)" },
      { key: "B", text: "tipe int tidak boleh dipakai untuk nomor pin" },
      { key: "C", text: "nilai delay terlalu pendek" },
      { key: "D", text: "LED hanya bisa dipakai dengan tipe float" }
    ],
    answer: "A",
    explanation: "Nomor pin yang dideklarasikan pada kode program harus sama persis dengan koneksi pin fisik/kabel di diagram Wokwi."
  },
  {
    id: 5,
    category: "Konsep Variabel & Penyimpanan Data",
    question: "Kabel buzzer dipasang ke pin 7, sedangkan kode berisi 'const int BUZZER_PIN = 6;' dan buzzer tidak berbunyi. Perbaikan yang tepat adalah...",
    options: [
      { key: "A", text: "mengubah tipe data menjadi float" },
      { key: "B", text: "menambahkan delay(6)" },
      { key: "C", text: "menyamakan nomor pin di kode dan kabel, misalnya mengubah kode menjadi 7" },
      { key: "D", text: "menghapus kata const" }
    ],
    answer: "C",
    explanation: "Sinkronisasi antara nomor pin kode perangkat lunak dan port perangkat keras adalah langkah pertama troubleshooting rangkaian digital."
  },
  {
    id: 6,
    category: "Konsep Variabel & Penyimpanan Data",
    question: "Siswa menulis konstanta batas jarak: 'const int BATAS = 30;'. Pengaruh kata 'const' pada variabel tersebut adalah...",
    options: [
      { key: "A", text: "nilai BATAS dapat diubah di dalam loop()" },
      { key: "B", text: "nilai BATAS dikunci dan program akan error jika ada baris yang mencoba mengubahnya" },
      { key: "C", text: "BATAS otomatis menjadi pin input" },
      { key: "D", text: "BATAS hanya bisa bernilai negatif" }
    ],
    answer: "B",
    explanation: "Keyword 'const' melindungi variabel agar bernilai konstan dan tidak sengaja diubah oleh baris instruksi lain selama program berjalan."
  },
  {
    id: 7,
    category: "Perancangan Alur Program (Flowchart & Pseudocode)",
    question: "Alur kerja alat penjaga batas jarak: baca jarak -> bandingkan dengan batas 30 cm -> jika jarak < 30 cm, bunyikan alarm. Simbol flowchart yang tepat untuk baris 'apakah jarak < 30 cm?' adalah...",
    options: [
      { key: "A", text: "Persegi panjang (proses)" },
      { key: "B", text: "Belah ketupat (keputusan/decision)" },
      { key: "C", text: "Jajar genjang (input/output)" },
      { key: "D", text: "Oval (terminator)" }
    ],
    answer: "B",
    explanation: "Simbol belah ketupat (diamond) melambangkan pengambilan keputusan dengan cabang Ya/Tidak (True/False)."
  },
  {
    id: 8,
    category: "Perancangan Alur Program (Flowchart & Pseudocode)",
    question: "Pseudocode:\nBACA jarak\nJIKA jarak < 30 MAKA\n  NYALAKAN buzzer dan LED\nSELAIN ITU\n  MATIKAN buzzer dan LED\nAKHIR JIKA\nJika jarak terdeteksi 45 cm, kondisi buzzer dan LED adalah...",
    options: [
      { key: "A", text: "buzzer menyala, LED mati" },
      { key: "B", text: "keduanya menyala" },
      { key: "C", text: "keduanya mati" },
      { key: "D", text: "hanya LED menyala berkedip" }
    ],
    answer: "C",
    explanation: "Kondisi 45 < 30 bernilai salah (False), sehingga alur mengeksekusi blok SELAIN ITU (keduanya dimatikan)."
  },
  {
    id: 9,
    category: "Perancangan Alur Program (Flowchart & Pseudocode)",
    question: "Ketika jarak = 30 cm persis pada kondisi 'JIKA jarak < 30', hasil evaluasi logika dan aksi yang diambil adalah...",
    options: [
      { key: "A", text: "kondisi Benar, buzzer menyala" },
      { key: "B", text: "kondisi Salah, masuk ke blok SELAIN ITU (mati)" },
      { key: "C", text: "program berhenti seketika" },
      { key: "D", text: "buzzer berbunyi setengah kekuatan" }
    ],
    answer: "B",
    explanation: "30 tidak lebih kecil dari 30 (30 < 30 adalah False). Jika ingin angka 30 ikut memicu, harus digunakan operator <=."
  },
  {
    id: 10,
    category: "Perancangan Alur Program (Flowchart & Pseudocode)",
    question: "Pseudocode berulang:\nULANGI SELAMANYA:\n  BACA jarak\n  TAMPILKAN jarak ke Serial Monitor\n  TUNGGU 500 milidetik\nAKHIR ULANGI\nBagian yang setara dengan 'ULANGI SELAMANYA' pada struktur Arduino adalah...",
    options: [
      { key: "A", text: "setup()" },
      { key: "B", text: "loop()" },
      { key: "C", text: "#include" },
      { key: "D", text: "pinMode()" }
    ],
    answer: "B",
    explanation: "Fungsi loop() pada Arduino dirancang untuk dieksekusi terus-menerus tanpa henti selama mikrokontroler mendapat daya."
  },
  {
    id: 11,
    category: "Penyusunan Kode Struktur Arduino",
    question: "Dua fungsi wajib pada setiap sketch Arduino adalah...",
    options: [
      { key: "A", text: "start() dan finish()" },
      { key: "B", text: "input() dan output()" },
      { key: "C", text: "setup() dan loop()" },
      { key: "D", text: "main() dan end()" }
    ],
    answer: "C",
    explanation: "Compiler Arduino mewajibkan keberadaan void setup() untuk inisialisasi awal dan void loop() untuk eksekusi utama."
  },
  {
    id: 12,
    category: "Penyusunan Kode Struktur Arduino",
    question: "Instruksi yang tepat ditaruh di dalam setup() adalah...",
    options: [
      { key: "A", text: "pembacaan sensor berulang kali" },
      { key: "B", text: "pinMode(LED_PIN, OUTPUT); dan Serial.begin(9600);" },
      { key: "C", text: "pengecekan kondisi if jarak" },
      { key: "D", text: "delay alarm 5 menit" }
    ],
    answer: "B",
    explanation: "setup() hanya dijalankan satu kali saat booting, ideal untuk konfigurasi pin I/O dan komunikasi serial."
  },
  {
    id: 13,
    category: "Penyusunan Kode Struktur Arduino",
    question: "Jika baris 'pinMode(LED_PIN, OUTPUT);' tidak sengaja ditaruh di dalam loop(), akibat yang paling tepat adalah...",
    options: [
      { key: "A", text: "mikrokontroler meledak seketika" },
      { key: "B", text: "program tetap berjalan namun pemborosan proses konfigurasi pin berulang setiap siklus" },
      { key: "C", text: "LED otomatis menjadi sensor input" },
      { key: "D", text: "Arduino tidak dapat dikompilasi sama sekali" }
    ],
    answer: "B",
    explanation: "Secara fungsional program jalan, tetapi mengulang konfigurasi hardware setiap milidetik adalah inefisiensi arsitektur kode."
  },
  {
    id: 14,
    category: "Penyusunan Kode Struktur Arduino",
    question: "Kode berikut:\nvoid setup() {\n  pinMode(8, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(8, HIGH);\n  delay(1000);\n  digitalWrite(8, LOW);\n  delay(1000);\n}\nPerilaku LED yang terhubung pada pin 8 adalah...",
    options: [
      { key: "A", text: "menyala terus tanpa mati" },
      { key: "B", text: "berkedip hidup 1 detik lalu mati 1 detik bergantian terus-menerus" },
      { key: "C", text: "hanya berkedip satu kali lalu padam" },
      { key: "D", text: "mati total" }
    ],
    answer: "B",
    explanation: "HIGH menyalakan LED selama 1000 ms, lalu LOW memadamkannya selama 1000 ms berulang-ulang di dalam loop()."
  },
  {
    id: 15,
    category: "Konfigurasi Pin I/O & Sensor HC-SR04",
    question: "Pin TRIG pada sensor HC-SR04 berfungsi memancarkan pulsa ultrasonik, sedangkan pin ECHO menerima pantulan. Konfigurasi pinMode yang benar adalah...",
    options: [
      { key: "A", text: "TRIG sebagai INPUT, ECHO sebagai OUTPUT" },
      { key: "B", text: "TRIG sebagai OUTPUT, ECHO sebagai INPUT" },
      { key: "C", text: "keduanya sebagai INPUT" },
      { key: "D", text: "keduanya sebagai OUTPUT" }
    ],
    answer: "B",
    explanation: "TRIG mengirim sinyal (OUTPUT dari mikrokontroler), ECHO menangkap sinyal pantul (INPUT ke mikrokontroler)."
  },
  {
    id: 16,
    category: "Konfigurasi Pin I/O & Sensor HC-SR04",
    question: "Fungsi bawaan Arduino yang digunakan untuk mengukur durasi pulsa HIGH pada pin ECHO adalah...",
    options: [
      { key: "A", text: "digitalRead()" },
      { key: "B", text: "pulseIn()" },
      { key: "C", text: "analogRead()" },
      { key: "D", text: "delayMicroseconds()" }
    ],
    answer: "B",
    explanation: "pulseIn(ECHO_PIN, HIGH) mengukur berapa mikrodetik pin ECHO bertahan dalam status HIGH."
  },
  {
    id: 17,
    category: "Konfigurasi Pin I/O & Sensor HC-SR04",
    question: "Rumus konversi jarak (cm) dari durasi pantulan ultrasonik adalah 'jarak = durasi * 0.034 / 2'. Alasan mengapa harus dibagi 2 adalah...",
    options: [
      { key: "A", text: "karena sensor memiliki 2 pin daya (VCC dan GND)" },
      { key: "B", text: "gelombang suara menempuh perjalanan bolak-balik (pergi ke objek lalu memantul kembali)" },
      { key: "C", text: "kecepatan suara terbagi dua di udara" },
      { key: "D", text: "agar nilai jarak menjadi bilangan bulat" }
    ],
    answer: "B",
    explanation: "Durasi yang tercatat mencakup waktu rambat ke sasaran ditambah waktu kembali ke penerima (jarak tempuh 2 kali lipat)."
  },
  {
    id: 18,
    category: "Konfigurasi Pin I/O & Sensor HC-SR04",
    question: "Untuk membunyikan buzzer pasif dengan frekuensi tertentu di pin 7, perintah Arduino yang paling tepat adalah...",
    options: [
      { key: "A", text: "tone(7, 1000);" },
      { key: "B", text: "digitalWrite(7, HIGH);" },
      { key: "C", text: "analogWrite(7, 1000);" },
      { key: "D", text: "Serial.print(7);" }
    ],
    answer: "A",
    explanation: "tone(pin, frekuensi) menghasilkan gelombang kotak PWM dengan frekuensi spesifik (misal 1000 Hz) untuk speaker/buzzer pasif."
  },
  {
    id: 19,
    category: "Percabangan Logika (If-Else)",
    question: "Aturan alarm: jika jarak < 30 cm, buzzer berbunyi, jika tidak maka mati. Kode yang tepat adalah...",
    options: [
      { key: "A", text: "if (jarak < 30) { tone(7, 1000); } else { noTone(7); }" },
      { key: "B", text: "if (jarak > 30) { tone(7, 1000); } else { noTone(7); }" },
      { key: "C", text: "if (jarak == 30) { noTone(7); }" },
      { key: "D", text: "while (jarak < 30) { tone(7, 1000); }" }
    ],
    answer: "A",
    explanation: "Kondisi 'jarak < 30' mengevaluasi objek yang mendekati batas, mengaktifkan tone(7, 1000), dan else mematikannya dengan noTone(7)."
  },
  {
    id: 20,
    category: "Percabangan Logika (If-Else)",
    question: "Siswa ingin membuat 2 zona peringatan:\n1. Jarak < 15 cm: buzzer bunyi frekuensi tinggi (2000 Hz)\n2. Jarak 15-30 cm: buzzer bunyi frekuensi rendah (1000 Hz)\n3. Jarak >= 30 cm: aman (mati)\nStruktur kendali yang paling sesuai adalah...",
    options: [
      { key: "A", text: "if tunggal" },
      { key: "B", text: "if - else if - else bertingkat" },
      { key: "C", text: "switch case string" },
      { key: "D", text: "perulangan for" }
    ],
    answer: "B",
    explanation: "Pengecekan multi-kondisi dengan rentang nilai terurut paling bersih dan terstruktur dibuat menggunakan if - else if - else."
  },
  {
    id: 21,
    category: "Komunikasi Serial & Debugging",
    question: "Kecepatan transfer data (baud rate) yang umum dipakai pada perintah 'Serial.begin(9600);' memiliki arti...",
    options: [
      { key: "A", text: "program menunggu selama 9600 detik" },
      { key: "B", text: "kecepatan transmisi data serial sebesar 9600 bit per detik" },
      { key: "C", text: "sensor mampu mengukur hingga 9600 cm" },
      { key: "D", text: "maksimal data yang disimpan 9600 byte" }
    ],
    answer: "B",
    explanation: "9600 baud rate mendefinisikan kecepatan komunikasi UART antara mikroprosesor ATMega328P dengan komputer/Serial Monitor."
  },
  {
    id: 22,
    category: "Komunikasi Serial & Debugging",
    question: "Perbedaan utama antara Serial.print() dan Serial.println() adalah...",
    options: [
      { key: "A", text: "Serial.println() otomatis menambahkan baris baru (Enter) di akhir output teks" },
      { key: "B", text: "Serial.print() hanya untuk angka, Serial.println() untuk teks" },
      { key: "C", text: "Serial.println() menampilkan pesan dengan warna merah" },
      { key: "D", text: "tidak ada perbedaan sama sekali" }
    ],
    answer: "A",
    explanation: "'ln' adalah singkatan dari line, yang menyisipkan karakter newline (\\n\\r) di akhir data."
  },
  {
    id: 23,
    category: "Komunikasi Serial & Debugging",
    question: "Pada Serial Monitor di simulator Wokwi muncul teks acak berantakan (gibberish/tanda tanya). Tindakan perbaikan pertama adalah...",
    options: [
      { key: "A", text: "mengganti kabel USB simulator" },
      { key: "B", text: "menyamakan baud rate Serial Monitor dengan nilai di Serial.begin() (misal 9600)" },
      { key: "C", text: "menghapus semua variabel" },
      { key: "D", text: "menaikkan tegangan catu daya" }
    ],
    answer: "B",
    explanation: "Karakter aneh pada UART selalu disebabkan oleh ketidakcocokan baud rate antara pengirim (Arduino) dan penerima (Monitor)."
  },
  {
    id: 24,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Pesan kesalahan kompilasi: 'expected ';' before '}' token'. Penyebab umumnya adalah...",
    options: [
      { key: "A", text: "lupa menuliskan tanda titik koma (;) pada baris sebelumnya" },
      { key: "B", text: "nama variabel terlalu panjang" },
      { key: "C", text: "LED dipasang terbalik" },
      { key: "D", text: "pin tidak mendukung PWM" }
    ],
    answer: "A",
    explanation: "Bahasa C/C++ mewajibkan setiap pernyataan baris instruksi diakhiri dengan semikolon (;)."
  },
  {
    id: 25,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Kode berisi:\nif (jarak = 30) {\n  digitalWrite(LED, HIGH);\n}\nSaat dijalankan, LED selalu menyala meskipun jarak 100 cm. Kesalahan logika pada kode tersebut adalah...",
    options: [
      { key: "A", text: "menggunakan operator penugasan '=' alih-alih operator perbandingan '=='" },
      { key: "B", text: "LED_PIN harus berupa float" },
      { key: "C", text: "tidak ada kurung kurawal siku" },
      { key: "D", text: "fungsi loop belum diaktifkan" }
    ],
    answer: "A",
    explanation: "'=' adalah assignment (mengisi variabel jarak menjadi 30 sehingga ekspresi bernilai True terus menerus). Perbandingan wajib menggunakan '=='."
  },
  {
    id: 26,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Sensor HC-SR04 selalu membaca jarak 0 cm terus menerus di Wokwi. Kemungkinan penyebab rangkaian adalah...",
    options: [
      { key: "A", text: "kabel pin TRIG dan ECHO tertukar sambungannya pada board Arduino" },
      { key: "B", text: "nilai baud rate terlalu tinggi" },
      { key: "C", text: "resistor LED terlalu kecil" },
      { key: "D", text: "kabel buzzer korslet" }
    ],
    answer: "A",
    explanation: "Jika TRIG dan ECHO terbalik, pulsa pemicu tidak sampai dan pulseIn() pada ECHO tidak mendeteksi pantulan, menghasilkan waktu 0."
  },
  {
    id: 27,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Program berisi 'serial.begin(9600);' dan muncul pesan 'error: serial was not declared in this scope'. Penyebab utamanya adalah...",
    options: [
      { key: "A", text: "objek harus ditulis Serial dengan huruf S kapital" },
      { key: "B", text: "angka 9600 tidak valid" },
      { key: "C", text: "kurang titik koma" },
      { key: "D", text: "begin harus ditulis di loop()" }
    ],
    answer: "A",
    explanation: "Objek komunikasi UART di Arduino library didefinisikan dengan nama kelas 'Serial' (case-sensitive, huruf awal S kapital)."
  },
  {
    id: 28,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Gambar rangkaian di Wokwi menampilkan semua kabel berwarna sama, saling menyilang, dan tidak teratur. Dampaknya pada proses troubleshooting adalah...",
    options: [
      { key: "A", text: "tidak berpengaruh karena simulator memperbaiki kabel otomatis" },
      { key: "B", text: "mempercepat pencarian masalah karena kabelnya banyak" },
      { key: "C", text: "hanya memengaruhi tampilan, bukan waktu pencarian masalah" },
      { key: "D", text: "menyulitkan penelusuran sambungan sehingga mencari sumber masalah lebih lama dan rawan salah" }
    ],
    answer: "D",
    explanation: "Standar pewarnaan kabel (merah=VCC, hitam=GND, warna berbeda untuk sinyal) esensial untuk kemudahan pembacaan skema rangkaian."
  },
  {
    id: 29,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Spesifikasi: jarak < 10 cm, buzzer dan LED menyala; jarak 10-29 cm, hanya LED menyala; jarak >= 30 cm, keduanya mati. (BUZZER=7, LED=8). Kode:\nif (jarak < 30) {\n  if (jarak < 10) {\n    digitalWrite(BUZZER, LOW); digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(BUZZER, HIGH); digitalWrite(LED, HIGH);\n  }\n} else {\n  digitalWrite(BUZZER, LOW); digitalWrite(LED, LOW);\n}\nPerbaikan yang tepat adalah...",
    options: [
      { key: "A", text: "menukar HIGH dan LOW pada blok else terluar" },
      { key: "B", text: "menukar nilai buzzer pada if dalam: HIGH saat jarak < 10, dan LOW pada else dalamnya" },
      { key: "C", text: "mengganti BATAS menjadi 10" },
      { key: "D", text: "menghapus if yang di dalam" }
    ],
    answer: "B",
    explanation: "Pada kondisi jarak < 10 cm buzzer seharusnya berbunyi (HIGH), sedangkan saat 10-29 cm buzzer mati (LOW)."
  },
  {
    id: 30,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Perhatikan kode yang sudah benar:\nif (jarak < 30) {\n  if (jarak < 10) {\n    digitalWrite(BUZZER, HIGH); digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(BUZZER, LOW); digitalWrite(LED, HIGH);\n  }\n} else {\n  digitalWrite(BUZZER, LOW); digitalWrite(LED, LOW);\n}\nUntuk jarak = 20 cm, kondisi aktuatornya adalah...",
    options: [
      { key: "A", text: "buzzer dan LED menyala" },
      { key: "B", text: "hanya buzzer menyala" },
      { key: "C", text: "hanya LED menyala" },
      { key: "D", text: "buzzer dan LED mati" }
    ],
    answer: "C",
    explanation: "Nilai 20 memenuhi syarat jarak < 30, tetapi tidak memenuhi jarak < 10, sehingga masuk ke blok else dalam: BUZZER LOW (mati) dan LED HIGH (menyala)."
  }
];

// ============================================================================
// PAKET 3: BAHASA INGGRIS - READING, WRITING & LISTENING (TEXT-TO-SPEECH TTS)
// ============================================================================
const ENGLISH_PRACTICE_QUESTIONS = [
  // --- LISTENING SECTION (Menggunakan TTS Audio Interaktif) ---
  {
    id: 1,
    type: "listening",
    category: "Listening: Daily Conversation",
    audioText: "Hello, Sarah! Are you coming to the science exhibition at school this afternoon? The bus will leave at one thirty sharp.",
    audioSpeed: 1.0,
    maxPlays: 2,
    question: "According to the speaker, what time does the school bus leave for the exhibition?",
    options: [
      { key: "A", text: "At 12:30" },
      { key: "B", text: "At 1:30 sharp" },
      { key: "C", text: "At 2:00" },
      { key: "D", text: "At 3:15" }
    ],
    answer: "B",
    explanation: "The speaker explicitly stated: 'The bus will leave at one thirty sharp (1:30).'"
  },
  {
    id: 2,
    type: "listening",
    category: "Listening: Public Announcement",
    audioText: "Attention all passengers of flight Garuda Indonesia GA 420 to Gorontalo. Please proceed to gate number four immediately as boarding has just commenced.",
    audioSpeed: 0.9,
    maxPlays: 2,
    question: "Where should the passengers of flight GA 420 to Gorontalo proceed?",
    options: [
      { key: "A", text: "Gate number two" },
      { key: "B", text: "Gate number four" },
      { key: "C", text: "Arrival hall" },
      { key: "D", text: "Baggage counter" }
    ],
    answer: "B",
    explanation: "The announcement clearly announces: 'Please proceed to gate number four immediately.'"
  },
  {
    id: 3,
    type: "listening",
    category: "Listening: Short Monologue",
    audioText: "Bacharuddin Jusuf Habibie was the third President of Indonesia. He was internationally renowned as a brilliant aeronautical engineer who designed modern aircraft.",
    audioSpeed: 1.0,
    maxPlays: 2,
    question: "What was B.J. Habibie internationally renowned for?",
    options: [
      { key: "A", text: "A famous soccer player" },
      { key: "B", text: "A brilliant aeronautical engineer designing aircraft" },
      { key: "C", text: "A sea captain" },
      { key: "D", text: "A traditional chef" }
    ],
    answer: "B",
    explanation: "The audio described him as a 'brilliant aeronautical engineer who designed modern aircraft.'"
  },
  {
    id: 4,
    type: "listening",
    category: "Listening: Instructions",
    audioText: "Before operating the blender, make sure the lid is firmly locked. Next, plug in the power cord and select speed level two for smooth juice.",
    audioSpeed: 0.95,
    maxPlays: 2,
    question: "What must you do first before plugging in the power cord?",
    options: [
      { key: "A", text: "Wash the vegetables" },
      { key: "B", text: "Make sure the lid is firmly locked" },
      { key: "C", text: "Turn on the oven" },
      { key: "D", text: "Drink the juice" }
    ],
    answer: "B",
    explanation: "The audio says: 'Before operating the blender, make sure the lid is firmly locked.'"
  },
  {
    id: 5,
    type: "listening",
    category: "Listening: Dialogue at the Library",
    audioText: "Excuse me, sir. May I borrow this English grammar handbook for three days? Yes, you can, but make sure to return it before Friday afternoon.",
    audioSpeed: 1.0,
    maxPlays: 2,
    question: "When is the deadline to return the borrowed handbook?",
    options: [
      { key: "A", text: "Before Friday afternoon" },
      { key: "B", text: "Next Monday morning" },
      { key: "C", text: "In two weeks" },
      { key: "D", text: "Tomorrow morning" }
    ],
    answer: "A",
    explanation: "The librarian replies: 'make sure to return it before Friday afternoon.'"
  },

  // --- READING COMPREHENSION SECTION ---
  {
    id: 6,
    type: "reading",
    category: "Reading: Descriptive Text",
    readingPassage: "Lake Limboto is a prominent wetland located in Gorontalo Regency, Sulawesi. It serves as an essential habitat for numerous migratory bird species and supports local freshwater fisheries. In recent years, local communities and authorities have collaborated on conservation efforts to preserve its pristine aquatic ecosystem.",
    question: "What is one main benefit of Lake Limboto mentioned in the passage?",
    options: [
      { key: "A", text: "It is an industrial factory center" },
      { key: "B", text: "It serves as an essential habitat for migratory birds and supports local fisheries" },
      { key: "C", text: "It is an airport runaway" },
      { key: "D", text: "It is a dry desert area" }
    ],
    answer: "B",
    explanation: "The passage notes: 'It serves as an essential habitat for numerous migratory bird species and supports local freshwater fisheries.'"
  },
  {
    id: 7,
    type: "reading",
    category: "Reading: Vocabulary in Context",
    readingPassage: "In the sentence: 'In recent years, local communities and authorities have collaborated on conservation efforts to preserve its pristine aquatic ecosystem.'",
    question: "The word 'pristine' is closest in meaning to...",
    options: [
      { key: "A", text: "Polluted" },
      { key: "B", text: "Pure and unspoiled" },
      { key: "C", text: "Crowded" },
      { key: "D", text: "Dangerous" }
    ],
    answer: "B",
    explanation: "'Pristine' means remaining in its pure, original, and unspoiled condition."
  },
  {
    id: 8,
    type: "reading",
    category: "Reading: Recount Text",
    readingPassage: "Last Saturday, our school organized a green tree-planting activity around the BPMP Gorontalo complex. All tenth-grade students participated enthusiastically. We successfully planted fifty mahogany trees and watered them thoroughly before noon.",
    question: "How many mahogany trees did the students successfully plant?",
    options: [
      { key: "A", text: "Fifteen trees" },
      { key: "B", text: "Fifty trees" },
      { key: "C", text: "One hundred trees" },
      { key: "D", text: "Five trees" }
    ],
    answer: "B",
    explanation: "The recount passage explicitly states: 'We successfully planted fifty mahogany trees.'"
  },
  {
    id: 9,
    type: "reading",
    category: "Reading: Report Text",
    readingPassage: "Solar panels convert energy from sunlight into clean electricity using photovoltaic cells. Unlike fossil fuel power plants, solar energy systems produce zero carbon emissions during operation, making them a sustainable choice for school buildings.",
    question: "Why are solar energy systems considered a sustainable choice?",
    options: [
      { key: "A", text: "Because they produce zero carbon emissions during operation" },
      { key: "B", text: "Because they consume large amounts of gasoline" },
      { key: "C", text: "Because they work only at midnight" },
      { key: "D", text: "Because they are noisy" }
    ],
    answer: "A",
    explanation: "The text explains: 'solar energy systems produce zero carbon emissions during operation.'"
  },

  // --- WRITING & GRAMMAR SECTION ---
  {
    id: 10,
    type: "writing",
    category: "Writing: Grammar & Tenses",
    question: "Complete the sentence with the correct verb form: 'While Ahmad _______ the computer code, his teammate tested the hardware sensor.'",
    options: [
      { key: "A", text: "was writing" },
      { key: "B", text: "writes" },
      { key: "C", text: "is write" },
      { key: "D", text: "will write" }
    ],
    answer: "A",
    explanation: "Past continuous tense ('was writing') is used for an ongoing past action interrupted by or happening alongside another past action ('tested')."
  },
  {
    id: 11,
    type: "writing",
    category: "Writing: Word Order / Sentence Structure",
    question: "Rearrange these words into a grammatically correct sentence: [ posters / students / create / creative / the / must ]",
    options: [
      { key: "A", text: "Posters the creative must students create." },
      { key: "B", text: "The students must create creative posters." },
      { key: "C", text: "Must create the students creative posters." },
      { key: "D", text: "Creative posters create must the students." }
    ],
    answer: "B",
    explanation: "The correct standard English word order is: Subject (The students) + Modal Verb (must) + Main Verb (create) + Object (creative posters)."
  },
  {
    id: 12,
    type: "writing",
    category: "Writing: Passive Voice",
    question: "Change this active sentence into passive voice: 'The students designed an interactive poster about digital privacy.'",
    options: [
      { key: "A", text: "An interactive poster about digital privacy was designed by the students." },
      { key: "B", text: "An interactive poster about digital privacy is designing by students." },
      { key: "C", text: "The students was designed by an interactive poster." },
      { key: "D", text: "An interactive poster designs the students." }
    ],
    answer: "A",
    explanation: "Simple past passive formula: Object + was/were + Verb 3 (past participle) + by Subject -> 'An interactive poster ... was designed by the students.'"
  },
  {
    id: 13,
    type: "writing",
    category: "Writing: Conjunctions",
    question: "Choose the best conjunction: 'We arrived early at the computer lab _______ we could prepare our presentation slides.'",
    options: [
      { key: "A", text: "so that" },
      { key: "B", text: "although" },
      { key: "C", text: "however" },
      { key: "D", text: "unless" }
    ],
    answer: "A",
    explanation: "'So that' expresses purpose (kami datang lebih awal agar/sehingga kami bisa mempersiapkan slide presentasi)."
  },
  {
    id: 14,
    type: "listening",
    category: "Listening: Telephone Message",
    audioText: "Hi Rizky, this is David calling. Don't forget that our group project discussion is moved from room three to the multimedia room on the second floor.",
    audioSpeed: 1.0,
    maxPlays: 2,
    question: "Where is the group project discussion moved to?",
    options: [
      { key: "A", text: "The canteen" },
      { key: "B", text: "Room three" },
      { key: "C", text: "The multimedia room on the second floor" },
      { key: "D", text: "The library backyard" }
    ],
    answer: "C",
    explanation: "David mentions: 'our group project discussion is moved ... to the multimedia room on the second floor.'"
  },
  {
    id: 15,
    type: "reading",
    category: "Reading: Main Idea",
    readingPassage: "Effective digital campaign posters rely on clear visual hierarchy, concise slogans, and adequate color contrast. When designing a poster, prioritizing readability allows the audience to grasp the essential message within five seconds.",
    question: "What is the primary factor emphasized in creating an effective poster?",
    options: [
      { key: "A", text: "Using as many bright colors as possible" },
      { key: "B", text: "Prioritizing readability through clear visual hierarchy and concise message" },
      { key: "C", text: "Writing long essay paragraphs" },
      { key: "D", text: "Selling commercial merchandise" }
    ],
    answer: "B",
    explanation: "The passage stresses: 'prioritizing readability allows the audience to grasp the essential message within five seconds.'"
  }
];

// ============================================================================
// REGISTRY PAKET BANK SOAL
// ============================================================================
const QUESTION_PACKAGES = {
  "smp_kka_7": {
    id: "smp_kka_7",
    title: "SMP Kelas VII · KKA (Poster Kampanye Digital)",
    shortTitle: "SMP Kelas VII · KKA",
    level: "SMP Kelas VII",
    description: "40 Soal Pilihan Ganda: Tata Letak, Kontras Warna, Hierarki Visual, Lisensi & Hak Cipta, dan Etika Digital",
    icon: "📘",
    classes: [
      { id: "SMP-VII-A", name: "Kelas VII-A" },
      { id: "SMP-VII-B", name: "Kelas VII-B" },
      { id: "SMP-VII-C", name: "Kelas VII-C" },
      { id: "SMP-VII-D", name: "Kelas VII-D" }
    ],
    questions: SMP_KKA_QUESTIONS
  },
  "sma_iot_10": {
    id: "sma_iot_10",
    title: "SMA Kelas X · Informatika & Arduino Wokwi",
    shortTitle: "SMA Kelas X · IoT",
    level: "SMA Kelas X",
    description: "30 Soal Pilihan Ganda: Variabel, Pin I/O, Sensor HC-SR04, Percabangan Logika, dan Debugging",
    icon: "💻",
    classes: [
      { id: "SMA-SNT-XA", name: "Kelas X-A" },
      { id: "SMA-SNT-XB", name: "Kelas X-B" }
    ],
    questions: SMA_IOT_QUESTIONS
  },
  "english_all": {
    id: "english_all",
    title: "Bahasa Inggris · Reading, Writing & Listening (TTS Audio)",
    shortTitle: "Bahasa Inggris · TTS",
    level: "SMP & SMA",
    description: "Reading Comprehension, Sentence Building/Writing, dan Audio Listening Interaktif dengan Text-to-Speech",
    icon: "🎧",
    classes: [
      { id: "ENG-CLASS-7", name: "Kelas 7 English" },
      { id: "ENG-CLASS-8", name: "Kelas 8 English" },
      { id: "ENG-CLASS-9", name: "Kelas 9 English" },
      { id: "ENG-CLASS-10", name: "Kelas X English" }
    ],
    questions: ENGLISH_PRACTICE_QUESTIONS
  }
};

// Default export untuk kompatibilitas script lama
window.QUESTION_PACKAGES = QUESTION_PACKAGES;
window.DEFAULT_QUESTIONS = SMP_KKA_QUESTIONS; // Default sekarang mengarah ke 40 Soal SMP KKA!
window.SMP_KKA_QUESTIONS = SMP_KKA_QUESTIONS;
window.SMA_IOT_QUESTIONS = SMA_IOT_QUESTIONS;
window.ENGLISH_PRACTICE_QUESTIONS = ENGLISH_PRACTICE_QUESTIONS;
