/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (GAS) BACKEND: BPMP FARM QUEST - SMA SNT KELAS X
 * ============================================================================
 * Salin SELURUH kode ini ke Extensions > Apps Script pada Google Sheets Anda.
 * 
 * ⚠️ PENTING AGAR DATA PASTI TERCATAT:
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
      return handleGetTeacherDashboard(roomId);
    } else if (action === "getLeaderboard") {
      return handleGetLeaderboard(roomId);
    } else if (action === "getQuestions") {
      return handleGetQuestions();
    } else if (action === "resetRoom") {
      return handleResetRoom(roomId);
    }

    return jsonResponse({ status: "success", message: "API Active", received: data });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * 1. SIMPAN PESERTA BARU KE SHEET "Peserta"
 */
function handleRegisterPlayer(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
  const inst = data.institution || "SMA SNT (Kelas X)";
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Peserta");
  const now = new Date();
  const roomId = data.roomId || "SMA-SNT-XA";
  const name = data.name || "";
  const playerId = data.playerId || "";
  const tabSwitches = Number(data.tabSwitchCount) || 0;

  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
    for (let i = 0; i < values.length; i++) {
      const rowRoom = values[i][1];
      const rowId = values[i][2];
      const rowName = values[i][3];

      if (rowRoom === roomId && (rowId === playerId || rowName.toString().toLowerCase() === name.toLowerCase())) {
        const rowNum = i + 2;
        sheet.getRange(rowNum, 8).setValue(data.isFinished ? "FINISHED" : "PLAYING");
        sheet.getRange(rowNum, 9).setValue(Number(data.totalScore) || 0);
        sheet.getRange(rowNum, 10).setValue(Number(data.correctAnswers) || 0);
        sheet.getRange(rowNum, 11).setValue(Number(data.wrongAnswers) || 0);
        sheet.getRange(rowNum, 12).setValue(Number(data.currentTile) || 0);
        sheet.getRange(rowNum, 13).setValue(tabSwitches);
        sheet.getRange(rowNum, 14).setValue(now.toLocaleTimeString("id-ID"));
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
    now, roomId, data.name || "Anonim", data.nim || "-", data.institution || "SMA SNT",
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
function handleGetTeacherDashboard(roomId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

function handleGetLeaderboard(roomId) {
  return handleGetTeacherDashboard(roomId);
}

function handleGetQuestions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Soal");
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonResponse([]);
  }
  
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  const questions = rows.map((r, i) => ({
    id: r[0] || (i + 1),
    category: r[1] || "Arduino & Wokwi",
    question: r[2],
    options: [
      { key: "A", text: r[3] },
      { key: "B", text: r[4] },
      { key: "C", text: r[5] },
      { key: "D", text: r[6] }
    ],
    answer: String(r[7]).toUpperCase().trim(),
    explanation: r[8] || ""
  }));
  
  return jsonResponse(questions);
}

function handleResetRoom(roomId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Peserta");
  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
    for (let i = values.length - 1; i >= 0; i--) {
      if (values[i][0] === roomId) {
        sheet.deleteRow(i + 2);
      }
    }
  }
  SpreadsheetApp.flush();
  return jsonResponse({ status: "reset_done", roomId: roomId });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
