/**
 * 3D Cutaway Simulation: 0.37 kW Wound Rotor Induction Motor Coupled to Centrifugal Pump
 * Built with Three.js
 */

// --- Global State & Config ---
const STATE = {
  isRunning: true,
  rpm: 1420,
  explodeFactor: 0,
  cutawayFactor: 0.5,
  showFlow: true,
  showFlux: true,
  wireframe: false,
  showLabels: true,
  autoRotate: false,
  selectedComponent: null
};

// Component Specs Data for Inspector
const COMPONENT_DATA = {
  stator: {
    category: "STATOR ASSEMBLY",
    name: "Laminated Silicon Steel Stator Core & 24 SWG Windings",
    desc: "Precision stamped silicon steel laminations with 24 semi-closed slots. Insulated with Nomex paper slot liners and wound with 99 turns per coil of 24 SWG enameled copper wire, tightly laced with white polyester cord.",
    specs: [
      { label: "Outer Diameter", val: "130 mm" },
      { label: "Bore (Inner Dia)", val: "65 mm" },
      { label: "Axial Length", val: "53 mm" },
      { label: "Slot Count & Width", val: "24 slots / 7 mm" },
      { label: "Wire Gauge", val: "24 SWG (0.559 mm)" },
      { label: "Turns Per Coil", val: "99 Turns" },
      { label: "Insulation Class", val: "Class F (Nomex)" },
      { label: "Lacing", val: "Polyester Cord" }
    ]
  },
  rotor: {
    category: "ROTOR ASSEMBLY",
    name: "3-Phase Wound Rotor Core",
    desc: "Cylindrical laminated electrical steel rotor core with embedded three-phase insulated windings connected in star. Windings connect through the hollow shaft passage to the brass slip rings.",
    specs: [
      { label: "Active Length", val: "70 mm" },
      { label: "Core Perimeter", val: "215 mm (~68.4mm Ø)" },
      { label: "Winding Type", val: "3-Phase Star Wound" },
      { label: "Poles", val: "4 Poles (1500 synch RPM)" },
      { label: "Air Gap", val: "0.35 mm" },
      { label: "Shaft Material", val: "Hardened EN8 Steel" }
    ]
  },
  sliprings: {
    category: "SLIP RING ASSEMBLY",
    name: "Brass Slip Rings & Carbon Brush Gear",
    desc: "Three heavy-duty polished brass collector rings mounted on an insulated sleeve on the non-drive shaft end. High-conductivity carbon brushes in spring-loaded bronze holders maintain continuous contact for rotor resistance control.",
    specs: [
      { label: "Ring Material", val: "Polished CuZn39Pb3 Brass" },
      { label: "Ring Count", val: "3 Rings (R-Y-B Phases)" },
      { label: "Brush Material", val: "Electrographite Carbon" },
      { label: "Brush Tension", val: "Constant Force Spring" },
      { label: "Rotor Voltage", val: "110 V Open Circuit" },
      { label: "Rotor Current", val: "2.8 A Full Load" }
    ]
  },
  casing: {
    category: "MOTOR ENCLOSURE",
    name: "Cast Aluminum Finned Stator Frame",
    desc: "Industrial blue powder-coated (RAL 5010) cast aluminum casing with high-surface-area axial cooling fins, integral mounting feet, and top-mounted IP55 terminal box.",
    specs: [
      { label: "Frame Size", val: "IEC 71M" },
      { label: "Protection Rating", val: "IP55 (Dust/Water Jet)" },
      { label: "Cooling Method", val: "IC411 (TEFC)" },
      { label: "Finish", val: "Powder Coated Blue" },
      { label: "Terminal Box", val: "6+3 Stud Terminals" },
      { label: "Mounting", val: "B3 Foot Mounted" }
    ]
  },
  coupling: {
    category: "DRIVETRAIN TRANSMISSION",
    name: "Precision Flexible Mechanical Jaw Coupling",
    desc: "Two balanced aluminum/steel jaw hubs with an interlocking synthetic polyurethane elastomer spider element to absorb torsional vibrations and compensate for angular/axial misalignments.",
    specs: [
      { label: "Coupling Type", val: "Flexible Curved Jaw" },
      { label: "Torque Rating", val: "15 Nm (Nominal)" },
      { label: "Spider Element", val: "Shore 98A Polyurethane" },
      { label: "Shaft Fit", val: "H7 Keyed Fit with Set Screw" }
    ]
  },
  pump: {
    category: "HYDRAULIC PUMP",
    name: "Centrifugal Water Pump & Impeller",
    desc: "Industrial red (RAL 3000) cast-iron spiral volute casing with horizontal suction and vertical radial discharge flanges. Houses a precision-balanced closed bronze impeller with backward-curved vanes.",
    specs: [
      { label: "Casing Material", val: "Cast Iron EN-GJL-250" },
      { label: "Impeller Type", val: "Closed Curved Vanes" },
      { label: "Suction Port", val: "DN 32 Flanged (PN16)" },
      { label: "Discharge Port", val: "DN 25 Flanged (PN16)" },
      { label: "Rated Flow", val: "6.0 m³/h" },
      { label: "Rated Head", val: "14.5 m" },
      { label: "Shaft Seal", val: "Carbon/Ceramic Mech Seal" }
    ]
  },
  baseplate: {
    category: "STRUCTURAL FOUNDATION",
    name: "Machined Structural Steel Channel Baseplate",
    desc: "Heavy-gauge fabricated C-channel steel frame with CNC-machined motor and pump mounting pads, vibration damping pads, and M10 foundation anchor bolt holes.",
    specs: [
      { label: "Material", val: "Structural Steel S275JR" },
      { label: "Profile", val: "Fabricated U-Channel" },
      { label: "Coating", val: "Zinc Phosphate & Grey Paint" },
      { label: "Hold-Down Bolts", val: "8x High-Tensile M10" }
    ]
  }
};

// --- Scene Initialization ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a101d);
scene.fog = new THREE.FogExp2(0x0a101d, 0.028);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(14, 9, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 + 0.05; // don't go too far under base
controls.minDistance = 4;
controls.maxDistance = 28;
controls.target.set(0, 1.2, 0);

// --- Lighting & Environment ---
function setupLights() {
  const ambientLight = new THREE.AmbientLight(0xddeeff, 0.65);
  scene.add(ambientLight);

  // Key Spotlight
  const keyLight = new THREE.SpotLight(0xffffff, 2.5);
  keyLight.position.set(12, 18, 12);
  keyLight.angle = Math.PI / 4;
  keyLight.penumbra = 0.5;
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  // Blue Rim Light (Backlight for high-end CAD contrast)
  const rimLight = new THREE.DirectionalLight(0x00d4ff, 1.8);
  rimLight.position.set(-15, 10, -12);
  scene.add(rimLight);

  // Warm Fill Light
  const fillLight = new THREE.DirectionalLight(0xffaa55, 0.9);
  fillLight.position.set(-8, 6, 12);
  scene.add(fillLight);

  // Bottom bounce light
  const bounceLight = new THREE.DirectionalLight(0x224466, 0.5);
  bounceLight.position.set(0, -6, 0);
  scene.add(bounceLight);

  // Studio Grid Floor
  const gridHelper = new THREE.GridHelper(30, 60, 0x0088ff, 0x162942);
  gridHelper.position.y = -0.01;
  scene.add(gridHelper);

  // Floor Disc with subtle reflection look
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x080d16,
    roughness: 0.6,
    metalness: 0.3
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}

// --- Materials Library ---
const MATS = {
  blueMotorPaint: new THREE.MeshStandardMaterial({
    color: 0x185a9d,
    roughness: 0.35,
    metalness: 0.25,
    envMapIntensity: 1.0
  }),
  blueMotorCutaway: new THREE.MeshStandardMaterial({
    color: 0x0f4075,
    roughness: 0.4,
    metalness: 0.3,
    side: THREE.DoubleSide
  }),
  redPumpPaint: new THREE.MeshStandardMaterial({
    color: 0xbf212f,
    roughness: 0.4,
    metalness: 0.2
  }),
  redPumpCutaway: new THREE.MeshStandardMaterial({
    color: 0x8a131e,
    roughness: 0.45,
    metalness: 0.25,
    side: THREE.DoubleSide
  }),
  cutawayCrossSection: new THREE.MeshStandardMaterial({
    color: 0xff3b30,
    roughness: 0.5,
    metalness: 0.1
  }),
  steelShaft: new THREE.MeshStandardMaterial({
    color: 0xd8dde3,
    roughness: 0.2,
    metalness: 0.85
  }),
  laminatedSteel: new THREE.MeshStandardMaterial({
    color: 0x8a9ba8,
    roughness: 0.55,
    metalness: 0.65
  }),
  copperWinding: new THREE.MeshStandardMaterial({
    color: 0xe67328,
    roughness: 0.25,
    metalness: 0.8
  }),
  brassSlipRing: new THREE.MeshStandardMaterial({
    color: 0xf5b338,
    roughness: 0.2,
    metalness: 0.9
  }),
  carbonBrush: new THREE.MeshStandardMaterial({
    color: 0x222225,
    roughness: 0.8,
    metalness: 0.1
  }),
  insulationPaper: new THREE.MeshStandardMaterial({
    color: 0xf0eedb,
    roughness: 0.9,
    metalness: 0.0
  }),
  polyesterCord: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.0
  }),
  couplingAluminum: new THREE.MeshStandardMaterial({
    color: 0xb5bcc4,
    roughness: 0.3,
    metalness: 0.75
  }),
  elastomerSpider: new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.7,
    metalness: 0.05
  }),
  bronzeImpeller: new THREE.MeshStandardMaterial({
    color: 0xcd7f32,
    roughness: 0.3,
    metalness: 0.8
  }),
  baseplateSteel: new THREE.MeshStandardMaterial({
    color: 0x3d4b59,
    roughness: 0.6,
    metalness: 0.5
  }),
  terminalBox: new THREE.MeshStandardMaterial({
    color: 0x1d4e80,
    roughness: 0.4,
    metalness: 0.2
  }),
  hotspotGlow: new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.85
  })
};

// --- Assembly Component Hierarchies ---
const assemblyGroup = new THREE.Group();
scene.add(assemblyGroup);

// Sub-groups for exploded view animation
const groups = {
  baseplate: new THREE.Group(),
  motorCasing: new THREE.Group(),
  statorCore: new THREE.Group(),
  rotorAssembly: new THREE.Group(), // Rotating
  slipRingAssembly: new THREE.Group(),
  terminalBox: new THREE.Group(),
  coupling: new THREE.Group(), // Rotating part + stationary
  couplingRotor: new THREE.Group(),
  pumpCasing: new THREE.Group(),
  pumpImpeller: new THREE.Group() // Rotating
};

// Add sub-groups to assembly
Object.values(groups).forEach(g => assemblyGroup.add(g));

// Array of rotating elements
const rotatingElements = [];
const interactiveObjects = [];

// --- Builder Functions for Procedural Precision CAD Models ---

// 1. Structural Steel Baseplate
function buildBaseplate() {
  const base = groups.baseplate;
  base.userData = { id: 'baseplate', name: 'Steel Baseplate' };

  // Two C-channel main longitudinal beams
  const beamGeo = new THREE.BoxGeometry(11.5, 0.45, 0.5);
  const beam1 = new THREE.Mesh(beamGeo, MATS.baseplateSteel);
  beam1.position.set(0, 0.225, -1.3);
  beam1.castShadow = true;
  beam1.receiveShadow = true;
  base.add(beam1);

  const beam2 = beam1.clone();
  beam2.position.z = 1.3;
  base.add(beam2);

  // Cross members
  const crossGeo = new THREE.BoxGeometry(0.45, 0.4, 2.6);
  const crossPositions = [-5.2, -1.8, 1.8, 5.2];
  crossPositions.forEach(x => {
    const cross = new THREE.Mesh(crossGeo, MATS.baseplateSteel);
    cross.position.set(x, 0.2, 0);
    cross.castShadow = true;
    cross.receiveShadow = true;
    base.add(cross);
  });

  // Motor mounting pads
  const padGeo = new THREE.BoxGeometry(1.6, 0.2, 0.9);
  const motorPadL = new THREE.Mesh(padGeo, MATS.baseplateSteel);
  motorPadL.position.set(-2.2, 0.45, -1.1);
  base.add(motorPadL);

  const motorPadR = motorPadL.clone();
  motorPadR.position.z = 1.1;
  base.add(motorPadR);

  // Pump mounting pads
  const pumpPadGeo = new THREE.BoxGeometry(1.4, 0.2, 1.2);
  const pumpPad = new THREE.Mesh(pumpPadGeo, MATS.baseplateSteel);
  pumpPad.position.set(3.4, 0.45, 0);
  base.add(pumpPad);

  // Fastener bolts (M10 zinc plated)
  const boltGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 6);
  const boltMat = MATS.steelShaft;
  const boltPositions = [
    [-2.6, 0.6, -1.1], [-1.8, 0.6, -1.1],
    [-2.6, 0.6, 1.1], [-1.8, 0.6, 1.1],
    [3.0, 0.6, -0.4], [3.8, 0.6, -0.4],
    [3.0, 0.6, 0.4], [3.8, 0.6, 0.4]
  ];
  boltPositions.forEach(([x, y, z]) => {
    const bolt = new THREE.Mesh(boltGeo, boltMat);
    bolt.position.set(x, y, z);
    base.add(bolt);
  });

  registerInteractive(base, 'baseplate');
}

// 2. Motor Casing & Finned Enclosure (Cutaway Profile)
function buildMotorCasing() {
  const casing = groups.motorCasing;
  casing.userData = { id: 'casing', name: 'Cast Aluminum Motor Frame' };

  const motorCenterY = 1.8;
  const motorCenterX = -2.2;
  const casingRadius = 1.55;
  const casingLength = 3.6;

  // 3/4 Cylindrical cutaway casing shell (Exposing top-front cutaway)
  // Theta Start: Math.PI * 0.4, Theta Length: Math.PI * 1.35
  const casingGeo = new THREE.CylinderGeometry(casingRadius, casingRadius, casingLength, 48, 1, false, Math.PI * 0.35, Math.PI * 1.35);
  const casingMesh = new THREE.Mesh(casingGeo, MATS.blueMotorPaint);
  casingMesh.rotation.z = Math.PI / 2;
  casingMesh.position.set(motorCenterX, motorCenterY, 0);
  casingMesh.castShadow = true;
  casingMesh.receiveShadow = true;
  casing.add(casingMesh);

  // Axial Cooling Fins around casing
  const finCount = 18;
  for (let i = 0; i < finCount; i++) {
    const angle = Math.PI * 0.38 + (i / finCount) * Math.PI * 1.28;
    const finGeo = new THREE.BoxGeometry(casingLength * 0.95, 0.28, 0.05);
    const fin = new THREE.Mesh(finGeo, MATS.blueMotorPaint);
    fin.position.set(
      motorCenterX,
      motorCenterY + Math.sin(angle) * (casingRadius + 0.12),
      Math.cos(angle) * (casingRadius + 0.12)
    );
    fin.rotation.x = -angle + Math.PI / 2;
    fin.rotation.z = 0;
    casing.add(fin);
  }

  // Motor Mounting Feet
  const footGeo = new THREE.BoxGeometry(2.4, 0.45, 0.6);
  const footF = new THREE.Mesh(footGeo, MATS.blueMotorPaint);
  footF.position.set(motorCenterX, 0.75, 1.15);
  footF.castShadow = true;
  casing.add(footF);

  const footB = footF.clone();
  footB.position.z = -1.15;
  casing.add(footB);

  // Drive-End (DE) Flange / End-Shield (Right side cutaway)
  const deShieldGeo = new THREE.CylinderGeometry(1.58, 1.58, 0.3, 36, 1, false, Math.PI * 0.35, Math.PI * 1.35);
  const deShield = new THREE.Mesh(deShieldGeo, MATS.blueMotorPaint);
  deShield.rotation.z = Math.PI / 2;
  deShield.position.set(motorCenterX + casingLength / 2, motorCenterY, 0);
  casing.add(deShield);

  // Non-Drive End (NDE) Bearing Housing & Fan Cowl
  const ndeCowlGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.8, 36);
  const ndeCowl = new THREE.Mesh(ndeCowlGeo, MATS.blueMotorPaint);
  ndeCowl.rotation.z = Math.PI / 2;
  ndeCowl.position.set(motorCenterX - casingLength / 2 - 0.4, motorCenterY, 0);
  casing.add(ndeCowl);

  // Cutaway Wall Rim highlight (Red/Orange Cross-Section CAD marker)
  const cutawayRimGeo = new THREE.BoxGeometry(casingLength, 0.12, 0.25);
  const cutRim1 = new THREE.Mesh(cutawayRimGeo, MATS.cutawayCrossSection);
  cutRim1.position.set(motorCenterX, motorCenterY + casingRadius * Math.sin(Math.PI * 0.35), casingRadius * Math.cos(Math.PI * 0.35));
  casing.add(cutRim1);

  const cutRim2 = new THREE.Mesh(cutawayRimGeo, MATS.cutawayCrossSection);
  cutRim2.position.set(motorCenterX, motorCenterY + casingRadius * Math.sin(Math.PI * 1.7), casingRadius * Math.cos(Math.PI * 1.7));
  casing.add(cutRim2);

  registerInteractive(casing, 'casing');
}

// 3. Stator Core (130mm OD, 65mm ID, 24 Slots, 24 SWG Copper Windings)
function buildStatorCore() {
  const stator = groups.statorCore;
  stator.userData = { id: 'stator', name: 'Laminated Stator & Windings' };

  const motorCenterY = 1.8;
  const motorCenterX = -2.2;
  const statorLength = 2.1; // proportional to 53mm
  const statorOD = 1.35;    // proportional to 130mm
  const statorID = 0.68;    // proportional to 65mm

  // Stator Silicon Steel Laminated Ring Body (3/4 cutaway)
  const coreGeo = new THREE.CylinderGeometry(statorOD, statorOD, statorLength, 48, 1, true, Math.PI * 0.35, Math.PI * 1.35);
  const coreMesh = new THREE.Mesh(coreGeo, MATS.laminatedSteel);
  coreMesh.rotation.z = Math.PI / 2;
  coreMesh.position.set(motorCenterX, motorCenterY, 0);
  stator.add(coreMesh);

  // Internal Stator Teeth (24 slots)
  const slotCount = 24;
  for (let i = 0; i < slotCount; i++) {
    const angle = (i / slotCount) * Math.PI * 2;
    // Only render teeth that are in the active visible sector or partially visible
    if (angle > Math.PI * 0.32 && angle < Math.PI * 1.72) {
      const toothGeo = new THREE.BoxGeometry(statorLength, 0.38, 0.06);
      const tooth = new THREE.Mesh(toothGeo, MATS.laminatedSteel);
      const r = (statorOD + statorID) / 2;
      tooth.position.set(
        motorCenterX,
        motorCenterY + Math.sin(angle) * r,
        Math.cos(angle) * r
      );
      tooth.rotation.x = -angle + Math.PI / 2;
      stator.add(tooth);

      // Nomex Insulation Paper Slot Liner (White liner along teeth)
      const linerGeo = new THREE.BoxGeometry(statorLength * 1.02, 0.32, 0.02);
      const liner = new THREE.Mesh(linerGeo, MATS.insulationPaper);
      liner.position.set(
        motorCenterX,
        motorCenterY + Math.sin(angle + 0.04) * (r - 0.05),
        Math.cos(angle + 0.04) * (r - 0.05)
      );
      liner.rotation.x = -angle + Math.PI / 2;
      stator.add(liner);

      // Copper Coil Bundles (24 SWG, 99 turns visual pack)
      const coilGeo = new THREE.CylinderGeometry(0.065, 0.065, statorLength * 1.05, 8);
      const coil = new THREE.Mesh(coilGeo, MATS.copperWinding);
      coil.rotation.z = Math.PI / 2;
      coil.position.set(
        motorCenterX,
        motorCenterY + Math.sin(angle) * (r - 0.05),
        Math.cos(angle) * (r - 0.05)
      );
      stator.add(coil);
    }
  }

  // Stator End-Turn Overhang Windings (Curled copper baskets on both sides)
  const overhangRadius = (statorOD + statorID) / 2;
  const torusGeo = new THREE.TorusGeometry(overhangRadius, 0.22, 16, 32, Math.PI * 1.4);
  
  const deWinding = new THREE.Mesh(torusGeo, MATS.copperWinding);
  deWinding.rotation.y = Math.PI / 2;
  deWinding.rotation.x = Math.PI * 0.35;
  deWinding.position.set(motorCenterX + statorLength / 2 + 0.22, motorCenterY, 0);
  stator.add(deWinding);

  const ndeWinding = new THREE.Mesh(torusGeo, MATS.copperWinding);
  ndeWinding.rotation.y = -Math.PI / 2;
  ndeWinding.rotation.x = Math.PI * 0.35;
  ndeWinding.position.set(motorCenterX - statorLength / 2 - 0.22, motorCenterY, 0);
  stator.add(ndeWinding);

  // Polyester White Cord Lacing rings on the end turns
  const lacingGeo = new THREE.TorusGeometry(overhangRadius + 0.08, 0.03, 8, 24, Math.PI * 1.35);
  const lacing1 = new THREE.Mesh(lacingGeo, MATS.polyesterCord);
  lacing1.rotation.y = Math.PI / 2;
  lacing1.rotation.x = Math.PI * 0.35;
  lacing1.position.set(motorCenterX + statorLength / 2 + 0.22, motorCenterY, 0);
  stator.add(lacing1);

  registerInteractive(stator, 'stator');
}

// 4. Wound Rotor & Rotating Shaft Assembly
function buildRotorAssembly() {
  const rotor = groups.rotorAssembly;
  rotor.userData = { id: 'rotor', name: '3-Phase Wound Rotor & Shaft' };

  const motorCenterY = 1.8;
  const motorCenterX = -2.2;
  const shaftLength = 7.8;
  const shaftRadius = 0.22;

  // Main Hardened Steel Shaft
  const shaftGeo = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 32);
  const shaft = new THREE.Mesh(shaftGeo, MATS.steelShaft);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.set(motorCenterX + 0.8, motorCenterY, 0);
  shaft.castShadow = true;
  rotor.add(shaft);

  // Rotor Laminated Cylindrical Core (70mm active length)
  const rotorCoreLength = 2.4;
  const rotorRadius = 0.63; // ~68.4mm dia
  const rotorCoreGeo = new THREE.CylinderGeometry(rotorRadius, rotorRadius, rotorCoreLength, 36);
  const rotorCore = new THREE.Mesh(rotorCoreGeo, MATS.laminatedSteel);
  rotorCore.rotation.z = Math.PI / 2;
  rotorCore.position.set(motorCenterX, motorCenterY, 0);
  rotorCore.castShadow = true;
  rotor.add(rotorCore);

  // Embedded Rotor 3-Phase Copper Windings (Semi-skewed slots)
  const rotorSlotCount = 18;
  for (let i = 0; i < rotorSlotCount; i++) {
    const angle = (i / rotorSlotCount) * Math.PI * 2;
    const barGeo = new THREE.BoxGeometry(rotorCoreLength * 1.05, 0.09, 0.07);
    const bar = new THREE.Mesh(barGeo, MATS.copperWinding);
    bar.position.set(
      motorCenterX,
      motorCenterY + Math.sin(angle) * (rotorRadius - 0.04),
      Math.cos(angle) * (rotorRadius - 0.04)
    );
    bar.rotation.x = -angle;
    // Skew angle for harmonic reduction
    bar.rotation.y = 0.05;
    rotor.add(bar);
  }

  // Rotor End Overhang Windings (Star connection)
  const rOverhangGeo = new THREE.TorusGeometry(rotorRadius - 0.12, 0.12, 12, 24);
  const rOverhangDE = new THREE.Mesh(rOverhangGeo, MATS.copperWinding);
  rOverhangDE.rotation.y = Math.PI / 2;
  rOverhangDE.position.set(motorCenterX + rotorCoreLength / 2 + 0.12, motorCenterY, 0);
  rotor.add(rOverhangDE);

  const rOverhangNDE = rOverhangDE.clone();
  rOverhangNDE.position.x = motorCenterX - rotorCoreLength / 2 - 0.12;
  rotor.add(rOverhangNDE);

  // 3-Phase Rotor Leads along the shaft keyway towards slip rings
  for (let k = 0; k < 3; k++) {
    const leadAngle = (k / 3) * Math.PI * 2;
    const leadGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
    const lead = new THREE.Mesh(leadGeo, MATS.copperWinding);
    lead.rotation.z = Math.PI / 2;
    lead.position.set(
      motorCenterX - rotorCoreLength / 2 - 0.7,
      motorCenterY + Math.sin(leadAngle) * (shaftRadius + 0.04),
      Math.cos(leadAngle) * (shaftRadius + 0.04)
    );
    rotor.add(lead);
  }

  // Three Polished Brass Slip Rings on insulating sleeve
  const ringWidth = 0.22;
  const ringRadius = 0.46;
  const ringOffsets = [-2.8, -3.2, -3.6];
  ringOffsets.forEach((xOff, idx) => {
    const ringGeo = new THREE.CylinderGeometry(ringRadius, ringRadius, ringWidth, 32);
    const ring = new THREE.Mesh(ringGeo, MATS.brassSlipRing);
    ring.rotation.z = Math.PI / 2;
    ring.position.set(motorCenterX + xOff + 0.8, motorCenterY, 0);
    rotor.add(ring);

    // Insulating separator discs
    const discGeo = new THREE.CylinderGeometry(ringRadius + 0.06, ringRadius + 0.06, 0.06, 24);
    const disc = new THREE.Mesh(discGeo, MATS.elastomerSpider);
    disc.rotation.z = Math.PI / 2;
    disc.position.set(motorCenterX + xOff + 0.8 - ringWidth / 2 - 0.03, motorCenterY, 0);
    rotor.add(disc);
  });

  // Deep groove ball bearings (6204 DE, 6202 NDE)
  const bearingGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.28, 24);
  const deBearing = new THREE.Mesh(bearingGeo, MATS.steelShaft);
  deBearing.rotation.z = Math.PI / 2;
  deBearing.position.set(motorCenterX + 1.8, motorCenterY, 0);
  rotor.add(deBearing);

  // Cooling fan at NDE
  const fanHubGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 16);
  const fanHub = new THREE.Mesh(fanHubGeo, MATS.elastomerSpider);
  fanHub.rotation.z = Math.PI / 2;
  fanHub.position.set(motorCenterX - 3.4, motorCenterY, 0);
  rotor.add(fanHub);

  for (let b = 0; b < 8; b++) {
    const bladeAngle = (b / 8) * Math.PI * 2;
    const bladeGeo = new THREE.BoxGeometry(0.28, 0.75, 0.04);
    const blade = new THREE.Mesh(bladeGeo, MATS.elastomerSpider);
    blade.position.set(
      motorCenterX - 3.4,
      motorCenterY + Math.sin(bladeAngle) * 0.7,
      Math.cos(bladeAngle) * 0.7
    );
    blade.rotation.x = -bladeAngle;
    blade.rotation.z = 0.2;
    rotor.add(blade);
  }

  rotatingElements.push(rotor);
  registerInteractive(rotor, 'rotor');
}

// 5. Stationary Slip Ring Carbon Brush Holders & Terminal Block
function buildSlipRingStationaryGear() {
  const gear = groups.slipRingAssembly;
  gear.userData = { id: 'sliprings', name: 'Slip Rings & Carbon Brushes' };

  const motorCenterY = 1.8;
  const motorCenterX = -2.2;
  const ringOffsets = [-2.8, -3.2, -3.6];

  // Brush holder support bracket
  const bracketGeo = new THREE.BoxGeometry(1.4, 0.15, 0.4);
  const bracket = new THREE.Mesh(bracketGeo, MATS.baseplateSteel);
  bracket.position.set(motorCenterX - 2.4, motorCenterY + 0.85, 0);
  gear.add(bracket);

  ringOffsets.forEach(xOff => {
    const posX = motorCenterX + xOff + 0.8;
    // Brass Brush Guide Box
    const holderGeo = new THREE.BoxGeometry(0.18, 0.35, 0.22);
    const holder = new THREE.Mesh(holderGeo, MATS.brassSlipRing);
    holder.position.set(posX, motorCenterY + 0.65, 0);
    gear.add(holder);

    // Carbon Brush Block riding on slip ring
    const brushGeo = new THREE.BoxGeometry(0.14, 0.28, 0.18);
    const brush = new THREE.Mesh(brushGeo, MATS.carbonBrush);
    brush.position.set(posX, motorCenterY + 0.48, 0);
    gear.add(brush);

    // Copper Flexible Pigtail Lead
    const pigtailGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6);
    const pigtail = new THREE.Mesh(pigtailGeo, MATS.copperWinding);
    pigtail.position.set(posX, motorCenterY + 0.8, 0.08);
    pigtail.rotation.x = 0.3;
    gear.add(pigtail);
  });

  registerInteractive(gear, 'sliprings');
}

// 6. IP55 Terminal Box on Top of Motor
function buildTerminalBox() {
  const tbox = groups.terminalBox;
  tbox.userData = { id: 'casing', name: 'IP55 Terminal Box' };

  const motorCenterY = 1.8;
  const motorCenterX = -2.2;

  // Box lower body
  const boxBodyGeo = new THREE.BoxGeometry(1.4, 0.7, 1.2);
  const boxBody = new THREE.Mesh(boxBodyGeo, MATS.terminalBox);
  boxBody.position.set(motorCenterX + 0.2, motorCenterY + 1.75, 0);
  boxBody.castShadow = true;
  tbox.add(boxBody);

  // Lid with 4 corner screws
  const lidGeo = new THREE.BoxGeometry(1.48, 0.1, 1.28);
  const lid = new THREE.Mesh(lidGeo, MATS.terminalBox);
  lid.position.set(motorCenterX + 0.2, motorCenterY + 2.15, 0);
  tbox.add(lid);

  // Cable Entry Gland
  const glandGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.35, 16);
  const gland = new THREE.Mesh(glandGeo, MATS.steelShaft);
  gland.rotation.x = Math.PI / 2;
  gland.position.set(motorCenterX + 0.2, motorCenterY + 1.75, 0.7);
  tbox.add(gland);

  // 6 Internal Brass Stud Terminals (U1, V1, W1, U2, V2, W2)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      const studGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 8);
      const stud = new THREE.Mesh(studGeo, MATS.brassSlipRing);
      stud.position.set(motorCenterX - 0.25 + c * 0.25, motorCenterY + 1.9, -0.2 + r * 0.4);
      tbox.add(stud);
    }
  }

  registerInteractive(tbox, 'casing');
}

// 7. Flexible Mechanical Jaw Coupling
function buildCoupling() {
  const coupling = groups.coupling;
  coupling.userData = { id: 'coupling', name: 'Flexible Jaw Coupling' };

  const centerY = 1.8;
  const couplingCenterX = 1.0;

  // Motor Side Hub
  const hub1Geo = new THREE.CylinderGeometry(0.65, 0.65, 0.6, 24);
  const hub1 = new THREE.Mesh(hub1Geo, MATS.couplingAluminum);
  hub1.rotation.z = Math.PI / 2;
  hub1.position.set(couplingCenterX - 0.35, centerY, 0);
  coupling.add(hub1);

  // Pump Side Hub
  const hub2Geo = new THREE.CylinderGeometry(0.65, 0.65, 0.6, 24);
  const hub2 = new THREE.Mesh(hub2Geo, MATS.couplingAluminum);
  hub2.rotation.z = Math.PI / 2;
  hub2.position.set(couplingCenterX + 0.35, centerY, 0);
  coupling.add(hub2);

  // Interlocking Jaws (3 pairs)
  for (let j = 0; j < 3; j++) {
    const angle = (j / 3) * Math.PI * 2;
    const jawGeo = new THREE.BoxGeometry(0.35, 0.22, 0.18);
    const jaw1 = new THREE.Mesh(jawGeo, MATS.couplingAluminum);
    jaw1.position.set(couplingCenterX - 0.08, centerY + Math.sin(angle) * 0.42, Math.cos(angle) * 0.42);
    coupling.add(jaw1);

    const jaw2 = new THREE.Mesh(jawGeo, MATS.couplingAluminum);
    jaw2.position.set(couplingCenterX + 0.08, centerY + Math.sin(angle + Math.PI / 3) * 0.42, Math.cos(angle + Math.PI / 3) * 0.42);
    coupling.add(jaw2);
  }

  // Polyurethane Elastomer Spider Insert (Black Dampening Element)
  const spiderGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.22, 24);
  const spider = new THREE.Mesh(spiderGeo, MATS.elastomerSpider);
  spider.rotation.z = Math.PI / 2;
  spider.position.set(couplingCenterX, centerY, 0);
  coupling.add(spider);

  rotatingElements.push(coupling);
  registerInteractive(coupling, 'coupling');
}

// 8. Centrifugal Water Pump (Cast Iron Volute Casing & Impeller)
function buildCentrifugalPump() {
  const pumpCasing = groups.pumpCasing;
  pumpCasing.userData = { id: 'pump', name: 'Centrifugal Pump Volute' };

  const pumpImpeller = groups.pumpImpeller;
  pumpImpeller.userData = { id: 'pump', name: 'Centrifugal Pump Impeller' };

  const pumpY = 1.8;
  const pumpX = 3.6;

  // Pump Bearing Pedestal & Foot Support
  const pedestalGeo = new THREE.BoxGeometry(1.6, 1.3, 1.0);
  const pedestal = new THREE.Mesh(pedestalGeo, MATS.redPumpPaint);
  pedestal.position.set(pumpX - 1.0, pumpY - 0.65, 0);
  pedestal.castShadow = true;
  pumpCasing.add(pedestal);

  // Pump Shaft running from coupling to impeller
  const pumpShaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.2, 24);
  const pumpShaft = new THREE.Mesh(pumpShaftGeo, MATS.steelShaft);
  pumpShaft.rotation.z = Math.PI / 2;
  pumpShaft.position.set(pumpX - 0.4, pumpY, 0);
  pumpImpeller.add(pumpShaft);

  // Spiral Volute Outer Casing (3/4 Cutaway showing internal spiral & impeller)
  const voluteRadius = 1.45;
  const voluteWidth = 1.1;
  const voluteGeo = new THREE.CylinderGeometry(voluteRadius, voluteRadius, voluteWidth, 36, 1, false, Math.PI * 0.35, Math.PI * 1.35);
  const voluteMesh = new THREE.Mesh(voluteGeo, MATS.redPumpPaint);
  voluteMesh.rotation.z = Math.PI / 2;
  voluteMesh.position.set(pumpX + 0.8, pumpY, 0);
  voluteMesh.castShadow = true;
  pumpCasing.add(voluteMesh);

  // Internal Volute Cavity backplate
  const backplateGeo = new THREE.CylinderGeometry(voluteRadius * 0.95, voluteRadius * 0.95, 0.15, 32);
  const backplate = new THREE.Mesh(backplateGeo, MATS.redPumpCutaway);
  backplate.rotation.z = Math.PI / 2;
  backplate.position.set(pumpX + 0.3, pumpY, 0);
  pumpCasing.add(backplate);

  // Flanged Horizontal Suction Port (Axial Inlet)
  const suctionPipeGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 24);
  const suctionPipe = new THREE.Mesh(suctionPipeGeo, MATS.redPumpPaint);
  suctionPipe.rotation.z = Math.PI / 2;
  suctionPipe.position.set(pumpX + 1.8, pumpY, 0);
  pumpCasing.add(suctionPipe);

  // Suction Flange Ring (DN32 with 4 bolt holes)
  const suctionFlangeGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.22, 24);
  const suctionFlange = new THREE.Mesh(suctionFlangeGeo, MATS.redPumpPaint);
  suctionFlange.rotation.z = Math.PI / 2;
  suctionFlange.position.set(pumpX + 2.4, pumpY, 0);
  pumpCasing.add(suctionFlange);

  // Flanged Vertical Discharge Port (Radial Outlet on top)
  const dischPipeGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.3, 24);
  const dischPipe = new THREE.Mesh(dischPipeGeo, MATS.redPumpPaint);
  dischPipe.position.set(pumpX + 0.8, pumpY + 1.35, 0);
  pumpCasing.add(dischPipe);

  // Discharge Flange Ring (DN25)
  const dischFlangeGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.2, 24);
  const dischFlange = new THREE.Mesh(dischFlangeGeo, MATS.redPumpPaint);
  dischFlange.position.set(pumpX + 0.8, pumpY + 2.0, 0);
  pumpCasing.add(dischFlange);

  // --- Rotating Impeller (Bronze Closed Impeller with 6 Backward Curved Vanes) ---
  const impellerRadius = 1.05;
  const impellerShroudGeo = new THREE.CylinderGeometry(impellerRadius, impellerRadius, 0.08, 32);
  const impellerShroud = new THREE.Mesh(impellerShroudGeo, MATS.bronzeImpeller);
  impellerShroud.rotation.z = Math.PI / 2;
  impellerShroud.position.set(pumpX + 0.55, pumpY, 0);
  pumpImpeller.add(impellerShroud);

  // Impeller Suction Eye & Hub
  const hubConeGeo = new THREE.ConeGeometry(0.35, 0.35, 16);
  const hubCone = new THREE.Mesh(hubConeGeo, MATS.bronzeImpeller);
  hubCone.rotation.z = -Math.PI / 2;
  hubCone.position.set(pumpX + 0.72, pumpY, 0);
  pumpImpeller.add(hubCone);

  // 6 Backward Curved Vanes
  const vaneCount = 6;
  for (let v = 0; v < vaneCount; v++) {
    const vAngle = (v / vaneCount) * Math.PI * 2;
    const vaneCurve = new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8);
    const vane = new THREE.Mesh(vaneCurve, MATS.bronzeImpeller);
    vane.position.set(
      pumpX + 0.7,
      pumpY + Math.sin(vAngle) * 0.6,
      Math.cos(vAngle) * 0.6
    );
    vane.rotation.x = -vAngle + 0.45;
    vane.rotation.y = 0.2;
    pumpImpeller.add(vane);
  }

  rotatingElements.push(pumpImpeller);
  registerInteractive(pumpCasing, 'pump');
  registerInteractive(pumpImpeller, 'pump');
}

// 9. Water Flow Particles & Electromagnetic Flux Visualizer
let flowParticles, fluxLines;

function buildSimulations() {
  // Water Flow Particles (Suction In -> Volute Rotation -> Discharge Out)
  const pCount = 280;
  const pGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(pCount * 3);
  const pVelocities = [];

  for (let i = 0; i < pCount; i++) {
    // initialize along pump suction path
    const stage = Math.random();
    let x, y, z;
    if (stage < 0.35) {
      // suction inlet line
      x = 5.8 - Math.random() * 2.0;
      y = 1.8 + (Math.random() - 0.5) * 0.4;
      z = (Math.random() - 0.5) * 0.4;
    } else if (stage < 0.75) {
      // volute spin
      const theta = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 0.8;
      x = 4.4 + (Math.random() - 0.5) * 0.25;
      y = 1.8 + Math.sin(theta) * r;
      z = Math.cos(theta) * r;
    } else {
      // discharge vertical
      x = 4.4 + (Math.random() - 0.5) * 0.3;
      y = 2.0 + Math.random() * 1.8;
      z = (Math.random() - 0.5) * 0.3;
    }

    pPositions[i * 3] = x;
    pPositions[i * 3 + 1] = y;
    pPositions[i * 3 + 2] = z;

    pVelocities.push({
      progress: Math.random(),
      speed: 0.008 + Math.random() * 0.012,
      angle: Math.random() * Math.PI * 2
    });
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x00e5ff,
    size: 0.14,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  flowParticles = new THREE.Points(pGeo, pMat);
  flowParticles.userData.velocities = pVelocities;
  scene.add(flowParticles);

  // Rotating EM Flux Rings inside Motor Air Gap
  fluxLines = new THREE.Group();
  for (let f = 0; f < 4; f++) {
    const ringGeo = new THREE.TorusGeometry(0.85 + f * 0.12, 0.015, 8, 36);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-2.2 - 0.6 + f * 0.4, 1.8, 0);
    fluxLines.add(ring);
  }
  scene.add(fluxLines);
}

// 10. Interactive Hotspot Annotation Markers
const hotspots = [
  { id: 'stator', label: '24-Slot Stator Core & 24 SWG Windings', pos: new THREE.Vector3(-2.2, 3.2, 0) },
  { id: 'rotor', label: '3-Phase Wound Rotor Core (70mm)', pos: new THREE.Vector3(-1.4, 1.8, 0.8) },
  { id: 'sliprings', label: '3 Brass Slip Rings & Carbon Brushes', pos: new THREE.Vector3(-4.6, 2.5, 0.3) },
  { id: 'coupling', label: 'Flexible Mechanical Jaw Coupling', pos: new THREE.Vector3(1.0, 2.6, 0.6) },
  { id: 'pump', label: 'Cast-Iron Volute & Bronze Impeller', pos: new THREE.Vector3(4.4, 3.0, 0.6) },
  { id: 'baseplate', label: 'Structural Steel Baseplate', pos: new THREE.Vector3(0, 0.4, 1.6) }
];

const labelsContainer = document.getElementById('labels-container');
const hotspotElements = [];

function createHotspots() {
  labelsContainer.innerHTML = '';
  hotspots.forEach((hs, idx) => {
    const el = document.createElement('div');
    el.className = 'hotspot-label';
    el.innerHTML = `
      <div class="hotspot-pin">${idx + 1}</div>
      <div class="hotspot-tag">${hs.label}</div>
    `;
    el.addEventListener('click', () => {
      selectComponent(hs.id);
      focusCameraOn(hs.pos);
    });
    labelsContainer.appendChild(el);
    hotspotElements.push({ el, pos: hs.pos, id: hs.id });
  });
}

function updateHotspots() {
  if (!STATE.showLabels) {
    labelsContainer.style.display = 'none';
    return;
  }
  labelsContainer.style.display = 'block';

  hotspotElements.forEach(item => {
    const screenPos = item.pos.clone().project(camera);
    // Check if behind camera
    if (screenPos.z > 1) {
      item.el.style.opacity = '0';
      return;
    }
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
    item.el.style.left = `${x}px`;
    item.el.style.top = `${y}px`;
    item.el.style.opacity = '1';
  });
}

// --- Interactive Selection & Raycasting ---
function registerInteractive(obj, id) {
  obj.traverse(child => {
    if (child.isMesh) {
      child.userData.componentId = id;
      interactiveObjects.push(child);
    }
  });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
  if (e.target.closest('.control-deck') || e.target.closest('.hud-panel') || e.target.closest('.view-preset-bar') || e.target.closest('.hotspot-label')) {
    return;
  }

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, true);

  if (intersects.length > 0) {
    const hitObj = intersects[0].object;
    const compId = hitObj.userData.componentId;
    if (compId) {
      selectComponent(compId);
    }
  }
});

function selectComponent(id) {
  const data = COMPONENT_DATA[id];
  if (!data) return;

  STATE.selectedComponent = id;
  const panel = document.getElementById('detail-panel');
  panel.classList.remove('hidden');

  document.getElementById('hud-category').textContent = data.category;
  document.getElementById('hud-name').textContent = data.name;
  document.getElementById('hud-desc').textContent = data.desc;

  const specsGrid = document.getElementById('hud-specs');
  specsGrid.innerHTML = data.specs.map(s => `
    <div class="spec-item">
      <span class="label">${s.label}</span>
      <span class="val">${s.val}</span>
    </div>
  `).join('');

  // Subtle highlight pulse
  highlightComponent(id);
}

let activeHighlightTween = null;
function highlightComponent(id) {
  interactiveObjects.forEach(mesh => {
    if (mesh.userData.componentId === id) {
      if (mesh.material.emissive) {
        mesh.material.emissive.setHex(0x004488);
        setTimeout(() => {
          if (mesh.material.emissive) mesh.material.emissive.setHex(0x000000);
        }, 800);
      }
    }
  });
}

// --- Camera View Transitions ---
function focusCameraOn(targetPos) {
  const startCamPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endTarget = targetPos.clone();
  const endCamPos = targetPos.clone().add(new THREE.Vector3(7, 4, 7));

  let t = 0;
  const anim = () => {
    t += 0.04;
    camera.position.lerpVectors(startCamPos, endCamPos, easeOutQuad(t));
    controls.target.lerpVectors(startTarget, endTarget, easeOutQuad(t));
    if (t < 1) requestAnimationFrame(anim);
  };
  anim();
}

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

const VIEW_PRESETS = {
  isometric: { cam: [14, 9, 14], target: [0, 1.2, 0] },
  cutaway: { cam: [-1.2, 3.2, 8.5], target: [-2.0, 1.8, 0] },
  sliprings: { cam: [-6.8, 3.5, 4.2], target: [-4.4, 1.8, 0] },
  coupling: { cam: [1.2, 3.5, 5.0], target: [1.0, 1.8, 0] },
  pump: { cam: [7.2, 4.0, 6.0], target: [3.8, 1.8, 0] }
};

function switchView(viewName) {
  const p = VIEW_PRESETS[viewName];
  if (!p) return;

  const startCam = camera.position.clone();
  const startTar = controls.target.clone();
  const endCam = new THREE.Vector3(...p.cam);
  const endTar = new THREE.Vector3(...p.target);

  let t = 0;
  const anim = () => {
    t += 0.035;
    camera.position.lerpVectors(startCam, endCam, easeOutQuad(t));
    controls.target.lerpVectors(startTar, endTar, easeOutQuad(t));
    if (t < 1) requestAnimationFrame(anim);
  };
  anim();
}

// --- UI Event Handlers ---
function setupUI() {
  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchView(btn.dataset.view);
    });
  });

  // Power Button
  const btnPower = document.getElementById('btn-power');
  const powerText = document.getElementById('power-text');
  const statusPill = document.getElementById('status-pill');

  btnPower.addEventListener('click', () => {
    STATE.isRunning = !STATE.isRunning;
    if (STATE.isRunning) {
      powerText.textContent = 'Stop';
      btnPower.classList.add('primary');
      statusPill.innerHTML = '<span class="pulse-dot"></span> RUNNING';
      statusPill.style.color = 'var(--accent-green)';
    } else {
      powerText.textContent = 'Start';
      btnPower.classList.remove('primary');
      statusPill.innerHTML = '<i class="fa-solid fa-circle-stop"></i> STOPPED';
      statusPill.style.color = 'var(--accent-red)';
    }
  });

  // RPM Slider
  const rpmSlider = document.getElementById('rpm-slider');
  const rpmVal = document.getElementById('rpm-val');
  const headerRpm = document.getElementById('header-rpm');

  rpmSlider.addEventListener('input', (e) => {
    STATE.rpm = parseInt(e.target.value);
    rpmVal.textContent = STATE.rpm;
    headerRpm.textContent = STATE.rpm;
    if (STATE.rpm === 0 && STATE.isRunning) {
      btnPower.click();
    } else if (STATE.rpm > 0 && !STATE.isRunning) {
      btnPower.click();
    }
  });

  // Exploded View Slider
  const explodeSlider = document.getElementById('explode-slider');
  const explodeVal = document.getElementById('explode-val');

  explodeSlider.addEventListener('input', (e) => {
    STATE.explodeFactor = parseInt(e.target.value) / 100;
    explodeVal.textContent = `${e.target.value}%`;
    applyExplode(STATE.explodeFactor);
  });

  // Cutaway Depth Slider
  const cutawaySlider = document.getElementById('cutaway-slider');
  const cutawayVal = document.getElementById('cutaway-val');

  cutawaySlider.addEventListener('input', (e) => {
    STATE.cutawayFactor = parseInt(e.target.value) / 100;
    cutawayVal.textContent = `${e.target.value}%`;
    // Scale or adjust cutaway visibility
    groups.motorCasing.visible = STATE.cutawayFactor < 0.95;
    groups.pumpCasing.visible = STATE.cutawayFactor < 0.95;
  });

  // Toggle Buttons
  setupToggle('btn-flow', () => {
    STATE.showFlow = !STATE.showFlow;
    if (flowParticles) flowParticles.visible = STATE.showFlow;
  });

  setupToggle('btn-flux', () => {
    STATE.showFlux = !STATE.showFlux;
    if (fluxLines) fluxLines.visible = STATE.showFlux;
  });

  setupToggle('btn-wireframe', () => {
    STATE.wireframe = !STATE.wireframe;
    scene.traverse(node => {
      if (node.isMesh && node.material) {
        node.material.wireframe = STATE.wireframe;
      }
    });
  });

  setupToggle('btn-labels', () => {
    STATE.showLabels = !STATE.showLabels;
    updateHotspots();
  });

  setupToggle('btn-autorotate', () => {
    STATE.autoRotate = !STATE.autoRotate;
    controls.autoRotate = STATE.autoRotate;
    controls.autoRotateSpeed = 1.2;
  });

  // Close HUD
  document.getElementById('close-hud-btn').addEventListener('click', () => {
    document.getElementById('detail-panel').classList.add('hidden');
  });
}

function setupToggle(btnId, callback) {
  const btn = document.getElementById(btnId);
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    callback();
  });
}

// Exploded View Displacements
function applyExplode(factor) {
  // Displace along X / Y axes
  groups.baseplate.position.y = -factor * 1.5;
  groups.motorCasing.position.set(0, factor * 2.2, 0);
  groups.statorCore.position.set(0, factor * 1.2, 0);
  groups.terminalBox.position.set(0, factor * 3.5, 0);
  groups.slipRingAssembly.position.set(-factor * 4.0, 0, 0);
  groups.coupling.position.set(factor * 1.2, 0, 0);
  groups.pumpCasing.position.set(factor * 3.8, factor * 0.8, 0);
  groups.pumpImpeller.position.set(factor * 3.8, factor * 0.8, 0);
}

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Rotate rotor, shaft, coupling, and pump impeller
  if (STATE.isRunning && STATE.rpm > 0) {
    const rotationSpeed = (STATE.rpm / 60) * Math.PI * 2 * delta;
    rotatingElements.forEach(elem => {
      elem.rotation.x += rotationSpeed;
    });
  }

  // Animate Water Flow Particles
  if (STATE.showFlow && flowParticles) {
    const posAttr = flowParticles.geometry.attributes.position;
    const vels = flowParticles.userData.velocities;
    const speedMult = STATE.isRunning ? (STATE.rpm / 1420) : 0.05;

    for (let i = 0; i < vels.length; i++) {
      const v = vels[i];
      v.progress += v.speed * speedMult;
      if (v.progress > 1.0) v.progress = 0;

      let x, y, z;
      const prog = v.progress;
      if (prog < 0.35) {
        // suction stage: flow in towards pump center from right (X: 5.8 -> 4.4)
        const t = prog / 0.35;
        x = 5.8 - t * 1.4;
        y = 1.8 + Math.sin(t * Math.PI * 2 + v.angle) * 0.18;
        z = Math.cos(t * Math.PI * 2 + v.angle) * 0.18;
      } else if (prog < 0.75) {
        // spiral volute acceleration stage
        const t = (prog - 0.35) / 0.4;
        const theta = v.angle + t * Math.PI * 4;
        const r = 0.35 + t * 0.75;
        x = 4.4 + Math.sin(t * Math.PI) * 0.12;
        y = 1.8 + Math.sin(theta) * r;
        z = Math.cos(theta) * r;
      } else {
        // discharge stage: jet upward out of vertical port (Y: 2.0 -> 3.8)
        const t = (prog - 0.75) / 0.25;
        x = 4.4 + Math.sin(v.angle) * 0.12;
        y = 1.8 + 0.8 + t * 1.5;
        z = Math.cos(v.angle) * 0.12;
      }

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  }

  // Animate Electromagnetic Flux Rings
  if (STATE.showFlux && fluxLines) {
    fluxLines.children.forEach((ring, idx) => {
      ring.rotation.x = time * 2.5 + idx * 0.5;
      const pulse = 0.4 + 0.3 * Math.sin(time * 6 + idx);
      ring.material.opacity = pulse;
    });
  }

  controls.update();
  updateHotspots();
  renderer.render(scene, camera);
}

// --- Window Resize Listener ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Initialize Everything ---
function init() {
  setupLights();
  buildBaseplate();
  buildMotorCasing();
  buildStatorCore();
  buildRotorAssembly();
  buildSlipRingStationaryGear();
  buildTerminalBox();
  buildCoupling();
  buildCentrifugalPump();
  buildSimulations();
  createHotspots();
  setupUI();

  // Hide loader
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
  }, 400);

  animate();
}

init();
