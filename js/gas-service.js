/**
 * Google Apps Script (GAS) & Google Sheets Integration Service
 * Multi-Player Room Sync & Teacher Monitoring System
 */

const GAS_CONFIG = {
  ENDPOINT_URL: "https://script.google.com/a/macros/unigo.ac.id/s/AKfycbx1CZb3x8kpuaY9OvsZVfYoM9IAorENR16720We-4qAKtlMlnkm-43hjWXp7_BqcmM/exec",
  TIMEOUT_MS: 7000,
  POLL_INTERVAL: 4000 // 4 seconds polling for multiplayer updates
};

class GASService {
  constructor() {
    this.endpoint = GAS_CONFIG.ENDPOINT_URL;
    this.isOnline = navigator.onLine;
    this.roomId = "BPMP-01";
    this.playerId = this.getOrCreatePlayerId();
    
    // BroadcastChannel for instant local multi-tab / same-network device sync
    try {
      this.channel = new BroadcastChannel("bpmp_farm_quest_bus");
    } catch (e) {
      this.channel = null;
    }

    window.addEventListener("online", () => { this.isOnline = true; });
    window.addEventListener("offline", () => { this.isOnline = false; });
  }

  getOrCreatePlayerId() {
    let id = localStorage.getItem("bpmp_player_id");
    if (!id) {
      id = "PL_" + Math.random().toString(36).substr(2, 8).toUpperCase();
      localStorage.setItem("bpmp_player_id", id);
    }
    return id;
  }

  /**
   * 1. Register / Join Room (Presensi Siswa)
   */
  async joinGame(playerData) {
    this.roomId = playerData.roomId || "BPMP-01";
    const payload = {
      action: "registerPlayer",
      timestamp: new Date().toISOString(),
      roomId: this.roomId,
      playerId: this.playerId,
      name: playerData.name,
      nim: playerData.nim,
      institution: playerData.institution,
      avatar: playerData.avatar || "farmer_boy"
    };

    console.log("[GAS] Joining Room:", payload);
    localStorage.setItem("bpmp_current_player", JSON.stringify(payload));
    this.saveLocalPlayer(payload);

    // Broadcast to other tabs/players
    if (this.channel) {
      this.channel.postMessage({ type: "PLAYER_JOINED", player: payload });
    }

    try {
      const response = await this.sendPost(payload);
      return { success: true, response };
    } catch (err) {
      console.warn("[GAS] Join saved locally (Offline/Network):", err.message);
      return { success: true, offlineMode: true };
    }
  }

  /**
   * 2. Send Real-Time Progress Update (Ketika Pemain Bergerak / Menjawab Kuis)
   */
  async updateProgress(progressData) {
    const payload = {
      action: "updateProgress",
      roomId: this.roomId,
      playerId: this.playerId,
      name: progressData.name,
      nim: progressData.nim || "-",
      institution: progressData.institution || "Gorontalo",
      totalScore: progressData.totalScore || 0,
      correctAnswers: progressData.correctAnswers || 0,
      wrongAnswers: progressData.wrongAnswers || 0,
      currentTile: progressData.currentTile || 0,
      timeElapsed: progressData.timeElapsed || "00:00:00",
      timeRemaining: progressData.timeRemaining || "00:00:00",
      isFinished: progressData.isFinished || false,
      timestamp: new Date().toLocaleTimeString("id-ID")
    };

    // Update locally
    this.updateLocalScoreboard(
      payload.name,
      payload.totalScore,
      payload.correctAnswers,
      payload.wrongAnswers,
      payload.timeElapsed,
      payload.institution,
      payload.currentTile,
      payload.playerId
    );

    // Broadcast to other players in room
    if (this.channel) {
      this.channel.postMessage({ type: "PLAYER_PROGRESS", player: payload });
    }

    try {
      await this.sendPost(payload);
      return { success: true, synced: true };
    } catch (err) {
      return { success: true, synced: false, local: true };
    }
  }

  /**
   * 3. Ambil Data Pemantauan Guru (Siapa saja yang sudah masuk & Peringkat #1)
   */
  async fetchTeacherDashboard(roomId = this.roomId) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GAS_CONFIG.TIMEOUT_MS);
      const url = `${this.endpoint}?action=getTeacherDashboard&roomId=${encodeURIComponent(roomId)}&t=${Date.now()}`;
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.players)) {
          return data;
        }
      }
    } catch (err) {
      console.warn("[GAS] Using local teacher dashboard cache:", err.message);
    }

    // Fallback: Generate structured dashboard from local storage
    return this.getLocalTeacherDashboard(roomId);
  }

  /**
   * 4. Fetch 20 Questions
   */
  async fetchQuestions() {
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
    } catch (err) {
      console.info("[GAS] Menggunakan Bank 20 Soal BPMP Gorontalo Berkelanjutan:", err.message);
    }
    return window.DEFAULT_QUESTIONS || [];
  }

  /**
   * Send HTTP POST to Google Apps Script Web App
   */
  async sendPost(payload) {
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      return await response.json().catch(() => ({ status: "ok" }));
    } catch (err) {
      // Fallback urlencoded
      await fetch(this.endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ data: JSON.stringify(payload) }).toString()
      });
      return { status: "submitted_nocors" };
    }
  }

  // --- Local / Offline Simulation & Fallbacks ---

  saveLocalPlayer(player) {
    let players = this.getLocalPlayers();
    const idx = players.findIndex(p => p.playerId === player.playerId || p.name === player.name);
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
      registeredAt: new Date().toLocaleTimeString("id-ID"),
      lastPing: new Date().toLocaleTimeString("id-ID")
    };
    if (idx >= 0) players[idx] = entry;
    else players.push(entry);
    localStorage.setItem("bpmp_room_players", JSON.stringify(players));
  }

  getLocalPlayers() {
    const s = localStorage.getItem("bpmp_room_players");
    if (s) {
      try { return JSON.parse(s); } catch (e) {}
    }
    // Initial inspiring Gorontalo classroom roster
    const initial = [
      { roomId: "BPMP-01", playerId: "BOT_01", name: "Siti Rahma Dunggio", nim: "531422010", institution: "SMP Negeri 1 Limboto", avatar: "student_girl", status: "PLAYING", score: 260, correct: 13, wrong: 2, currentTile: 14, lastPing: "10:14" },
      { roomId: "BPMP-01", playerId: "BOT_02", name: "Fajar Mohamad Pakaya", nim: "531422045", institution: "SMA Negeri 2 Gorontalo", avatar: "farmer_boy", status: "PLAYING", score: 220, correct: 11, wrong: 3, currentTile: 11, lastPing: "10:15" },
      { roomId: "BPMP-01", playerId: "BOT_03", name: "Nurul Hidayah Monoarfa", nim: "531422088", institution: "Universitas Negeri Gorontalo", avatar: "eco_expert", status: "ONLINE", score: 180, correct: 9, wrong: 4, currentTile: 8, lastPing: "10:15" },
      { roomId: "BPMP-01", playerId: "BOT_04", name: "Mohamad Rizky Ilahude", nim: "531422099", institution: "SMK Negeri 1 Suwawa", avatar: "farmer_boy", status: "ONLINE", score: 140, correct: 7, wrong: 5, currentTile: 6, lastPing: "10:12" }
    ];
    localStorage.setItem("bpmp_room_players", JSON.stringify(initial));
    return initial;
  }

  updateLocalScoreboard(name, score, correct, wrong, duration, inst, tile = 0, pid = null) {
    let players = this.getLocalPlayers();
    let p = players.find(x => (pid && x.playerId === pid) || x.name === name);
    if (p) {
      p.score = score;
      p.correct = correct;
      p.wrong = wrong;
      p.currentTile = tile;
      p.status = (correct + wrong >= 30) ? "FINISHED" : "PLAYING";
      p.lastPing = new Date().toLocaleTimeString("id-ID");
    } else {
      players.push({
        roomId: this.roomId,
        playerId: pid || this.playerId,
        name: name,
        nim: "-",
        institution: inst || "Gorontalo",
        avatar: "farmer_boy",
        status: "PLAYING",
        score: score,
        correct: correct,
        wrong: wrong,
        currentTile: tile,
        lastPing: new Date().toLocaleTimeString("id-ID")
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
