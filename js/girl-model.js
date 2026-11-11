import * as THREE from 'three';

// Exact color palette tuned to match girl.png under scene lighting
export const DEFAULT_COLORS = {
  skin: '#f8c8b4',       // Soft creamy peach skin tone
  hair: '#363748',       // Deep muted slate-indigo hair
  shirt: '#6a7080',      // Balanced slate grey shirt
  pants: '#545866',      // Darker slate grey pants
  eyes: '#18181f',       // Deep black/charcoal pill eyes
  eyebrows: '#2b2936',   // Eyebrow tone
  hairTie: '#24232c'     // Hair tie band
};

// Helper: Guarantee crisp flat shading on any geometry
export function makeFlat(geo) {
  const nonIndexed = geo.toNonIndexed();
  nonIndexed.computeVertexNormals();
  return nonIndexed;
}

export function createGirlCharacter(customColors = {}) {
  const colors = { ...DEFAULT_COLORS, ...customColors };
  const character = new THREE.Group();
  character.name = "ChibiGirl";

  // Flat shading materials with DoubleSide for crisp facets
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.skin),
    roughness: 0.80,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hair),
    roughness: 0.70,
    metalness: 0.04,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.shirt),
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.pants),
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyes),
    roughness: 0.30,
    metalness: 0.04,
    flatShading: true
  });

  const eyebrowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyebrows),
    roughness: 0.50,
    metalness: 0.04,
    flatShading: true
  });

  const hairTieMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hairTie),
    roughness: 0.80,
    metalness: 0.04,
    flatShading: true,
    side: THREE.DoubleSide
  });

  // ==========================================
  // 1. HEAD & FACE
  // Head origin placed at neck base: Y = 1.34
  // ==========================================
  const headGroup = new THREE.Group();
  headGroup.name = "HeadGroup";
  headGroup.position.set(0, 1.34, 0);

  // --- Head Mesh (Face & Cranium) ---
  const headGeo = new THREE.BufferGeometry();
  const hv = {
    // Chin base (soft rounded bottom)
    chinMidL:   [-0.10,  0.03,  0.22 ],
    chinMidR:   [ 0.10,  0.03,  0.22 ],
    chinL:      [-0.24,  0.07,  0.20 ],
    chinR:      [ 0.24,  0.07,  0.20 ],

    // Jaw corners
    jawL:       [-0.38,  0.17,  0.18 ],
    jawR:       [ 0.38,  0.17,  0.18 ],

    // Cheeks (wide, cute, rounded)
    cheekLowL:  [-0.48,  0.27,  0.18 ],
    cheekLowR:  [ 0.48,  0.27,  0.18 ],
    cheekMidL:  [-0.49,  0.41,  0.16 ],
    cheekMidR:  [ 0.49,  0.41,  0.16 ],

    // Central face plane (wide flat surface between cheeks)
    faceLowL:   [-0.14,  0.18,  0.26 ],
    faceLowR:   [ 0.14,  0.18,  0.26 ],
    faceMidL:   [-0.18,  0.36,  0.26 ],
    faceMidR:   [ 0.18,  0.36,  0.26 ],

    // Forehead
    foreheadLowL: [-0.16, 0.52, 0.24 ],
    foreheadLowR: [ 0.16, 0.52, 0.24 ],
    foreheadMid:  [ 0.00, 0.58, 0.22 ],
    templeL:    [-0.44,  0.52,  0.14 ],
    templeR:    [ 0.44,  0.52,  0.14 ],

    // Crown of cranium
    crownMid:   [ 0.00,  0.72,  0.08 ],
    crownL:     [-0.28,  0.68,  0.06 ],
    crownR:     [ 0.28,  0.68,  0.06 ],

    // Sides & ear base
    sideMidL:   [-0.46,  0.34, -0.04 ],
    sideMidR:   [ 0.46,  0.34, -0.04 ],
    sideTopL:   [-0.40,  0.62, -0.06 ],
    sideTopR:   [ 0.40,  0.62, -0.06 ],

    // Back of skull
    backCrown:  [ 0.00,  0.66, -0.30 ],
    backMid:    [ 0.00,  0.34, -0.36 ],
    backL:      [-0.32,  0.34, -0.26 ],
    backR:      [ 0.32,  0.34, -0.26 ],
    backNape:   [ 0.00,  0.06, -0.24 ],
    backNapeL:  [-0.24,  0.06, -0.18 ],
    backNapeR:  [ 0.24,  0.06, -0.18 ]
  };

  const hTris = [];
  function addCCWTri(a, b, c) { hTris.push(...a, ...b, ...c); }
  function addCCWQuad(a, b, c, d) { addCCWTri(a, b, c); addCCWTri(a, c, d); }

  // 1. Chin front
  addCCWQuad(hv.chinMidL, hv.chinMidR, hv.faceLowR, hv.faceLowL);
  addCCWTri(hv.chinL, hv.chinMidL, hv.faceLowL);
  addCCWTri(hv.chinMidR, hv.chinR, hv.faceLowR);
  addCCWTri(hv.chinL, hv.faceLowL, hv.jawL);
  addCCWTri(hv.chinR, hv.jawR, hv.faceLowR);

  // 2. Mid face & Cheeks
  addCCWQuad(hv.faceLowL, hv.faceLowR, hv.faceMidR, hv.faceMidL);
  addCCWQuad(hv.jawL, hv.faceLowL, hv.faceMidL, hv.cheekLowL);
  addCCWQuad(hv.faceLowR, hv.jawR, hv.cheekLowR, hv.faceMidR);
  addCCWQuad(hv.cheekLowL, hv.faceMidL, hv.foreheadLowL, hv.cheekMidL);
  addCCWQuad(hv.faceMidR, hv.cheekLowR, hv.cheekMidR, hv.foreheadLowR);

  // 3. Forehead
  addCCWQuad(hv.faceMidL, hv.faceMidR, hv.foreheadLowR, hv.foreheadLowL);
  addCCWTri(hv.foreheadLowL, hv.foreheadLowR, hv.foreheadMid);
  addCCWTri(hv.cheekMidL, hv.foreheadLowL, hv.templeL);
  addCCWTri(hv.foreheadLowR, hv.cheekMidR, hv.templeR);
  addCCWTri(hv.foreheadLowL, hv.foreheadMid, hv.templeL);
  addCCWTri(hv.foreheadMid, hv.foreheadLowR, hv.templeR);

  // 4. Crown
  addCCWQuad(hv.templeL, hv.foreheadMid, hv.crownMid, hv.crownL);
  addCCWQuad(hv.foreheadMid, hv.templeR, hv.crownR, hv.crownMid);

  // 5. Sides & Back
  addCCWQuad(hv.cheekMidL, hv.templeL, hv.sideTopL, hv.sideMidL);
  addCCWQuad(hv.templeR, hv.cheekMidR, hv.sideMidR, hv.sideTopR);
  addCCWQuad(hv.jawL, hv.cheekLowL, hv.cheekMidL, hv.sideMidL);
  addCCWQuad(hv.cheekLowR, hv.jawR, hv.sideMidR, hv.cheekMidR);

  addCCWQuad(hv.crownL, hv.crownMid, hv.backCrown, hv.sideTopL);
  addCCWQuad(hv.crownMid, hv.crownR, hv.sideTopR, hv.backCrown);
  addCCWQuad(hv.sideTopL, hv.backCrown, hv.backMid, hv.backL);
  addCCWQuad(hv.backCrown, hv.sideTopR, hv.backR, hv.backMid);
  addCCWQuad(hv.sideMidL, hv.sideTopL, hv.backL, hv.backMid);
  addCCWQuad(hv.sideTopR, hv.sideMidR, hv.backMid, hv.backR);

  addCCWQuad(hv.backL, hv.backMid, hv.backNape, hv.backNapeL);
  addCCWQuad(hv.backMid, hv.backR, hv.backNapeR, hv.backNape);
  addCCWQuad(hv.jawL, hv.sideMidL, hv.backL, hv.backNapeL);
  addCCWQuad(hv.sideMidR, hv.jawR, hv.backNapeR, hv.backR);
  addCCWTri(hv.chinL, hv.jawL, hv.backNapeL);
  addCCWTri(hv.jawR, hv.chinR, hv.backNapeR);
  addCCWQuad(hv.chinMidL, hv.chinL, hv.backNapeL, hv.backNape);
  addCCWQuad(hv.chinR, hv.chinMidR, hv.backNape, hv.backNapeR);

  headGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(hTris), 3));
  headGeo.computeVertexNormals();
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headGroup.add(headMesh);

  // --- Eyes (Vertical lozenges / capsules) ---
  const eyeGeo = makeFlat(new THREE.CapsuleGeometry(0.046, 0.12, 6, 8));
  eyeGeo.scale(1, 1, 0.35);

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.20, 0.36, 0.275);
  leftEye.rotation.set(-0.02, 0.08, 0);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.20, 0.36, 0.275);
  rightEye.rotation.set(-0.02, -0.08, 0);
  headGroup.add(rightEye);

  // --- Eyebrows (Short slanted bars matching girl.png) ---
  const eyebrowGeo = makeFlat(new THREE.BoxGeometry(0.14, 0.026, 0.025));
  const leftEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
  leftEyebrow.position.set(-0.20, 0.485, 0.265);
  leftEyebrow.rotation.set(-0.04, 0.10, -0.14);
  headGroup.add(leftEyebrow);

  const rightEyebrow = new THREE.Mesh(eyebrowGeo, eyebrowMat);
  rightEyebrow.position.set(0.20, 0.485, 0.265);
  rightEyebrow.rotation.set(-0.04, -0.10, 0.14);
  headGroup.add(rightEyebrow);

  // --- Ears (Peeking out clearly at the sides!) ---
  const earGeo = makeFlat(new THREE.ConeGeometry(0.08, 0.18, 4));
  earGeo.rotateZ(Math.PI * 0.5);
  earGeo.scale(0.35, 1.0, 0.85);

  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.position.set(-0.52, 0.30, 0.04);
  leftEar.rotation.set(0.1, -0.32, 0.12);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, skinMat);
  rightEar.position.set(0.52, 0.30, 0.04);
  rightEar.rotation.set(0.1, Math.PI + 0.32, -0.12);
  headGroup.add(rightEar);

  // ==========================================
  // 2. HAIR
  // ==========================================
  const hairGroup = new THREE.Group();
  hairGroup.name = "HairGroup";

  // --- 2A. Back & Crown Hair Shell ---
  const hairShellGeo = new THREE.SphereGeometry(0.56, 8, 6, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.80);
  const hsPos = hairShellGeo.attributes.position;
  for (let i = 0; i < hsPos.count; i++) {
    let x = hsPos.getX(i);
    let y = hsPos.getY(i);
    let z = hsPos.getZ(i);
    x *= 1.08;
    if (z < 0) z *= 1.15;
    if (y < 0.1 && z < 0.1) y -= 0.12;
    hsPos.setXYZ(i, x, y, z);
  }
  const hairShell = new THREE.Mesh(makeFlat(hairShellGeo), hairMat);
  hairShell.position.set(0, 0.36, -0.04);
  hairShell.castShadow = true;
  hairGroup.add(hairShell);

  // --- 2B. Front Bangs (Smooth flow from crown, shallow notch) ---
  const lbGeo = new THREE.BufferGeometry();
  const lbVerts = [
    // CCW Front faces
    0.00,  0.72, 0.20,   // top crown center
   -0.03,  0.54, 0.26,   // subtle part notch
   -0.22,  0.50, 0.28,   // bang tip

    0.00,  0.72, 0.20,
   -0.22,  0.50, 0.28,
   -0.44,  0.50, 0.18,   // temple edge

    0.00,  0.72, 0.20,
   -0.44,  0.50, 0.18,
   -0.30,  0.70, 0.12,   // upper crown left

    // Thickness / under facet
   -0.03,  0.54, 0.26,
    0.00,  0.57, 0.22,
   -0.22,  0.50, 0.28,

   -0.22,  0.50, 0.28,
    0.00,  0.57, 0.22,
   -0.44,  0.50, 0.18
  ];
  lbGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lbVerts), 3));
  lbGeo.computeVertexNormals();
  const leftBang = new THREE.Mesh(lbGeo, hairMat);
  hairGroup.add(leftBang);

  // Right Bang (mirrored)
  const rbGeo = new THREE.BufferGeometry();
  const rbVerts = new Float32Array(lbVerts.length);
  for (let i = 0; i < lbVerts.length; i += 3) {
    rbVerts[i] = -lbVerts[i];
    rbVerts[i + 1] = lbVerts[i + 1];
    rbVerts[i + 2] = lbVerts[i + 2];
  }
  for (let i = 0; i < rbVerts.length; i += 9) {
    for (let j = 0; j < 3; j++) {
      const tmp = rbVerts[i + 3 + j];
      rbVerts[i + 3 + j] = rbVerts[i + 6 + j];
      rbVerts[i + 6 + j] = tmp;
    }
  }
  rbGeo.setAttribute('position', new THREE.BufferAttribute(rbVerts, 3));
  rbGeo.computeVertexNormals();
  const rightBang = new THREE.Mesh(rbGeo, hairMat);
  hairGroup.add(rightBang);

  // --- 2C. Side Hair Locks (Framing cheeks) ---
  const lockGeo = new THREE.BufferGeometry();
  const lockVerts = [
    // CCW Front face
   -0.44,  0.50,  0.18,
   -0.48,  0.28,  0.19,
   -0.46,  0.50,  0.06,

   -0.48,  0.28,  0.19,
   -0.43,  0.08,  0.15,   // lock lower tip
   -0.46,  0.50,  0.06,

    // Flared outer facet
   -0.43,  0.08,  0.15,
   -0.51,  0.12,  0.08,
   -0.46,  0.50,  0.06,

    // Outer side face
   -0.46,  0.50,  0.06,
   -0.51,  0.12,  0.08,
   -0.48,  0.32, -0.02
  ];
  lockGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lockVerts), 3));
  lockGeo.computeVertexNormals();
  const leftSideLock = new THREE.Mesh(lockGeo, hairMat);
  hairGroup.add(leftSideLock);

  // Right side lock (mirrored)
  const rLockGeo = new THREE.BufferGeometry();
  const rLockVerts = new Float32Array(lockVerts.length);
  for (let i = 0; i < lockVerts.length; i += 3) {
    rLockVerts[i] = -lockVerts[i];
    rLockVerts[i + 1] = lockVerts[i + 1];
    rLockVerts[i + 2] = lockVerts[i + 2];
  }
  for (let i = 0; i < rLockVerts.length; i += 9) {
    for (let j = 0; j < 3; j++) {
      const tmp = rLockVerts[i + 3 + j];
      rLockVerts[i + 3 + j] = rLockVerts[i + 6 + j];
      rLockVerts[i + 6 + j] = tmp;
    }
  }
  rLockGeo.setAttribute('position', new THREE.BufferAttribute(rLockVerts, 3));
  rLockGeo.computeVertexNormals();
  const rightSideLock = new THREE.Mesh(rLockGeo, hairMat);
  hairGroup.add(rightSideLock);

  // --- 2D. Top Bun (Prominently visible bulbous chibi topknot) ---
  // Width: radius 0.24, height: 0.22, placed on top of crown!
  const bunBaseGeo = new THREE.CylinderGeometry(0.16, 0.24, 0.22, 7, 2);
  const bPos = bunBaseGeo.attributes.position;
  for (let i = 0; i < bPos.count; i++) {
    let x = bPos.getX(i);
    let y = bPos.getY(i);
    let z = bPos.getZ(i);
    if (y > -0.05 && y < 0.06) {
      x *= 1.20;
      z *= 1.16;
    }
    if (y > 0.06) {
      x *= 0.65;
      z *= 0.65;
      y += 0.02;
    }
    bPos.setXYZ(i, x, y, z);
  }
  const bun = new THREE.Mesh(makeFlat(bunBaseGeo), hairMat);
  bun.position.set(0, 0.84, -0.03);
  bun.rotation.x = -0.08;
  hairGroup.add(bun);

  // Bun Base Hair Tie (ring)
  const tieGeo = makeFlat(new THREE.CylinderGeometry(0.22, 0.24, 0.06, 7));
  const tie = new THREE.Mesh(tieGeo, hairTieMat);
  tie.position.set(0, 0.73, -0.03);
  tie.rotation.x = -0.08;
  hairGroup.add(tie);

  headGroup.add(hairGroup);
  character.add(headGroup);

  // ==========================================
  // 3. NECK
  // Spans Y = 1.28 to Y = 1.35
  // ==========================================
  const neckGeo = makeFlat(new THREE.CylinderGeometry(0.13, 0.14, 0.08, 7));
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 1.31, 0.02);
  character.add(neck);

  // ==========================================
  // 4. TORSO (SHIRT with V-Neck)
  // Height: Y = 0.82 (hem) to Y = 1.28 (collar/shoulders)
  // Width: ±0.28 shoulders, ±0.27 hem
  // ==========================================
  const torsoGroup = new THREE.Group();
  torsoGroup.name = "TorsoGroup";

  const shirtGeo = new THREE.BufferGeometry();
  const sv = {
    // Collar / Neck opening
    neckBack:  [ 0.00,  1.28, -0.16 ],
    neckBackL: [-0.14,  1.28, -0.12 ],
    neckBackR: [ 0.14,  1.28, -0.12 ],
    shoulderL: [-0.28,  1.26,  0.00 ],
    shoulderR: [ 0.28,  1.26,  0.00 ],
    collarL:   [-0.11,  1.28,  0.18 ],
    collarR:   [ 0.11,  1.28,  0.18 ],
    vNeckTip:  [ 0.00,  1.17,  0.20 ],

    // Chest / Mid torso
    chestMid:  [ 0.00,  1.05,  0.19 ],
    chestL:    [-0.27,  1.05,  0.15 ],
    chestR:    [ 0.27,  1.05,  0.15 ],
    backMid:   [ 0.00,  1.05, -0.16 ],
    backL:     [-0.27,  1.05, -0.12 ],
    backR:     [ 0.27,  1.05, -0.12 ],

    // Hem / Waist
    hemFront:  [ 0.00,  0.82,  0.18 ],
    hemFrontL: [-0.26,  0.82,  0.14 ],
    hemFrontR: [ 0.26,  0.82,  0.14 ],
    hemBack:   [ 0.00,  0.82, -0.15 ],
    hemBackL:  [-0.26,  0.82, -0.12 ],
    hemBackR:  [ 0.26,  0.82, -0.12 ]
  };

  const sTris = [];
  function addSTri(a, b, c) { sTris.push(...a, ...b, ...c); }
  function addSQuad(a, b, c, d) { addSTri(a, b, c); addSTri(a, c, d); }

  // Front V-Neck shirt panels (CCW facing out)
  addSTri(sv.collarL, sv.shoulderL, sv.chestL);
  addSTri(sv.collarL, sv.chestL, sv.vNeckTip);
  addSTri(sv.vNeckTip, sv.chestL, sv.chestMid);

  addSTri(sv.collarR, sv.chestR, sv.shoulderR);
  addSTri(sv.vNeckTip, sv.chestR, sv.collarR);
  addSTri(sv.vNeckTip, sv.chestMid, sv.chestR);

  // Lower front shirt
  addSQuad(sv.chestMid, sv.chestL, sv.hemFrontL, sv.hemFront);
  addSQuad(sv.chestMid, sv.hemFront, sv.hemFrontR, sv.chestR);

  // Sides of shirt
  addSQuad(sv.shoulderL, sv.chestL, sv.hemFrontL, sv.hemBackL);
  addSQuad(sv.shoulderL, sv.hemBackL, sv.backL, sv.neckBackL);
  addSQuad(sv.shoulderR, sv.hemFrontR, sv.chestR, sv.hemBackR);
  addSQuad(sv.shoulderR, sv.neckBackR, sv.backR, sv.hemBackR);

  // Back of shirt
  addSQuad(sv.neckBack, sv.neckBackL, sv.backL, sv.backMid);
  addSQuad(sv.neckBack, sv.backMid, sv.backR, sv.neckBackR);
  addSQuad(sv.backMid, sv.backL, sv.hemBackL, sv.hemBack);
  addSQuad(sv.backMid, sv.hemBack, sv.hemBackR, sv.backR);

  shirtGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sTris), 3));
  shirtGeo.computeVertexNormals();
  const shirt = new THREE.Mesh(shirtGeo, shirtMat);
  shirt.castShadow = true;
  shirt.receiveShadow = true;
  torsoGroup.add(shirt);

  // V-Neck exposed skin triangle (CCW: collarL -> vNeckTip -> collarR)
  const vNeckGeo = new THREE.BufferGeometry();
  const vNeckVertices = new Float32Array([
    sv.collarL[0], sv.collarL[1], sv.collarL[2],
    sv.vNeckTip[0], sv.vNeckTip[1], sv.vNeckTip[2],
    sv.collarR[0], sv.collarR[1], sv.collarR[2]
  ]);
  vNeckGeo.setAttribute('position', new THREE.BufferAttribute(vNeckVertices, 3));
  vNeckGeo.computeVertexNormals();
  const vNeck = new THREE.Mesh(vNeckGeo, skinMat);
  torsoGroup.add(vNeck);

  character.add(torsoGroup);

  // ==========================================
  // 5. ARMS & SLEEVES
  // Arm slope: ~14° downward (rotation.z = 0.24 rad)
  // Attached at X = ±0.28, Y = 1.25
  // ==========================================
  const armSlope = 0.24;

  // Left Arm Group
  const leftArmGroup = new THREE.Group();
  leftArmGroup.name = "LeftArm";
  leftArmGroup.position.set(-0.28, 1.25, 0);
  leftArmGroup.rotation.z = armSlope;
  leftArmGroup.rotation.y = -0.03;

  // Left Short Sleeve
  const sleeveGeo = makeFlat(new THREE.CylinderGeometry(0.12, 0.13, 0.20, 7));
  sleeveGeo.rotateZ(Math.PI * 0.5);
  const leftSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  leftSleeve.position.set(-0.10, 0, 0);
  leftArmGroup.add(leftSleeve);

  // Left Bare Arm
  const armGeo = makeFlat(new THREE.CylinderGeometry(0.085, 0.10, 0.28, 6));
  armGeo.rotateZ(Math.PI * 0.5);
  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.position.set(-0.32, 0, 0);
  leftArmGroup.add(leftArm);

  // Left Hand (Cute Chibi Mitten)
  const leftHandGroup = new THREE.Group();
  leftHandGroup.name = "LeftHand";
  leftHandGroup.position.set(-0.46, 0, 0);

  const palmGeo = makeFlat(new THREE.BoxGeometry(0.13, 0.07, 0.11));
  const leftPalm = new THREE.Mesh(palmGeo, skinMat);
  leftPalm.position.set(-0.06, 0, 0);
  leftHandGroup.add(leftPalm);

  const thumbGeo = makeFlat(new THREE.BoxGeometry(0.06, 0.045, 0.055));
  const leftThumb = new THREE.Mesh(thumbGeo, skinMat);
  leftThumb.position.set(-0.04, -0.03, 0.055);
  leftThumb.rotation.set(0.12, 0.35, 0.25);
  leftHandGroup.add(leftThumb);

  leftArmGroup.add(leftHandGroup);
  character.add(leftArmGroup);

  // Right Arm Group (mirrored)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.name = "RightArm";
  rightArmGroup.position.set(0.28, 1.25, 0);
  rightArmGroup.rotation.z = -armSlope;
  rightArmGroup.rotation.y = 0.03;

  const rightSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  rightSleeve.position.set(0.10, 0, 0);
  rightArmGroup.add(rightSleeve);

  const rightArm = new THREE.Mesh(armGeo, skinMat);
  rightArm.position.set(0.32, 0, 0);
  rightArmGroup.add(rightArm);

  const rightHandGroup = new THREE.Group();
  rightHandGroup.name = "RightHand";
  rightHandGroup.position.set(0.46, 0, 0);

  const rightPalm = new THREE.Mesh(palmGeo, skinMat);
  rightPalm.position.set(0.06, 0, 0);
  rightHandGroup.add(rightPalm);

  const rightThumb = new THREE.Mesh(thumbGeo, skinMat);
  rightThumb.position.set(0.04, -0.03, 0.055);
  rightThumb.rotation.set(0.12, -0.35, -0.25);
  rightHandGroup.add(rightThumb);

  rightArmGroup.add(rightHandGroup);
  character.add(rightArmGroup);

  // ==========================================
  // 6. PANTS & PELVIS
  // Crotch junction at Y = 0.65
  // Spans Y = 0.82 down to Y = 0.65
  // ==========================================
  const pelvisGeo = makeFlat(new THREE.CylinderGeometry(0.26, 0.24, 0.17, 8));
  pelvisGeo.scale(1.02, 1, 0.72);
  const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
  pelvis.position.set(0, 0.735, 0);
  character.add(pelvis);

  // ==========================================
  // 7. LEGS & FEET (Short, Chunky Chibi Legs)
  // Legs span Y = 0.65 down to ankle Y = 0.12 (height: 0.53)
  // X = ±0.155
  // ==========================================
  const legGeo = makeFlat(new THREE.CylinderGeometry(0.12, 0.10, 0.53, 7));

  // Left Leg
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.name = "LeftLeg";
  leftLeg.position.set(-0.155, 0.385, 0);
  character.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.name = "RightLeg";
  rightLeg.position.set(0.155, 0.385, 0);
  character.add(rightLeg);

  // Bare peach feet — flat, wide, cute rounded chibi feet!
  // Height: 0.12 (Y: 0 to 0.12), Width: 0.16, Depth: 0.22
  const footBaseGeo = new THREE.BoxGeometry(0.16, 0.12, 0.22);
  const footPos = footBaseGeo.attributes.position;
  for (let i = 0; i < footPos.count; i++) {
    let x = footPos.getX(i);
    let y = footPos.getY(i);
    let z = footPos.getZ(i);
    // Slope the top gently toward the front
    if (z > 0.0 && y > 0.0) {
      y -= (z / 0.11) * 0.035;
      x *= 0.95;
    }
    footPos.setXYZ(i, x, y, z);
  }
  const footGeo = makeFlat(footBaseGeo);

  // Left Foot
  const leftFoot = new THREE.Mesh(footGeo, skinMat);
  leftFoot.position.set(-0.155, 0.06, 0.03);
  leftFoot.rotation.y = 0.05;
  character.add(leftFoot);

  // Right Foot
  const rightFoot = new THREE.Mesh(footGeo, skinMat);
  rightFoot.position.set(0.155, 0.06, 0.03);
  rightFoot.rotation.y = -0.05;
  character.add(rightFoot);

  // Helper method to set colors dynamically
  function setColors(newColors) {
    if (newColors.skin) skinMat.color.set(newColors.skin);
    if (newColors.hair) hairMat.color.set(newColors.hair);
    if (newColors.shirt) shirtMat.color.set(newColors.shirt);
    if (newColors.pants) pantsMat.color.set(newColors.pants);
    if (newColors.eyes) eyeMat.color.set(newColors.eyes);
    if (newColors.eyebrows) eyebrowMat.color.set(newColors.eyebrows);
  }

  // Helper method to toggle wireframe
  function setWireframe(enabled) {
    skinMat.wireframe = enabled;
    hairMat.wireframe = enabled;
    shirtMat.wireframe = enabled;
    pantsMat.wireframe = enabled;
    eyeMat.wireframe = enabled;
    eyebrowMat.wireframe = enabled;
    hairTieMat.wireframe = enabled;
  }

  return {
    model: character,
    parts: {
      headGroup,
      hairGroup,
      leftEye,
      rightEye,
      leftEyebrow,
      rightEyebrow,
      leftArmGroup,
      rightArmGroup,
      leftHandGroup,
      rightHandGroup,
      leftLeg,
      rightLeg
    },
    materials: {
      skin: skinMat,
      hair: hairMat,
      shirt: shirtMat,
      pants: pantsMat,
      eyes: eyeMat,
      eyebrows: eyebrowMat,
      hairTie: hairTieMat
    },
    setColors,
    setWireframe
  };
}
