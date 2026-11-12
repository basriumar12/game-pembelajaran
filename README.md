# BPMP Farm Quest: Gorontalo Edition 🌾🏛️
### Sistem Multi-Player & Dashboard Pemantauan Guru Real-Time

## 👥 1. Cara Bermain Multi-Player (Banyak Siswa/Pemain Sekaligus)

Permainan ini dirancang dapat dimainkan oleh **puluhan hingga ratusan siswa sekaligus** dalam satu sesi kelas atau ruangan:

### Langkah untuk Siswa:
1. Buka tautan game: [`bpmpFarmQuest/index.html`](file:///Users/macbook/Desktop/frelance/gameHtml/bpmpFarmQuest/index.html) di laptop atau *smartphone* masing-masing.
2. Pada modal registrasi awal:
   - **Kode Room / Sesi Kelas**: Masukkan kode room yang diberikan guru (misal: `BPMP-01`, `KELAS-A`, dll.). Seluruh siswa dengan kode room yang sama berada dalam 1 sesi pertandingan.
   - **Nama Lengkap Siswa**: Masukkan nama lengkap.
   - **NIM / NISN**: Masukkan nomor induk siswa.
   - **Instansi / Sekolah**: Masukkan nama sekolah/kampus (misal: *Universitas Negeri Gorontalo*).
   - **Pilih Avatar**: Petani Caping, Pelajar Hijab, atau Peneliti Hijau.
3. Klik **"MASUK & MULAI PERMAINAN"**.
4. Data siswa langsung tersimpan ke Google Sheets sheet `"Peserta"` dan disiarkan secara real-time.
5. Siswa mengocok dadu 3D, melangkah di petak board game kawasan Gedung BPMP Gorontalo, dan menjawab 30 soal kuis pilihan ganda Arduino & Wokwi dalam batas waktu 60 menit.
6. Setiap langkah petak dan jawaban soal secara otomatis disinkronkan ke Google Sheets dan terlihat di layar monitor guru.

---

## 👨‍🏫 2. Cara Guru Memantau (Dashboard Pantauan Guru Live)

Guru/Pengawas dapat membuka halaman pemantauan khusus di layar terpisah, laptop guru, atau proyektor kelas:
👉 **[`bpmpFarmQuest/dashboard-guru.html`](file:///Users/macbook/Desktop/frelance/gameHtml/bpmpFarmQuest/dashboard-guru.html)**

### Fitur Pemantauan Guru:
1. **Spotlight Juara 1 (Urutan Pertama 👑)**:
   - Menampilkan secara mencolok nama siswa yang sedang memimpin di peringkat 1 karena menjawab soal benar terbanyak beserta perolehan poin hasil panen dan tingkat akurasi (%).
2. **Tab Presensi Siswa yang Sudah Masuk**:
   - Menampilkan daftar seluruh siswa yang telah *join/login* ke room: waktu masuk (*timestamp*), nama lengkap, NIM/NISN, asal instansi/sekolah, dan status keaktifan (*Online / Playing / Finished*).
3. **Tab Live Leaderboard (Peringkat Real-Time)**:
   - Diurutkan dari nilai tertinggi & jawaban benar terbanyak.
   - Progress bar visual jawaban benar (hijau) vs salah (merah).
   - Posisi petak 3D terkini yang sedang ditempati siswa di lingkungan BPMP Gorontalo.
4. **Auto-Refresh Real-Time**:
   - Dashboard secara otomatis melakukan pembaruan berkala setiap 4 detik ke Google Sheets Web App serta mendengarkan sinyal instan *BroadcastChannel*.
5. **Ekspor Nilai (CSV)**:
   - Guru dapat mengunduh rekap nilai seluruh siswa ke file CSV / Excel hanya dengan satu klik tombol **"📥 Ekspor Nilai (CSV)"**.

---

## ☁️ 3. Struktur Spreadsheet Backend Google Sheets

Backend Google Apps Script & Integrasi Google Sheets mengelola 3 sheet otomatis:
1. **Sheet `"Peserta"`**:
   `[Timestamp, Room ID, Player ID, Nama Lengkap, NIM / ID, Instansi, Avatar, Status, Skor, Benar, Salah, Petak, Last Ping]`
2. **Sheet `"Scoreboard"`**:
   `[Timestamp, Room ID, Nama Lengkap, NIM / ID, Instansi, Total Poin, Benar, Salah, Durasi, Sisa Waktu]`
3. **Sheet `"Soal"` (Bank Soal Dinamis & Bahasa Inggris)**:
   `[ID Soal, Kategori / Topik, Pertanyaan, Pilihan A, Pilihan B, Pilihan C, Pilihan D, Kunci Jawaban, Pembahasan, Tipe, Audio TTS, Speed Audio, Batas Putar, Reading Passage]`

---

## 🎧 4. Integrasi Soal Google Sheets & Bahasa Inggris (Listening, Reading, Writing)

Game ini mendukung **penggantian soal otomatis** secara real-time langsung dari **Google Sheets**:
- **Guru tinggal memasukkan ID atau Link Google Sheet** di Dashboard Guru (`dashboard-guru.html`) pada tab **"Kelola Bank Soal"**.
- Soal dapat diedit langsung di dashboard guru lalu disimpan ke Google Sheets (tombol *"Simpan ke GSheet"*), atau diedit langsung di baris-baris Google Sheet Anda!
- **Tipe Soal yang Didukung**:
  1. 🎧 **Listening**: Menggunakan naskah dialog/pengumuman bahasa Inggris dengan Text-to-Speech (TTS Web Speech API), kuota batas putar siswa, dan pengatur kecepatan suara.
  2. 📖 **Reading**: Menyajikan teks bacaan/narasi panjang (*reading passage*) sebelum pertanyaan pemahaman konteks.
  3. ✍️ **Writing**: Menguji struktur kalimat, tata bahasa (*grammar, tenses, passive voice, word order*), dan kelengkapan penulisan bahasa Inggris.
  4. 📘 **Standard**: Soal pilihan ganda multi-jenjang (Informatika, IoT Arduino, KKA Poster Kampanye, dsb.).
- **Tautan Siswa Otomatis**:
  Guru cukup menyalin link game siswa melalui tombol *"🔗 Salin Link Game Siswa"*. Link akan memuat parameter `?sheet=ID_GSHEET&package=english_all` sehingga game siswa langsung otomatis membuka paket soal dari Google Sheets guru.
