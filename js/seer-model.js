import * as THREE from 'three';

/**
 * SEER (NHÀ TIÊN TRI PHÉP THUẬT) — 3D PROCEDURAL CHARACTER (THREE.JS r160)
 * Calibrated directly to assets/references/seer_ref.png & assets/sprites/seer-*.png
 * Upgraded aesthetic cohesion, soft low-poly silhouettes, layered split coat + inner robe,
 * curved multi-wall hood & shoulder cowl, amethyst crystal orb & balanced studio lighting.
 */
export const SEER_DEFAULT_COLORS = {
  hoodOuter:     '#6c2f7c', // Primary royal-plum faceted hood crown
  hoodHighlight: '#884398', // Brighter crown facets
  hoodShadow:    '#491e56', // Shaded rear/lower hood facets
  hoodRim:       '#7b388a', // Turned-back crisp front hood arch cuff
  hoodLip:       '#7b388a', // Alias matching seer.html #col-lip picker
  hoodInner:     '#2a1134', // Deep velvety dark aubergine-plum lining inside hood (soft fabric shadow, not pitch void)
  hair:          '#2f1727', // Rich deep warm plum-espresso bangs blending smoothly into inner hood shadow
  skin:          '#f6ba96', // Warm luminous peach Chibi face & cupped hands (Witch-parity warmth)
  skinHighlight: '#ffd8be', // Subtle light tone reference
  skinShadow:    '#df8a7c', // Subtle warm blush/transition reference
  blush:         '#ef7c92', // Delicate lower-cheek rosy tint
  eyebrows:      '#7d4b42', // Soft muted warm dark brown slender brows (clearly legible, not pure black)
  eyes:          '#150e19', // Deep velvet-charcoal slender vertical pill eyes
  mantle:        '#5b2868', // Plush draped shoulder cowl & bell sleeves
  broochSetting: '#3a1447', // Dark plum octagon bezel mounting cabochon
  gem:           '#dc5eff', // Faceted glowing orchid-violet cabochon clasp
  gemHighlight:  '#ffffff', // Crisp faceted crystal catchlight
  belt:          '#d99b2e', // Warm satin gold waist ribbon tucked inside coat
  innerRobe:     '#7d3484', // Brighter orchid inner tunic revealed by coat opening
  robeCenter:    '#7d3484', // Alias matching seer.html #col-pleat picker
  robeDark:      '#51205c', // Split A-line overcoat panels flanking tunic
  capeBack:      '#391846', // Deep rich aubergine flared outer mage cape
  orbColor:      '#cf42ff', // Luminous amethyst crystal orb
  orbCore:       '#ead0ff', // Soft glowing amethyst-lavender inner crystal core
  shoes:         '#401e4a'  // Short dark plum rounded-square Chibi boots
};

/**
 * Utility: Ensure crisp faceted low-poly shading on any BufferGeometry
 */
export function makeFlat(geo) {
  const nonIndexed = geo.toNonIndexed ? geo.toNonIndexed() : geo;
  nonIndexed.computeVertexNormals();
  return nonIndexed;
}

/**
 * Shared CCW multi-ring loft builder used for bell sleeves, arched temple hair locks,
 * and smooth tapered low-poly components.
 */
function createLoftedSegmentGeo(rings, radialSegments = 10, capStart = false, capEnd = false) {
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
 * Helper to build a closed manifold strip from sequential soft-gable arch loops front -> back (-Z).
 * Uses a gentle rounded-gable curve (broad obtuse peak + soft fuller upper shoulders) matching seer_ref.png
 * while hugging cheeks closely and tucking rearward into the mantle cowl.
 */
function buildHoodLoopSection(loops, radialSegments = 12, capEndCenter = null, useVertexShade = false) {
  const positions = [];
  const uvs = [];
  const colors = [];
  const indices = [];
  const cols = radialSegments + 1;

  for (let lIdx = 0; lIdx < loops.length; lIdx++) {
    const loop = loops[lIdx];
    const vCoord = lIdx / Math.max(1, loops.length - 1);
    const gableMix = loop.gableMix !== undefined ? loop.gableMix : 0.18;
    const archPower = loop.archPower !== undefined ? loop.archPower : 0.62;
    const shade = loop.vShade !== undefined ? loop.vShade : 1.0;
    for (let s = 0; s <= radialSegments; s++) {
      const uCoord = s / radialSegments;
      const theta = uCoord * Math.PI * 2;
      const sn = Math.sin(theta);
      const cs = Math.cos(theta);

      // Soft pentagon upper shoulders with roomy cheek-hugging lower drape
      const topPinch = cs > 0 ? 1.0 - (loop.topPinch !== undefined ? loop.topPinch : 0.04) * Math.pow(cs, 1.35) : 1.0;
      const jawPinch = cs < 0 ? 1.0 - (loop.jawPinch !== undefined ? loop.jawPinch : 0.24) * Math.pow(-cs, 1.20) : 1.0;
      const shoulderFlare = cs > 0.15 && cs < 0.92 ? 1.0 + (loop.shoulderFlare || 0.0) * Math.sin(Math.min(1, Math.max(0, (cs - 0.15) / 0.77)) * Math.PI) : 1.0;
      const x = sn * loop.rx * topPinch * jawPinch * shoulderFlare;

      const tent = Math.max(0, 1.0 - Math.abs(sn));
      const archCurve = (1.0 - gableMix) * Math.pow(Math.max(0, cs), archPower) + gableMix * Math.pow(tent, 1.12);
      const topProfile = cs > 0 ? archCurve * loop.ryTop + (loop.peakBoost || 0) * Math.pow(tent, 1.8) : 0;
      const botProfile = cs < 0 ? -Math.pow(-cs, 0.92) * loop.ryBot : 0;
      const y = loop.cy + topProfile + botProfile;

      const browEave = cs > 0 ? (loop.browOverhang !== undefined ? loop.browOverhang : 0.010) * Math.pow(cs, 1.35) : 0;
      const sideRecede = (loop.sideRecede !== undefined ? loop.sideRecede : 0.020) * (1.0 - Math.max(0, cs));
      const neckRecede = cs < 0 ? (loop.neckRecede !== undefined ? loop.neckRecede : 0.110) * Math.pow(-cs, 1.30) : 0;
      const z = loop.z + browEave - sideRecede - neckRecede;

      positions.push(x, y, z);
      uvs.push(uCoord, vCoord);
      if (useVertexShade) {
        // Slightly deeper upper cavity falloff behind forehead crown
        const topDepthShade = cs > 0 ? shade * (1.0 - 0.12 * cs * (1.0 - vCoord)) : shade;
        colors.push(topDepthShade, topDepthShade * 0.96, topDepthShade);
      }
    }
  }

  for (let i = 0; i < loops.length - 1; i++) {
    const rA = i * cols;
    const rB = (i + 1) * cols;
    for (let s = 0; s < radialSegments; s++) {
      const a0 = rA + s;
      const a1 = rA + s + 1;
      const b0 = rB + s;
      const b1 = rB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }

  if (capEndCenter) {
    const cIdx = positions.length / 3;
    positions.push(capEndCenter[0], capEndCenter[1], capEndCenter[2]);
    uvs.push(0.5, 1.0);
    if (useVertexShade) colors.push(0.42, 0.38, 0.44);
    const lastRow = (loops.length - 1) * cols;
    for (let s = 0; s < radialSegments; s++) {
      indices.push(cIdx, lastRow + s + 1, lastRow + s);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (useVertexShade) {
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Watertight 3-Zone Seer Oracle Hood:
 * Compact lower obtuse low-poly crown, smooth forehead inverted-V fold, soft plum-shadow inner lining
 * preserving cheek dark gaps (8-12%), and flared shoulder skirt melting seamlessly into mantle/cape.
 */
function createSeerHoodGeos(radialSegments = 12) {
  const cavityBack = [
    { cy: 0.004, rx: 0.096, ryTop: 0.092, ryBot: 0.092, z: -0.070, peakBoost: 0.001, topPinch: 0.04, jawPinch: 0.04, browOverhang: 0.002, sideRecede: 0.008, neckRecede: 0.020, gableMix: 0.14, archPower: 0.66, vShade: 0.48 },
    { cy: 0.006, rx: 0.114, ryTop: 0.098, ryBot: 0.096, z:  0.022, peakBoost: 0.002, topPinch: 0.05, jawPinch: 0.02, browOverhang: 0.006, sideRecede: 0.014, neckRecede: 0.095, gableMix: 0.24, archPower: 0.72, vShade: 0.72 },
    { cy: 0.006, rx: 0.116, ryTop: 0.102, ryBot: 0.098, z:  0.104, peakBoost: 0.003, topPinch: 0.06, jawPinch: 0.02, browOverhang: 0.010, sideRecede: 0.016, neckRecede: 0.125, gableMix: 0.30, archPower: 0.74, vShade: 1.00 }
  ];

  // Tailored front cloth lip with soft inverted-V forehead fold & balanced cheek side gap
  const cuffLoops = [
    cavityBack[2],
    { cy: 0.008, rx: 0.132, ryTop: 0.128, ryBot: 0.104, z:  0.110, peakBoost: 0.0025, topPinch: 0.06, jawPinch: -0.02, browOverhang: 0.014, sideRecede: 0.018, neckRecede: 0.130, gableMix: 0.26, archPower: 0.70 }
  ];

  // Compact low-poly crown flowing smoothly down & outward into shoulder mantle + upper back cape
  const outerLoops = [
    cuffLoops[1],
    { cy: 0.010, rx: 0.145, ryTop: 0.150, ryBot: 0.112, z:  0.060, peakBoost: 0.0025, topPinch: 0.05, jawPinch: -0.03, browOverhang: 0.007, sideRecede: 0.014, neckRecede: 0.098, gableMix: 0.22, archPower: 0.69 },
    { cy: 0.010, rx: 0.149, ryTop: 0.159, ryBot: 0.116, z: -0.004, peakBoost: 0.0025, topPinch: 0.05, jawPinch: -0.05, browOverhang: 0.002, sideRecede: 0.010, neckRecede: 0.062, gableMix: 0.19, archPower: 0.70 },
    { cy: -0.004, rx: 0.140, ryTop: 0.136, ryBot: 0.114, z: -0.068, peakBoost: 0.001, topPinch: 0.04, jawPinch: -0.05, browOverhang: 0.000, sideRecede: 0.006, neckRecede: 0.026, gableMix: 0.13, archPower: 0.69 },
    { cy: -0.034, rx: 0.130, ryTop: 0.088, ryBot: 0.090, z: -0.096, peakBoost: 0.000, topPinch: 0.04, jawPinch: -0.05, browOverhang: 0.000, sideRecede: 0.004, neckRecede: 0.008, gableMix: 0.08, archPower: 0.70 },
    { cy: -0.064, rx: 0.102, ryTop: 0.046, ryBot: 0.056, z: -0.102, peakBoost: 0.000, topPinch: 0.04, jawPinch: 0.00, browOverhang: 0.000, sideRecede: 0.002, neckRecede: 0.000, gableMix: 0.05, archPower: 0.72 }
  ];

  const innerGeo = buildHoodLoopSection(cavityBack, radialSegments, [0, 0.004, -0.076], true);
  const rimGeo = buildHoodLoopSection(cuffLoops, radialSegments, null, false);
  const outerGeo = buildHoodLoopSection(outerLoops, radialSegments, [0, -0.086, -0.096], false);

  return { innerGeo, rimGeo, outerGeo };
}

/**
 * Custom multi-ring BufferGeometry for Seer's face:
 * Soft rounded inverted-trapezoid silhouette (moderately wide upper face, gently tapered cheeks,
 * trim softly rounded flat-curved chin receding cleanly toward the neck without sphere-bulge).
 */
function createSeerHeadGeo() {
  const radial = 28;
  const rings = [
    { y:  0.080, rx: 0.0420, rzF: 0.039, rzB: 0.040, zOff: -0.004, sq: 0.96 },
    { y:  0.066, rx: 0.0710, rzF: 0.064, rzB: 0.068, zOff: -0.003, sq: 0.90 },
    { y:  0.044, rx: 0.0865, rzF: 0.077, rzB: 0.080, zOff: -0.001, sq: 0.83 },
    { y:  0.020, rx: 0.0905, rzF: 0.081, rzB: 0.082, zOff:  0.000, sq: 0.80 },
    { y:  0.000, rx: 0.0895, rzF: 0.081, rzB: 0.080, zOff:  0.000, sq: 0.78 },
    { y: -0.022, rx: 0.0850, rzF: 0.079, rzB: 0.077, zOff: -0.001, sq: 0.77 },
    { y: -0.044, rx: 0.0770, rzF: 0.073, rzB: 0.070, zOff: -0.002, sq: 0.76 },
    { y: -0.058, rx: 0.0630, rzF: 0.060, rzB: 0.058, zOff: -0.004, sq: 0.77 },
    { y: -0.067, rx: 0.0430, rzF: 0.042, rzB: 0.041, zOff: -0.006, sq: 0.84 },
    { y: -0.071, rx: 0.0210, rzF: 0.021, rzB: 0.021, zOff: -0.008, sq: 0.94 }
  ];

  const positions = [];
  const indices = [];

  for (let i = 0; i < rings.length; i++) {
    const r = rings[i];
    for (let s = 0; s < radial; s++) {
      const theta = (s / radial) * Math.PI * 2;
      const sn = Math.sin(theta);
      const cs = Math.cos(theta);
      const lx = Math.sign(sn) * Math.pow(Math.abs(sn), r.sq) * r.rx;
      const rz = cs >= 0 ? r.rzF : r.rzB;
      let lz = Math.sign(cs) * Math.pow(Math.abs(cs), r.sq) * rz;
      // Softly cushion front face plane so cheeks and chin avoid protruding like a ball
      if (cs > 0.60) {
        const frontFrac = (lz / Math.max(0.001, r.rzF));
        if (frontFrac > 0.60) {
          lz = (0.60 + (frontFrac - 0.60) * 0.82) * r.rzF;
        }
      }
      positions.push(lx, r.y, lz + r.zOff);
    }
  }

  for (let i = 0; i < rings.length - 1; i++) {
    const rowA = i * radial;
    const rowB = (i + 1) * radial;
    for (let s = 0; s < radial; s++) {
      const sNext = (s + 1) % radial;
      const a0 = rowA + s;
      const a1 = rowA + sNext;
      const b0 = rowB + s;
      const b1 = rowB + sNext;
      indices.push(a0, b0, b1, a0, b1, a1);
    }
  }

  const topCenterIdx = positions.length / 3;
  positions.push(0, 0.086, -0.004);
  for (let s = 0; s < radial; s++) {
    const sNext = (s + 1) % radial;
    indices.push(topCenterIdx, s, sNext);
  }

  const botCenterIdx = positions.length / 3;
  positions.push(0, -0.0725, -0.008);
  const lastRow = (rings.length - 1) * radial;
  for (let s = 0; s < radial; s++) {
    const sNext = (s + 1) % radial;
    indices.push(botCenterIdx, lastRow + sNext, lastRow + s);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Thin skull-hugging scalp hair cap inside hood (replaces oversized helmet dome)
 */
function createSeerScalpHairGeo() {
  const radial = 14;
  const rings = [
    { y:  0.088, rx: 0.047, rzF: 0.043, rzB: 0.045, zOff: -0.005, sq: 0.94, shade: 0.62 },
    { y:  0.072, rx: 0.076, rzF: 0.069, rzB: 0.073, zOff: -0.004, sq: 0.89, shade: 0.68 },
    { y:  0.048, rx: 0.091, rzF: 0.081, rzB: 0.084, zOff: -0.002, sq: 0.83, shade: 0.76 },
    { y:  0.022, rx: 0.094, rzF: 0.083, rzB: 0.086, zOff: -0.001, sq: 0.80, shade: 0.80 },
    { y: -0.012, rx: 0.089, rzF: 0.077, rzB: 0.081, zOff: -0.004, sq: 0.78, shade: 0.74 },
    { y: -0.038, rx: 0.076, rzF: 0.060, rzB: 0.068, zOff: -0.008, sq: 0.80, shade: 0.64 }
  ];

  const positions = [];
  const colors = [];
  const indices = [];

  for (let i = 0; i < rings.length; i++) {
    const r = rings[i];
    for (let s = 0; s <= radial; s++) {
      // Back & temple arc seated behind eye plane while melting smoothly into inner hood shadow
      const u = s / radial;
      const theta = Math.PI * 0.35 + u * Math.PI * 1.30;
      const sn = Math.sin(theta);
      const cs = Math.cos(theta);
      const lx = Math.sign(sn) * Math.pow(Math.abs(sn), r.sq) * r.rx;
      const rz = cs >= 0 ? r.rzF : r.rzB;
      const lz = Math.sign(cs) * Math.pow(Math.abs(cs), r.sq) * rz + r.zOff;
      positions.push(lx, r.y, lz);
      const rearFade = cs < 0 ? r.shade * 0.88 : r.shade;
      colors.push(rearFade, rearFade * 0.94, rearFade * 1.02);
    }
  }

  const cols = radial + 1;
  for (let i = 0; i < rings.length - 1; i++) {
    const rA = i * cols;
    const rB = (i + 1) * cols;
    for (let s = 0; s < radial; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, b0, b1, a0, b1, a1);
    }
  }

  const topCenterIdx = positions.length / 3;
  positions.push(0, 0.092, -0.005);
  colors.push(0.58, 0.54, 0.60);
  for (let s = 0; s < radial; s++) {
    indices.push(topCenterIdx, s, s + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Thinner sculpted forehead bangs fading upward into hood shadow while framing brows softly
 */
function createSeerBangsGeo() {
  const radial = 14;
  const cols = radial + 1;
  const phiStart = -Math.PI * 0.51;
  const phiEnd = Math.PI * 0.51;

  // Slightly thinner profile + soft top falloff so fringe blends smoothly into inner hood dark lining
  const profile = [
    { yBase: 0.0205, edgeDip: 0.017, rx: 0.0910, rz: 0.0820, sq: 0.79, centerArch: 0.0018, shade: 0.98 },
    { yBase: 0.0185, edgeDip: 0.019, rx: 0.0938, rz: 0.0848, sq: 0.79, centerArch: 0.0022, shade: 1.00 },
    { yBase: 0.0525, edgeDip: 0.009, rx: 0.0902, rz: 0.0818, sq: 0.83, centerArch: 0.0010, shade: 0.84 },
    { yBase: 0.0885, edgeDip: 0.000, rx: 0.0705, rz: 0.0645, sq: 0.89, centerArch: 0.0000, shade: 0.62 }
  ];

  const positions = [];
  const colors = [];
  const indices = [];

  profile.forEach((p, rowIdx) => {
    for (let s = 0; s <= radial; s++) {
      const u = s / radial;
      const phi = phiStart + u * (phiEnd - phiStart);
      const sn = Math.sin(phi);
      const cs = Math.cos(phi);
      const x = Math.sign(sn) * Math.pow(Math.abs(sn), p.sq) * p.rx;
      let z = Math.sign(cs) * Math.pow(Math.abs(cs), p.sq) * p.rz;
      if (cs > 0.60) {
        const f = z / Math.max(0.001, p.rz);
        if (f > 0.60) z = (0.60 + (f - 0.60) * 0.82) * p.rz;
      }

      const sideFactor = Math.pow(Math.abs(sn), 1.65);
      const centerBump = p.centerArch * Math.max(0, 1.0 - Math.abs(u - 0.5) * 4.5);
      const microBevel = rowIdx <= 1 ? -0.0007 * Math.cos((u - 0.5) * Math.PI * 6.0) : 0;
      const y = p.yBase + centerBump + microBevel - p.edgeDip * sideFactor;
      positions.push(x, y, z);
      const sideShade = p.shade * (1.0 - 0.16 * sideFactor);
      colors.push(sideShade, sideShade * 0.96, sideShade * 1.02);
    }
  });

  for (let i = 0; i < profile.length - 1; i++) {
    const rA = i * cols;
    const rB = (i + 1) * cols;
    for (let s = 0; s < radial; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }

  for (let i = 0; i < profile.length - 1; i++) {
    const l0 = i * cols, l1 = (i + 1) * cols;
    const r0 = i * cols + radial, r1 = (i + 1) * cols + radial;
    indices.push(0, l1, l0);
    indices.push(radial, r0, r1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Waist-cinched Inner Orchid A-line tunic (Y = 0.030 .. 0.465) revealed down center inverted-V slit
 */
function createSeerInnerRobeGeo() {
  const radial = 10;
  const cols = radial + 1;
  const rings = [
    { y: 0.444, rx: 0.100, rz: 0.086, pleat: 0.000 }, // Seated cleanly below open neck collar
    { y: 0.400, rx: 0.095, rz: 0.085, pleat: 0.001 }, // Upper chest taper
    { y: 0.345, rx: 0.085, rz: 0.077, pleat: 0.001 }, // Crisp cinched waist for gold belt
    { y: 0.215, rx: 0.138, rz: 0.111, pleat: 0.002 }, // Mid skirt flare (clean inside coat lining)
    { y: 0.032, rx: 0.194, rz: 0.148, pleat: 0.002 }  // Hem inside coat wall (zero overlap!)
  ];

  const positions = [];
  const indices = [];

  rings.forEach((r) => {
    for (let s = 0; s <= radial; s++) {
      const theta = (s / radial) * Math.PI * 2 + Math.PI * 0.5;
      const pleat = Math.cos((s / radial) * Math.PI * 7) * r.pleat;
      const x = Math.cos(theta) * (r.rx + pleat);
      const z = Math.sin(theta) * (r.rz + pleat);
      positions.push(x, r.y, z);
    }
  });

  for (let i = 0; i < rings.length - 1; i++) {
    const rA = i * cols, rB = (i + 1) * cols;
    for (let s = 0; s < radial; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }

  const botCenter = positions.length / 3;
  positions.push(0, 0.030, 0);
  const lastRow = (rings.length - 1) * cols;
  for (let s = 0; s < radial; s++) {
    indices.push(botCenter, lastRow + s + 1, lastRow + s);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Waist-cinched Split A-line overcoat wrapping around sides & back with crisp inverted-V front slit
 * revealing lighter orchid inner tunic & sunken gold waist belt.
 */
function createSeerSplitCoatGeo() {
  const arcSegs = 10;
  const cols = arcSegs + 1;
  const rings = [
    { y: 0.442, rx: 0.114, rz: 0.096, slitHalfAngle: 0.16 }, // Seated cleanly beneath dipped front collar
    { y: 0.400, rx: 0.106, rz: 0.094, slitHalfAngle: 0.24 }, // Chest taper
    { y: 0.345, rx: 0.096, rz: 0.088, slitHalfAngle: 0.34 }, // Pinched waist framing belt cleanly
    { y: 0.215, rx: 0.156, rz: 0.128, slitHalfAngle: 0.38 }, // Mid skirt drape
    { y: 0.032, rx: 0.215, rz: 0.166, slitHalfAngle: 0.41 }  // Hem opening over shoes
  ];

  const positions = [];
  const indices = [];

  // Outer surface: phi goes from front-left edge (0.5*PI + slit) -> sides/back -> front-right edge (2.5*PI - slit)
  rings.forEach((r) => {
    const pStart = Math.PI * 0.5 + r.slitHalfAngle;
    const pEnd = Math.PI * 2.5 - r.slitHalfAngle;
    for (let s = 0; s <= arcSegs; s++) {
      const phi = pStart + (s / arcSegs) * (pEnd - pStart);
      positions.push(Math.cos(phi) * r.rx, r.y, Math.sin(phi) * r.rz);
    }
  });

  // Inner lapel return tucked slightly inward by 0.012m for real coat depth
  const inOff = rings.length * cols;
  rings.forEach((r) => {
    const pStart = Math.PI * 0.5 + r.slitHalfAngle;
    const pEnd = Math.PI * 2.5 - r.slitHalfAngle;
    for (let s = 0; s <= arcSegs; s++) {
      const phi = pStart + (s / arcSegs) * (pEnd - pStart);
      positions.push(Math.cos(phi) * (r.rx - 0.012), r.y, Math.sin(phi) * (r.rz - 0.012));
    }
  });

  for (let i = 0; i < rings.length - 1; i++) {
    const rA = i * cols, rB = (i + 1) * cols;
    for (let s = 0; s < arcSegs; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    const rA = inOff + i * cols, rB = inOff + (i + 1) * cols;
    for (let s = 0; s < arcSegs; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, b1, a1, a0, b0, b1);
    }
  }

  // Left & Right front slit thickness borders + Bottom hem border
  const botOut = (rings.length - 1) * cols, botIn = inOff + botOut;
  for (let s = 0; s < arcSegs; s++) {
    indices.push(botOut + s, botOut + s + 1, botIn + s + 1, botOut + s, botIn + s + 1, botIn + s);
  }
  for (let i = 0; i < rings.length - 1; i++) {
    const oA0 = i * cols, oB0 = (i + 1) * cols;
    const iA0 = inOff + oA0, iB0 = inOff + oB0;
    indices.push(oA0, oB0, iB0, oA0, iB0, iA0);

    const oA1 = i * cols + arcSegs, oB1 = (i + 1) * cols + arcSegs;
    const iA1 = inOff + oA1, iB1 = inOff + oB1;
    indices.push(oA1, iA1, iB1, oA1, iB1, oB1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Curved satin-gold front waist belt hugging inner tunic cleanly inside coat opening
 */
function createSeerBeltGeo() {
  const segs = 6;
  const cols = segs + 1;
  const pStart = Math.PI * 0.5 - 0.38;
  const pEnd = Math.PI * 0.5 + 0.38;
  const rings = [
    { y: 0.360, rx: 0.094, rz: 0.086 },
    { y: 0.334, rx: 0.096, rz: 0.088 }
  ];

  const positions = [];
  const indices = [];

  rings.forEach((r) => {
    for (let s = 0; s <= segs; s++) {
      const phi = pStart + (s / segs) * (pEnd - pStart);
      const centerDip = Math.cos((phi - Math.PI * 0.5) * 3.0) * 0.004;
      positions.push(Math.cos(phi) * r.rx, r.y - centerDip, Math.sin(phi) * r.rz);
    }
  });

  // pStart->pEnd moves +X -> -X (+phi). Along ringA->ringB moves +Y -> -Y.
  // (a0->a1) = -X, (a0->b0) = -Y => (-X) x (-Y) = +Z OUTWARD!
  for (let s = 0; s < segs; s++) {
    const a0 = s, a1 = s + 1, b0 = cols + s, b1 = cols + s + 1;
    indices.push(a0, b0, b1, a0, b1, a1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Closed thick curved 3D outer cape shell draping softly from shoulders down behind skirt
 */
function createSeerCapeGeo() {
  const arcSegs = 10;
  const cols = arcSegs + 1;
  const thickness = 0.015;
  const rings = [
    { y: 0.436, backRise: 0.048, rx: 0.126, rz: 0.090, zOff: -0.012 },
    { y: 0.405, backRise: 0.018, rx: 0.164, rz: 0.106, zOff: -0.015 },
    { y: 0.340, backRise: 0.000, rx: 0.192, rz: 0.116, zOff: -0.018 },
    { y: 0.195, backRise: 0.000, rx: 0.242, rz: 0.136, zOff: -0.024 },
    { y: 0.026, backRise: 0.000, rx: 0.282, rz: 0.154, zOff: -0.030 }
  ];

  const positions = [];
  const indices = [];
  const phiStart = Math.PI * 0.92;
  const phiEnd = Math.PI * 2.08;

  rings.forEach((ring) => {
    for (let s = 0; s <= arcSegs; s++) {
      const phi = phiStart + (s / arcSegs) * (phiEnd - phiStart);
      const backFactor = Math.max(0, -Math.sin(phi));
      const y = ring.y + (ring.backRise || 0) * Math.pow(backFactor, 1.3);
      positions.push(Math.cos(phi) * ring.rx, y, Math.sin(phi) * ring.rz + ring.zOff);
    }
  });

  const innerOffset = rings.length * cols;
  rings.forEach((ring) => {
    for (let s = 0; s <= arcSegs; s++) {
      const rawPhi = phiStart + (s / arcSegs) * (phiEnd - phiStart);
      // Chamfer outer side borders inward for natural beveled low-poly edge facets
      const phi = s === 0 ? rawPhi + 0.038 : (s === arcSegs ? rawPhi - 0.038 : rawPhi);
      const backFactor = Math.max(0, -Math.sin(phi));
      const y = ring.y + (ring.backRise || 0) * Math.pow(backFactor, 1.3);
      positions.push(
        Math.cos(phi) * Math.max(0.05, ring.rx - thickness),
        y,
        Math.sin(phi) * Math.max(0.05, ring.rz - thickness) + ring.zOff
      );
    }
  });

  for (let i = 0; i < rings.length - 1; i++) {
    const rA = i * cols, rB = (i + 1) * cols;
    for (let s = 0; s < arcSegs; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, a1, b1, a0, b1, b0);
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    const rA = innerOffset + i * cols, rB = innerOffset + (i + 1) * cols;
    for (let s = 0; s < arcSegs; s++) {
      const a0 = rA + s, a1 = rA + s + 1, b0 = rB + s, b1 = rB + s + 1;
      indices.push(a0, b1, a1, a0, b0, b1);
    }
  }

  const topOut = 0, topIn = innerOffset;
  const botOut = (rings.length - 1) * cols, botIn = innerOffset + botOut;
  for (let s = 0; s < arcSegs; s++) {
    indices.push(topOut + s, topIn + s, topIn + s + 1, topOut + s, topIn + s + 1, topOut + s + 1);
    indices.push(botOut + s, botOut + s + 1, botIn + s + 1, botOut + s, botIn + s + 1, botIn + s);
  }
  for (let i = 0; i < rings.length - 1; i++) {
    const oA0 = i * cols, oB0 = (i + 1) * cols, iA0 = innerOffset + oA0, iB0 = innerOffset + oB0;
    indices.push(oA0, oB0, iB0, oA0, iB0, iA0);

    const oA1 = i * cols + arcSegs, oB1 = (i + 1) * cols + arcSegs, iA1 = innerOffset + oA1, iB1 = innerOffset + oB1;
    indices.push(oA1, iA1, iB1, oA1, iB1, oB1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  return makeFlat(geo);
}

/**
 * Build a watertight closed cross-section collar/shawl profile dipping cleanly at the chest.
 */
function buildClosedCollarGeo(profile, radial = 14) {
  const cols = radial + 1;
  const positions = [];
  const indices = [];

  profile.forEach((p) => {
    const zCenter = p.zOff || 0;
    for (let s = 0; s <= radial; s++) {
      const theta = (s / radial) * Math.PI * 2 + Math.PI * 0.5;
      const frontAmt = Math.max(0, Math.sin(theta));
      const backAmt = Math.max(0, -Math.sin(theta));
      const sideAmt = Math.abs(Math.cos(theta));
      const y = p.y
        - p.frontDip * Math.pow(frontAmt, 1.38)
        + (p.backRise || 0) * Math.pow(backAmt, 1.15)
        + (p.sideRise || 0) * Math.pow(sideAmt, 1.35);
      const x = Math.cos(theta) * p.rx;
      const z = zCenter + Math.sin(theta) * p.rz;
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
 * Draped Seer hooded-cloak cowl rising smoothly behind & beside hood base to unite hood and cloak
 */
function createSeerMantleGeo() {
  return buildClosedCollarGeo([
    { y: 0.478, rx: 0.088, rz: 0.066, zOff: -0.010, frontDip: 0.022, backRise: 0.044, sideRise: 0.024 }, // Raised rear/side cowl cradle embracing hood skirt
    { y: 0.464, rx: 0.146, rz: 0.106, zOff: -0.008, frontDip: 0.028, backRise: 0.028, sideRise: 0.012 }, // Conical cowl slope bridging hood wall down into shoulders
    { y: 0.422, rx: 0.168, rz: 0.122, zOff: -0.006, frontDip: 0.014, backRise: 0.008, sideRise: 0.002 }, // Draped shoulder cape edge over sleeves & cape top
    { y: 0.402, rx: 0.142, rz: 0.106, zOff: -0.004, frontDip: -0.004 }, // Underside fold tucking cleanly
    { y: 0.418, rx: 0.102, rz: 0.088, zOff: -0.004, frontDip: 0.000 }   // Inner torso anchor
  ]);
}

/**
 * Diagonal scarf collar fold sweeping continuously from lower hood walls inward to chest brooch
 */
function createSeerScarfFlapGeo(sign = 1) {
  return createLoftedSegmentGeo([
    { center: [sign * 0.068, 0.483, 0.020], rx: 0.020, rz: 0.019, tiltZ: sign * 0.24, squircle: 0.78 },
    { center: [sign * 0.035, 0.472, 0.056], rx: 0.020, rz: 0.019, tiltZ: sign * 0.40, squircle: 0.78 },
    { center: [sign * 0.012, 0.457, 0.086], rx: 0.015, rz: 0.015, tiltZ: sign * 0.54, squircle: 0.80 },
    { center: [sign * 0.002, 0.445, 0.102], rx: 0.010, rz: 0.010, tiltZ: sign * 0.65, squircle: 0.85 }
  ], 8, true, true);
}

/**
 * Recessed dark plum inner collar lining seated flush inside tight shawl opening around base of neck
 */
function createSeerCollarCavityGeo() {
  return buildClosedCollarGeo([
    { y: 0.464, rx: 0.026, rz: 0.024, zOff: 0.004, frontDip: 0.018 }, // Seated neatly behind scarf V & neck base
    { y: 0.474, rx: 0.046, rz: 0.042, zOff: 0.002, frontDip: 0.024 }, // Tucks flush under mantle inner edge
    { y: 0.436, rx: 0.046, rz: 0.042, zOff: 0.002, frontDip: 0.004 }, // Sealed pocket wall
    { y: 0.436, rx: 0.020, rz: 0.018, zOff: 0.006, frontDip: 0.000 }  // Closed cleanly around neck base
  ]);
}

/**
 * Cute short Chibi rounded-square plum shoe peeking beneath robe hem (grounded at y = 0.002)
 */
function createSeerShoeGeo() {
  const rings = [
    { center: [0, 0.002, 0.006], rx: 0.031, rz: 0.044, squircle: 0.65 },
    { center: [0, 0.016, 0.008], rx: 0.036, rz: 0.050, squircle: 0.65 },
    { center: [0, 0.032, 0.004], rx: 0.033, rz: 0.044, squircle: 0.72 },
    { center: [0, 0.052, 0.000], rx: 0.026, rz: 0.032, squircle: 0.85 }
  ];
  return createLoftedSegmentGeo(rings, 8, true, true);
}

export function createSeerCharacter(customColors = {}) {
  const colors = { ...SEER_DEFAULT_COLORS, ...customColors };
  const createdGeometries = [];
  const trackGeo = (geo) => {
    createdGeometries.push(geo);
    return geo;
  };

  const seerRoot = new THREE.Group();
  seerRoot.name = 'SeerRoot';

  // ==========================================
  // 1. MATERIALS (Calibrated Low-Poly Matte Cloth + Warm Skin + Luminous Amethyst)
  // ==========================================
  const hoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hoodOuter),
    roughness: 0.76,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const hoodRimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hoodRim || colors.hoodLip),
    roughness: 0.74,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const hoodInnerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hoodInner),
    vertexColors: true,
    roughness: 0.89,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.skin),
    roughness: 0.78,
    metalness: 0.0,
    flatShading: false
  });

  const neckSkinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.skin).multiplyScalar(0.78),
    roughness: 0.84,
    metalness: 0.0,
    flatShading: false
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hair),
    emissive: new THREE.Color(colors.hair),
    emissiveIntensity: 0.025,
    vertexColors: true,
    roughness: 0.90,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const scalpHairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hair),
    emissive: new THREE.Color(colors.hair),
    emissiveIntensity: 0.015,
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.0,
    flatShading: false,
    side: THREE.DoubleSide
  });

  const blushMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.blush),
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2
  });

  const browMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyebrows),
    roughness: 0.88,
    metalness: 0.0,
    flatShading: false
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyes),
    roughness: 0.56,
    metalness: 0.04,
    flatShading: false
  });

  // Subtle pale-lavender orb catchlight specks for minimalist living eyes (stronger on orb-facing eye)
  const eyeCatchlightMatL = new THREE.MeshBasicMaterial({
    color: 0xf4e7ff,
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });

  const eyeCatchlightMatR = new THREE.MeshBasicMaterial({
    color: 0xf0e0ff,
    transparent: true,
    opacity: 0.58,
    depthWrite: false
  });

  const mantleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.mantle),
    roughness: 0.82,
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

  const broochSettingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.broochSetting),
    roughness: 0.58,
    metalness: 0.18,
    flatShading: true
  });

  const gemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.gem),
    emissive: new THREE.Color('#b636f5'),
    emissiveIntensity: 0.42,
    roughness: 0.16,
    metalness: 0.10,
    flatShading: true
  });

  const beltMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.belt),
    roughness: 0.42,
    metalness: 0.22,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const innerRobeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.innerRobe || colors.robeCenter),
    roughness: 0.82,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const robeDarkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.robeDark),
    roughness: 0.84,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const capeBackMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.capeBack),
    roughness: 0.86,
    metalness: 0.02,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const orbMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffffff),
    vertexColors: true,
    emissive: new THREE.Color('#a418e0'),
    emissiveIntensity: 0.42,
    roughness: 0.18,
    metalness: 0.06,
    flatShading: true,
    transparent: true,
    opacity: 0.80
  });

  const orbCoreMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.orbCore)
  });

  const glassHighlightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const sparkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.orbColor),
    emissive: new THREE.Color('#e06bff'),
    emissiveIntensity: 1.35,
    roughness: 0.2,
    flatShading: true
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.shoes),
    roughness: 0.76,
    metalness: 0.04,
    flatShading: true
  });

  // ==========================================
  // 2. HIERARCHY & LOWER GARMENTS
  // ==========================================
  const bodyRoot = new THREE.Group();
  bodyRoot.name = 'BodyRoot';
  seerRoot.add(bodyRoot);

  // 2.1 Shoes peeking cleanly beneath robe hem (y = 0.002 grounded)
  const shoesGroup = new THREE.Group();
  shoesGroup.name = 'Shoes';
  const shoeGeo = trackGeo(createSeerShoeGeo());

  const lShoe = new THREE.Mesh(shoeGeo, shoesMat);
  lShoe.position.set(-0.056, 0, 0.104);
  lShoe.rotation.y = 0.06;
  lShoe.castShadow = true;
  lShoe.receiveShadow = true;
  shoesGroup.add(lShoe);

  const rShoe = new THREE.Mesh(shoeGeo.clone(), shoesMat);
  rShoe.position.set(0.056, 0, 0.104);
  rShoe.rotation.y = -0.06;
  rShoe.castShadow = true;
  rShoe.receiveShadow = true;
  shoesGroup.add(rShoe);

  bodyRoot.add(shoesGroup);

  // 2.2 Inner Orchid Tunic + Split Dark-Plum Outer Coat
  const robeGroup = new THREE.Group();
  robeGroup.name = 'RobeGroup';

  const centerMesh = new THREE.Mesh(trackGeo(createSeerInnerRobeGeo()), innerRobeMat);
  centerMesh.castShadow = true;
  centerMesh.receiveShadow = true;
  robeGroup.add(centerMesh);

  const robeMesh = new THREE.Mesh(trackGeo(createSeerSplitCoatGeo()), robeDarkMat);
  robeMesh.castShadow = true;
  robeMesh.receiveShadow = true;
  robeGroup.add(robeMesh);

  bodyRoot.add(robeGroup);

  // 2.3 Curved Gold Waist Belt tucked cleanly inside coat opening
  const beltGroup = new THREE.Group();
  beltGroup.name = 'WaistBelt';

  const beltMesh = new THREE.Mesh(trackGeo(createSeerBeltGeo()), beltMat);
  beltMesh.castShadow = true;
  beltMesh.receiveShadow = true;
  beltGroup.add(beltMesh);

  bodyRoot.add(beltGroup);

  // 2.4 Thick Flared Curved Outer Cape
  const capeGroup = new THREE.Group();
  capeGroup.name = 'CapeGroup';

  const capeMesh = new THREE.Mesh(trackGeo(createSeerCapeGeo()), capeBackMat);
  capeMesh.castShadow = true;
  capeMesh.receiveShadow = true;
  capeGroup.add(capeMesh);

  bodyRoot.add(capeGroup);

  // 2.5 Plush Draped Shoulder Mantle + Faceted Purple Cabochon Brooch
  const mantleGroup = new THREE.Group();
  mantleGroup.name = 'ShoulderMantle';

  const mantleMesh = new THREE.Mesh(trackGeo(createSeerMantleGeo()), mantleMat);
  mantleMesh.castShadow = true;
  mantleMesh.receiveShadow = true;
  mantleGroup.add(mantleMesh);

  const collarCavityMesh = new THREE.Mesh(trackGeo(createSeerCollarCavityGeo()), darkCavityMat);
  collarCavityMesh.receiveShadow = true;
  mantleGroup.add(collarCavityMesh);

  const lScarfFlap = new THREE.Mesh(trackGeo(createSeerScarfFlapGeo(-1)), mantleMat);
  lScarfFlap.castShadow = true;
  lScarfFlap.receiveShadow = true;
  mantleGroup.add(lScarfFlap);

  const rScarfFlap = new THREE.Mesh(trackGeo(createSeerScarfFlapGeo(1)), mantleMat);
  rScarfFlap.castShadow = true;
  rScarfFlap.receiveShadow = true;
  mantleGroup.add(rScarfFlap);

  const broochGroup = new THREE.Group();
  broochGroup.name = 'BroochGroup';
  broochGroup.position.set(0, 0.440, 0.120);

  const bezelGeo = trackGeo(makeFlat(new THREE.CylinderGeometry(0.025, 0.027, 0.011, 8)));
  bezelGeo.rotateX(Math.PI * 0.5);
  const bezelMesh = new THREE.Mesh(bezelGeo, broochSettingMat);
  bezelMesh.scale.set(0.96, 1.08, 1.0);
  broochGroup.add(bezelMesh);

  const gemGeo = trackGeo(makeFlat(new THREE.SphereGeometry(0.021, 8, 5)));
  const gemMesh = new THREE.Mesh(gemGeo, gemMat);
  gemMesh.scale.set(0.94, 1.06, 0.52);
  gemMesh.position.z = 0.004;
  broochGroup.add(gemMesh);

  const gemGlint = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(0.008, 0.006)), glassHighlightMat);
  gemGlint.position.set(-0.005, 0.006, 0.0155);
  gemGlint.rotation.set(-0.18, -0.22, 0.28);
  broochGroup.add(gemGlint);

  mantleGroup.add(broochGroup);
  bodyRoot.add(mantleGroup);

  // ==========================================
  // 3. RECESSED SHORT CHIBI NECK, TAPERED FACE & SOFT PENTAGON ORACLE HOOD
  // ==========================================
  const HEAD_BASE_Y = 0.552;

  // Compact tapered neck recessed behind front scarf V-folds under chin shadow
  const neckGeo = trackGeo(new THREE.CylinderGeometry(0.021, 0.025, 0.060, 14, 1));
  const neckMesh = new THREE.Mesh(neckGeo, neckSkinMat);
  neckMesh.name = 'NeckMesh';
  neckMesh.position.set(0, 0.456, 0.011);
  neckMesh.scale.set(1.0, 1.0, 0.88);
  neckMesh.castShadow = false;
  neckMesh.receiveShadow = true;
  bodyRoot.add(neckMesh);

  const headPivot = new THREE.Group();
  headPivot.name = 'HeadPivot';
  headPivot.position.set(0, HEAD_BASE_Y, 0.012);
  bodyRoot.add(headPivot);

  const faceGroup = new THREE.Group();
  faceGroup.name = 'FaceGroup';
  faceGroup.position.set(0, 0.002, 0.010);

  const headMesh = new THREE.Mesh(trackGeo(createSeerHeadGeo()), skinMat);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  faceGroup.add(headMesh);

  // Snug skull-hugging scalp hair inside hood melting naturally into inner hood shadow
  const hairCapMesh = new THREE.Mesh(trackGeo(createSeerScalpHairGeo()), scalpHairMat);
  hairCapMesh.receiveShadow = true;
  faceGroup.add(hairCapMesh);

  // Thinner sculpted forehead bangs hugging brow line softly
  const bangsMesh = new THREE.Mesh(trackGeo(createSeerBangsGeo()), hairMat);
  bangsMesh.castShadow = false;
  bangsMesh.receiveShadow = true;
  faceGroup.add(bangsMesh);

  function tintGeoColor(geo, r, g, b) {
    const count = geo.attributes.position.count;
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      cols[i * 3] = r;
      cols[i * 3 + 1] = g;
      cols[i * 3 + 2] = b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return geo;
  }

  // Sleek temple locks tucked slightly deeper in hood shadow (zero sharp protrusion)
  function createSideHairRings(sign) {
    return [
      { center: [sign * 0.075, -0.026, 0.004], rx: 0.0024, rz: 0.009, squircle: 0.90 },
      { center: [sign * 0.081, -0.011, 0.005], rx: 0.0032, rz: 0.012, squircle: 0.88 },
      { center: [sign * 0.085,  0.005, 0.005], rx: 0.0032, rz: 0.012, squircle: 0.88 },
      { center: [sign * 0.084,  0.022, 0.004], rx: 0.0030, rz: 0.011, squircle: 0.90 }
    ];
  }
  const lSideHair = new THREE.Mesh(trackGeo(tintGeoColor(createLoftedSegmentGeo(createSideHairRings(-1), 8, true, true), 0.72, 0.68, 0.76)), scalpHairMat);
  faceGroup.add(lSideHair);

  const rSideHair = new THREE.Mesh(trackGeo(tintGeoColor(createLoftedSegmentGeo(createSideHairRings(1), 8, true, true), 0.72, 0.68, 0.76)), scalpHairMat);
  faceGroup.add(rSideHair);

  // Slender warm-brown calm eyebrows clearly visible just below bangs fringe
  const browGeo = trackGeo(new THREE.CapsuleGeometry(0.0019, 0.0170, 4, 6));
  browGeo.rotateZ(Math.PI * 0.5);
  const lBrow = new THREE.Mesh(browGeo, browMat);
  lBrow.position.set(-0.044, 0.0128, 0.0755);
  lBrow.scale.set(1.0, 0.85, 0.42);
  lBrow.rotation.set(0.06, -0.24, -0.072);
  faceGroup.add(lBrow);

  const rBrow = new THREE.Mesh(browGeo.clone(), browMat);
  rBrow.position.set(0.044, 0.0128, 0.0755);
  rBrow.scale.set(1.0, 0.85, 0.42);
  rBrow.rotation.set(0.06, 0.24, 0.072);
  faceGroup.add(rBrow);

  // Slender charcoal vertical pill eyes (2.16x height-to-width) + delicate pale-lavender orb catchlights
  const eyeGeo = trackGeo(new THREE.CapsuleGeometry(0.0082, 0.0190, 5, 10));
  const eyeCatchlightGeo = trackGeo(new THREE.SphereGeometry(0.00148, 8, 6));

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.044, -0.010, 0.0750);
  eyeL.scale.set(1.0, 1.0, 0.34);
  eyeL.rotation.y = -0.16;
  const lEyeGlint = new THREE.Mesh(eyeCatchlightGeo, eyeCatchlightMatL);
  lEyeGlint.position.set(-0.0029, 0.0066, 0.0077);
  eyeL.add(lEyeGlint);
  faceGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo.clone(), eyeMat);
  eyeR.position.set(0.044, -0.010, 0.0750);
  eyeR.scale.set(1.0, 1.0, 0.34);
  eyeR.rotation.y = 0.16;
  const rEyeGlint = new THREE.Mesh(eyeCatchlightGeo.clone(), eyeCatchlightMatR);
  rEyeGlint.position.set(-0.0033, 0.0059, 0.0075);
  rEyeGlint.scale.set(0.84, 0.84, 0.84);
  eyeR.add(rEyeGlint);
  faceGroup.add(eyeR);

  // Whisper-soft lower-cheek rosy tint fitted to tapered cheeks
  const blushGeo = trackGeo(new THREE.CircleGeometry(0.0088, 10));
  blushGeo.scale(1.16, 0.70, 1.0);
  const blushL = new THREE.Mesh(blushGeo, blushMat);
  blushL.position.set(-0.048, -0.032, 0.0695);
  blushL.rotation.y = -0.46;
  faceGroup.add(blushL);

  const blushR = new THREE.Mesh(blushGeo.clone(), blushMat);
  blushR.position.set(0.048, -0.032, 0.0695);
  blushR.rotation.y = 0.46;
  faceGroup.add(blushR);

  headPivot.add(faceGroup);

  // Watertight Multi-Zone Pointed Oracle Arch Hood
  const hoodGroup = new THREE.Group();
  hoodGroup.name = 'HoodGroup';

  const { innerGeo, rimGeo, outerGeo } = createSeerHoodGeos(12);
  trackGeo(innerGeo);
  trackGeo(rimGeo);
  trackGeo(outerGeo);

  const cavityMesh = new THREE.Mesh(innerGeo, hoodInnerMat);
  hoodGroup.add(cavityMesh);

  const lipMesh = new THREE.Mesh(rimGeo, hoodRimMat);
  lipMesh.castShadow = false; // Prevent harsh pitch-black shadow band across face
  lipMesh.receiveShadow = true;
  hoodGroup.add(lipMesh);

  const hoodShellMesh = new THREE.Mesh(outerGeo, hoodMat);
  hoodShellMesh.castShadow = true;
  hoodShellMesh.receiveShadow = true;
  hoodGroup.add(hoodShellMesh);

  headPivot.add(hoodGroup);

  // ==========================================
  // 4. ARMS, LOFTED BELL SLEEVES & SOFT CUPPED HANDS
  // ==========================================
  function createSleeveGeos(upperLen = 0.072, lowerLen = 0.104) {
    const upperGeo = trackGeo(createLoftedSegmentGeo([
      { center: [0, -upperLen, 0], radius: 0.036, zScale: 0.94 },
      { center: [0, -upperLen * 0.47, 0], radius: 0.034, zScale: 0.94 },
      { center: [0,  0.000, 0], radius: 0.030, zScale: 0.94 }
    ], 10, true, false));

    const bellGeo = trackGeo(createLoftedSegmentGeo([
      { center: [0, -lowerLen, 0], radius: 0.040, zScale: 0.95 },
      { center: [0, -lowerLen + 0.005, 0], radius: 0.049, zScale: 0.95 },
      { center: [0, -lowerLen * 0.68, 0], radius: 0.046, zScale: 0.95 },
      { center: [0, -lowerLen * 0.24, 0], radius: 0.038, zScale: 0.95 },
      { center: [0,  0.004, 0], radius: 0.036, zScale: 0.94 }
    ], 10, false, false));

    return { upperGeo, bellGeo };
  }

  const { upperGeo: upperSleeveGeo, bellGeo: bellSleeveGeo } = createSleeveGeos(0.072, 0.102);
  const { upperGeo: lUpperSleeveGeo, bellGeo: lBellSleeveGeo } = createSleeveGeos(0.058, 0.088);

  const sleeveInnerDiscGeo = trackGeo(makeFlat(new THREE.CircleGeometry(0.040, 10)));

  // Soft single Chibi cupped hand mitt + delicate thumb sphere (zero harsh blocky sticks)
  function createCuppedHandGroup(mirrorX = 1) {
    const handGrp = new THREE.Group();
    const palmGeo = trackGeo(new THREE.SphereGeometry(0.027, 10, 8));
    const palm = new THREE.Mesh(palmGeo, skinMat);
    palm.scale.set(1.05, 0.72, 1.15);
    palm.castShadow = true;
    handGrp.add(palm);

    const fingerCurlGeo = trackGeo(new THREE.SphereGeometry(0.020, 8, 6));
    const fingerCurl = new THREE.Mesh(fingerCurlGeo, skinMat);
    fingerCurl.position.set(0, 0.007, -0.018 * mirrorX);
    fingerCurl.scale.set(1.08, 0.64, 0.72);
    handGrp.add(fingerCurl);

    const thumbGeo = trackGeo(new THREE.SphereGeometry(0.011, 8, 6));
    const thumb = new THREE.Mesh(thumbGeo, skinMat);
    thumb.position.set(mirrorX * 0.023, 0.008, -0.004);
    thumb.scale.set(0.85, 0.85, 1.25);
    handGrp.add(thumb);

    return handGrp;
  }

  // 4A. Right Arm (Viewer's Left, -X) -> Cradles Glowing Magic Orb
  const armRightPivot = new THREE.Group();
  armRightPivot.name = 'ArmRightPivot';
  armRightPivot.position.set(-0.112, 0.432, 0.014);

  const rUpperArm = new THREE.Mesh(upperSleeveGeo, mantleMat);
  rUpperArm.castShadow = true;
  armRightPivot.add(rUpperArm);

  const rForearmGroup = new THREE.Group();
  rForearmGroup.name = 'RightForearm';
  rForearmGroup.position.set(0, -0.068, 0);

  const rSleeve = new THREE.Mesh(bellSleeveGeo, mantleMat);
  rSleeve.castShadow = true;
  rSleeve.receiveShadow = true;
  rForearmGroup.add(rSleeve);

  const rSleeveInner = new THREE.Mesh(sleeveInnerDiscGeo, darkCavityMat);
  rSleeveInner.rotation.x = Math.PI * 0.5;
  rSleeveInner.position.set(0, -0.097, 0);
  rForearmGroup.add(rSleeveInner);

  const rHand = createCuppedHandGroup(1);
  rHand.name = 'RightHand';
  rHand.position.set(0, -0.114, 0);
  rHand.scale.setScalar(0.86);
  rForearmGroup.add(rHand);

  armRightPivot.add(rForearmGroup);
  bodyRoot.add(armRightPivot);

  // 4B. Left Arm (Viewer's Right, +X) -> Compact relaxed curve with slightly shorter sleeve
  const armLeftPivot = new THREE.Group();
  armLeftPivot.name = 'ArmLeftPivot';
  armLeftPivot.position.set(0.110, 0.435, 0.014);

  const lUpperArm = new THREE.Mesh(lUpperSleeveGeo, mantleMat);
  lUpperArm.castShadow = true;
  armLeftPivot.add(lUpperArm);

  const lForearmGroup = new THREE.Group();
  lForearmGroup.name = 'LeftForearm';
  lForearmGroup.position.set(0, -0.054, 0);

  const lSleeve = new THREE.Mesh(lBellSleeveGeo, mantleMat);
  lSleeve.castShadow = true;
  lSleeve.receiveShadow = true;
  lForearmGroup.add(lSleeve);

  const lSleeveInner = new THREE.Mesh(sleeveInnerDiscGeo.clone(), darkCavityMat);
  lSleeveInner.rotation.x = Math.PI * 0.5;
  lSleeveInner.position.set(0, -0.080, 0);
  lForearmGroup.add(lSleeveInner);

  const lHand = createCuppedHandGroup(-1);
  lHand.name = 'LeftHand';
  lHand.position.set(0, -0.096, 0);
  lHand.scale.setScalar(0.86);
  lForearmGroup.add(lHand);

  armLeftPivot.add(lForearmGroup);
  bodyRoot.add(armLeftPivot);

  // ==========================================
  // 5. LUMINOUS AMETHYST MAGIC ORB (Crystal Shell + Core + Highlights + Fresnel Halo)
  // ==========================================
  const orbAnchor = new THREE.Group();
  orbAnchor.name = 'MagicOrbAnchor';

  // Spin container holds faceted crystal & core while spec glints + Fresnel aura face camera cleanly
  const orbSpinGroup = new THREE.Group();
  orbSpinGroup.name = 'OrbSpinGroup';

  const baseIco = new THREE.IcosahedronGeometry(0.084, 1);
  const orbGeo = trackGeo(baseIco.toNonIndexed());
  const posAttr = orbGeo.attributes.position;
  const count = posAttr.count;
  const colorsAttr = new Float32Array(count * 3);

  const cTop  = new THREE.Color('#e89cff');
  const cHigh = new THREE.Color('#d658f5');
  const cMid  = new THREE.Color('#b620e8');
  const cLow  = new THREE.Color('#5a0b88');

  for (let i = 0; i < count; i += 3) {
    const ax = posAttr.getX(i), ay = posAttr.getY(i), az = posAttr.getZ(i);
    const bx = posAttr.getX(i + 1), by = posAttr.getY(i + 1), bz = posAttr.getZ(i + 1);
    const cx = posAttr.getX(i + 2), cy = posAttr.getY(i + 2), cz = posAttr.getZ(i + 2);

    const vBAx = bx - ax, vBAy = by - ay, vBAz = bz - az;
    const vCAx = cx - ax, vCAy = cy - ay, vCAz = cz - az;
    const nx = vBAy * vCAz - vBAz * vCAy;
    const ny = vBAz * vCAx - vBAx * vCAz;
    const nz = vBAx * vCAy - vBAy * vCAx;
    const len = Math.hypot(nx, ny, nz) || 1;
    const dotLight = (-nx * 0.35 + ny * 0.72 + nz * 0.60) / len;

    const facetColor = new THREE.Color();
    if (dotLight > 0.60) {
      facetColor.copy(cHigh).lerp(cTop, Math.min(1.0, (dotLight - 0.60) / 0.40));
    } else if (dotLight > 0.08) {
      facetColor.copy(cMid).lerp(cHigh, (dotLight - 0.08) / 0.52);
    } else {
      facetColor.copy(cLow).lerp(cMid, Math.max(0.0, (dotLight + 0.65) / 0.73));
    }

    for (let v = 0; v < 3; v++) {
      colorsAttr[(i + v) * 3]     = facetColor.r;
      colorsAttr[(i + v) * 3 + 1] = facetColor.g;
      colorsAttr[(i + v) * 3 + 2] = facetColor.b;
    }
  }

  orbGeo.setAttribute('color', new THREE.BufferAttribute(colorsAttr, 3));
  orbGeo.computeVertexNormals();

  const orbMesh = new THREE.Mesh(orbGeo, orbMat);
  orbSpinGroup.add(orbMesh);

  const coreMesh = new THREE.Mesh(trackGeo(makeFlat(new THREE.IcosahedronGeometry(0.048, 0))), orbCoreMat);
  orbSpinGroup.add(coreMesh);
  orbAnchor.add(orbSpinGroup);

  // Stylized crystal facet highlight glints on upper-left orb shoulder matching seer-ball.png
  const orbUpperSpec = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.011, 6)), glassHighlightMat);
  orbUpperSpec.position.set(-0.030, 0.036, 0.067);
  orbUpperSpec.rotation.set(-0.42, -0.36, 0.25);
  orbUpperSpec.scale.set(1.25, 0.85, 1.0);
  orbAnchor.add(orbUpperSpec);

  const orbDotSpec = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.0045, 6)), glassHighlightMat);
  orbDotSpec.position.set(-0.046, 0.018, 0.063);
  orbDotSpec.rotation.set(-0.22, -0.58, 0.15);
  orbAnchor.add(orbDotSpec);

  // Edge-faded Fresnel glow halo (360-degree smooth purple aura, zero hard spherical edge)
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colors.orbColor),
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  haloMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSeerHaloNormal;\nvarying vec3 vSeerHaloView;')
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvSeerHaloNormal = normalize(normalMatrix * normal);\nvSeerHaloView = -mvPosition.xyz;'
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSeerHaloNormal;\nvarying vec3 vSeerHaloView;')
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\nfloat seerDot = clamp(abs(dot(normalize(vSeerHaloNormal), normalize(vSeerHaloView))), 0.0, 1.0);\ndiffuseColor.a *= pow(seerDot, 2.3);'
      );
  };
  const haloMesh = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.122, 20, 16)), haloMat);
  orbAnchor.add(haloMesh);

  // Floating subtle arcane micro-sparks around crystal orb
  const orbParticlesGroup = new THREE.Group();
  orbParticlesGroup.name = 'OrbParticles';
  const sparkGeo = trackGeo(makeFlat(new THREE.OctahedronGeometry(0.0042, 0)));
  const sparks = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.4;
    const rad = 0.098 + (i % 2) * 0.018;
    const spark = new THREE.Mesh(sparkGeo, sparkMat);
    const base = new THREE.Vector3(Math.cos(angle) * rad, -0.02 + (i % 3) * 0.036, Math.sin(angle) * rad * 0.72);
    spark.position.copy(base);
    spark.scale.setScalar(0.70 + (i % 3) * 0.18);
    orbParticlesGroup.add(spark);
    sparks.push({ mesh: spark, base, phase: i * 1.15 });
  }
  orbAnchor.add(orbParticlesGroup);

  // Localized violet PointLight kissing viewer's left hood lip and outer cheek edge subtly without purpling center face
  const orbLight = new THREE.PointLight(0xc45bff, 0.22, 0.36, 2.0);
  orbLight.position.set(-0.024, -0.010, 0.014);
  orbAnchor.add(orbLight);

  seerRoot.add(orbAnchor);

  // ==========================================
  // 6. CONTROLLER API & POSES
  // ==========================================
  let orbGlowEnabled = true;
  let orbIntensity = 1.0; // Multiplier over calibrated PointLight & emissives
  let particlesEnabled = true;
  let breatheEnabled = true;
  let orbFloatEnabled = true;

  const activeOrbBasePos = new THREE.Vector3(-0.242, 0.508, 0.180);
  const _handWorld = new THREE.Vector3();

  function applyOrbEffectsState(elapsedTime = 0) {
    const pulse = 0.88 + 0.12 * Math.sin(elapsedTime * 2.2);
    const activeFactor = orbGlowEnabled ? orbIntensity * pulse : 0.0;

    orbMat.emissiveIntensity = 0.42 * activeFactor;
    coreMesh.visible = orbGlowEnabled && orbIntensity > 0.02;
    haloMat.opacity = 0.36 * activeFactor;
    orbLight.visible = orbGlowEnabled && orbIntensity > 0.01;
    orbLight.intensity = 0.22 * activeFactor;
    orbParticlesGroup.visible = particlesEnabled && orbGlowEnabled;

    // Subtle synchronized shimmer on chest cabochon jewel
    gemMat.emissiveIntensity = 0.42 * (0.65 + 0.35 * pulse);
  }

  function setEffects(opts = {}) {
    if (opts.orbGlow !== undefined) orbGlowEnabled = Boolean(opts.orbGlow);
    if (opts.intensity !== undefined) {
      const n = Number(opts.intensity);
      orbIntensity = Math.max(0, Math.min(2.5, Number.isFinite(n) ? n : 1.0));
    }
    if (opts.particles !== undefined) particlesEnabled = Boolean(opts.particles);
    if (opts.breathe !== undefined) breatheEnabled = Boolean(opts.breathe);
    if (opts.orbFloat !== undefined) orbFloatEnabled = Boolean(opts.orbFloat);
    applyOrbEffectsState(0);
  }

  function setColors(newColors) {
    if (newColors.hoodOuter) hoodMat.color.set(newColors.hoodOuter);
    const rimHex = newColors.hoodRim || newColors.hoodLip;
    if (rimHex) hoodRimMat.color.set(rimHex);
    if (newColors.hoodInner) hoodInnerMat.color.set(newColors.hoodInner);
    if (newColors.hair) {
      hairMat.color.set(newColors.hair);
      hairMat.emissive.set(newColors.hair);
      scalpHairMat.color.set(newColors.hair);
      scalpHairMat.emissive.set(newColors.hair);
    }
    if (newColors.skin) {
      skinMat.color.set(newColors.skin);
      neckSkinMat.color.set(newColors.skin).multiplyScalar(0.78);
    }
    if (newColors.eyes) eyeMat.color.set(newColors.eyes);
    if (newColors.eyebrows) browMat.color.set(newColors.eyebrows);
    if (newColors.mantle) mantleMat.color.set(newColors.mantle);
    if (newColors.gem) {
      gemMat.color.set(newColors.gem);
      gemMat.emissive.set(newColors.gem);
    }
    if (newColors.belt) beltMat.color.set(newColors.belt);
    const robeHex = newColors.innerRobe || newColors.robeCenter;
    if (robeHex) innerRobeMat.color.set(robeHex);
    if (newColors.robeDark) robeDarkMat.color.set(newColors.robeDark);
    if (newColors.capeBack) capeBackMat.color.set(newColors.capeBack);
    if (newColors.shoes) shoesMat.color.set(newColors.shoes);
    if (newColors.orbColor) {
      orbMat.emissive.set(newColors.orbColor);
      haloMat.color.set(newColors.orbColor);
      orbLight.color.set(newColors.orbColor);
      sparkMat.color.set(newColors.orbColor);
      sparkMat.emissive.set(newColors.orbColor);
    }
  }

  function setWireframe(enabled) {
    [
      hoodMat, hoodRimMat, hoodInnerMat, skinMat, neckSkinMat, hairMat, scalpHairMat, browMat, eyeMat,
      mantleMat, broochSettingMat, gemMat, beltMat, innerRobeMat, robeDarkMat,
      capeBackMat, orbMat, sparkMat, shoesMat
    ].forEach((m) => {
      m.wireframe = enabled;
    });
  }

  function syncHandAndOrb({ anchorToPalm = true, customOrbPos = null, tiltPalmUp = true }) {
    seerRoot.updateMatrixWorld(true);
    rHand.getWorldPosition(_handWorld);
    // Orient cupped hand upward while gently tilting palm toward viewer/orb for natural cradling contact
    const parentWorldQuat = new THREE.Quaternion();
    rForearmGroup.getWorldQuaternion(parentWorldQuat);
    rHand.quaternion.copy(parentWorldQuat).invert();
    if (tiltPalmUp) {
      rHand.rotateX(0.26);
      rHand.rotateZ(-0.12);
    }

    const lParentQuat = new THREE.Quaternion();
    lForearmGroup.getWorldQuaternion(lParentQuat);
    lHand.quaternion.copy(lParentQuat).invert();

    if (customOrbPos) {
      activeOrbBasePos.set(customOrbPos[0], customOrbPos[1], customOrbPos[2]);
    } else if (anchorToPalm) {
      activeOrbBasePos.set(_handWorld.x - 0.004, _handWorld.y + 0.082, _handWorld.z + 0.004);
    }
    orbAnchor.position.copy(activeOrbBasePos);
  }

  function setPose(poseName) {
    const normalized = poseName === 'default' ? 'idle' : poseName === 't-pose' ? 'tpose' : poseName;
    headPivot.position.set(0, HEAD_BASE_Y, 0.012);
    headPivot.rotation.set(0, 0, 0);

    if (normalized === 'idle') {
      armRightPivot.rotation.set(-0.26, 0.08, -0.68);
      rForearmGroup.rotation.set(-0.84, 0.24, -0.18);
      armLeftPivot.rotation.set(-0.14, -0.06, 0.44);
      lForearmGroup.rotation.set(-0.34, -0.10, 0.14);
      syncHandAndOrb({ anchorToPalm: true, tiltPalmUp: true });
    } else if (normalized === 'cast') {
      armRightPivot.rotation.set(-0.48, -0.05, -0.82);
      rForearmGroup.rotation.set(-0.92, 0.14, -0.16);
      armLeftPivot.rotation.set(-0.18, -0.08, 0.58);
      lForearmGroup.rotation.set(-0.28, -0.06, 0.10);
      headPivot.rotation.set(-0.04, -0.04, 0);
      syncHandAndOrb({ anchorToPalm: true, tiltPalmUp: true });
    } else if (normalized === 'meditate') {
      armRightPivot.rotation.set(-0.42, 0.25, -0.38);
      rForearmGroup.rotation.set(-1.32, 0.52, 0.30);
      armLeftPivot.rotation.set(-0.42, -0.25, 0.38);
      lForearmGroup.rotation.set(-1.32, -0.52, -0.30);
      headPivot.rotation.set(0.05, 0, 0);
      syncHandAndOrb({ customOrbPos: [0, 0.445, 0.245], tiltPalmUp: false });
    } else if (normalized === 'tpose') {
      armRightPivot.rotation.set(0, 0, -Math.PI * 0.5);
      rForearmGroup.rotation.set(0, 0, 0);
      armLeftPivot.rotation.set(0, 0, Math.PI * 0.5);
      lForearmGroup.rotation.set(0, 0, 0);
      syncHandAndOrb({ anchorToPalm: true, tiltPalmUp: false });
    }
    applyOrbEffectsState(0);
  }

  // Initialize exact idle alignment between hand palm and orb immediately
  setPose('idle');

  function update(time = performance.now() * 0.001) {
    if (orbAnchor) {
      if (orbFloatEnabled) {
        orbAnchor.position.y = activeOrbBasePos.y + Math.sin(time * 2.2) * 0.005;
      } else {
        orbAnchor.position.y = activeOrbBasePos.y;
      }
      orbSpinGroup.rotation.y = time * 0.52;
      orbSpinGroup.rotation.x = Math.sin(time * 1.4) * 0.08;
    }

    if (headPivot && breatheEnabled) {
      headPivot.position.y = HEAD_BASE_Y + Math.sin(time * 1.8) * 0.0025;
    } else if (headPivot) {
      headPivot.position.y = HEAD_BASE_Y;
    }

    sparks.forEach((p) => {
      const t = time * 1.15 + p.phase;
      p.mesh.position.x = p.base.x + Math.sin(t * 1.2) * 0.011;
      p.mesh.position.y = p.base.y + Math.sin(t * 1.5) * 0.014;
      p.mesh.position.z = p.base.z + Math.cos(t * 1.1) * 0.011;
      p.mesh.rotation.y = t * 1.5;
      p.mesh.rotation.x = t * 0.9;
    });

    applyOrbEffectsState(time);
  }

  function dispose() {
    createdGeometries.forEach((g) => g.dispose && g.dispose());
    Object.values({
      hoodMat, hoodRimMat, hoodInnerMat, skinMat, neckSkinMat, hairMat, scalpHairMat, blushMat, browMat,
      eyeMat, eyeCatchlightMatL, eyeCatchlightMatR, mantleMat, darkCavityMat, broochSettingMat, gemMat,
      beltMat, innerRobeMat, robeDarkMat, capeBackMat, orbMat, orbCoreMat, glassHighlightMat,
      sparkMat, haloMat, shoesMat
    }).forEach((m) => m.dispose && m.dispose());
  }

  return {
    model: seerRoot,
    group: seerRoot,
    parts: {
      bodyRoot,
      shoesGroup,
      robeGroup,
      beltGroup,
      capeGroup,
      mantleGroup,
      broochGroup,
      headPivot,
      faceGroup,
      hoodGroup,
      armRightPivot,
      armLeftPivot,
      orbAnchor,
      orbParticlesGroup
    },
    materials: {
      hoodMat,
      hoodRimMat,
      hoodInnerMat,
      skinMat,
      hairMat,
      blushMat,
      browMat,
      eyeMat,
      mantleMat,
      broochSettingMat,
      gemMat,
      beltMat,
      innerRobeMat,
      robeDarkMat,
      capeBackMat,
      orbMat,
      orbCoreMat,
      haloMat,
      sparkMat,
      shoesMat
    },
    setColors,
    setWireframe,
    setPose,
    setEffects,
    update,
    dispose
  };
}
