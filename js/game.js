/**
 * BPMP Farm Quest: Roblox & Harvest Moon 3D Open-World Edition
 * Bebas Berjalan (Joystick & WASD), 30 Posko Kuis Tersebar, & Real-Time Multiplayer
 */

class BPMPFarmGame {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Player State
    this.playerData = {
      name: "Siswa SMA SNT",
      nim: "001",
      institution: "SMA SNT (Kelas X-A)",
      avatar: "student_boy",
      roomId: "SMA-SNT-XA"
    };

    // Movement & Controls
    this.playerMesh = null;
    this.playerPos = new THREE.Vector3(0, 0, 8); // Start in front of BPMP
    this.playerSpeed = 0.22;
    this.moveDir = new THREE.Vector3();
    this.keys = { forward: false, backward: false, left: false, right: false };
    this.joystickDelta = { x: 0, y: 0 };
    this.isWalking = false;
    this.walkAnimTime = 0;

    // Camera
    this.camOffset = new THREE.Vector3(0, 8, 12);
    this.camMode = "follow"; // 'follow', 'isometric', 'top'
    this.cameraZoomDistance = 14;

    // 30 Posko Soal
    this.poskoList = [];
    this.solvedPosko = []; // IDs of answered posko
    this.answeredMap = {}; // { [poskoId]: { selectedKey, isCorrect } }
    this.activeNearbyPosko = null;

    // GPS Guide & Interactive Map
    this.guidedPoskoId = null;
    this.guidedBeaconMesh = null;
    this.activeMapFilter = "all";

    // Multiplayer Peers (Siswa lain di room)
    this.otherPlayers = new Map();
    this.mqttClient = null;
    this.lastBroadcastTime = 0;

    // Session Stats
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.totalQuestions = 30;
    this.energy = 100;
    this.maxEnergy = 100;

    // Timer (60 menit = 3600 detik)
    this.totalTimeSeconds = 3600;
    this.remainingSeconds = 3600;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.isGameOver = false;

    // Scenery animations
    this.windmills = [];
    this.animals = [];

    // Questions bank
    this.questions = window.DEFAULT_QUESTIONS || [];
  }

  async init() {
    this.setupScene();
    this.setupLights();
    this.buildBPMPGorontaloBuilding();
    this.buildEcoFarmEnvironment();

    // Fetch custom questions from Google Apps Script / Guru Bank Soal jika ada
    try {
      if (window.gasService && typeof window.gasService.fetchQuestions === "function") {
        const customQ = await window.gasService.fetchQuestions();
        if (customQ && Array.isArray(customQ) && customQ.length > 0) {
          this.questions = customQ;
        }
      }
    } catch (e) {
      console.warn("Using fallback questions:", e);
    }

    this.build30PoskoSoal();
    this.spawnMyPlayer();
    this.setupRealMultiplayer();
    this.setupKeyboardControls();
    this.setupVirtualJoystick();
    this.setupDpadControls();
    this.setupMinimap();
    this.setupFullMapModal();
    this.setupEventListeners();

    // Start Animation Loop
    this.animate();

    window.addEventListener("resize", () => this.onWindowResize());
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x81c784); // Cerah alami perkebunan
    this.scene.fog = new THREE.FogExp2(0x81c784, 0.01);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.camera.position.set(0, 12, 22);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 0.8);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
    sunLight.position.set(40, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x81d4fa, 0x4caf50, 0.35);
    this.scene.add(hemiLight);
  }

  /**
   * Landmark Utama: Gedung BPMP Provinsi Gorontalo
   */
  buildBPMPGorontaloBuilding() {
    const group = new THREE.Group();
    group.position.set(0, 0, -22);

    // Plaza paving
    const plazaGeo = new THREE.BoxGeometry(36, 0.6, 24);
    const plazaMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = 0.3;
    plaza.receiveShadow = true;
    group.add(plaza);

    // Main 2-story body
    const bodyGeo = new THREE.BoxGeometry(28, 9.5, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 5.2, -1);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Upper fascia
    const eaveGeo = new THREE.BoxGeometry(29.5, 0.9, 13.5);
    const eaveMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const eave = new THREE.Mesh(eaveGeo, eaveMat);
    eave.position.set(0, 10.2, -1);
    group.add(eave);

    // Entrance canopy
    const canopyGeo = new THREE.BoxGeometry(11, 0.7, 5);
    const canopy = new THREE.Mesh(canopyGeo, bodyMat);
    canopy.position.set(0, 7.2, 5.2);
    group.add(canopy);

    // 4 Tiang berundak warna-warni (hijau, jingga, kuning, ungu)
    const colColors = [0x2e7d32, 0xe65100, 0xfbc02d, 0x6a1b9a];
    const colSpacing = [-4.2, -1.4, 1.4, 4.2];
    colSpacing.forEach((xPos, idx) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(xPos, 0.6, 5.2);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6.6, 16), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      core.position.y = 3.3;
      colGroup.add(core);

      const ringMat = new THREE.MeshLambertMaterial({ color: colColors[idx] });
      for (let r = 0; r < 7; r++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.12, 8, 16), ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.9 + r * 0.85;
        colGroup.add(ring);
      }
      group.add(colGroup);
    });

    // Mahkota Atap Khas Rumah Adat Dulohupa Gorontalo
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, 10.6, 1.5);
    const dome = new THREE.Mesh(new THREE.ConeGeometry(3.2, 4.2, 8), new THREE.MeshLambertMaterial({ color: 0x111827 }));
    dome.position.y = 3.0;
    crownGroup.add(dome);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), new THREE.MeshLambertMaterial({ color: 0xffd54f }));
    tip.position.y = 5.2;
    crownGroup.add(tip);
    group.add(crownGroup);

    // Tiang bendera Merah Putih
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 10, 12), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    pole.position.set(0, 5.0, 9.5);
    group.add(pole);

    this.scene.add(group);
  }

  /**
   * Lingkungan Eco-Farm Terbuka (Kebun Jagung, Kolam Limboto, Kincir)
   */
  buildEcoFarmEnvironment() {
    // Terrain Hijau Luas
    const groundGeo = new THREE.CylinderGeometry(60, 62, 2.0, 48);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x7cb342 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Kebun Jagung Gorontalo (Binthe)
    this.createCornPatch(-26, 0, 0, 4, 6);
    this.createCornPatch(24, 0, 0, 4, 6);

    // Kolam Mata Air Limboto
    const water = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.8, 0.25, 24), new THREE.MeshLambertMaterial({ color: 0x00bcd4, transparent: true, opacity: 0.8 }));
    water.position.set(0, 0.15, 26);
    this.scene.add(water);

    // Kincir Angin
    const mill = new THREE.Group();
    mill.position.set(28, 0, -12);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 11, 12), new THREE.MeshLambertMaterial({ color: 0xeeeeee }));
    tower.position.y = 5.5;
    mill.add(tower);
    const blades = new THREE.Group();
    blades.position.set(0, 11, 0.6);
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 0.08), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      blade.position.y = 2.2;
      const pivot = new THREE.Group();
      pivot.rotation.z = (b * Math.PI * 2) / 3;
      pivot.add(blade);
      blades.add(pivot);
    }
    mill.add(blades);
    this.windmills.push(blades);
    this.scene.add(mill);
  }

  createCornPatch(startX, y, startZ, rows, cols) {
    const field = new THREE.Group();
    field.position.set(startX, y, startZ);
    const stalkMat = new THREE.MeshLambertMaterial({ color: 0x689f38 });
    const cobMat = new THREE.MeshLambertMaterial({ color: 0xffd600 });
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 6), stalkMat);
        stalk.position.set(r * 2.2, 1.1, c * 2.2);
        const cob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.8, 8), cobMat);
        cob.position.set(r * 2.2 + 0.18, 1.2, c * 2.2);
        field.add(stalk);
        field.add(cob);
      }
    }
    this.scene.add(field);
  }

  /**
   * 30 - 40 POSKO SOAL TERSEBAR DI SELURUH KAWASAN BPMP GORONTALO
   * Mendukung mode dinamis sesuai paket: SMP (40 Soal), SMA (30 Soal), Bahasa Inggris
   */
  build30PoskoSoal() {
    this.poskoList = [];

    // Distribusi posisi 40 posko yang menarik dan mudah dijelajahi di kawasan BPMP Gorontalo
    const positions = [
      // Zona Depan BPMP Plaza (Posko 1 - 6)
      { x: -6, z: 2 }, { x: 6, z: 2 }, { x: -12, z: 6 }, { x: 12, z: 6 }, { x: -5, z: 12 }, { x: 5, z: 12 },
      // Zona Kebun Jagung Barat (Posko 7 - 14)
      { x: -18, z: -2 }, { x: -24, z: -6 }, { x: -28, z: 4 }, { x: -22, z: 10 }, { x: -18, z: 16 }, { x: -26, z: 18 }, { x: -32, z: 10 }, { x: -30, z: -8 },
      // Zona Danau Limboto Selatan (Posko 15 - 22)
      { x: -10, z: 24 }, { x: -4, z: 32 }, { x: 4, z: 32 }, { x: 10, z: 24 }, { x: 0, z: 36 }, { x: 0, z: 20 }, { x: -16, z: 28 }, { x: 16, z: 28 },
      // Zona Kebun & Kincir Timur (Posko 23 - 30)
      { x: 18, z: -2 }, { x: 24, z: -6 }, { x: 28, z: 4 }, { x: 22, z: 10 }, { x: 18, z: 16 }, { x: 26, z: 18 }, { x: 32, z: 10 }, { x: 30, z: -8 },
      // Zona Pelataran Belakang & Samping BPMP (Posko 31 - 40)
      { x: -16, z: -16 }, { x: 16, z: -16 }, { x: -22, z: -22 }, { x: 22, z: -22 }, { x: -8, z: -30 }, { x: 8, z: -30 }, { x: -28, z: -20 }, { x: 28, z: -20 }, { x: 0, z: -32 }, { x: 0, z: -18 }
    ];

    // Acak urutan bank soal secara dinamis (Fisher-Yates) agar setiap siswa mendapatkan variasi nomor posko yang unik (anti-contek)
    const shuffledQuestions = [...this.questions];
    for (let j = shuffledQuestions.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [shuffledQuestions[j], shuffledQuestions[k]] = [shuffledQuestions[k], shuffledQuestions[j]];
    }

    const count = Math.min(positions.length, this.questions.length);
    this.totalQuestions = count;

    for (let i = 0; i < count; i++) {
      const q = shuffledQuestions[i] || { id: i + 1, category: "Materi Asesmen", question: `Soal nomor ${i + 1}` };
      const pos = positions[i] || { x: (i % 5) * 8 - 16, z: Math.floor(i / 5) * 8 - 10 };

      const poskoGroup = new THREE.Group();
      poskoGroup.name = "posko_group_" + (i + 1);
      poskoGroup.position.set(pos.x, 0, pos.z);

      // 1. Glowing Ground Interaction Ring
      const ringGeo = new THREE.RingGeometry(1.6, 2.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      poskoGroup.add(ring);

      // 2. Kiosk / Paviliun Mini Posko
      const baseGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.4, 16);
      const baseMat = new THREE.MeshLambertMaterial({ color: 0x4e342e });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.2;
      poskoGroup.add(base);

      // Atap Paviliun Posko
      const roofGeo = new THREE.ConeGeometry(2.0, 1.4, 6);
      const roofMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 3.6;
      poskoGroup.add(roof);

      // Tiang penopang
      const pMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 });
      for (let t = 0; t < 3; t++) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), pMat);
        const ang = (t / 3) * Math.PI * 2;
        pillar.position.set(Math.cos(ang) * 1.0, 1.5, Math.sin(ang) * 1.0);
        poskoGroup.add(pillar);
      }

      // 3. Floating Number Billboard (#1 s/d #40)
      const numCanvas = document.createElement("canvas");
      numCanvas.width = 128;
      numCanvas.height = 128;
      const nCtx = numCanvas.getContext("2d");
      nCtx.fillStyle = "#1e293b";
      nCtx.beginPath();
      nCtx.arc(64, 64, 58, 0, Math.PI * 2);
      nCtx.fill();
      nCtx.strokeStyle = "#f59e0b";
      nCtx.lineWidth = 8;
      nCtx.stroke();
      nCtx.fillStyle = "#ffffff";
      nCtx.font = "bold 52px sans-serif";
      nCtx.textAlign = "center";
      nCtx.textBaseline = "middle";
      nCtx.fillText(`${i + 1}`, 64, 64);

      const numTex = new THREE.CanvasTexture(numCanvas);
      const numSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: numTex }));
      numSprite.position.set(0, 4.6, 0);
      numSprite.scale.set(1.8, 1.8, 1.8);
      poskoGroup.add(numSprite);

      this.scene.add(poskoGroup);

      this.poskoList.push({
        id: i + 1,
        question: q,
        x: pos.x,
        z: pos.z,
        isSolved: false,
        isAnswered: false,
        userAnswer: null,
        isCorrect: false,
        mesh: poskoGroup,
        group: poskoGroup,
        ring: ring,
        roof: roof,
        sprite: numSprite
      });
    }
  }

  /**
   * Rebuild Posko saat Siswa Mengganti Paket Soal
   */
  rebuildPoskos() {
    if (this.poskoList && this.scene) {
      this.poskoList.forEach(p => {
        if (p.mesh) this.scene.remove(p.mesh);
        if (p.group) this.scene.remove(p.group);
      });
    }
    this.poskoList = [];
    this.solvedPosko = [];
    this.answeredMap = {};
    this.activeNearbyPosko = null;
    this.build30PoskoSoal();
    this.updateHUD();
    this.updateMinimap();
    if (this.updateMapModalStats) this.updateMapModalStats();
    if (this.renderLargeMap) this.renderLargeMap();
  }

  /**
   * Ganti Paket Soal (SMP KKA, SMA IoT, atau Bahasa Inggris TTS)
   */
  switchPackage(packageId) {
    this.selectedPackageId = packageId;
    const pkg = window.QUESTION_PACKAGES ? window.QUESTION_PACKAGES[packageId] : null;
    if (pkg && Array.isArray(pkg.questions) && pkg.questions.length > 0) {
      this.questions = pkg.questions;
    }
    if (this.scene) {
      this.rebuildPoskos();
    }
  }

  /**
   * Karakter Saya (Pemain Utama)
   */
  spawnMyPlayer() {
    this.playerMesh = this.createChibiAvatar(0x1976d2, this.playerData.avatar || "student_boy", true, this.playerData.name, this.score);
    this.playerMesh.position.copy(this.playerPos);
    this.scene.add(this.playerMesh);
  }

  /**
   * Multiplayer Real: Siswa Asli Terlihat Berlari di Arena (Antar-HP & Laptop)
   * Menggunakan Dual-Sync: MQTT WebSockets (Realtime) + Google Sheets Roster Sync
   */
  setupRealMultiplayer() {
    this.otherPlayers.clear();

    // 1. Ambil daftar siswa dari penyimpanan lokal
    const localRoster = window.gasService.getLocalPlayers();
    localRoster.forEach(p => {
      if (p.playerId !== window.gasService.playerId && p.roomId === this.playerData.roomId) {
        this.addOrUpdateRealPlayer(p.playerId, p.name, p.avatar || "student_boy", p.x || -4, p.z || 6);
      }
    });

    // 2. Hubungkan ke Broker Real-time Cross-Device (MQTT over WebSocket)
    this.initRealtimeMQTT();

    // 3. Sinkronisasi berkala dari Google Sheets agar semua murid yang login muncul di arena
    this.syncOnlineRosterFromGAS();
    setInterval(() => {
      this.syncOnlineRosterFromGAS();
    }, 4000);
  }

  initRealtimeMQTT() {
    try {
      if (typeof mqtt !== "undefined") {
        const clientId = "snt_client_" + Math.random().toString(16).substring(2, 9);
        this.mqttClient = mqtt.connect("wss://broker.emqx.io:8084/mqtt", {
          clientId: clientId,
          clean: true,
          connectTimeout: 5000,
          reconnectPeriod: 4000
        });

        const topic = `snt/bpmp/arena/${this.playerData.roomId || "SMA-SNT-XA"}`;
        this.mqttClient.on("connect", () => {
          console.log("[Multiplayer Realtime] Terhubung ke Broker Cross-Device! Topic:", topic);
          this.mqttClient.subscribe(topic);
          this.broadcastMyPosition();
        });

        this.mqttClient.on("message", (t, msg) => {
          try {
            const data = JSON.parse(msg.toString());
            if (data.id && data.id !== window.gasService.playerId) {
              // Jika siswa ini sudah selesai, langsung hilangkan dari arena 3D
              if (data.type === "PLAYER_FINISH" || data.isFinished || data.status === "FINISHED") {
                this.removeRealPlayer(data.id);
                return;
              }
              const peer = this.addOrUpdateRealPlayer(data.id, data.name, data.avatar || "student_boy", data.x, data.z, data.score || 0);
              if (peer) peer.hasRealtimeMQTT = true;
            }
          } catch (e) {}
        });
      }
    } catch (err) {
      console.warn("[MQTT Error]:", err);
    }
  }

  async syncOnlineRosterFromGAS() {
    if (!window.gasService) return;
    try {
      const data = await window.gasService.fetchTeacherDashboard(this.playerData.roomId);
      if (data && data.players && Array.isArray(data.players)) {
        data.players.forEach((p, idx) => {
          if (p.playerId !== window.gasService.playerId && (p.roomId === this.playerData.roomId || !p.roomId)) {
            // Jika siswa sudah selesai mengerjakan (status FINISHED atau isFinished), despawn dari arena
            if (p.status === "FINISHED" || p.isFinished) {
              this.removeRealPlayer(p.playerId);
              return;
            }

            let peer = this.otherPlayers.get(p.playerId);
            if (!peer) {
              // Siswa baru yang masuk dari HP / laptop lain!
              const tileIdx = (p.currentTile && p.currentTile > 0 && p.currentTile <= 30) 
                ? (p.currentTile - 1) 
                : (idx % 6);
              const posko = this.poskoList[tileIdx];
              const startX = posko ? posko.x + (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 12;
              const startZ = posko ? posko.z + (Math.random() - 0.5) * 4 : 4 + (Math.random() - 0.5) * 8;
              this.addOrUpdateRealPlayer(p.playerId, p.name, p.avatar || "student_boy", startX, startZ, p.score || 0);
            } else {
              if (p.score !== undefined) {
                peer.score = p.score;
                this.updateAvatarTag(peer.mesh, peer.name, peer.score, false);
              }
              if (p.currentTile && !peer.hasRealtimeMQTT) {
                const posko = this.poskoList[p.currentTile - 1];
                if (posko) peer.targetPos.set(posko.x, 0, posko.z);
              }
            }
          }
        });
        this.updateMapModalStats();
      }
    } catch (e) {
      console.warn("[GAS Roster Sync Error]:", e);
    }
  }

  removeRealPlayer(id) {
    const peer = this.otherPlayers.get(id);
    if (peer) {
      if (peer.mesh) {
        this.scene.remove(peer.mesh);
      }
      this.otherPlayers.delete(id);
      this.updateMinimap();
      this.updateMapModalStats();
      this.renderLargeMap();
    }
  }

  addOrUpdateRealPlayer(id, name, avatarType, x, z, score = 0) {
    let peer = this.otherPlayers.get(id);
    if (!peer) {
      const color = (avatarType === "student_girl") ? 0xe91e63 : 0x0284c7;
      const mesh = this.createChibiAvatar(color, avatarType, false, name, score);
      mesh.position.set(x, 0, z);
      this.scene.add(mesh);
      peer = { name: name, mesh: mesh, targetPos: new THREE.Vector3(x, 0, z), speed: 0.18, score: score };
      this.otherPlayers.set(id, peer);
      this.updateMinimap();
      this.updateMapModalStats();
    } else {
      peer.targetPos.set(x, 0, z);
      if (score !== undefined && score !== peer.score) {
        peer.score = score;
        this.updateAvatarTag(peer.mesh, name, score, false);
      }
    }
    return peer;
  }

  createChibiAvatar(colorHex, type = "student_boy", isMain = false, labelText = "", score = 0) {
    const avatar = new THREE.Group();

    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.9, 12), new THREE.MeshLambertMaterial({ color: colorHex }));
    body.position.y = 0.85;
    body.castShadow = true;
    avatar.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshLambertMaterial({ color: 0xffd1a4 }));
    head.position.y = 1.7;
    head.castShadow = true;
    avatar.add(head);

    // Caping / Beret / Hijab
    if (type === "student_girl") {
      const hijab = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 16), new THREE.MeshLambertMaterial({ color: 0xf8bbd0 }));
      hijab.position.y = 1.72;
      avatar.add(hijab);
    } else {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.45, 12), new THREE.MeshLambertMaterial({ color: 0xd7ccc8 }));
      cap.position.y = 2.2;
      avatar.add(cap);
    }

    // Legs
    const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x263238 }));
    lLeg.position.set(-0.22, 0.25, 0);
    avatar.add(lLeg);
    const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x263238 }));
    rLeg.position.set(0.22, 0.25, 0);
    avatar.add(rLeg);

    avatar.leftLeg = lLeg;
    avatar.rightLeg = rLeg;

    // Floating Name Tag (Roblox Style dengan Skor Live)
    const displayName = isMain ? `${this.playerData.name || "Saya"} (⭐ ${this.score})` : `${labelText} (⭐ ${score})`;
    const tagCanvas = document.createElement("canvas");
    tagCanvas.width = 300;
    tagCanvas.height = 70;
    const tCtx = tagCanvas.getContext("2d");
    tCtx.fillStyle = isMain ? "rgba(245, 158, 11, 0.95)" : "rgba(15, 23, 42, 0.85)";
    tCtx.roundRect(8, 8, 284, 54, 14);
    tCtx.fill();
    tCtx.strokeStyle = isMain ? "#ffffff" : "#38bdf8";
    tCtx.lineWidth = 3;
    tCtx.stroke();

    tCtx.fillStyle = "#ffffff";
    tCtx.font = "bold 22px sans-serif";
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    tCtx.fillText(displayName, 150, 35);

    const tagSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(tagCanvas) }));
    tagSprite.position.set(0, 2.7, 0);
    tagSprite.scale.set(2.8, 0.65, 1);
    avatar.add(tagSprite);
    avatar.tagSprite = tagSprite;

    avatar.scale.set(1.2, 1.2, 1.2);
    return avatar;
  }

  updateAvatarTag(avatar, nameText, score = 0, isMain = false) {
    if (!avatar || !avatar.tagSprite) return;
    const tagCanvas = document.createElement("canvas");
    tagCanvas.width = 300;
    tagCanvas.height = 70;
    const tCtx = tagCanvas.getContext("2d");
    tCtx.fillStyle = isMain ? "rgba(245, 158, 11, 0.95)" : "rgba(15, 23, 42, 0.85)";
    tCtx.roundRect(8, 8, 284, 54, 14);
    tCtx.fill();
    tCtx.strokeStyle = isMain ? "#ffffff" : "#38bdf8";
    tCtx.lineWidth = 3;
    tCtx.stroke();

    tCtx.fillStyle = "#ffffff";
    tCtx.font = "bold 22px sans-serif";
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    const label = isMain ? `${nameText} (⭐ ${score})` : `${nameText} (⭐ ${score})`;
    tCtx.fillText(label, 150, 35);

    avatar.tagSprite.material.map = new THREE.CanvasTexture(tagCanvas);
    avatar.tagSprite.material.needsUpdate = true;
  }

  /**
   * Keyboard Controls (WASD / Panah) untuk Laptop
   */
  setupKeyboardControls() {
    window.addEventListener("keydown", e => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") this.keys.forward = true;
      if (k === "s" || k === "arrowdown") this.keys.backward = true;
      if (k === "a" || k === "arrowleft") this.keys.left = true;
      if (k === "d" || k === "arrowright") this.keys.right = true;

      // Tombol E atau Spasi untuk Masuk Posko Terdekat
      if ((k === "e" || k === " " || k === "enter") && this.activeNearbyPosko) {
        this.openPoskoQuiz(this.activeNearbyPosko);
      }
    });

    window.addEventListener("keyup", e => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") this.keys.forward = false;
      if (k === "s" || k === "arrowdown") this.keys.backward = false;
      if (k === "a" || k === "arrowleft") this.keys.left = false;
      if (k === "d" || k === "arrowright") this.keys.right = false;
    });
  }

  /**
   * Virtual Joystick Analog untuk Layar Sentuh HP (Mobile)
   */
  setupVirtualJoystick() {
    const zone = document.getElementById("joystick-zone");
    const stick = document.getElementById("joystick-stick");
    if (!zone || !stick) return;

    let isTouching = false;
    let startX = 0, startY = 0;
    const maxRadius = 40;

    const handleStart = (clientX, clientY) => {
      isTouching = true;
      const rect = zone.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
      handleMove(clientX, clientY);
    };

    const handleMove = (clientX, clientY) => {
      if (!isTouching) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const clampedDist = Math.min(dist, maxRadius);
      const stickX = Math.cos(angle) * clampedDist;
      const stickY = Math.sin(angle) * clampedDist;

      stick.style.transform = `translate(${stickX}px, ${stickY}px)`;

      // Normalisasi nilai joystick (-1 s/d 1)
      this.joystickDelta.x = stickX / maxRadius;
      this.joystickDelta.y = stickY / maxRadius;
    };

    const handleEnd = () => {
      isTouching = false;
      stick.style.transform = "translate(0px, 0px)";
      this.joystickDelta.x = 0;
      this.joystickDelta.y = 0;
    };

    zone.addEventListener("touchstart", e => {
      e.preventDefault();
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    window.addEventListener("touchmove", e => {
      if (isTouching && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener("touchend", () => handleEnd());
    window.addEventListener("touchcancel", () => handleEnd());

    // Mouse support for testing joystick on desktop
    zone.addEventListener("mousedown", e => handleStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => { if (isTouching) handleMove(e.clientX, e.clientY); });
    window.addEventListener("mouseup", () => handleEnd());
  }

  /**
   * Touch D-Pad Navigasi Responsif & Direct Zoom Controls di Layar HP
   */
  setupDpadControls() {
    const dpadUp = document.getElementById("dpad-up");
    const dpadDown = document.getElementById("dpad-down");
    const dpadLeft = document.getElementById("dpad-left");
    const dpadRight = document.getElementById("dpad-right");
    const btnToggleCtrl = document.getElementById("btn-toggle-ctrl");
    const joyZone = document.getElementById("joystick-zone");
    const dpadZone = document.getElementById("dpad-zone");

    const bindBtn = (el, keyName) => {
      if (!el) return;
      const start = e => {
        e.preventDefault();
        e.stopPropagation();
        this.keys[keyName] = true;
        el.classList.add("pressed");
      };
      const end = e => {
        e.preventDefault();
        e.stopPropagation();
        this.keys[keyName] = false;
        el.classList.remove("pressed");
      };
      el.addEventListener("touchstart", start, { passive: false });
      el.addEventListener("touchend", end, { passive: false });
      el.addEventListener("touchcancel", end, { passive: false });
      el.addEventListener("mousedown", start);
      el.addEventListener("mouseup", end);
      el.addEventListener("mouseleave", end);
    };

    bindBtn(dpadUp, "forward");
    bindBtn(dpadDown, "backward");
    bindBtn(dpadLeft, "left");
    bindBtn(dpadRight, "right");

    if (btnToggleCtrl && joyZone && dpadZone) {
      let isDpad = false;
      btnToggleCtrl.addEventListener("click", () => {
        isDpad = !isDpad;
        if (isDpad) {
          joyZone.style.display = "none";
          dpadZone.style.display = "flex";
          btnToggleCtrl.textContent = "🕹️ Analog";
          this.showToast("Mode Navigasi: Touch D-Pad Aktif 🕹️");
        } else {
          joyZone.style.display = "block";
          dpadZone.style.display = "none";
          btnToggleCtrl.textContent = "🕹️ D-Pad";
          this.showToast("Mode Navigasi: Analog Joystick Aktif 🕹️");
        }
      });
    }

    // Tombol Zoom In / Out / Reset Kamera Langsung di Layar HP
    const btnZoomIn = document.getElementById("btn-zoom-in");
    const btnZoomOut = document.getElementById("btn-zoom-out");
    const btnZoomReset = document.getElementById("btn-zoom-reset");

    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", () => {
        this.cameraZoomDistance = Math.max(7, (this.cameraZoomDistance || 14) - 2.5);
      });
    }
    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => {
        this.cameraZoomDistance = Math.min(32, (this.cameraZoomDistance || 14) + 2.5);
      });
    }
    if (btnZoomReset) {
      btnZoomReset.addEventListener("click", () => {
        this.cameraZoomDistance = 14;
        this.camMode = "follow";
      });
    }
  }

  /**
   * Loop Update Gerakan Karakter & Deteksi Dekat Posko
   */
  updateMovement(delta) {
    if (this.isGameOver || !this.playerMesh) return;

    this.moveDir.set(0, 0, 0);

    // Input Keyboard
    if (this.keys.forward) this.moveDir.z -= 1;
    if (this.keys.backward) this.moveDir.z += 1;
    if (this.keys.left) this.moveDir.x -= 1;
    if (this.keys.right) this.moveDir.x += 1;

    // Input Virtual Joystick
    if (Math.abs(this.joystickDelta.x) > 0.15 || Math.abs(this.joystickDelta.y) > 0.15) {
      this.moveDir.x += this.joystickDelta.x;
      this.moveDir.z += this.joystickDelta.y;
    }

    if (this.moveDir.lengthSq() > 0.01) {
      this.moveDir.normalize();
      this.isWalking = true;

      // Pindahkan posisi
      this.playerPos.x += this.moveDir.x * this.playerSpeed;
      this.playerPos.z += this.moveDir.z * this.playerSpeed;

      // Batasi agar tidak keluar pulau (radius 55)
      const distFromCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
      if (distFromCenter > 52) {
        this.playerPos.x = (this.playerPos.x / distFromCenter) * 52;
        this.playerPos.z = (this.playerPos.z / distFromCenter) * 52;
      }

      this.playerMesh.position.x = this.playerPos.x;
      this.playerMesh.position.z = this.playerPos.z;

      // Rotasi karakter menghadap arah jalan
      const angle = Math.atan2(this.moveDir.x, this.moveDir.z);
      this.playerMesh.rotation.y = angle;

      // Animasi kaki melangkah (walk cycle)
      this.walkAnimTime += delta * 12;
      if (this.playerMesh.leftLeg && this.playerMesh.rightLeg) {
        this.playerMesh.leftLeg.rotation.x = Math.sin(this.walkAnimTime) * 0.6;
        this.playerMesh.rightLeg.rotation.x = -Math.sin(this.walkAnimTime) * 0.6;
      }

      // Broadcast pergerakan ke siswa lain
      this.broadcastMyPosition();
    } else {
      this.isWalking = false;
      if (this.playerMesh.leftLeg && this.playerMesh.rightLeg) {
        this.playerMesh.leftLeg.rotation.x = 0;
        this.playerMesh.rightLeg.rotation.x = 0;
      }
    }

    // Kamera mengikuti karakter dari belakang (Mendukung Zoom Jarak Dekat/Jauh)
    if (this.camMode === "follow") {
      const zoom = this.cameraZoomDistance || 14;
      const targetCam = new THREE.Vector3(
        this.playerPos.x,
        this.playerPos.y + zoom * 0.65,
        this.playerPos.z + zoom * 0.95
      );
      this.camera.position.lerp(targetCam, 0.08);
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.5, this.playerPos.z);
    }

    // Update Panduan Arah Kompas / GPS ke Posko
    if (this.guidedPoskoId) {
      this.updateGPSGuide();
    }

    // Periksa Kedekatan dengan 30 Posko
    this.checkNearbyPosko();

    // Pergerakan Siswa Lain di Arena
    this.updateOtherPlayers(delta);
  }

  checkNearbyPosko() {
    let closestPosko = null;
    let minDist = 4.2; // Jarak interaksi

    for (const p of this.poskoList) {
      const d = Math.hypot(this.playerPos.x - p.x, this.playerPos.z - p.z);
      if (d < minDist) {
        closestPosko = p;
        break;
      }
    }

    const actionContainer = document.getElementById("posko-action-container");
    const btnEnter = document.getElementById("btn-enter-posko");

    if (closestPosko) {
      this.activeNearbyPosko = closestPosko;
      if (actionContainer) actionContainer.style.display = "flex";
      if (btnEnter) {
        if (closestPosko.isAnswered) {
          const badge = closestPosko.isCorrect ? "✅ BENAR" : "❌ SALAH";
          btnEnter.innerHTML = `<span>🏛️ Posko #${closestPosko.id}:</span> <span>🔒 SUDAH DIJAWAB (${badge}) - Lihat Pembahasan</span>`;
          btnEnter.style.background = closestPosko.isCorrect 
            ? "linear-gradient(135deg, #059669, #10b981)" 
            : "linear-gradient(135deg, #b91c1c, #ef4444)";
        } else {
          btnEnter.innerHTML = `<span>🏛️ Posko #${closestPosko.id}:</span> <span>🚪 [E / Ketuk] Masuk & Kerjakan Soal</span>`;
          btnEnter.style.background = "linear-gradient(135deg, #d97706, #b45309)";
        }
      }
    } else {
      this.activeNearbyPosko = null;
      if (actionContainer) actionContainer.style.display = "none";
    }
  }

  /**
   * Menggerakkan Karakter Siswa Lain Sesuai Posisi Asli Mereka di Arena
   */
  updateOtherPlayers(delta) {
    this.otherPlayers.forEach(p => {
      const dist = p.mesh.position.distanceTo(p.targetPos);
      if (dist > 0.15) {
        const dir = new THREE.Vector3().subVectors(p.targetPos, p.mesh.position).normalize();
        const step = Math.min(dist, p.speed * 60 * delta);
        p.mesh.position.addScaledVector(dir, step);
        p.mesh.rotation.y = Math.atan2(dir.x, dir.z);

        if (p.mesh.leftLeg) {
          p.mesh.leftLeg.rotation.x = Math.sin(this.clock.getElapsedTime() * 10) * 0.5;
          p.mesh.rightLeg.rotation.x = -Math.sin(this.clock.getElapsedTime() * 10) * 0.5;
        }
      } else {
        // Posisi sudah sesuai, karakter diam (tidak ada jalan acak otomatis)
        if (p.mesh.leftLeg) {
          p.mesh.leftLeg.rotation.x = 0;
          p.mesh.rightLeg.rotation.x = 0;
        }
      }
    });
  }

  broadcastMyPosition() {
    const now = Date.now();
    if (this.lastBroadcastTime && (now - this.lastBroadcastTime < 90)) return;
    this.lastBroadcastTime = now;

    const payload = {
      id: window.gasService.playerId,
      name: this.playerData.name,
      avatar: this.playerData.avatar || "student_boy",
      x: Math.round(this.playerPos.x * 100) / 100,
      z: Math.round(this.playerPos.z * 100) / 100,
      rotY: this.playerMesh ? Math.round(this.playerMesh.rotation.y * 100) / 100 : 0,
      score: this.score,
      solvedCount: Object.keys(this.answeredMap).length
    };

    if (window.gasService && window.gasService.channel) {
      window.gasService.channel.postMessage({
        type: "PLAYER_MOVE",
        ...payload
      });
    }

    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `snt/bpmp/arena/${this.playerData.roomId || "SMA-SNT-XA"}`;
      this.mqttClient.publish(topic, JSON.stringify(payload));
    }
  }

  /**
   * Modal Interaktif Menjawab Soal di Posko yang Didekati
   * Mendukung Teks Bacaan (Reading Passage) & Audio Text-to-Speech (Listening Comprehension)
   */
  openPoskoQuiz(posko) {
    const q = posko.question;
    const modal = document.getElementById("posko-quiz-modal");
    if (!modal) return;

    if (window.ttsManager) window.ttsManager.stop();
    window.soundSystem.playModalOpen();

    const optContainer = document.getElementById("modal-posko-options");
    const feedbackBox = document.getElementById("modal-posko-feedback");
    const nextBtn = document.getElementById("btn-modal-close");

    // Wadah Reading & Listening
    const readingBox = document.getElementById("posko-reading-container");
    if (readingBox) {
      if (q.readingPassage || q.type === "reading") {
        readingBox.style.display = "block";
        readingBox.innerHTML = `
          <div class="reading-passage-box">
            <div style="font-size: 11px; font-weight: 800; color: #0284c7; margin-bottom: 6px;">📖 TEKS BACAAN (READING PASSAGE):</div>
            <div>${q.readingPassage || ''}</div>
          </div>
        `;
      } else {
        readingBox.style.display = "none";
        readingBox.innerHTML = "";
      }
    }

    const listeningBox = document.getElementById("posko-listening-container");
    if (listeningBox) {
      if (q.audioText || q.type === "listening") {
        const maxPlays = q.maxPlays || 2;
        const remaining = window.ttsManager ? window.ttsManager.getPlaysRemaining(posko.id, maxPlays) : maxPlays;
        const defaultSpeed = q.audioSpeed || (window.ttsManager ? window.ttsManager.currentRate : 1.0);

        listeningBox.style.display = "block";
        listeningBox.innerHTML = `
          <div class="listening-player-box">
            <div class="listening-header">
              <span class="listening-badge">🎧 SOAL LISTENING AUDIO</span>
              <span id="listening-quota-${posko.id}" class="listening-quota-tag">
                Sisa Putar: <b>${remaining} / ${maxPlays}x</b>
              </span>
            </div>
            <div style="font-size: 11.5px; color: #cbd5e1; margin-bottom: 10px; line-height: 1.4;">
              Dengarkan rekaman suara di bawah ini untuk menjawab pertanyaan:
            </div>
            <div class="listening-controls">
              <button id="btn-play-tts-${posko.id}" class="btn-tts-play" ${remaining <= 0 ? 'disabled' : ''}>
                <span id="tts-icon-${posko.id}">🔊</span>
                <span id="tts-label-${posko.id}">Dengarkan Percakapan</span>
                <span id="tts-wave-${posko.id}" class="sound-wave-anim" style="display: none;">
                  <span class="sound-wave-bar"></span>
                  <span class="sound-wave-bar"></span>
                  <span class="sound-wave-bar"></span>
                  <span class="sound-wave-bar"></span>
                </span>
              </button>
              <div class="tts-speed-selector">
                <span style="font-size: 10px; color: #94a3b8; margin-right: 4px;">Kecepatan:</span>
                <button class="tts-speed-btn ${defaultSpeed <= 0.8 ? 'active' : ''}" data-speed="0.75">🐢 0.75x</button>
                <button class="tts-speed-btn ${defaultSpeed > 0.8 && defaultSpeed < 1.2 ? 'active' : ''}" data-speed="1.0">▶️ 1.0x</button>
                <button class="tts-speed-btn ${defaultSpeed >= 1.2 ? 'active' : ''}" data-speed="1.25">⚡ 1.25x</button>
              </div>
            </div>
          </div>
        `;

        listeningBox.querySelectorAll(".tts-speed-btn").forEach(sBtn => {
          sBtn.addEventListener("click", () => {
            listeningBox.querySelectorAll(".tts-speed-btn").forEach(b => b.classList.remove("active"));
            sBtn.classList.add("active");
            const spd = parseFloat(sBtn.dataset.speed) || 1.0;
            if (window.ttsManager) window.ttsManager.setRate(spd);
          });
        });

        const playBtn = document.getElementById(`btn-play-tts-${posko.id}`);
        const ttsIcon = document.getElementById(`tts-icon-${posko.id}`);
        const ttsLabel = document.getElementById(`tts-label-${posko.id}`);
        const ttsWave = document.getElementById(`tts-wave-${posko.id}`);
        const quotaTag = document.getElementById(`listening-quota-${posko.id}`);

        if (playBtn) {
          playBtn.addEventListener("click", () => {
            if (window.ttsManager && window.ttsManager.isPlaying) {
              window.ttsManager.stop();
              ttsIcon.textContent = "🔊";
              ttsLabel.textContent = "Dengarkan Percakapan";
              ttsWave.style.display = "none";
              return;
            }

            const currentRem = window.ttsManager ? window.ttsManager.getPlaysRemaining(posko.id, maxPlays) : maxPlays;
            if (currentRem <= 0) {
              playBtn.disabled = true;
              return;
            }

            window.ttsManager.speak(q.audioText, posko.id, {
              maxPlays: maxPlays,
              rate: window.ttsManager.currentRate || 1.0,
              lang: q.audioLang || "en-US",
              onStart: () => {
                ttsIcon.textContent = "⏹️";
                ttsLabel.textContent = "Sedang Berbicara...";
                ttsWave.style.display = "inline-flex";
                const remAfter = window.ttsManager.getPlaysRemaining(posko.id, maxPlays);
                if (quotaTag) quotaTag.innerHTML = `Sisa Putar: <b>${remAfter} / ${maxPlays}x</b>`;
                if (remAfter <= 0) playBtn.disabled = true;
              },
              onEnd: () => {
                ttsIcon.textContent = "🔊";
                ttsLabel.textContent = "Dengarkan Percakapan";
                ttsWave.style.display = "none";
                const remAfter = window.ttsManager.getPlaysRemaining(posko.id, maxPlays);
                if (remAfter <= 0) {
                  playBtn.disabled = true;
                  playBtn.innerHTML = `🚫 Kuota Dengar Habis (Maks. ${maxPlays}x)`;
                }
              }
            });
          });
        }
      } else {
        listeningBox.style.display = "none";
        listeningBox.innerHTML = "";
      }
    }

    const totalInList = this.poskoList.length || 30;

    // 🔒 JIKA SOAL INI SUDAH DIJAWAB: KUNCI TOTAL! HANYA BISA LIHAT PEMBAHASAN
    if (posko.isAnswered) {
      const statusTitle = posko.isCorrect ? "✅ TERJAWAB BENAR" : "❌ TERJAWAB SALAH";
      document.getElementById("modal-posko-badge").textContent = `Posko #${posko.id} dari ${totalInList} (🔒 SUDAH SELESAI)`;
      document.getElementById("modal-posko-topic").textContent = `${q.category || "Materi Asesmen"} — ${statusTitle}`;
      document.getElementById("modal-posko-question").textContent = q.question;

      optContainer.innerHTML = "";
      q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "retro-option-btn";
        btn.disabled = true; // Dinonaktifkan mutlak
        btn.style.cursor = "not-allowed";
        btn.style.opacity = "0.85";

        if (opt.key === posko.userAnswer) {
          btn.classList.add(posko.isCorrect ? "correct" : "wrong");
          btn.innerHTML = `<span class="option-key">${opt.key}</span> <span>${opt.text} <b style="margin-left: 8px;">(Jawaban Anda)</b></span>`;
        } else if (opt.key === q.answer && !posko.isCorrect) {
          btn.classList.add("correct");
          btn.innerHTML = `<span class="option-key">${opt.key}</span> <span>${opt.text} <b style="margin-left: 8px;">(Kunci yang Benar)</b></span>`;
        } else {
          btn.innerHTML = `<span class="option-key">${opt.key}</span> <span>${opt.text}</span>`;
        }
        optContainer.appendChild(btn);
      });

      feedbackBox.className = posko.isCorrect ? "quiz-explanation correct" : "quiz-explanation wrong";
      feedbackBox.innerHTML = `<strong>🔒 SOAL INI TELAH DIJAWAB (${posko.isCorrect ? 'BENAR +20 Poin' : 'SALAH 0 Poin'}):</strong><br>Soal yang sudah dikerjakan tidak dapat diubah atau dijawab ulang.<br><br><strong>Kunci Jawaban: ${q.answer}</strong><br><em>Pembahasan:</em> ${q.explanation}`;
      feedbackBox.style.display = "block";

      nextBtn.style.display = "inline-block";
      nextBtn.textContent = "Tutup & Lanjut Jelajahi Posko Lain ➔";
      nextBtn.onclick = () => {
        if (window.ttsManager) window.ttsManager.stop();
        modal.classList.remove("active");
      };

      modal.classList.add("active");
      return;
    }

    // JIKA BELUM DIJAWAB: TAMPILKAN SOAL BARU UNTUK DIJAWAB
    document.getElementById("modal-posko-badge").textContent = `Posko #${posko.id} dari ${totalInList}`;
    document.getElementById("modal-posko-topic").textContent = q.category || "Materi Asesmen";
    document.getElementById("modal-posko-question").textContent = q.question;

    feedbackBox.style.display = "none";
    nextBtn.style.display = "none";
    optContainer.innerHTML = "";

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "retro-option-btn";
      btn.innerHTML = `<span class="option-key">${opt.key}</span> <span>${opt.text}</span>`;
      btn.onclick = () => this.handlePoskoAnswer(posko, opt.key, btn);
      optContainer.appendChild(btn);
    });

    modal.classList.add("active");
  }

  handlePoskoAnswer(posko, selectedKey, clickedBtn) {
    if (posko.isAnswered) return; // Mencegah double click / pengulangan

    if (window.ttsManager) window.ttsManager.stop();

    const q = posko.question;
    const isCorrect = (selectedKey === q.answer);
    const allBtns = document.querySelectorAll("#modal-posko-options .retro-option-btn");
    allBtns.forEach(b => {
      b.disabled = true;
      b.style.cursor = "not-allowed";
    });

    // Tandai permanen bahwa posko ini sudah dijawab
    posko.isAnswered = true;
    posko.userAnswer = selectedKey;
    posko.isCorrect = isCorrect;
    this.answeredMap[posko.id] = { selectedKey, isCorrect };

    if (!this.solvedPosko.includes(posko.id)) {
      this.solvedPosko.push(posko.id);
    }

    const feedbackBox = document.getElementById("modal-posko-feedback");
    const nextBtn = document.getElementById("btn-modal-close");

    if (isCorrect) {
      clickedBtn.classList.add("correct");
      window.soundSystem.playCorrect();

      posko.isSolved = true;
      this.score += 20;
      this.correctCount++;

      // Ubah tampilan Posko 3D menjadi Hijau Mengkilap
      posko.roof.material.color.setHex(0x10b981);
      posko.ring.material.color.setHex(0x10b981);

      feedbackBox.className = "quiz-explanation correct";
      feedbackBox.innerHTML = `<strong>🎉 JAWABAN BENAR! (+20 Poin):</strong><br>${q.explanation}`;
      feedbackBox.style.display = "block";
    } else {
      clickedBtn.classList.add("wrong");
      window.soundSystem.playWrong();
      this.wrongCount++;

      // Ubah tampilan Posko 3D menjadi Merah (Sudah Dijawab, Salah)
      posko.roof.material.color.setHex(0xef4444);
      posko.ring.material.color.setHex(0xef4444);

      allBtns.forEach(b => {
        if (b.querySelector(".option-key").textContent.trim() === q.answer) {
          b.classList.add("correct");
        }
      });

      feedbackBox.className = "quiz-explanation wrong";
      feedbackBox.innerHTML = `<strong>❌ KURANG TEPAT (Kunci: ${q.answer}):</strong><br>${q.explanation}`;
      feedbackBox.style.display = "block";
    }

    // Update floating badge 3D agar terlihat jelas statusnya dari kejauhan
    this.updatePosko3DBadge(posko);
    this.updateAvatarTag(this.playerMesh, this.playerData.name, this.score, true);

    const lastAnswer = {
      poskoId: posko.id,
      category: q.category || "Materi Asesmen",
      userAnswer: selectedKey,
      correctAnswer: q.answer,
      isCorrect: isCorrect,
      scoreGained: isCorrect ? 20 : 0
    };

    nextBtn.style.display = "inline-block";
    nextBtn.textContent = "Selesai & Lanjut Eksplorasi Peta ➔";
    nextBtn.onclick = () => {
      if (window.ttsManager) window.ttsManager.stop();
      document.getElementById("posko-quiz-modal").classList.remove("active");
    };

    this.updateHUD();
    this.syncScoreToGAS(lastAnswer);
    this.broadcastMyPosition();

    if (this.solvedPosko.length >= this.poskoList.length) {
      setTimeout(() => {
        document.getElementById("posko-quiz-modal").classList.remove("active");
        this.triggerGameFinish(`Luar Biasa! Seluruh ${this.poskoList.length} Posko Telah Berhasil Anda Kerjakan!`);
      }, 2500);
    }
  }

  /**
   * Update Floating Billboard Nomor Posko (Centang Hijau jika Benar, Silang Merah jika Salah)
   */
  updatePosko3DBadge(posko) {
    if (!posko || !posko.sprite) return;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = posko.isCorrect ? "#065f46" : "#7f1d1d";
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = posko.isCorrect ? "#10b981" : "#ef4444";
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(posko.isCorrect ? `✓ ${posko.id}` : `✗ ${posko.id}`, 64, 64);

    posko.sprite.material.map = new THREE.CanvasTexture(canvas);
    posko.sprite.material.needsUpdate = true;
  }

  /**
   * HUD & Minimap Radar
   */
  updateHUD() {
    const total = this.poskoList.length || 30;
    const answeredCount = Object.keys(this.answeredMap).length;
    const remaining = total - answeredCount;

    // Tampilkan Skor Saya
    const scoreEl = document.getElementById("hud-score");
    if (scoreEl) scoreEl.textContent = `${this.score} Poin`;

    // Tampilkan Jumlah Soal yang Sudah Dijawab
    const statsEl = document.getElementById("hud-soal-stats");
    if (statsEl) statsEl.textContent = `${answeredCount} / ${total} Terjawab`;

    const remEl = document.getElementById("hud-soal-remaining");
    if (remEl) remEl.textContent = `(Sisa: ${remaining})`;

    // Akurasi Soal
    const totalDone = this.correctCount + this.wrongCount;
    const acc = totalDone > 0 ? Math.round((this.correctCount / totalDone) * 100) : 100;
    const accEl = document.getElementById("hud-soal-accuracy");
    if (accEl) accEl.textContent = `Akurasi: ${acc}% (${this.correctCount}B / ${this.wrongCount}S)`;

    const tag = document.getElementById("hud-current-tile");
    if (tag) {
      tag.textContent = `Posisi: X: ${Math.round(this.playerPos.x)}, Z: ${Math.round(this.playerPos.z)} | ${answeredCount}/${total} Terjawab (${this.correctCount} Benar, ${this.wrongCount} Salah)`;
    }

    this.updateMinimap();
    this.updateMapModalStats();
  }

  setupMinimap() {
    this.minimapCanvas = document.getElementById("minimap-canvas");
    if (this.minimapCanvas) this.minimapCtx = this.minimapCanvas.getContext("2d");
  }

  /**
   * SISTEM PETA ARENA & DIREKTORI 30 POSKO (SCROLLABLE & STATUS LENGKAP)
   */
  setupFullMapModal() {
    this.mapZoom = 1.0;
    this.mapPan = { x: 0, y: 0 };

    const btnOpen = document.getElementById("btn-open-map");
    const minimapPanel = document.getElementById("minimap-panel");
    const btnClose = document.getElementById("btn-close-map-modal");

    if (btnOpen) btnOpen.addEventListener("click", () => this.openFullMapModal());
    if (minimapPanel) minimapPanel.addEventListener("click", () => this.openFullMapModal());
    if (btnClose) btnClose.addEventListener("click", () => this.closeFullMapModal());

    const btnCancelGps = document.getElementById("btn-cancel-gps");
    if (btnCancelGps) btnCancelGps.addEventListener("click", () => this.cancelGPSGuide());

    // Tombol Zoom In / Out / Reset Langsung di Peta 2D
    const btnMapZoomIn = document.getElementById("btn-map-zoom-in");
    const btnMapZoomOut = document.getElementById("btn-map-zoom-out");
    const btnMapReset = document.getElementById("btn-map-reset");

    if (btnMapZoomIn) {
      btnMapZoomIn.addEventListener("click", () => {
        this.mapZoom = Math.min(2.8, (this.mapZoom || 1.0) + 0.35);
        this.renderLargeMap();
      });
    }
    if (btnMapZoomOut) {
      btnMapZoomOut.addEventListener("click", () => {
        this.mapZoom = Math.max(0.6, (this.mapZoom || 1.0) - 0.35);
        this.renderLargeMap();
      });
    }
    if (btnMapReset) {
      btnMapReset.addEventListener("click", () => {
        this.mapZoom = 1.0;
        this.mapPan = { x: -this.playerPos.x * 5.2, y: -this.playerPos.z * 5.2 };
        this.renderLargeMap();
      });
    }

    // Touch / Mouse Dragging Pan pada Canvas Peta
    const canvas = document.getElementById("large-map-canvas");
    if (canvas) {
      let isDragging = false;
      let startX = 0, startY = 0;
      let initialPan = { x: 0, y: 0 };

      const onStart = (cx, cy) => {
        isDragging = true;
        startX = cx;
        startY = cy;
        initialPan = { ...(this.mapPan || { x: 0, y: 0 }) };
      };
      const onMove = (cx, cy) => {
        if (!isDragging) return;
        this.mapPan = {
          x: initialPan.x + (cx - startX),
          y: initialPan.y + (cy - startY)
        };
        this.renderLargeMap();
      };
      const onEnd = () => { isDragging = false; };

      canvas.addEventListener("mousedown", e => onStart(e.clientX, e.clientY));
      window.addEventListener("mousemove", e => { if (isDragging) onMove(e.clientX, e.clientY); });
      window.addEventListener("mouseup", onEnd);

      canvas.addEventListener("touchstart", e => {
        if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      window.addEventListener("touchmove", e => {
        if (isDragging && e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
      window.addEventListener("touchend", onEnd);

      // Ketuk titik posko pada peta untuk mengaktifkan kompas/panduan GPS
      canvas.addEventListener("click", e => {
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

        const zoom = this.mapZoom || 1.0;
        const panX = this.mapPan ? this.mapPan.x : 0;
        const panY = this.mapPan ? this.mapPan.y : 0;
        const cx = canvas.width / 2 + panX;
        const cy = canvas.height / 2 - 10 + panY;
        const scale = 5.2 * zoom;

        for (const p of this.poskoList) {
          const px = cx + p.x * scale;
          const py = cy + p.z * scale;
          if (Math.hypot(clickX - px, clickY - py) < 18) {
            this.startGPSGuide(p.id);
            break;
          }
        }
      });
    }

    // Filter Buttons
    document.querySelectorAll(".map-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".map-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeMapFilter = btn.dataset.filter || "all";
        this.renderPoskoDirectory(this.activeMapFilter);
      });
    });

    // Zoom Kamera 3D dengan Mouse Wheel (Scroll)
    window.addEventListener("wheel", e => {
      this.cameraZoomDistance = Math.max(6, Math.min(45, (this.cameraZoomDistance || 14) + e.deltaY * 0.02));
    }, { passive: true });
  }

  openFullMapModal() {
    const modal = document.getElementById("full-map-modal");
    if (!modal) return;
    this.updateMapModalStats();
    this.renderLargeMap();
    this.renderPoskoDirectory(this.activeMapFilter || "all");
    modal.classList.add("active");
  }

  closeFullMapModal() {
    const modal = document.getElementById("full-map-modal");
    if (modal) modal.classList.remove("active");
  }

  updateMapModalStats() {
    const total = this.poskoList.length || 30;
    const answeredCount = Object.keys(this.answeredMap).length;
    const remaining = total - answeredCount;
    const correct = this.correctCount;
    const wrong = this.wrongCount;

    const statsText = document.getElementById("map-modal-stats-text");
    if (statsText) {
      statsText.innerHTML = `📊 <b>${answeredCount} / ${total} Posko Terjawab</b> (${correct} Benar, ${wrong} Salah, ${remaining} Sisa)`;
    }

    const unEl = document.getElementById("count-unanswered");
    const corEl = document.getElementById("count-correct");
    const wrEl = document.getElementById("count-wrong");
    if (unEl) unEl.textContent = remaining;
    if (corEl) corEl.textContent = correct;
    if (wrEl) wrEl.textContent = wrong;

    const playersEl = document.getElementById("map-modal-active-players");
    if (playersEl) {
      playersEl.textContent = `👥 ${this.otherPlayers.size + 1} Pemain di Kelas`;
    }
  }

  renderLargeMap() {
    const canvas = document.getElementById("large-map-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const zoom = this.mapZoom || 1.0;
    const panX = this.mapPan ? this.mapPan.x : 0;
    const panY = this.mapPan ? this.mapPan.y : 0;
    const cx = w / 2 + panX;
    const cy = h / 2 - 10 + panY;
    const scale = 5.2 * zoom;

    // 1. Rumput dan Denah Dasar
    ctx.fillStyle = "#e8f5e9";
    ctx.fillRect(0, 0, w, h);

    // Danau Limboto di Selatan
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 28 * scale, 120, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#0369a1";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🌊 Danau Limboto", cx, cy + 28 * scale + 4);

    // Gedung BPMP Gorontalo di Tengah/Utara
    const bpmpW = 160;
    const bpmpH = 65;
    ctx.fillStyle = "#5d4037";
    ctx.roundRect(cx - bpmpW / 2, cy - 22 * scale - bpmpH / 2, bpmpW, bpmpH, 8);
    ctx.fill();
    ctx.strokeStyle = "#ffd54f";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🏛️ GEDUNG BPMP GORONTALO", cx, cy - 22 * scale - 4);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#ffecb3";
    ctx.fillText("Plaza Utama", cx, cy - 22 * scale + 14);

    // Kebun Jagung Barat & Timur
    ctx.fillStyle = "#a7f3d0";
    ctx.fillRect(cx - 30 * scale, cy - 10 * scale, 55, 100);
    ctx.fillRect(cx + 18 * scale, cy - 10 * scale, 55, 100);
    ctx.fillStyle = "#065f46";
    ctx.font = "10px sans-serif";
    ctx.fillText("🌽 Kebun Jagung", cx - 24 * scale, cy + 8 * scale);
    ctx.fillText("🌽 Kebun Jagung", cx + 24 * scale, cy + 8 * scale);

    // 2. Gambar ke-30 Posko
    this.poskoList.forEach(p => {
      const px = cx + p.x * scale;
      const py = cy + p.z * scale;
      const r = 12;

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);

      if (p.isAnswered) {
        ctx.fillStyle = p.isCorrect ? "#10b981" : "#ef4444";
      } else {
        ctx.fillStyle = "#f59e0b";
      }
      ctx.fill();

      // Border highlight jika posko ini sedang dipandu GPS
      if (this.guidedPoskoId === p.id) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${p.id}`, px, py);
    });

    // 3. Gambar Siswa Lain di Arena
    this.otherPlayers.forEach(op => {
      const px = cx + op.mesh.position.x * scale;
      const py = cy + op.mesh.position.z * scale;

      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#ec4899";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(op.name.split(" ")[0], px, py - 11);
    });

    // 4. Gambar Posisi Saya
    const mx = cx + this.playerPos.x * scale;
    const my = cy + this.playerPos.z * scale;

    ctx.beginPath();
    ctx.arc(mx, my, 12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(2, 132, 199, 0.25)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(mx, my, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#0284c7";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📍 SAYA", mx, my - 13);
  }

  renderPoskoDirectory(filter = "all") {
    const listContainer = document.getElementById("posko-directory-list");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    let filtered = this.poskoList;
    if (filter === "unanswered") {
      filtered = this.poskoList.filter(p => !p.isAnswered);
    } else if (filter === "correct") {
      filtered = this.poskoList.filter(p => p.isAnswered && p.isCorrect);
    } else if (filter === "wrong") {
      filtered = this.poskoList.filter(p => p.isAnswered && !p.isCorrect);
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: #795548; font-size: 13px;">Tidak ada posko pada kategori filter ini.</div>`;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement("div");
      let statusClass = "status-unanswered";
      let badgeHtml = `<span class="posko-card-badge badge-unanswered">⏳ BELUM DIJAWAB</span>`;

      if (p.isAnswered) {
        if (p.isCorrect) {
          statusClass = "status-correct";
          badgeHtml = `<span class="posko-card-badge badge-correct">✅ BENAR (+20 Poin) · Jawaban: ${p.userAnswer}</span>`;
        } else {
          statusClass = "status-wrong";
          badgeHtml = `<span class="posko-card-badge badge-wrong">❌ SALAH (0 Poin) · Jawaban: ${p.userAnswer} (Kunci: ${p.question.answer})</span>`;
        }
      }

      card.className = `posko-dir-card ${statusClass}`;

      const dist = Math.hypot(p.x - this.playerPos.x, p.z - this.playerPos.z);
      const isGuided = (this.guidedPoskoId === p.id);

      card.innerHTML = `
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <strong style="color: #3e2723; font-size: 14px;">Posko #${p.id}</strong>
            ${badgeHtml}
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #5d4037; margin-bottom: 2px;">
            ${p.question.category || "Arduino Uno & Wokwi"}
          </div>
          <div style="font-size: 11px; color: #78716c; line-height: 1.3;">
            ${p.question.question ? p.question.question.substring(0, 95) + '...' : '-'}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #0284c7;">~${Math.round(dist)} meter</span>
          <button class="btn-guide-posko" style="${isGuided ? 'background: #059669;' : ''}">
            ${isGuided ? '📍 Sedang Dipandu' : '🧭 Tunjukkan Arah'}
          </button>
        </div>
      `;

      const guideBtn = card.querySelector(".btn-guide-posko");
      guideBtn.addEventListener("click", () => {
        this.startGPSGuide(p.id);
      });

      listContainer.appendChild(card);
    });
  }

  startGPSGuide(poskoId) {
    const posko = this.poskoList.find(p => p.id === poskoId);
    if (!posko) return;

    this.guidedPoskoId = poskoId;
    this.closeFullMapModal();

    // Buat suar cahaya vertikal di langit 3D pada posisi posko
    if (!this.guidedBeaconMesh) {
      const geo = new THREE.CylinderGeometry(0.6, 0.6, 50, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      this.guidedBeaconMesh = new THREE.Mesh(geo, mat);
      this.scene.add(this.guidedBeaconMesh);
    }
    this.guidedBeaconMesh.position.set(posko.x, 25, posko.z);
    this.guidedBeaconMesh.visible = true;

    const bar = document.getElementById("gps-guide-bar");
    if (bar) bar.style.display = "flex";

    this.showToast(`🧭 Kompas memandu Anda langsung menuju Posko #${poskoId}!`);
  }

  cancelGPSGuide() {
    this.guidedPoskoId = null;
    if (this.guidedBeaconMesh) this.guidedBeaconMesh.visible = false;
    const bar = document.getElementById("gps-guide-bar");
    if (bar) bar.style.display = "none";
  }

  updateGPSGuide() {
    const posko = this.poskoList.find(p => p.id === this.guidedPoskoId);
    if (!posko) return;

    const dx = posko.x - this.playerPos.x;
    const dz = posko.z - this.playerPos.z;
    const dist = Math.hypot(dx, dz);

    const angle = Math.atan2(dx, dz);
    const arrows = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
    let idx = Math.round((angle / (Math.PI * 2)) * 8) % 8;
    if (idx < 0) idx += 8;
    const arrow = arrows[idx] || "⬆️";

    const targetEl = document.getElementById("gps-target-text");
    const distEl = document.getElementById("gps-distance-text");
    if (targetEl) targetEl.textContent = `🧭 Menuju Posko #${posko.id}`;
    if (distEl) distEl.textContent = `${Math.round(dist)}m ${arrow}`;

    if (dist < 4.0) {
      this.showToast(`🎉 Anda telah sampai di Posko #${posko.id}!`);
      this.cancelGPSGuide();
    }
  }

  updateMinimap() {
    if (!this.minimapCanvas || !this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.8;

    // Draw 30 Posko Dots
    this.poskoList.forEach(p => {
      const px = cx + p.x * scale;
      const py = cy + p.z * scale;
      if (p.isAnswered) {
        ctx.fillStyle = p.isCorrect ? "#10b981" : "#ef4444";
      } else {
        ctx.fillStyle = "#f59e0b";
      }
      ctx.beginPath();
      ctx.arc(px, py, 2.8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Other Players (Dots Pink)
    this.otherPlayers.forEach(op => {
      const px = cx + op.mesh.position.x * scale;
      const py = cy + op.mesh.position.z * scale;
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw My Player (Dot Hijau Terang)
    const mx = cx + this.playerPos.x * scale;
    const my = cy + this.playerPos.z * scale;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Timer 60 Menit
   */
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isGameOver) return;
      this.remainingSeconds--;
      this.elapsedSeconds++;

      const min = Math.floor(this.remainingSeconds / 60);
      const sec = this.remainingSeconds % 60;
      document.getElementById("hud-timer").textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

      const bar = document.getElementById("timer-progress-bar");
      if (bar) bar.style.width = `${(this.remainingSeconds / this.totalTimeSeconds) * 100}%`;

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.triggerGameFinish("Waktu Permainan 60 Menit Telah Habis!");
      }
    }, 1000);
  }

  getFormattedElapsedTime() {
    const m = Math.floor(this.elapsedSeconds / 60);
    const s = this.elapsedSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  getFormattedRemainingTime() {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async syncScoreToGAS(lastAnswer = null) {
    const answeredCount = Object.keys(this.answeredMap).length;
    const payload = {
      roomId: this.playerData.roomId || "SMA-SNT-XA",
      name: this.playerData.name,
      nim: this.playerData.nim,
      institution: this.playerData.institution,
      totalScore: this.score,
      correctAnswers: this.correctCount,
      wrongAnswers: this.wrongCount,
      currentTile: answeredCount,
      timeElapsed: this.getFormattedElapsedTime(),
      timeRemaining: this.getFormattedRemainingTime(),
      isFinished: this.isGameOver,
      lastAnswer: lastAnswer
    };

    const res = await window.gasService.updateProgress(payload);
    if (res && res.synced) {
      const badge = document.getElementById("sync-status-badge");
      if (badge) badge.textContent = "Google Sheets Aktif ✅";
    }
  }

  triggerGameFinish(reasonMessage) {
    this.isGameOver = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    window.soundSystem.playFanfare();
    this.syncScoreToGAS();

    // Broadcast ke broker MQTT & BroadcastChannel bahwa pemain ini telah selesai
    // Karakter akan langsung hilang / despawn dari arena pemain lain
    const finishPayload = {
      type: "PLAYER_FINISH",
      id: window.gasService.playerId,
      isFinished: true,
      name: this.playerData.name,
      score: this.score,
      correctAnswers: this.correctCount
    };

    if (this.mqttClient && this.mqttClient.connected) {
      const topic = `snt/bpmp/arena/${this.playerData.roomId || "SMA-SNT-XA"}`;
      this.mqttClient.publish(topic, JSON.stringify(finishPayload));
    }
    if (window.gasService && window.gasService.channel) {
      window.gasService.channel.postMessage(finishPayload);
    }

    const totalInList = this.poskoList.length || 30;
    document.getElementById("finish-reason").textContent = reasonMessage;
    document.getElementById("finish-player-name").textContent = this.playerData.name;
    document.getElementById("finish-score").textContent = `${this.score} Poin`;
    document.getElementById("finish-correct").textContent = `${this.correctCount} / ${totalInList}`;
    document.getElementById("finish-wrong").textContent = `${this.wrongCount}`;
    document.getElementById("finish-time").textContent = this.getFormattedElapsedTime();
    document.getElementById("finish-tab-switches").textContent = `${window.gasService.tabSwitchCount || 0} Kali`;

    const statusEl = document.getElementById("finish-sync-status");
    if (statusEl) {
      statusEl.innerHTML = `✅ <b>Status Nilai:</b> Berhasil menyelesaikan ${totalInList} posko dengan <b>${this.correctCount} Benar</b> (Skor: ${this.score}). Data tersimpan di Google Sheets Guru.`;
    }

    const btnResync = document.getElementById("btn-resync-final");
    if (btnResync) {
      btnResync.onclick = async () => {
        btnResync.textContent = "⏳ Menyinkronkan...";
        btnResync.disabled = true;
        await this.syncScoreToGAS();
        btnResync.textContent = "✅ Berhasil Disinkron!";
        if (statusEl) {
          statusEl.innerHTML = `✅ <b>Data Sinkron:</b> ${this.correctCount} Soal Benar, Skor ${this.score} tersimpan di Google Sheets Guru.`;
        }
        setTimeout(() => {
          btnResync.disabled = false;
          btnResync.textContent = "🔄 Sinkron Ulang ke Excel Guru";
        }, 2000);
      };
    }

    const btnExit = document.getElementById("btn-exit-game");
    if (btnExit) {
      btnExit.onclick = () => {
        if (confirm("Apakah Anda ingin menutup sesi game dan keluar?")) {
          window.location.href = "about:blank";
          window.close();
        }
      };
    }

    document.getElementById("finish-modal").classList.add("active");
  }

  showToast(msg) {
    const toast = document.getElementById("retro-toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }

  setupEventListeners() {
    // Proximity button action click
    const btnEnter = document.getElementById("btn-enter-posko");
    if (btnEnter) {
      btnEnter.addEventListener("click", () => {
        if (this.activeNearbyPosko) {
          this.openPoskoQuiz(this.activeNearbyPosko);
        }
      });
    }

    // Camera Mode Switchers
    document.getElementById("btn-cam-follow").addEventListener("click", () => { this.camMode = "follow"; });
    document.getElementById("btn-cam-iso").addEventListener("click", () => {
      this.camMode = "isometric";
      this.camera.position.set(this.playerPos.x + 20, 24, this.playerPos.z + 20);
      this.camera.lookAt(this.playerPos.x, 1, this.playerPos.z);
    });
    document.getElementById("btn-cam-top").addEventListener("click", () => {
      this.camMode = "top";
      this.camera.position.set(this.playerPos.x, 50, this.playerPos.z + 1);
      this.camera.lookAt(this.playerPos.x, 0, this.playerPos.z);
    });

    document.getElementById("btn-audio-toggle").addEventListener("click", () => {
      const isMuted = window.soundSystem.toggleMute();
      document.getElementById("btn-audio-toggle").textContent = isMuted ? "🔇 Audio" : "🎵 Audio";
    });

    // Listen to real peer position messages from BroadcastChannel
    if (window.gasService && window.gasService.channel) {
      window.gasService.channel.onmessage = e => {
        const msg = e.data;
        if (!msg) return;

        if (msg.type === "PLAYER_FINISH" || msg.isFinished) {
          this.removeRealPlayer(msg.id || msg.playerId);
          return;
        }

        if (msg.type === "PLAYER_JOINED" && msg.player && msg.player.playerId !== window.gasService.playerId) {
          const p = msg.player;
          this.addOrUpdateRealPlayer(p.playerId, p.name, p.avatar || "student_boy", p.x || -4, p.z || 6);
        }

        if (msg.type === "PLAYER_MOVE" && msg.id !== window.gasService.playerId) {
          let peer = this.otherPlayers.get(msg.id);
          if (!peer) {
            peer = this.addOrUpdateRealPlayer(msg.id, msg.name, msg.avatar || "student_boy", msg.x, msg.z, msg.score || 0);
          } else {
            peer.targetPos.set(msg.x, 0, msg.z);
            if (msg.score !== undefined && msg.score !== peer.score) {
              peer.score = msg.score;
              this.updateAvatarTag(peer.mesh, msg.name, msg.score, false);
            }
          }
        }
      };
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    // Update Player & World Movement
    this.updateMovement(delta);

    // Rotate Windmills
    this.windmills.forEach(w => { w.rotation.z += delta * 1.5; });

    // Rotate Posko Rings
    this.poskoList.forEach(p => {
      p.ring.rotation.z += delta * 0.8;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.BPMPFarmGame = BPMPFarmGame;
