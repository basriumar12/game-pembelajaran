/**
 * ============================================================================
 * GOOGLE APPS SCRIPT (GAS) BACKEND: BPMP FARM QUEST GORONTALO
 * ============================================================================
 * Sistem Multiplayer & Dashboard Pemantauan Guru Real-Time
 * URL Web App:
 * https://script.google.com/a/macros/unigo.ac.id/s/AKfycbx1CZb3x8kpuaY9OvsZVfYoM9IAorENR16720We-4qAKtlMlnkm-43hjWXp7_BqcmM/exec
 * ============================================================================
 */

function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = params.action || "getTeacherDashboard";
  const roomId = params.roomId || "BPMP-01";
  
  if (action === "getQuestions") {
    return handleGetQuestions();
  } else if (action === "getTeacherDashboard" || action === "getRoomPlayers") {
    return handleGetTeacherDashboard(roomId);
  } else if (action === "getLeaderboard") {
    return handleGetLeaderboard(roomId);
  }
  
  return jsonResponse({
    status: "ok",
    message: "BPMP Farm Quest Multi-Player & Teacher Monitoring API Active",
    serverTime: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        if (e.parameter && e.parameter.data) {
          data = JSON.parse(e.parameter.data);
        }
      }
    } else if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    }
    
    const action = data.action || (e.parameter && e.parameter.action);
    
    if (action === "registerPlayer") {
      return handleRegisterPlayer(data);
    } else if (action === "updateProgress" || action === "submitScore") {
      return handleUpdatePlayerProgress(data);
    } else if (action === "resetRoom") {
      return handleResetRoom(data.roomId || "BPMP-01");
    }
    
    return jsonResponse({ status: "success", received: data });
  } catch (error) {
    return jsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * 1. Registrasi Pemain Masuk ke Room (Presensi Siswa)
 */
function handleRegisterPlayer(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Peserta");
  if (!sheet) {
    sheet = ss.insertSheet("Peserta");
    sheet.appendRow([
      "Timestamp", "Room ID", "Player ID", "Nama Lengkap", "NIM / ID",
      "Instansi / Sekolah", "Avatar", "Status", "Skor", "Benar", "Salah", "Petak", "Last Ping"
    ]);
    sheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#c8e6c9");
  }
  
  const now = new Date();
  const roomId = data.roomId || "BPMP-01";
  const playerId = data.playerId || ("PL_" + Utilities.getUuid().slice(0, 8));
  const name = data.name || "Siswa Baru";
  const nim = data.nim || "-";
  const inst = data.institution || "Gorontalo";
  const avatar = data.avatar || "farmer_boy";

  // Periksa apakah siswa sudah terdaftar sebelumnya di sheet ini
  const lastRow = sheet.getLastRow();
  let existingRow = -1;
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    const names = sheet.getRange(2, 4, lastRow - 1, 1).getValues();
    const rooms = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (rooms[i][0] === roomId && (ids[i][0] === playerId || names[i][0].toLowerCase() === name.toLowerCase())) {
        existingRow = i + 2;
        break;
      }
    }
  }

  if (existingRow > 0) {
    // Update data pemain yang masuk kembali
    sheet.getRange(existingRow, 1, 1, 13).setValues([[
      now, roomId, playerId, name, nim, inst, avatar, "ONLINE", 0, 0, 0, 0, now.toLocaleTimeString("id-ID")
    ]]);
  } else {
    // Tambah baris siswa baru
    sheet.appendRow([
      now, roomId, playerId, name, nim, inst, avatar, "ONLINE", 0, 0, 0, 0, now.toLocaleTimeString("id-ID")
    ]);
  }
  
  return jsonResponse({
    status: "registered",
    roomId: roomId,
    playerId: playerId,
    name: name,
    timestamp: now.toISOString()
  });
}

/**
 * 2. Update Progress Real-Time (Skor, Benar, Salah, Posisi Petak)
 */
function handleUpdatePlayerProgress(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Peserta");
  const now = new Date();
  const roomId = data.roomId || "BPMP-01";
  const name = data.name || "";
  const playerId = data.playerId || "";

  if (sheet && sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();
    for (let i = 0; i < values.length; i++) {
      const rowRoom = values[i][1];
      const rowId = values[i][2];
      const rowName = values[i][3];

      if (rowRoom === roomId && (rowId === playerId || rowName.toLowerCase() === name.toLowerCase())) {
        const rowNum = i + 2;
        sheet.getRange(rowNum, 8).setValue(data.isFinished ? "FINISHED" : "PLAYING");
        sheet.getRange(rowNum, 9).setValue(Number(data.totalScore) || 0);
        sheet.getRange(rowNum, 10).setValue(Number(data.correctAnswers) || 0);
        sheet.getRange(rowNum, 11).setValue(Number(data.wrongAnswers) || 0);
        sheet.getRange(rowNum, 12).setValue(Number(data.currentTile) || 0);
        sheet.getRange(rowNum, 13).setValue(now.toLocaleTimeString("id-ID"));
        break;
      }
    }
  }

  // Rekam riwayat ke sheet "Scoreboard" permanen
  let scoreSheet = ss.getSheetByName("Scoreboard");
  if (!scoreSheet) {
    scoreSheet = ss.insertSheet("Scoreboard");
    scoreSheet.appendRow([
      "Timestamp", "Room ID", "Nama Lengkap", "NIM / ID", "Instansi",
      "Total Poin", "Benar", "Salah", "Durasi", "Sisa Waktu"
    ]);
    scoreSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#fff9c4");
  }

  scoreSheet.appendRow([
    now, roomId, data.name || "Anonim", data.nim || "-", data.institution || "-",
    Number(data.totalScore) || 0, Number(data.correctAnswers) || 0, Number(data.wrongAnswers) || 0,
    data.timeElapsed || "00:00:00", data.timeRemaining || "00:00:00"
  ]);

  return jsonResponse({
    status: "progress_updated",
    player: data.name,
    score: data.totalScore,
    correct: data.correctAnswers
  });
}

/**
 * 3. Ambil Data Lengkap untuk Dashboard Guru (Presensi Masuk & Peringkat #1)
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

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 13).getValues();
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
        avatar: row[6] || "farmer_boy",
        status: row[7] || "ONLINE",
        score: Number(row[8]) || 0,
        correct: Number(row[9]) || 0,
        wrong: Number(row[10]) || 0,
        currentTile: Number(row[11]) || 0,
        lastPing: row[12] || "-"
      });
    }
  }

  // Urutkan untuk Leaderboard: Skor tertinggi, lalu jumlah jawaban benar terbanyak
  const sortedLeaderboard = [...roomPlayers].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.correct - a.correct;
  });

  const leader = sortedLeaderboard.length > 0 ? sortedLeaderboard[0] : null;

  return jsonResponse({
    roomId: roomId,
    serverTime: new Date().toLocaleTimeString("id-ID"),
    totalJoined: roomPlayers.length,
    activeNow: roomPlayers.filter(p => p.status !== "OFFLINE").length,
    leader: leader, // Siswa yang menempati Urutan Pertama (Juara 1)
    players: roomPlayers, // Daftar seluruh siswa yang sudah masuk
    leaderboard: sortedLeaderboard // Urutan peringkat 1 s/d selesai
  });
}

/**
 * 4. Ambil Leaderboard Ringkas
 */
function handleGetLeaderboard(roomId) {
  return handleGetTeacherDashboard(roomId);
}

/**
 * 5. Bank 20 Soal Pilihan Ganda dari Sheet "Soal"
 */
function handleGetQuestions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Soal");
  if (!sheet || sheet.getLastRow() < 2) {
    return jsonResponse([]);
  }
  
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues();
  const questions = rows.map((r, i) => ({
    id: r[0] || (i + 1),
    category: r[1] || "BPMP Gorontalo",
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
  return jsonResponse({ status: "reset_done", roomId: roomId });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
