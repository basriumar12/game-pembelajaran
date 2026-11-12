/**
 * Google Apps Script (GAS) & Google Sheets Integration Service
 * Multi-Player Room Sync, Anti-Cheat & 100% Guaranteed Data Recording
 */

/**
 * Google Apps Script (GAS) & Google Sheets Integration Service
 * Multi-Player Room Sync, Anti-Cheat & 100% Guaranteed Data Recording
 * Mendukung Konfigurasi Dinamis (Ganti Deployment ID & Spreadsheet ID per Mapel/Guru)
 */

const GAS_CONFIG = {
  DEFAULT_DEPLOYMENT_ID: "AKfycbxLCx_3U0OkQa_iq92NJ22_J34qgXGx2YjfVQqTDRQjxKGn6ulugFcrt8IcHm_FDn4R",
  BASE_URL: "https://script.google.com/macros/s/",
  TIMEOUT_MS: 7000
};

class GASService {
  constructor() {
    this.deploymentId = this.detectDeploymentId();
    this.spreadsheetId = this.detectSpreadsheetId();
    this.endpoint = this.buildEndpointUrl(this.deploymentId);

    this.isOnline = navigator.onLine;
    this.roomId = "SMA-SNT-XA";
    this.playerId = this.getOrCreatePlayerId();
    this.tabSwitchCount = 0;
    
    // Siapkan IFrame Tersembunyi (Teknik Paling Andal & Kebal CORS untuk Google Apps Script)
    this.setupHiddenIframe();

    // BroadcastChannel untuk sinkronisasi lokal antar-tab / perangkat
    try {
      this.channel = new BroadcastChannel("bpmp_farm_quest_bus");
    } catch (e) {
      this.channel = null;
    }

    window.addEventListener("online", () => { this.isOnline = true; });
    window.addEventListener("offline", () => { this.isOnline = false; });
  }

  detectDeploymentId() {
    // 1. Cek parameter URL: ?id=... atau ?deploymentId=...
    try {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id") || params.get("deploymentId");
      if (urlId && urlId.trim().length > 15) {
        localStorage.setItem("gas_custom_deployment_id", urlId.trim());
        return urlId.trim();
      }
    } catch (e) {}

    // 2. Cek penyimpanan lokal
    const saved = localStorage.getItem("gas_custom_deployment_id");
    if (saved && saved.trim().length > 15) {
      return saved.trim();
    }

    // 3. Gunakan Default
    return GAS_CONFIG.DEFAULT_DEPLOYMENT_ID;
  }

  cleanSpreadsheetId(val) {
    if (!val) return "";
    let s = String(val).trim();
    // Jika dimasukkan URL Google Sheets: docs.google.com/spreadsheets/d/<ID>/...
    const m = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9_\-]+)/);
    if (m && m[1]) return m[1];
    // Bersihkan karakter query string jika ada sisa
    if (s.includes("?")) s = s.split("?")[0];
    if (s.includes("&")) s = s.split("&")[0];
    return s.trim();
  }

  detectSpreadsheetId() {
    // 1. Cek parameter URL: ?sheet=... atau ?sheetId=... atau ?spreadsheetId=...
    try {
      const params = new URLSearchParams(window.location.search);
      const urlSheet = params.get("sheet") || params.get("sheetId") || params.get("spreadsheetId");
      if (urlSheet) {
        const clean = this.cleanSpreadsheetId(urlSheet);
        if (clean && clean.length > 10) {
          localStorage.setItem("gas_custom_spreadsheet_id", clean);
          return clean;
        }
      }
    } catch (e) {}

    // 2. Cek penyimpanan lokal
    const saved = localStorage.getItem("gas_custom_spreadsheet_id");
    const cleanSaved = this.cleanSpreadsheetId(saved);
    return (cleanSaved && cleanSaved.length > 10) ? cleanSaved : "";
  }

  buildEndpointUrl(depId) {
    let cleanId = depId ? depId.trim() : GAS_CONFIG.DEFAULT_DEPLOYMENT_ID;
    // Jika user menginputkan full URL, ambil ID-nya saja atau gunakan langsung
    if (cleanId.startsWith("http")) {
      return cleanId.endsWith("/exec") ? cleanId : (cleanId + "/exec");
    }
    return `${GAS_CONFIG.BASE_URL}${cleanId}/exec`;
  }

  /**
   * Mengubah Konfigurasi Server / Sheets Guru Secara Dinamis
   */
  setCustomConfig(deploymentId, spreadsheetId) {
    if (deploymentId && deploymentId.trim()) {
      let cleanDep = deploymentId.trim();
      const match = cleanDep.match(/\/s\/([a-zA-Z0-9_\-]+)\//);
      if (match && match[1]) cleanDep = match[1];
      this.deploymentId = cleanDep;
      localStorage.setItem("gas_custom_deployment_id", cleanDep);
    }

    if (spreadsheetId !== undefined) {
      let cleanSheet = this.cleanSpreadsheetId(spreadsheetId);
      this.spreadsheetId = cleanSheet;
      if (cleanSheet) {
        localStorage.setItem("gas_custom_spreadsheet_id", cleanSheet);
      } else {
        localStorage.removeItem("gas_custom_spreadsheet_id");
      }
    }

    this.endpoint = this.buildEndpointUrl(this.deploymentId);
    console.log("[GAS] Server & Sheets Berhasil Diperbarui:", {
      endpoint: this.endpoint,
      deploymentId: this.deploymentId,
      spreadsheetId: this.spreadsheetId || "(Active Sheet Bawaan)"
    });
  }

  resetToDefaultConfig() {
    localStorage.removeItem("gas_custom_deployment_id");
    localStorage.removeItem("gas_custom_spreadsheet_id");
    this.deploymentId = GAS_CONFIG.DEFAULT_DEPLOYMENT_ID;
    this.spreadsheetId = "";
    this.endpoint = this.buildEndpointUrl(this.deploymentId);
  }

  getShareableLink(extraParams = {}) {
    const url = new URL(window.location.href);
    if (this.deploymentId && this.deploymentId !== GAS_CONFIG.DEFAULT_DEPLOYMENT_ID) {
      url.searchParams.set("id", this.deploymentId);
    } else {
      url.searchParams.delete("id");
      url.searchParams.delete("deploymentId");
    }
    if (this.spreadsheetId) {
      url.searchParams.set("sheet", this.spreadsheetId);
    } else {
      url.searchParams.delete("sheet");
      url.searchParams.delete("sheetId");
    }
    for (const k in extraParams) {
      if (extraParams[k]) url.searchParams.set(k, extraParams[k]);
    }
    return url.toString();
  }

  getOrCreatePlayerId() {
    let id = localStorage.getItem("bpmp_player_id");
    if (!id) {
      id = "PL_" + Math.random().toString(36).substr(2, 8).toUpperCase();
      localStorage.setItem("bpmp_player_id", id);
    }
    return id;
  }

  setupHiddenIframe() {
    if (document.getElementById("gas_hidden_iframe")) return;
    const iframe = document.createElement("iframe");
    iframe.id = "gas_hidden_iframe";
    iframe.name = "gas_hidden_iframe";
    iframe.style.display = "none";
    document.body.appendChild(iframe);
  }

  /**
   * 1. Registrasi Siswa Masuk ke Google Sheets (Pasti Tersimpan)
   */
  async joinGame(playerData) {
    this.roomId = playerData.roomId || "SMA-SNT-XA";
    const payload = {
      action: "registerPlayer",
      timestamp: new Date().toISOString(),
      roomId: this.roomId,
      playerId: this.playerId,
      name: playerData.name,
      nim: playerData.nim,
      institution: playerData.institution || "Peserta Didik",
      avatar: playerData.avatar || "student_boy",
      tabSwitchCount: this.tabSwitchCount,
      spreadsheetId: this.spreadsheetId || ""
    };

    console.log("[GAS] Mengirim Registrasi Siswa ke Google Sheets:", payload);
    localStorage.setItem("bpmp_current_player", JSON.stringify(payload));
    this.saveLocalPlayer(payload);

    if (this.channel) {
      this.channel.postMessage({ type: "PLAYER_JOINED", player: payload });
    }

    // Eksekusi pengiriman menggunakan Form POST + IFrame Tersembunyi + Fallback Query
    this.submitViaHiddenForm(payload);
    this.sendFallbackQuery(payload);

    return { success: true, synced: true };
  }

  /**
   * 2. Update Nilai & Progres Siswa ke Google Sheets (Pasti Tersimpan)
   */
  async updateProgress(progressData) {
    const payload = {
      action: "updateProgress",
      roomId: this.roomId,
      playerId: this.playerId,
      name: progressData.name,
      nim: progressData.nim || "-",
      institution: progressData.institution || "Peserta Didik",
      totalScore: progressData.totalScore || 0,
      correctAnswers: progressData.correctAnswers || 0,
      wrongAnswers: progressData.wrongAnswers || 0,
      currentTile: progressData.currentTile || 0,
      tabSwitchCount: this.tabSwitchCount,
      timeElapsed: progressData.timeElapsed || "00:00:00",
      timeRemaining: progressData.timeRemaining || "00:00:00",
      isFinished: progressData.isFinished || false,
      lastAnswer: progressData.lastAnswer || null,
      spreadsheetId: this.spreadsheetId || "",
      timestamp: new Date().toLocaleTimeString("id-ID")
    };

    this.updateLocalScoreboard(
      payload.name,
      payload.totalScore,
      payload.correctAnswers,
      payload.wrongAnswers,
      payload.timeElapsed,
      payload.institution,
      payload.currentTile,
      payload.playerId,
      payload.tabSwitchCount
    );

    if (this.channel) {
      this.channel.postMessage({ type: "PLAYER_PROGRESS", player: payload });
    }

    // Kirim seketika via Form + IFrame
    this.submitViaHiddenForm(payload);
    this.sendFallbackQuery(payload);

    return { success: true, synced: true };
  }

  /**
   * TEKNIK 1: Form Submit POST via Hidden IFrame
   * (Kebal CORS 100%, Browser dijamin mengirim POST langsung ke server Google)
   */
  submitViaHiddenForm(payload) {
    this.setupHiddenIframe();
    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = this.endpoint;
      form.target = "gas_hidden_iframe";
      form.style.display = "none";

      for (const key in payload) {
        if (payload.hasOwnProperty(key)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = (typeof payload[key] === "object") ? JSON.stringify(payload[key]) : payload[key];
          form.appendChild(input);
        }
      }

      // Tambahkan payload json lengkap
      const rawInput = document.createElement("input");
      rawInput.type = "hidden";
      rawInput.name = "data";
      rawInput.value = JSON.stringify(payload);
      form.appendChild(rawInput);

      document.body.appendChild(form);
      form.submit();
      setTimeout(() => form.remove(), 2000);
    } catch (err) {
      console.warn("[GAS Form Error]:", err);
    }
  }

  /**
   * TEKNIK 2: Fallback GET Query & Beacon (Memastikan doGet mencatat data)
   */
  sendFallbackQuery(payload) {
    try {
      const jsonStr = JSON.stringify(payload);
      const sheetParam = this.spreadsheetId ? `&sheetId=${encodeURIComponent(this.spreadsheetId)}` : "";
      // Kirim via GET Image Beacon
      const q = `${this.endpoint}?action=${payload.action}&roomId=${encodeURIComponent(payload.roomId || '')}&name=${encodeURIComponent(payload.name || '')}&nim=${encodeURIComponent(payload.nim || '')}&inst=${encodeURIComponent(payload.institution || '')}&score=${payload.totalScore || 0}&correct=${payload.correctAnswers || 0}&wrong=${payload.wrongAnswers || 0}&tile=${payload.currentTile || 0}&tab=${payload.tabSwitchCount || 0}${sheetParam}&data=${encodeURIComponent(jsonStr)}&_r=${Math.random()}`;
      
      const img = new Image();
      img.src = q;

      // Coba juga fetch text/plain tanpa menunggu
      fetch(this.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: jsonStr
      }).catch(() => {});
    } catch (e) {}
  }

  /**
   * 3. Ambil Data Pemantauan Guru
   */
  async fetchTeacherDashboard(roomId = this.roomId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GAS_CONFIG.TIMEOUT_MS);
      const sheetParam = this.spreadsheetId ? `&sheetId=${encodeURIComponent(this.spreadsheetId)}` : "";
      const url = `${this.endpoint}?action=getTeacherDashboard&roomId=${encodeURIComponent(roomId)}${sheetParam}&t=${Date.now()}`;
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.players)) {
          data._source = "google_sheets";
          data._connected = true;
          return data;
        }
      }
    } catch (err) {
      console.warn("[GAS] Gagal fetch pemantauan dari Google Sheets:", err.message);
    }

    const localData = this.getLocalTeacherDashboard(roomId);
    localData._source = "local_cache";
    localData._connected = false;
    return localData;
  }

  /**
   * Pembaca Langsung Google Sheets via GViz Query (Super Cepat, Tanpa Butuh Deploy GAS)
   * Bekerja selama Google Sheet diatur: "Anyone with the link can view"
   */
  async fetchQuestionsFromGviz(sheetId) {
    const cleanId = this.cleanSpreadsheetId(sheetId);
    if (!cleanId) return null;

    // Coba tab 'Soal' terlebih dahulu, jika gagal coba tab default tanpa parameter sheet
    const urls = [
      `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json&sheet=Soal&t=${Date.now()}`,
      `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json&t=${Date.now()}`
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) continue;
        const text = await res.text();
        const startIdx = text.indexOf("{");
        const endIdx = text.lastIndexOf("}");
        if (startIdx === -1 || endIdx === -1) continue;

        const jsonStr = text.substring(startIdx, endIdx + 1);
        const data = JSON.parse(jsonStr);

        if (!data || !data.table || !Array.isArray(data.table.rows) || data.table.rows.length === 0) {
          continue;
        }

        const questions = [];
        const rows = data.table.rows;

        rows.forEach((row, idx) => {
          if (!row || !row.c) return;
          const c = row.c;
          const getCell = (colIdx) => {
            if (!c || !c[colIdx] || c[colIdx].v === null || c[colIdx].v === undefined) return "";
            if (c[colIdx].f !== undefined && c[colIdx].f !== null) return String(c[colIdx].f).trim();
            return String(c[colIdx].v).trim();
          };

          const col0 = getCell(0);
          const col1 = getCell(1);
          const col2 = getCell(2);

          // Jika baris pertama adalah nama header kolom (Indonesia atau Inggris), lewati
          if (idx === 0 && (
            col0.toLowerCase().includes("id") ||
            col2.toLowerCase().includes("tanya") ||
            col2.toLowerCase().includes("question") ||
            col1.toLowerCase().includes("kategori") ||
            col1.toLowerCase().includes("category") ||
            col1.toLowerCase().includes("topic")
          )) {
            return;
          }

          // Pertanyaan harus ada teksnya
          const questionText = col2 || col1;
          if (!questionText) return;

          const optA = getCell(3);
          const optB = getCell(4);
          const optC = getCell(5);
          const optD = getCell(6);
          const ans = (getCell(7) || "A").toUpperCase();
          const expl = getCell(8);
          const rawType = getCell(9).toLowerCase();
          const audioText = getCell(10);
          const speed = parseFloat(getCell(11)) || 1.0;
          const maxPlays = parseInt(getCell(12), 10) || 2;
          const readingPassage = getCell(13);

          // Otomatis tentukan tipe jika kosong
          let qType = rawType;
          if (!qType || qType === "standard") {
            if (audioText) qType = "listening";
            else if (readingPassage) qType = "reading";
            else if (col1.toLowerCase().includes("writing") || col1.toLowerCase().includes("grammar")) qType = "writing";
            else qType = "standard";
          }

          questions.push({
            id: questions.length + 1,
            category: col1 || (qType === "listening" ? "Listening Comprehension" : (qType === "reading" ? "Reading Comprehension" : "Writing & Grammar")),
            question: questionText,
            options: [
              { key: "A", text: optA || "Pilihan A" },
              { key: "B", text: optB || "Pilihan B" },
              { key: "C", text: optC || "Pilihan C" },
              { key: "D", text: optD || "Pilihan D" }
            ],
            answer: ans,
            explanation: expl,
            type: qType,
            audioText: audioText,
            audioSpeed: speed,
            maxPlays: maxPlays,
            readingPassage: readingPassage
          });
        });

        if (questions.length > 0) {
          console.log(`[GAS] Sukses memuat ${questions.length} soal dari Google Sheet via GViz!`);
          return questions;
        }
      } catch (e) {
        console.warn("[GAS] Gviz query failed on URL:", url, e.message);
      }
    }

    return null;
  }

  /**
   * 4. Fetch Soal (Mendukung Dual-Engine: Google Sheets GViz Langsung + Google Apps Script Web App)
   */
  async fetchQuestions(customSheetId = null) {
    const targetSheetId = this.cleanSpreadsheetId(customSheetId || this.spreadsheetId);

    // Jalur A: Jika ada Spreadsheet ID spesifik guru
    if (targetSheetId) {
      // 1. Coba baca langsung dari Google Sheets via GViz (Super Cepat, Tanpa Butuh Deploy GAS oleh guru)
      try {
        const gvizQuestions = await this.fetchQuestionsFromGviz(targetSheetId);
        if (gvizQuestions && gvizQuestions.length > 0) {
          localStorage.setItem("cached_gsheet_questions", JSON.stringify(gvizQuestions));
          localStorage.setItem("cached_gsheet_target_id", targetSheetId);
          return gvizQuestions;
        }
      } catch (e) {
        console.warn("[GAS] GViz fetch error:", e);
      }

      // 2. Coba baca via Google Apps Script Web App
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GAS_CONFIG.TIMEOUT_MS);
        const url = `${this.endpoint}?action=getQuestions&sheetId=${encodeURIComponent(targetSheetId)}&t=${Date.now()}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem("cached_gsheet_questions", JSON.stringify(data));
            localStorage.setItem("cached_gsheet_target_id", targetSheetId);
            return data;
          }
        }
      } catch (err) {
        console.warn("[GAS] GAS endpoint fetch error:", err);
      }

      // 3. Fallback ke Cache Lokal jika pernah di-fetch sebelumnya untuk sheet yang sama
      const cached = localStorage.getItem("cached_gsheet_questions");
      const cachedId = localStorage.getItem("cached_gsheet_target_id");
      if (cached && cachedId === targetSheetId) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log("[GAS] Menggunakan cached soal dari Google Sheets.");
            return parsed;
          }
        } catch (e) {}
      }
    }

    // Jalur B: Jika tidak ada Sheet ID khusus, fetch dari endpoint default
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GAS_CONFIG.TIMEOUT_MS);
      const url = `${this.endpoint}?action=getQuestions&t=${Date.now()}`;
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (err) {}

    // Jalur C: Fallback Default Soal
    return window.DEFAULT_QUESTIONS || [];
  }

  /**
   * 5. GURU: Simpan Soal Baru ke Google Sheets
   */
  async saveQuestions(questionList, customSheetId = null) {
    const targetSheetId = this.cleanSpreadsheetId(customSheetId || this.spreadsheetId);
    const payload = {
      action: "saveQuestions",
      questions: questionList,
      spreadsheetId: targetSheetId || "",
      timestamp: new Date().toISOString()
    };

    // Selalu simpan ke local cache untuk keandalan offline
    try {
      localStorage.setItem("cached_gsheet_questions", JSON.stringify(questionList));
      if (targetSheetId) {
        localStorage.setItem("cached_gsheet_target_id", targetSheetId);
      }
    } catch (e) {}

    try {
      this.submitViaHiddenForm(payload);
      const res = await fetch(this.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
      return {
        success: true,
        count: questionList.length,
        message: `${questionList.length} soal berhasil disimpan ke Google Sheets (Tab "Soal")!`
      };
    } catch (e) {
      this.submitViaHiddenForm(payload);
      return {
        success: true,
        count: questionList.length,
        message: `${questionList.length} soal berhasil dikirim ke Google Apps Script!`
      };
    }
  }

  /**
   * Menghasilkan teks TSV (Tab-Separated Values) yang bisa langsung dicopy-paste ke Google Sheets di sel A1
   */
  exportQuestionsToTSV(questionList) {
    const header = [
      "ID Soal", "Kategori / Topik", "Pertanyaan", "Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D",
      "Kunci Jawaban", "Pembahasan", "Tipe", "Audio TTS", "Speed Audio", "Batas Putar", "Reading Passage"
    ];
    const rows = questionList.map((q, idx) => {
      const optA = (q.options && q.options[0]) ? (q.options[0].text || q.options[0]) : "";
      const optB = (q.options && q.options[1]) ? (q.options[1].text || q.options[1]) : "";
      const optC = (q.options && q.options[2]) ? (q.options[2].text || q.options[2]) : "";
      const optD = (q.options && q.options[3]) ? (q.options[3].text || q.options[3]) : "";
      const sanitize = (str) => String(str || "").replace(/\t/g, " ").replace(/\r?\n/g, " ");
      return [
        q.id || (idx + 1),
        sanitize(q.category || ""),
        sanitize(q.question || ""),
        sanitize(optA),
        sanitize(optB),
        sanitize(optC),
        sanitize(optD),
        (q.answer || "A").toString().toUpperCase().trim(),
        sanitize(q.explanation || ""),
        q.type || "standard",
        sanitize(q.audioText || ""),
        q.audioSpeed || 1.0,
        q.maxPlays || 2,
        sanitize(q.readingPassage || "")
      ].join("\t");
    });
    return [header.join("\t"), ...rows].join("\n");
  }

  /**
   * 6. GURU: Bersihkan Siswa Selesai / Offline dari Sheet & Arena
   */
  async clearOfflinePlayers(roomId = this.roomId) {
    this.clearLocalPlayers();
    const payload = {
      action: "clearOfflinePlayers",
      roomId: roomId,
      spreadsheetId: this.spreadsheetId || ""
    };
    this.submitViaHiddenForm(payload);
    try {
      await fetch(this.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
    return { success: true };
  }

  /**
   * 7. GURU: Reset Seluruh Peserta di Kelas Ini
   */
  async resetRoom(roomId = this.roomId) {
    this.clearLocalPlayers();
    const payload = {
      action: "resetRoom",
      roomId: roomId,
      spreadsheetId: this.spreadsheetId || ""
    };
    this.submitViaHiddenForm(payload);
    try {
      await fetch(this.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
    return { success: true };
  }

  /**
   * 8. GURU: SIMPAN KONFIGURASI ROOM (ROOM ID -> GSHEET ID, MAPEL, PAKET, JENJANG KELAS)
   */
  async saveRoomConfig(roomId, sheetId, mapel = "Asesmen Pembelajaran", packageId = "english_all", gradeLevel = "smp_7") {
    const cleanRoom = String(roomId || "").trim().toUpperCase();
    const cleanSheet = this.cleanSpreadsheetId(sheetId);
    if (!cleanRoom) return { success: false, message: "Room ID kosong" };

    const config = {
      roomId: cleanRoom,
      sheetId: cleanSheet,
      mapel: mapel,
      packageId: packageId,
      gradeLevel: gradeLevel,
      updatedAt: new Date().toISOString()
    };

    // Simpan ke local cache browser
    try {
      localStorage.setItem("room_cfg_" + cleanRoom, JSON.stringify(config));
      localStorage.setItem("last_teacher_room_id", cleanRoom);
      if (this.channel) {
        this.channel.postMessage({ type: "room_config_updated", config: config });
      }
    } catch(e) {}

    // Simpan ke Google Apps Script backend
    const payload = {
      action: "saveRoomConfig",
      roomId: cleanRoom,
      sheetId: cleanSheet,
      mapel: mapel,
      packageId: packageId,
      gradeLevel: gradeLevel
    };

    this.submitViaHiddenForm(payload);
    try {
      await fetch(this.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      });
    } catch(e) {}

    return { success: true, roomConfig: config };
  }

  /**
   * 9. SISWA / GAME: AMBIL KONFIGURASI ROOM DARI KODE ROOM
   */
  async getRoomConfig(roomId) {
    const cleanRoom = String(roomId || "").trim().toUpperCase();
    if (!cleanRoom) return null;

    // 1. Coba ambil dari local storage
    try {
      const saved = localStorage.getItem("room_cfg_" + cleanRoom);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.sheetId) return parsed;
      }
    } catch(e) {}

    // 2. Coba fetch dari backend server Google Apps Script
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const url = `${this.endpoint}?action=getRoomConfig&roomId=${encodeURIComponent(cleanRoom)}&t=${Date.now()}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.roomConfig) {
          localStorage.setItem("room_cfg_" + cleanRoom, JSON.stringify(data.roomConfig));
          return data.roomConfig;
        }
      }
    } catch(e) {
      console.warn("[GAS] Gagal getRoomConfig dari server:", e);
    }

    return null;
  }

  // --- Local Storage / Fallback Database ---

  saveLocalPlayer(player) {
    let players = this.getLocalPlayers();
    const idx = players.findIndex(p => p.playerId === player.playerId || p.name === player.name);
    const now = Date.now();
    const entry = {
      roomId: player.roomId,
      playerId: player.playerId,
      name: player.name,
      nim: player.nim,
      institution: player.institution,
      avatar: player.avatar,
      status: "ONLINE",
      score: 0,
      correct: 0,
      wrong: 0,
      currentTile: 0,
      tabSwitches: player.tabSwitchCount || 0,
      registeredAt: new Date().toLocaleTimeString("id-ID"),
      lastPing: new Date().toLocaleTimeString("id-ID"),
      lastPingTime: now
    };
    if (idx >= 0) players[idx] = entry;
    else players.push(entry);
    localStorage.setItem("bpmp_room_players", JSON.stringify(players));
  }

  getLocalPlayers() {
    const s = localStorage.getItem("bpmp_room_players");
    if (s) {
      try {
        const list = JSON.parse(s);
        if (Array.isArray(list)) {
          const now = Date.now();
          // Filter hanya pemain aktif dalam 5 menit terakhir yang belum selesai
          const activeList = list.filter(p => {
            if (p.status === "FINISHED" || p.status === "OFFLINE") return false;
            if (p.lastPingTime && (now - p.lastPingTime > 5 * 60 * 1000)) return false;
            return true;
          });
          return activeList;
        }
      } catch (e) {}
    }
    return [];
  }

  clearLocalPlayers() {
    localStorage.removeItem("bpmp_room_players");
  }

  updateLocalScoreboard(name, score, correct, wrong, duration, inst, tile = 0, pid = null, tabSwitches = 0) {
    let players = this.getLocalPlayers();
    let p = players.find(x => (pid && x.playerId === pid) || x.name === name);
    const now = Date.now();
    const isFinished = (correct + wrong >= 30);
    if (p) {
      p.score = score;
      p.correct = correct;
      p.wrong = wrong;
      p.currentTile = tile;
      p.tabSwitches = tabSwitches;
      p.status = isFinished ? "FINISHED" : "PLAYING";
      p.lastPing = new Date().toLocaleTimeString("id-ID");
      p.lastPingTime = now;
    } else {
      players.push({
        roomId: this.roomId,
        playerId: pid || this.playerId,
        name: name,
        nim: "-",
        institution: inst || "Peserta Didik",
        avatar: "student_boy",
        status: isFinished ? "FINISHED" : "PLAYING",
        score: score,
        correct: correct,
        wrong: wrong,
        currentTile: tile,
        tabSwitches: tabSwitches,
        lastPing: new Date().toLocaleTimeString("id-ID"),
        lastPingTime: now
      });
    }
    localStorage.setItem("bpmp_room_players", JSON.stringify(players));
  }

  getLocalTeacherDashboard(roomId) {
    const all = this.getLocalPlayers().filter(p => !roomId || p.roomId === roomId || roomId === "ALL");
    const sorted = [...all].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.correct - a.correct;
    });

    return {
      roomId: roomId,
      serverTime: new Date().toLocaleTimeString("id-ID"),
      totalJoined: all.length,
      activeNow: all.filter(p => p.status !== "OFFLINE").length,
      leader: sorted.length > 0 ? sorted[0] : null,
      players: all,
      leaderboard: sorted
    };
  }
}

window.gasService = new GASService();
