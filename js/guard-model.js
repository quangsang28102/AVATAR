import * as THREE from 'three';

/**
 * Exact color palette tuned to the Guard reference image (guard_ref.png)
 */
export const GUARD_DEFAULT_COLORS = {
  steel:       '#898793', // Main cool-neutral slate steel
  steelDark:   '#615f6b', // Shadowed/inner steel facets & back armor
  steelLight:  '#bdbbc4', // Highlight steel facets (crest, brow rim, bracer rim, shield rim, umbo)
  innerCavity: '#241f27', // Dark interior cavity inside helmet
  skin:        '#f3b48b', // Warm peach chibi face & hands
  eyes:        '#151318', // Deep glossy black capsule eyes
  underShirt:  '#402b22', // Muted dark brown tunic/sleeves under armor
  belt:        '#4e3120', // Muted dark brown leather belt
  buckle:      '#b8894f', // Warm antique brass rectangular belt buckle
  woodPlank:   '#8f593e', // Primary muted oak wood plank
  woodDark:    '#663d28', // Darker oak wood plank & seam backing
  woodLight:   '#9c6548', // Subtle warmer wood plank variation
  pants:       '#452d21', // Dark muted brown breeches
  boots:       '#724630', // Muted brown leather boots
  cuff:        '#5e3824', // Boot cuff rim
  rivets:      '#d6d4dc', // Silver-grey rivets on shield rim
  ember:       '#ff8a1e', // Ambient floating ember sparks
  shieldRimGlow:  '#ffc76a', // Warm golden guardian rim glow
  shieldCoreGlow: '#72dfff'  // Light cyan guardian core & defend aura
};

/**
 * Convert geometry to non-indexed with crisp face normals for consistent
 * low-poly flat shading both in Three.js and exported GLB/OBJ assets.
 */
function makeFlat(geo) {
  const nonIndexed = geo.index ? geo.toNonIndexed() : geo;
  nonIndexed.computeVertexNormals();
  return nonIndexed;
}

/**
 * Rounded chibi head geometry (soft square-oval low-poly profile)
 */
function createRoundedHeadGeo(rx, ry, rz, segW = 16, segH = 12) {
  const geo = new THREE.SphereGeometry(1, segW, segH);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Superellipsoid-like softness so cheeks and chin are plump rather than pointy
    const sx = Math.sign(v.x) * Math.pow(Math.abs(v.x), 0.78);
    const sy = Math.sign(v.y) * Math.pow(Math.abs(v.y), 0.82);
    const sz = Math.sign(v.z) * Math.pow(Math.abs(v.z), 0.80);
    // Slight lower-cheek fullness
    const cheekBoost = v.y < 0 ? 1.0 + 0.06 * (1.0 - Math.abs(v.y)) : 1.0;
    pos.setXYZ(i, sx * rx * cheekBoost, sy * ry, sz * rz);
  }

  geo.computeVertexNormals();
  return geo;
}

/**
 * Helper to create a curved thick shell arc (for cheek guards and neck plate)
 */
function createCurvedShellArcGeo(
  thetaStart,
  thetaEnd,
  yTop,
  yBot,
  rOuterTop,
  rOuterBot,
  thickness,
  arcSegs = 4,
  zScale = 1.04
) {
  const positions = [];
  const pushTri = (a, b, c) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };
  const pushQuad = (a, b, c, d) => {
    pushTri(a, b, c);
    pushTri(a, c, d);
  };

  const pt = (theta, y, r) => [
    Math.sin(theta) * r,
    y,
    Math.cos(theta) * r * zScale
  ];

  const rInnerTop = rOuterTop - thickness;
  const rInnerBot = rOuterBot - thickness;

  for (let i = 0; i < arcSegs; i++) {
    const t0 = thetaStart + (thetaEnd - thetaStart) * (i / arcSegs);
    const t1 = thetaStart + (thetaEnd - thetaStart) * ((i + 1) / arcSegs);

    const oT0 = pt(t0, yTop, rOuterTop);
    const oT1 = pt(t1, yTop, rOuterTop);
    const oB0 = pt(t0, yBot, rOuterBot);
    const oB1 = pt(t1, yBot, rOuterBot);

    const iT0 = pt(t0, yTop, rInnerTop);
    const iT1 = pt(t1, yTop, rInnerTop);
    const iB0 = pt(t0, yBot, rInnerBot);
    const iB1 = pt(t1, yBot, rInnerBot);

    // Outer face
    pushQuad(oT0, oB0, oB1, oT1);
    // Inner face
    pushQuad(iT1, iB1, iB0, iT0);
    // Top cap
    pushQuad(iT0, oT0, oT1, iT1);
    // Bottom cap
    pushQuad(oB0, iB0, iB1, oB1);

    if (i === 0) {
      // Start side cap
      pushQuad(iT0, iB0, oB0, oT0);
    }
    if (i === arcSegs - 1) {
      // End side cap
      pushQuad(oT1, oB1, iB1, iT1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Helper to create a sleek faceted crest ridge hugging the helmet dome profile
 */
function createArchedCrestGeo(profilePts, halfWidthBase, halfWidthTop, zScale = 1.04) {
  const positions = [];
  const pushTri = (a, b, c) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };
  const pushQuad = (a, b, c, d) => {
    pushTri(a, b, c);
    pushTri(a, c, d);
  };

  for (let i = 0; i < profilePts.length - 1; i++) {
    const p0 = profilePts[i];
    const p1 = profilePts[i + 1];

    const lB0 = [-halfWidthBase, p0.iy, p0.iz * zScale];
    const rB0 = [ halfWidthBase, p0.iy, p0.iz * zScale];
    const lT0 = [-halfWidthTop,  p0.oy, p0.oz * zScale];
    const rT0 = [ halfWidthTop,  p0.oy, p0.oz * zScale];

    const lB1 = [-halfWidthBase, p1.iy, p1.iz * zScale];
    const rB1 = [ halfWidthBase, p1.iy, p1.iz * zScale];
    const lT1 = [-halfWidthTop,  p1.oy, p1.oz * zScale];
    const rT1 = [ halfWidthTop,  p1.oy, p1.oz * zScale];

    // Top ridge surface (+Y outward)
    pushQuad(lT0, rT0, rT1, lT1);
    // Left beveled flank (-X outward)
    pushQuad(lB0, lT0, lT1, lB1);
    // Right beveled flank (+X outward)
    pushQuad(rT0, rB0, rB1, rT1);

    if (i === 0) {
      // Front end cap (+Z outward)
      pushQuad(lT0, lB0, rB0, rT0);
    }
    if (i === profilePts.length - 2) {
      // Rear end cap (-Z outward)
      pushQuad(rT1, rB1, lB1, lT1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Helper to build a single vertical wooden plank clipped cleanly inside radius rClip
 */
function createClippedPlankGeo(x0, x1, rClip, depth) {
  const shape = new THREE.Shape();
  const sampleY = (x) => Math.sqrt(Math.max(0, rClip * rClip - x * x));
  const steps = 6;

  // Bottom arc left -> right
  shape.moveTo(x0, -sampleY(x0));
  for (let i = 1; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    shape.lineTo(x, -sampleY(x));
  }
  // Right vertical edge -> top arc right -> left
  for (let i = steps; i >= 0; i--) {
    const x = x0 + ((x1 - x0) * i) / steps;
    shape.lineTo(x, sampleY(x));
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 8
  });
  geo.translate(0, 0, -depth * 0.5);
  return makeFlat(geo);
}

/**
 * Helper to create the beveled circular rim of the shield
 */
function createBeveledShieldRimGeo(rOuter, rInner, depth, segments = 28) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOuter, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rInner, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.006,
    bevelSegments: 1,
    curveSegments: segments
  });
  geo.translate(0, 0, -depth * 0.5);
  return makeFlat(geo);
}

/**
 * Helper to create a smooth radial additive glow ring with zero external textures.
 * Stores grayscale intensity vertex colors [0 -> 1 -> 0] so material.color tints dynamically.
 */
function createAdditiveGlowRingGeo(rInner, rPeak, rOuter, segments = 44) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const normals = [];
  const indices = [];

  const rings = [
    { r: rInner, intensity: 0.0 },
    { r: rPeak, intensity: 1.0 },
    { r: rOuter, intensity: 0.0 }
  ];

  const vertsPerRing = segments + 1;
  rings.forEach((ring) => {
    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      const x = Math.cos(theta) * ring.r;
      const y = Math.sin(theta) * ring.r;
      positions.push(x, y, 0);
      normals.push(0, 0, 1);
      colors.push(ring.intensity, ring.intensity, ring.intensity);
    }
  });

  // Connect adjacent concentric rings with CCW winding facing +Z
  for (let rIdx = 0; rIdx < rings.length - 1; rIdx++) {
    const rowA = rIdx * vertsPerRing;
    const rowB = (rIdx + 1) * vertsPerRing;
    for (let s = 0; s < segments; s++) {
      const i0 = rowA + s;
      const o0 = rowB + s;
      const o1 = rowB + s + 1;
      const i1 = rowA + s + 1;
      indices.push(i0, o0, o1, i0, o1, i1);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return geo;
}

/**
 * Helper to create a clean low-poly boot foot with flat sole and gently sloped toe
 */
function createBootFootGeo(width = 0.098, height = 0.062, heelZ = -0.052, toeZ = 0.088) {
  // Side profile in XY (X = Z forward, Y = height), then extruded along width and rotated
  const profile = new THREE.Shape();
  profile.moveTo(heelZ, 0.0);
  profile.lineTo(toeZ, 0.0);
  profile.lineTo(toeZ, 0.022);
  profile.lineTo(toeZ - 0.045, 0.046);
  profile.lineTo(0.015, height);
  profile.lineTo(heelZ, height);
  profile.closePath();

  const geo = new THREE.ExtrudeGeometry(profile, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1
  });
  geo.translate(0, 0, -width * 0.5);
  // Rotate so profile's X maps to +Z (forward) and extrusion Z maps to X (width)
  geo.rotateY(-Math.PI * 0.5);
  return makeFlat(geo);
}

/**
 * Helper to create a sculpted faceted steel armor panel from 8 corner vertices
 * Top quad (tFL, tFR, tBR, tBL) and Bottom quad (bFL, bFR, bBR, bBL)
 */
function createTaperedArmorGeo(tFL, tFR, tBR, tBL, bFL, bFR, bBR, bBL) {
  const positions = [];
  const pushTri = (a, b, c) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };
  const pushQuad = (a, b, c, d) => {
    pushTri(a, b, c);
    pushTri(a, c, d);
  };

  // Front (+Z)
  pushQuad(tFL, bFL, bFR, tFR);
  // Back (-Z)
  pushQuad(tBR, bBR, bBL, tBL);
  // Left (-X)
  pushQuad(tBL, bBL, bFL, tFL);
  // Right (+X)
  pushQuad(tFR, bFR, bBR, tBR);
  // Top (+Y)
  pushQuad(tBL, tFL, tFR, tBR);
  // Bottom (-Y)
  pushQuad(bFL, bBL, bBR, bFR);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a low-poly faceted Chibi Guard / Knight 3D model matching guard_ref.png
 */
export function createGuardCharacter(customColors = {}) {
  const colors = { ...GUARD_DEFAULT_COLORS, ...customColors };
  const guardGroup = new THREE.Group();
  guardGroup.name = 'ChibiGuard';

  // ==========================================
  // 1. MATERIALS (PBR + Faceted Flat Shading)
  // ==========================================
  const steelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.steel),
    roughness: 0.54,
    metalness: 0.28,
    flatShading: true
  });

  const steelDarkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.steelDark),
    roughness: 0.60,
    metalness: 0.24,
    flatShading: true
  });

  const steelLightMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.steelLight),
    roughness: 0.44,
    metalness: 0.36,
    flatShading: true
  });

  const innerCavityMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.innerCavity),
    roughness: 0.94,
    metalness: 0.0,
    flatShading: true
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.skin),
    roughness: 0.82,
    metalness: 0.02,
    flatShading: false
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyes),
    roughness: 0.14,
    metalness: 0.06
  });

  const underShirtMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.underShirt),
    roughness: 0.88,
    metalness: 0.04,
    flatShading: true
  });

  const beltMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.belt),
    roughness: 0.84,
    metalness: 0.04,
    flatShading: true
  });

  const buckleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.buckle),
    roughness: 0.36,
    metalness: 0.62,
    flatShading: true
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.woodPlank),
    roughness: 0.86,
    metalness: 0.04,
    flatShading: true
  });

  const woodDarkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.woodDark),
    roughness: 0.88,
    metalness: 0.04,
    flatShading: true
  });

  const woodLightMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.woodLight),
    roughness: 0.85,
    metalness: 0.04,
    flatShading: true
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.pants),
    roughness: 0.90,
    metalness: 0.03,
    flatShading: true
  });

  const bootsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.boots),
    roughness: 0.84,
    metalness: 0.04,
    flatShading: true
  });

  const cuffMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.cuff),
    roughness: 0.86,
    metalness: 0.04,
    flatShading: true
  });

  const rivetsMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.rivets),
    roughness: 0.32,
    metalness: 0.68,
    flatShading: true
  });

  const emberMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.ember),
    emissive: new THREE.Color('#ff6a00'),
    emissiveIntensity: 2.1,
    roughness: 0.25,
    flatShading: true
  });

  const shieldRimGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.shieldRimGlow),
    emissive: new THREE.Color(colors.shieldRimGlow),
    emissiveIntensity: 0.78,
    roughness: 0.25,
    metalness: 0.15
  });

  const shieldCoreGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.shieldCoreGlow),
    emissive: new THREE.Color(colors.shieldCoreGlow),
    emissiveIntensity: 0.62,
    roughness: 0.22,
    metalness: 0.1
  });

  const materials = {
    steelMat,
    steelDarkMat,
    steelLightMat,
    innerCavityMat,
    skinMat,
    eyeMat,
    underShirtMat,
    beltMat,
    buckleMat,
    woodMat,
    woodDarkMat,
    woodLightMat,
    pantsMat,
    bootsMat,
    cuffMat,
    rivetsMat,
    emberMat,
    shieldRimGlowMat,
    shieldCoreGlowMat
  };

  // ==========================================
  // HIERARCHY ROOT GROUPS (Total height ~ 1.00)
  // ==========================================
  // Front view (+Z forward):
  // -X (Screen Left)  = Character's RIGHT side (outstretched arm)
  // +X (Screen Right) = Character's LEFT side (shield arm)
  const headGroup = new THREE.Group();
  headGroup.name = 'headGroup';
  headGroup.position.set(0, 0.685, 0);

  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'torsoGroup';
  torsoGroup.position.set(0, 0.43, 0);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.name = 'rightArmGroup';
  rightArmGroup.position.set(-0.18, 0.50, 0);

  const leftArmGroup = new THREE.Group();
  leftArmGroup.name = 'leftArmGroup';
  leftArmGroup.position.set(0.18, 0.50, 0);

  const shieldGroup = new THREE.Group();
  shieldGroup.name = 'shieldGroup';
  // Positioned forward & outward (+X/+Z) with +Y tilt so left rim cleanly clears tassetCL
  // while keeping near-full shield face visibility in front view and tight back-handle grip
  shieldGroup.position.set(0.272, 0.328, 0.175);
  shieldGroup.rotation.set(0.03, 0.18, 0.03);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.name = 'rightLegGroup';
  rightLegGroup.position.set(-0.082, 0.21, 0);

  const leftLegGroup = new THREE.Group();
  leftLegGroup.name = 'leftLegGroup';
  leftLegGroup.position.set(0.082, 0.21, 0);

  const emberGroup = new THREE.Group();
  emberGroup.name = 'emberGroup';

  // ==========================================
  // 2. HEAD & CHIBI FACE (headGroup)
  // ==========================================
  // Soft rounded low-poly chibi face with full cheeks and gentle chin
  const faceGeo = createRoundedHeadGeo(0.172, 0.146, 0.164, 14, 10);
  const faceMesh = new THREE.Mesh(faceGeo, skinMat);
  faceMesh.position.set(0, -0.008, 0.014);
  faceMesh.castShadow = true;
  faceMesh.receiveShadow = true;
  headGroup.add(faceMesh);

  // Glossy black vertical capsule pill eyes (centered comfortably below brow, no blush/eyebrows)
  const eyeGeo = new THREE.CapsuleGeometry(0.0165, 0.028, 5, 10);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.058, -0.020, 0.166);
  leftEye.castShadow = true;
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(-0.058, -0.020, 0.166);
  rightEye.castShadow = true;
  headGroup.add(rightEye);

  // Dark inner cowl cavity tucked high under helmet brow (leaves warm forehead above eyes!)
  const innerCowlGeo = new THREE.CylinderGeometry(0.186, 0.180, 0.095, 12);
  const innerCowl = new THREE.Mesh(makeFlat(innerCowlGeo), innerCavityMat);
  innerCowl.position.set(0, 0.088, 0.012);
  innerCowl.scale.set(1.0, 1.0, 1.03);
  headGroup.add(innerCowl);

  // Subtle recessed brow shadow lip tucked high under visor rim (well above eyes)
  const browShadowGeo = new THREE.BoxGeometry(0.242, 0.018, 0.040);
  const browShadow = new THREE.Mesh(makeFlat(browShadowGeo), underShirtMat);
  browShadow.position.set(0, 0.044, 0.156);
  browShadow.rotation.x = 0.18;
  headGroup.add(browShadow);

  // ==========================================
  // 3. KNIGHT HELMET (helmetGroup — Rounded Faceted Dome)
  // ==========================================
  const helmetGroup = new THREE.Group();
  helmetGroup.name = 'helmetGroup';
  const helmetZScale = 1.04;

  // Seamless 12-gon rounded dome tiers (low rounded profile, stepped slightly over cheek/neck)
  // Tier 1: Lower Helmet Ring Band (y: 0.046 -> 0.120)
  const baseBandGeo = makeFlat(new THREE.CylinderGeometry(0.224, 0.220, 0.074, 12));
  baseBandGeo.rotateY(Math.PI / 12);
  const baseBandMesh = new THREE.Mesh(baseBandGeo, steelMat);
  baseBandMesh.position.set(0, 0.083, 0);
  baseBandMesh.scale.set(1.0, 1.0, helmetZScale);
  baseBandMesh.castShadow = true;
  baseBandMesh.receiveShadow = true;
  helmetGroup.add(baseBandMesh);

  // Tier 2: Mid-Cranium Dome (y: 0.120 -> 0.196)
  const midDomeGeo = makeFlat(new THREE.CylinderGeometry(0.186, 0.224, 0.076, 12));
  midDomeGeo.rotateY(Math.PI / 12);
  const midDomeMesh = new THREE.Mesh(midDomeGeo, steelMat);
  midDomeMesh.position.set(0, 0.158, 0);
  midDomeMesh.scale.set(1.0, 1.0, helmetZScale);
  midDomeMesh.castShadow = true;
  midDomeMesh.receiveShadow = true;
  helmetGroup.add(midDomeMesh);

  // Tier 3: Top Cranium Dome (y: 0.196 -> 0.258)
  const topDomeGeo = makeFlat(new THREE.CylinderGeometry(0.114, 0.186, 0.062, 12));
  topDomeGeo.rotateY(Math.PI / 12);
  const topDomeMesh = new THREE.Mesh(topDomeGeo, steelLightMat);
  topDomeMesh.position.set(0, 0.227, 0);
  topDomeMesh.scale.set(1.0, 1.0, helmetZScale);
  topDomeMesh.castShadow = true;
  topDomeMesh.receiveShadow = true;
  helmetGroup.add(topDomeMesh);

  // Tier 4: Low Rounded Crown Cap (y: 0.258 -> 0.290, flat-rounded dome top)
  const apexGeo = makeFlat(new THREE.CylinderGeometry(0.036, 0.114, 0.032, 12));
  apexGeo.rotateY(Math.PI / 12);
  const apexMesh = new THREE.Mesh(apexGeo, steelLightMat);
  apexMesh.position.set(0, 0.274, 0);
  apexMesh.scale.set(1.0, 1.0, helmetZScale);
  apexMesh.castShadow = true;
  apexMesh.receiveShadow = true;
  helmetGroup.add(apexMesh);

  // Sleek Arched Central Ridge Crest hugging dome curvature (crestGroup)
  const crestGroup = new THREE.Group();
  crestGroup.name = 'crestGroup';
  const crestProfile = [
    { iy: 0.044, iz: 0.212, oy: 0.048, oz: 0.244 }, // Forehead brow anchor
    { iy: 0.118, iz: 0.214, oy: 0.128, oz: 0.246 },
    { iy: 0.193, iz: 0.176, oy: 0.210, oz: 0.206 },
    { iy: 0.254, iz: 0.107, oy: 0.278, oz: 0.127 },
    { iy: 0.284, iz: 0.034, oy: 0.312, oz: 0.040 }, // Front crown
    { iy: 0.284, iz: -0.034, oy: 0.312, oz: -0.040 }, // Rear crown
    { iy: 0.254, iz: -0.107, oy: 0.278, oz: -0.127 },
    { iy: 0.193, iz: -0.176, oy: 0.210, oz: -0.206 },
    { iy: 0.118, iz: -0.214, oy: 0.128, oz: -0.246 },
    { iy: 0.048, iz: -0.210, oy: 0.052, oz: -0.236 } // Back dome end
  ];
  const crestMesh = new THREE.Mesh(
    createArchedCrestGeo(crestProfile, 0.025, 0.016, helmetZScale),
    steelLightMat
  );
  crestMesh.castShadow = true;
  crestMesh.receiveShadow = true;
  crestGroup.add(crestMesh);
  helmetGroup.add(crestGroup);

  // Curved Shallow V-shaped Brow Visor Rim wrapping smoothly around front dome (NO poking box horns)
  const leftVisorGeo = createCurvedShellArcGeo(
    0.04,
    0.72,
    0.088,
    0.042,
    0.228,
    0.225,
    0.034,
    3,
    helmetZScale
  );
  const leftVisor = new THREE.Mesh(leftVisorGeo, steelLightMat);
  leftVisor.rotation.z = 0.08;
  leftVisor.castShadow = true;
  leftVisor.receiveShadow = true;
  helmetGroup.add(leftVisor);

  const rightVisorGeo = createCurvedShellArcGeo(
    -0.72,
    -0.04,
    0.088,
    0.042,
    0.228,
    0.225,
    0.034,
    3,
    helmetZScale
  );
  const rightVisor = new THREE.Mesh(rightVisorGeo, steelLightMat);
  rightVisor.rotation.z = -0.08;
  rightVisor.castShadow = true;
  rightVisor.receiveShadow = true;
  helmetGroup.add(rightVisor);

  // Center brow joiner peak + Short Stubby Nasal Guard Bar (ends around upper eye level)
  const visorPeakGeo = makeFlat(new THREE.BoxGeometry(0.050, 0.050, 0.052));
  const visorPeak = new THREE.Mesh(visorPeakGeo, steelLightMat);
  visorPeak.position.set(0, 0.062, 0.232);
  visorPeak.rotation.x = -0.06;
  visorPeak.castShadow = true;
  helmetGroup.add(visorPeak);

  const nasalGeo = makeFlat(new THREE.BoxGeometry(0.044, 0.046, 0.046));
  const nasalMesh = new THREE.Mesh(nasalGeo, steelLightMat);
  nasalMesh.position.set(0, 0.022, 0.230);
  nasalMesh.castShadow = true;
  helmetGroup.add(nasalMesh);

  // Curved Cheek Guards tucked cleanly under baseBandMesh rim (eliminates Z-fighting!)
  // Left Cheek Guard (Screen Right, +X): theta from ~0.62 rad to ~1.72 rad
  const leftCheekGeo = createCurvedShellArcGeo(
    0.62,
    1.72,
    0.050,
    -0.114,
    0.212,
    0.200,
    0.042,
    4,
    helmetZScale
  );
  const leftCheek = new THREE.Mesh(leftCheekGeo, steelMat);
  leftCheek.castShadow = true;
  leftCheek.receiveShadow = true;
  helmetGroup.add(leftCheek);

  // Right Cheek Guard (Screen Left, -X): theta from ~-1.72 rad to ~-0.62 rad
  const rightCheekGeo = createCurvedShellArcGeo(
    -1.72,
    -0.62,
    0.050,
    -0.114,
    0.212,
    0.200,
    0.042,
    4,
    helmetZScale
  );
  const rightCheek = new THREE.Mesh(rightCheekGeo, steelMat);
  rightCheek.castShadow = true;
  rightCheek.receiveShadow = true;
  helmetGroup.add(rightCheek);

  // Subtle front beveled cheek edges framing face opening cleanly
  const cheekTabGeo = makeFlat(new THREE.BoxGeometry(0.032, 0.148, 0.038));
  const leftCheekTab = new THREE.Mesh(cheekTabGeo, steelLightMat);
  leftCheekTab.position.set(0.130, -0.036, 0.172);
  leftCheekTab.rotation.set(0.04, -0.48, 0.08);
  leftCheekTab.castShadow = true;
  helmetGroup.add(leftCheekTab);

  const rightCheekTab = new THREE.Mesh(cheekTabGeo.clone(), steelLightMat);
  rightCheekTab.position.set(-0.130, -0.036, 0.172);
  rightCheekTab.rotation.set(0.04, 0.48, -0.08);
  rightCheekTab.castShadow = true;
  helmetGroup.add(rightCheekTab);

  // Seamless Rear Neck Guard tucked cleanly under baseBandMesh (zero Z-fighting teeth!)
  const neckPlateGeo = createCurvedShellArcGeo(
    1.68,
    4.60,
    0.050,
    -0.108,
    0.212,
    0.208,
    0.040,
    6,
    helmetZScale
  );
  const neckPlate = new THREE.Mesh(neckPlateGeo, steelDarkMat);
  neckPlate.castShadow = true;
  neckPlate.receiveShadow = true;
  helmetGroup.add(neckPlate);

  headGroup.add(helmetGroup);
  guardGroup.add(headGroup);

  // ==========================================
  // 4. TORSO, CUIRASS, BELT & TASSETS (torsoGroup)
  // ==========================================
  // Inner dark tunic strictly tucked inside armor (never protrudes through chest/back)
  const tunicMesh = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.128, 0.132, 0.21, 10)),
    underShirtMat
  );
  tunicMesh.position.set(0, 0.01, 0);
  tunicMesh.castShadow = true;
  torsoGroup.add(tunicMesh);

  // Dark inner neck recess under chin/helmet
  const neckShadowMesh = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.108, 0.125, 0.065, 10)),
    innerCavityMat
  );
  neckShadowMesh.position.set(0, 0.125, 0);
  torsoGroup.add(neckShadowMesh);

  // Unified Seamless Steel Cuirass (cuirassGroup)
  const cuirassGroup = new THREE.Group();
  cuirassGroup.name = 'cuirassGroup';

  // Shared vertices for seamless chest + sternum keel + side wrap + back plate
  const chestTopY = 0.095;
  const chestBotY = -0.072;

  // Left chest panel (Viewer's Right, +X)
  const leftChestGeo = createTaperedArmorGeo(
    [0.004, chestTopY, 0.158],   // tFL (center keel top)
    [0.168, chestTopY, 0.088],   // tFR (outer shoulder-chest)
    [0.168, chestTopY, -0.068],  // tBR (side-back join)
    [0.004, chestTopY, 0.010],   // tBL (interior)
    [0.004, chestBotY, 0.148],   // bFL (center waist)
    [0.145, chestBotY, 0.082],   // bFR (outer waist)
    [0.145, chestBotY, -0.065],  // bBR
    [0.004, chestBotY, 0.010]    // bBL
  );
  const leftChest = new THREE.Mesh(leftChestGeo, steelMat);
  leftChest.castShadow = true;
  leftChest.receiveShadow = true;
  cuirassGroup.add(leftChest);

  // Right chest panel (Viewer's Left, -X)
  const rightChestGeo = createTaperedArmorGeo(
    [-0.168, chestTopY, 0.088],  // tFL
    [-0.004, chestTopY, 0.158],  // tFR
    [-0.004, chestTopY, 0.010],  // tBR
    [-0.168, chestTopY, -0.068], // tBL
    [-0.145, chestBotY, 0.082],  // bFL
    [-0.004, chestBotY, 0.148],  // bFR
    [-0.004, chestBotY, 0.010],  // bBR
    [-0.145, chestBotY, -0.065]  // bBL
  );
  const rightChest = new THREE.Mesh(rightChestGeo, steelMat);
  rightChest.castShadow = true;
  rightChest.receiveShadow = true;
  cuirassGroup.add(rightChest);

  // Integrated V-keel center ridge (two angled steel facets meeting smoothly at x = 0, NO raised boxy stick)
  const sternumKeelGeo = createTaperedArmorGeo(
    [-0.004, chestTopY + 0.002, 0.162],
    [ 0.004, chestTopY + 0.002, 0.162],
    [ 0.024, chestTopY, 0.148],
    [-0.024, chestTopY, 0.148],
    [-0.004, chestBotY, 0.152],
    [ 0.004, chestBotY, 0.152],
    [ 0.020, chestBotY, 0.142],
    [-0.020, chestBotY, 0.142]
  );
  const sternumKeel = new THREE.Mesh(sternumKeelGeo, steelLightMat);
  sternumKeel.castShadow = true;
  cuirassGroup.add(sternumKeel);

  // Contoured Back Plate joining leftChest and rightChest seamlessly with zero gap
  const backPlateGeo = createTaperedArmorGeo(
    [-0.168, chestTopY, -0.062],
    [ 0.168, chestTopY, -0.062],
    [ 0.128, chestTopY, -0.145],
    [-0.128, chestTopY, -0.145],
    [-0.145, chestBotY, -0.060],
    [ 0.145, chestBotY, -0.060],
    [ 0.115, chestBotY, -0.132],
    [-0.115, chestBotY, -0.132]
  );
  const backPlate = new THREE.Mesh(backPlateGeo, steelDarkMat);
  backPlate.castShadow = true;
  backPlate.receiveShadow = true;
  cuirassGroup.add(backPlate);

  // Collar Gorget Rim (clean beveled steel collar hugging upper chest)
  const gorgetGeo = makeFlat(new THREE.CylinderGeometry(0.122, 0.156, 0.026, 10));
  const gorgetMesh = new THREE.Mesh(gorgetGeo, steelMat);
  gorgetMesh.position.set(0, 0.104, 0.004);
  gorgetMesh.scale.set(1.04, 1.0, 0.96);
  gorgetMesh.castShadow = true;
  cuirassGroup.add(gorgetMesh);

  torsoGroup.add(cuirassGroup);

  // 4.2 Leather Belt & Brass Buckle
  const beltMesh = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.154, 0.158, 0.048, 12)),
    beltMat
  );
  beltMesh.position.set(0, -0.094, 0.005);
  beltMesh.scale.set(1.02, 1.0, 0.96);
  beltMesh.castShadow = true;
  beltMesh.receiveShadow = true;
  torsoGroup.add(beltMesh);

  const buckleFrame = new THREE.Mesh(
    makeFlat(new THREE.BoxGeometry(0.066, 0.052, 0.020)),
    buckleMat
  );
  buckleFrame.position.set(0, -0.094, 0.156);
  buckleFrame.castShadow = true;
  torsoGroup.add(buckleFrame);

  const buckleInner = new THREE.Mesh(
    makeFlat(new THREE.BoxGeometry(0.036, 0.028, 0.024)),
    beltMat
  );
  buckleInner.position.set(0, -0.094, 0.156);
  torsoGroup.add(buckleInner);

  // 4.3 Short Hip-Hugging Steel Tassets (tassetCL, tassetCR, tassetL, tassetR, tassetB)
  const innerSkirtCore = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.130, 0.142, 0.092, 10)),
    innerCavityMat
  );
  innerSkirtCore.position.set(0, -0.158, 0);
  torsoGroup.add(innerSkirtCore);

  const frontTassetGeo = createTaperedArmorGeo(
    [-0.048, 0.050,  0.014],
    [ 0.048, 0.050,  0.014],
    [ 0.046, 0.050, -0.012],
    [-0.046, 0.050, -0.012],
    [-0.060, -0.050, 0.014],
    [ 0.060, -0.050, 0.014],
    [ 0.056, -0.050, -0.012],
    [-0.056, -0.050, -0.012]
  );

  // Center-Left Tasset (Viewer's Right, +X)
  const tassetCL = new THREE.Mesh(frontTassetGeo, steelMat);
  tassetCL.position.set(0.056, -0.164, 0.146);
  tassetCL.rotation.set(-0.14, 0.22, 0.04);
  tassetCL.castShadow = true;
  tassetCL.receiveShadow = true;
  torsoGroup.add(tassetCL);

  // Center-Right Tasset (Viewer's Left, -X)
  const tassetCR = new THREE.Mesh(frontTassetGeo.clone(), steelMat);
  tassetCR.position.set(-0.056, -0.164, 0.146);
  tassetCR.rotation.set(-0.14, -0.22, -0.04);
  tassetCR.castShadow = true;
  tassetCR.receiveShadow = true;
  torsoGroup.add(tassetCR);

  const sideTassetGeo = createTaperedArmorGeo(
    [-0.054, 0.050,  0.013],
    [ 0.054, 0.050,  0.013],
    [ 0.050, 0.050, -0.013],
    [-0.050, 0.050, -0.013],
    [-0.066, -0.050, 0.013],
    [ 0.066, -0.050, 0.013],
    [ 0.062, -0.050, -0.013],
    [-0.062, -0.050, -0.013]
  );

  // Left Lateral Tasset (+X)
  const tassetL = new THREE.Mesh(sideTassetGeo, steelDarkMat);
  tassetL.position.set(0.146, -0.164, 0.042);
  tassetL.rotation.set(0.04, 1.15, 0.10);
  tassetL.castShadow = true;
  tassetL.receiveShadow = true;
  torsoGroup.add(tassetL);

  // Right Lateral Tasset (-X)
  const tassetR = new THREE.Mesh(sideTassetGeo.clone(), steelMat);
  tassetR.position.set(-0.146, -0.164, 0.042);
  tassetR.rotation.set(0.04, -1.15, -0.10);
  tassetR.castShadow = true;
  tassetR.receiveShadow = true;
  torsoGroup.add(tassetR);

  // Back Tasset (-Z)
  const backTassetGeo = createTaperedArmorGeo(
    [-0.122, 0.050,  0.014],
    [ 0.122, 0.050,  0.014],
    [ 0.114, 0.050, -0.014],
    [-0.114, 0.050, -0.014],
    [-0.142, -0.050, 0.014],
    [ 0.142, -0.050, 0.014],
    [ 0.132, -0.050, -0.014],
    [-0.132, -0.050, -0.014]
  );
  const tassetB = new THREE.Mesh(backTassetGeo, steelDarkMat);
  tassetB.position.set(0, -0.164, -0.134);
  tassetB.rotation.set(0.10, 0, 0);
  tassetB.castShadow = true;
  tassetB.receiveShadow = true;
  torsoGroup.add(tassetB);

  guardGroup.add(torsoGroup);

  // ==========================================
  // 5. LAYERED PAULDRONS, ARMS & HANDS
  // ==========================================
  const pauldronTopGeo = createTaperedArmorGeo(
    [-0.072, 0.024,  0.072],
    [ 0.072, 0.024,  0.072],
    [ 0.072, 0.024, -0.072],
    [-0.072, 0.024, -0.072],
    [-0.088, -0.022,  0.084],
    [ 0.088, -0.022,  0.084],
    [ 0.088, -0.022, -0.084],
    [-0.088, -0.022, -0.084]
  );
  const pauldronUnderGeo = createTaperedArmorGeo(
    [-0.068, 0.018,  0.066],
    [ 0.068, 0.018,  0.066],
    [ 0.068, 0.018, -0.066],
    [-0.068, 0.018, -0.066],
    [-0.080, -0.018,  0.076],
    [ 0.080, -0.018,  0.076],
    [ 0.080, -0.018, -0.076],
    [-0.080, -0.018, -0.076]
  );

  // Right Shoulder Pauldron (Screen Left, -X)
  const rightPauldron = new THREE.Group();
  const rightPauldronTop = new THREE.Mesh(pauldronTopGeo, steelLightMat);
  rightPauldronTop.position.set(-0.020, 0.032, 0);
  rightPauldronTop.rotation.set(0, 0, 0.42);
  rightPauldronTop.castShadow = true;
  rightPauldron.add(rightPauldronTop);

  const rightPauldronUnder = new THREE.Mesh(pauldronUnderGeo, steelMat);
  rightPauldronUnder.position.set(-0.044, -0.002, 0);
  rightPauldronUnder.rotation.set(0, 0, 0.48);
  rightPauldronUnder.castShadow = true;
  rightPauldron.add(rightPauldronUnder);
  rightArmGroup.add(rightPauldron);

  // Left Shoulder Pauldron (Screen Right, +X)
  const leftPauldron = new THREE.Group();
  const leftPauldronTop = new THREE.Mesh(pauldronTopGeo.clone(), steelMat);
  leftPauldronTop.position.set(0.020, 0.032, 0);
  leftPauldronTop.rotation.set(0, 0, -0.42);
  leftPauldronTop.castShadow = true;
  leftPauldron.add(leftPauldronTop);

  const leftPauldronUnder = new THREE.Mesh(pauldronUnderGeo.clone(), steelDarkMat);
  leftPauldronUnder.position.set(0.044, -0.002, 0);
  leftPauldronUnder.rotation.set(0, 0, -0.48);
  leftPauldronUnder.castShadow = true;
  leftPauldron.add(leftPauldronUnder);
  leftArmGroup.add(leftPauldron);

  // 5.1 Right Arm (Screen Left, -X) — Continuous diagonal chain along ~50 deg outward
  const rightArmChain = new THREE.Group();
  rightArmChain.position.set(-0.015, 0.005, 0);
  rightArmChain.rotation.z = -0.88; // Points down-left (-X, -Y) along -Y local axis

  const rightUpperArm = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.044, 0.046, 0.090, 10)),
    underShirtMat
  );
  rightUpperArm.position.set(0, -0.042, 0);
  rightUpperArm.castShadow = true;
  rightArmChain.add(rightUpperArm);

  const rightBracer = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.056, 0.062, 0.082, 10)),
    steelMat
  );
  rightBracer.position.set(0, -0.106, 0);
  rightBracer.castShadow = true;
  rightArmChain.add(rightBracer);

  const rightBracerRim = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.066, 0.064, 0.024, 10)),
    steelLightMat
  );
  rightBracerRim.position.set(0, -0.140, 0);
  rightBracerRim.castShadow = true;
  rightArmChain.add(rightBracerRim);

  // Soft chibi flattened mitten hand emerging seamlessly from bracer cuff
  const rightHandGeo = new THREE.SphereGeometry(0.047, 12, 8);
  const rightHand = new THREE.Mesh(rightHandGeo, skinMat);
  rightHand.position.set(0, -0.176, 0);
  rightHand.scale.set(0.86, 1.22, 0.64);
  rightHand.castShadow = true;
  rightArmChain.add(rightHand);

  const rightThumb = new THREE.Mesh(
    new THREE.SphereGeometry(0.021, 8, 6),
    skinMat
  );
  rightThumb.position.set(0.028, -0.162, 0.018);
  rightThumb.scale.set(0.8, 1.15, 0.8);
  rightArmChain.add(rightThumb);

  rightArmGroup.add(rightArmChain);
  guardGroup.add(rightArmGroup);

  // 5.2 Left Arm (Screen Right, +X) — Connected cleanly into back handle of shield
  const leftArmChain = new THREE.Group();
  leftArmChain.position.set(0.02, -0.01, 0);
  // Negative X + positive Z swings arm down-forward-outward directly into shield handle
  leftArmChain.rotation.set(-0.74, 0.0, 0.30);

  const leftUpperArm = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.044, 0.047, 0.110, 10)),
    underShirtMat
  );
  leftUpperArm.position.set(0, -0.052, 0);
  leftUpperArm.castShadow = true;
  leftArmChain.add(leftUpperArm);

  const leftBracer = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(0.054, 0.058, 0.105, 10)),
    steelDarkMat
  );
  leftBracer.position.set(0, -0.134, 0);
  leftBracer.castShadow = true;
  leftArmChain.add(leftBracer);

  const leftHand = new THREE.Mesh(
    new THREE.SphereGeometry(0.040, 10, 8),
    skinMat
  );
  leftHand.position.set(0, -0.214, 0.004);
  leftHand.scale.set(0.88, 1.0, 0.76);
  leftArmChain.add(leftHand);

  leftArmGroup.add(leftArmChain);
  guardGroup.add(leftArmGroup);

  // ==========================================
  // 6. ROUND BUCKLER SHIELD (shieldGroup)
  // ==========================================
  const shieldRadius = 0.225;
  const shieldInnerRadius = 0.182;

  // 6.1 Beveled Circular Steel Rim
  const rimGeo = createBeveledShieldRimGeo(shieldRadius, shieldInnerRadius, 0.028, 28);
  const rimMesh = new THREE.Mesh(rimGeo, steelLightMat);
  rimMesh.castShadow = true;
  rimMesh.receiveShadow = true;
  shieldGroup.add(rimMesh);

  // Recessed dark oak backing disc so plank grooves show crisp dark seams
  const plankBacking = new THREE.Mesh(
    makeFlat(new THREE.CylinderGeometry(shieldInnerRadius + 0.004, shieldInnerRadius + 0.004, 0.022, 24)),
    woodDarkMat
  );
  plankBacking.rotation.x = Math.PI * 0.5;
  plankBacking.position.z = -0.004;
  plankBacking.castShadow = true;
  plankBacking.receiveShadow = true;
  shieldGroup.add(plankBacking);

  // 6.2 Five Vertical Wooden Planks Clipped Strictly Inside Rim Circle
  const plankGroup = new THREE.Group();
  plankGroup.position.z = 0.005;

  const plankConfigs = [
    { x0: -0.184, x1: -0.108, mat: woodDarkMat,  depth: 0.014 },
    { x0: -0.103, x1: -0.036, mat: woodMat,      depth: 0.016 },
    { x0: -0.031, x1:  0.031, mat: woodLightMat, depth: 0.017 },
    { x0:  0.036, x1:  0.103, mat: woodMat,      depth: 0.016 },
    { x0:  0.108, x1:  0.184, mat: woodDarkMat,  depth: 0.014 }
  ];

  plankConfigs.forEach((cfg) => {
    const pGeo = createClippedPlankGeo(cfg.x0, cfg.x1, shieldInnerRadius + 0.003, cfg.depth);
    const pMesh = new THREE.Mesh(pGeo, cfg.mat);
    pMesh.castShadow = true;
    pMesh.receiveShadow = true;
    plankGroup.add(pMesh);
  });
  shieldGroup.add(plankGroup);

  // 6.3 Clean Central Steel Umbo Boss (Small Round Base Collar + Faceted Hemisphere)
  const bossBaseGeo = makeFlat(new THREE.CylinderGeometry(0.056, 0.062, 0.012, 12));
  const bossBase = new THREE.Mesh(bossBaseGeo, steelMat);
  bossBase.rotation.x = Math.PI * 0.5;
  bossBase.position.z = 0.016;
  bossBase.castShadow = true;
  shieldGroup.add(bossBase);

  const bossDomeGeo = makeFlat(
    new THREE.SphereGeometry(0.048, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.5)
  );
  const bossDome = new THREE.Mesh(bossDomeGeo, steelLightMat);
  bossDome.rotation.x = Math.PI * 0.5;
  bossDome.position.z = 0.020;
  bossDome.scale.set(1.0, 0.88, 1.0);
  bossDome.castShadow = true;
  bossDome.receiveShadow = true;
  shieldGroup.add(bossDome);

  // 6.4 Fourteen Silver Rivets Evenly Spaced Around Shield Rim
  const rivetCount = 14;
  const rivetRadius = (shieldRadius + shieldInnerRadius) * 0.5;
  const rivetGeo = makeFlat(new THREE.SphereGeometry(0.0085, 6, 5));

  for (let i = 0; i < rivetCount; i++) {
    const angle = (i / rivetCount) * Math.PI * 2;
    const rx = Math.cos(angle) * rivetRadius;
    const ry = Math.sin(angle) * rivetRadius;

    const rivet = new THREE.Mesh(rivetGeo, rivetsMat);
    rivet.position.set(rx, ry, 0.020);
    rivet.scale.set(1.0, 1.0, 0.65);
    shieldGroup.add(rivet);
  }

  // 6.5 Back Leather Handle & Grip Brackets
  const handleGeo = makeFlat(new THREE.BoxGeometry(0.036, 0.135, 0.028));
  const handleMesh = new THREE.Mesh(handleGeo, beltMat);
  handleMesh.position.set(0, 0, -0.022);
  shieldGroup.add(handleMesh);

  const gripBracketGeo = makeFlat(new THREE.BoxGeometry(0.050, 0.018, 0.016));
  const upperBracket = new THREE.Mesh(gripBracketGeo, buckleMat);
  upperBracket.position.set(0, 0.062, -0.014);
  shieldGroup.add(upperBracket);

  const lowerBracket = new THREE.Mesh(gripBracketGeo.clone(), buckleMat);
  lowerBracket.position.set(0, -0.062, -0.014);
  shieldGroup.add(lowerBracket);

  // ==========================================
  // 6.6 GUARDIAN SHIELD EFFECTS (Separated inside shieldGroup)
  // ==========================================
  const guardianEffectsGroup = new THREE.Group();
  guardianEffectsGroup.name = 'guardianEffectsGroup';

  // A. Guardian Rim Glow (Warm Gold #FFC76A along inner & outer rim shoulders + soft additive halo)
  const rimOuterFilament = new THREE.Mesh(
    new THREE.TorusGeometry(shieldRadius - 0.001, 0.0036, 6, 48),
    shieldRimGlowMat
  );
  rimOuterFilament.position.z = 0.0145;
  guardianEffectsGroup.add(rimOuterFilament);

  const rimInnerFilament = new THREE.Mesh(
    new THREE.TorusGeometry(shieldInnerRadius + 0.002, 0.0030, 6, 44),
    shieldRimGlowMat
  );
  rimInnerFilament.position.z = 0.0175;
  guardianEffectsGroup.add(rimInnerFilament);

  const rimHaloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.shieldRimGlow),
    vertexColors: true,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });
  const rimHaloMesh = new THREE.Mesh(
    createAdditiveGlowRingGeo(0.214, 0.224, 0.236, 48),
    rimHaloMat
  );
  rimHaloMesh.position.z = 0.0155;
  guardianEffectsGroup.add(rimHaloMesh);

  // B. Guardian Core (Light Cyan #72DFFF ring around steel umbo base + gentle wood spill)
  const coreRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.0635, 0.0038, 6, 32),
    shieldCoreGlowMat
  );
  coreRingMesh.position.z = 0.0175;
  guardianEffectsGroup.add(coreRingMesh);

  const coreSpillMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.shieldCoreGlow),
    vertexColors: true,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });
  const coreSpillMesh = new THREE.Mesh(
    createAdditiveGlowRingGeo(0.056, 0.065, 0.105, 36),
    coreSpillMat
  );
  coreSpillMesh.position.z = 0.0152;
  guardianEffectsGroup.add(coreSpillMesh);

  // C. Defend Shield Aura (Created once, activated smoothly during setPose('defend'))
  const defendAuraGroup = new THREE.Group();
  defendAuraGroup.name = 'defendAuraGroup';
  defendAuraGroup.visible = false;

  const defendAuraRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.shieldCoreGlow),
    emissive: new THREE.Color(colors.shieldCoreGlow),
    emissiveIntensity: 0.88,
    roughness: 0.2,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
  });
  const defendOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.235, 0.0040, 6, 44),
    defendAuraRingMat
  );
  defendOuterRing.position.z = 0.018;
  defendAuraGroup.add(defendOuterRing);

  const defendInnerRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.shieldCoreGlow),
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const defendInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.0026, 6, 36),
    defendInnerRingMat
  );
  defendInnerRing.position.z = 0.020;
  defendAuraGroup.add(defendInnerRing);

  const defendHaloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.shieldCoreGlow),
    vertexColors: true,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });
  const defendHaloMesh = new THREE.Mesh(
    createAdditiveGlowRingGeo(0.214, 0.234, 0.262, 48),
    defendHaloMat
  );
  defendHaloMesh.position.z = 0.017;
  defendAuraGroup.add(defendHaloMesh);

  // Ultra-faint curved protective dome in front of planks without obscuring steel/wood
  const defendCapGeo = new THREE.SphereGeometry(0.46, 24, 10, 0, Math.PI * 2, 0, 0.52);
  defendCapGeo.rotateX(Math.PI * 0.5);
  defendCapGeo.translate(0, 0, -0.375);
  const defendCapMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.shieldCoreGlow),
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const defendCapMesh = new THREE.Mesh(defendCapGeo, defendCapMat);
  defendAuraGroup.add(defendCapMesh);

  guardianEffectsGroup.add(defendAuraGroup);
  shieldGroup.add(guardianEffectsGroup);

  guardGroup.add(shieldGroup);

  // ==========================================
  // 7. SHORT STURDY LEGS & MUTED BROWN BOOTS (Soles at Y = 0)
  // ==========================================
  const legGeo = makeFlat(new THREE.CylinderGeometry(0.056, 0.052, 0.12, 10));
  const bootCuffGeo = makeFlat(new THREE.CylinderGeometry(0.064, 0.060, 0.034, 10));
  const bootShaftGeo = makeFlat(new THREE.CylinderGeometry(0.055, 0.058, 0.060, 10));
  const bootFootGeo = createBootFootGeo(0.098, 0.058, -0.050, 0.084);

  // 7.1 Right Leg (Screen Left, -X)
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.y = -0.035;
  rightLeg.castShadow = true;
  rightLegGroup.add(rightLeg);

  const rightCuff = new THREE.Mesh(bootCuffGeo, cuffMat);
  rightCuff.position.y = -0.105;
  rightCuff.castShadow = true;
  rightLegGroup.add(rightCuff);

  const rightBoot = new THREE.Mesh(bootShaftGeo, bootsMat);
  rightBoot.position.set(0, -0.148, 0);
  rightBoot.castShadow = true;
  rightLegGroup.add(rightBoot);

  const rightToe = new THREE.Mesh(bootFootGeo, bootsMat);
  rightToe.position.set(0, -0.206, 0); // -0.206 + 0.21 = 0.004 (sole rests cleanly on floor)
  rightToe.castShadow = true;
  rightToe.receiveShadow = true;
  rightLegGroup.add(rightToe);

  rightLegGroup.rotation.y = 0.08;
  guardGroup.add(rightLegGroup);

  // 7.2 Left Leg (Screen Right, +X)
  const leftLeg = new THREE.Mesh(legGeo.clone(), pantsMat);
  leftLeg.position.y = -0.035;
  leftLeg.castShadow = true;
  leftLegGroup.add(leftLeg);

  const leftCuff = new THREE.Mesh(bootCuffGeo.clone(), cuffMat);
  leftCuff.position.y = -0.105;
  leftCuff.castShadow = true;
  leftLegGroup.add(leftCuff);

  const leftBoot = new THREE.Mesh(bootShaftGeo.clone(), bootsMat);
  leftBoot.position.set(0, -0.148, 0);
  leftBoot.castShadow = true;
  leftLegGroup.add(leftBoot);

  const leftToe = new THREE.Mesh(bootFootGeo.clone(), bootsMat);
  leftToe.position.set(0, -0.206, 0);
  leftToe.castShadow = true;
  leftToe.receiveShadow = true;
  leftLegGroup.add(leftToe);

  leftLegGroup.rotation.y = -0.08;
  guardGroup.add(leftLegGroup);

  // ==========================================
  // 8. AMBIENT FLOATING EMBER SPARKS (No Floor Fire Crystals!)
  // ==========================================
  const emberCount = 12;
  const emberGeo = makeFlat(new THREE.OctahedronGeometry(0.015, 0));
  const embers = [];

  // Deterministic ring distribution outside character silhouette so sparks never clip body/shield
  for (let i = 0; i < emberCount; i++) {
    const mesh = new THREE.Mesh(emberGeo, emberMat);
    const angle = (i / emberCount) * Math.PI * 2 + 0.28;
    const radialDist = 0.46 + (i % 3) * 0.14;
    const basePos = new THREE.Vector3(
      Math.cos(angle) * radialDist,
      0.16 + ((i * 0.19) % 0.72),
      Math.sin(angle) * radialDist * 0.72 - 0.05
    );
    mesh.position.copy(basePos);
    mesh.scale.setScalar(0.65 + (i % 4) * 0.18);
    emberGroup.add(mesh);

    embers.push({
      mesh,
      basePos,
      phase: (i * 1.17) % (Math.PI * 2),
      speedY: 0.12 + (i % 4) * 0.04
    });
  }
  guardGroup.add(emberGroup);

  // ==========================================
  // 9. CONTROLLER API
  // ==========================================
  let activePose = 'guard';
  let shieldGlowEnabled = true;
  let shieldGlowIntensity = 1.0;
  let defendProgress = 0.0;
  let lastUpdateTime = null;

  function applyShieldEffects(elapsedTime) {
    guardianEffectsGroup.visible = shieldGlowEnabled;
    if (!shieldGlowEnabled) {
      defendAuraGroup.visible = false;
      return;
    }

    const easedDefend = defendProgress * defendProgress * (3 - 2 * defendProgress);
    // Calm ~3.5s protective pulse wave in [0, 1]
    const pulseWave = 0.5 + 0.5 * Math.sin(elapsedTime * 1.8);
    const rimPulse = (0.86 + pulseWave * 0.28 + easedDefend * 0.35) * shieldGlowIntensity;
    const corePulse = (0.85 + pulseWave * 0.30 + easedDefend * 0.35) * shieldGlowIntensity;

    shieldRimGlowMat.emissiveIntensity = 0.78 * rimPulse;
    rimHaloMat.opacity = 0.26 * rimPulse;

    shieldCoreGlowMat.emissiveIntensity = 0.62 * corePulse;
    coreSpillMat.opacity = 0.15 * corePulse;

    // Defend Shield Aura: thin translucent cyan-blue barrier expanding softly & holding
    const showAura = easedDefend > 0.005 && shieldGlowIntensity > 0.01;
    defendAuraGroup.visible = showAura;
    if (showAura) {
      const auraScale = 0.94 + easedDefend * 0.12;
      const auraPulse = 0.90 + pulseWave * 0.18;
      defendAuraGroup.scale.setScalar(auraScale);

      defendAuraRingMat.opacity = easedDefend * 0.68 * shieldGlowIntensity;
      defendAuraRingMat.emissiveIntensity = 0.88 * auraPulse * shieldGlowIntensity;
      defendInnerRingMat.opacity = easedDefend * 0.34 * auraPulse * shieldGlowIntensity;
      defendHaloMat.opacity = easedDefend * 0.28 * auraPulse * shieldGlowIntensity;
      defendCapMat.opacity = easedDefend * 0.055 * shieldGlowIntensity;
    }
  }

  function setColors(newColors) {
    if (newColors.steel) steelMat.color.set(newColors.steel);
    if (newColors.steelDark) steelDarkMat.color.set(newColors.steelDark);
    if (newColors.steelLight) steelLightMat.color.set(newColors.steelLight);
    if (newColors.innerCavity) innerCavityMat.color.set(newColors.innerCavity);
    if (newColors.skin) skinMat.color.set(newColors.skin);
    if (newColors.eyes) eyeMat.color.set(newColors.eyes);
    if (newColors.underShirt) underShirtMat.color.set(newColors.underShirt);
    if (newColors.belt) beltMat.color.set(newColors.belt);
    if (newColors.buckle) buckleMat.color.set(newColors.buckle);
    if (newColors.woodPlank) woodMat.color.set(newColors.woodPlank);
    if (newColors.woodDark) woodDarkMat.color.set(newColors.woodDark);
    if (newColors.woodLight) woodLightMat.color.set(newColors.woodLight);
    if (newColors.pants) pantsMat.color.set(newColors.pants);
    if (newColors.boots) bootsMat.color.set(newColors.boots);
    if (newColors.cuff) cuffMat.color.set(newColors.cuff);
    if (newColors.rivets) rivetsMat.color.set(newColors.rivets);
    if (newColors.ember) emberMat.color.set(newColors.ember);
    if (newColors.shieldRimGlow) {
      shieldRimGlowMat.color.set(newColors.shieldRimGlow);
      shieldRimGlowMat.emissive.set(newColors.shieldRimGlow);
      rimHaloMat.color.set(newColors.shieldRimGlow);
    }
    if (newColors.shieldCoreGlow) {
      shieldCoreGlowMat.color.set(newColors.shieldCoreGlow);
      shieldCoreGlowMat.emissive.set(newColors.shieldCoreGlow);
      coreSpillMat.color.set(newColors.shieldCoreGlow);
      defendAuraRingMat.color.set(newColors.shieldCoreGlow);
      defendAuraRingMat.emissive.set(newColors.shieldCoreGlow);
      defendInnerRingMat.color.set(newColors.shieldCoreGlow);
      defendHaloMat.color.set(newColors.shieldCoreGlow);
      defendCapMat.color.set(newColors.shieldCoreGlow);
    }
  }

  function setWireframe(enabled) {
    Object.values(materials).forEach((m) => {
      m.wireframe = enabled;
    });
  }

  function setShieldGlow(enabled) {
    shieldGlowEnabled = Boolean(enabled);
    applyShieldEffects(lastUpdateTime || 0);
  }

  function setShieldGlowIntensity(value) {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 1));
    shieldGlowIntensity = clamped;
    applyShieldEffects(lastUpdateTime || 0);
  }

  function setPose(poseName) {
    activePose = poseName;

    // Reset defaults
    headGroup.rotation.set(0, 0, 0);
    headGroup.position.set(0, 0.685, 0);
    torsoGroup.rotation.set(0, 0, 0);
    torsoGroup.position.set(0, 0.43, 0);
    rightArmGroup.rotation.set(0, 0, 0);
    rightArmGroup.position.set(-0.18, 0.50, 0);
    leftArmGroup.rotation.set(0, 0, 0);
    leftArmGroup.position.set(0.18, 0.50, 0);
    rightArmChain.rotation.set(0, 0, -0.88);
    leftArmChain.rotation.set(-0.74, 0.0, 0.30);
    shieldGroup.position.set(0.272, 0.328, 0.175);
    shieldGroup.rotation.set(0.03, 0.18, 0.03);
    leftLegGroup.rotation.set(0, -0.08, 0);
    rightLegGroup.rotation.set(0, 0.08, 0);

    if (poseName === 'guard' || poseName === 'idle') {
      // Default vigilant standing stance with clear shield/tasset separation
      rightArmGroup.rotation.set(0, 0, 0);
      shieldGroup.position.set(0.272, 0.328, 0.175);
      shieldGroup.rotation.set(0.03, 0.18, 0.03);
    } else if (poseName === 'defend') {
      // Shield raised forward across chest, below eyes so face remains clear
      shieldGroup.position.set(0.11, 0.350, 0.245);
      shieldGroup.rotation.set(0.08, 0.12, -0.04);
      leftArmGroup.position.set(0.175, 0.485, 0.035);
      leftArmGroup.rotation.set(0, 0, 0);
      leftArmChain.rotation.set(-1.02, 0.0, -0.40);
      headGroup.position.y = 0.655;
      headGroup.rotation.x = 0.08;
      torsoGroup.position.y = 0.40;
      rightArmGroup.rotation.set(-0.15, 0.0, 0.25);
    } else if (poseName === 'salute') {
      // Knight honor salute with right arm raised forward and across front breastplate
      rightArmGroup.rotation.set(-0.92, 0.0, 0.78);
      rightArmChain.rotation.set(0, 0, -0.10);
      headGroup.rotation.y = 0.08;
    } else if (poseName === 't-pose') {
      // Standard T-pose with shield facing outward along +X, cleanly gripped on outstretched left hand
      rightArmChain.rotation.set(0, 0, -Math.PI * 0.5);
      leftArmChain.rotation.set(0, 0, Math.PI * 0.5);
      shieldGroup.position.set(0.436, 0.490, 0.0);
      shieldGroup.rotation.set(0, Math.PI * 0.5, 0);
    }
  }

  function update(elapsedTime, options = {}) {
    const baseHeadY = activePose === 'defend' ? 0.655 : 0.685;
    const baseTorsoY = activePose === 'defend' ? 0.40 : 0.43;
    const baseShieldRotZ = activePose === 'defend' ? -0.04 : activePose === 't-pose' ? 0 : 0.03;

    // 1. Subtle idle breathing (can be paused independently of Guardian Shield effects)
    if (options.breathe !== false) {
      const breath = Math.sin(elapsedTime * 2.4) * 0.006;
      headGroup.position.y = baseHeadY + breath * 0.5;
      torsoGroup.position.y = baseTorsoY + breath * 0.3;
      shieldGroup.rotation.z = baseShieldRotZ + Math.sin(elapsedTime * 1.8) * 0.012;
    } else {
      headGroup.position.y = baseHeadY;
      torsoGroup.position.y = baseTorsoY;
      shieldGroup.rotation.z = baseShieldRotZ;
    }

    // 2. Ambient floating ember sparks around character
    embers.forEach((e) => {
      e.mesh.position.y = e.basePos.y + ((elapsedTime * e.speedY + e.phase) % 0.70);
      e.mesh.position.x = e.basePos.x + Math.sin(elapsedTime * 1.4 + e.phase) * 0.03;
      e.mesh.rotation.y = elapsedTime * 1.1 + e.phase;
      e.mesh.rotation.x = elapsedTime * 0.7 + e.phase;
    });

    // 3. Guardian Shield Protective Pulse + Defend Aura transition
    const dt = lastUpdateTime === null
      ? Math.min(0.6, Math.max(0.016, elapsedTime))
      : Math.max(0.0, Math.min(0.25, elapsedTime - lastUpdateTime));
    lastUpdateTime = elapsedTime;

    const targetDefend = (activePose === 'defend' && shieldGlowEnabled) ? 1.0 : 0.0;
    const step = Math.max(0.016, dt) * 2.3;
    if (defendProgress < targetDefend) {
      defendProgress = Math.min(targetDefend, defendProgress + step);
    } else if (defendProgress > targetDefend) {
      defendProgress = Math.max(targetDefend, defendProgress - step);
    }

    applyShieldEffects(elapsedTime);
  }

  return {
    model: guardGroup,
    parts: {
      headGroup,
      helmetGroup,
      torsoGroup,
      rightArmGroup,
      leftArmGroup,
      shieldGroup,
      guardianEffectsGroup,
      defendAuraGroup,
      leftLegGroup,
      rightLegGroup,
      emberGroup
    },
    materials,
    setColors,
    setWireframe,
    setShieldGlow,
    setShieldGlowIntensity,
    setPose,
    update
  };
}
