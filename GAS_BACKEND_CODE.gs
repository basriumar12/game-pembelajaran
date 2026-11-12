/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (GAS) BACKEND: BPMP FARM QUEST - MULTI-MAPEL UNIVERSAL
 * ============================================================================
 * Salin SELURUH kode ini ke Google Apps Script Anda (Code.gs).
 *
 * CARA DEPLOY DENGAN BENAR (AGAR BISA SYNC KE CLOUDFLARE PAGES):
 * 1. Simpan script (Ctrl+S / Save).
 * 2. Klik Deploy > New deployment.
 * 3. Pilih tipe: "Web app".
 * 4. Execute as: "Me" (email Anda).
 * 5. Who has access: "Anyone" (Siapa saja / Anonim) -> WAJIB!
 * 6. Klik Deploy -> Salin Deployment ID (AKfy...) ke Dashboard Guru.
 * ============================================================================
 */

function doGet(e) {
  return handleIncomingData(e);
}

function doPost(e) {
  return handleIncomingData(e);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET dan POST Secara Terpadu (Anti-Gagal & Kebal CORS)
 */
function handleIncomingData(e) {
  try {
    var params = (e && e.parameter) || {};
    var data = {};

    // 1. Ekstrak data dari POST JSON
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = params;
      }
    } else {
      data = params;
    }

    // 2. Ekstrak jika dikirim via payload string 'data'
    if (data.data && typeof data.data === "string") {
      try {
        var parsed = JSON.parse(data.data);
        data = Object.assign({}, data, parsed);
      } catch (err) {}
    }

    var action = data.action || params.action || "getTeacherDashboard";
    var roomId = data.roomId || params.roomId || "ALL";

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
 * Guru cukup memasukkan Spreadsheet ID, sistem akan membuka Google Sheet tersebut.
 */
function getTargetSpreadsheet(data) {
  var targetId = data && (data.spreadsheetId || data.sheetId);
  if (targetId && String(targetId).trim() !== "") {
    try {
      return SpreadsheetApp.openById(String(targetId).trim());
    } catch (err) {
      console.warn("Gagal membuka spreadsheet ID: " + targetId + ", coba active:", err);
    }
  }

  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (err) {}

  return null;
}

/**
 * 1. SIMPAN PESERTA BARU KE SHEET "Peserta"
 */
function handleRegisterPlayer(data) {
  var ss = getTargetSpreadsheet(data);
  if (!ss) {
    return jsonResponse({ status: "error", message: "Spreadsheet target belum terhubung." });
  }

  var sheet = ss.getSheetByName("Peserta");
  if (!sheet) {
    sheet = ss.insertSheet("Peserta");
    sheet.appendRow([
      "Timestamp", "Room / Kelas", "Player ID", "Nama Lengkap Siswa", "NISN / No. Absen",
      "Kelas / Sekolah", "Avatar", "Status", "Total Skor", "Benar", "Salah", "Petak", "Pindah Tab", "Last Ping"
    ]);
    sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#c8e6c9");
  }

  var now = new Date();
  var roomId = data.roomId || "ALL";
  var playerId = data.playerId || ("PL_" + Utilities.getUuid().slice(0, 8));
  var name = data.name || "Siswa Baru";
  var nim = data.nim || "-";
  var inst = data.institution || "Peserta Didik";
  var avatar = data.avatar || "student_boy";
  var tabSwitches = Number(data.tabSwitchCount) || 0;

  var lastRow = sheet.getLastRow();
  var existingRow = -1;
  if (lastRow > 1) {
    var ids = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    var names = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
    var rooms = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if ((!roomId || rooms[i][0] === roomId || roomId === "ALL") && 
          (ids[i][0] === playerId || names[i][0].toString().toLowerCase() === name.toLowerCase())) {
        existingRow = i + 2;
        break;
      }
    }
  }

  var rowData = [
    now, roomId, playerId, name, nim, inst, avatar, "ONLINE", 0, 0, 0, 0, tabSwitches, now.toLocaleTimeString("id-ID")
  ];

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, 14).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  SpreadsheetApp.flush();
  return jsonResponse({
    status: "registered",
    roomId: roomId,
    name: name,
    timestamp: now.toISOString()
  });
}

/**
 * 2. UPDATE PROGRESS & CATAT DI SHEET "Scoreboard" & "Jawaban_Siswa"
 */
function handleUpdatePlayerProgress(data) {
  var ss = getTargetSpreadsheet(data);
  if (!ss) {
    return jsonResponse({ status: "error", message: "Spreadsheet target belum terhubung." });
  }

  var sheet = ss.getSheetByName("Peserta");
  var now = new Date();
  var roomId = data.roomId || "ALL";
  var name = data.name || "";
  var playerId = data.playerId || "";
  var tabSwitches = Number(data.tabSwitchCount) || 0;

  var incomingScore = Number(data.totalScore) || 0;
  var incomingCorrect = Number(data.correctAnswers) || 0;
  var incomingWrong = Number(data.wrongAnswers) || 0;
  var incomingTile = Number(data.currentTile) || 0;

  if (sheet && sheet.getLastRow() > 1) {
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
    for (var i = 0; i < values.length; i++) {
      var rowRoom = values[i][1];
      var rowId = values[i][2];
      var rowName = values[i][3];

      if ((!roomId || rowRoom === roomId || roomId === "ALL") && 
          (rowId === playerId || rowName.toString().toLowerCase() === name.toLowerCase())) {
        var rowNum = i + 2;
        var currentScore = Number(values[i][8]) || 0;
        var currentCorrect = Number(values[i][9]) || 0;
        var currentWrong = Number(values[i][10]) || 0;
        var currentTile = Number(values[i][11]) || 0;

        var finalScore = Math.max(currentScore, incomingScore);
        var finalCorrect = Math.max(currentCorrect, incomingCorrect);
        var finalWrong = Math.max(currentWrong, incomingWrong);
        var finalTile = Math.max(currentTile, incomingTile);
        var finalStatus = data.isFinished ? "FINISHED" : (values[i][7] === "FINISHED" ? "FINISHED" : "PLAYING");

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

  // Simpan Log ke Sheet Scoreboard
  var scoreSheet = ss.getSheetByName("Scoreboard");
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
    incomingScore, incomingCorrect, incomingWrong,
    tabSwitches, data.timeElapsed || "00:00:00", data.timeRemaining || "00:00:00"
  ]);

  // Simpan Detail Jawaban ke Sheet "Jawaban_Siswa"
  if (data.lastAnswer) {
    var ansSheet = ss.getSheetByName("Jawaban_Siswa");
    if (!ansSheet) {
      ansSheet = ss.insertSheet("Jawaban_Siswa");
      ansSheet.appendRow([
        "Timestamp", "Room / Kelas", "Nama Siswa", "NISN", "Posko #", "Topik Soal",
        "Jawaban Siswa", "Kunci Jawaban", "Status", "Poin Diperoleh", "Total Skor Saat Ini"
      ]);
      ansSheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#b2dfdb");
    }
    var ans = data.lastAnswer;
    if (typeof ans === "string") {
      try { ans = JSON.parse(ans); } catch (e) {}
    }
    ansSheet.appendRow([
      now, roomId, data.name || "Anonim", data.nim || "-",
      "Posko #" + (ans.poskoId || "-"),
      ans.category || "Materi Asesmen",
      ans.userAnswer || "-",
      ans.correctAnswer || "-",
      ans.isCorrect ? "BENAR" : "SALAH",
      ans.scoreGained || (ans.isCorrect ? 20 : 0),
      incomingScore
    ]);
  }

  SpreadsheetApp.flush();
  return jsonResponse({
    status: "progress_updated",
    name: data.name,
    score: incomingScore,
    correct: incomingCorrect
  });
}

/**
 * 3. DASHBOARD PEMANTAUAN GURU (LEADERBOARD & PRESENSI LIVE)
 */
function handleGetTeacherDashboard(roomId, data) {
  var ss = getTargetSpreadsheet(data);
  if (!ss) {
    return jsonResponse({
      roomId: roomId,
      status: "warning",
      message: "Spreadsheet belum terhubung. Silakan atur Spreadsheet ID di Dashboard Guru.",
      totalJoined: 0,
      activeNow: 0,
      leader: null,
      players: [],
      leaderboard: []
    });
  }

  var sheet = ss.getSheetByName("Peserta");
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

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
  var roomPlayers = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
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

  var sortedLeaderboard = [].concat(roomPlayers).sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return b.correct - a.correct;
  });

  return jsonResponse({
    roomId: roomId,
    serverTime: new Date().toLocaleTimeString("id-ID"),
    totalJoined: roomPlayers.length,
    activeNow: roomPlayers.filter(function(p) { return p.status !== "OFFLINE"; }).length,
    leader: sortedLeaderboard.length > 0 ? sortedLeaderboard[0] : null,
    players: roomPlayers,
    leaderboard: sortedLeaderboard
  });
}

function handleGetLeaderboard(roomId, data) {
  return handleGetTeacherDashboard(roomId, data);
}

/**
 * 4. BANK SOAL DARI SHEET "Soal"
 */
function handleGetQuestions(data) {
  var ss = getTargetSpreadsheet(data);
  if (!ss) return jsonResponse([]);
  var sheet = ss.getSheetByName("Soal");
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonResponse([]);
  }

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
  var questions = rows.map(function(r, i) {
    return {
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
    };
  });

  return jsonResponse(questions);
}

/**
 * 5. GURU: SIMPAN SOAL BARU KE GOOGLE SHEETS
 */
function handleSaveQuestions(data) {
  var ss = getTargetSpreadsheet(data);
  if (!ss) {
    return jsonResponse({ status: "error", message: "Spreadsheet target belum terhubung." });
  }

  var sheet = ss.getSheetByName("Soal");
  if (!sheet) {
    sheet = ss.insertSheet("Soal");
  } else {
    sheet.clear();
  }

  sheet.appendRow([
    "ID Soal", "Kategori / Topik", "Pertanyaan", "Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D",
    "Kunci Jawaban", "Pembahasan", "Tipe", "Audio TTS", "Speed Audio", "Batas Putar", "Reading Passage"
  ]);
  sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#c8e6c9");

  var qList = data.questions || [];
  if (typeof qList === "string") {
    try { qList = JSON.parse(qList); } catch (e) {}
  }

  var rows = [];
  qList.forEach(function(q, idx) {
    var optA = "", optB = "", optC = "", optD = "";
    if (Array.isArray(q.options)) {
      q.options.forEach(function(o) {
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
    message: rows.length + " soal berhasil disimpan ke Google Sheets!"
  });
}

function handleResetRoom(roomId, data) {
  var ss = getTargetSpreadsheet(data);
  if (!ss) return jsonResponse({ status: "error", message: "Spreadsheet target belum terhubung." });
  var sheet = ss.getSheetByName("Peserta");
  if (sheet && sheet.getLastRow() > 1) {
    var values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
    for (var i = values.length - 1; i >= 0; i--) {
      if (!roomId || values[i][0] === roomId || roomId === "ALL") {
        sheet.deleteRow(i + 2);
      }
    }
  }
  SpreadsheetApp.flush();
  return jsonResponse({ status: "reset_done", roomId: roomId });
}

function handleClearOfflinePlayers(roomId, data) {
  var ss = getTargetSpreadsheet(data);
  if (!ss) return jsonResponse({ status: "error", message: "Spreadsheet target belum terhubung." });
  var sheet = ss.getSheetByName("Peserta");
  var deletedCount = 0;
  if (sheet && sheet.getLastRow() > 1) {
    var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 14).getValues();
    for (var i = values.length - 1; i >= 0; i--) {
      var rowRoom = values[i][1];
      var rowStatus = values[i][7];
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
