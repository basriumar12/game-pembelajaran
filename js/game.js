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

    // 30 Posko Soal
    this.poskoList = [];
    this.solvedPosko = []; // IDs of answered posko
    this.activeNearbyPosko = null;

    // Multiplayer Peers (Siswa lain di room)
    this.otherPlayers = new Map();

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
    this.build30PoskoSoal();
    this.spawnMyPlayer();
    this.setupRealMultiplayer();
    this.setupKeyboardControls();
    this.setupVirtualJoystick();
    this.setupMinimap();
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
   * 30 POSKO SOAL TERSEBAR DI SELURUH KAWASAN BPMP GORONTALO
   * Siswa berlari berebutan mendatangi posko 1 sampai 30!
   */
  build30PoskoSoal() {
    this.poskoList = [];

    // Distribusi posisi 30 posko yang menarik dan mudah dijelajahi
    const positions = [
      // Zona Depan BPMP Plaza (Posko 1 - 6)
      { x: -6, z: 2 }, { x: 6, z: 2 }, { x: -12, z: 6 }, { x: 12, z: 6 }, { x: -5, z: 12 }, { x: 5, z: 12 },
      // Zona Kebun Jagung Barat (Posko 7 - 12)
      { x: -18, z: -2 }, { x: -24, z: -6 }, { x: -28, z: 4 }, { x: -22, z: 10 }, { x: -18, z: 16 }, { x: -26, z: 18 },
      // Zona Danau Limboto Selatan (Posko 13 - 18)
      { x: -10, z: 24 }, { x: -4, z: 32 }, { x: 4, z: 32 }, { x: 10, z: 24 }, { x: 0, z: 36 }, { x: 0, z: 20 },
      // Zona Kebun & Kincir Timur (Posko 19 - 24)
      { x: 18, z: -2 }, { x: 24, z: -6 }, { x: 28, z: 4 }, { x: 22, z: 10 }, { x: 18, z: 16 }, { x: 26, z: 18 },
      // Zona Pelataran Belakang & Samping BPMP (Posko 25 - 30)
      { x: -16, z: -16 }, { x: 16, z: -16 }, { x: -22, z: -22 }, { x: 22, z: -22 }, { x: -8, z: -30 }, { x: 8, z: -30 }
    ];

    for (let i = 0; i < 30; i++) {
      const q = this.questions[i] || { id: i + 1, category: "Arduino & Wokwi", question: `Soal nomor ${i + 1}` };
      const pos = positions[i] || { x: (i % 5) * 8 - 16, z: Math.floor(i / 5) * 8 - 10 };

      const poskoGroup = new THREE.Group();
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

      // 3. Floating Number Billboard (#1 s/d #30)
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
        mesh: poskoGroup,
        ring: ring,
        roof: roof,
        sprite: numSprite
      });
    }
  }

  /**
   * Karakter Saya (Pemain Utama)
   */
  spawnMyPlayer() {
    this.playerMesh = this.createChibiAvatar(0x1976d2, "student_boy", true);
    this.playerMesh.position.copy(this.playerPos);
    this.scene.add(this.playerMesh);
  }

  /**
   * Multiplayer: Hanya Siswa Asli yang Masuk dan Mencatatkan Nama
   * (Tanpa Bot / Dummy Player Sama Sekali)
   */
  setupRealMultiplayer() {
    this.otherPlayers.clear();
    // Ambil daftar siswa yang benar-benar sudah registrasi
    const localRoster = window.gasService.getLocalPlayers();
    localRoster.forEach(p => {
      if (p.playerId !== window.gasService.playerId && p.roomId === this.playerData.roomId) {
        this.addOrUpdateRealPlayer(p.playerId, p.name, p.avatar || "student_boy", p.x || -4, p.z || 6);
      }
    });

    // Sinkronisasi berkala untuk siswa baru yang baru registrasi
    setInterval(() => {
      if (!window.gasService) return;
      const roster = window.gasService.getLocalPlayers();
      roster.forEach(p => {
        if (p.playerId !== window.gasService.playerId && p.roomId === this.playerData.roomId) {
          if (!this.otherPlayers.has(p.playerId)) {
            this.addOrUpdateRealPlayer(p.playerId, p.name, p.avatar || "student_boy", p.x || -4, p.z || 6);
          }
        }
      });
    }, 3000);
  }

  addOrUpdateRealPlayer(id, name, avatarType, x, z) {
    let peer = this.otherPlayers.get(id);
    if (!peer) {
      const color = (avatarType === "student_girl") ? 0xe91e63 : 0x0284c7;
      const mesh = this.createChibiAvatar(color, avatarType, false, name);
      mesh.position.set(x, 0, z);
      this.scene.add(mesh);
      peer = { name: name, mesh: mesh, targetPos: new THREE.Vector3(x, 0, z), speed: 0.18 };
      this.otherPlayers.set(id, peer);
      this.updateMinimap();
    } else {
      peer.targetPos.set(x, 0, z);
    }
    return peer;
  }

  createChibiAvatar(colorHex, type = "student_boy", isMain = false, labelText = "") {
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

    // Floating Name Tag (Roblox Style)
    const name = isMain ? "Saya (Pemain)" : labelText;
    const tagCanvas = document.createElement("canvas");
    tagCanvas.width = 256;
    tagCanvas.height = 64;
    const tCtx = tagCanvas.getContext("2d");
    tCtx.fillStyle = isMain ? "rgba(245, 158, 11, 0.9)" : "rgba(15, 23, 42, 0.8)";
    tCtx.roundRect(10, 10, 236, 44, 12);
    tCtx.fill();
    tCtx.fillStyle = "#ffffff";
    tCtx.font = "bold 24px sans-serif";
    tCtx.textAlign = "center";
    tCtx.textBaseline = "middle";
    tCtx.fillText(name, 128, 32);

    const tagSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(tagCanvas) }));
    tagSprite.position.set(0, 2.7, 0);
    tagSprite.scale.set(2.4, 0.6, 1);
    avatar.add(tagSprite);

    avatar.scale.set(1.2, 1.2, 1.2);
    return avatar;
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

    // Kamera mengikuti karakter dari belakang
    if (this.camMode === "follow") {
      const targetCam = new THREE.Vector3(
        this.playerPos.x,
        this.playerPos.y + 9,
        this.playerPos.z + 13
      );
      this.camera.position.lerp(targetCam, 0.08);
      this.camera.lookAt(this.playerPos.x, this.playerPos.y + 1.5, this.playerPos.z);
    }

    // Periksa Kedekatan dengan 30 Posko
    this.checkNearbyPosko();

    // Pergerakan Bot Siswa Lain (Mensimulasikan Siswa Lain Berlari ke Posko)
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
        const status = closestPosko.isSolved ? "✅ SUDAH TERJAWAB (Buka Lagi)" : "🚪 Buka Soal Posko";
        btnEnter.innerHTML = `<span>🏛️ Posko #${closestPosko.id}:</span> <span>${status}</span>`;
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
    if (window.gasService && window.gasService.channel) {
      window.gasService.channel.postMessage({
        type: "PLAYER_MOVE",
        id: window.gasService.playerId,
        name: this.playerData.name,
        avatar: this.playerData.avatar || "student_boy",
        x: this.playerPos.x,
        z: this.playerPos.z,
        rotY: this.playerMesh.rotation.y,
        score: this.score,
        solvedCount: this.solvedPosko.length
      });
    }
  }

  /**
   * Modal Interaktif Menjawab Soal di Posko yang Didekati
   */
  openPoskoQuiz(posko) {
    const q = posko.question;
    const modal = document.getElementById("posko-quiz-modal");
    if (!modal) return;

    window.soundSystem.playModalOpen();

    document.getElementById("modal-posko-badge").textContent = `Posko #${posko.id} dari 30`;
    document.getElementById("modal-posko-topic").textContent = q.category || "Arduino & Wokwi";
    document.getElementById("modal-posko-question").textContent = q.question;

    const optContainer = document.getElementById("modal-posko-options");
    const feedbackBox = document.getElementById("modal-posko-feedback");
    const nextBtn = document.getElementById("btn-modal-close");

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
    const q = posko.question;
    const isCorrect = (selectedKey === q.answer);
    const allBtns = document.querySelectorAll("#modal-posko-options .retro-option-btn");
    allBtns.forEach(b => b.disabled = true);

    const feedbackBox = document.getElementById("modal-posko-feedback");
    const nextBtn = document.getElementById("btn-modal-close");

    if (isCorrect) {
      clickedBtn.classList.add("correct");
      window.soundSystem.playCorrect();

      if (!posko.isSolved) {
        this.score += 20;
        this.correctCount++;
        posko.isSolved = true;
        this.solvedPosko.push(posko.id);

        // Ubah tampilan Posko 3D menjadi Hijau Mengkilap
        posko.roof.material.color.setHex(0x10b981);
        posko.ring.material.color.setHex(0x10b981);
      }

      feedbackBox.className = "quiz-explanation correct";
      feedbackBox.innerHTML = `<strong>🎉 JAWABAN BENAR! (+20 Poin):</strong><br>${q.explanation}`;
      feedbackBox.style.display = "block";
    } else {
      clickedBtn.classList.add("wrong");
      window.soundSystem.playWrong();
      this.wrongCount++;

      allBtns.forEach(b => {
        if (b.querySelector(".option-key").textContent.trim() === q.answer) {
          b.classList.add("correct");
        }
      });

      feedbackBox.className = "quiz-explanation wrong";
      feedbackBox.innerHTML = `<strong>❌ KURANG TEPAT (Kunci: ${q.answer}):</strong><br>${q.explanation}`;
      feedbackBox.style.display = "block";
    }

    nextBtn.style.display = "inline-block";
    nextBtn.textContent = "Selesai & Lanjut Eksplorasi Peta ➔";
    nextBtn.onclick = () => {
      document.getElementById("posko-quiz-modal").classList.remove("active");
    };

    this.updateHUD();
    this.syncScoreToGAS();

    if (this.solvedPosko.length >= 30) {
      setTimeout(() => {
        document.getElementById("posko-quiz-modal").classList.remove("active");
        this.triggerGameFinish("Luar Biasa! Seluruh 30 Posko Telah Berhasil Anda Taklukkan!");
      }, 2500);
    }
  }

  /**
   * HUD & Minimap Radar
   */
  updateHUD() {
    document.getElementById("hud-score").textContent = this.score;
    document.getElementById("hud-soal-stats").textContent = `${this.solvedPosko.length}/30 Posko`;

    const tag = document.getElementById("hud-current-tile");
    if (tag) {
      tag.textContent = `Posisi: X: ${Math.round(this.playerPos.x)}, Z: ${Math.round(this.playerPos.z)} | ${this.solvedPosko.length} Posko Selesai`;
    }

    this.updateMinimap();
  }

  setupMinimap() {
    this.minimapCanvas = document.getElementById("minimap-canvas");
    if (this.minimapCanvas) this.minimapCtx = this.minimapCanvas.getContext("2d");
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
      ctx.fillStyle = p.isSolved ? "#10b981" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
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

  async syncScoreToGAS() {
    const payload = {
      roomId: this.playerData.roomId || "SMA-SNT-XA",
      name: this.playerData.name,
      nim: this.playerData.nim,
      institution: this.playerData.institution,
      totalScore: this.score,
      correctAnswers: this.correctCount,
      wrongAnswers: this.wrongCount,
      currentTile: this.solvedPosko.length,
      timeElapsed: this.getFormattedElapsedTime(),
      timeRemaining: this.getFormattedRemainingTime(),
      isFinished: this.isGameOver
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

    document.getElementById("finish-reason").textContent = reasonMessage;
    document.getElementById("finish-player-name").textContent = this.playerData.name;
    document.getElementById("finish-score").textContent = `${this.score} Poin`;
    document.getElementById("finish-correct").textContent = `${this.correctCount} / 30`;
    document.getElementById("finish-wrong").textContent = `${this.wrongCount}`;
    document.getElementById("finish-time").textContent = this.getFormattedElapsedTime();
    document.getElementById("finish-tab-switches").textContent = `${window.gasService.tabSwitchCount || 0} Kali`;

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

        if (msg.type === "PLAYER_JOINED" && msg.player && msg.player.playerId !== window.gasService.playerId) {
          const p = msg.player;
          this.addOrUpdateRealPlayer(p.playerId, p.name, p.avatar || "student_boy", p.x || -4, p.z || 6);
        }

        if (msg.type === "PLAYER_MOVE" && msg.id !== window.gasService.playerId) {
          let peer = this.otherPlayers.get(msg.id);
          if (!peer) {
            peer = this.addOrUpdateRealPlayer(msg.id, msg.name, msg.avatar || "student_boy", msg.x, msg.z);
          } else {
            peer.targetPos.set(msg.x, 0, msg.z);
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
