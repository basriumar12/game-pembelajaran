/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (GAS) BACKEND: BPMP FARM QUEST - SMA SNT KELAS X
 * ============================================================================
 * Salin SELURUH kode ini ke Extensions > Apps Script pada Google Sheets Anda.
 * 
 * [PENTING] AGAR DATA PASTI TERCATAT:
 * Saat Deploy (Deploy > New deployment):
 * 1. Select type: "Web app"
 * 2. Execute as: "Me" (email Anda)
 * 3. Who has access: "Anyone" (Siapa saja / Bahkan anonim) -> WAJIB!
 * ============================================================================
 */

function doGet(e) {
  return handleIncomingData(e);
}

function doPost(e) {
  return handleIncomingData(e);
}

/**
 * Handle Baik GET maupun POST secara terpadu (100% Anti-Gagal)
 */
function handleIncomingData(e) {
  try {
    const params = (e && e.parameter) || {};
    let data = {};

    // 1. Ekstrak dari postData (JSON Fetch)
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = params;
      }
    } else {
      data = params;
    }

    // 2. Ekstrak jika dibungkus dalam parameter data
    if (data.data && typeof data.data === "string") {
      try {
        const parsed = JSON.parse(data.data);
        data = Object.assign({}, data, parsed);
      } catch (err) {}
    }

    const action = data.action || params.action || "getTeacherDashboard";
    const roomId = data.roomId || params.roomId || "SMA-SNT-XA";

    if (action === "registerPlayer") {
      return handleRegisterPlayer(data);
    } else if (action === "updateProgress" || action === "submitScore") {
      return handleUpdatePlayerProgress(data);
    } else if (action === "getTeacherDashboard" || action === "getRoomPlayers") {
      return handleGetTeacherDashboard(roomId, data);
    } else if (action === "getLeaderboard") {
      return handleGetLeaderboard(roomId, data);
    } else if (action === "getQuestions") {
      return handleGetQuestions(data);
    } else if (action === "saveQuestions" || action === "updateQuestions") {
      return handleSaveQuestions(data);
    } else if (action === "resetRoom") {
      return handleResetRoom(roomId, data);
    } else if (action === "clearOfflinePlayers") {
      return handleClearOfflinePlayers(roomId, data);
    }

    return jsonResponse({ status: "success", message: "API Active", received: data });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * MENDAPATKAN SPREADSHEET TARGET SECARA DINAMIS
 * Guru/Admin dapat mengganti Google Sheets kapan saja hanya dengan menyertakan spreadsheetId.
 * Jika tidak disertakan, backend otomatis menggunakan Active Spreadsheet tempat script dipasang.
 */
function getTargetSpreadsheet(data) {
  var targetId = data && (data.spreadsheetId || data.sheetId);
  if (targetId && String(targetId).trim() !== "") {
    try {
      return SpreadsheetApp.openById(String(targetId).trim());
    } catch (err) {
      console.warn("Gagal membuka sheet by ID (" + targetId + "), fallback ke Active Spreadsheet:", err);
    }
  }
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    console.error("Gagal getActiveSpreadsheet:", err);
    throw new Error("Spreadsheet tidak ditemukan. Pastikan Spreadsheet ID valid dan email pembuat Web App memiliki akses View/Edit ke Spreadsheet tersebut!");
  }
}

/**
 * 1. SIMPAN PESERTA BARU KE SHEET "Peserta"
 */
function handleRegisterPlayer(data) {
  const ss = getTargetSpreadsheet(data);
  let sheet = ss.getSheetByName("Peserta");
  
  if (!sheet) {
    sheet = ss.insertSheet("Peserta");
    sheet.appendRow([
      "Timestamp", "Room / Kelas", "Player ID", "Nama Lengkap Siswa", "NISN / No. Absen",
      "Kelas / Sekolah", "Avatar", "Status", "Total Skor", "Benar", "Salah", "Petak", "Pindah Tab", "Last Ping"
    ]);
    sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#c8e6c9");
  }

  const now = new Date();
  const roomId = data.roomId || "SMA-SNT-XA";
  const playerId = data.playerId || ("PL_" + Utilities.getUuid().slice(0, 8));
  const name = data.name || "Siswa Baru";
  const nim = data.nim || "-";
  const inst = data.institution || "Peserta Didik";
  const avatar = data.avatar || "student_boy";
  const tabSwitches = Number(data.tabSwitchCount) || 0;

  // Cek apakah siswa sudah ada di sheet
  const lastRow = sheet.getLastRow();
  let existingRow = -1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    const names = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
    const rooms = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (rooms[i][0] === roomId && (ids[i][0] === playerId || names[i][0].toString().toLowerCase() === name.toLowerCase())) {
        existingRow = i + 2;
        break;
      }
    }
  }

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, 14).setValues([[
      now, roomId, playerId, name, nim, inst, avatar, "ONLINE", 0, 0, 0, 0, tabSwitches, now.toLocaleTimeString("id-ID")
    ]]);
  } else {
    sheet.appendRow([
      now, roomId, playerId, name, nim, inst, avatar, "ONLINE", 0, 0, 0, 0, tabSwitches, now.toLocaleTimeString("id-ID")
    ]);
  }

  // Paksa simpan seketika ke Google Sheets
  SpreadsheetApp.flush();

  return jsonResponse({
    status: "registered",
    roomId: roomId,
    name: name,
    timestamp: now.toISOString()
  });
}

/**
 * 2. UPDATE PROGRESS & CATAT DI SHEET "Scoreboard"
 */
function handleUpdatePlayerProgress(data) {
  const ss = getTargetSpreadsheet(data);
  let sheet = ss.getSheetByName("Peserta");
  const now = new Date();
  const roomId = data.roomId || "SMA-SNT-XA";
  const name = data.name || "";
  const playerId = data.playerId || "";
  const tabSwitches = Number(data.tabSwitchCount) || 0;

  const incomingScore = Number(data.totalScore) || 0;
  const incomingCorrect = Number(data.correctAnswers) || 0;
  const incomingWrong = Number(data.wrongAnswers) || 0;
  const incomingTile = Number(data.currentTile) || 0;

  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
    for (let i = 0; i < values.length; i++) {
      const rowRoom = values[i][1];
      const rowId = values[i][2];
      const rowName = values[i][3];

      if (rowRoom === roomId && (rowId === playerId || rowName.toString().toLowerCase() === name.toLowerCase())) {
        const rowNum = i + 2;
        const currentScore = Number(values[i][8]) || 0;
        const currentCorrect = Number(values[i][9]) || 0;
        const currentWrong = Number(values[i][10]) || 0;
        const currentTile = Number(values[i][11]) || 0;

        // Anti-Drop & Anti-Race Condition:
        // Gunakan Math.max agar request lama yang terlambat tidak menimpa skor/jawaban benar yang lebih tinggi!
        const finalScore = Math.max(currentScore, incomingScore);
        const finalCorrect = Math.max(currentCorrect, incomingCorrect);
        const finalWrong = Math.max(currentWrong, incomingWrong);
        const finalTile = Math.max(currentTile, incomingTile);
        const finalStatus = data.isFinished ? "FINISHED" : (values[i][7] === "FINISHED" ? "FINISHED" : "PLAYING");

        // Tulis sekaligus dalam satu pemanggilan rentang (cepat dan bebas korupsi data)
        sheet.getRange(rowNum, 8, 1, 7).setValues([[
          finalStatus,
          finalScore,
          finalCorrect,
          finalWrong,
          finalTile,
          tabSwitches,
          now.toLocaleTimeString("id-ID")
        ]]);
        break;
      }
    }
  }

  // Simpan ke Sheet Scoreboard
  let scoreSheet = ss.getSheetByName("Scoreboard");
  if (!scoreSheet) {
    scoreSheet = ss.insertSheet("Scoreboard");
    scoreSheet.appendRow([
      "Timestamp", "Room / Kelas", "Nama Lengkap", "NISN / No. Absen", "Sekolah",
      "Total Poin", "Benar", "Salah", "Pindah Tab (Curang)", "Durasi", "Sisa Waktu"
    ]);
    scoreSheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#fff9c4");
  }

  scoreSheet.appendRow([
    now, roomId, data.name || "Anonim", data.nim || "-", data.institution || "Peserta Didik",
    Number(data.totalScore) || 0, Number(data.correctAnswers) || 0, Number(data.wrongAnswers) || 0,
    tabSwitches, data.timeElapsed || "00:00:00", data.timeRemaining || "00:00:00"
  ]);

  // Simpan Detail Jawaban Per Posko ke Sheet "Jawaban_Siswa"
  if (data.lastAnswer) {
    let ansSheet = ss.getSheetByName("Jawaban_Siswa");
    if (!ansSheet) {
      ansSheet = ss.insertSheet("Jawaban_Siswa");
      ansSheet.appendRow([
        "Timestamp", "Room / Kelas", "Nama Siswa", "NISN", "Posko #", "Topik Soal",
        "Jawaban Siswa", "Kunci Jawaban", "Status", "Poin Diperoleh", "Total Skor Saat Ini"
      ]);
      ansSheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#b2dfdb");
    }
    let ans = data.lastAnswer;
    if (typeof ans === "string") {
      try { ans = JSON.parse(ans); } catch (e) {}
    }
    ansSheet.appendRow([
      now, roomId, data.name || "Anonim", data.nim || "-",
      "Posko #" + (ans.poskoId || "-"),
      ans.category || "Arduino & Wokwi",
      ans.userAnswer || "-",
      ans.correctAnswer || "-",
      ans.isCorrect ? "BENAR" : "SALAH",
      ans.scoreGained || (ans.isCorrect ? 20 : 0),
      Number(data.totalScore) || 0
    ]);
  }

  SpreadsheetApp.flush();

  return jsonResponse({
    status: "progress_updated",
    name: data.name,
    score: data.totalScore,
    correct: data.correctAnswers
  });
}

/**
 * 3. DASHBOARD GURU
 */
function handleGetTeacherDashboard(roomId, data) {
  const ss = getTargetSpreadsheet(data);
  const sheet = ss.getSheetByName("Peserta");
  
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonResponse({
      roomId: roomId,
      totalJoined: 0,
      activeNow: 0,
      leader: null,
      players: [],
      leaderboard: []
    });
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
  const roomPlayers = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (!roomId || row[1] === roomId || roomId === "ALL") {
      roomPlayers.push({
        registeredAt: row[0],
        roomId: row[1],
        playerId: row[2],
        name: row[3],
        nim: row[4],
        institution: row[5],
        avatar: row[6] || "student_boy",
        status: row[7] || "ONLINE",
        score: Number(row[8]) || 0,
        correct: Number(row[9]) || 0,
        wrong: Number(row[10]) || 0,
        currentTile: Number(row[11]) || 0,
        tabSwitches: Number(row[12]) || 0,
        lastPing: row[13] || "-"
      });
    }
  }

  const sortedLeaderboard = [...roomPlayers].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.correct - a.correct;
  });

  return jsonResponse({
    roomId: roomId,
    serverTime: new Date().toLocaleTimeString("id-ID"),
    totalJoined: roomPlayers.length,
    activeNow: roomPlayers.filter(p => p.status !== "OFFLINE").length,
    leader: sortedLeaderboard.length > 0 ? sortedLeaderboard[0] : null,
    players: roomPlayers,
    leaderboard: sortedLeaderboard
  });
}

function handleGetLeaderboard(roomId, data) {
  return handleGetTeacherDashboard(roomId, data);
}

function handleGetQuestions(data) {
  const ss = getTargetSpreadsheet(data);
  const sheet = ss.getSheetByName("Soal");
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonResponse([]);
  }
  
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  const questions = rows.map((r, i) => ({
    id: r[0] || (i + 1),
    category: r[1] || "Materi Asesmen",
    question: r[2],
    options: [
      { key: "A", text: r[3] },
      { key: "B", text: r[4] },
      { key: "C", text: r[5] },
      { key: "D", text: r[6] }
    ],
    answer: String(r[7]).toUpperCase().trim(),
    explanation: r[8] || "",
    type: r[9] || (r[10] ? "listening" : (r[13] ? "reading" : "standard")),
    audioText: r[10] || "",
    audioSpeed: parseFloat(r[11]) || 1.0,
    maxPlays: parseInt(r[12]) || 2,
    readingPassage: r[13] || ""
  }));
  
  return jsonResponse(questions);
}

/**
 * 4. GURU: SIMPAN / GANTI SOAL BARU KE GOOGLE SHEETS
 * Mendukung Tipe Soal Standard, Reading Passage, dan Audio TTS Listening
 */
function handleSaveQuestions(data) {
  const ss = getTargetSpreadsheet(data);
  let sheet = ss.getSheetByName("Soal");
  if (!sheet) {
    sheet = ss.insertSheet("Soal");
  } else {
    sheet.clear();
  }

  sheet.appendRow([
    "ID Soal", "Kategori / Topik", "Pertanyaan", "Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D", "Kunci Jawaban", "Pembahasan", "Tipe", "Audio TTS", "Speed Audio", "Batas Putar", "Reading Passage"
  ]);
  sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#c8e6c9");

  let qList = data.questions || [];
  if (typeof qList === "string") {
    try { qList = JSON.parse(qList); } catch (e) {}
  }

  const rows = [];
  qList.forEach((q, idx) => {
    let optA = "", optB = "", optC = "", optD = "";
    if (Array.isArray(q.options)) {
      q.options.forEach(o => {
        if (typeof o === "object") {
          if (o.key === "A") optA = o.text || "";
          else if (o.key === "B") optB = o.text || "";
          else if (o.key === "C") optC = o.text || "";
          else if (o.key === "D") optD = o.text || "";
        }
      });
      if (!optA && q.options[0]) optA = q.options[0].text || q.options[0];
      if (!optB && q.options[1]) optB = q.options[1].text || q.options[1];
      if (!optC && q.options[2]) optC = q.options[2].text || q.options[2];
      if (!optD && q.options[3]) optD = q.options[3].text || q.options[3];
    }

    rows.push([
      q.id || (idx + 1),
      q.category || "Materi Asesmen",
      q.question || "",
      optA,
      optB,
      optC,
      optD,
      (q.answer || "A").toString().toUpperCase().trim(),
      q.explanation || "",
      q.type || "standard",
      q.audioText || "",
      q.audioSpeed || 1.0,
      q.maxPlays || 2,
      q.readingPassage || ""
    ]);
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 14).setValues(rows);
  }

  SpreadsheetApp.flush();
  return jsonResponse({
    status: "success",
    count: rows.length,
    message: `${rows.length} soal berhasil disimpan ke Google Sheets!`
  });
}

function handleResetRoom(roomId, data) {
  const ss = getTargetSpreadsheet(data);
  const sheet = ss.getSheetByName("Peserta");
  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
    for (let i = values.length - 1; i >= 0; i--) {
      if (!roomId || values[i][0] === roomId || roomId === "ALL") {
        sheet.deleteRow(i + 2);
      }
    }
  }
  SpreadsheetApp.flush();
  return jsonResponse({ status: "reset_done", roomId: roomId });
}

function handleClearOfflinePlayers(roomId, data) {
  const ss = getTargetSpreadsheet(data);
  const sheet = ss.getSheetByName("Peserta");
  let deletedCount = 0;
  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
    for (let i = values.length - 1; i >= 0; i--) {
      const rowRoom = values[i][1];
      const rowStatus = values[i][7];
      if (!roomId || rowRoom === roomId || roomId === "ALL") {
        if (rowStatus === "FINISHED" || rowStatus === "OFFLINE") {
          sheet.deleteRow(i + 2);
          deletedCount++;
        }
      }
    }
  }
  SpreadsheetApp.flush();
  return jsonResponse({ status: "success", deletedCount: deletedCount });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
