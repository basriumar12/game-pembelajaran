/**
 * BPMP Farm Quest: Gorontalo Edition
 * Core 3D Board Game Engine (Three.js r128)
 */

class BPMPFarmGame {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // Game Entities
    this.tiles = [];
    this.players = [];
    this.currentPlayerIndex = 0;
    this.diceMesh = null;
    this.isRolling = false;
    this.isMoving = false;
    this.animals = [];
    this.windmills = [];
    this.floatingIcons = [];

    // Player State
    this.playerData = {
      name: "Sahabat BPMP",
      nim: "2026001",
      institution: "Universitas Negeri Gorontalo",
      avatar: "farmer_boy"
    };

    // Game Session Stats
    this.score = 0;
    this.energy = 100;
    this.maxEnergy = 100;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.totalQuestions = 30;
    this.answeredQuestions = [];
    this.currentTileIndex = 0;
    this.tilesVisited = 1;

    // Timer (60 minutes = 3600 seconds)
    this.totalTimeSeconds = 3600;
    this.remainingSeconds = 3600;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.isGameOver = false;

    // Camera Modes
    this.cameraMode = "isometric"; // 'isometric', 'top', 'follow'
    this.camTarget = new THREE.Vector3(0, 0, 0);

    // Questions bank
    this.questions = [];
    this.currentQuestion = null;

    // Multiplayer settings
    this.multiplayerMode = "bot"; // 'bot', 'pass_and_play'
    this.bots = [
      { name: "Siti Rahma", institution: "SMP N 1 Limboto", tileIndex: 0, score: 0, color: 0xff4081, mesh: null },
      { name: "Fajar Pakaya", institution: "SMA N 2 Gorontalo", tileIndex: 0, score: 0, color: 0x00e676, mesh: null },
      { name: "Nurul Hidayah", institution: "BPMP Gorontalo", tileIndex: 0, score: 0, color: 0xffb300, mesh: null }
    ];
  }

  async init() {
    this.setupScene();
    this.setupLights();
    this.buildBPMPGorontaloBuilding();
    this.buildEcoFarmEnvironment();
    this.buildBoardTiles();
    this.build3DDice();
    this.spawnPlayers();
    this.setupMinimap();
    this.setupEventListeners();

    // Load Questions
    this.questions = await window.gasService.fetchQuestions();

    // Start Rendering Loop
    this.animate();

    // Resize handling
    window.addEventListener("resize", () => this.onWindowResize());
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa5d6a7); // Soft lush sky / atmosphere
    this.scene.fog = new THREE.FogExp2(0xa5d6a7, 0.012);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
    this.setCameraIsometric();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
  }

  setCameraIsometric() {
    this.cameraMode = "isometric";
    this.camera.position.set(38, 42, 46);
    this.camera.lookAt(0, 3, 0);
    this.camTarget.set(0, 3, 0);
  }

  setCameraTop() {
    this.cameraMode = "top";
    this.camera.position.set(0, 75, 5);
    this.camera.lookAt(0, 0, 0);
    this.camTarget.set(0, 0, 0);
  }

  setCameraFollow() {
    this.cameraMode = "follow";
    if (this.players[0] && this.players[0].mesh) {
      const p = this.players[0].mesh.position;
      this.camera.position.set(p.x + 12, p.y + 14, p.z + 16);
      this.camera.lookAt(p.x, p.y + 2, p.z);
    }
  }

  setupLights() {
    // Ambient light - warm morning sun feel
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 0.75);
    this.scene.add(ambientLight);

    // Directional sunlight with soft shadows
    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.9);
    sunLight.position.set(45, 60, 35);
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
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Soft blue hemisphere bounce light (Sky + Ground)
    const hemiLight = new THREE.HemisphereLight(0x81d4fa, 0x4caf50, 0.35);
    this.scene.add(hemiLight);
  }

  /**
   * 1. Gedung BPMP Provinsi Gorontalo (Landmark Utama Berdasarkan Foto)
   */
  buildBPMPGorontaloBuilding() {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(0, 0, -18);

    // Ground platform plaza (Paving stone)
    const plazaGeo = new THREE.BoxGeometry(34, 0.6, 22);
    const plazaMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 }); // Sandstone paving
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.3, 0);
    plaza.receiveShadow = true;
    buildingGroup.add(plaza);

    // Main 2-Story Building Body (Warm White / Cream)
    const bodyGeo = new THREE.BoxGeometry(26, 9.5, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 5.2, -1);
    body.castShadow = true;
    body.receiveShadow = true;
    buildingGroup.add(body);

    // Upper fascia / Amber Yellow eave (Identik dengan foto)
    const roofEaveGeo = new THREE.BoxGeometry(27.5, 0.9, 13.5);
    const roofEaveMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b }); // Vibrant BPMP yellow
    const roofEave = new THREE.Mesh(roofEaveGeo, roofEaveMat);
    roofEave.position.set(0, 10.2, -1);
    roofEave.castShadow = true;
    buildingGroup.add(roofEave);

    // Center Entrance Portico / Canopy
    const canopyGeo = new THREE.BoxGeometry(11, 0.7, 5);
    const canopyMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f0 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 7.2, 5.2);
    canopy.castShadow = true;
    buildingGroup.add(canopy);

    // 4 Multi-Ring Ceremonial Columns (Green, Orange/Red, Yellow, Purple) - Sesuai Foto Nyata!
    const colColors = [0x2e7d32, 0xe65100, 0xfbc02d, 0x6a1b9a];
    const colSpacing = [-4.2, -1.4, 1.4, 4.2];

    colSpacing.forEach((xPos, idx) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(xPos, 0.6, 5.2);

      // Main core
      const coreGeo = new THREE.CylinderGeometry(0.35, 0.4, 6.6, 16);
      const coreMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 3.3;
      core.castShadow = true;
      colGroup.add(core);

      // Segmented Rings (Colored rings stacked)
      const ringColor = colColors[idx % colColors.length];
      const ringMat = new THREE.MeshLambertMaterial({ color: ringColor });

      for (let r = 0; r < 7; r++) {
        const ringGeo = new THREE.TorusGeometry(0.48, 0.12, 8, 16);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.9 + r * 0.85;
        ring.castShadow = true;
        colGroup.add(ring);
      }

      // Column Base
      const baseGeo = new THREE.BoxGeometry(1.2, 0.5, 1.2);
      const baseMat = new THREE.MeshLambertMaterial({ color: 0x424242 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.25;
      colGroup.add(base);

      buildingGroup.add(colGroup);
    });

    // Traditional Gorontalo Crown / Dome Roof Ornament (Rumah Adat Dulohupa Crown)
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0, 10.6, 1.5);

    // Stepped pyramid pedestal
    const pedGeo = new THREE.CylinderGeometry(3.5, 4.5, 1.2, 8);
    const pedMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
    const ped = new THREE.Mesh(pedGeo, pedMat);
    ped.position.y = 0.6;
    crownGroup.add(ped);

    // Black & Gold Gorontalo Crown Dome
    const domeGeo = new THREE.ConeGeometry(3.2, 4.2, 8);
    const domeMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 3.0;
    dome.castShadow = true;
    crownGroup.add(dome);

    // Gold pinnacle finial
    const tipGeo = new THREE.SphereGeometry(0.6, 12, 12);
    const tipMat = new THREE.MeshLambertMaterial({ color: 0xffd54f });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = 5.2;
    crownGroup.add(tip);

    buildingGroup.add(crownGroup);

    // Front Banners (Zona Integritas & LPMP/BPMP Billboard)
    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = 512;
    bannerCanvas.height = 256;
    const bCtx = bannerCanvas.getContext("2d");
    bCtx.fillStyle = "#b71c1c";
    bCtx.fillRect(0, 0, 512, 256);
    bCtx.fillStyle = "#ffffff";
    bCtx.font = "bold 26px sans-serif";
    bCtx.textAlign = "center";
    bCtx.fillText("ZONA INTEGRITAS", 256, 65);
    bCtx.font = "bold 32px sans-serif";
    bCtx.fillStyle = "#ffeb3b";
    bCtx.fillText("BPMP PROV. GORONTALO", 256, 115);
    bCtx.fillStyle = "#ffffff";
    bCtx.font = "20px sans-serif";
    bCtx.fillText("BEBAS PUNGUTAN & MELAYANI", 256, 165);
    bCtx.fillText("Merdeka Belajar · Ramah Lingkungan", 256, 205);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerGeo = new THREE.PlaneGeometry(7.2, 3.6);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(7.5, 5.5, 5.05);
    buildingGroup.add(banner);

    // Left Signboard: LPMP / BPMP Gorontalo Plang
    const plangGeo = new THREE.BoxGeometry(4.8, 1.8, 0.4);
    const plangMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    const plang = new THREE.Mesh(plangGeo, plangMat);
    plang.position.set(-8.5, 2.0, 6.5);
    buildingGroup.add(plang);

    // Flagpole with Indonesian Flag
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 10, 12);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0, 5.0, 9.5);
    buildingGroup.add(pole);

    // Flag (Merah Putih)
    const flagGeo = new THREE.PlaneGeometry(1.6, 1.0);
    const flagCanvas = document.createElement("canvas");
    flagCanvas.width = 64;
    flagCanvas.height = 40;
    const fCtx = flagCanvas.getContext("2d");
    fCtx.fillStyle = "#e53935"; // Red
    fCtx.fillRect(0, 0, 64, 20);
    fCtx.fillStyle = "#ffffff"; // White
    fCtx.fillRect(0, 20, 64, 20);
    const flagTex = new THREE.CanvasTexture(flagCanvas);
    const flagMat = new THREE.MeshLambertMaterial({ map: flagTex, side: THREE.DoubleSide });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.85, 9.2, 9.5);
    buildingGroup.add(flag);

    // Windows & Glass Doors
    const winMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a, emissive: 0x0f172a });
    const winCoords = [
      [-9, 6.8, 5.05], [-6, 6.8, 5.05], [6, 6.8, 5.05], [9, 6.8, 5.05],
      [-9, 2.8, 5.05], [-6, 2.8, 5.05], [0, 2.8, 5.05]
    ];
    winCoords.forEach(c => {
      const wGeo = new THREE.PlaneGeometry(2.0, 2.2);
      const win = new THREE.Mesh(wGeo, winMat);
      win.position.set(c[0], c[1], c[2]);
      buildingGroup.add(win);
    });

    this.scene.add(buildingGroup);
  }

  /**
   * 2. Eco-Farm Environment (Jagung Gorontalo, Ternak Sapi, Windmill, Pohon Kelapa)
   */
  buildEcoFarmEnvironment() {
    // Large Island / Farm Terrain
    const groundGeo = new THREE.CylinderGeometry(48, 50, 2.0, 36);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x7cb342 }); // Rich farm grass
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Earth under-layer
    const dirtGeo = new THREE.CylinderGeometry(50, 52, 4.0, 36);
    const dirtMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const dirt = new THREE.Mesh(dirtGeo, dirtMat);
    dirt.position.y = -3.8;
    this.scene.add(dirt);

    // Corn Fields (Kebun Jagung Manis Khas Gorontalo / Binthe)
    this.createCornField(-18, 0, 8, 4, 6);
    this.createCornField(16, 0, 8, 4, 6);

    // Coconut Trees (Pohon Kelapa Khas Pesisir Gorontalo)
    const treePositions = [
      [-26, 12], [-22, -8], [-28, -2], [24, -10], [28, 6], [22, 16],
      [-10, 24], [12, 24], [-24, 22], [26, -20]
    ];
    treePositions.forEach(p => this.createCoconutTree(p[0], 0, p[1]));

    // Eco-Farm Barn / Lumbung Jagung (Alang-Alang)
    this.createBarn(-18, 0, -6);

    // Eco-Friendly Wind Turbine (Kincir Angin Energi Terbarukan)
    this.createWindmill(22, 0, -4);

    // Water Pond / Irigasi Danau Limboto Mini
    this.createIrrigationPond(0, 0, 18);

    // Solar Panels
    this.createSolarPanelArray(18, 0, -14);

    // Farm Animals (Sapi & Kambing)
    this.createCow(-12, 0, 14);
    this.createCow(-15, 0, 12);
    this.createGoat(12, 0, 15);
  }

  createCornField(startX, y, startZ, rows, cols) {
    const fieldGroup = new THREE.Group();
    fieldGroup.position.set(startX, y, startZ);

    // Soil Bed
    const bedGeo = new THREE.BoxGeometry(rows * 2.2, 0.25, cols * 2.2);
    const bedMat = new THREE.MeshLambertMaterial({ color: 0x4e342e }); // Dark fertile soil
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set((rows * 2.2) / 2 - 1.1, 0.12, (cols * 2.2) / 2 - 1.1);
    bed.receiveShadow = true;
    fieldGroup.add(bed);

    // Corn Plants
    const stalkMat = new THREE.MeshLambertMaterial({ color: 0x689f38 });
    const cobMat = new THREE.MeshLambertMaterial({ color: 0xffd600 }); // Sweet yellow corn
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x8bc34a });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const plant = new THREE.Group();
        plant.position.set(r * 2.2, 0.25, c * 2.2);

        // Stalk
        const stalkGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.2 + Math.random() * 0.4, 6);
        const stalk = new THREE.Mesh(stalkGeo, stalkMat);
        stalk.position.y = 1.1;
        stalk.castShadow = true;
        plant.add(stalk);

        // Corn Cob
        const cobGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.9, 8);
        const cob = new THREE.Mesh(cobGeo, cobMat);
        cob.position.set(0.18, 1.2, 0);
        cob.rotation.z = 0.35;
        plant.add(cob);

        // Leaves
        for (let l = 0; l < 4; l++) {
          const leafGeo = new THREE.PlaneGeometry(0.8, 0.3);
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set(0, 0.8 + l * 0.35, 0);
          leaf.rotation.y = (l * Math.PI) / 2 + 0.3;
          leaf.rotation.z = 0.5;
          plant.add(leaf);
        }

        fieldGroup.add(plant);
      }
    }

    this.scene.add(fieldGroup);
  }

  createCoconutTree(x, y, z) {
    const tree = new THREE.Group();
    tree.position.set(x, y, z);

    // Trunk with slight natural curve
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.3, 3, 0.1),
      new THREE.Vector3(0.6, 6, 0.2),
      new THREE.Vector3(0.8, 8.5, 0.3)
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 12, 0.45, 8, false);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.castShadow = true;
    tree.add(trunk);

    // Coconuts
    const nutMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    for (let i = 0; i < 4; i++) {
      const nutGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const nut = new THREE.Mesh(nutGeo, nutMat);
      nut.position.set(0.8 + Math.cos(i) * 0.5, 8.2, 0.3 + Math.sin(i) * 0.5);
      tree.add(nut);
    }

    // Palm Fronds / Leaves
    const frondMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32, side: THREE.DoubleSide });
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(1.6, 5.0, 4);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0.8, 8.5, 0.3);
      frond.rotation.y = angle;
      frond.rotation.z = 1.2;
      frond.castShadow = true;
      tree.add(frond);
    }

    this.scene.add(tree);
  }

  createBarn(x, y, z) {
    const barn = new THREE.Group();
    barn.position.set(x, y, z);

    // Base body
    const baseGeo = new THREE.BoxGeometry(6, 4.5, 7);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xc62828 }); // Rustic Red Barn
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 2.25;
    base.castShadow = true;
    barn.add(base);

    // Roof (Gabled roof)
    const roofGeo = new THREE.ConeGeometry(5.2, 2.8, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.8;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1, 1.3);
    roof.castShadow = true;
    barn.add(roof);

    // Wooden door
    const doorGeo = new THREE.PlaneGeometry(2.2, 3.0);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.5, 3.51);
    barn.add(door);

    this.scene.add(barn);
  }

  createWindmill(x, y, z) {
    const mill = new THREE.Group();
    mill.position.set(x, y, z);

    // Tower
    const towerGeo = new THREE.CylinderGeometry(0.3, 0.7, 10, 12);
    const towerMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 5;
    tower.castShadow = true;
    mill.add(tower);

    // Nacelle / Hub
    const hubGeo = new THREE.SphereGeometry(0.6, 12, 12);
    const hubMat = new THREE.MeshLambertMaterial({ color: 0x0288d1 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.position.set(0, 10.2, 0.4);
    mill.add(hub);

    // Blades group (Rotates in animate)
    const blades = new THREE.Group();
    blades.position.set(0, 10.2, 0.8);

    const bladeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (let b = 0; b < 3; b++) {
      const bGeo = new THREE.BoxGeometry(0.35, 4.2, 0.08);
      const blade = new THREE.Mesh(bGeo, bladeMat);
      blade.position.y = 2.0;
      blade.rotation.z = (b * Math.PI * 2) / 3;
      blade.castShadow = true;

      const pivot = new THREE.Group();
      pivot.rotation.z = (b * Math.PI * 2) / 3;
      blade.position.set(0, 2.0, 0);
      pivot.add(blade);
      blades.add(pivot);
    }

    mill.add(blades);
    this.windmills.push(blades);
    this.scene.add(mill);
  }

  createIrrigationPond(x, y, z) {
    const pond = new THREE.Group();
    pond.position.set(x, y, z);

    // Water surface
    const waterGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.3, 24);
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x00bcd4,
      transparent: true,
      opacity: 0.85
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.15;
    pond.add(water);

    // Stone border ring
    const borderGeo = new THREE.TorusGeometry(4.6, 0.4, 8, 24);
    const borderMat = new THREE.MeshLambertMaterial({ color: 0x78909c });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = Math.PI / 2;
    border.position.y = 0.2;
    pond.add(border);

    // Lily pad
    const padMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    for (let p = 0; p < 4; p++) {
      const padGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 8);
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(Math.cos(p * 1.5) * 2.2, 0.3, Math.sin(p * 1.5) * 2.2);
      pond.add(pad);
    }

    this.scene.add(pond);
  }

  createSolarPanelArray(x, y, z) {
    const panelGroup = new THREE.Group();
    panelGroup.position.set(x, y, z);

    const pMat = new THREE.MeshLambertMaterial({ color: 0x0d47a1 });
    const standMat = new THREE.MeshLambertMaterial({ color: 0x90a4ae });

    for (let i = 0; i < 3; i++) {
      const panel = new THREE.Group();
      panel.position.set(i * 2.2, 0, 0);

      const plateGeo = new THREE.BoxGeometry(1.8, 0.1, 2.4);
      const plate = new THREE.Mesh(plateGeo, pMat);
      plate.position.y = 1.2;
      plate.rotation.x = 0.45;
      panel.add(plate);

      const standGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = 0.6;
      panel.add(stand);

      panelGroup.add(panel);
    }

    this.scene.add(panelGroup);
  }

  createCow(x, y, z) {
    const cow = new THREE.Group();
    cow.position.set(x, y, z);

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.4, 1.1, 2.2);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    cow.add(body);

    // Black spot
    const spotGeo = new THREE.BoxGeometry(0.8, 0.5, 0.8);
    const spotMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    const spot = new THREE.Mesh(spotGeo, spotMat);
    spot.position.set(0.35, 1.2, 0.2);
    cow.add(spot);

    // Head
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.9);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 1.5, 1.2);
    cow.add(head);

    // Pink Snout
    const snoutGeo = new THREE.BoxGeometry(0.6, 0.4, 0.4);
    const snoutMat = new THREE.MeshLambertMaterial({ color: 0xf8bbd0 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0, 1.3, 1.7);
    cow.add(snout);

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 6);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x212121 });
    [[-0.5, -0.7], [0.5, -0.7], [-0.5, 0.7], [0.5, 0.7]].forEach(p => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(p[0], 0.4, p[1]);
      cow.add(leg);
    });

    this.scene.add(cow);
    this.animals.push({ mesh: cow, baseRot: cow.rotation.y });
  }

  createGoat(x, y, z) {
    const goat = new THREE.Group();
    goat.position.set(x, y, z);
    goat.scale.set(0.75, 0.75, 0.75);

    const bodyGeo = new THREE.BoxGeometry(1.0, 0.9, 1.6);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 }); // Brown goat
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.0;
    goat.add(body);

    const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.7);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 1.4, 0.9);
    goat.add(head);

    this.scene.add(goat);
    this.animals.push({ mesh: goat, baseRot: goat.rotation.y });
  }

  /**
   * 3. Board Tiles (Papan Permainan 3D Interaktif)
   * 24 Petak mengelilingi kawasan perkebunan BPMP Gorontalo
   */
  buildBoardTiles() {
    // Elliptical path surrounding the BPMP Gorontalo grounds
    const totalTiles = 24;
    const radiusX = 23;
    const radiusZ = 18;

    const tileTypes = [
      { type: "START", name: "Gerbang BPMP", color: 0xffd54f, icon: "🏛️", desc: "Titik Kumpul BPMP Gorontalo" },
      { type: "QUIZ", name: "Edu BPMP", color: 0x42a5f5, icon: "📖", desc: "Soal Kuis Penjaminan Mutu" },
      { type: "HARVEST", name: "Panen Jagung", color: 0xfbc02d, icon: "🌽", desc: "+15 Poin Hasil Panen Gorontalo" },
      { type: "ENERGY", name: "Pupuk Kompos", color: 0x66bb6a, icon: "🌱", desc: "+25 Stamina Ramah Lingkungan" },
      { type: "QUIZ", name: "Merdeka Belajar", color: 0x42a5f5, icon: "✨", desc: "Soal Profil Pelajar Pancasila" },
      { type: "WATER", name: "Mata Air Limboto", color: 0x26c6da, icon: "💧", desc: "+Bonus Langkah Dadu" },
      { type: "PEST", name: "Serangan Hama", color: 0xab47bc, icon: "🐛", desc: "Tantangan Penyelamatan Tanaman" },
      { type: "QUIZ", name: "Rapor Pendidikan", color: 0x42a5f5, icon: "📊", desc: "Soal Perencanaan Berbasis Data" },
      { type: "HARVEST", name: "Binthe Manis", color: 0xfbc02d, icon: "🌽", desc: "+15 Poin Panen Jagung Bisi" },
      { type: "CULTURE", name: "Sulam Karawo", color: 0xff7043, icon: "🎨", desc: "Event Kearifan Lokal Gorontalo" },
      { type: "QUIZ", name: "Standar SPM", color: 0x42a5f5, icon: "📋", desc: "Soal Standar Pelayanan Minimal" },
      { type: "ENERGY", name: "Biogas Ternak", color: 0x66bb6a, icon: "⚡", desc: "+20 Stamina Energi Hijau" },
      { type: "START_HALF", name: "Plaza Merdeka", color: 0xffca28, icon: "🏆", desc: "Bonus Point Checkpoint" },
      { type: "QUIZ", name: "Literasi Numerasi", color: 0x42a5f5, icon: "🧠", desc: "Soal Asesmen Nasional" },
      { type: "HARVEST", name: "Lumbung Alang", color: 0xfbc02d, icon: "🌾", desc: "+20 Poin Ketahanan Pangan" },
      { type: "WATER", name: "Irigasi Tetes", color: 0x26c6da, icon: "💦", desc: "Pemulihan Stamina +15" },
      { type: "QUIZ", name: "Konservasi Tanah", color: 0x42a5f5, icon: "🏞️", desc: "Soal Pertanian Berkelanjutan" },
      { type: "ENERGY", name: "Agroforestri", color: 0x66bb6a, icon: "🌳", desc: "+20 Stamina Alam Bersih" },
      { type: "PEST", name: "Gulma Liar", color: 0xab47bc, icon: "🌿", desc: "Pembersihan Lahan Bersama" },
      { type: "QUIZ", name: "Kearifan Budaya", color: 0x42a5f5, icon: "📜", desc: "Soal Falsafah Luhur Gorontalo" },
      { type: "HARVEST", name: "Pesta Panen", color: 0xfbc02d, icon: "🎉", desc: "+25 Poin Raya BPMP" },
      { type: "CULTURE", name: "Musik Polopalo", color: 0xff7043, icon: "🎋", desc: "Event Seni Bambu Tradisional" },
      { type: "QUIZ", name: "Pelayanan Prima", color: 0x42a5f5, icon: "⭐", desc: "Soal Zona Integritas WBK" },
      { type: "WATER", name: "Tumbilotohe", color: 0xffb74d, icon: "🪔", desc: "Festival Cahaya Gorontalo" }
    ];

    for (let i = 0; i < totalTiles; i++) {
      const angle = (i / totalTiles) * Math.PI * 2;
      const x = Math.sin(angle) * radiusX;
      const z = Math.cos(angle) * radiusZ + 2.0;

      const tData = tileTypes[i];

      // 3D Tile Slab
      const tileGroup = new THREE.Group();
      tileGroup.position.set(x, 0.25, z);

      // Stone base
      const slabGeo = new THREE.BoxGeometry(3.6, 0.45, 3.6);
      const slabMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = true;
      tileGroup.add(slab);

      // Colored Glowing Cap
      const capGeo = new THREE.BoxGeometry(3.3, 0.15, 3.3);
      const capMat = new THREE.MeshLambertMaterial({
        color: tData.color,
        emissive: tData.color,
        emissiveIntensity: 0.2
      });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.28;
      tileGroup.add(cap);

      // Number badge texture
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i}`, 64, 64);

      const numTex = new THREE.CanvasTexture(canvas);
      const numGeo = new THREE.PlaneGeometry(1.6, 1.6);
      const numMat = new THREE.MeshBasicMaterial({ map: numTex, transparent: true });
      const numMesh = new THREE.Mesh(numGeo, numMat);
      numMesh.rotation.x = -Math.PI / 2;
      numMesh.position.y = 0.38;
      tileGroup.add(numMesh);

      // Floating 3D Icon indicator
      const iconGroup = this.createFloatingIcon(tData.icon, tData.color);
      iconGroup.position.y = 2.0;
      tileGroup.add(iconGroup);
      this.floatingIcons.push(iconGroup);

      this.scene.add(tileGroup);

      this.tiles.push({
        index: i,
        x: x,
        y: 0.5,
        z: z,
        type: tData.type,
        name: tData.name,
        color: tData.color,
        icon: tData.icon,
        desc: tData.desc,
        mesh: tileGroup
      });
    }
  }

  createFloatingIcon(iconChar, colorHex) {
    const group = new THREE.Group();

    // Floating gem / diamond
    const gemGeo = new THREE.OctahedronGeometry(0.5, 0);
    const gemMat = new THREE.MeshLambertMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.4
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    group.add(gem);

    return group;
  }

  /**
   * 4. 3D Digital Dice (Dadu Interaktif)
   */
  build3DDice() {
    this.diceGroup = new THREE.Group();
    this.diceGroup.position.set(0, 3.5, 0);

    // Create a smooth dice box
    const diceGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);

    // Create 6 face textures (1 to 6 dots)
    const materials = [];
    const pipPositions = {
      1: [[64, 64]],
      2: [[34, 34], [94, 94]],
      3: [[34, 34], [64, 64], [94, 94]],
      4: [[34, 34], [94, 34], [34, 94], [94, 94]],
      5: [[34, 34], [94, 34], [64, 64], [34, 94], [94, 94]],
      6: [[34, 30], [94, 30], [34, 64], [94, 64], [34, 98], [94, 98]]
    };

    for (let face = 1; face <= 6; face++) {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext("2d");

      // White dice surface with subtle wood/resin gradient
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, 120, 120);

      // Draw red dot for 1 (traditional Asian/Gorontalo dice style) and black/dark-blue for others
      ctx.fillStyle = face === 1 ? "#d32f2f" : "#1a237e";
      const pips = pipPositions[face];
      pips.forEach(p => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], face === 1 ? 16 : 10, 0, Math.PI * 2);
        ctx.fill();
      });

      const tex = new THREE.CanvasTexture(c);
      materials.push(new THREE.MeshLambertMaterial({ map: tex }));
    }

    this.diceMesh = new THREE.Mesh(diceGeo, materials);
    this.diceMesh.castShadow = true;
    this.diceGroup.add(this.diceMesh);

    // Shadow plane under dice
    const dShadowGeo = new THREE.PlaneGeometry(3.0, 3.0);
    const dShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.25
    });
    this.diceShadow = new THREE.Mesh(dShadowGeo, dShadowMat);
    this.diceShadow.rotation.x = -Math.PI / 2;
    this.diceShadow.position.y = -1.6;
    this.diceGroup.add(this.diceShadow);

    this.scene.add(this.diceGroup);
  }

  /**
   * 5. Spawn Players (Chibi Farmer & Multi-Players / Bots)
   */
  spawnPlayers() {
    this.players = [];

    // Player 1 (User: Pelajar / Petani Muda Gorontalo)
    const p1Mesh = this.createChibiFarmer(0x1976d2, "caping"); // Blue farmer outfit
    const startTile = this.tiles[0];
    p1Mesh.position.set(startTile.x, startTile.y, startTile.z);
    this.scene.add(p1Mesh);

    this.players.push({
      id: "p1",
      name: this.playerData.name,
      isHuman: true,
      tileIndex: 0,
      score: 0,
      energy: 100,
      mesh: p1Mesh,
      color: "#2196f3"
    });

    // Multiplayer / Bot Players
    this.bots.forEach((b, idx) => {
      const botMesh = this.createChibiFarmer(b.color, idx % 2 === 0 ? "headband" : "cap");
      // Offset slightly on the tile so players don't overlap
      const offset = (idx + 1) * 0.7;
      botMesh.position.set(startTile.x + offset, startTile.y, startTile.z + offset);
      this.scene.add(botMesh);

      this.players.push({
        id: `bot_${idx}`,
        name: b.name,
        institution: b.institution,
        isHuman: false,
        tileIndex: 0,
        score: 0,
        energy: 100,
        mesh: botMesh,
        color: b.color
      });
    });
  }

  createChibiFarmer(clothingColorHex, headgear = "caping") {
    const farmer = new THREE.Group();

    // Body / Overalls
    const bodyGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.9, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: clothingColorHex });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.85;
    body.castShadow = true;
    farmer.add(body);

    // Head (Chibi cute spherical/box head)
    const headGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffd1a4 }); // Natural Indonesian tan skin
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.7;
    head.castShadow = true;
    farmer.add(head);

    // Chibi Big Anime / Stardew Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x212121 });
    const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 1.75, 0.48);
    farmer.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 1.75, 0.48);
    farmer.add(rightEye);

    // Cute Cheeks
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff8a80 });
    const blushGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.32, 1.62, 0.44);
    farmer.add(leftBlush);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.32, 1.62, 0.44);
    farmer.add(rightBlush);

    // Headgear: Caping Tani Nusantara or Headband Karawo
    if (headgear === "caping") {
      const capingGeo = new THREE.ConeGeometry(1.05, 0.55, 16);
      const capingMat = new THREE.MeshLambertMaterial({ color: 0xd7ccc8 }); // Bamboo weave
      const caping = new THREE.Mesh(capingGeo, capingMat);
      caping.position.y = 2.25;
      caping.castShadow = true;
      farmer.add(caping);
    } else if (headgear === "headband") {
      const bandGeo = new THREE.TorusGeometry(0.58, 0.08, 8, 16);
      const bandMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f }); // Red-white bandana
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 1.85;
      farmer.add(band);
    } else {
      // Cute Beret / Student Cap
      const capGeo = new THREE.CylinderGeometry(0.65, 0.6, 0.25, 12);
      const capMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 2.15;
      farmer.add(cap);
    }

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.5, 8);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
    const lLeg = new THREE.Mesh(legGeo, legMat);
    lLeg.position.set(-0.25, 0.25, 0);
    farmer.add(lLeg);

    const rLeg = new THREE.Mesh(legGeo, legMat);
    rLeg.position.set(0.25, 0.25, 0);
    farmer.add(rLeg);

    // Backpack (Harvest bag)
    const packGeo = new THREE.BoxGeometry(0.55, 0.6, 0.35);
    const packMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.position.set(0, 0.9, -0.45);
    farmer.add(pack);

    farmer.scale.set(1.15, 1.15, 1.15);
    return farmer;
  }

  /**
   * 6. Interactive 3D Dice Roll & Step Hop Mechanics
   */
  async rollDice() {
    if (this.isRolling || this.isMoving || this.isGameOver) return;

    this.isRolling = true;
    window.soundSystem.playDiceRoll();

    // Disable Roll Button in UI
    const rollBtn = document.getElementById("btn-roll-dice");
    if (rollBtn) rollBtn.disabled = true;

    // Determine random roll (1 to 6)
    const rollResult = Math.floor(Math.random() * 6) + 1;

    // Dice Face Rotations for Three.js BoxGeometry
    // Faces: [Right, Left, Top, Bottom, Front, Back]
    // 1: Right, 2: Left, 3: Top, 4: Bottom, 5: Front, 6: Back
    const faceRotations = {
      1: { x: 0, y: -Math.PI / 2, z: 0 },
      2: { x: 0, y: Math.PI / 2, z: 0 },
      3: { x: Math.PI / 2, y: 0, z: 0 },
      4: { x: -Math.PI / 2, y: 0, z: 0 },
      5: { x: 0, y: 0, z: 0 },
      6: { x: Math.PI, y: 0, z: 0 }
    };

    const targetRot = faceRotations[rollResult];
    const spinTurns = 3 * Math.PI * 2; // Extra 3 full spins for excitement

    const startTime = performance.now();
    const duration = 1200; // ms

    return new Promise(resolve => {
      const animateDice = now => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        // Ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        // Arc hop
        this.diceGroup.position.y = 3.5 + Math.sin(progress * Math.PI) * 5.0;

        // Dynamic 3D spin
        this.diceMesh.rotation.x = targetRot.x + spinTurns * (1 - ease);
        this.diceMesh.rotation.y = targetRot.y + spinTurns * (1 - ease);
        this.diceMesh.rotation.z = targetRot.z + (spinTurns / 2) * (1 - ease);

        if (progress < 1.0) {
          requestAnimationFrame(animateDice);
        } else {
          this.diceGroup.position.y = 3.5;
          this.diceMesh.rotation.set(targetRot.x, targetRot.y, targetRot.z);
          this.isRolling = false;

          // Announce in notification
          this.showToast(`🎲 Dadu Bergulir: Angka ${rollResult}!`);

          // Move current active player
          this.movePlayerSteps(this.currentPlayerIndex, rollResult).then(() => {
            if (rollBtn) rollBtn.disabled = false;
            resolve(rollResult);
          });
        }
      };
      requestAnimationFrame(animateDice);
    });
  }

  /**
   * Move Player tile-by-tile with Parabolic Hopping Animation
   */
  async movePlayerSteps(playerIndex, steps) {
    this.isMoving = true;
    const player = this.players[playerIndex];
    let currentIdx = player.tileIndex;

    for (let s = 1; s <= steps; s++) {
      const nextIdx = (currentIdx + 1) % this.tiles.length;
      await this.hopToTile(player, this.tiles[nextIdx]);
      currentIdx = nextIdx;
      player.tileIndex = currentIdx;

      if (player.isHuman) {
        this.currentTileIndex = currentIdx;
        this.tilesVisited++;
        this.updateHUD();
        this.syncScoreToGAS();
      }
    }

    this.isMoving = false;

    // Trigger Landed Tile Event
    const landedTile = this.tiles[currentIdx];
    await this.onPlayerLandedTile(player, landedTile);

    // If human, after event, allow bots to take turn
    if (player.isHuman && this.multiplayerMode === "bot") {
      this.runBotTurns();
    }
  }

  hopToTile(player, targetTile) {
    return new Promise(resolve => {
      window.soundSystem.playHop();

      const startPos = player.mesh.position.clone();
      // Add slight offset for bot to prevent overlap
      const offset = player.isHuman ? 0 : (this.players.indexOf(player)) * 0.7;
      const endPos = new THREE.Vector3(targetTile.x + offset, targetTile.y, targetTile.z + offset);

      const startTime = performance.now();
      const hopDuration = 320; // ms per hop

      const animateHop = now => {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / hopDuration, 1.0);

        // Linear horizontal Lerp
        player.mesh.position.x = THREE.MathUtils.lerp(startPos.x, endPos.x, p);
        player.mesh.position.z = THREE.MathUtils.lerp(startPos.z, endPos.z, p);

        // Parabolic vertical hop
        const jumpHeight = 1.8;
        player.mesh.position.y = THREE.MathUtils.lerp(startPos.y, endPos.y, p) + Math.sin(p * Math.PI) * jumpHeight;

        // Face movement direction
        player.mesh.lookAt(endPos.x, player.mesh.position.y, endPos.z);

        if (p < 1.0) {
          requestAnimationFrame(animateHop);
        } else {
          player.mesh.position.copy(endPos);
          resolve();
        }
      };
      requestAnimationFrame(animateHop);
    });
  }

  /**
   * Handle Tile Effect when player lands
   */
  async onPlayerLandedTile(player, tile) {
    if (!player.isHuman) {
      // Bot landed logic
      if (tile.type === "QUIZ" || tile.type === "HARVEST") {
        player.score += 15;
      }
      this.updateLeaderboardUI();
      return;
    }

    // Camera follow briefly
    if (this.cameraMode === "follow") {
      this.setCameraFollow();
    }

    // Human Player Landed Effects
    switch (tile.type) {
      case "QUIZ":
        this.openQuizModal(tile);
        break;

      case "HARVEST":
        this.score += 15;
        window.soundSystem.playCorrect();
        this.showToast(`🌽 Panen Jagung Gorontalo Berhasil! (+15 Poin)`);
        this.updateHUD();
        this.syncScoreToGAS();
        break;

      case "ENERGY":
        this.energy = Math.min(this.maxEnergy, this.energy + 25);
        window.soundSystem.playHeal();
        this.showToast(`🌱 Pupuk Organik & Biogas Ramah Lingkungan (+25 Stamina)`);
        this.updateHUD();
        break;

      case "WATER":
        this.energy = Math.min(this.maxEnergy, this.energy + 15);
        this.score += 10;
        window.soundSystem.playHeal();
        this.showToast(`💧 Mata Air Danau Limboto: Irigasi Sehat (+10 Poin, +15 Stamina)`);
        this.updateHUD();
        break;

      case "PEST":
        this.energy = Math.max(10, this.energy - 15);
        window.soundSystem.playWrong();
        this.showToast(`🐛 Waspada Hama Tanaman! Stamina Berkurang (-15 Stamina)`);
        this.updateHUD();
        // Give optional mini-quiz to restore energy
        setTimeout(() => this.openQuizModal(tile, true), 800);
        break;

      case "CULTURE":
        this.score += 20;
        window.soundSystem.playFanfare();
        this.showToast(`🎨 Festival Budaya Gorontalo: Pesona Karawo & Tradisi (+20 Poin)`);
        this.updateHUD();
        this.syncScoreToGAS();
        break;

      case "START":
      case "START_HALF":
        this.score += 25;
        this.energy = this.maxEnergy;
        window.soundSystem.playFanfare();
        this.showToast(`🏛️ Checkpoint BPMP Gorontalo: Stamina Penuh & Bonus +25 Poin!`);
        this.updateHUD();
        this.syncScoreToGAS();
        break;

      default:
        this.showToast(`Mendarat di ${tile.name}`);
        break;
    }
  }

  /**
   * Run Bot Turns in background
   */
  async runBotTurns() {
    for (let i = 1; i < this.players.length; i++) {
      const bot = this.players[i];
      await new Promise(r => setTimeout(r, 600));
      const botSteps = Math.floor(Math.random() * 4) + 1;
      await this.movePlayerSteps(i, botSteps);
    }
    this.updateLeaderboardUI();
  }

  /**
   * 7. Quiz Modal Controller (20 Soal Pilihan Ganda)
   */
  openQuizModal(tile, isRescue = false) {
    if (this.isGameOver) return;

    window.soundSystem.playModalOpen();

    // Select a question not yet answered
    const availableQuestions = this.questions.filter(q => !this.answeredQuestions.includes(q.id));
    if (availableQuestions.length === 0) {
      this.answeredQuestions = []; // Reset pool if exhausted
    }

    const q = availableQuestions.length > 0
      ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
      : this.questions[0];

    this.currentQuestion = q;

    const modal = document.getElementById("quiz-modal");
    const titleEl = document.getElementById("quiz-tile-title");
    const numEl = document.getElementById("quiz-number-badge");
    const categoryEl = document.getElementById("quiz-category");
    const questionTextEl = document.getElementById("quiz-question-text");
    const optionsContainer = document.getElementById("quiz-options-container");
    const explanationBox = document.getElementById("quiz-explanation-box");
    const nextBtn = document.getElementById("btn-quiz-next");

    explanationBox.style.display = "none";
    nextBtn.style.display = "none";

    titleEl.textContent = isRescue ? "🛡️ Kuis Penyelamatan Tanaman" : `🏛️ BPMP Edu Tile: ${tile.name}`;
    numEl.textContent = `Soal #${q.id} dari ${this.totalQuestions}`;
    categoryEl.textContent = q.category || "Edukasi & Kearifan Lokal";

    // Retro typewriter effect on question
    this.typeWriter(questionTextEl, q.question);

    // Build Options A, B, C, D
    optionsContainer.innerHTML = "";
    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "retro-option-btn";
      btn.innerHTML = `
        <span class="option-key">${opt.key}</span>
        <span class="option-text">${opt.text}</span>
      `;
      btn.onclick = () => this.handleAnswerSelect(opt.key, btn);
      optionsContainer.appendChild(btn);
    });

    modal.classList.add("active");
  }

  typeWriter(element, text) {
    element.textContent = "";
    let i = 0;
    const speed = 18;
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  handleAnswerSelect(selectedKey, clickedBtn) {
    const q = this.currentQuestion;
    if (!q) return;

    const isCorrect = selectedKey === q.answer;
    this.answeredQuestions.push(q.id);

    // Disable all options
    const allButtons = document.querySelectorAll(".retro-option-btn");
    allButtons.forEach(b => b.disabled = true);

    const explanationBox = document.getElementById("quiz-explanation-box");
    const explText = document.getElementById("quiz-explanation-text");
    const nextBtn = document.getElementById("btn-quiz-next");

    if (isCorrect) {
      clickedBtn.classList.add("correct");
      window.soundSystem.playCorrect();
      this.score += 20;
      this.correctCount++;
      this.energy = Math.min(this.maxEnergy, this.energy + 10);
      explText.innerHTML = `<strong>🎉 JAWABAN BENAR! (+20 Poin Panen)</strong><br>${q.explanation}`;
      explanationBox.className = "quiz-explanation correct";
    } else {
      clickedBtn.classList.add("wrong");
      window.soundSystem.playWrong();
      this.wrongCount++;
      this.energy = Math.max(5, this.energy - 10);

      // Highlight the correct one
      allButtons.forEach(b => {
        if (b.querySelector(".option-key").textContent.trim() === q.answer) {
          b.classList.add("correct");
        }
      });

      explText.innerHTML = `<strong>❌ JAWABAN KURANG TEPAT</strong><br>Jawaban benar: <strong>Pilihan [${q.answer}]</strong>.<br>${q.explanation}`;
      explanationBox.className = "quiz-explanation wrong";
    }

    explanationBox.style.display = "block";
    nextBtn.style.display = "block";

    this.updateHUD();
    this.syncScoreToGAS();

    // Check if 30 questions completed
    if (this.correctCount + this.wrongCount >= this.totalQuestions) {
      setTimeout(() => {
        this.closeQuizModal();
        this.triggerGameFinish("Selamat! Anda telah menyelesaikan 30 Soal Tantangan Arduino & Wokwi!");
      }, 3500);
    }
  }

  closeQuizModal() {
    const modal = document.getElementById("quiz-modal");
    if (modal) modal.classList.remove("active");
  }

  /**
   * 8. 60-Minute Global Timer Engine
   */
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.isGameOver) return;

      this.remainingSeconds--;
      this.elapsedSeconds++;

      this.updateTimerDisplay();

      // Energy slight burn over time (every 45s -1 stamina)
      if (this.elapsedSeconds % 45 === 0 && this.energy > 5) {
        this.energy = Math.max(5, this.energy - 1);
        this.updateHUD();
      }

      // Check Time Expired
      if (this.remainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.triggerGameFinish("Waktu Permainan 60 Menit Telah Habis!");
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const min = Math.floor(this.remainingSeconds / 60);
    const sec = this.remainingSeconds % 60;
    const formatted = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

    const timerEl = document.getElementById("hud-timer");
    const timerBar = document.getElementById("timer-progress-bar");

    if (timerEl) timerEl.textContent = formatted;

    if (timerBar) {
      const percentage = (this.remainingSeconds / this.totalTimeSeconds) * 100;
      timerBar.style.width = `${percentage}%`;

      if (percentage < 15) {
        timerBar.style.backgroundColor = "#e53935"; // Red danger
        if (timerEl) timerEl.style.color = "#ff5252";
      } else if (percentage < 40) {
        timerBar.style.backgroundColor = "#fb8c00"; // Orange
      } else {
        timerBar.style.backgroundColor = "#43a047"; // Green
      }
    }
  }

  getFormattedElapsedTime() {
    const h = Math.floor(this.elapsedSeconds / 3600);
    const m = Math.floor((this.elapsedSeconds % 3600) / 60);
    const s = this.elapsedSeconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  getFormattedRemainingTime() {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  /**
   * 9. Real-Time HUD and Leaderboard
   */
  updateHUD() {
    // Score
    const scoreEl = document.getElementById("hud-score");
    if (scoreEl) scoreEl.textContent = this.score;

    // Energy / Hearts Bar (Harvest Moon style)
    const energyBar = document.getElementById("hud-energy-bar");
    const energyText = document.getElementById("hud-energy-text");
    if (energyBar) energyBar.style.width = `${this.energy}%`;
    if (energyText) energyText.textContent = `${this.energy}%`;

    // Soal Solved stats
    const statsEl = document.getElementById("hud-soal-stats");
    if (statsEl) {
      statsEl.textContent = `${this.correctCount} Benar / ${this.wrongCount} Salah (${this.correctCount + this.wrongCount}/${this.totalQuestions})`;
    }

    // Tile indicator
    const tileEl = document.getElementById("hud-current-tile");
    if (tileEl && this.tiles[this.currentTileIndex]) {
      const t = this.tiles[this.currentTileIndex];
      tileEl.textContent = `Petak #${t.index}: ${t.name} (${t.icon})`;
    }

    // Minimap update
    this.updateMinimap();
  }

  updateLeaderboardUI() {
    const list = document.getElementById("leaderboard-list");
    if (!list) return;

    // Sort players
    const all = [...this.players].sort((a, b) => {
      const scoreA = a.isHuman ? this.score : a.score;
      const scoreB = b.isHuman ? this.score : b.score;
      return scoreB - scoreA;
    });

    list.innerHTML = "";
    all.forEach((p, idx) => {
      const curScore = p.isHuman ? this.score : p.score;
      const item = document.createElement("div");
      item.className = `leaderboard-item ${p.isHuman ? "is-user" : ""}`;
      item.innerHTML = `
        <div class="lb-rank">#${idx + 1}</div>
        <div class="lb-info">
          <div class="lb-name">${p.name} ${p.isHuman ? "(Anda)" : ""}</div>
          <div class="lb-inst">${p.institution || "Gorontalo"}</div>
        </div>
        <div class="lb-score">${curScore} pts</div>
      `;
      list.appendChild(item);
    });
  }

  /**
   * 10. Minimap 2D Radar Canvas
   */
  setupMinimap() {
    this.minimapCanvas = document.getElementById("minimap-canvas");
    if (!this.minimapCanvas) return;
    this.minimapCtx = this.minimapCanvas.getContext("2d");
  }

  updateMinimap() {
    if (!this.minimapCanvas || !this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Center coordinates
    const cx = w / 2;
    const cy = h / 2;
    const scale = 2.4;

    // Draw central BPMP building footprint
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(cx - 18, cy - 26, 36, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BPMP", cx, cy - 15);

    // Draw Board Tiles Loop
    this.tiles.forEach(t => {
      const px = cx + t.x * scale;
      const py = cy + t.z * scale;

      ctx.fillStyle = t.type === "QUIZ" ? "#42a5f5" : (t.type === "HARVEST" ? "#fbc02d" : "#78909c");
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Player Dots
    this.players.forEach((p, idx) => {
      const curTile = this.tiles[p.tileIndex] || this.tiles[0];
      const px = cx + curTile.x * scale;
      const py = cy + curTile.z * scale;

      ctx.fillStyle = p.isHuman ? "#00e676" : "#ff4081";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, p.isHuman ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  /**
   * 11. Sync Score & Progress to Google Apps Script & Google Sheets
   */
  async syncScoreToGAS() {
    const payload = {
      roomId: this.playerData.roomId || "BPMP-01",
      name: this.playerData.name,
      nim: this.playerData.nim,
      institution: this.playerData.institution,
      totalScore: this.score,
      correctAnswers: this.correctCount,
      wrongAnswers: this.wrongCount,
      currentTile: this.currentTileIndex,
      timeElapsed: this.getFormattedElapsedTime(),
      timeRemaining: this.getFormattedRemainingTime(),
      tilesVisited: this.tilesVisited,
      isFinished: this.isGameOver
    };

    console.log("[Game] Auto-syncing progress to GAS & Broadcast:", payload);
    const res = await window.gasService.updateProgress(payload);
    if (res && res.synced) {
      this.showSyncBadge("Tersinkron ke Google Sheets ✅");
    }
  }

  showSyncBadge(text) {
    const badge = document.getElementById("sync-status-badge");
    if (!badge) return;
    badge.textContent = text;
    badge.style.opacity = "1";
    setTimeout(() => { badge.style.opacity = "0.7"; }, 2500);
  }

  /**
   * 12. Game Finish / Session Completion
   */
  async triggerGameFinish(reasonMessage) {
    this.isGameOver = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    window.soundSystem.playFanfare();

    // Final Sync to GAS
    await this.syncScoreToGAS();

    // Show Game Over Modal
    const modal = document.getElementById("finish-modal");
    document.getElementById("finish-reason").textContent = reasonMessage;
    document.getElementById("finish-player-name").textContent = this.playerData.name;
    document.getElementById("finish-nim").textContent = this.playerData.nim;
    document.getElementById("finish-inst").textContent = this.playerData.institution;
    document.getElementById("finish-score").textContent = `${this.score} Poin`;
    document.getElementById("finish-correct").textContent = `${this.correctCount} / ${this.totalQuestions}`;
    document.getElementById("finish-wrong").textContent = `${this.wrongCount}`;
    document.getElementById("finish-time").textContent = this.getFormattedElapsedTime();

    if (modal) modal.classList.add("active");
  }

  showToast(message) {
    const toast = document.getElementById("retro-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
  }

  setupEventListeners() {
    // Roll Dice Button
    const rollBtn = document.getElementById("btn-roll-dice");
    if (rollBtn) {
      rollBtn.addEventListener("click", () => this.rollDice());
    }

    // Camera Mode Toggle Buttons
    const camIsoBtn = document.getElementById("btn-cam-iso");
    if (camIsoBtn) camIsoBtn.addEventListener("click", () => this.setCameraIsometric());

    const camTopBtn = document.getElementById("btn-cam-top");
    if (camTopBtn) camTopBtn.addEventListener("click", () => this.setCameraTop());

    const camFollowBtn = document.getElementById("btn-cam-follow");
    if (camFollowBtn) camFollowBtn.addEventListener("click", () => this.setCameraFollow());

    // Audio Toggle
    const audioBtn = document.getElementById("btn-audio-toggle");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        const isMuted = window.soundSystem.toggleMute();
        audioBtn.textContent = isMuted ? "🔇 Musik Mati" : "🎵 Musik Hidup";
      });
    }

    // Quiz Next Button
    const nextBtn = document.getElementById("btn-quiz-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.closeQuizModal());
    }

    // Multi-player Live Sync via BroadcastChannel
    if (window.gasService && window.gasService.channel) {
      window.gasService.channel.onmessage = (event) => {
        const msg = event.data;
        if (msg.type === "PLAYER_PROGRESS" && msg.player && msg.player.playerId !== window.gasService.playerId) {
          const other = this.players.find(p => p.id === msg.player.playerId || p.name === msg.player.name);
          if (other) {
            other.score = msg.player.totalScore;
            other.tileIndex = msg.player.currentTile;
            const targetTile = this.tiles[other.tileIndex] || this.tiles[0];
            other.mesh.position.set(targetTile.x + 1, targetTile.y, targetTile.z + 1);
            this.updateLeaderboardUI();
            this.updateMinimap();
          }
        }
      };
    }

    // Drag to rotate camera around BPMP grounds
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    this.container.addEventListener("mousedown", e => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener("mouseup", () => { isDragging = false; });

    this.container.addEventListener("mousemove", e => {
      if (!isDragging || this.cameraMode === "top") return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;

      // Orbit camera around center
      const rotSpeed = 0.005;
      const x = this.camera.position.x;
      const z = this.camera.position.z;
      this.camera.position.x = x * Math.cos(deltaX * rotSpeed) - z * Math.sin(deltaX * rotSpeed);
      this.camera.position.z = x * Math.sin(deltaX * rotSpeed) + z * Math.cos(deltaX * rotSpeed);
      this.camera.lookAt(this.camTarget);
    });

    // Touch support for mobile
    let touchStartX = 0;
    this.container.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    this.container.addEventListener("touchmove", e => {
      if (e.touches.length === 1 && this.cameraMode !== "top") {
        const deltaX = e.touches[0].clientX - touchStartX;
        touchStartX = e.touches[0].clientX;
        const rotSpeed = 0.006;
        const x = this.camera.position.x;
        const z = this.camera.position.z;
        this.camera.position.x = x * Math.cos(deltaX * rotSpeed) - z * Math.sin(deltaX * rotSpeed);
        this.camera.position.z = x * Math.sin(deltaX * rotSpeed) + z * Math.cos(deltaX * rotSpeed);
        this.camera.lookAt(this.camTarget);
      }
    }, { passive: true });
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
    const time = this.clock.getElapsedTime();

    // Rotate Windmills
    this.windmills.forEach(w => {
      w.rotation.z += delta * 1.5;
    });

    // Bobbing & Floating Icons
    this.floatingIcons.forEach((icon, idx) => {
      icon.position.y = 1.8 + Math.sin(time * 2.5 + idx) * 0.25;
      icon.rotation.y += delta * 1.2;
    });

    // Idle animal animation (head turning/grazing)
    this.animals.forEach((a, i) => {
      a.mesh.rotation.y = a.baseRot + Math.sin(time * 0.8 + i) * 0.2;
    });

    // Idle Player subtle breathing bounce
    this.players.forEach((p, idx) => {
      if (!this.isMoving) {
        p.mesh.position.y = 0.5 + Math.sin(time * 3 + idx) * 0.05;
      }
    });

    // Smooth follow camera
    if (this.cameraMode === "follow" && this.players[0]) {
      const p = this.players[0].mesh.position;
      const targetCam = new THREE.Vector3(p.x + 10, p.y + 12, p.z + 14);
      this.camera.position.lerp(targetCam, 0.05);
      this.camTarget.lerp(new THREE.Vector3(p.x, p.y + 1.5, p.z), 0.08);
      this.camera.lookAt(this.camTarget);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.BPMPFarmGame = BPMPFarmGame;
