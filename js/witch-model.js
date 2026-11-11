import * as THREE from 'three';

/**
 * WITCH (PHÙ THỦY CHIBI) — 3D PROCEDURAL CHARACTER (THREE.JS r160)
 * Calibrated directly to assets/references/witch_ref.png & assets/sprites/witch-*.png
 * Completely independent 5th character: curved hooked witch hat, swept bangs, chin-length locks,
 * emerald collar brooch, A-line purple dress, thick flared dark plum cape, flared sleeves,
 * and dual glass alchemy potion flasks (Green #39FF52 on screen-left, Purple #CB38FF on screen-right).
 */
export const WITCH_DEFAULT_COLORS = {
  hat:            '#7c319c', // Primary stylized purple pointed hat crown & brim
  hatBand:        '#382226', // Dark brown-charcoal ribbon band around crown base
  hair:           '#4e263f', // Warm plum-mahogany short curved bob & layered bangs
  skin:           '#f6bd9c', // Luminous warm peach Chibi face & hands
  eyes:           '#140f17', // Satin black vertical pill eyes
  eyebrows:       '#451f29', // Short thin determined dark brows
  dress:          '#5c2a73', // Multi-toned muted plum A-line dress
  dressLight:     '#6c3485', // Draped V-collar & subtle facet highlights
  sleeve:         '#4b1f62', // Soft flared purple bell sleeves
  cape:           '#331544', // Deep dark plum curved outer cape
  emerald:        '#29f556', // Luminous faceted emerald chest crystal
  emeraldSetting: '#322038', // Dark mount framing emerald gem
  greenPotion:    '#26ff48', // Glowing emerald-green potion liquid (Screen Left / Right Hand)
  purplePotion:   '#cb38ff', // Glowing vibrant purple potion liquid (Screen Right / Left Hand)
  cork:           '#b57442', // Warm brown wooden cork stopper
  shoes:          '#462654'  // Dark plum low-poly beveled boots
};

/**
 * Utility: Ensure crisp flat-faceted low-poly shading on any BufferGeometry
 */
export function makeFlat(geo) {
  const nonIndexed = geo.toNonIndexed ? geo.toNonIndexed() : geo;
  nonIndexed.computeVertexNormals();
  return nonIndexed;
}

/**
 * Shared CCW multi-ring loft builder used for hooked Witch hat, curved cheek hair locks,
 * beveled bell sleeves, and tapered low-poly components.
 * Each ring supports uniform `radius` or separate `rx` / `rz` and optional `squircle` shaping.
 */
function createLoftedSegmentGeo(rings, radialSegments = 12, capStart = false, capEnd = false) {
  const positions = [];
  const uvs = [];
  const indices = [];

  const ringCount = rings.length;
  const cols = radialSegments + 1;

  for (let i = 0; i < ringCount; i++) {
    const rSpec = rings[i];
    const [cx, cy, cz] = rSpec.center;
    const rx = rSpec.rx !== undefined ? rSpec.rx : (rSpec.radius || 0.01);
    const rz = rSpec.rz !== undefined ? rSpec.rz : (rSpec.radius || 0.01) * (rSpec.zScale !== undefined ? rSpec.zScale : 0.96);
    const tiltZ = rSpec.tiltZ || 0;
    const tiltX = rSpec.tiltX || 0;
    const sqPow = rSpec.squircle || 1.0;
    const vCoord = i / Math.max(1, ringCount - 1);

    const cosZ = Math.cos(tiltZ);
    const sinZ = Math.sin(tiltZ);
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);

    for (let s = 0; s <= radialSegments; s++) {
      const uCoord = s / radialSegments;
      const theta = uCoord * Math.PI * 2;
      const c = Math.cos(theta);
      const sn = Math.sin(theta);
      const lx = Math.sign(c) * Math.pow(Math.abs(c), sqPow) * rx;
      const lz = Math.sign(sn) * Math.pow(Math.abs(sn), sqPow) * rz;

      const x1 = lx * cosZ;
      const y1 = -lx * sinZ;
      const z1 = lz;

      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      positions.push(cx + x2, cy + y2, cz + z2);
      uvs.push(uCoord, vCoord);
    }
  }

  for (let i = 0; i < ringCount - 1; i++) {
    const rowA = i * cols;
    const rowB = (i + 1) * cols;
    for (let s = 0; s < radialSegments; s++) {
      const a0 = rowA + s;
      const a1 = rowA + s + 1;
      const b0 = rowB + s;
      const b1 = rowB + s + 1;
      indices.push(a0, b0, b1, a0, b1, a1);
    }
  }

  if (capStart) {
    const [cx, cy, cz] = rings[0].center;
    const cIdx = positions.length / 3;
    positions.push(cx, cy, cz);
    uvs.push(0.5, 0);
    for (let s = 0; s < radialSegments; s++) {
      indices.push(cIdx, s, s + 1);
    }
  }

  if (capEnd) {
    const last = rings[ringCount - 1];
    const [cx, cy, cz] = last.center;
    const cIdx = positions.length / 3;
    positions.push(cx, cy, cz);
    uvs.push(0.5, 1);
    const lastRow = (ringCount - 1) * cols;
    for (let s = 0; s < radialSegments; s++) {
      indices.push(cIdx, lastRow + s + 1, lastRow + s);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Narrowed Witch Hat brim (~18% narrower than initial wide disc) with gentle downward edge curve
 */
function createWitchBrimGeo(radialSegments = 14) {
  const positions = [];
  const indices = [];
  const cols = radialSegments + 1;

  const profile = [
    { r: 0.152, y:  0.032, zScale: 0.94 }, // Crown join inner top
    { r: 0.228, y:  0.011, zScale: 0.95 }, // Mid slope
    { r: 0.310, y: -0.020, zScale: 0.95 }, // Curved downward outer rim top
    { r: 0.318, y: -0.033, zScale: 0.95 }, // Beveled outer edge
    { r: 0.300, y: -0.043, zScale: 0.95 }, // Outer rim underside
    { r: 0.136, y: -0.010, zScale: 0.94 }  // Inner hollow tucked cleanly over forehead hair
  ];

  profile.forEach((p) => {
    for (let s = 0; s <= radialSegments; s++) {
      const theta = (s / radialSegments) * Math.PI * 2;
      const edgeFactor = Math.max(0, (p.r - 0.16) / 0.16);
      const wave = (Math.sin(theta * 2.0 + 0.4) * 0.005 + Math.cos(theta - 0.6) * 0.004) * edgeFactor;
      const x = Math.cos(theta) * p.r;
      const z = Math.sin(theta) * p.r * p.zScale;
      positions.push(x, p.y + wave, z);
    }
  });

  for (let pIdx = 0; pIdx < profile.length; pIdx++) {
    const nextIdx = (pIdx + 1) % profile.length;
    const rowA = pIdx * cols;
    const rowB = nextIdx * cols;
    for (let s = 0; s < radialSegments; s++) {
      const a0 = rowA + s;
      const a1 = rowA + s + 1;
      const b0 = rowB + s;
      const b1 = rowB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Plump rounded-square Chibi head with soft chin curve (wide cheeks, bright smooth peach shading)
 */
function createWitchHeadGeo(rx = 0.134, ry = 0.108, rz = 0.118) {
  const geo = new THREE.SphereGeometry(1, 16, 12);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Gentle squircle cheek plumpness on lower face
    const lowerCheek = Math.max(0, -y) * 0.22;
    const sqBias = 1.0 + lowerCheek * (1.0 - Math.abs(x) * 0.28);
    // Slightly flatten bottom jaw apex subtly while keeping round chin curve
    const yShaped = y < -0.72 ? -0.72 + (y + 0.72) * 0.65 : y;

    x *= rx * sqBias;
    y = yShaped * ry;
    z *= rz * (yShaped < 0 ? 1.04 : 1.0);

    if (z > rz * 0.56) {
      z = rz * 0.56 + (z - rz * 0.56) * 0.78;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Tapered rear hair bob dome covering strictly behind ears and curving in at nape
 */
function createBackHairGeo() {
  const arcSegments = 10;
  const cols = arcSegments + 1;
  const rings = [
    { y:  0.086, rx: 0.140, rz: 0.126, zOff: -0.012 },
    { y:  0.025, rx: 0.160, rz: 0.142, zOff: -0.014 },
    { y: -0.045, rx: 0.154, rz: 0.138, zOff: -0.014 },
    { y: -0.102, rx: 0.124, rz: 0.114, zOff: -0.010 }
  ];

  // Outer surface + slight inner shell around nape edge; strictly back half theta in [0.56*PI .. 1.44*PI]
  // Note in XZ here: sin(theta) -> x? No, let's match Three.js Cylinder convention: x = sin(theta)*rx, z = cos(theta)*rz.
  // For theta increasing from 0.56*PI (+X) -> PI (-Z back) -> 1.44*PI (-X):
  // Moving +s goes from +X toward -X along -Z; vector a1-a0 ~ -X, b0-a0 ~ -Y. (-X) cross (-Y) = +Z (inward!), so use (a0, b1, b0, a0, a1, b1) for OUTWARD -Z!
  const positions = [];
  const indices = [];
  const tStart = Math.PI * 0.56;
  const tLen = Math.PI * 0.88;

  rings.forEach((ring) => {
    for (let s = 0; s <= arcSegments; s++) {
      const theta = tStart + (s / arcSegments) * tLen;
      const x = Math.sin(theta) * ring.rx;
      const z = Math.cos(theta) * ring.rz + ring.zOff;
      positions.push(x, ring.y, z);
    }
  });

  for (let i = 0; i < rings.length - 1; i++) {
    const rowA = i * cols;
    const rowB = (i + 1) * cols;
    for (let s = 0; s < arcSegments; s++) {
      const a0 = rowA + s;
      const a1 = rowA + s + 1;
      const b0 = rowB + s;
      const b1 = rowB + s + 1;
      indices.push(a0, b1, b0, a0, a1, b1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Helper to create an 8-corner tapered low-poly panel
 */
function createTaperedPanelGeo(tFL, tFR, tBR, tBL, bFL, bFR, bBR, bBL) {
  const positions = [];
  const pushTri = (a, b, c) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
  };
  const pushQuad = (p0, p1, p2, p3) => {
    pushTri(p0, p1, p2);
    pushTri(p0, p2, p3);
  };
  pushQuad(tBL, tBR, tFR, tFL); // Top
  pushQuad(bFL, bFR, bBR, bBL); // Bottom
  pushQuad(tFL, tFR, bFR, bFL); // Front
  pushQuad(tFR, tBR, bBR, bFR); // Right
  pushQuad(tBR, tBL, bBL, bBR); // Back
  pushQuad(tBL, tFL, bFL, bBL); // Left

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Slimmer A-line Witch Dress with tucked waist transition & subtle vertical fold pleats
 */
function createWitchDressGeo() {
  const radial = 12;
  const ringDefs = [
    { y:  0.175, rx: 0.104, rz: 0.092, frontPinch: 0.008, pleatAmp: 0.000 }, // Under collar shoulders
    { y:  0.095, rx: 0.098, rz: 0.088, frontPinch: 0.010, pleatAmp: 0.002 }, // Subtle cinched waist
    { y: -0.035, rx: 0.146, rz: 0.126, frontPinch: 0.014, pleatAmp: 0.004 }, // Mid A-line drape
    { y: -0.178, rx: 0.190, rz: 0.158, frontPinch: 0.018, pleatAmp: 0.005 }  // Sleek A-line hem clearing boots
  ];

  const positions = [];
  const indices = [];
  const cols = radial + 1;

  ringDefs.forEach((ring) => {
    for (let s = 0; s <= radial; s++) {
      const theta = (s / radial) * Math.PI * 2 + Math.PI * 0.5;
      const pleat = Math.cos((s / radial) * Math.PI * 6) * ring.pleatAmp;
      let x = Math.cos(theta) * (ring.rx + pleat);
      let z = Math.sin(theta) * (ring.rz + pleat);

      if (Math.sin(theta) > 0.94) {
        z += ring.frontPinch;
      }
      positions.push(x, ring.y, z);
    }
  });

  for (let i = 0; i < ringDefs.length - 1; i++) {
    const rowA = i * cols;
    const rowB = (i + 1) * cols;
    for (let s = 0; s < radial; s++) {
      const a0 = rowA + s;
      const a1 = rowA + s + 1;
      const b0 = rowB + s;
      const b1 = rowB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }

  const botCenterIdx = positions.length / 3;
  positions.push(0, -0.178, 0);
  const lastRow = (ringDefs.length - 1) * cols;
  for (let s = 0; s < radial; s++) {
    indices.push(botCenterIdx, lastRow + s + 1, lastRow + s);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Continuous thick curved cape shell behind shoulders tapering around skirt down near boot tops
 */
function createWitchCapeGeo() {
  const arcSegs = 10;
  const cols = arcSegs + 1;
  const thickness = 0.018;
  const rings = [
    { y:  0.172, rx: 0.128, rz: 0.096, zOff: -0.014 },
    { y:  0.065, rx: 0.212, rz: 0.130, zOff: -0.020 },
    { y: -0.070, rx: 0.268, rz: 0.158, zOff: -0.024 },
    { y: -0.205, rx: 0.296, rz: 0.178, zOff: -0.026 }
  ];

  // Outer surface followed by inner surface -> stitch perimeter closed manifold shell
  // Phi spans from -X (0.90*PI) -> -Z (1.5*PI) -> +X (2.10*PI) so cape wings flare gracefully behind sleeves
  const positions = [];
  const indices = [];
  const phiStart = Math.PI * 0.90;
  const phiEnd = Math.PI * 2.10;

  // 1. Outer shell vertices
  rings.forEach((ring) => {
    for (let s = 0; s <= arcSegs; s++) {
      const phi = phiStart + (s / arcSegs) * (phiEnd - phiStart);
      const x = Math.cos(phi) * ring.rx;
      const z = Math.sin(phi) * ring.rz + ring.zOff;
      positions.push(x, ring.y, z);
    }
  });

  // 2. Inner shell vertices offset toward spine by `thickness`
  const innerOffset = rings.length * cols;
  rings.forEach((ring) => {
    for (let s = 0; s <= arcSegs; s++) {
      const phi = phiStart + (s / arcSegs) * (phiEnd - phiStart);
      const x = Math.cos(phi) * Math.max(0.05, ring.rx - thickness);
      const z = Math.sin(phi) * Math.max(0.05, ring.rz - thickness) + ring.zOff;
      positions.push(x, ring.y, z);
    }
  });

  // Outer walls (outward normals)
  for (let i = 0; i < rings.length - 1; i++) {
    const rA = i * cols;
    const rB = (i + 1) * cols;
    for (let s = 0; s < arcSegs; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }

  // Inner walls (inward facing toward torso)
  for (let i = 0; i < rings.length - 1; i++) {
    const rA = innerOffset + i * cols;
    const rB = innerOffset + (i + 1) * cols;
    for (let s = 0; s < arcSegs; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, b1, a1, a0, b0, b1);
    }
  }

  // Top & Bottom hem rims + Left & Right front edges
  const topOut = 0, topIn = innerOffset;
  const botOut = (rings.length - 1) * cols, botIn = innerOffset + botOut;
  for (let s = 0; s < arcSegs; s++) {
    indices.push(topIn + s, topIn + s + 1, topOut + s + 1, topIn + s, topOut + s + 1, topOut + s);
    indices.push(botOut + s, botOut + s + 1, botIn + s + 1, botOut + s, botIn + s + 1, botIn + s);
  }
  for (let i = 0; i < rings.length - 1; i++) {
    // s = 0 edge (-X side facing forward)
    const oA0 = i * cols, oB0 = (i + 1) * cols;
    const iA0 = innerOffset + oA0, iB0 = innerOffset + oB0;
    indices.push(iA0, oA0, oB0, iA0, oB0, iB0);

    // s = arcSegs edge (+X side facing forward)
    const oA1 = i * cols + arcSegs, oB1 = (i + 1) * cols + arcSegs;
    const iA1 = innerOffset + oA1, iB1 = innerOffset + oB1;
    indices.push(oA1, iA1, iB1, oA1, iB1, oB1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Draped rounded V-neck shoulder collar cowl framing the small chest emerald without sharp tabs
 */
function createWitchCollarGeo() {
  const radial = 12;
  const cols = radial + 1;
  const profile = [
    { y: 0.204, rx: 0.078, rz: 0.072, frontDip: 0.015 }, // Inner neck hug seating snugly under chin
    { y: 0.192, rx: 0.118, rz: 0.102, frontDip: 0.026 }, // Rounded shoulder crest
    { y: 0.162, rx: 0.128, rz: 0.108, frontDip: 0.014 }, // Soft V-front drape outer rim
    { y: 0.150, rx: 0.095, rz: 0.086, frontDip: 0.008 }  // Underlay tucked into dress top
  ];

  const positions = [];
  const indices = [];

  profile.forEach((p) => {
    for (let s = 0; s <= radial; s++) {
      const theta = (s / radial) * Math.PI * 2 + Math.PI * 0.5;
      const frontAmt = Math.max(0, Math.sin(theta));
      const y = p.y - p.frontDip * Math.pow(frontAmt, 1.5);
      const x = Math.cos(theta) * p.rx;
      const z = Math.sin(theta) * p.rz;
      positions.push(x, y, z);
    }
  });

  for (let i = 0; i < profile.length; i++) {
    const nextI = (i + 1) % profile.length;
    const rA = i * cols;
    const rB = nextI * cols;
    for (let s = 0; s < radial; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Sturdy short Chibi boot with beveled wide rounded-square toe and ankle collar
 */
function createWitchBootGeo() {
  const rings = [
    { center: [0, 0.002, 0.018], rx: 0.042, rz: 0.068, squircle: 0.72 }, // Wide beveled outsole
    { center: [0, 0.022, 0.016], rx: 0.040, rz: 0.064, squircle: 0.74 }, // Lower boot wall
    { center: [0, 0.042, 0.004], rx: 0.036, rz: 0.048, squircle: 0.80 }, // Instep slope
    { center: [0, 0.072, -0.004], rx: 0.035, rz: 0.040, squircle: 0.86 } // Ankle shaft up under hem
  ];
  return createLoftedSegmentGeo(rings, 10, true, true);
}

/**
 * Factory to create an independent Procedural 3D Witch character
 */
export function createWitchCharacter(customColors = {}) {
  const safeCustom = (customColors && typeof customColors === 'object' && !customColors.Scene)
    ? customColors
    : {};
  const colors = { ...WITCH_DEFAULT_COLORS, ...safeCustom };

  const witchGroup = new THREE.Group();
  witchGroup.name = 'ChibiWitch';

  // Keep track of disposable assets owned by Witch
  const createdGeometries = [];
  const trackGeo = (geo) => {
    createdGeometries.push(geo);
    return geo;
  };

  // ==========================================
  // 1. MATERIALS (PBR + Faceted Low-Poly)
  // ==========================================
  const hatMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hat),
    roughness: 0.78,
    metalness: 0.04,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const hatBandMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hatBand),
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hair),
    emissive: new THREE.Color(colors.hair),
    emissiveIntensity: 0.22,
    roughness: 0.86,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.skin),
    roughness: 0.82,
    metalness: 0.01,
    flatShading: false
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyes),
    roughness: 0.28,
    metalness: 0.04
  });

  const browMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyebrows),
    roughness: 0.85,
    metalness: 0.0,
    flatShading: true
  });

  const dressMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.dress),
    roughness: 0.80,
    metalness: 0.03,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const collarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.dressLight),
    roughness: 0.78,
    metalness: 0.03,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const sleeveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.sleeve),
    roughness: 0.82,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const capeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.cape),
    roughness: 0.86,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const darkCavityMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#09030c'),
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true
  });

  const emeraldSettingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.emeraldSetting),
    roughness: 0.65,
    metalness: 0.18,
    flatShading: true
  });

  const emeraldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0eb834'),
    emissive: new THREE.Color(colors.emerald),
    emissiveIntensity: 0.62,
    roughness: 0.14,
    metalness: 0.16,
    flatShading: true
  });

  const corkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.cork),
    roughness: 0.86,
    metalness: 0.02,
    flatShading: true
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.shoes),
    roughness: 0.76,
    metalness: 0.04,
    flatShading: true
  });

  // Potion Glass & Glowing Liquid Materials (Clear bright crystal glass + saturated liquids)
  const greenGlassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.05,
    metalness: 0.14,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    flatShading: true
  });

  const greenNeckGlassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#e4ffe9'),
    roughness: 0.08,
    metalness: 0.12,
    transparent: true,
    opacity: 0.30,
    depthWrite: false,
    flatShading: true
  });

  const greenLiquidMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#014e10'),
    emissive: new THREE.Color('#00e829'),
    emissiveIntensity: 0.86,
    roughness: 0.34,
    metalness: 0.0,
    flatShading: true
  });

  const greenLiquidTopMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#058e1c'),
    emissive: new THREE.Color('#22ff4a'),
    emissiveIntensity: 0.92,
    roughness: 0.24,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const purpleGlassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
    roughness: 0.05,
    metalness: 0.14,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    flatShading: true
  });

  const purpleNeckGlassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#f6e2ff'),
    roughness: 0.08,
    metalness: 0.12,
    transparent: true,
    opacity: 0.30,
    depthWrite: false,
    flatShading: true
  });

  const purpleLiquidMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#4a047e'),
    emissive: new THREE.Color('#b81eff'),
    emissiveIntensity: 0.86,
    roughness: 0.34,
    metalness: 0.0,
    flatShading: true
  });

  const purpleLiquidTopMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#aa24e6'),
    emissive: new THREE.Color('#d659ff'),
    emissiveIntensity: 0.92,
    roughness: 0.24,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const glassHighlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const greenParticleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.greenPotion),
    emissive: new THREE.Color(colors.greenPotion),
    emissiveIntensity: 1.4,
    roughness: 0.2,
    flatShading: true
  });

  const purpleParticleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.purplePotion),
    emissive: new THREE.Color(colors.purplePotion),
    emissiveIntensity: 1.4,
    roughness: 0.2,
    flatShading: true
  });

  const materials = {
    hatMat,
    hatBandMat,
    hairMat,
    skinMat,
    eyeMat,
    browMat,
    dressMat,
    collarMat,
    sleeveMat,
    capeMat,
    darkCavityMat,
    emeraldSettingMat,
    emeraldMat,
    corkMat,
    shoesMat,
    greenGlassMat,
    greenNeckGlassMat,
    greenLiquidMat,
    greenLiquidTopMat,
    purpleGlassMat,
    purpleNeckGlassMat,
    purpleLiquidMat,
    purpleLiquidTopMat,
    glassHighlightMat,
    greenParticleMat,
    purpleParticleMat
  };

  // ==========================================
  // 2. HIERARCHY GROUPS
  // ==========================================
  // Front view (+Z forward):
  // -X (Screen Left)  = Character's RIGHT arm -> Green Potion Flask
  // +X (Screen Right) = Character's LEFT arm  -> Purple Potion Flask
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'torsoGroup';
  torsoGroup.position.set(0, 0.275, 0);

  const headGroup = new THREE.Group();
  headGroup.name = 'headGroup';
  headGroup.position.set(0, 0.556, 0);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.name = 'rightArmGroup';
  rightArmGroup.position.set(-0.094, 0.430, 0.008);

  const leftArmGroup = new THREE.Group();
  leftArmGroup.name = 'leftArmGroup';
  leftArmGroup.position.set(0.094, 0.430, 0.008);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.name = 'rightLegGroup';
  rightLegGroup.position.set(-0.062, 0.08, 0.004);

  const leftLegGroup = new THREE.Group();
  leftLegGroup.name = 'leftLegGroup';
  leftLegGroup.position.set(0.062, 0.08, 0.004);

  const magicEffectsGroup = new THREE.Group();
  magicEffectsGroup.name = 'magicEffectsGroup';

  // ==========================================
  // 3. TORSO: SLIM A-LINE DRESS, CURVED CAPE, DRAPED COLLAR & EMERALD CRYSTAL
  // ==========================================
  const dressGroup = new THREE.Group();
  dressGroup.name = 'dressGroup';

  const dressMesh = new THREE.Mesh(trackGeo(createWitchDressGeo()), dressMat);
  dressMesh.castShadow = true;
  dressMesh.receiveShadow = true;
  dressGroup.add(dressMesh);
  torsoGroup.add(dressGroup);

  // Continuous Curved Dark Plum Cape draping naturally around shoulders behind skirt
  const capeGroup = new THREE.Group();
  capeGroup.name = 'capeGroup';

  const capeMesh = new THREE.Mesh(trackGeo(createWitchCapeGeo()), capeMat);
  capeMesh.castShadow = true;
  capeMesh.receiveShadow = true;
  capeGroup.add(capeMesh);
  torsoGroup.add(capeGroup);

  // Smooth Draped Shoulder Collar / Cowl with rounded V-notch framing chest crystal
  const collarGroup = new THREE.Group();
  collarGroup.name = 'collarGroup';

  const collarMesh = new THREE.Mesh(trackGeo(createWitchCollarGeo()), collarMat);
  collarMesh.castShadow = true;
  collarMesh.receiveShadow = true;
  collarGroup.add(collarMesh);

  // Neck shadow core tucked deeply inside collar without showing a harsh dark ring in front view
  const neckCore = new THREE.Mesh(
    trackGeo(makeFlat(new THREE.CylinderGeometry(0.036, 0.044, 0.028, 10))),
    darkCavityMat
  );
  neckCore.position.set(0, 0.184, -0.014);
  collarGroup.add(neckCore);

  torsoGroup.add(collarGroup);

  // Compact Sharp Faceted Emerald Crystal perched cleanly in collar notch
  const emeraldGemGroup = new THREE.Group();
  emeraldGemGroup.name = 'emeraldGemGroup';
  emeraldGemGroup.position.set(0, 0.166, 0.104);

  const emeraldBezel = new THREE.Mesh(
    trackGeo(makeFlat(new THREE.OctahedronGeometry(0.0195, 0))),
    emeraldSettingMat
  );
  emeraldBezel.scale.set(0.92, 1.16, 0.55);
  emeraldBezel.position.z = -0.002;
  emeraldGemGroup.add(emeraldBezel);

  const emeraldGemMesh = new THREE.Mesh(
    trackGeo(makeFlat(new THREE.OctahedronGeometry(0.0165, 0))),
    emeraldMat
  );
  emeraldGemMesh.scale.set(0.90, 1.16, 0.72);
  emeraldGemMesh.position.z = 0.004;
  emeraldGemGroup.add(emeraldGemMesh);

  const emeraldHighlight = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.0042, 6, 4)),
    glassHighlightMat
  );
  emeraldHighlight.position.set(-0.003, 0.004, 0.016);
  emeraldGemGroup.add(emeraldHighlight);

  torsoGroup.add(emeraldGemGroup);
  witchGroup.add(torsoGroup);

  // ==========================================
  // 4. HEAD, FACE, HAIR & ICONIC BENT WITCH HAT (headGroup)
  // ==========================================
  const faceGroup = new THREE.Group();
  faceGroup.name = 'faceGroup';

  const headMesh = new THREE.Mesh(trackGeo(createWitchHeadGeo(0.134, 0.108, 0.118)), skinMat);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  faceGroup.add(headMesh);
  headGroup.add(faceGroup);

  // Eyes (Clean smaller balanced vertical black pill eyes)
  const eyeGroup = new THREE.Group();
  eyeGroup.name = 'eyeGroup';
  const eyeGeo = trackGeo(new THREE.CapsuleGeometry(0.0145, 0.020, 4, 8));

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(-0.052, -0.018, 0.106);
  eyeGroup.add(rightEye);

  const leftEye = new THREE.Mesh(eyeGeo.clone(), eyeMat);
  leftEye.position.set(0.052, -0.018, 0.106);
  eyeGroup.add(leftEye);
  headGroup.add(eyeGroup);

  // Thin short eyebrows tucked cleanly below sculpted forehead bangs
  const eyebrowGroup = new THREE.Group();
  eyebrowGroup.name = 'eyebrowGroup';
  const browGeo = trackGeo(makeFlat(new THREE.BoxGeometry(0.028, 0.0065, 0.009)));

  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.position.set(-0.052, 0.014, 0.107);
  rightBrow.rotation.z = -0.14;
  eyebrowGroup.add(rightBrow);

  const leftBrow = new THREE.Mesh(browGeo.clone(), browMat);
  leftBrow.position.set(0.052, 0.014, 0.107);
  leftBrow.rotation.z = 0.14;
  eyebrowGroup.add(leftBrow);
  headGroup.add(eyebrowGroup);

  // Hair (Curved cheek-hugging C-bob visible around both cheeks + visible sculpted forehead bangs)
  const hairGroup = new THREE.Group();
  hairGroup.name = 'hairGroup';

  const backHairShell = new THREE.Mesh(trackGeo(createBackHairGeo()), hairMat);
  backHairShell.castShadow = true;
  backHairShell.receiveShadow = true;
  hairGroup.add(backHairShell);

  const topHairCap = new THREE.Mesh(
    trackGeo(makeFlat(new THREE.SphereGeometry(0.136, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48))),
    hairMat
  );
  topHairCap.position.set(0, 0.034, -0.010);
  topHairCap.scale.set(1.02, 0.66, 0.94);
  hairGroup.add(topHairCap);

  // Cheek-hugging curved side bobs pushed slightly forward/outward so C-frame hugs face cleanly from front
  function createCurvedBobLockRings(sign) {
    return [
      { center: [sign * 0.098, -0.104, 0.036], rx: 0.014, rz: 0.030, squircle: 0.85 },
      { center: [sign * 0.122, -0.070, 0.028], rx: 0.030, rz: 0.054, squircle: 0.85 },
      { center: [sign * 0.144, -0.022, 0.024], rx: 0.038, rz: 0.066, squircle: 0.88 },
      { center: [sign * 0.148,  0.032, 0.024], rx: 0.042, rz: 0.068, squircle: 0.90 },
      { center: [sign * 0.132,  0.074, 0.022], rx: 0.036, rz: 0.062, squircle: 0.90 }
    ];
  }

  const rightSideLock = new THREE.Mesh(
    trackGeo(createLoftedSegmentGeo(createCurvedBobLockRings(-1), 8, true, true)),
    hairMat
  );
  rightSideLock.castShadow = true;
  rightSideLock.receiveShadow = true;
  hairGroup.add(rightSideLock);

  const leftSideLock = new THREE.Mesh(
    trackGeo(createLoftedSegmentGeo(createCurvedBobLockRings(1), 8, true, true)),
    hairMat
  );
  leftSideLock.castShadow = true;
  leftSideLock.receiveShadow = true;
  hairGroup.add(leftSideLock);

  // Prominently visible low-poly swept forehead bangs curving down to just above brows
  const bangLeftOuter = new THREE.Mesh(
    trackGeo(createTaperedPanelGeo(
      [-0.138, 0.080, 0.084],
      [-0.050, 0.086, 0.116],
      [-0.050, 0.086, 0.064],
      [-0.134, 0.080, 0.050],
      [-0.132, 0.012, 0.080],
      [-0.052, 0.032, 0.116],
      [-0.052, 0.038, 0.076],
      [-0.130, 0.020, 0.056]
    )),
    hairMat
  );
  bangLeftOuter.castShadow = true;
  hairGroup.add(bangLeftOuter);

  const bangLeftCenter = new THREE.Mesh(
    trackGeo(createTaperedPanelGeo(
      [-0.068, 0.086, 0.112],
      [ 0.022, 0.088, 0.124],
      [ 0.018, 0.088, 0.068],
      [-0.064, 0.086, 0.068],
      [-0.060, 0.032, 0.114],
      [-0.010, 0.018, 0.124],
      [-0.010, 0.024, 0.082],
      [-0.058, 0.038, 0.080]
    )),
    hairMat
  );
  bangLeftCenter.castShadow = true;
  hairGroup.add(bangLeftCenter);

  const bangRightMain = new THREE.Mesh(
    trackGeo(createTaperedPanelGeo(
      [-0.014, 0.088, 0.124],
      [ 0.078, 0.086, 0.112],
      [ 0.074, 0.086, 0.068],
      [-0.012, 0.088, 0.068],
      [ 0.016, 0.016, 0.123],
      [ 0.070, 0.034, 0.113],
      [ 0.066, 0.040, 0.080],
      [ 0.016, 0.022, 0.082]
    )),
    hairMat
  );
  bangRightMain.castShadow = true;
  hairGroup.add(bangRightMain);

  const bangRightOuter = new THREE.Mesh(
    trackGeo(createTaperedPanelGeo(
      [ 0.050, 0.086, 0.116],
      [ 0.138, 0.080, 0.084],
      [ 0.134, 0.080, 0.050],
      [ 0.050, 0.086, 0.064],
      [ 0.052, 0.032, 0.116],
      [ 0.132, 0.012, 0.080],
      [ 0.130, 0.020, 0.056],
      [ 0.052, 0.038, 0.076]
    )),
    hairMat
  );
  bangRightOuter.castShadow = true;
  hairGroup.add(bangRightOuter);

  headGroup.add(hairGroup);

  // Proportionally Scaled Hooked Witch Hat seated gently low over forehead bangs
  const witchHatGroup = new THREE.Group();
  witchHatGroup.name = 'witchHatGroup';
  witchHatGroup.position.set(0, 0.064, -0.006);

  const hatBrim = new THREE.Mesh(trackGeo(createWitchBrimGeo(14)), hatMat);
  hatBrim.castShadow = false; // Prevent harsh pitch-black shadow mask across Chibi face
  hatBrim.receiveShadow = true;
  witchHatGroup.add(hatBrim);

  // Slim dark brown-charcoal ribbon hat band wrapping base of tapered crown
  const hatBand = new THREE.Mesh(
    trackGeo(makeFlat(new THREE.CylinderGeometry(0.172, 0.192, 0.044, 14))),
    hatBandMat
  );
  hatBand.position.set(0.002, 0.040, -0.002);
  hatBand.rotation.z = -0.025;
  hatBand.castShadow = true;
  hatBand.receiveShadow = true;
  witchHatGroup.add(hatBand);

  // Shorter, chunkier lower crown tapering smoothly into bent hook
  const lowerCrownRings = [
    { center: [0.000, 0.016,  0.000], radius: 0.186, tiltZ: 0.00, tiltX:  0.00 },
    { center: [0.003, 0.068, -0.002], radius: 0.164, tiltZ: 0.04, tiltX: -0.02 },
    { center: [0.012, 0.132, -0.007], radius: 0.132, tiltZ: 0.12, tiltX: -0.04 },
    { center: [0.028, 0.196, -0.013], radius: 0.098, tiltZ: 0.28, tiltX: -0.06 }
  ];
  const hatCrown = new THREE.Mesh(
    trackGeo(createLoftedSegmentGeo(lowerCrownRings, 14, false, false)),
    hatMat
  );
  hatCrown.castShadow = true;
  hatCrown.receiveShadow = true;
  witchHatGroup.add(hatCrown);

  // Smoother, shorter hooked tip leaning toward screen-right (+X) without whip-like sharpness
  const upperTipRings = [
    { center: [0.028, 0.196, -0.013], radius: 0.098, tiltZ: 0.28, tiltX: -0.06 },
    { center: [0.052, 0.252, -0.019], radius: 0.072, tiltZ: 0.54, tiltX: -0.07 },
    { center: [0.084, 0.296, -0.024], radius: 0.048, tiltZ: 0.96, tiltX: -0.06 },
    { center: [0.116, 0.312, -0.025], radius: 0.029, tiltZ: 1.50, tiltX: -0.04 },
    { center: [0.142, 0.292, -0.020], radius: 0.014, tiltZ: 2.02, tiltX: -0.01 },
    { center: [0.156, 0.266, -0.014], radius: 0.002, tiltZ: 2.28, tiltX:  0.00 }
  ];
  const curvedTip = new THREE.Mesh(
    trackGeo(createLoftedSegmentGeo(upperTipRings, 14, false, true)),
    hatMat
  );
  curvedTip.castShadow = true;
  curvedTip.receiveShadow = true;
  witchHatGroup.add(curvedTip);

  headGroup.add(witchHatGroup);
  witchGroup.add(headGroup);

  // ==========================================
  // 5. SHORT STURDY LEGS & BEVELED BOOTS (rightLegGroup, leftLegGroup)
  // ==========================================
  const legBridgeGeo = trackGeo(makeFlat(new THREE.CylinderGeometry(0.034, 0.036, 0.075, 10)));
  const bootGeo = trackGeo(createWitchBootGeo());

  [rightLegGroup, leftLegGroup].forEach((legGrp, idx) => {
    const legUpper = new THREE.Mesh(legBridgeGeo.clone(), shoesMat);
    legUpper.position.set(0, 0.016, 0);
    legUpper.castShadow = true;
    legGrp.add(legUpper);

    const shoe = new THREE.Mesh(bootGeo.clone(), shoesMat);
    shoe.position.set(0, -0.080, 0); // Flat bottom outsole strictly at world y = 0.002
    shoe.castShadow = true;
    shoe.receiveShadow = true;
    legGrp.add(shoe);

    legGrp.rotation.y = idx === 0 ? 0.05 : -0.05;
    witchGroup.add(legGrp);
  });

  // ==========================================
  // 6. ALCHEMY POTION FLASK BUILDER (Glass + Horizontal Liquid + Cork + Highlights + Glow)
  // ==========================================
  function createPotionBottle({ name, glassMat, neckGlassMat, liquidMat, liquidTopMat, glowColorHex, lightOffset }) {
    const group = new THREE.Group();
    group.name = name;

    const bulbRadius = 0.072;
    const liquidRadius = 0.064;

    // 6.1 Glowing Horizontal Liquid (~60% volume fill inside clear glass flask)
    const thetaFillStart = Math.PI * 0.42;
    const liquidBodyGeo = trackGeo(makeFlat(
      new THREE.SphereGeometry(liquidRadius, 12, 5, 0, Math.PI * 2, thetaFillStart, Math.PI - thetaFillStart)
    ));
    const liquidBody = new THREE.Mesh(liquidBodyGeo, liquidMat);
    group.add(liquidBody);

    const meniscusY = liquidRadius * Math.cos(thetaFillStart);
    const meniscusR = liquidRadius * Math.sin(thetaFillStart);
    const liquidTop = new THREE.Mesh(
      trackGeo(makeFlat(new THREE.CircleGeometry(meniscusR, 12))),
      liquidTopMat
    );
    liquidTop.rotation.x = -Math.PI * 0.5;
    liquidTop.position.y = meniscusY;
    group.add(liquidTop);

    // 6.2 Outer Faceted Clear Glass Bulb & Empty Upper Air Chamber
    const glassBulb = new THREE.Mesh(
      trackGeo(makeFlat(new THREE.SphereGeometry(bulbRadius, 12, 8))),
      glassMat
    );
    glassBulb.scale.set(1.0, 0.96, 1.0);
    group.add(glassBulb);

    // Cylindrical Glass Neck + Faceted Collar Lip
    const glassNeck = new THREE.Mesh(
      trackGeo(makeFlat(new THREE.CylinderGeometry(0.022, 0.025, 0.042, 10, 1, true))),
      neckGlassMat
    );
    glassNeck.position.y = 0.081;
    group.add(glassNeck);

    const glassLip = new THREE.Mesh(
      trackGeo(makeFlat(new THREE.CylinderGeometry(0.030, 0.029, 0.013, 10))),
      neckGlassMat
    );
    glassLip.position.y = 0.102;
    group.add(glassLip);

    // 6.3 Compact Wooden Cork Stopper
    const corkOuter = new THREE.Mesh(
      trackGeo(makeFlat(new THREE.CylinderGeometry(0.0185, 0.016, 0.020, 10))),
      corkMat
    );
    corkOuter.position.y = 0.114;
    corkOuter.castShadow = true;
    group.add(corkOuter);

    const corkPlug = new THREE.Mesh(
      trackGeo(makeFlat(new THREE.CylinderGeometry(0.0155, 0.0125, 0.020, 10))),
      corkMat
    );
    corkPlug.position.y = 0.094;
    group.add(corkPlug);

    // 6.4 Crisp Stylized Specular Glass Highlights
    const upperSpec = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.024, 0.013)), glassHighlightMat);
    upperSpec.position.set(-0.026, 0.030, 0.063);
    upperSpec.rotation.set(-0.34, -0.34, 0.30);
    group.add(upperSpec);

    const dotSpec = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.010, 0.010)), glassHighlightMat);
    dotSpec.position.set(-0.041, 0.013, 0.056);
    dotSpec.rotation.set(-0.18, -0.58, 0.15);
    group.add(dotSpec);

    const neckSpec = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.009, 0.018)), glassHighlightMat);
    neckSpec.position.set(-0.008, 0.081, 0.024);
    neckSpec.rotation.set(0, -0.25, 0);
    group.add(neckSpec);

    // 6.5 Soft Center-Weighted Fresnel Halo (No hard circular boundary) + Localized PointLight
    const haloInnerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(glowColorHex),
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    haloInnerMat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vHaloViewNormal;\nvarying vec3 vHaloViewPos;')
        .replace(
          '#include <project_vertex>',
          '#include <project_vertex>\nvHaloViewNormal = normalize(normalMatrix * normal);\nvHaloViewPos = -mvPosition.xyz;'
        );
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vHaloViewNormal;\nvarying vec3 vHaloViewPos;')
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\nfloat haloViewDot = clamp(abs(dot(normalize(vHaloViewNormal), normalize(vHaloViewPos))), 0.0, 1.0);\ndiffuseColor.a *= pow(haloViewDot, 2.4);'
        );
    };
    const haloInnerMesh = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.094, 18, 14)), haloInnerMat);
    haloInnerMesh.position.y = -0.006;
    group.add(haloInnerMesh);

    const light = new THREE.PointLight(new THREE.Color(glowColorHex), 0.10, 0.21, 2.0);
    light.position.set(lightOffset[0], lightOffset[1], lightOffset[2]);
    group.add(light);

    return { group, haloInnerMat, light };
  }

  // ==========================================
  // 7. BEVELED BELL SLEEVES, HANDS & ATTACHED POTIONS (rightArmGroup, leftArmGroup)
  // ==========================================
  const sleeveFlareGeo = trackGeo(createLoftedSegmentGeo([
    { center: [0, -0.138, 0], radius: 0.048, zScale: 0.94 }, // Tucked cuff underside
    { center: [0, -0.132, 0], radius: 0.058, zScale: 0.95 }, // Beveled cuff lip
    { center: [0, -0.106, 0], radius: 0.056, zScale: 0.95 }, // Bell outer flare
    { center: [0, -0.048, 0], radius: 0.042, zScale: 0.95 }, // Upper arm taper
    { center: [0, -0.004, 0], radius: 0.032, zScale: 0.94 }  // Shoulder socket
  ], 10, false, false));
  const sleeveCapGeo = trackGeo(makeFlat(new THREE.CircleGeometry(0.047, 10)));
  const handGeo = trackGeo(new THREE.SphereGeometry(0.030, 10, 8));

  // 7.1 Right Arm (Screen Left, -X) -> Holds Green Potion Flask
  const rightArmChain = new THREE.Group();
  rightArmChain.rotation.set(-0.46, 0.0, -0.58);

  const rightSleeve = new THREE.Mesh(sleeveFlareGeo, sleeveMat);
  rightSleeve.castShadow = true;
  rightSleeve.receiveShadow = true;
  rightArmChain.add(rightSleeve);

  const rightSleeveInner = new THREE.Mesh(sleeveCapGeo, darkCavityMat);
  rightSleeveInner.rotation.x = Math.PI * 0.5;
  rightSleeveInner.position.set(0, -0.130, 0);
  rightArmChain.add(rightSleeveInner);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.154, 0);
  rightHand.scale.set(0.95, 0.90, 0.88);
  rightHand.castShadow = true;
  rightArmChain.add(rightHand);

  rightArmGroup.add(rightArmChain);

  const greenPotion = createPotionBottle({
    name: 'greenPotionGroup',
    glassMat: greenGlassMat,
    neckGlassMat: greenNeckGlassMat,
    liquidMat: greenLiquidMat,
    liquidTopMat: greenLiquidTopMat,
    glowColorHex: colors.greenPotion,
    lightOffset: [-0.034, -0.012, 0.030]
  });
  const greenPotionGroup = greenPotion.group;
  greenPotionGroup.position.set(-0.150, -0.092, 0.070);
  rightArmGroup.add(greenPotionGroup);

  witchGroup.add(rightArmGroup);

  // 7.2 Left Arm (Screen Right, +X) -> Holds Purple Potion Flask
  const leftArmChain = new THREE.Group();
  leftArmChain.rotation.set(-0.46, 0.0, 0.58);

  const leftSleeve = new THREE.Mesh(sleeveFlareGeo.clone(), sleeveMat);
  leftSleeve.castShadow = true;
  leftSleeve.receiveShadow = true;
  leftArmChain.add(leftSleeve);

  const leftSleeveInner = new THREE.Mesh(sleeveCapGeo.clone(), darkCavityMat);
  leftSleeveInner.rotation.x = Math.PI * 0.5;
  leftSleeveInner.position.set(0, -0.130, 0);
  leftArmChain.add(leftSleeveInner);

  const leftHand = new THREE.Mesh(handGeo.clone(), skinMat);
  leftHand.position.set(0, -0.154, 0);
  leftHand.scale.set(0.95, 0.90, 0.88);
  leftHand.castShadow = true;
  leftArmChain.add(leftHand);

  leftArmGroup.add(leftArmChain);

  const purplePotion = createPotionBottle({
    name: 'purplePotionGroup',
    glassMat: purpleGlassMat,
    neckGlassMat: purpleNeckGlassMat,
    liquidMat: purpleLiquidMat,
    liquidTopMat: purpleLiquidTopMat,
    glowColorHex: colors.purplePotion,
    lightOffset: [0.034, -0.012, 0.030]
  });
  const purplePotionGroup = purplePotion.group;
  purplePotionGroup.position.set(0.150, -0.092, 0.070);
  leftArmGroup.add(purplePotionGroup);

  witchGroup.add(leftArmGroup);

  // ==========================================
  // 8. MAGIC PARTICLES (Twin Alchemy Sparks Around Bottles — Zero Floor Effects!)
  // ==========================================
  const greenParticleGroup = new THREE.Group();
  greenParticleGroup.name = 'greenParticles';
  const purpleParticleGroup = new THREE.Group();
  purpleParticleGroup.name = 'purpleParticles';

  const particleGeo = trackGeo(makeFlat(new THREE.OctahedronGeometry(0.0046, 0)));
  const particles = [];

  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * Math.PI * 2 + 0.3;
    const rad = 0.084 + (i % 2) * 0.018;

    const gMesh = new THREE.Mesh(particleGeo, greenParticleMat);
    const gBase = new THREE.Vector3(Math.cos(theta) * rad, -0.02 + (i % 3) * 0.045, Math.sin(theta) * rad * 0.7);
    gMesh.position.copy(gBase);
    gMesh.scale.setScalar(0.65 + (i % 3) * 0.20);
    greenParticleGroup.add(gMesh);
    particles.push({ mesh: gMesh, base: gBase, phase: i * 1.1, side: 'green' });

    const pMesh = new THREE.Mesh(particleGeo, purpleParticleMat);
    const pBase = new THREE.Vector3(Math.cos(theta + 0.5) * rad, -0.02 + (i % 3) * 0.045, Math.sin(theta + 0.5) * rad * 0.7);
    pMesh.position.copy(pBase);
    pMesh.scale.setScalar(0.65 + (i % 3) * 0.20);
    purpleParticleGroup.add(pMesh);
    particles.push({ mesh: pMesh, base: pBase, phase: i * 1.3 + 2.0, side: 'purple' });
  }

  // Attach particles to potion groups in magicEffectsGroup hierarchy or anchor smoothly
  greenPotionGroup.add(greenParticleGroup);
  purplePotionGroup.add(purpleParticleGroup);
  witchGroup.add(magicEffectsGroup);

  // ==========================================
  // 9. CONTROLLER API
  // ==========================================
  let activePose = 'idle';
  let greenGlowEnabled = true;
  let purpleGlowEnabled = true;
  let glowIntensity = 1.0;
  let particlesEnabled = true;
  let breathingEnabled = true;

  function applyEffectsState(elapsedTime = 0) {
    const poseBoost = activePose === 'cast' ? 1.28 : activePose === 'alchemy' ? 1.22 : 1.0;
    const pulseG = 0.88 + 0.12 * Math.sin(elapsedTime * 2.1);
    const pulseP = 0.88 + 0.12 * Math.sin(elapsedTime * 2.1 + 1.4);
    const pulseE = 0.85 + 0.15 * Math.sin(elapsedTime * 1.7 + 0.5);

    // Emerald chest gem soft faceted jewel glow
    emeraldMat.emissiveIntensity = 0.62 * pulseE * (0.35 + 0.65 * glowIntensity);

    // Green Potion Glow
    const gActive = greenGlowEnabled && glowIntensity > 0.01;
    const gFactor = gActive ? glowIntensity * pulseG * poseBoost : 0.0;
    greenLiquidMat.emissiveIntensity = 0.88 * gFactor;
    greenLiquidTopMat.emissiveIntensity = 0.94 * gFactor;
    greenPotion.haloInnerMat.opacity = 0.16 * gFactor;
    greenPotion.light.visible = gActive;
    greenPotion.light.intensity = 0.10 * gFactor;

    // Purple Potion Glow
    const pActive = purpleGlowEnabled && glowIntensity > 0.01;
    const pFactor = pActive ? glowIntensity * pulseP * poseBoost : 0.0;
    purpleLiquidMat.emissiveIntensity = 0.88 * pFactor;
    purpleLiquidTopMat.emissiveIntensity = 0.94 * pFactor;
    purplePotion.haloInnerMat.opacity = 0.16 * pFactor;
    purplePotion.light.visible = pActive;
    purplePotion.light.intensity = 0.10 * pFactor;

    // Magic particles around bottles (boost slightly in Cast / Alchemy)
    const showParticles = particlesEnabled;
    greenParticleGroup.visible = showParticles && greenGlowEnabled;
    purpleParticleGroup.visible = showParticles && purpleGlowEnabled;
  }

  function setEffects(opts = {}) {
    if (opts.greenGlow !== undefined) greenGlowEnabled = Boolean(opts.greenGlow);
    if (opts.purpleGlow !== undefined) purpleGlowEnabled = Boolean(opts.purpleGlow);
    if (opts.intensity !== undefined) {
      const n = Number(opts.intensity);
      glowIntensity = Math.max(0, Math.min(1, Number.isFinite(n) ? n : 1));
    }
    if (opts.particles !== undefined) particlesEnabled = Boolean(opts.particles);
    if (opts.breathe !== undefined) breathingEnabled = Boolean(opts.breathe);
    applyEffectsState(0);
  }

  function setColors(newColors) {
    if (newColors.hat) hatMat.color.set(newColors.hat);
    if (newColors.hatBand) hatBandMat.color.set(newColors.hatBand);
    if (newColors.hair) {
      hairMat.color.set(newColors.hair);
      hairMat.emissive.set(newColors.hair);
    }
    if (newColors.skin) skinMat.color.set(newColors.skin);
    if (newColors.eyes) eyeMat.color.set(newColors.eyes);
    if (newColors.eyebrows) browMat.color.set(newColors.eyebrows);
    if (newColors.dress) dressMat.color.set(newColors.dress);
    if (newColors.dressLight) collarMat.color.set(newColors.dressLight);
    if (newColors.sleeve) sleeveMat.color.set(newColors.sleeve);
    if (newColors.cape) capeMat.color.set(newColors.cape);
    if (newColors.emerald) {
      emeraldMat.color.set(newColors.emerald).multiplyScalar(0.58);
      emeraldMat.emissive.set(newColors.emerald);
    }
    if (newColors.greenPotion) {
      greenLiquidMat.color.set(newColors.greenPotion).multiplyScalar(0.45);
      greenLiquidMat.emissive.set(newColors.greenPotion);
      greenLiquidTopMat.color.set(newColors.greenPotion);
      greenLiquidTopMat.emissive.set(newColors.greenPotion);
      greenPotion.haloInnerMat.color.set(newColors.greenPotion);
      greenPotion.light.color.set(newColors.greenPotion);
      greenParticleMat.color.set(newColors.greenPotion);
      greenParticleMat.emissive.set(newColors.greenPotion);
    }
    if (newColors.purplePotion) {
      purpleLiquidMat.color.set(newColors.purplePotion).multiplyScalar(0.45);
      purpleLiquidMat.emissive.set(newColors.purplePotion);
      purpleLiquidTopMat.color.set(newColors.purplePotion);
      purpleLiquidTopMat.emissive.set(newColors.purplePotion);
      purplePotion.haloInnerMat.color.set(newColors.purplePotion);
      purplePotion.light.color.set(newColors.purplePotion);
      purpleParticleMat.color.set(newColors.purplePotion);
      purpleParticleMat.emissive.set(newColors.purplePotion);
    }
    if (newColors.cork) corkMat.color.set(newColors.cork);
    if (newColors.shoes) shoesMat.color.set(newColors.shoes);
  }

  function setWireframe(enabled) {
    Object.values(materials).forEach((m) => {
      m.wireframe = enabled;
    });
  }

  function setPose(poseName) {
    const normalized = poseName === 'tpose' ? 't-pose' : poseName;
    activePose = normalized;

    // Reset default Idle transforms cleanly
    headGroup.position.set(0, 0.556, 0);
    headGroup.rotation.set(0, 0, 0);
    torsoGroup.position.set(0, 0.275, 0);
    torsoGroup.rotation.set(0, 0, 0);

    rightArmGroup.position.set(-0.094, 0.430, 0.008);
    rightArmGroup.rotation.set(0, 0, 0);
    rightArmChain.rotation.set(-0.46, 0.0, -0.58);
    greenPotionGroup.position.set(-0.150, -0.092, 0.070);
    greenPotionGroup.rotation.set(0, 0, 0);

    leftArmGroup.position.set(0.094, 0.430, 0.008);
    leftArmGroup.rotation.set(0, 0, 0);
    leftArmChain.rotation.set(-0.46, 0.0, 0.58);
    purplePotionGroup.position.set(0.150, -0.092, 0.070);
    purplePotionGroup.rotation.set(0, 0, 0);

    if (normalized === 'cast') {
      // Lift both sleeves & glowing flasks outward-forward for spellcasting, keeping bottles upright
      rightArmGroup.rotation.set(-0.32, 0.0, -0.32);
      greenPotionGroup.rotation.set(0.32, 0.0, 0.32);
      leftArmGroup.rotation.set(-0.32, 0.0, 0.32);
      purplePotionGroup.rotation.set(0.32, 0.0, -0.32);
      headGroup.rotation.set(-0.04, 0, 0);
    } else if (normalized === 'alchemy') {
      // Bring green & purple potions gently forward-center toward each other without intersecting
      rightArmChain.rotation.set(-0.88, 0.18, -0.26);
      greenPotionGroup.position.set(-0.104, -0.088, 0.158);
      leftArmChain.rotation.set(-0.88, -0.18, 0.26);
      purplePotionGroup.position.set(0.104, -0.088, 0.158);
      headGroup.rotation.set(0.05, 0, 0);
    } else if (normalized === 't-pose') {
      // Horizontal T-pose for rig inspection while keeping bottles cleanly locked at palms
      rightArmChain.rotation.set(0, 0, -Math.PI * 0.5);
      greenPotionGroup.position.set(-0.200, -0.006, 0.032);
      leftArmChain.rotation.set(0, 0, Math.PI * 0.5);
      purplePotionGroup.position.set(0.200, -0.006, 0.032);
    }

    applyEffectsState(0);
  }

  function update(elapsedTime = 0, options = {}) {
    const doBreathe = options.breathe !== undefined ? Boolean(options.breathe) : breathingEnabled;

    if (doBreathe) {
      const breath = Math.sin(elapsedTime * 2.2) * 0.005;
      headGroup.position.y = 0.556 + breath * 0.65;
      torsoGroup.position.y = 0.275 + breath * 0.35;

      if (activePose === 'idle') {
        const armFloat = Math.sin(elapsedTime * 1.9) * 0.025;
        rightArmGroup.rotation.z = armFloat;
        leftArmGroup.rotation.z = -armFloat;
        greenPotionGroup.rotation.z = -armFloat;
        purplePotionGroup.rotation.z = armFloat;
      }
    } else {
      headGroup.position.y = 0.556;
      torsoGroup.position.y = 0.275;
      if (activePose === 'idle') {
        rightArmGroup.rotation.z = 0;
        leftArmGroup.rotation.z = 0;
        greenPotionGroup.rotation.z = 0;
        purplePotionGroup.rotation.z = 0;
      }
    }

    // Slow calm magic spark motion around flasks
    const speed = activePose === 'cast' || activePose === 'alchemy' ? 1.55 : 0.95;
    particles.forEach((p) => {
      const t = elapsedTime * speed + p.phase;
      p.mesh.position.x = p.base.x + Math.sin(t * 1.3) * 0.014;
      p.mesh.position.y = p.base.y + ((t * 0.045) % 0.14) - 0.03;
      p.mesh.position.z = p.base.z + Math.cos(t * 1.1) * 0.012;
      p.mesh.rotation.y = t * 1.4;
      p.mesh.rotation.x = t * 0.9;
    });

    applyEffectsState(elapsedTime);
  }

  function dispose() {
    createdGeometries.forEach((g) => g.dispose && g.dispose());
    Object.values(materials).forEach((m) => m.dispose && m.dispose());
    greenPotion.haloInnerMat.dispose();
    purplePotion.haloInnerMat.dispose();
  }

  return {
    model: witchGroup,
    group: witchGroup,
    parts: {
      headGroup,
      witchHatGroup,
      torsoGroup,
      dressGroup,
      collarGroup,
      capeGroup,
      emeraldGemGroup,
      rightArmGroup,
      leftArmGroup,
      greenPotionGroup,
      purplePotionGroup,
      rightLegGroup,
      leftLegGroup,
      magicEffectsGroup,
      greenParticleGroup,
      purpleParticleGroup
    },
    materials,
    setColors,
    setWireframe,
    setPose,
    setEffects,
    update,
    dispose
  };
}
