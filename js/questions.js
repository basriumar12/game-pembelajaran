/**
 * Bank Soal Resmi Arduino & Wokwi (30 Nomor Pilihan Ganda)
 * Skema acuan: Arduino Uno, sensor HC-SR04 (TRIG pin 9, ECHO pin 10), LED merah pin 8, buzzer pin 7.
 * Proyek: Alat penjaga batas jarak
 * Waktu Sesi: 60 Menit
 */

const DEFAULT_QUESTIONS = [
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
    explanation: "Mikrokontroler mengirimkan sinyal ke pin yang tercantum di program. Menyamakan nomor pin pada kode (menjadi 7) akan menyelesaikan masalah."
  },
  {
    id: 6,
    category: "Tipe Data",
    question: "Layar Wokwi menampilkan dua data: jarak hasil hitung 17.35 cm dan jumlah objek yang terdeteksi, yaitu 4. Pasangan tipe data yang sesuai adalah...",
    options: [
      { key: "A", text: "jarak float, jumlah objek int" },
      { key: "B", text: "jarak int, jumlah objek float" },
      { key: "C", text: "jarak String, jumlah objek bool" },
      { key: "D", text: "jarak bool, jumlah objek String" }
    ],
    answer: "A",
    explanation: "Data dengan pecahan desimal (17.35) memerlukan tipe floating point (float), sedangkan nilai cacah/bilangan bulat (4) memakai integer (int)."
  },
  {
    id: 7,
    category: "Tipe Data",
    question: "Perhatikan penggalan program Arduino Uno (SRAM 2 KB):\nlong batasCm = 30;\nlong jumlahObjek = 0; // paling banyak 10\nfloat jarak = 0.0;\nString statusLed = \"MATI\"; // hanya MATI atau NYALA\nPenilaian efisiensi memorinya adalah...",
    options: [
      { key: "A", text: "sudah efisien dan tidak perlu diubah" },
      { key: "B", text: "boros: long dipakai untuk nilai kecil dan String untuk dua pilihan, padahal byte/int dan bool lebih hemat" },
      { key: "C", text: "boros karena jarak memakai float" },
      { key: "D", text: "boros karena nama variabelnya terlalu panjang" }
    ],
    answer: "B",
    explanation: "Tipe 'long' memakan 4 byte, berlebihan untuk angka kecil (<=10), dan objek 'String' sangat boros alokasi heap dibanding 'bool' (1 byte) untuk 2 kondisi."
  },
  {
    id: 8,
    category: "Tipe Data",
    question: "Pada program nomor 7, tipe data paling hemat untuk jumlahObjek (nilai paling banyak 10) adalah...",
    options: [
      { key: "A", text: "long" },
      { key: "B", text: "float" },
      { key: "C", text: "String" },
      { key: "D", text: "byte" }
    ],
    answer: "D",
    explanation: "Tipe 'byte' hanya memerlukan 1 byte memori (rentang nilai 0 - 255), sangat ideal dan paling efisien untuk angka 0 sampai 10."
  },
  {
    id: 9,
    category: "Tipe Data",
    question: "Pembacaan HC-SR04 yang sudah dibulatkan (cm): 8, 64, 301, 400. Tipe data paling efisien untuk menyimpan semua nilai itu adalah...",
    options: [
      { key: "A", text: "byte" },
      { key: "B", text: "int" },
      { key: "C", text: "long" },
      { key: "D", text: "bool" }
    ],
    answer: "B",
    explanation: "Nilai 301 dan 400 melebihi kapasitas maksimum 'byte' (maks 255). 'int' (rentang -32.768 s/d 32.767, 2 byte) adalah pilihan paling hemat yang muat."
  },
  {
    id: 10,
    category: "Struktur Program (setup & loop)",
    question: "Perhatikan anatomi program Arduino:\nvoid setup() { /* ... */ }\nvoid loop()  { /* ... */ }\nPerbedaan fungsi utama keduanya adalah...",
    options: [
      { key: "A", text: "setup() diulang terus-menerus, loop() dijalankan sekali" },
      { key: "B", text: "keduanya dijalankan sekali" },
      { key: "C", text: "setup() dijalankan sekali untuk persiapan awal, loop() diulang terus-menerus" },
      { key: "D", text: "setup() khusus untuk variabel, loop() khusus untuk komentar" }
    ],
    answer: "C",
    explanation: "Fungsi setup() dipanggil tepat sekali saat Arduino menyala/reset untuk inisialisasi pin/serial, sedangkan loop() dieksekusi berulang-ulang tanpa henti."
  },
  {
    id: 11,
    category: "Struktur Program (setup & loop)",
    question: "Perhatikan kode berikut:\nvoid loop() {\n  float jarak = bacaJarak();\n  if (jarak < 30) digitalWrite(7, HIGH);\n  else digitalWrite(7, LOW);\n}\nAlasan logis perintah perbandingan ditaruh di loop() adalah...",
    options: [
      { key: "A", text: "setup() tidak boleh memakai if" },
      { key: "B", text: "loop() selalu lebih cepat daripada setup()" },
      { key: "C", text: "if hanya bisa berjalan bersama delay()" },
      { key: "D", text: "jarak terus berubah, sehingga perbandingan harus diulang untuk setiap pembacaan baru" }
    ],
    answer: "D",
    explanation: "Nilai jarak dari sensor ultrasonik bersifat dinamis. Pemeriksaan kondisi batas harus diulang terus-menerus mengikuti pembacaan sensor terbaru."
  },
  {
    id: 12,
    category: "Struktur Program (setup & loop)",
    question: "Seorang murid menaruh pembacaan sensor dan Serial.println(jarak) hanya di dalam setup(), sedangkan loop() dikosongkan. Selama simulasi Wokwi, slider jarak digeser setiap detik. Yang terjadi adalah...",
    options: [
      { key: "A", text: "Serial Monitor hanya menampilkan satu nilai jarak dan tidak berubah walau slider digeser" },
      { key: "B", text: "Serial Monitor menampilkan nilai jarak yang terus berubah" },
      { key: "C", text: "program gagal dikompilasi karena loop() kosong" },
      { key: "D", text: "LED berkedip terus-menerus" }
    ],
    answer: "A",
    explanation: "Karena kode membaca sensor hanya ditaruh di setup(), pembacaan hanya berlangsung sekali saat startup. Perubahan posisi slider tidak akan diproses lagi."
  },
  {
    id: 13,
    category: "Struktur Program (setup & loop)",
    question: "Perhatikan kode:\nvoid setup() {\n  pinMode(8, OUTPUT);\n  float jarak = bacaJarak(); // slider awal: 100 cm\n  if (jarak < 30) digitalWrite(8, HIGH);\n  else digitalWrite(8, LOW);\n}\nvoid loop() { }\nSetelah simulasi berjalan, slider digeser ke 10 cm. LED akan...",
    options: [
      { key: "A", text: "menyala karena 10 kurang dari 30" },
      { key: "B", text: "tetap mati karena pengecekan hanya dilakukan sekali saat setup()" },
      { key: "C", text: "berkedip" },
      { key: "D", text: "menyebabkan error kompilasi" }
    ],
    answer: "B",
    explanation: "Pengecekan logika if-else dieksekusi saat jarak 100 cm (kondisi salah, LED mati). Karena loop() kosong, status pin 8 tidak pernah dievaluasi ulang."
  },
  {
    id: 14,
    category: "Sintaks Dasar Arduino & I/O",
    question: "Skema Wokwi menyambungkan anoda LED peringatan ke pin 8. Penggalan sintaks yang tepat untuk menyatakan pin itu sebagai keluaran adalah...",
    options: [
      { key: "A", text: "pinMode(8, INPUT);" },
      { key: "B", text: "pinMode(OUTPUT, 8);" },
      { key: "C", text: "pinMode(8, OUTPUT);" },
      { key: "D", text: "digitalWrite(8, OUTPUT);" }
    ],
    answer: "C",
    explanation: "Fungsi untuk menentukan mode pin adalah pinMode(nomorPin, mode). Untuk LED sebagai aktuator output: pinMode(8, OUTPUT);"
  },
  {
    id: 15,
    category: "Sintaks Dasar Arduino & I/O",
    question: "Daftar komponen: HC-SR04 TRIG (pin 9, mengirim pemicu), HC-SR04 ECHO (pin 10, menerima pantulan), LED (pin 8), buzzer (pin 7). Pasangan pin dan deklarasi yang benar adalah...",
    options: [
      { key: "A", text: "pinMode(9, OUTPUT); pinMode(10, INPUT); pinMode(8, OUTPUT); pinMode(7, OUTPUT);" },
      { key: "B", text: "pinMode(9, INPUT); pinMode(10, OUTPUT); pinMode(8, OUTPUT); pinMode(7, OUTPUT);" },
      { key: "C", text: "pinMode(9, OUTPUT); pinMode(10, OUTPUT); pinMode(8, OUTPUT); pinMode(7, OUTPUT);" },
      { key: "D", text: "pinMode(9, OUTPUT); pinMode(10, INPUT); pinMode(8, INPUT); pinMode(7, INPUT);" }
    ],
    answer: "A",
    explanation: "TRIG memancarkan sinyal pulsa (OUTPUT), ECHO membaca pulsa pantulan (INPUT), LED dan Buzzer menerima sinyal kerja (OUTPUT)."
  },
  {
    id: 16,
    category: "Sintaks Dasar Arduino & I/O",
    question: "Buzzer di pin 7 tidak berbunyi. Kodenya:\npinMode(7, OUTPUT);\ndigitalwrite(7, HIGH);\nPerbaikan agar buzzer berbunyi adalah...",
    options: [
      { key: "A", text: "mengganti HIGH menjadi LOW" },
      { key: "B", text: "menghapus pinMode" },
      { key: "C", text: "menambahkan delay(7) di depannya" },
      { key: "D", text: "menulis digitalWrite(7, HIGH); dengan huruf W kapital" }
    ],
    answer: "D",
    explanation: "Bahasa C++/Arduino bersifat case-sensitive. Nama fungsi bawaan yang benar adalah digitalWrite dengan 'W' kapital (bukan digitalwrite)."
  },
  {
    id: 17,
    category: "Sintaks Dasar Arduino & I/O",
    question: "Kode 'digitalWrite(HIGH, 7);' berhasil dikompilasi, tetapi buzzer di pin 7 tetap diam. Penulisan yang benar adalah...",
    options: [
      { key: "A", text: "digitalWrite(7);" },
      { key: "B", text: "digitalWrite(7, HIGH);" },
      { key: "C", text: "digitalWrite(HIGH);" },
      { key: "D", text: "digitalWrite(7, LOW);" }
    ],
    answer: "B",
    explanation: "Sintaks resmi fungsi adalah digitalWrite(pin, nilai). HIGH bernilai numerik 1, sehingga kode salah mencoba menulis ke pin 1 bukan pin 7."
  },
  {
    id: 18,
    category: "Sintaks Dasar Komunikasi Serial",
    question: "Serial Monitor menampilkan log:\nJarak: 45.20 cm\nJarak: 44.80 cm\nJarak: 12.30 cm\nFungsi utama pencetakan data seperti ini bagi pengembang adalah...",
    options: [
      { key: "A", text: "mempercepat kerja sensor" },
      { key: "B", text: "menyimpan data secara permanen di memori" },
      { key: "C", text: "memantau nilai pembacaan sensor saat program berjalan untuk memeriksa kebenaran program" },
      { key: "D", text: "menyalakan LED peringatan" }
    ],
    answer: "C",
    explanation: "Komunikasi serial berfungsi sebagai sarana telemetri dan debugging untuk memverifikasi nilai sensor secara nyata selama pengujian sistem."
  },
  {
    id: 19,
    category: "Sintaks Dasar Komunikasi Serial",
    question: "Data jarak ingin dipantau secara real-time di Serial Monitor. Perintah Serial.begin(9600); sebaiknya ditulis...",
    options: [
      { key: "A", text: "di dalam setup()" },
      { key: "B", text: "di dalam loop()" },
      { key: "C", text: "di luar semua fungsi, sebelum setup()" },
      { key: "D", text: "di dalam blok if" }
    ],
    answer: "A",
    explanation: "Inisialisasi baud rate UART Serial cukup dipanggil satu kali saat sistem boot, yaitu di dalam blok fungsi setup()."
  },
  {
    id: 20,
    category: "Sintaks Dasar Komunikasi Serial",
    question: "Program memakai 'Serial.begin(115200);', sedangkan Serial Monitor diatur 9600, dan layar menampilkan karakter acak yang tidak terbaca. Kesimpulan yang tepat adalah...",
    options: [
      { key: "A", text: "sensor ultrasonik rusak" },
      { key: "B", text: "variabel jarak salah tipe" },
      { key: "C", text: "delay terlalu kecil" },
      { key: "D", text: "baud rate di program tidak sama dengan baud rate Serial Monitor" }
    ],
    answer: "D",
    explanation: "Jika baud rate pengirim (115200 bps) berbeda dengan penerima (9600 bps), waktu sampling bit tidak sinkron dan menghasilkan karakter sampah/gibberish."
  },
  {
    id: 21,
    category: "Sintaks Dasar Komunikasi Serial",
    question: "Pernyataan yang tepat tentang baud rate adalah...",
    options: [
      { key: "A", text: "cukup diatur di sisi Arduino saja" },
      { key: "B", text: "semakin besar angkanya selalu lebih baik" },
      { key: "C", text: "harus sama di Arduino dan di Serial Monitor" },
      { key: "D", text: "menentukan warna tulisan di Serial Monitor" }
    ],
    answer: "C",
    explanation: "Baud rate adalah kecepatan transmisi data dalam bit per detik (bps). Kedua perangkat (mikrokontroler & terminal monitor) wajib memiliki pengaturan yang sama."
  },
  {
    id: 22,
    category: "Kompilasi & Alur Kerja",
    question: "Tahapan berikut disajikan acak: (P) menulis kode di sketch.ino, (Q) mengompilasi kode, (R) simulasi berjalan, (S) mengamati hasil lalu memperbaiki bila perlu. Urutan alur kerja yang benar adalah...",
    options: [
      { key: "A", text: "Q, P, R, S" },
      { key: "B", text: "P, Q, R, S" },
      { key: "C", text: "P, R, Q, S" },
      { key: "D", text: "S, P, Q, R" }
    ],
    answer: "B",
    explanation: "Siklus pengembangan software: Menulis program (P) -> Mengompilasi/Build (Q) -> Menjalankan simulasi/eksekusi (R) -> Observasi dan Debugging (S)."
  },
  {
    id: 23,
    category: "Kompilasi & Alur Kerja",
    question: "Editor menampilkan pesan:\nCompiling sketch...\nSketch uses 1894 bytes (5%) of program storage space. Maximum is 32256 bytes.\nTahapan kerja sistem yang ditunjukkan pesan ini adalah...",
    options: [
      { key: "A", text: "kode diterjemahkan menjadi bahasa mesin dan ukurannya dihitung" },
      { key: "B", text: "data sensor dikirim ke internet" },
      { key: "C", text: "variabel disimpan permanen di EEPROM" },
      { key: "D", text: "kesalahan program diperbaiki otomatis" }
    ],
    answer: "A",
    explanation: "Proses kompilasi menerjemahkan source code C++ ke binary machine code dan mengalkulasi jumlah memori Flash ROM yang dipakai dari total 32 KB."
  },
  {
    id: 24,
    category: "Kompilasi & Alur Kerja",
    question: "Program berhasil dikompilasi, tetapi buzzer berbunyi saat objek jauh. Pernyataan yang tepat tentang perbedaan kesalahan sintaksis dan logika adalah...",
    options: [
      { key: "A", text: "kompilasi yang sukses berarti program pasti benar" },
      { key: "B", text: "kesalahan logika terdeteksi saat kompilasi" },
      { key: "C", text: "keduanya selalu menghentikan proses kompilasi" },
      { key: "D", text: "kesalahan sintaksis terdeteksi saat kompilasi, sedangkan kesalahan logika lolos kompilasi tetapi hasilnya tidak sesuai harapan" }
    ],
    answer: "D",
    explanation: "Compiler hanya memvalidasi tata bahasa (sintaks). Logika algoritma yang keliru tetap lolos kompilasi namun perilakunya tidak sesuai spesifikasi perancang."
  },
  {
    id: 25,
    category: "Kompilasi & Alur Kerja",
    question: "Spesifikasi: buzzer berbunyi saat jarak kurang dari batas. Kode berikut berhasil dikompilasi:\nif (jarak > BATAS_CM) {\n  digitalWrite(7, HIGH);\n}\nBuzzer berbunyi saat objek jauh. Jenis kesalahannya adalah...",
    options: [
      { key: "A", text: "kesalahan sintaksis" },
      { key: "B", text: "kesalahan logika" },
      { key: "C", text: "kesalahan kompilator" },
      { key: "D", text: "tidak ada kesalahan" }
    ],
    answer: "B",
    explanation: "Sintaks penulisan if dan digitalWrite valid, namun operator pembanding terbalik (menggunakan '>' bukannya '<') sehingga merupakan kesalahan logika."
  },
  {
    id: 26,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Program berisi 'pinmode(8, OUTPUT);' dan muncul pesan 'error: pinmode was not declared in this scope'. Penyebab utamanya adalah...",
    options: [
      { key: "A", text: "tanda titik koma hilang" },
      { key: "B", text: "pin 8 tidak ada di Arduino Uno" },
      { key: "C", text: "nama perintah salah huruf besar-kecil (seharusnya pinMode)" },
      { key: "D", text: "kata OUTPUT harus ditulis huruf kecil" }
    ],
    answer: "C",
    explanation: "Fungsi bawaan Arduino case-sensitive dengan gaya CamelCase, wajib ditulis 'pinMode' dengan 'M' besar."
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
    explanation: "Objek komunikasi UART di Arduino library didefinisikan dengan nama kelas 'Serial' (huruf awal 'S' kapital)."
  },
  {
    id: 28,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Gambar rangkaian di Wokwi menampilkan semua kabel berwarna sama, saling menyilang, dan tidak teratur sehingga sulit melihat kabel mana menuju pin mana. Dampaknya pada proses troubleshooting adalah...",
    options: [
      { key: "A", text: "tidak berpengaruh karena simulator memperbaiki kabel otomatis" },
      { key: "B", text: "mempercepat pencarian masalah karena kabelnya banyak" },
      { key: "C", text: "hanya memengaruhi tampilan, bukan waktu pencarian masalah" },
      { key: "D", text: "menyulitkan penelusuran sambungan sehingga mencari sumber masalah lebih lama dan rawan salah" }
    ],
    answer: "D",
    explanation: "Pewarnaan kabel standar (merah=VCC, hitam=GND, warna berbeda untuk sinyal) sangat penting agar debugging fisik/wiring cepat dan tidak rawan korsleting."
  },
  {
    id: 29,
    category: "Diagnosis Kesalahan (Debugging)",
    question: "Spesifikasi: jarak < 10 cm, buzzer dan LED menyala; jarak 10-29 cm, hanya LED menyala; jarak >= 30 cm, keduanya mati. (BUZZER=7, LED=8). Kode:\nif (jarak < 30) {\n  if (jarak < 10) {\n    digitalWrite(BUZZER, LOW); digitalWrite(LED, HIGH);\n  } else {\n    digitalWrite(BUZZER, HIGH); digitalWrite(LED, HIGH);\n  }\n} else {\n  digitalWrite(BUZZER, LOW); digitalWrite(LED, LOW);\n}\nPerancangan ulang yang tepat adalah...",
    options: [
      { key: "A", text: "menukar HIGH dan LOW pada blok else terluar" },
      { key: "B", text: "menukar nilai buzzer pada if dalam: HIGH saat jarak < 10, dan LOW pada else dalamnya" },
      { key: "C", text: "mengganti BATAS menjadi 10" },
      { key: "D", text: "menghapus if yang di dalam" }
    ],
    answer: "B",
    explanation: "Pada jarak sangat dekat (< 10 cm), buzzer harus aktif (HIGH), dan pada jarak sedang (10-29 cm) buzzer mati (LOW). Menukar nilai buzzer di if dalam menyelesaikan masalah."
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

window.DEFAULT_QUESTIONS = DEFAULT_QUESTIONS;
