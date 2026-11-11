import * as THREE from 'three';

/**
 * WEREWOLF (MA SÓI) — 3D PROCEDURAL CHARACTER (THREE.JS)
 * Strictly calibrated to Target Concept (Image 1):
 * 1. Zero Z-Fighting: Every layered mesh offset >= 0.02; polygonOffset enabled on all overlays.
 * 2. Massive Arched Hunchback & Dorsal Fur Ridges (Y = 0.65 to 1.04) towering above head and ears.
 * 3. Seamless Muscular Shoulders (X = ±0.28, Y = 0.70) with Overlapping Deltoid Caps (NO gaps!).
 * 4. Curved Predator Arms with Elbow Spikes & 4 Long Curved Ivory Pyramid Claws.
 * 5. Narrow Feral Wolf Skull with Long Protruding Snout (length 0.20, Z = 0.20 to 0.40),
 *    Open Snarling Maw with Fangs & High-Contrast Light-Gray Chest Mane (#6e6875).
 * 6. Wide Bow-Legged Digitigrade Stance (knees at X = ±0.25, 120° dog-leg hock, wide paws at X = ±0.26).
 * 7. Integrated Stylized Campfire between paws with warm upward fire illumination.
 */

export const WOLF_DEFAULT_COLORS = {
  darkFur:      '#282633', // Dark Dorsal Fur, Hump Spikes & Fur Scales
  primaryFur:   '#3e3b4a', // Main Body, Arms & Thighs Fur (Visible dark slate gray with rich facet contrast)
  snoutFur:     '#4f4b5d', // Snout Bridge & Brow Wedge
  chestMane:    '#7c7688', // Chest Mane & Lower Jaw Ruff (High-contrast Ash Slate Gray)
  nose:         '#16151a', // Black Nose Tip
  eyes:         '#ff261b', // Glowing Red Eyes
  mouthInner:   '#420909', // Deep Crimson Mouth Cavity
  teeth:        '#e8e5e2', // Bone Ivory Fangs & Incisors
  claws:        '#e8e5e2', // Bone Ivory Claws (Hand & Foot)
  footPads:     '#282631', // Paw Pads
  fireAmber:    '#ff7b24', // Outer Fire (unused)
  fireYellow:   '#ffdf40'  // Inner Fire (unused)
};

/**
 * Utility: Converts any geometry to flat-faceted non-indexed geometry with crisp face normals
 */
export function makeFlat(geo) {
  const nonIndexed = geo.toNonIndexed ? geo.toNonIndexed() : geo;
  nonIndexed.computeVertexNormals();
  return nonIndexed;
}

/**
 * Utility: Creates a tapered curved 3D talon/claw with downward curl
 */
export function createCurvedClawGeometry(baseRadius = 0.022, length = 0.14, curveAmount = 0.065, radialSegments = 5) {
  const steps = 5;
  const vertices = [];
  const indices = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = baseRadius * Math.pow(1 - t, 0.75);
    const zOffset = t * length;
    const yOffset = -Math.pow(t, 1.8) * curveAmount;

    for (let j = 0; j < radialSegments; j++) {
      const angle = (j / radialSegments) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r + yOffset;
      const z = zOffset;
      vertices.push(x, y, z);
    }
  }

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const nextJ = (j + 1) % radialSegments;
      const r0 = i * radialSegments;
      const r1 = (i + 1) * radialSegments;

      const a = r0 + j;
      const b = r0 + nextJ;
      const c = r1 + nextJ;
      const d = r1 + j;

      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  // Base cap
  const baseCenterIdx = vertices.length / 3;
  vertices.push(0, 0, 0);
  for (let j = 0; j < radialSegments; j++) {
    const nextJ = (j + 1) % radialSegments;
    indices.push(baseCenterIdx, nextJ, j);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Procedural builder for Werewolf 3D character
 */
export function createWerewolfModel(customColors = {}) {
  const colors = { ...WOLF_DEFAULT_COLORS, ...customColors };

  // ==========================================
  // 1. MATERIALS (Matte Shading + Polygon Offset on Overlays)
  // ==========================================
  const darkFurMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.darkFur),
    roughness: 0.90,
    metalness: 0.08,
    flatShading: true
  });

  const primaryFurMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.primaryFur),
    roughness: 0.90,
    metalness: 0.08,
    flatShading: true
  });

  const snoutFurMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.snoutFur),
    roughness: 0.90,
    metalness: 0.08,
    flatShading: true
  });

  // Chest Mane multi-tone silver materials for dense, soft, thick wolf fur
  const chestManeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.chestMane),
    roughness: 0.88,
    metalness: 0.06,
    flatShading: true,
    polygonOffset: true,
    polygonOffsetFactor: -1.5,
    polygonOffsetUnits: -1.5,
    side: THREE.DoubleSide
  });

  const maneSilverMat = new THREE.MeshStandardMaterial({
    color: 0x9e99a8, // Light frosted silver highlights
    roughness: 0.82,
    metalness: 0.05,
    flatShading: true,
    polygonOffset: true,
    polygonOffsetFactor: -2.0,
    polygonOffsetUnits: -2.0,
    side: THREE.DoubleSide
  });

  const maneDarkMat = new THREE.MeshStandardMaterial({
    color: 0x5a5464, // Deep shadow under-layer fur
    roughness: 0.92,
    metalness: 0.08,
    flatShading: true,
    polygonOffset: true,
    polygonOffsetFactor: -1.0,
    polygonOffsetUnits: -1.0,
    side: THREE.DoubleSide
  });

  const noseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.nose),
    roughness: 0.95,
    metalness: 0.02,
    flatShading: true
  });

  const eyeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.eyes),
    side: THREE.DoubleSide
  });

  const mouthInnerMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.mouthInner),
    side: THREE.DoubleSide
  });

  const teethMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.teeth),
    roughness: 0.45,
    metalness: 0.05,
    flatShading: true
  });

  const clawsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.claws),
    roughness: 0.45,
    metalness: 0.05,
    flatShading: true
  });

  const footPadsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.footPads),
    roughness: 0.90,
    metalness: 0.08,
    flatShading: true
  });

  const fireAmberMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.fireAmber),
    side: THREE.DoubleSide
  });

  const fireYellowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.fireYellow),
    side: THREE.DoubleSide
  });

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x222028,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true
  });

  // Root Group (Normalized H ≈ 1.0, feet at Y = 0.00)
  const rootGroup = new THREE.Group();
  rootGroup.name = "WerewolfCharacter";

  // ==========================================
  // 2. TORSO, MASSIVE HUNCHBACK & DORSAL SPIKES
  // ==========================================
  const spineGroup = new THREE.Group();
  spineGroup.name = "SpineGroup";
  rootGroup.add(spineGroup);

  // 2A. Narrow Waist / Pelvis (Centered at 0, 0.38, -0.02, width X = 0.22, slim depth Z)
  const pelvisGeo = makeFlat(new THREE.CylinderGeometry(0.11, 0.09, 0.12, 6));
  const pelvisMesh = new THREE.Mesh(pelvisGeo, darkFurMat);
  pelvisMesh.position.set(0, 0.38, -0.02);
  pelvisMesh.scale.set(1.0, 1.0, 0.65); // Reduced body thickness along Z
  pelvisMesh.castShadow = true;
  pelvisMesh.receiveShadow = true;
  spineGroup.add(pelvisMesh);

  // 2B. Upper Torso / Ribcage (Slimmer depth Z = 0.62 to prevent covering the mane when breathing)
  const chestGroup = new THREE.Group();
  chestGroup.name = "ChestGroup";
  chestGroup.position.set(0, 0.56, 0.02);
  chestGroup.rotation.x = 0.25; // Tilted forward
  spineGroup.add(chestGroup);

  const chestGeo = makeFlat(new THREE.CylinderGeometry(0.30, 0.16, 0.36, 6));
  const chestMesh = new THREE.Mesh(chestGeo, primaryFurMat);
  chestMesh.scale.set(1.15, 1.0, 0.62); // Lean, athletic ribcage depth (reduced from 0.85)
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  chestGroup.add(chestMesh);

  // 2C. Dense, Luscious Multi-Tier Silver Mane Attached to Front of ChestGroup
  // Positioned proudly in FRONT of chest & cheek mane (Z = 0.205, rotX = -0.15)
  // Clean neckline scooped low (Y = -0.035) so body expansion NEVER penetrates or covers mane.
  const chestManeGroup = new THREE.Group();
  chestManeGroup.name = "ChestManeGroup";
  chestManeGroup.position.set(0, -0.035, 0.205);
  chestManeGroup.rotation.x = -0.15; // Slopes cleanly down, clear of lower jaw

  /**
   * Helper: Creates a detailed multi-blade 3D fur tuft with sharp center ridge
   * and dual staggered dagger tips, giving a soft, plush, thick silver fur appearance.
   */
  function createFineFurTuft(width, length, depth = 0.026, tipBias = 0.0) {
    const hw = width * 0.5;
    const midY = -length * 0.40;
    const tipY = -length;

    // 9 vertices creating a layered multi-blade fur cluster
    const verts = [
      -hw * 0.75, 0.02, -depth * 0.15, // 0: top left base
       hw * 0.75, 0.02, -depth * 0.15, // 1: top right base
       0.00,      0.03,  depth * 0.40, // 2: top center crest
      -hw * 1.05, midY,  depth * 0.15, // 3: left flare blade
       hw * 1.05, midY,  depth * 0.15, // 4: right flare blade
       tipBias * hw, midY, depth,      // 5: center ridge peak
      -hw * 0.28, tipY * 0.82, depth * 0.15, // 6: secondary blade tip
       hw * 0.18, tipY, depth * 0.22, // 7: primary main blade tip
       0.00, midY * 0.8, -depth * 0.25 // 8: back keel
    ];

    const indices = [
      // Upper facets
      0, 2, 3,   2, 5, 3,
      2, 1, 4,   2, 4, 5,
      // Lower split dagger facets (creates fine multi-strand silver fur look!)
      3, 5, 6,
      5, 7, 6,
      5, 4, 7,
      // Cap
      0, 1, 2,
      // Back hull
      0, 3, 8,   1, 8, 4,
      3, 6, 8,   4, 8, 7,
      6, 7, 8,   0, 8, 1
    ];

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    geo.setIndex(indices);
    return makeFlat(geo);
  }

  // Alias / helper for faceted fur shards used on limbs and cheek
  function createFacetedFurShard(width, length, depth = 0.030, flare = 1.0) {
    return createFineFurTuft(width, length, depth, 0.0);
  }

  // Tier 1: High Collar Ruff (curved neckline: low at center under chin, flared forward at sides over cheek mane)
  const tier1Configs = [
    { x: -0.16, y: 0.08, z: 0.018, w: 0.09, h: 0.13, rotZ:  0.55, mat: maneDarkMat },
    { x: -0.10, y: 0.06, z: 0.014, w: 0.09, h: 0.14, rotZ:  0.36, mat: chestManeMat },
    { x: -0.05, y: 0.03, z: 0.008, w: 0.10, h: 0.14, rotZ:  0.18, mat: maneSilverMat },
    { x:  0.00, y: 0.02, z: 0.005, w: 0.10, h: 0.14, rotZ:  0.00, mat: maneSilverMat }, // Scooped low under chin
    { x:  0.05, y: 0.03, z: 0.008, w: 0.10, h: 0.14, rotZ: -0.18, mat: maneSilverMat },
    { x:  0.10, y: 0.06, z: 0.014, w: 0.09, h: 0.14, rotZ: -0.36, mat: chestManeMat },
    { x:  0.16, y: 0.08, z: 0.018, w: 0.09, h: 0.13, rotZ: -0.55, mat: maneDarkMat }
  ];
  tier1Configs.forEach(cfg => {
    const mesh = new THREE.Mesh(createFineFurTuft(cfg.w, cfg.h, 0.024), cfg.mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.rotation.z = cfg.rotZ;
    mesh.castShadow = true;
    chestManeGroup.add(mesh);
  });

  // Tier 2: Upper Pectoral Main Mane (8 layered tufts, alternating ash and silver highlights)
  const tier2Configs = [
    { x: -0.17, y:  0.01, z: 0.016, w: 0.09, h: 0.14, rotZ:  0.45, mat: maneDarkMat },
    { x: -0.11, y: -0.01, z: 0.018, w: 0.10, h: 0.16, rotZ:  0.28, mat: chestManeMat },
    { x: -0.05, y: -0.03, z: 0.018, w: 0.10, h: 0.17, rotZ:  0.14, mat: maneSilverMat },
    { x: -0.01, y: -0.04, z: 0.020, w: 0.11, h: 0.17, rotZ:  0.04, mat: maneSilverMat },
    { x:  0.01, y: -0.04, z: 0.020, w: 0.11, h: 0.17, rotZ: -0.04, mat: maneSilverMat },
    { x:  0.05, y: -0.03, z: 0.018, w: 0.10, h: 0.17, rotZ: -0.14, mat: maneSilverMat },
    { x:  0.11, y: -0.01, z: 0.018, w: 0.10, h: 0.16, rotZ: -0.28, mat: chestManeMat },
    { x:  0.17, y:  0.01, z: 0.016, w: 0.09, h: 0.14, rotZ: -0.45, mat: maneDarkMat }
  ];
  tier2Configs.forEach(cfg => {
    const mesh = new THREE.Mesh(createFineFurTuft(cfg.w, cfg.h, 0.026), cfg.mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.rotation.z = cfg.rotZ;
    mesh.castShadow = true;
    chestManeGroup.add(mesh);
  });

  // Tier 3: Mid Sternum Layer (7 cascading silver tufts with frosted highlights)
  const tier3Configs = [
    { x: -0.13, y: -0.07, z: 0.014, w: 0.09, h: 0.14, rotZ:  0.32, mat: chestManeMat },
    { x: -0.07, y: -0.09, z: 0.018, w: 0.10, h: 0.16, rotZ:  0.18, mat: maneSilverMat },
    { x: -0.03, y: -0.10, z: 0.020, w: 0.10, h: 0.17, rotZ:  0.06, mat: maneSilverMat },
    { x:  0.00, y: -0.11, z: 0.022, w: 0.11, h: 0.17, rotZ:  0.00, mat: maneSilverMat }, // Central crest
    { x:  0.03, y: -0.10, z: 0.020, w: 0.10, h: 0.17, rotZ: -0.06, mat: maneSilverMat },
    { x:  0.07, y: -0.09, z: 0.018, w: 0.10, h: 0.16, rotZ: -0.18, mat: maneSilverMat },
    { x:  0.13, y: -0.07, z: 0.014, w: 0.09, h: 0.14, rotZ: -0.32, mat: chestManeMat }
  ];
  tier3Configs.forEach(cfg => {
    const mesh = new THREE.Mesh(createFineFurTuft(cfg.w, cfg.h, 0.026), cfg.mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.rotation.z = cfg.rotZ;
    mesh.castShadow = true;
    chestManeGroup.add(mesh);
  });

  // Tier 4: Lower Pointed Fringe (5 tapering dagger points towards navel)
  const tier4Configs = [
    { x: -0.08, y: -0.15, z: 0.012, w: 0.08, h: 0.13, rotZ:  0.18, mat: chestManeMat },
    { x: -0.04, y: -0.17, z: 0.016, w: 0.09, h: 0.15, rotZ:  0.08, mat: maneSilverMat },
    { x:  0.00, y: -0.18, z: 0.018, w: 0.10, h: 0.16, rotZ:  0.00, mat: maneSilverMat }, // Sharp bottom spear
    { x:  0.04, y: -0.17, z: 0.016, w: 0.09, h: 0.15, rotZ: -0.08, mat: maneSilverMat },
    { x:  0.08, y: -0.15, z: 0.012, w: 0.08, h: 0.13, rotZ: -0.18, mat: chestManeMat }
  ];
  tier4Configs.forEach(cfg => {
    const mesh = new THREE.Mesh(createFineFurTuft(cfg.w, cfg.h, 0.024), cfg.mat);
    mesh.position.set(cfg.x, cfg.y, cfg.z);
    mesh.rotation.z = cfg.rotZ;
    mesh.castShadow = true;
    chestManeGroup.add(mesh);
  });

  chestGroup.add(chestManeGroup);

  // 2D. Anatomically Sculpted Trapezius & Muscular Upper Back (No Flat Dodecahedron Ball!)
  // Creates two bulging, powerful muscular shoulder blades/traps with central spine groove
  const humpGroup = new THREE.Group();
  humpGroup.name = "HumpGroup";
  humpGroup.position.set(0, 0.77, -0.06);
  rootGroup.add(humpGroup);

  // Left Trapezius Muscle
  const trapGeoL = makeFlat(new THREE.CylinderGeometry(0.14, 0.11, 0.30, 6));
  const trapMeshL = new THREE.Mesh(trapGeoL, darkFurMat);
  trapMeshL.position.set(-0.11, 0.02, -0.01);
  trapMeshL.rotation.set(0.38, 0.15, -0.26);
  trapMeshL.scale.set(1.10, 0.95, 1.15);
  trapMeshL.castShadow = true;
  trapMeshL.receiveShadow = true;
  humpGroup.add(trapMeshL);

  // Right Trapezius Muscle
  const trapGeoR = makeFlat(new THREE.CylinderGeometry(0.14, 0.11, 0.30, 6));
  const trapMeshR = new THREE.Mesh(trapGeoR, darkFurMat);
  trapMeshR.position.set(0.11, 0.02, -0.01);
  trapMeshR.rotation.set(0.38, -0.15, 0.26);
  trapMeshR.scale.set(1.10, 0.95, 1.15);
  trapMeshR.castShadow = true;
  trapMeshR.receiveShadow = true;
  humpGroup.add(trapMeshR);

  // Central Muscular Spine Core (recessed furrow between the two bulging traps)
  const spineCoreGeo = makeFlat(new THREE.CylinderGeometry(0.12, 0.15, 0.34, 6));
  const spineCoreMesh = new THREE.Mesh(spineCoreGeo, darkFurMat);
  spineCoreMesh.position.set(0, -0.01, -0.03);
  spineCoreMesh.rotation.set(0.42, 0, 0);
  spineCoreMesh.scale.set(0.95, 1.0, 1.05);
  spineCoreMesh.castShadow = true;
  spineCoreMesh.receiveShadow = true;
  humpGroup.add(spineCoreMesh);

  // Left & Right Scapula Flank Muscle Pads
  [-0.19, 0.19].forEach(sx => {
    const scapGeo = makeFlat(new THREE.CylinderGeometry(0.09, 0.075, 0.22, 5));
    const scapMesh = new THREE.Mesh(scapGeo, darkFurMat);
    scapMesh.position.set(sx, -0.04, -0.05);
    scapMesh.rotation.set(0.35, (sx > 0 ? -0.2 : 0.2), (sx > 0 ? 0.35 : -0.35));
    scapMesh.castShadow = true;
    humpGroup.add(scapMesh);
  });

  // 2E. Dorsal Fur Ridges (8 Jagged Back Spikes along hump arch Y = 0.82 to 1.04, Z = -0.02 to -0.22)
  const dorsalRidgeGroup = new THREE.Group();
  dorsalRidgeGroup.name = "DorsalFurRidges";

  const dorsalSpikeConfigs = [
    { x:  0.00, y:  0.22, z:  0.04, s: 1.35, rotX: -0.52, rotZ:  0.00 }, // Crown apex towering at Y ≈ 1.04!
    { x: -0.05, y:  0.18, z: -0.01, s: 1.22, rotX: -0.48, rotZ:  0.12 },
    { x:  0.05, y:  0.18, z: -0.01, s: 1.22, rotX: -0.48, rotZ: -0.12 },
    { x:  0.00, y:  0.13, z: -0.06, s: 1.15, rotX: -0.44, rotZ:  0.00 },
    { x: -0.06, y:  0.08, z: -0.10, s: 1.05, rotX: -0.40, rotZ:  0.15 },
    { x:  0.06, y:  0.08, z: -0.10, s: 1.05, rotX: -0.40, rotZ: -0.15 },
    { x:  0.00, y:  0.02, z: -0.14, s: 0.95, rotX: -0.35, rotZ:  0.00 },
    { x:  0.00, y: -0.05, z: -0.18, s: 0.85, rotX: -0.30, rotZ:  0.00 }
  ];

  dorsalSpikeConfigs.forEach(cfg => {
    const spikeGeo = makeFlat(new THREE.ConeGeometry(0.085, 0.22, 4));
    const spikeMesh = new THREE.Mesh(spikeGeo, darkFurMat);
    spikeMesh.position.set(cfg.x, cfg.y, cfg.z);
    spikeMesh.scale.setScalar(cfg.s);
    spikeMesh.rotation.set(cfg.rotX, 0, cfg.rotZ);
    spikeMesh.castShadow = true;
    spikeMesh.receiveShadow = true;
    dorsalRidgeGroup.add(spikeMesh);
  });
  humpGroup.add(dorsalRidgeGroup);

  // ==========================================
  // 3. VISIBLE MUSCULAR NECK & NARROW FERAL WOLF HEAD
  // ==========================================
  // 3A. Visible Muscular Neck: Bridge (0, 0.68, 0.07) to Head at (0, 0.70, 0.22)
  const neckGeo = makeFlat(new THREE.CylinderGeometry(0.11, 0.14, 0.18, 6));
  const neckMesh = new THREE.Mesh(neckGeo, primaryFurMat);
  neckMesh.position.set(0, 0.68, 0.07);
  neckMesh.scale.set(0.95, 1.0, 0.68); // Leaner neck profile, fully recessed behind mane
  neckMesh.rotation.x = 0.75; // Angled forward
  neckMesh.castShadow = true;
  neckMesh.receiveShadow = true;
  rootGroup.add(neckMesh);

  // 3B. Head Group (Positioned at 0, 0.70, 0.22)
  const headGroup = new THREE.Group();
  headGroup.name = "HeadGroup";
  headGroup.position.set(0, 0.70, 0.22);
  headGroup.rotation.x = -0.06;
  rootGroup.add(headGroup);

  // Feral Skull Base (Faceted prism width X = 0.24, height Y = 0.20, depth Z = 0.22)
  const craniumGeo = makeFlat(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 6));
  const craniumMesh = new THREE.Mesh(craniumGeo, primaryFurMat);
  craniumMesh.position.set(0, 0.02, 0.00);
  craniumMesh.rotation.x = 0.25;
  craniumMesh.scale.set(1.0, 1.0, 1.1);
  craniumMesh.castShadow = true;
  craniumMesh.receiveShadow = true;
  headGroup.add(craniumMesh);

  // Forehead & Chiseled Brow Bone (#4f4b5d) - Lifted & arched to fully reveal glowing eyes
  const browGeo = makeFlat(new THREE.CylinderGeometry(0.08, 0.12, 0.11, 4));
  const browMesh = new THREE.Mesh(browGeo, snoutFurMat);
  browMesh.position.set(0, 0.080, 0.060);
  browMesh.rotation.x = -0.22; // Lifted up so it does NOT cast shadow over the eyes!
  browMesh.scale.set(1.05, 0.60, 0.82);
  browMesh.castShadow = true;
  headGroup.add(browMesh);

  // 3C. Pointed Ears: Sharp triangular prisms at X = ±0.11, Y = 0.84, Z = 0.14
  // Nestled IN FRONT OF the higher shoulder hump
  function createPointedEar(isRight = false) {
    const ear = new THREE.Group();
    const side = isRight ? 1 : -1;
    ear.position.set(side * 0.11, 0.14, -0.04);
    ear.rotation.set(-0.15, side * 0.20, side * -0.28);

    const earGeo = makeFlat(new THREE.ConeGeometry(0.065, 0.24, 4));
    const earMesh = new THREE.Mesh(earGeo, darkFurMat);
    earMesh.scale.set(0.85, 1.0, 0.55);
    earMesh.castShadow = true;
    ear.add(earMesh);

    // Inner lighter ear facet
    const inGeo = makeFlat(new THREE.ConeGeometry(0.042, 0.18, 3));
    const inMesh = new THREE.Mesh(inGeo, primaryFurMat);
    inMesh.position.set(0, -0.01, 0.02);
    inMesh.scale.set(0.8, 1.0, 0.35);
    ear.add(inMesh);

    return ear;
  }
  headGroup.add(createPointedEar(false));
  headGroup.add(createPointedEar(true));

  // 3D. Flaring Lateral Cheek Mane (3 sharp swept faceted plates on each side)
  function createCheekMane(isRight = false) {
    const set = new THREE.Group();
    const side = isRight ? 1 : -1;

    // Cheek mane sits slightly back along cheek & neck so chest mane layers in FRONT of it
    const cheekConfigs = [
      { y:  0.03, z:  0.005, len: 0.16, w: 0.11, rotZ: side * -0.45 },
      { y: -0.02, z: -0.015, len: 0.19, w: 0.13, rotZ: side * -0.65 },
      { y: -0.07, z: -0.035, len: 0.15, w: 0.11, rotZ: side * -0.80 }
    ];

    cheekConfigs.forEach(cfg => {
      const geo = createFacetedFurShard(cfg.w, cfg.len, 0.032);
      const m = new THREE.Mesh(geo, chestManeMat);
      m.position.set(side * 0.14, cfg.y, cfg.z);
      m.scale.set(1.15, 1.15, 1.0);
      m.rotation.set(0.10, side * 0.15, cfg.rotZ);
      m.castShadow = true;
      set.add(m);
    });

    return set;
  }
  headGroup.add(createCheekMane(false));
  headGroup.add(createCheekMane(true));

  // 3E. Long Protruding Snout (Length = 0.20, extending from Z = 0.04 to Z = 0.24 relative)
  const muzzleGroup = new THREE.Group();
  muzzleGroup.name = "MuzzleGroup";

  // Upper Snout Wedge
  const muzzleGeo = makeFlat(new THREE.CylinderGeometry(0.045, 0.075, 0.20, 6));
  const muzzleMesh = new THREE.Mesh(muzzleGeo, snoutFurMat);
  muzzleMesh.position.set(0, -0.02, 0.14);
  muzzleMesh.rotation.x = Math.PI * 0.5 - 0.10;
  muzzleMesh.scale.set(1.0, 1.0, 0.85);
  muzzleMesh.castShadow = true;
  muzzleMesh.receiveShadow = true;
  muzzleGroup.add(muzzleMesh);

  // Black Nose Tip (#18181b at tip Z = 0.24 relative)
  const noseGeo = makeFlat(new THREE.BoxGeometry(0.042, 0.028, 0.035));
  const noseMesh = new THREE.Mesh(noseGeo, noseMat);
  noseMesh.position.set(0, 0.015, 0.24);
  noseMesh.rotation.x = -0.15;
  noseMesh.castShadow = true;
  muzzleGroup.add(noseMesh);

  // 3F. Open Snarling Lower Jaw (Hinged at 0, -0.08, 0.02, dropped at rotation.x = 0.38)
  const lowerJawPivot = new THREE.Group();
  lowerJawPivot.name = "LowerJawPivot";
  lowerJawPivot.position.set(0, -0.08, 0.02);
  lowerJawPivot.rotation.x = 0.38; // Snarl open angle

  // Jaw Chin Fur Block
  const jawGeo = makeFlat(new THREE.CylinderGeometry(0.040, 0.065, 0.16, 6));
  const jawMesh = new THREE.Mesh(jawGeo, primaryFurMat);
  jawMesh.position.set(0, -0.02, 0.10);
  jawMesh.rotation.x = Math.PI * 0.5;
  jawMesh.scale.set(0.9, 1.0, 0.65);
  jawMesh.castShadow = true;
  lowerJawPivot.add(jawMesh);

  // Deep Crimson Oral Cavity Lining (#450a0a)
  const mouthCavityGeo = makeFlat(new THREE.BoxGeometry(0.09, 0.025, 0.14));
  const mouthCavity = new THREE.Mesh(mouthCavityGeo, mouthInnerMat);
  mouthCavity.position.set(0, 0.005, 0.08);
  lowerJawPivot.add(mouthCavity);

  // Fangs helper
  function createFang(height = 0.045, radius = 0.012, isUpper = true) {
    const geo = makeFlat(new THREE.ConeGeometry(radius, height, 4));
    const mesh = new THREE.Mesh(geo, teethMat);
    mesh.rotation.x = isUpper ? Math.PI : 0;
    mesh.castShadow = true;
    return mesh;
  }

  // 2 Large Lower Corner Canines
  const lFangL = createFang(0.046, 0.012, false);
  lFangL.position.set(-0.038, 0.020, 0.15);
  lFangL.rotation.z = 0.10;
  lowerJawPivot.add(lFangL);

  const lFangR = createFang(0.046, 0.012, false);
  lFangR.position.set(0.038, 0.020, 0.15);
  lFangR.rotation.z = -0.10;
  lowerJawPivot.add(lFangR);

  // 4 Small Lower Incisors
  [-0.022, -0.007, 0.007, 0.022].forEach(x => {
    const inc = createFang(0.022, 0.006, false);
    inc.position.set(x, 0.016, 0.16);
    lowerJawPivot.add(inc);
  });

  headGroup.add(lowerJawPivot);

  // 2 Large Upper Corner Canines
  const uFangL = createFang(0.052, 0.013, true);
  uFangL.position.set(-0.042, -0.045, 0.16);
  uFangL.rotation.z = -0.10;
  muzzleGroup.add(uFangL);

  const uFangR = createFang(0.052, 0.013, true);
  uFangR.position.set(0.042, -0.045, 0.16);
  uFangR.rotation.z = 0.10;
  muzzleGroup.add(uFangR);

  // 4 Small Upper Incisors
  [-0.024, -0.008, 0.008, 0.024].forEach(x => {
    const inc = createFang(0.024, 0.006, true);
    inc.position.set(x, -0.042, 0.18);
    muzzleGroup.add(inc);
  });

  headGroup.add(muzzleGroup);

  // 3G. Bold Open Glowing Red Eyes (#ff261b) - Wide, menacing feral eyes (no longer squinting / mắt hí)
  const eyesGroup = new THREE.Group();
  eyesGroup.name = "EyesGroup";

  function createSlantedEye(isRight = false) {
    const side = isRight ? 1 : -1;
    // Bold, open feral eye polygon with prominent vertical arch and catching facets
    const ev = [
      side * 0.012, -0.016,  0.000, // 0: inner corner (low, near bridge)
      side * 0.072,  0.026,  0.006, // 1: outer corner (slanted up-lateral)
      side * 0.040,  0.052, -0.006, // 2: upper eyelid arch peak (high & arched!)
      side * 0.036, -0.022,  0.006, // 3: lower eyelid curve (deep & open!)
      side * 0.038,  0.016,  0.014  // 4: glowing iris center ridge (pops forward!)
    ];
    // 4 facets angled to catch reflection and radiate light
    const ind = side > 0 ? [
      0, 2, 4,   2, 1, 4,
      1, 3, 4,   3, 0, 4
    ] : [
      0, 4, 2,   2, 4, 1,
      1, 4, 3,   3, 4, 0
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ev), 3));
    geo.setIndex(ind);
    const mesh = new THREE.Mesh(makeFlat(geo), eyeMat);
    mesh.position.set(side * 0.038, 0.036, 0.138); // Brought forward into clear view!
    mesh.rotation.set(-0.06, side * 0.15, side * -0.22);
    return mesh;
  }
  eyesGroup.add(createSlantedEye(false));
  eyesGroup.add(createSlantedEye(true));

  // Subtle Eye PointLight (strictly localized so it does not overexpose the forehead)
  const eyeLight = new THREE.PointLight(0xff1e1e, 0.08, 0.10, 2.0);
  eyeLight.position.set(0, 0.030, 0.17);
  eyeLight.castShadow = false;
  eyesGroup.add(eyeLight);

  headGroup.add(eyesGroup);

  // ==========================================
  // 4. SEAMLESS MUSCULAR SHOULDERS & CURVED PREDATOR ARMS (NO GAPS!)
  // Attached closer into upper chest at X = ±0.28, Y = 0.70, Z = 0.02
  // ==========================================
  const armLeftGroup = new THREE.Group();
  armLeftGroup.name = "ArmLeftGroup";
  armLeftGroup.position.set(-0.28, 0.70, 0.02);
  rootGroup.add(armLeftGroup);

  const armRightGroup = new THREE.Group();
  armRightGroup.name = "ArmRightGroup";
  armRightGroup.position.set(0.28, 0.70, 0.02);
  rootGroup.add(armRightGroup);

  function buildSeamlessArm(isRight = false) {
    const arm = new THREE.Group();
    const side = isRight ? 1 : -1;

    // 4A. Anatomically Sculpted Deltoid Muscle Cap (Powerful, rounded 3-headed shoulder muscle)
    const deltGeo = makeFlat(new THREE.CylinderGeometry(0.13, 0.11, 0.18, 6));
    const deltMesh = new THREE.Mesh(deltGeo, darkFurMat);
    deltMesh.position.set(side * 0.02, 0.02, 0.00);
    deltMesh.rotation.set(0.20, 0, side * 0.22);
    deltMesh.scale.set(1.12, 0.90, 1.15);
    deltMesh.castShadow = true;
    deltMesh.receiveShadow = true;
    arm.add(deltMesh);

    // 3 Layered deltoid fur plates hugging the shoulder contour snugly (no flaring wings!)
    [
      { y:  0.06, z: -0.03, w: 0.09, len: 0.14, rotX: -0.30, rotZ: side * -0.25 },
      { y:  0.01, z: -0.05, w: 0.10, len: 0.15, rotX: -0.25, rotZ: side * -0.35 },
      { y: -0.04, z: -0.06, w: 0.09, len: 0.13, rotX: -0.20, rotZ: side * -0.42 }
    ].forEach(cfg => {
      const sGeo = createFineFurTuft(cfg.w, cfg.len, 0.032);
      const sMesh = new THREE.Mesh(sGeo, darkFurMat);
      sMesh.position.set(side * 0.06, cfg.y, cfg.z);
      sMesh.rotation.set(cfg.rotX, side * 0.25, cfg.rotZ);
      sMesh.castShadow = true;
      arm.add(sMesh);
    });

    // 4B. Upper Arm (Tapered hexagonal prism CylinderGeometry(0.11, 0.085, 0.24, 6))
    // Angled outward rotation.z = side * 0.25 and forward rotation.x = 0.25
    const upperArm = new THREE.Group();
    upperArm.position.set(side * 0.02, -0.04, 0.01);
    upperArm.rotation.set(0.25, side * 0.08, side * 0.25);

    const bicepGeo = makeFlat(new THREE.CylinderGeometry(0.11, 0.085, 0.24, 6));
    const bicepMesh = new THREE.Mesh(bicepGeo, primaryFurMat);
    bicepMesh.position.set(0, -0.12, 0);
    bicepMesh.castShadow = true;
    bicepMesh.receiveShadow = true;
    upperArm.add(bicepMesh);

    // 4C. Forearm (Thick muscular prism CylinderGeometry(0.095, 0.075, 0.24, 6))
    // Bent forward and inward: rotation.z = -side * 0.10, rotation.x = -0.50
    const forearm = new THREE.Group();
    forearm.position.set(0, -0.24, 0);
    forearm.rotation.set(-0.50, side * -0.10, side * -0.10);

    const foreGeo = makeFlat(new THREE.CylinderGeometry(0.095, 0.075, 0.24, 6));
    const foreMesh = new THREE.Mesh(foreGeo, primaryFurMat);
    foreMesh.position.set(0, -0.12, 0.01);
    foreMesh.castShadow = true;
    foreMesh.receiveShadow = true;
    forearm.add(foreMesh);

    // 3 Forearm & elbow fur tufts placed along posterior ulna ridge (Hugs the arm tightly, no flaring wings!)
    [
      { y: -0.03, z: -0.065, len: 0.12, w: 0.065, rotX: 0.40 },
      { y: -0.09, z: -0.055, len: 0.11, w: 0.060, rotX: 0.30 },
      { y: -0.15, z: -0.045, len: 0.09, w: 0.055, rotX: 0.20 }
    ].forEach(cfg => {
      const eGeo = createFineFurTuft(cfg.w, cfg.len, 0.028);
      const eMesh = new THREE.Mesh(eGeo, darkFurMat);
      eMesh.position.set(side * 0.025, cfg.y, cfg.z);
      eMesh.rotation.set(cfg.rotX, side * 0.10, side * -0.12);
      eMesh.castShadow = true;
      forearm.add(eMesh);
    });

    // Compact wrist fur cuff
    const wristCuffGeo = makeFlat(new THREE.CylinderGeometry(0.084, 0.074, 0.035, 6));
    const wristCuffMesh = new THREE.Mesh(wristCuffGeo, darkFurMat);
    wristCuffMesh.position.set(0, -0.21, 0.01);
    wristCuffMesh.castShadow = true;
    forearm.add(wristCuffMesh);

    // 3 Subtle wrist fur notches
    [-0.03, 0.00, 0.03].forEach(wx => {
      const wSpkGeo = createFineFurTuft(0.040, 0.065, 0.020);
      const wSpk = new THREE.Mesh(wSpkGeo, darkFurMat);
      wSpk.position.set(wx, -0.21, -0.045);
      wSpk.rotation.set(0.55, 0, 0);
      wSpk.castShadow = true;
      forearm.add(wSpk);
    });

    // 4D. Clawed Hands (Positioned at X ≈ ±0.38, Y ≈ 0.34, Z ≈ 0.22, rotated forward and inward)
    const handGroup = new THREE.Group();
    handGroup.name = isRight ? "HandRight" : "HandLeft";
    handGroup.position.set(0, -0.24, 0.02);
    handGroup.rotation.set(0.45, side * 0.25, 0);

    // Palm block
    const palmGeo = makeFlat(new THREE.BoxGeometry(0.14, 0.075, 0.11));
    const palmMesh = new THREE.Mesh(palmGeo, primaryFurMat);
    palmMesh.castShadow = true;
    palmMesh.receiveShadow = true;
    handGroup.add(palmMesh);

    // 4 Long Curved Ivory Pyramid Claws pointing forward and curled downward
    [-0.046, -0.015, 0.015, 0.046].forEach((clawX, idx) => {
      const isOuter = (idx === 0 || idx === 3);
      const cLen = isOuter ? 0.135 : 0.155;
      const cRad = isOuter ? 0.020 : 0.024;

      const clawGeo = createCurvedClawGeometry(cRad, cLen, 0.065, 4);
      const clawMesh = new THREE.Mesh(clawGeo, clawsMat);
      clawMesh.position.set(clawX, -0.025, 0.055);
      clawMesh.rotation.x = 0.85; // Pointing forward and curled down
      clawMesh.rotation.y = -clawX * 1.5;
      clawMesh.castShadow = true;
      handGroup.add(clawMesh);
    });

    forearm.add(handGroup);
    upperArm.add(forearm);
    arm.add(upperArm);

    return arm;
  }

  armLeftGroup.add(buildSeamlessArm(false));
  armRightGroup.add(buildSeamlessArm(true));

  // ==========================================
  // 5. WIDE BOW-LEGGED STANCE & 120° DIGITIGRADE HIND LEGS
  // ==========================================
  const legsGroup = new THREE.Group();
  legsGroup.name = "LegsGroup";
  rootGroup.add(legsGroup);

  const legLeftGroup = new THREE.Group();
  legLeftGroup.name = "LegLeftGroup";
  legLeftGroup.position.set(-0.13, 0.38, 0.00); // Hip socket at X = -0.13
  legsGroup.add(legLeftGroup);

  const legRightGroup = new THREE.Group();
  legRightGroup.name = "LegRightGroup";
  legRightGroup.position.set(0.13, 0.38, 0.00);  // Hip socket at X = +0.13
  legsGroup.add(legRightGroup);

  function buildBowLeggedDigitigrade(isRight = false) {
    const leg = new THREE.Group();
    const side = isRight ? 1 : -1;

    // 5A. Wide Bowed Thigh (Bulky 6-sided tapered cylinder topRadius = 0.11, bottomRadius = 0.08, length = 0.22)
    // Angled strongly OUTWARD rotation.z = side * 0.38 and FORWARD rotation.x = -0.52
    // Knees reach wide out to X = ±0.25, Y = 0.23, Z = 0.12!
    const thighGroup = new THREE.Group();
    thighGroup.rotation.set(-0.52, side * -0.12, side * 0.38);

    const thighGeo = makeFlat(new THREE.CylinderGeometry(0.11, 0.08, 0.22, 6));
    const thighMesh = new THREE.Mesh(thighGeo, primaryFurMat);
    thighMesh.position.set(0, -0.11, 0);
    thighMesh.castShadow = true;
    thighMesh.receiveShadow = true;
    thighGroup.add(thighMesh);

    // Clean, powerful muscular thigh contour (removed side leg fur shards as requested)
    // 3 Dark etched claw fur marks on front of thigh (with polygonOffset)
    const markMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.darkFur),
      roughness: 0.90,
      metalness: 0.08,
      flatShading: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    [-0.025, 0.00, 0.025].forEach((tx, idx) => {
      const markGeo = makeFlat(new THREE.BoxGeometry(0.014, 0.07, 0.02));
      const markMesh = new THREE.Mesh(markGeo, markMat);
      markMesh.position.set(tx, -0.10 + idx * 0.012, 0.085);
      markMesh.rotation.z = side * 0.15;
      thighGroup.add(markMesh);
    });

    // 5B. 120-Degree Digitigrade Ankle / Lower Leg
    // Extending from knee (±0.25, 0.23, 0.12) backward and down to hock/heel
    const hockGroup = new THREE.Group();
    hockGroup.position.set(0, -0.22, 0);
    // Bends backward at ~120° dog-leg angle
    hockGroup.rotation.set(1.25, 0, side * -0.12);

    const hockGeo = makeFlat(new THREE.CylinderGeometry(0.080, 0.065, 0.19, 6));
    const hockMesh = new THREE.Mesh(hockGeo, primaryFurMat);
    hockMesh.position.set(0, -0.095, 0);
    hockMesh.castShadow = true;
    hockMesh.receiveShadow = true;
    hockGroup.add(hockMesh);

    // Ankle fur cuff framing the paw
    const ankleCuffGeo = makeFlat(new THREE.CylinderGeometry(0.082, 0.070, 0.045, 6));
    const ankleCuff = new THREE.Mesh(ankleCuffGeo, darkFurMat);
    ankleCuff.position.set(0, -0.16, 0.01);
    ankleCuff.castShadow = true;
    hockGroup.add(ankleCuff);

    // 5C. Grounded Paws with 3 Large White Claws (Planted flat at Y = 0.00, X = ±0.26, Z = 0.05)
    const footGroup = new THREE.Group();
    footGroup.name = isRight ? "FootRight" : "FootLeft";
    footGroup.position.set(0, -0.19, 0);
    // Reverses hock angle to plant paw flat on ground
    footGroup.rotation.set(-0.70, 0, side * -0.15);

    // Paw base block (width 0.13, height 0.055, length 0.16)
    const pawBaseGeo = makeFlat(new THREE.BoxGeometry(0.13, 0.055, 0.16));
    const pawBase = new THREE.Mesh(pawBaseGeo, footPadsMat);
    pawBase.position.set(0, 0.028, 0.04);
    pawBase.castShadow = true;
    pawBase.receiveShadow = true;
    footGroup.add(pawBase);

    // 3 distinct front toes tipped with 3 prominent ivory-white triangular claws (#e7e5e4)
    [-0.038, 0.00, 0.038].forEach((toeX, tIdx) => {
      // Toe segment
      const toeGeo = makeFlat(new THREE.BoxGeometry(0.034, 0.040, 0.07));
      const toeMesh = new THREE.Mesh(toeGeo, primaryFurMat);
      toeMesh.position.set(toeX, 0.022, 0.11);
      toeMesh.castShadow = true;
      footGroup.add(toeMesh);

      // White ivory triangular claw
      const clawGeo = createCurvedClawGeometry(0.016, 0.075, 0.035, 4);
      const clawMesh = new THREE.Mesh(clawGeo, clawsMat);
      clawMesh.position.set(toeX, 0.015, 0.145);
      clawMesh.rotation.x = 0.65;
      clawMesh.rotation.z = -toeX * 1.5;
      clawMesh.castShadow = true;
      footGroup.add(clawMesh);
    });

    hockGroup.add(footGroup);
    thighGroup.add(hockGroup);
    leg.add(thighGroup);

    return leg;
  }

  legLeftGroup.add(buildBowLeggedDigitigrade(false));
  legRightGroup.add(buildBowLeggedDigitigrade(true));

  // ==========================================
  // 6. STREAMLINED BROOMSTICK TAIL ("ĐUÔI BÓ CHỔI GỌN GÀNG")
  // ==========================================
  // Tail rooted at rear pelvis (0, 0.38, -0.09), sweeps back cleanly without wild flaring
  const tailGroup = new THREE.Group();
  tailGroup.name = "TailGroup";
  tailGroup.position.set(0, 0.38, -0.09);
  tailGroup.rotation.set(-0.65, 0, 0); // Downward-backward slope
  rootGroup.add(tailGroup);

  // 6A. Segmented Sleek Tail Core (Thân đuôi vát đa diện liền mạch)
  // Segment 1: Tail Base Stem
  const stemGeo = makeFlat(new THREE.CylinderGeometry(0.045, 0.055, 0.16, 6));
  const stemMesh = new THREE.Mesh(stemGeo, darkFurMat);
  stemMesh.position.set(0, -0.035, -0.07);
  stemMesh.rotation.x = Math.PI * 0.5 - 0.15;
  stemMesh.castShadow = true;
  stemMesh.receiveShadow = true;
  tailGroup.add(stemMesh);

  // Segment 2: Mid-Tail Plume Body (Thân bó chổi hơi phình nhẹ ở giữa rồi thuôn gọn)
  const midCoreGeo = makeFlat(new THREE.CylinderGeometry(0.055, 0.070, 0.22, 6));
  const midCore = new THREE.Mesh(midCoreGeo, primaryFurMat);
  midCore.position.set(0, -0.075, -0.23);
  midCore.rotation.x = Math.PI * 0.5 - 0.08;
  midCore.castShadow = true;
  midCore.receiveShadow = true;
  tailGroup.add(midCore);

  // Segment 3: Tapering Tip Cone (Chóp đuôi vuốt nhọn)
  const tipConeGeo = makeFlat(new THREE.ConeGeometry(0.065, 0.24, 6));
  const tipCone = new THREE.Mesh(tipConeGeo, darkFurMat);
  tipCone.position.set(0, -0.095, -0.42);
  tipCone.rotation.x = -Math.PI * 0.5 + 0.15; // Hơi vểnh nhẹ ở chóp
  tipCone.castShadow = true;
  tipCone.receiveShadow = true;
  tailGroup.add(tipCone);

  // 6B. Streamlined Overlapping Fur Tufts (Lông xếp lớp ôm sát thân đuôi, không chỉa lung tung)
  const bristleGroup = new THREE.Group();
  bristleGroup.name = "BristleBundle";
  tailGroup.add(bristleGroup);

  // Top Ridge: 4 sleek dorsal tufts lying along top of tail
  const topTuftConfigs = [
    { y:  0.02, z: -0.12, w: 0.07, len: 0.15, rotX: -0.15, mat: darkFurMat },
    { y:  0.00, z: -0.22, w: 0.08, len: 0.18, rotX: -0.10, mat: primaryFurMat },
    { y: -0.02, z: -0.32, w: 0.08, len: 0.19, rotX: -0.05, mat: chestManeMat },
    { y: -0.05, z: -0.42, w: 0.07, len: 0.18, rotX:  0.05, mat: chestManeMat }
  ];
  topTuftConfigs.forEach(cfg => {
    const geo = createFineFurTuft(cfg.w, cfg.len, 0.024);
    const m = new THREE.Mesh(geo, cfg.mat);
    m.position.set(0, cfg.y, cfg.z);
    m.rotation.set(-Math.PI * 0.5 + cfg.rotX, 0, 0);
    m.castShadow = true;
    bristleGroup.add(m);
  });

  // Left & Right Flank Tufts: 4 pairs swept neatly back along the sides (X = ±0.055)
  const flankConfigs = [
    { y: -0.03, z: -0.14, len: 0.16, w: 0.07, rotZ: 0.18, mat: darkFurMat },
    { y: -0.06, z: -0.24, len: 0.19, w: 0.08, rotZ: 0.22, mat: primaryFurMat },
    { y: -0.08, z: -0.34, len: 0.19, w: 0.08, rotZ: 0.25, mat: chestManeMat },
    { y: -0.10, z: -0.42, len: 0.17, w: 0.07, rotZ: 0.20, mat: chestManeMat }
  ];
  flankConfigs.forEach(cfg => {
    [-1, 1].forEach(side => {
      const geo = createFineFurTuft(cfg.w, cfg.len, 0.022);
      const m = new THREE.Mesh(geo, cfg.mat);
      m.position.set(side * 0.055, cfg.y, cfg.z);
      m.rotation.set(-Math.PI * 0.5 + 0.10, side * 0.12, side * cfg.rotZ);
      m.castShadow = true;
      bristleGroup.add(m);
    });
  });

  // Underside: 3 tufts along bottom belly of tail
  const bottomTuftConfigs = [
    { y: -0.08, z: -0.18, w: 0.07, len: 0.15, mat: darkFurMat },
    { y: -0.12, z: -0.28, w: 0.08, len: 0.18, mat: primaryFurMat },
    { y: -0.14, z: -0.38, w: 0.07, len: 0.17, mat: darkFurMat }
  ];
  bottomTuftConfigs.forEach(cfg => {
    const geo = createFineFurTuft(cfg.w, cfg.len, 0.022);
    const m = new THREE.Mesh(geo, cfg.mat);
    m.position.set(0, cfg.y, cfg.z);
    m.rotation.set(-Math.PI * 0.5 + 0.25, 0, Math.PI);
    m.castShadow = true;
    bristleGroup.add(m);
  });

  // Broom Tip Apex: 3 neat, clustered dagger spears pointing back together
  const tipApexConfigs = [
    { x:  0.00,  y: -0.10, z: -0.48, len: 0.22, w: 0.08, rotY:  0.00, mat: chestManeMat },
    { x: -0.025, y: -0.10, z: -0.46, len: 0.20, w: 0.07, rotY: -0.08, mat: primaryFurMat },
    { x:  0.025, y: -0.10, z: -0.46, len: 0.20, w: 0.07, rotY:  0.08, mat: primaryFurMat }
  ];
  tipApexConfigs.forEach(cfg => {
    const geo = createFineFurTuft(cfg.w, cfg.len, 0.024);
    const m = new THREE.Mesh(geo, cfg.mat);
    m.position.set(cfg.x, cfg.y, cfg.z);
    m.rotation.set(-Math.PI * 0.5 + 0.20, cfg.rotY, 0);
    m.castShadow = true;
    bristleGroup.add(m);
  });

  // ==========================================
  // 7. INTERACTIVE API & CONTROLS
  // ==========================================
  function setColors(newColors) {
    if (newColors.darkFur) darkFurMat.color.set(newColors.darkFur);
    if (newColors.primaryFur) primaryFurMat.color.set(newColors.primaryFur);
    if (newColors.snoutFur) snoutFurMat.color.set(newColors.snoutFur);
    if (newColors.chestMane) {
      chestManeMat.color.set(newColors.chestMane);
      maneSilverMat.color.set(new THREE.Color(newColors.chestMane).offsetHSL(0, -0.05, 0.12));
      maneDarkMat.color.set(new THREE.Color(newColors.chestMane).offsetHSL(0, 0.05, -0.14));
    }
    if (newColors.nose) noseMat.color.set(newColors.nose);
    if (newColors.eyes) eyeMat.color.set(newColors.eyes);
    if (newColors.mouthInner) mouthInnerMat.color.set(newColors.mouthInner);
    if (newColors.teeth) teethMat.color.set(newColors.teeth);
    if (newColors.claws) clawsMat.color.set(newColors.claws);
    if (newColors.footPads) footPadsMat.color.set(newColors.footPads);
  }

  function setWireframe(enabled) {
    const mats = [
      darkFurMat, primaryFurMat, snoutFurMat, chestManeMat, maneSilverMat, maneDarkMat,
      noseMat, teethMat, clawsMat, mouthInnerMat, footPadsMat, stoneMat
    ];
    mats.forEach(m => { m.wireframe = enabled; });
  }

  function openMouth(amount) {
    lowerJawPivot.rotation.x = THREE.MathUtils.lerp(0.15, 0.55, amount);
  }

  function setPose(poseName) {
    if (poseName === 'default' || poseName === 'aggressive') {
      headGroup.rotation.set(-0.06, 0, 0);
      armLeftGroup.rotation.set(0, 0, 0);
      armRightGroup.rotation.set(0, 0, 0);
      lowerJawPivot.rotation.x = 0.38;
    } else if (poseName === 't-pose') {
      headGroup.rotation.set(0, 0, 0);
      armLeftGroup.rotation.set(0, 0, 0.55);
      armRightGroup.rotation.set(0, 0, -0.55);
      lowerJawPivot.rotation.x = 0.15;
    } else if (poseName === 'roar') {
      headGroup.rotation.set(-0.35, 0, 0);
      armLeftGroup.rotation.set(-0.25, 0, 0.20);
      armRightGroup.rotation.set(-0.25, 0, -0.20);
      lowerJawPivot.rotation.x = 0.58;
    } else if (poseName === 'swipe') {
      headGroup.rotation.set(0.05, -0.20, 0);
      armLeftGroup.rotation.set(0.45, 0.30, -0.20);
      armRightGroup.rotation.set(-0.40, -0.25, -0.15);
      lowerJawPivot.rotation.x = 0.42;
    }
  }

  // Traverse to ensure flat-shading on all meshes
  rootGroup.traverse(child => {
    if (child.isMesh) {
      child.geometry = makeFlat(child.geometry);
      if (child.material !== fireAmberMat && child.material !== fireYellowMat && child.material !== eyeMat) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    }
  });

  return {
    model: rootGroup,
    parts: {
      spineGroup,
      pelvisMesh,
      chestGroup,
      chestMesh,
      humpGroup,
      trapMeshL,
      trapMeshR,
      spineCoreMesh,
      humpMesh: spineCoreMesh,
      dorsalRidgeGroup,
      chestManeGroup,
      neckMesh,
      headGroup,
      craniumMesh,
      browMesh,
      muzzleGroup,
      lowerJawPivot,
      eyesGroup,
      eyeLight,
      armLeftGroup,
      armRightGroup,
      legsGroup,
      legLeftGroup,
      legRightGroup,
      tailGroup
    },
    materials: {
      darkFurMat,
      primaryFurMat,
      snoutFurMat,
      chestManeMat,
      noseMat,
      eyeMat,
      mouthInnerMat,
      teethMat,
      clawsMat,
      footPadsMat
    },
    setColors,
    setWireframe,
    openMouth,
    setPose
  };
}

// Global export alias for seamless viewer compatibility
export const createWolfCharacter = createWerewolfModel;
